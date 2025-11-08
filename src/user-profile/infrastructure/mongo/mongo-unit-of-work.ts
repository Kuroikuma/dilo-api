import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';
import { IUnitOfWork, ITransaction } from '../../domain/repositories/transaction.interface';

export class MongoTransaction implements ITransaction {
  constructor(private readonly session: ClientSession) {}

  getSession(): ClientSession {
    return this.session;
  }

  async commit(): Promise<void> {
    await this.session.commitTransaction();
  }

  async rollback(): Promise<void> {
    await this.session.abortTransaction();
  }

  async endSession(): Promise<void> {
    await this.session.endSession();
  }

  isActive(): boolean {
    return this.session.inTransaction();
  }
}

@Injectable()
export class MongoUnitOfWork implements IUnitOfWork {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async startTransaction(): Promise<ITransaction> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return new MongoTransaction(session);
  }

  async withTransaction<T>(work: (transaction: ITransaction) => Promise<T>): Promise<T> {
    const transaction = await this.startTransaction();
    const mongoTransaction = transaction as MongoTransaction;

    try {
      const result = await work(transaction);
      await transaction.commit();
      await mongoTransaction.endSession();
      return result;
    } catch (error) {
      await transaction.rollback();
      await mongoTransaction.endSession();
      throw error;
    }
  }
}
