import { ClientSession } from "mongoose";
import { UserPlanHistory } from "../entities/user-plan-history.entity";

export interface UserPlanHistoryRepository {
  update(history: UserPlanHistory, session?: ClientSession): Promise<void>;
  create(history: Partial<UserPlanHistory>, session?: ClientSession): Promise<void>;
  endCurrent(userId: string, session?: ClientSession): Promise<void>;
  findHistoryByUser(userId: string, session?: ClientSession): Promise<UserPlanHistory[]>;
  findActivePlanByUserId(userId: string, session?: ClientSession): Promise<UserPlanHistory | null>;
  findLastByUserId(userId: string, session?: ClientSession): Promise<UserPlanHistory | null>;
}