import { Injectable, Inject } from '@nestjs/common';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import type { QuestionRepository } from '../../domain/repositories/question.repository';
import type { UserAnswerRepository } from '../../domain/repositories/user-answer.repository';
import {
  CATEGORY_REPOSITORY,
  QUESTION_REPOSITORY,
  USER_ANSWER_REPOSITORY,
} from '../../domain/repositories/repository.tokens';

@Injectable()
export class GetUserProfileQuestionsUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: CategoryRepository,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepo: QuestionRepository,
    @Inject(USER_ANSWER_REPOSITORY)
    private readonly userAnswerRepo: UserAnswerRepository,
  ) {}

  async execute(userId: string) {
    const [categories, questions, userAnswers] = await Promise.all([
      this.categoryRepo.findAllActive(),
      this.questionRepo.findAllActive(),
      this.userAnswerRepo.findByUserId(userId),
    ]);

    const answersMap = new Map(userAnswers.map(answer => [answer.questionId, answer]));

    const categoriesWithQuestions = categories.map(category => ({
      ...category,
      questions: questions
        .filter(q => q.categoryId === category.id)
        .map(question => ({
          ...question,
          userAnswer: answersMap.get(question.id) || null,
        })),
    }));

    const profileComplete = await this.userAnswerRepo.getUserProfileComplete(userId);

    return {
      categories: categoriesWithQuestions,
      profileComplete: {
        answered: profileComplete.answered,
        total: profileComplete.total,
        percentage: Math.round((profileComplete.answered / profileComplete.total) * 100),
      },
    };
  }
}