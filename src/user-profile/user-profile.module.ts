import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryDocument, CategorySchema } from './infrastructure/mongo/schema/category.schema';
import { QuestionDocument, QuestionSchema } from './infrastructure/mongo/schema/question.schema';
import { UserAnswerDocument, UserAnswerSchema } from './infrastructure/mongo/schema/answer.schema';
import { CategoryMongoRepository } from './infrastructure/mongo/repositories/category-mongo.repository';
import { QuestionMongoRepository } from './infrastructure/mongo/repositories/question-mongo.repository';
import { UserAnswerMongoRepository } from './infrastructure/mongo/repositories/user-answer-mongo.repository';
import {
  CATEGORY_REPOSITORY,
  OPENAI_PROFILE_SERVICE,
  QUESTION_CONDITION_SERVICE,
  QUESTION_REPOSITORY,
  UNIT_OF_WORK,
  USER_ANSWER_REPOSITORY,
  USER_PROFILE_SUMMARY_REPOSITORY,
} from './domain/repositories/repository.tokens';
import { GetUserProfileQuestionsUseCase } from './application/use-cases/get-user-profile-questions.use-case';
import { SaveUserAnswersUseCase } from './application/use-cases/save-user-answers.use-case';
import { UserProfileController } from './user-profile.controller';
import { MongoUnitOfWork } from './infrastructure/mongo/mongo-unit-of-work';
import { QuestionConditionService } from './domain/services/question-condition.service';
import { CreateCategoryWithQuestionsUseCase } from './application/use-cases/create-category-with-questions.use-case';
import { AddQuestionsToCategoryUseCase } from './application/use-cases/add-questions-to-category.use-case';
import { UserProfileSummaryMongoRepository } from './infrastructure/mongo/repositories/user-profile-summary-mongo.repository';
import { OpenAIPProfileService } from './domain/services/openai-profile.service';
import { GenerateUserProfileUseCase } from './application/use-cases/generate-user-profile.use-case';
import {
  UserProfileSummaryDocument,
  UserProfileSummarySchema,
} from './infrastructure/mongo/schema/user-profile-summary.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CategoryDocument.name, schema: CategorySchema },
      { name: QuestionDocument.name, schema: QuestionSchema },
      { name: UserAnswerDocument.name, schema: UserAnswerSchema },
      { name: UserProfileSummaryDocument.name, schema: UserProfileSummarySchema },
    ]),
  ],
  controllers: [UserProfileController],
  providers: [
    {
      provide: UNIT_OF_WORK,
      useClass: MongoUnitOfWork,
    },
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryMongoRepository,
    },
    {
      provide: QUESTION_REPOSITORY,
      useClass: QuestionMongoRepository,
    },
    {
      provide: USER_ANSWER_REPOSITORY,
      useClass: UserAnswerMongoRepository,
    },
    {
      provide: USER_PROFILE_SUMMARY_REPOSITORY,
      useClass: UserProfileSummaryMongoRepository,
    },
    {
      provide: QUESTION_CONDITION_SERVICE,
      useClass: QuestionConditionService,
    },
    {
      provide: OPENAI_PROFILE_SERVICE,
      useClass: OpenAIPProfileService,
    },
    GetUserProfileQuestionsUseCase,
    SaveUserAnswersUseCase,
    CreateCategoryWithQuestionsUseCase,
    AddQuestionsToCategoryUseCase,
    GenerateUserProfileUseCase,
  ],
  exports: [
    CATEGORY_REPOSITORY,
    QUESTION_REPOSITORY,
    UNIT_OF_WORK,
    USER_ANSWER_REPOSITORY,
    USER_PROFILE_SUMMARY_REPOSITORY,
    QUESTION_CONDITION_SERVICE,
    OPENAI_PROFILE_SERVICE,
    GetUserProfileQuestionsUseCase,
    SaveUserAnswersUseCase,
    CreateCategoryWithQuestionsUseCase,
    AddQuestionsToCategoryUseCase,
    GenerateUserProfileUseCase,
  ],
})
export class UserProfileModule {}
