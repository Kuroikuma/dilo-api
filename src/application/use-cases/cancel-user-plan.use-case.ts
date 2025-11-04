import { PlanRepository } from '../../domain/repositories/plan.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserPlanHistoryRepository } from '../../domain/repositories/user-plan-history.repository';
import { HttpException, NotFoundException } from '@nestjs/common';

export class CancelUserPlanUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly planRepo: PlanRepository,
    private readonly historyRepo: UserPlanHistoryRepository,
  ) {}

  async execute(userId: string): Promise<{ planId: number; email: string, cancelAt: Date }> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const plan = await this.planRepo.findById(user.planId);

    const activePlan = await this.historyRepo.findActivePlanByUserId(userId);

    if (!activePlan) {
      throw new NotFoundException('No hay plan activo que cancelar');
    }

    // 💡 Estimar fin del ciclo actual (asumimos duración mensual)
    const now = new Date();
    const startDate = new Date(activePlan.startDate);
    const monthsElapsed = this.monthsBetween(startDate, now);

    const cancelAt = new Date(startDate);
    cancelAt.setMonth(cancelAt.getMonth() + monthsElapsed);

    activePlan.endDate = cancelAt;
    activePlan.changeReason = 'cancel_scheduled';

    await this.historyRepo.update(activePlan);

    return { planId: plan?.planId || 0, email: user.email, cancelAt };
  }

  private monthsBetween(date1: Date, date2: Date): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());

    // Si son del mismo mes y año o si months < 1, devolver al menos 1
    return Math.max(months, 1);
  }
}
