import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoTransaction } from '../mongo-unit-of-work';
import { IUserProfileSummaryRepository } from 'src/user-profile/domain/repositories/user-profile-summary.repository';
import { ITransaction } from 'src/user-profile/domain/repositories/transaction.interface';
import { LearningProfile, UserProfileSummary } from 'src/user-profile/domain/entities/user-profile.entity';
import { UserProfileSummaryDocument } from '../schema/user-profile-summary.schema';

@Injectable()
export class UserProfileSummaryMongoRepository implements IUserProfileSummaryRepository {
  constructor(
    @InjectModel(UserProfileSummaryDocument.name) private readonly model: Model<UserProfileSummaryDocument>,
  ) {}
  async findAll(transaction?: ITransaction): Promise<UserProfileSummary[]> {
    const session = this.getSession(transaction);
    const docs = await this.model
      .find()
      .session(session ?? null)
      .exec();
    return docs.map((doc) => this.formatDocument(doc)) as UserProfileSummary[];
  }
  async delete(id: string, transaction?: ITransaction): Promise<void> {
    const session = this.getSession(transaction);
    await this.model
      .findByIdAndDelete(id)
      .session(session ?? null)
      .exec();
  }
  async findAllActive(transaction?: ITransaction): Promise<UserProfileSummary[]> {
    const session = this.getSession(transaction);
    const docs = await this.model
      .find({ isActive: true })
      .session(session ?? null)
      .exec();
    return docs.map((doc) => this.formatDocument(doc)) as UserProfileSummary[];
  }

    private getSession(transaction?: ITransaction) {
    return transaction && transaction instanceof MongoTransaction ? transaction.getSession() : undefined;
  }

  private formatDocument(doc: UserProfileSummaryDocument): UserProfileSummary {
    return new UserProfileSummary(
      doc._id?.toString() || '',
      doc.userId.toString(),
      doc.profileText,
      doc.learningProfile as LearningProfile,
      doc.lastUpdated,
      doc.version,
    );
  }

  async findByUserId(userId: string, transaction?: ITransaction): Promise<UserProfileSummary | null> {
    const session = this.getSession(transaction);
    const doc = await this.model
      .findOne({ userId })
      .sort({ version: -1 })
      .session(session || null)
      .exec();
    
    return doc ? this.formatDocument(doc) : null;
  }

  async findByUserIdAndVersion(userId: string, version: number, transaction?: ITransaction): Promise<UserProfileSummary | null> {
    const session = this.getSession(transaction);
    const doc = await this.model
      .findOne({ userId, version })
      .session(session || null)
      .exec();
    
    return doc ? this.formatDocument(doc) : null;
  }

  async findLatestByUserId(userId: string, transaction?: ITransaction): Promise<UserProfileSummary | null> {
    return this.findByUserId(userId, transaction);
  }

  async save(entity: UserProfileSummary, transaction?: ITransaction): Promise<UserProfileSummary> {
    const session = this.getSession(transaction);
    
    if (entity.id) {
      // Update
      const doc = await this.model
        .findByIdAndUpdate(entity.id, entity, { new: true })
        .session(session || null)
        .exec();
      
      if (!doc) throw new Error('UserProfileSummary not found');
      return this.formatDocument(doc);
    } else {
      // Create
      const doc = new this.model(entity);
      await doc.save({ session });
      return this.formatDocument(doc);
    }
  }

  async findById(id: string, transaction?: ITransaction): Promise<UserProfileSummary | null> {
    const session = this.getSession(transaction);
    const doc = await this.model
      .findById(id)
      .session(session || null)
      .exec();
    
    return doc ? this.formatDocument(doc) : null;
  }

  async deleteByUserId(userId: string, transaction?: ITransaction): Promise<void> {
    const session = this.getSession(transaction);
    await this.model.deleteMany({ userId }, { session });
  }
}