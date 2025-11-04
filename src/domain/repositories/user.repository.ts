import { ClientSession } from 'mongoose';
import { User } from '../entities/user.entity';

export interface UserRepository {
  findByEmail(email: string, session?: ClientSession): Promise<User | null>;
  findById(id: string, session?: ClientSession): Promise<User | null>;
  update(user: Partial<User>, session?: ClientSession): Promise<void>;
  create(userData: Partial<User>, session?: ClientSession): Promise<User>;
  findByVerificationToken(token: string, session?: ClientSession): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByVerificationToken(token: string): Promise<User | null>;
  findByResetToken(token: string): Promise<User | null>;
  findOne(query: any): Promise<User | null>;
  findByLastTokenReset(date: Date): Promise<User[] | null>;
}
