import { ClientSession } from 'mongoose';
import { Category } from '../entities/category.entity';

export interface CategoryRepository {
  findAllActive(session?: ClientSession): Promise<Category[]>;
  findById(id: string, session?: ClientSession): Promise<Category | null>;
  create(category: Partial<Category>, session?: ClientSession): Promise<Category>;
  update(category: Category, session?: ClientSession): Promise<void>;
}