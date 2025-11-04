import { PlanRepository } from '../../domain/repositories/plan.repository';
import { Plan } from '../../domain/entities/plan.entity';

export class ListPlansUseCase {
  constructor(private readonly planRepo: PlanRepository) {}

  async execute(): Promise<Plan[]> {
    return await this.planRepo.findAllActive();
  }
}
