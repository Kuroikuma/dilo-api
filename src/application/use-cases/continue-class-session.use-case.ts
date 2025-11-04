import { ClassSessionRepository } from '../../domain/repositories/class-session.repository';
import { TokenTransactionRepository } from '../../domain/repositories/token-transaction.repository';
import { AiCourseService } from '../../infrastructure/ai/ai-course.service';
import { TokenTransaction, TokenTransactionType } from '../../domain/entities/token-transaction.entity';
import { ClientSession } from 'mongoose';
import { UserRepository } from '../../domain/repositories/user.repository';
import { NotFoundException } from '@nestjs/common';

export class ContinueClassSessionUseCase {
  constructor(
    private readonly sessionRepo: ClassSessionRepository,
    private readonly aiService: AiCourseService,
    private readonly tokenRepo: TokenTransactionRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(
    userId: string,
    sessionId: string,
    question: string,
    sessionMongo?: ClientSession,
  ): Promise<{ reply: string }> {
    const user = await this.userRepo.findById(userId);

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const session = await this.sessionRepo.findById(sessionId);

    if (!session) throw new NotFoundException('Sesión no encontrada');
    if (session.userId !== userId) throw new Error('No autorizado');

    const cost = 1; // tokens por mensaje
    const balance = await this.tokenRepo.getBalanceForUser(userId);
    if (balance < cost) throw new Error('No tienes tokens suficientes');

    // Agregar nueva pregunta del usuario
    session.messages.push({ role: 'user', content: question, timestamp: new Date() });

    // Obtener respuesta de OpenAI
    const reply = await this.aiService.generateResponse(session.basePrompt, session.messages);

    session.messages.push({ role: 'assistant', content: reply, timestamp: new Date() });
    session.updatedAt = new Date();

    await this.sessionRepo.update(session, sessionMongo);

    user.consumeTokens(cost);
    await this.userRepo.update(user, sessionMongo);

    // Guardar transacción
    await this.tokenRepo.create(
      new TokenTransaction(
        '',
        userId,
        -cost,
        TokenTransactionType.USAGE,
        `Mensaje en clase: ${session.title}`,
        new Date(),
      ),
      sessionMongo,
    );

    return { reply };
  }
}
