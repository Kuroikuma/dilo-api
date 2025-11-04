import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { ClientSession, Model, mongo, Types } from 'mongoose';
import { UserPlanHistoryDocument } from '../database/schemas/user-plan-history.schema';
import { UserPlanHistory } from '../../domain/entities/user-plan-history.entity';
import { UserPlanHistoryRepository } from '../../domain/repositories/user-plan-history.repository';

@Injectable()
export class UserPlanHistoryMongoRepository
  implements UserPlanHistoryRepository
{
  constructor(
    @InjectModel(UserPlanHistoryDocument.name)
    private readonly model: Model<UserPlanHistoryDocument>,
  ) {}

  format = (doc: UserPlanHistoryDocument): UserPlanHistory => {
    return new UserPlanHistory(
      doc._id.toString(),
      doc.userId.toString(),
      doc.planId.toString(),
      doc.startDate,
      doc.endDate,
      doc.changeReason,
      doc.tilopayTransactionId,
    );
  };

  async findLastByUserId(
    userId: string,
    session?: ClientSession,
  ): Promise<UserPlanHistory | null> {
    const doc: UserPlanHistoryDocument = await this.model
      .findOne({ userId: new Types.ObjectId(userId) })
      .sort({ startDate: -1 })
      .session(session ?? null);

    if (!doc) return null;

    return this.format(doc);
  }
  async findActivePlanByUserId(
    userId: string,
    session?: ClientSession,
  ): Promise<UserPlanHistory | null> {
    const doc = await this.model
      .findOne({
        userId: new Types.ObjectId(userId),
        endDate: null,
      })
      .sort({ startDate: -1 })
      .session(session ?? null);

    if (!doc) return null;
    return this.format(doc);
  }

  async update(
    history: UserPlanHistory,
    session?: ClientSession,
  ): Promise<void> {
    await this.model.findByIdAndUpdate(
      history.id,
      {
        userId: new Types.ObjectId(history.userId),
        planId: new Types.ObjectId(history.planId),
        startDate: history.startDate,
        endDate: history.endDate,
        changeReason: history.changeReason,
        tilopayTransactionId: history.tilopayTransactionId,
      },
      { upsert: true, session },
    );
  }

  async create(
    history: UserPlanHistory,
    session?: ClientSession,
  ): Promise<void> {
    let id = new mongoose.Types.ObjectId();
    await this.model.findByIdAndUpdate(
      id, // ID del documento (debe ser un ObjectId válido si existe)
      {
        // Usa $set para actualizar campos existentes o crearlos si no existen
        $set: {
          userId: new Types.ObjectId(history.userId),
          planId: new Types.ObjectId(history.planId),
          startDate: history.startDate,
          endDate: history.endDate,
          changeReason: history.changeReason,
          tilopayTransactionId: history.tilopayTransactionId,
        },
      },
      {
        upsert: true, // Crea el documento si no existe
        session, // Sesión de transacción
        new: true, // Opcional: Devuelve el documento actualizado/creado
      },
    );
  }

  async endCurrent(userId: string, session?: ClientSession): Promise<void> {
    await this.model.updateMany(
      { userId: new Types.ObjectId(userId), endDate: null },
      { $set: { endDate: new Date() } },
      { session },
    );
  }

  async findHistoryByUser(
    userId: string,
    session?: ClientSession,
  ): Promise<UserPlanHistory[]> {
    const docs = await this.model
      .find({ userId: new Types.ObjectId(userId) }, {}, { session })
      .sort({ startDate: -1 });

    return docs.map(
      (doc) =>
        new UserPlanHistory(
          doc._id.toString(),
          doc.userId.toString(),
          doc.planId.toString(),
          doc.startDate,
          doc.endDate,
          doc.changeReason,
        ),
    );
  }
}
