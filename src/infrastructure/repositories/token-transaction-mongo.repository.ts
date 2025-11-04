import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { ClientSession, Model, Types } from 'mongoose';
import { TokenTransaction } from '../../domain/entities/token-transaction.entity';
import { TokenTransactionDocument } from '../database/schemas/token-transaction.schema';
import { TokenTransactionType } from '../../domain/entities/token-transaction.entity';
import { TokenTransactionRepository } from '../../domain/repositories/token-transaction.repository';

@Injectable()
export class TokenTransactionMongoRepository
  implements TokenTransactionRepository
{
  constructor(
    @InjectModel(TokenTransactionDocument.name)
    private readonly model: Model<TokenTransactionDocument>,
  ) {}

  async update(
    transaction: TokenTransaction,
    session?: ClientSession,
  ): Promise<void> {
    await this.model.findByIdAndUpdate(
      transaction.id,
      {
        userId: new Types.ObjectId(transaction.userId),
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
        created_at: transaction.createdAt,
      },
      { upsert: true, session },
    );
  }

  async create(
    transaction: TokenTransaction,
    session?: ClientSession,
  ): Promise<void> {
    let id = new mongoose.Types.ObjectId();
    await this.model.findByIdAndUpdate(
      id, // ID del documento (debe ser un ObjectId válido si existe)
      {
        // Usa $set para actualizar campos existentes o crearlos si no existen
        $set: {
          userId: new Types.ObjectId(transaction.userId),
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          created_at: transaction.createdAt,
        },
      },
      {
        upsert: true, // Crea el documento si no existe
        session, // Sesión de transacción
        new: true, // Opcional: Devuelve el documento actualizado/creado
      },
    );
  }

  async getBalanceForUser(
    userId: string,
    session?: ClientSession,
  ): Promise<number> {
    const result = await this.model.aggregate(
      [
        { $match: { userId: new Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ],
      { session },
    );

    return result.length > 0 ? result[0].total : 0;
  }

  async findByUser(
    userId: string,
    session?: ClientSession,
  ): Promise<TokenTransaction[]> {
    const docs = await this.model
      .find({ userId: new Types.ObjectId(userId) }, {}, { session })
      .sort({ created_at: -1 });

    return docs.map(
      (doc) =>
        new TokenTransaction(
          doc._id.toString(),
          doc.userId.toString(),
          doc.amount,
          doc.type as TokenTransactionType,
          doc.description,
          doc.created_at,
        ),
    );
  }
}
