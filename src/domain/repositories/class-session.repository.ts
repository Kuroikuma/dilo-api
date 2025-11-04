import { ClientSession } from 'mongoose';
import { ClassSession } from '../entities/class-session.entity';

export interface ClassSessionRepository {
  update(classSession: ClassSession, session?: ClientSession): Promise<void>;
  findByUser(userId: string, session?: ClientSession): Promise<ClassSession[]>;
  create(
    classSession: Partial<ClassSession>,
    session?: ClientSession,
  ): Promise<ClassSession>;
  findById(id: string, session?: ClientSession): Promise<ClassSession>;
}
