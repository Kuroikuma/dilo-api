import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';

@Injectable()
export class MongoTransactionService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async start(): Promise<ClientSession> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }

  async commit(session: ClientSession) {
    await session.commitTransaction();
    session.endSession();
  }

  async rollback(session: ClientSession) {
    await session.abortTransaction();
    session.endSession();
  }
}
