import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IUnitOfWork } from '../../domain/repositories/transaction.interface';
import type { IUserAnswerRepository } from '../../domain/repositories/user-answer.repository';
import type { IQuestionRepository } from '../../domain/repositories/question.repository';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import type { IUserProfileSummaryRepository } from '../../domain/repositories/user-profile-summary.repository';
import type { OpenAIPProfileService } from '../../domain/services/openai-profile.service';
import { UserProfileSummary } from '../../domain/entities/user-profile.entity';
import { QuestionAnswerPairDto } from '../dtos/generate-profile.dto';
import { CATEGORY_REPOSITORY, OPENAI_PROFILE_SERVICE, QUESTION_REPOSITORY, UNIT_OF_WORK, USER_ANSWER_REPOSITORY, USER_PROFILE_SUMMARY_REPOSITORY } from 'src/user-profile/domain/repositories/repository.tokens';

@Injectable()
export class GenerateUserProfileUseCase {
  private readonly logger = new Logger(GenerateUserProfileUseCase.name);

  constructor(
     @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    @Inject(USER_ANSWER_REPOSITORY)
    private readonly userAnswerRepo: IUserAnswerRepository,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepo: IQuestionRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: ICategoryRepository,
    @Inject(USER_PROFILE_SUMMARY_REPOSITORY)
    private readonly profileSummaryRepo: IUserProfileSummaryRepository,
    @Inject(OPENAI_PROFILE_SERVICE)
    private readonly openAIService: OpenAIPProfileService,
  ) {}

  async execute(userId: string): Promise<UserProfileSummary> {
    return this.unitOfWork.withTransaction(async (transaction) => {
      // 1. Verificar si ya existe un perfil reciente (menos de 7 días)
      const existingProfile = await this.profileSummaryRepo.findLatestByUserId(userId, transaction);
      
      if (existingProfile && this.isProfileRecent(existingProfile)) {
        this.logger.log(`Returning cached profile for user ${userId}`);
        return existingProfile;
      }

      // 2. Obtener todas las respuestas del usuario
      const [userAnswers, allQuestions, allCategories] = await Promise.all([
        this.userAnswerRepo.findByUserId(userId, transaction),
        this.questionRepo.findAllActive(transaction),
        this.categoryRepo.findAllActive(transaction),
      ]);

      // 3. Mapear preguntas y categorías
      const questionsMap = new Map(allQuestions.map(q => [q.id, q]));
      const categoriesMap = new Map(allCategories.map(c => [c.id, c]));

      // 4. Preparar datos para OpenAI
      const questionAnswers: QuestionAnswerPairDto[] = userAnswers.map(answer => {
        const question = questionsMap.get(answer.questionId);
        const category = categoriesMap.get(question?.categoryId || '');
        
        return {
          question: question?.questionText || 'Pregunta no encontrada',
          answer: answer.answerValue,
          category: category?.name || 'Categoría no encontrada',
        };
      }).filter(qa => qa.question !== 'Pregunta no encontrada');

      // 5. Generar perfil con OpenAI
      const { profileText, learningProfile } = await this.openAIService.generateUserProfile(questionAnswers);

      // 6. Determinar nueva versión
      const latestVersion = existingProfile ? existingProfile.version + 1 : 1;

      // 7. Guardar el perfil
      const userProfileSummary = new UserProfileSummary(
        '',
        userId,
        profileText,
        learningProfile,
        new Date(),
        latestVersion,
      );

      const savedProfile = await this.profileSummaryRepo.save(userProfileSummary, transaction);

      this.logger.log(`Generated new profile for user ${userId}, version ${latestVersion}`);

      return savedProfile;
    });
  }

  private isProfileRecent(profile: UserProfileSummary): boolean {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return profile.lastUpdated > sevenDaysAgo;
  }
}