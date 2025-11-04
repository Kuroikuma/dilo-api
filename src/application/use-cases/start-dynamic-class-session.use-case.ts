import { NotFoundException } from '@nestjs/common';
import { TokenTransaction, TokenTransactionType } from '../../domain/entities/token-transaction.entity';
import { ClassSessionRepository } from '../../domain/repositories/class-session.repository';
import { TokenTransactionRepository } from '../../domain/repositories/token-transaction.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { AiClassifierService } from '../../infrastructure/ai/ai-classifier.service';
import { AiCourseService } from '../../infrastructure/ai/ai-course.service';
import { ClientSession } from 'mongoose';
import { promptFallback, promptStarClassOne } from '../../infrastructure/ai/prompt ';

export class StartDynamicClassSessionUseCase {
  constructor(
    private readonly classifier: AiClassifierService,
    private readonly sessionRepo: ClassSessionRepository,
    private readonly aiService: AiCourseService,
    private readonly tokenRepo: TokenTransactionRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(userId: string, question: string, level: string, sessionMongo?: ClientSession) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const { subject, topic } = await this.classifier.extractSubjectAndTopic(question, level);

    if (!subject) {
      const assistantReply = await this.aiService.generateResponse(promptFallback, [
        {
          role: 'system',
          content: question,
        },
      ]);

      return {
        reply: assistantReply,
        sessionCreated: false,
      };
    }

    const title = `${subject}: ${topic}`;
    const basePrompt = promptStarClassOne(subject, topic, level);

    const session = await this.sessionRepo.create(
      {
        userId,
        title,
        basePrompt,
        level,
        messages: [
          {
            role: 'user',
            content: question,
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      sessionMongo,
    );

    const reply = await this.aiService.generateResponse(basePrompt, session.messages);

    session.messages.push({
      role: 'assistant',
      content: reply,
      timestamp: new Date(),
    });
    
    session.updatedAt = new Date();

    await this.sessionRepo.update(session, sessionMongo);

    const cost = 1;
    const balance = await this.tokenRepo.getBalanceForUser(userId);

    user.consumeTokens(cost);
    await this.userRepo.update(user, sessionMongo);

    if (balance < cost) throw new Error('No tienes tokens suficientes');

    await this.tokenRepo.create(
      new TokenTransaction('', userId, -cost, TokenTransactionType.USAGE, `Clase de ${subject}: ${topic}`, new Date()),
      sessionMongo,
    );

    return { reply, title, subject, topic, sessionId: session.id, sessionCreated: true };
  }
}
