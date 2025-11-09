import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import type { IUserAnswerRepository } from '../../domain/repositories/user-answer.repository';
import type { IQuestionRepository } from '../../domain/repositories/question.repository';
import { UserAnswer } from '../../domain/entities/user-answer.entity';
import {
  QUESTION_REPOSITORY,
  UNIT_OF_WORK,
  USER_ANSWER_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import type { IUnitOfWork } from '../../domain/repositories/transaction.interface';

interface AnswerDto {
  questionId: string;
  answerValue: any;
}

@Injectable()
export class SaveUserAnswersUseCase {
  constructor(
    @Inject(USER_ANSWER_REPOSITORY)
    private readonly userAnswerRepo: IUserAnswerRepository,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepo: IQuestionRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(userId: string, answers: AnswerDto[]) {
    return this.unitOfWork.withTransaction(async (transaction) => {
      const results: UserAnswer[] = [];

      for (const answerData of answers) {
        const question = await this.questionRepo.findById(answerData.questionId, transaction);

        if (!question) {
          throw new HttpException(`Pregunta no encontrada: ${answerData.questionId}`, HttpStatus.BAD_REQUEST);
        }

        if (!this.validateAnswer(question, answerData.answerValue)) {
          throw new HttpException(
            `Respuesta inválida para la pregunta: ${question.questionText}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        const existingAnswer = await this.userAnswerRepo.findByUserAndQuestion(
          userId,
          answerData.questionId,
          transaction,
        );

        let answer: UserAnswer;

        if (existingAnswer) {
          // Update existing
          answer = new UserAnswer(
            existingAnswer.id,
            userId,
            answerData.questionId,
            answerData.answerValue,
            existingAnswer.answeredAt,
            new Date(),
          );
        } else {
          // Create new
          answer = new UserAnswer('', userId, answerData.questionId, answerData.answerValue);
        }

        const savedAnswer = await this.userAnswerRepo.save(answer, transaction);
        results.push(savedAnswer);
      }

      const profileComplete = await this.userAnswerRepo.getUserProfileComplete(userId, transaction);

      return {
        savedAnswers: results,
        profileComplete: {
          answered: profileComplete.answered,
          total: profileComplete.total,
          percentage: Math.round((profileComplete.answered / profileComplete.total) * 100),
        },
      };
    });
  }

  private validateAnswer(question: any, answerValue: any): boolean {
    // Implementar validaciones según el tipo de pregunta
    switch (question.type) {
      case 'email':
        return typeof answerValue === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answerValue);
      case 'number':
        return !isNaN(Number(answerValue));
      case 'select':
      case 'radio':
        return question.options?.includes(answerValue) || false;
      case 'multiselect':
        return Array.isArray(answerValue) && answerValue.every((val) => question.options?.includes(val));
      default:
        return true; // Para texto y otros tipos, aceptamos cualquier valor
    }
  }
}
