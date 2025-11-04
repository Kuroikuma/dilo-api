import { UserRepository } from '../../domain/repositories/user.repository';
import { PlanRepository } from '../../domain/repositories/plan.repository';
import { UserPlanHistoryRepository } from '../../domain/repositories/user-plan-history.repository';
import { TokenTransactionRepository } from '../../domain/repositories/token-transaction.repository';
import { UserPlanHistory } from '../../domain/entities/user-plan-history.entity';
import { TokenTransaction, TokenTransactionType } from '../../domain/entities/token-transaction.entity';
import { ClientSession } from 'mongoose';
import { HttpException } from '@nestjs/common';

export class ChangeUserPlanUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly planRepo: PlanRepository,
    private readonly historyRepo: UserPlanHistoryRepository,
    private readonly transactionRepo: TokenTransactionRepository,
  ) {}

  async execute(reason: string, email: string, planId: number, tilopayTransaction: string, session?: ClientSession): Promise<void> {

    const user = await this.userRepo.findByEmail(email, session);
    if (!user) throw new HttpException('Usuario no encontrado', 404);

    const userId = user.id;

    const newPlan = await this.planRepo.findByPlanId(planId);
    if (!newPlan || !newPlan.isActive) throw new HttpException('Plan no encontrado', 404);

    const activePlan = await this.historyRepo.findActivePlanByUserId(userId);
    
    if (activePlan?.planId === newPlan.id) {
      throw new HttpException('Ya tienes este plan activo. No es necesario volver a contratarlo.', 409);
    }

    const planIdMongo = newPlan.id;

    // Finalizar historial anterior
    await this.historyRepo.endCurrent(userId, session);

    const reasonChangePlan = `Se ha cambiado el plan a (${newPlan.name})`;

    // Guardar nuevo historial
    await this.historyRepo.create(
      new UserPlanHistory('', userId, planIdMongo, new Date(), null, reasonChangePlan, tilopayTransaction),
      session,
    );

    // Actualizar plan del usuario
    user.planId = planIdMongo;
    user.tokenBalance = newPlan.tokensPerMonth;
    user.lastTokenReset = new Date();
    await this.userRepo.update(user, session);

    // Recargar tokens según el nuevo plan
    const transaction = new TokenTransaction(
      '', // let Mongo assign the _id
      userId,
      newPlan.tokensPerMonth,
      TokenTransactionType.MANUAL_ADJUSTMENT,
      `Cambio de plan: recarga inicial (${newPlan.name})`,
      new Date(),
    );
    await this.transactionRepo.create(transaction, session);
  }
}
