import { UserAnswer } from '../entities/user-answer.entity';
import { ITransaction } from './transaction.interface';
import { IRepository } from './repository.interface';

export interface IUserAnswerRepository extends IRepository<UserAnswer> {
  findByUserId(userId: string, transaction?: ITransaction): Promise<UserAnswer[]>;
  findByUserAndQuestion(userId: string, questionId: string, transaction?: ITransaction): Promise<UserAnswer | null>;
  save(answer: UserAnswer, transaction?: ITransaction): Promise<UserAnswer>;
  deleteByUserAndQuestion(userId: string, questionId: string, transaction?: ITransaction): Promise<void>;
  getUserProfileComplete(userId: string, transaction?: ITransaction): Promise<{ answered: number; total: number }>;
}