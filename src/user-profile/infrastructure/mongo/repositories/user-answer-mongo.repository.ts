import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { UserAnswerRepository } from '../../../domain/repositories/user-answer.repository';
import { UserAnswer } from '../../../domain/entities/user-answer.entity';
import { UserAnswerDocument } from '../schema/answer.schema';

@Injectable()
export class UserAnswerMongoRepository implements UserAnswerRepository {
  constructor(
    @InjectModel(UserAnswerDocument.name) private readonly model: Model<UserAnswerDocument>,
  ) {}

  private formatUserAnswerDocument(a: UserAnswerDocument): UserAnswer {
    return new UserAnswer(
      a._id?.toString() || '',
      a.userId.toString(),
      a.questionId.toString(),
      a.answerValue,
      a.answeredAt,
      a.updatedAt,
    );
  }

  async findByUserId(userId: string, session?: ClientSession): Promise<UserAnswer[]> {
    const docs = await this.model.find({ userId }).session(session ?? null).exec();
    return docs.map(doc => this.formatUserAnswerDocument(doc));
  }

  async findByUserAndQuestion(userId: string, questionId: string, session?: ClientSession): Promise<UserAnswer | null> {
    const doc = await this.model.findOne({ userId, questionId }).session(session ?? null).exec();
    return doc ? this.formatUserAnswerDocument(doc) : null;
  }

  async save(answer: UserAnswer, session?: ClientSession): Promise<UserAnswer> {
    const filter = { userId: answer.userId, questionId: answer.questionId };
    const update = {
      $set: {
        answerValue: answer.answerValue,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        answeredAt: new Date(),
      }
    };

    const doc = await this.model.findOneAndUpdate(
      filter,
      update,
      { upsert: true, new: true, session }
    );

    return this.formatUserAnswerDocument(doc);
  }

  async deleteByUserAndQuestion(userId: string, questionId: string, session?: ClientSession): Promise<void> {
    await this.model.deleteOne({ userId, questionId }, { session });
  }

  async getUserProfileComplete(userId: string, session?: ClientSession): Promise<{ answered: number; total: number }> {
    const [answeredCount, totalCount] = await Promise.all([
      this.model.countDocuments({ userId }).session(session ?? null),
      this.model.db.collection('questions').countDocuments({ isActive: true })
    ]);

    return { answered: answeredCount, total: totalCount };
  }
}