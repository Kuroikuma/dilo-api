import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { DeviceGuard } from './guards/device.guard';
import { MongoTransactionService } from '../infrastructure/mongo/mongo-transaction.service';
import { StartDynamicClassSessionUseCase } from '../application/use-cases/start-dynamic-class-session.use-case';
import { Transactional } from '../common/decorators/transactional.decorator';
import { ContinueClassSessionUseCase } from '../application/use-cases/continue-class-session.use-case';
import { StartConversationDto } from './dtos/start-conversation.dto';
import { AskInClassDto } from './dtos/ask-in-class.dto';
import { GetUserClassSessionsUseCase } from '../application/use-cases/get-user-class-sessions.use-case ';
import { GetClassSessionByIdUseCase } from '../application/use-cases/get-class-session-by-id.use-case';

@Controller('class-session')
@UseGuards(JwtAuthGuard, DeviceGuard)
export class ClassSessionController {
  constructor(
    private readonly startDynamicClassSessionUseCase: StartDynamicClassSessionUseCase,
    public readonly mongoTransactionService: MongoTransactionService,
    public readonly continueClassSessionUseCase: ContinueClassSessionUseCase,
    public readonly getUserClassSessionsUseCase: GetUserClassSessionsUseCase,
    public readonly getClassSessionByIdUseCase: GetClassSessionByIdUseCase,
  ) {}

  @Post('start')
  @Transactional()
  async startConversation(@Request() req, @Body() body: StartConversationDto) {
    return await this.startDynamicClassSessionUseCase.execute(req.user.id, body.question, body.level);
  }

  @Post(':sessionId/ask')
  @Transactional()
  async askInClass(@Request() req, @Param('sessionId') sessionId: string, @Body() body: AskInClassDto) {
    return await this.continueClassSessionUseCase.execute(req.user.id, sessionId, body.question);
  }

  @Get('my-sessions')
  async getUserSessions(@Request() req) {
    return await this.getUserClassSessionsUseCase.execute(req.user.id);
  }

  @Get(':sessionId')
  async getSession(@Request() req, @Param('sessionId') sessionId: string) {
    return await this.getClassSessionByIdUseCase.execute(req.user.id, sessionId);
  }
}
