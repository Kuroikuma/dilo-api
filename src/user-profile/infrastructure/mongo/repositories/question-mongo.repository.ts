import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { QuestionRepository } from '../../../domain/repositories/question.repository';
import { Question } from '../../../domain/entities/question.entity';
import { QuestionDocument } from '../schema/question.schema';

@Injectable()
export class QuestionMongoRepository implements QuestionRepository {
  constructor(
    @InjectModel(QuestionDocument.name) private readonly model: Model<QuestionDocument>,
  ) {}

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
    );
  }

  async findAllActive(session?: ClientSession): Promise<Question[]> {
    const docs = await this.model.find({ isActive: true }).sort({ order: 1 }).session(session ?? null).exec();
    return docs.map(doc => this.formatQuestionDocument(doc));
  }

  async findByCategory(categoryId: string, session?: ClientSession): Promise<Question[]> {
    const docs = await this.model.find({ categoryId, isActive: true }).sort({ order: 1 }).session(session ?? null).exec();
    return docs.map(doc => this.formatQuestionDocument(doc));
  }

  async findById(id: string, session?: ClientSession): Promise<Question | null> {
    const doc = await this.model.findById(id).session(session ?? null).exec();
    return doc ? this.formatQuestionDocument(doc) : null;
  }

  async create(question: Partial<Question>, session?: ClientSession): Promise<Question> {
    const doc = new this.model(question);
    await doc.save({ session });
    return this.formatQuestionDocument(doc);
  }

  async update(question: Question, session?: ClientSession): Promise<void> {
    await this.model.findByIdAndUpdate(question.id, question, { session });
  }
}