export interface ITransaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isActive(): boolean;
}

export interface IUnitOfWork {
  startTransaction(): Promise<ITransaction>;
  withTransaction<T>(work: (transaction: ITransaction) => Promise<T>): Promise<T>;
}