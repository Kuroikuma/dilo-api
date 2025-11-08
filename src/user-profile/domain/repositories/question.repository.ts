import { Question } from '../entities/question.entity';
import { IRepository } from './repository.interface';
import { ITransaction } from './transaction.interface';

export interface QuestionRepository extends IRepository<Question> {
  findAllActive(transaction?: ITransaction): Promise<Question[]>;
  findByCategory(categoryId: string, transaction?: ITransaction): Promise<Question[]>;
  findById(id: string, transaction?: ITransaction): Promise<Question | null>;
}