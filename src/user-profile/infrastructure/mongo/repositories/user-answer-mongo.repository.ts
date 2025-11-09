import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { IUserAnswerRepository } from '../../../domain/repositories/user-answer.repository';
import { UserAnswer } from '../../../domain/entities/user-answer.entity';
import { UserAnswerDocument } from '../schema/answer.schema';
import { ITransaction } from 'src/user-profile/domain/repositories/transaction.interface';
import { MongoTransaction } from '../mongo-unit-of-work';

@Injectable()
export class UserAnswerMongoRepository implements IUserAnswerRepository {
  constructor(
    @InjectModel(UserAnswerDocument.name)
    private readonly model: Model<UserAnswerDocument>,
  ) {}
  
  async findById(id: string, transaction?: ITransaction): Promise<UserAnswer | null> {
    const session = this.getSession(transaction);
    const doc = await this.model
      .findById(id)
      .session(session ?? null)
      .exec();
    return doc ? this.formatUserAnswerDocument(doc) : null;
  }

  async findAll(transaction?: ITransaction): Promise<UserAnswer[]> {
    const session = this.getSession(transaction);
    const docs = await this.model
      .find()
      .session(session ?? null)
      .exec();
    return docs.map((doc) => this.formatUserAnswerDocument(doc)) as UserAnswer[];
  }

  async delete(id: string, transaction?: ITransaction): Promise<void> {
    const session = this.getSession(transaction);
    await this.model
      .findByIdAndDelete(id)
      .session(session ?? null)
      .exec();
  }

  async findAllActive(transaction?: ITransaction): Promise<UserAnswer[]> {
    const session = this.getSession(transaction);
    const docs = await this.model
      .find({ isActive: true })
      .session(session ?? null)
      .exec();
    return docs.map((doc) => this.formatUserAnswerDocument(doc)) as UserAnswer[];
  }

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

  private getSession(transaction?: ITransaction) {
    return transaction && transaction instanceof MongoTransaction ? transaction.getSession() : undefined;
  }

  async findByUserId(userId: string, transaction?: ITransaction): Promise<UserAnswer[]> {
    const session = this.getSession(transaction);
    const docs = await this.model
      .find({ userId })
      .session(session ?? null)
      .exec();
    return docs.map((doc) => this.formatUserAnswerDocument(doc)) as UserAnswer[];
  }

  async findByUserAndQuestion(
    userId: string,
    questionId: string,
    transaction?: ITransaction,
  ): Promise<UserAnswer | null> {
    const session = this.getSession(transaction);
    const doc = await this.model
      .findOne({ userId, questionId })
      .session(session ?? null)
      .exec();
    return doc ? this.formatUserAnswerDocument(doc) : null;
  }

  async save(answer: UserAnswer, transaction?: ITransaction): Promise<UserAnswer> {
    const session = this.getSession(transaction);
    const filter = { userId: answer.userId, questionId: answer.questionId };
    const update = {
      $set: {
        answerValue: answer.answerValue,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        answeredAt: new Date(),
      },
    };

    const doc = await this.model.findOneAndUpdate(filter, update, {
      upsert: true,
      new: true,
      session,
    });

    return this.formatUserAnswerDocument(doc);
  }

  async deleteByUserAndQuestion(userId: string, questionId: string, transaction?: ITransaction): Promise<void> {
    const session = this.getSession(transaction);
    await this.model
      .deleteOne({ userId, questionId })
      .session(session ?? null)
      .exec();
  }

  async getUserProfileComplete(
    userId: string,
    transaction?: ITransaction,
  ): Promise<{ answered: number; total: number }> {
    const session = this.getSession(transaction);
    const [answeredCount, totalCount] = await Promise.all([
      this.model.countDocuments({ userId }).session(session ?? null),
      this.model.db.collection('questions').countDocuments({ isActive: true }),
    ]);

    return { answered: answeredCount, total: totalCount };
  }
}
