import { ClientSession } from 'mongoose';
import { UserAnswer } from '../entities/user-answer.entity';

export interface UserAnswerRepository {
  findByUserId(userId: string, session?: ClientSession): Promise<UserAnswer[]>;
  findByUserAndQuestion(userId: string, questionId: string, session?: ClientSession): Promise<UserAnswer | null>;
  save(answer: UserAnswer, session?: ClientSession): Promise<UserAnswer>;
  deleteByUserAndQuestion(userId: string, questionId: string, session?: ClientSession): Promise<void>;
  getUserProfileComplete(userId: string, session?: ClientSession): Promise<{ answered: number; total: number }>;
}