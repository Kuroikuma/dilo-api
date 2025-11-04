import { Plan } from "../entities/plan.entity";

export interface PlanRepository {
  findById(id: string): Promise<Plan | null>;
  findAllActive(): Promise<Plan[]>;
  findByPlanId(planId: number): Promise<Plan | null>;
}