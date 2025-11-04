import { Injectable } from '@nestjs/common';
import { ClassSessionRepository } from '../../domain/repositories/class-session.repository';
import { ClassSessionDocument } from '../database/schemas/class-session.schema';
import mongoose, { ClientSession, Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ClassSession } from '../../domain/entities/class-session.entity';

@Injectable()
export class ClassSessionMongoRepository implements ClassSessionRepository {
  constructor(
    @InjectModel(ClassSessionDocument.name)
    private readonly model: Model<ClassSessionDocument>,
  ) {}
  async update(
    classSession: ClassSession,
    session?: ClientSession,
  ): Promise<void> {
    await this.model.findByIdAndUpdate(
      classSession.id,
      {
        userId: classSession.userId,
        title: classSession.title,
        basePrompt: classSession.basePrompt,
        messages: classSession.messages,
        createdAt: classSession.createdAt,
        updatedAt: classSession.updatedAt,
      },
      { upsert: true, session },
    );
  }
  async findByUser(
    userId: string,
    session?: ClientSession,
  ): Promise<ClassSession[]> {
    const docs = await this.model
      .find({ userId: new Types.ObjectId(userId) }, {}, { session })
      .sort({ created_at: -1 });

    return docs.map(
      (doc) =>
        new ClassSession(
          doc._id?.toString() || '',
          doc.userId.toString(),
          doc.title,
          doc.basePrompt,
          doc.messages,
          doc.createdAt,
          doc.updatedAt,
          doc.level,
        ),
    );
  }
  async create(
    classSession: Partial<ClassSession>,
    session?: ClientSession,
  ): Promise<ClassSession> {
    let id = new mongoose.Types.ObjectId();
    return await this.model.findByIdAndUpdate(
      id, // ID del documento (debe ser un ObjectId válido si existe)
      {
        // Usa $set para actualizar campos existentes o crearlos si no existen
        $set: {
          userId: new Types.ObjectId(classSession.userId),
          title: classSession.title,
          basePrompt: classSession.basePrompt,
          messages: classSession.messages,
          createdAt: classSession.createdAt,
          updatedAt: classSession.updatedAt,
        },
      },
      {
        upsert: true, // Crea el documento si no existe
        session, // Sesión de transacción
        new: true, // Opcional: Devuelve el documento actualizado/creado
      },
    );
  }

  async findById(id: string, session?: ClientSession): Promise<ClassSession> {
    const doc = await this.model.findById(id, {}, { session });
    return doc
      ? new ClassSession(
          doc._id?.toString() || '',
          doc.userId.toString(),
          doc.title,
          doc.basePrompt,
          doc.messages,
          doc.createdAt,
          doc.updatedAt,
          doc.level,
        )
      : undefined as unknown as ClassSession;
  }
}
