// src/chatkit/chatkit-sessions.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { UserMongoRepository } from '../infrastructure/repositories/user-mongo.repository';
import mongoose, { ClientSession, Model, Types } from 'mongoose';

@Injectable()
export class ChatKitSessionsService {
  private readonly logger = new Logger(ChatKitSessionsService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService, private userRepo: UserMongoRepository) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async createSession(userId: string, workflowId: string, options?: {
    fileUpload?: { enabled: boolean };
    chatkitConfiguration?: any;
  }) {
    try {
      const user = await this.userRepo.findById(userId);

      if (!user) throw new NotFoundException('Usuario no encontrado');

      const session = await this.openai.beta.chatkit.sessions.create({
        user: userId,
        workflow: { id: workflowId, state_variables: {
          nombre: user.name,
        } },
        chatkit_configuration: {
          file_upload: options?.fileUpload || { enabled: false },
          ...options?.chatkitConfiguration,
        },
        
      });

      this.logger.log(`Session created for user ${userId}: ${session.id}`);
      
      return {
        client_secret: session.client_secret,
        expires_after: null,
        id: session.id,
      };
    } catch (error) {
      this.logger.error('Error creating ChatKit session:', error);
      throw error;
    }
  }

  /**
   * Listar threads por usuario
   */
  async listThreadsByUser(userId: string, options?: {
    limit?: number;
    before?: string;
    order?: 'asc' | 'desc';
  }) {
    try {
      const threads = await this.openai.beta.chatkit.threads.list({
        user: userId,
        limit: options?.limit || 20,
        before: options?.before,
        order: options?.order || 'desc',
      });

      this.logger.log(`Retrieved ${threads.data.length} threads for user ${userId}`);
      
      return {
        data: threads.data,
        has_more: threads.has_more,
        last_id: threads.last_id,
      };
    } catch (error) {
      this.logger.error('Error listing threads by user:', error);
      throw error;
    }
  }

  /**
   * Obtener un thread específico
   */
  async getThread(threadId: string) {
    try {
      const thread = await this.openai.beta.chatkit.threads.retrieve(threadId);
      return thread;
    } catch (error) {
      this.logger.error(`Error retrieving thread ${threadId}:`, error);
      throw error;
    }
  }

  /**
   * Listar items de un thread (mensajes, tareas, etc.)
   */
  async listThreadItems(threadId: string, options?: {
    limit?: number;
    before?: string;
    order?: 'asc' | 'desc';
  }) {
    try {
      const items = await this.openai.beta.chatkit.threads.listItems(threadId, {
        limit: options?.limit || 50,
        before: options?.before,
        order: options?.order || 'desc',
      });

      this.logger.log(`Retrieved ${items.data.length} items for thread ${threadId}`);
      
      return {
        data: items.data,
        has_more: items.has_more,
        last_id: items.last_id,
      };
    } catch (error) {
      this.logger.error(`Error listing items for thread ${threadId}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un thread
   */
  async deleteThread(threadId: string) {
    try {
      const result = await this.openai.beta.chatkit.threads.delete(threadId);
      this.logger.log(`Deleted thread ${threadId}`);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting thread ${threadId}:`, error);
      throw error;
    }
  }
}