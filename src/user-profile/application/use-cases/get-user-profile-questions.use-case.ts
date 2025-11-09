import { Injectable, Inject } from '@nestjs/common';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import type { IQuestionRepository } from '../../domain/repositories/question.repository';
import type { IUserAnswerRepository } from '../../domain/repositories/user-answer.repository';
import {
  CATEGORY_REPOSITORY,
  QUESTION_CONDITION_SERVICE,
  QUESTION_REPOSITORY,
  USER_ANSWER_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import type { QuestionConditionService } from '../../domain/services/question-condition.service';

@Injectable()
export class GetUserProfileQuestionsUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: ICategoryRepository,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepo: IQuestionRepository,
    @Inject(USER_ANSWER_REPOSITORY)
    private readonly userAnswerRepo: IUserAnswerRepository,
    @Inject(QUESTION_CONDITION_SERVICE)
    private readonly conditionService: QuestionConditionService,
  ) {}

  async execute(userId: string) {
    const [categories, allQuestions, userAnswers] = await Promise.all([
      this.categoryRepo.findAllActive(),
      this.questionRepo.findAllActive(),
      this.userAnswerRepo.findByUserId(userId),
    ]);

    // Filtrar preguntas relevantes basadas en condiciones
    const relevantQuestions = this.conditionService.getRelevantQuestions(
      allQuestions, 
      userAnswers
    );

    const answersMap = new Map(userAnswers.map(answer => [answer.questionId, answer]));

    const categoriesWithQuestions = categories.map(category => ({
      ...category,
      questions: relevantQuestions
        .filter(q => q.categoryId === category.id)
        .map(question => ({
          ...question,
          userAnswer: answersMap.get(question.id) || null,
          // Incluir información sobre si es condicional
          isConditional: question.isConditional,
          parentQuestionId: question.parentQuestionId,
        })),
    }));

    const profileComplete = await this.userAnswerRepo.getUserProfileComplete(userId);
    const totalRelevant = relevantQuestions.length;
    const percentage = totalRelevant > 0 
      ? Math.round((profileComplete.answered / totalRelevant) * 100)
      : 0;

    return {
      categories: categoriesWithQuestions,
      profileComplete: {
        answered: profileComplete.answered,
        total: totalRelevant, // Usar solo preguntas relevantes para el total
        percentage,
      },
    };
  }
}