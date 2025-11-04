// src/chatkit/chatkit-sessions.controller.ts
import { Controller, Post, Body, Res, Req, Get, Query, Param, Delete, Logger, UseGuards } from '@nestjs/common';
import express, { request } from 'express';
import { ChatKitSessionsService } from './chatkit-sessions.service';
import { ConfigService } from '@nestjs/config';
import { ThreadListResponseDto } from './dto/thread-list-response.dto';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { UserMongoRepository } from 'src/infrastructure/repositories/user-mongo.repository';

interface CreateSessionRequestBody {
  workflow?: { id?: string | null } | null;
  workflowId?: string | null;
  chatkit_configuration?: {
    file_upload?: {
      enabled?: boolean;
    };
  };
}

const SESSION_COOKIE_NAME = 'chatkit_session_id';
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

@UseGuards(JwtAuthGuard)
@Controller('api/chatkit')
export class ChatKitSessionsController {
  private readonly logger = new Logger(ChatKitSessionsController.name);

  constructor(
    private readonly chatKitSessionsService: ChatKitSessionsService,
    private configService: ConfigService,
    private userRepo: UserMongoRepository,
  ) {}

  @Post('sessions')
  async createSession(
    @Body() body: CreateSessionRequestBody,
    @Req() request: express.Request,
    @Res() response: express.Response,
  ) {
    try {
      const { userId, sessionCookie } = await this.resolveUserId(request);
      
      const workflowId = body.workflow?.id || body.workflowId || this.configService.get('CHATKIT_WORKFLOW_ID');
      
      if (!workflowId) {
        return response.status(400).json({
          error: 'Missing workflow id',
        });
      }

      const session = await this.chatKitSessionsService.createSession(userId, workflowId, {
        fileUpload: {
          enabled: body.chatkit_configuration?.file_upload?.enabled ?? false,
        },
      });

      const responsePayload = {
        client_secret: session.client_secret,
        expires_after: session.expires_after,
      };

      if (sessionCookie) {
        response.setHeader('Set-Cookie', sessionCookie);
      }

      return response.status(200).json(responsePayload);
    } catch (error) {
      this.logger.error('Create session error:', error);
      return response.status(500).json({
        error: 'Unexpected error',
      });
    }
  }

  /**
   * Listar threads por usuario
   */
@Get('threads')
  @ApiOperation({
    summary: 'Lista los hilos de chat del usuario',
    description: `
    Obtiene los hilos asociados a un usuario.
    Si no se proporciona el parámetro user_id, se intentará resolver desde las cookies.
    `,
  })
  @ApiQuery({
    name: 'user_id',
    required: false,
    type: String,
    description: 'ID del usuario. Si no se pasa, se obtiene desde la cookie',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad máxima de resultados (por defecto 20)',
  })
  @ApiQuery({
    name: 'before',
    required: false,
    type: String,
    description: 'Cursor o ID del hilo anterior para paginación',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Orden de los resultados (ascendente o descendente)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de hilos del usuario',
    type: ThreadListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Faltan parámetros o error de validación',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor al listar hilos',
  })
  async listThreads(
    @Query('user_id') userId?: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
    @Query('order') order?: 'asc' | 'desc',
    @Req() request?: express.Request,
  ) {
    try {
      // Si no se proporciona user_id, intentamos obtenerlo de la cookie
      let resolvedUserId = userId;
      if (!resolvedUserId) {
        const { userId: cookieUserId } = await this.resolveUserId(request);
        resolvedUserId = cookieUserId;
      }

      if (!resolvedUserId) {
        return {
          error: 'Missing user_id',
        };
      }

      const threads = await this.chatKitSessionsService.listThreadsByUser(resolvedUserId, {
        limit: limit ? parseInt(limit) : 20,
        before,
        order: order as 'asc' | 'desc' || 'desc',
      });

      return threads;
    } catch (error) {
      this.logger.error('Error listing threads:', error);
      return {
        error: 'Failed to list threads',
      };
    }
  }

  /**
   * Obtener un thread específico
   */
  @Get('threads/:threadId')
  async getThread(@Param('threadId') threadId: string) {
    try {
      const thread = await this.chatKitSessionsService.getThread(threadId);
      return thread;
    } catch (error) {
      this.logger.error(`Error getting thread ${threadId}:`, error);
      return {
        error: 'Thread not found',
      };
    }
  }

  /**
   * Listar items de un thread (mensajes, tareas, widgets, etc.)
   */
  @Get('threads/:threadId/items')
  async listThreadItems(
    @Param('threadId') threadId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    try {
      const items = await this.chatKitSessionsService.listThreadItems(threadId, {
        limit: limit ? parseInt(limit) : 50,
        before,
        order: order as 'asc' | 'desc' || 'desc',
      });

      return items;
    } catch (error) {
      this.logger.error(`Error listing items for thread ${threadId}:`, error);
      return {
        error: 'Failed to list thread items',
      };
    }
  }

  /**
   * Eliminar un thread
   */
  @Delete('threads/:threadId')
  async deleteThread(@Param('threadId') threadId: string) {
    try {
      const result = await this.chatKitSessionsService.deleteThread(threadId);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting thread ${threadId}:`, error);
      return {
        error: 'Failed to delete thread',
      };
    }
  }

  /**
   * Obtener historial completo de un usuario (threads + items)
   */
  @Get('users/:userId/history')
  async getUserHistory(@Param('userId') userId: string) {
    try {
      // Obtener threads del usuario
      const threads = await this.chatKitSessionsService.listThreadsByUser(userId, {
        limit: 50,
        order: 'desc',
      });

      // Para cada thread, obtener los items más recientes
      const threadsWithItems = await Promise.all(
        threads.data.map(async (thread) => {
          try {
            const items = await this.chatKitSessionsService.listThreadItems(thread.id, {
              limit: 10,
              order: 'desc',
            });
            return {
              ...thread,
              recent_items: items.data.slice(0, 5), // Últimos 5 items
              total_items: items.data.length,
            };
          } catch (error) {
            this.logger.error(`Error getting items for thread ${thread.id}:`, error);
            return {
              ...thread,
              recent_items: [],
              total_items: 0,
              error: 'Failed to load items',
            };
          }
        })
      );

      return {
        user_id: userId,
        threads: threadsWithItems,
        total_threads: threads.data.length,
        has_more: threads.has_more,
      };
    } catch (error) {
      this.logger.error(`Error getting history for user ${userId}:`, error);
      return {
        error: 'Failed to get user history',
      };
    }
  }

  private async resolveUserId(request?: express.Request): Promise<{ userId: string; sessionCookie?: string }> {
    const cookieHeader = request?.headers?.cookie;
    const existingUserId = this.getCookieValue(cookieHeader, SESSION_COOKIE_NAME);
    if (existingUserId) {
      return { userId: existingUserId };
    }

    const generatedUserId = this.generateUserId();
    const sessionCookie = this.serializeSessionCookie(generatedUserId);

    return {
      userId: generatedUserId,
      sessionCookie,
    };
  }

  private getCookieValue(cookieHeader: string | undefined, name: string): string | null {
    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
      const [rawName, ...rest] = cookie.split('=');
      if (!rawName || rest.length === 0) {
        continue;
      }
      if (rawName.trim() === name) {
        return decodeURIComponent(rest.join('=').trim());
      }
    }
    return null;
  }

  private generateUserId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private serializeSessionCookie(value: string): string {
    const attributes = [
      `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}`,
      'Path=/',
      `Max-Age=${SESSION_COOKIE_MAX_AGE}`,
      'HttpOnly',
      'SameSite=Lax',
    ];

    if (this.configService.get('NODE_ENV') === 'production') {
      attributes.push('Secure');
    }

    return attributes.join('; ');
  }
}