import { UserPlanHistoryRepository } from '../../domain/repositories/user-plan-history.repository';
import { UserPlanHistory } from '../../domain/entities/user-plan-history.entity';

export class GetUserPlanHistoryUseCase {
  constructor(private readonly historyRepo: UserPlanHistoryRepository) {}

  async execute(userId: string): Promise<UserPlanHistory[]> {
    return await this.historyRepo.findHistoryByUser(userId);
  }
}
