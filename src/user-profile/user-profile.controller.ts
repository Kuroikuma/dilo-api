import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../presentation/guards/jwt-auth.guard';
import { GetUserProfileQuestionsUseCase } from './application/use-cases/get-user-profile-questions.use-case';
import { SaveUserAnswersUseCase } from './application/use-cases/save-user-answers.use-case';

@Controller('user-profile')
export class UserProfileController {
  constructor(
    private readonly getUserProfileQuestionsUseCase: GetUserProfileQuestionsUseCase,
    private readonly saveUserAnswersUseCase: SaveUserAnswersUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('questions')
  async getProfileQuestions(@Request() req) {
    return this.getUserProfileQuestionsUseCase.execute(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('answers')
  async saveAnswers(@Request() req, @Body() body: { answers: Array<{ questionId: string; answerValue: any }> }) {
    return this.saveUserAnswersUseCase.execute(req.user.id, body.answers);
  }
}