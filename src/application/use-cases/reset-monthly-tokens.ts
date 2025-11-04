import { UserRepository } from '../../domain/repositories/user.repository';
import { PlanRepository } from '../../domain/repositories/plan.repository';
import { UserPlanHistoryRepository } from '../../domain/repositories/user-plan-history.repository';
import { TokenTransactionRepository } from '../../domain/repositories/token-transaction.repository';
import { UserPlanHistory } from '../../domain/entities/user-plan-history.entity';
import {
  TokenTransaction,
  TokenTransactionType,
} from '../../domain/entities/token-transaction.entity';
import { ClientSession } from 'mongoose';
import { Logger } from '@nestjs/common';

export class ResetMonthlyTokensUseCase {
  private readonly logger = new Logger(ResetMonthlyTokensUseCase.name);

  constructor(
    private readonly userRepo: UserRepository,
    private readonly planRepo: PlanRepository,
    private readonly historyRepo: UserPlanHistoryRepository,
    private readonly transactionRepo: TokenTransactionRepository,
  ) {}

  async execute(session?: ClientSession): Promise<void> {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const users = await this.userRepo.findByLastTokenReset(oneMonthAgo);

    for (const user of users) {
      // 🧠 1. Obtener el historial de plan más reciente
      const latestPlanHistory = await this.historyRepo.findLastByUserId(
        user.id,
        session
      );

      if (!latestPlanHistory) {
        this.logger.warn(`❌ No hay historial de plan para ${user.email}`);
        continue;
      }

      const planExpired =
        !!latestPlanHistory.endDate && latestPlanHistory.endDate <= now;

      // 🧠 2. Si ya expiró, cambiar al plan gratuito
      if (planExpired) {
        const freePlan = await this.planRepo.findById(
          process.env.FREE_PLAN_ID as string,
        );
        if (!freePlan) {
          this.logger.warn(`❌ Plan gratuito no definido en el sistema`);
          continue;
        }

        // Actualizar user a plan gratuito si no lo tiene
        if (user.planId !== freePlan.id) {
          user.planId = freePlan.id;

          const reason = 'auto_downgrade_to_free';

          await this.historyRepo.create(
            new UserPlanHistory('', user.id, freePlan.id, now, null, reason),
            session
          );
        }
      }

      // 🧠 3. Obtener plan actual (podría ser premium aún válido o gratuito)
      const plan = await this.planRepo.findById(user.planId);
      if (!plan || !plan.isActive) {
        this.logger.warn(`❌ Plan inválido o inactivo para ${user.email}`);
        continue;
      }

      // ✅ 4. Resetear tokens según el plan actual
      user.tokenBalance = plan.tokensPerMonth;
      user.lastTokenReset = now;
      await this.userRepo.update(user, session);

      const transaction = new TokenTransaction(
        '',
        user.id,
        plan.tokensPerMonth,
        TokenTransactionType.MONTHLY_CREDIT,
        `Reseteo mensual desde plan ${plan.name}`,
        now,
      );

      await this.transactionRepo.create(transaction, session);

      this.logger.log(`✔️ Tokens reseteados para ${user.email} (${plan.name})`);
    }
  }
}
