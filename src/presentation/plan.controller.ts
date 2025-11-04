import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { DeviceGuard } from './guards/device.guard';
import { ListPlansUseCase } from '../application/use-cases/list-plans.use-case';
import { ChangeUserPlanUseCase } from '../application/use-cases/change-user-plan.use-case';
import { GetUserPlanHistoryUseCase } from '../application/use-cases/get-user-plan-history.use-case';
import { ChangePlanDto } from './dtos/change-plan.dto';
import { MongoTransactionService } from '../infrastructure/mongo/mongo-transaction.service';
import { Transactional } from '../common/decorators/transactional.decorator';
import { ResetMonthlyTokensUseCase } from '../application/use-cases/reset-monthly-tokens';
import { CancelPlanDto } from './dtos/tilopay-webhook.dto';
import { CancelUserPlanUseCase } from '../application/use-cases/cancel-user-plan.use-case';

@Controller('plans')
export class PlanController {
  constructor(
    private readonly listPlansUseCase: ListPlansUseCase,
    private readonly changePlanUseCase: ChangeUserPlanUseCase,
    private readonly historyUseCase: GetUserPlanHistoryUseCase,
    public readonly mongoTransactionService: MongoTransactionService,
    private readonly resetMonthlyTokensUseCase: ResetMonthlyTokensUseCase,
    private readonly cancelUserPlanUseCase: CancelUserPlanUseCase,
  ) {}

  @UseGuards(JwtAuthGuard, DeviceGuard)
  @Get()
  async getPlans() {
    return await this.listPlansUseCase.execute();
  }

  @Get('reset-monthly-tokens')
  @Transactional()
  async resetMonthlyTokens() {
    await this.resetMonthlyTokensUseCase.execute();
    return { message: 'Tokens reseteados correctamente' };
  }

  @UseGuards(JwtAuthGuard, DeviceGuard)
  @Post('change')
  @Transactional()
  async changePlan(@Body() dto: ChangePlanDto) {
    // await this.changePlanUseCase.execute(dto.reason, "", "");
    return { message: 'Plan actualizado con éxito' };
  }

  @UseGuards(JwtAuthGuard, DeviceGuard)
  @Get('history')
  async getHistory(@Request() req) {
    return await this.historyUseCase.execute(req.user.id);
  }

  @UseGuards(JwtAuthGuard, DeviceGuard)
  @Post('cancel')
    async handleCancel(@Body() body: CancelPlanDto) {
      console.log('body', body);
      // Lógica: cancelar suscripción
      await this.cancelUserPlanUseCase.execute(body.userId);
      return 
    }
}
