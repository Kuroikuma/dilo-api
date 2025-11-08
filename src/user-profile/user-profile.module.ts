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
  QUESTION_REPOSITORY,
  USER_ANSWER_REPOSITORY,
} from './domain/repositories/repository.tokens';
import { GetUserProfileQuestionsUseCase } from './application/use-cases/get-user-profile-questions.use-case';
import { SaveUserAnswersUseCase } from './application/use-cases/save-user-answers.use-case';
import { UserProfileController } from './user-profile.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CategoryDocument.name, schema: CategorySchema },
      { name: QuestionDocument.name, schema: QuestionSchema },
      { name: UserAnswerDocument.name, schema: UserAnswerSchema },
    ]),
  ],
  controllers: [UserProfileController],
  providers: [
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
    GetUserProfileQuestionsUseCase,
    SaveUserAnswersUseCase,
  ],
  exports: [
    CATEGORY_REPOSITORY,
    QUESTION_REPOSITORY,
    USER_ANSWER_REPOSITORY,
  ],
})
export class UserProfileModule {}