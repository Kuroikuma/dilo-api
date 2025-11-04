import { Injectable } from "@nestjs/common";
import { TokenTransaction, TokenTransactionType } from "../entities/token-transaction.entity";
import { TokenTransactionRepository } from "../repositories/token-transaction.repository";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class TokenService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly transactionRepo: TokenTransactionRepository,
  ) {}

  async consume(userId: string, amount: number, description: string): Promise<void> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
        throw new Error('Usuario no encontrado');
    }
    const currentTokens = await this.transactionRepo.getBalanceForUser(userId);

    if (currentTokens < amount) {
      throw new Error('No hay tokens suficientes');
    }

    const transaction = new TokenTransaction(
      crypto.randomUUID(), // o new ObjectId()
      userId,
      -amount,
      TokenTransactionType.USAGE,
      description,
      new Date()
    );

    await this.transactionRepo.create(transaction);
  }

  async creditMonthly(userId: string, amount: number): Promise<void> {
    const transaction = new TokenTransaction(
      crypto.randomUUID(),
      userId,
      amount,
      TokenTransactionType.MONTHLY_CREDIT,
      'Recarga mensual',
      new Date()
    );

    await this.transactionRepo.create(transaction);
  }
}
