import { TokenTransactionRepository } from '../../domain/repositories/token-transaction.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { HttpException, NotFoundException } from '@nestjs/common';
import { TokenTransaction, TokenTransactionType } from '../../domain/entities/token-transaction.entity';

export class ConsumeTokensUseCase {
  constructor(private readonly userRepo: UserRepository, private readonly tokenRepo: TokenTransactionRepository,) {}

  async execute(userId: string, amount: number, title: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const balance = user.tokenBalance;
    if (balance === 0) throw new HttpException('No tienes tokens suficientes', 400);

    if (balance < amount) user.consumeTokens(balance);

    if (user.tokenBalance !== 0) user.consumeTokens(amount);

     await this.tokenRepo.create(
          new TokenTransaction(
            '',
            userId,
            -amount,
            TokenTransactionType.USAGE,
            `Mensaje en clase: ${title}`,
            new Date(),
          ),
        );

    await this.userRepo.update(user);
  }
}
