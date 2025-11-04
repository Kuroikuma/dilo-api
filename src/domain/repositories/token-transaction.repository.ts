import { ClientSession } from "mongoose";
import { TokenTransaction } from "../entities/token-transaction.entity";

export interface TokenTransactionRepository {
  update(
    tokenTransaction: TokenTransaction,
    session?: ClientSession,
  ): Promise<void>;
  getBalanceForUser(userId: string, session?: ClientSession): Promise<number>;
  findByUser(
    userId: string,
    session?: ClientSession,
  ): Promise<TokenTransaction[]>;
  create(
    tokenTransaction: Partial<TokenTransaction>,
    session?: ClientSession,
  ): Promise<void>;
}
  