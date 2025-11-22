import { IRepository } from './repository.interface';
import { UserProfileSummary } from '../entities/user-profile.entity';
import { ITransaction } from './transaction.interface';

export interface IUserProfileSummaryRepository extends IRepository<UserProfileSummary> {
  findByUserId(userId: string, transaction?: ITransaction): Promise<UserProfileSummary | null>;
  findByUserIdAndVersion(userId: string, version: number, transaction?: ITransaction): Promise<UserProfileSummary | null>;
  findLatestByUserId(userId: string, transaction?: ITransaction): Promise<UserProfileSummary | null>;
  deleteByUserId(userId: string, transaction?: ITransaction): Promise<void>;
}