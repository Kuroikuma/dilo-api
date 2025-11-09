import { Category } from '../entities/category.entity';
import { IRepository } from './repository.interface';
import { ITransaction } from './transaction.interface';

export interface ICategoryRepository extends IRepository<Category> {
  findAllActive(transaction?: ITransaction): Promise<Category[]>;
  findById(id: string, transaction?: ITransaction): Promise<Category | null>;
  save(entity: Category, transaction?: ITransaction): Promise<Category>;
}