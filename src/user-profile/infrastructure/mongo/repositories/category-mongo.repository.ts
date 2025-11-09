import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { ICategoryRepository } from '../../../domain/repositories/category.repository';
import { Category } from '../../../domain/entities/category.entity';
import { CategoryDocument } from '../schema/category.schema';
import { ITransaction } from '../../../domain/repositories/transaction.interface';
import { MongoTransaction } from '../mongo-unit-of-work';

@Injectable()
export class CategoryMongoRepository implements ICategoryRepository {
  constructor(
    @InjectModel(CategoryDocument.name)
    private readonly model: Model<CategoryDocument>,
  ) {}

  private getSession(transaction?: ITransaction) {
    return transaction && transaction instanceof MongoTransaction ? transaction.getSession() : undefined;
  }

  private formatCategoryDocument(cat: CategoryDocument): Category {
    return new Category(cat._id?.toString() || '', cat.name, cat.description, cat.order, cat.isActive, cat.createdAt);
  }

  async findAll(transaction?: ITransaction): Promise<Category[]> {
    const session = this.getSession(transaction);
    const docs = await this.model
      .find()
      .session(session || null)
      .exec();

    return docs.map((doc) => this.formatCategoryDocument(doc)) as Category[];
  }

  async delete(id: string, transaction?: ITransaction): Promise<void> {
    const session = this.getSession(transaction);
    await this.model
      .findByIdAndDelete(id)
      .session(session || null)
      .exec();
  }

  async findAllActive(transaction?: ITransaction): Promise<Category[]> {
    const session = this.getSession(transaction);
    const docs = await this.model
      .find({ isActive: true })
      .sort({ order: 1 })
      .session(session || null)
      .exec();

    return docs.map((doc) => this.formatCategoryDocument(doc)) as Category[];
  }

  async findById(id: string, transaction?: ITransaction): Promise<Category | null> {
    const session = this.getSession(transaction);
    const doc = await this.model
      .findById(id)
      .session(session || null)
      .exec();

    return doc ? this.formatCategoryDocument(doc) : null;
  }

  async save(entity: Category, transaction?: ITransaction): Promise<Category> {
    const session = this.getSession(transaction);

    if (entity.id) {
      // Update
      const doc = await this.model
        .findByIdAndUpdate(entity.id, entity, { new: true })
        .session(session || null)
        .exec();

      if (!doc) throw new Error('Category not found');
      return this.formatCategoryDocument(doc);
    } else {
      // Create
      const doc = new this.model(entity);
      await doc.save({ session });
      return this.formatCategoryDocument(doc);
    }
  }
}
