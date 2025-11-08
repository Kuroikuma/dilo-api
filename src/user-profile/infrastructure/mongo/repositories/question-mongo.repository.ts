import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { QuestionRepository } from '../../../domain/repositories/question.repository';
import { Question } from '../../../domain/entities/question.entity';
import { QuestionDocument } from '../schema/question.schema';
import { ITransaction } from 'src/user-profile/domain/repositories/transaction.interface';
import { MongoTransaction } from '../mongo-unit-of-work';

@Injectable()
export class QuestionMongoRepository implements QuestionRepository {
  constructor(
    @InjectModel(QuestionDocument.name)
    private readonly model: Model<QuestionDocument>,
  ) {}

  async findAll(transaction?: ITransaction): Promise<Question[]> {
    const session = this.getSession(transaction);
    const docs = await this.model
      .find()
      .session(session ?? null)
      .exec();
    return docs.map((doc) => this.formatQuestionDocument(doc)) as Question[];
  }
  
  async delete(id: string, transaction?: ITransaction): Promise<void> {
    const session = this.getSession(transaction);
    await this.model
      .findByIdAndDelete(id)
      .session(session ?? null)
      .exec();
  }

  private getSession(transaction?: ITransaction) {
    return transaction && transaction instanceof MongoTransaction ? transaction.getSession() : undefined;
  }

  private formatQuestionDocument(q: QuestionDocument): Question {
    return new Question(
      q._id?.toString() || '',
      q.questionText,
      q.categoryId.toString(),
      q.type as any,
      q.order,
      q.isRequired,
      q.options,
      q.placeholder,
      q.helperText,
      q.validationRules,
      q.isActive,
      q.createdAt,
      q.parentQuestionId?.toString(),
      q.condition ? {
        parentQuestionId: q.condition.parentQuestionId.toString(),
        operator: q.condition.operator as any,
        expectedValue: q.condition.expectedValue,
      } : undefined,
      q.isConditional,
    );
  }

  async findAllActive(transaction?: ITransaction): Promise<Question[]> {
    const session = this.getSession(transaction);
    const docs = await this.model
      .find({ isActive: true })
      .sort({ order: 1 })
      .session(session ?? null)
      .exec();
    return docs.map((doc) => this.formatQuestionDocument(doc));
  }

  async findByCategory(categoryId: string, transaction?: ITransaction): Promise<Question[]> {
    const session = this.getSession(transaction);
    const docs = await this.model
      .find({ categoryId, isActive: true })
      .sort({ order: 1 })
      .session(session ?? null)
      .exec();
    return docs.map((doc) => this.formatQuestionDocument(doc));
  }

  async findById(id: string, transaction?: ITransaction): Promise<Question | null> {
    const session = this.getSession(transaction);
    const doc = await this.model
      .findById(id)
      .session(session ?? null)
      .exec();
    return doc ? this.formatQuestionDocument(doc) : null;
  }

  async save(entity: Question, transaction?: ITransaction): Promise<Question> {
    const session = this.getSession(transaction);

    if (entity.id) {
      // Update
      const doc = await this.model
        .findByIdAndUpdate(entity.id, entity, { new: true })
        .session(session ?? null)
        .exec();

      if (!doc) throw new Error('Question not found');
      return this.formatQuestionDocument(doc);
    } else {
      // Create
      const doc = new this.model(entity);
      await doc.save({ session });
      return this.formatQuestionDocument(doc);
    }
  }

  async findChildren(parentQuestionId: string, transaction?: ITransaction): Promise<Question[]> {
    const session = this.getSession(transaction);
    const docs = await this.model
      .find({ parentQuestionId, isActive: true })
      .sort({ order: 1 })
      .session(session || null)
      .exec();
    
    return docs.map(doc => this.formatQuestionDocument(doc));
  }

  async findRootQuestions(transaction?: ITransaction): Promise<Question[]> {
    const session = this.getSession(transaction);
    const docs = await this.model
      .find({ parentQuestionId: { $exists: false }, isActive: true })
      .sort({ order: 1 })
      .session(session || null)
      .exec();
    
    return docs.map(doc => this.formatQuestionDocument(doc));
  }
}
