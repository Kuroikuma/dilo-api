import { ClientSession } from 'mongoose';
import { Question } from '../entities/question.entity';

export interface QuestionRepository {
  findAllActive(session?: ClientSession): Promise<Question[]>;
  findByCategory(categoryId: string, session?: ClientSession): Promise<Question[]>;
  findById(id: string, session?: ClientSession): Promise<Question | null>;
  create(question: Partial<Question>, session?: ClientSession): Promise<Question>;
  update(question: Question, session?: ClientSession): Promise<void>;
}