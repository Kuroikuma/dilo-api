import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../presentation/guards/jwt-auth.guard';
import { GetUserProfileQuestionsUseCase } from './application/use-cases/get-user-profile-questions.use-case';
import { SaveUserAnswersUseCase } from './application/use-cases/save-user-answers.use-case';
import { SaveAnswersDto } from './application/dtos/save-answers.dto';
import { CreateCategoryWithQuestionsUseCase } from './application/use-cases/create-category-with-questions.use-case';
import { AddQuestionsToCategoryUseCase } from './application/use-cases/add-questions-to-category.use-case';
import { CreateQuestionDto } from './application/dtos/create-question.dto';
import { CreateCategoryWithQuestionsDto } from './application/dtos/create-category-with-questions.dto';

@Controller('user-profile')
export class UserProfileController {
  constructor(
    private readonly getUserProfileQuestionsUseCase: GetUserProfileQuestionsUseCase,
    private readonly saveUserAnswersUseCase: SaveUserAnswersUseCase,
    private readonly createCategoryWithQuestionsUseCase: CreateCategoryWithQuestionsUseCase,
    private readonly addQuestionsToCategoryUseCase: AddQuestionsToCategoryUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('questions')
  async getProfileQuestions(@Request() req) {
    return this.getUserProfileQuestionsUseCase.execute(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('answers')
  async saveAnswers(@Request() req, @Body() body: SaveAnswersDto) {
    return this.saveUserAnswersUseCase.execute(req.user.id, body.answers);
  }

  @Post('categories-with-questions')
  async createCategoryWithQuestions(@Body() body: CreateCategoryWithQuestionsDto) {
    return this.createCategoryWithQuestionsUseCase.execute(body);
  }

  @Post('categories/:categoryId/questions')
  async addQuestionsToCategory(
    @Param('categoryId') categoryId: string,
    @Body() body: { questions: CreateQuestionDto[] },
  ) {
    return this.addQuestionsToCategoryUseCase.execute(categoryId, body.questions);
  }
}