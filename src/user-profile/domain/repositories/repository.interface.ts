import { ITransaction } from './transaction.interface';

export interface IRepository<T> {
  save(entity: T, transaction?: ITransaction): Promise<T>;
  findById(id: string, transaction?: ITransaction): Promise<T | null>;
  findAll(transaction?: ITransaction): Promise<T[]>;
  delete(id: string, transaction?: ITransaction): Promise<void>;
  findAllActive(transaction?: ITransaction): Promise<T[]>;
}