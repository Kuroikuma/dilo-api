import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { CategoryRepository } from '../../../domain/repositories/category.repository';
import { Category } from '../../../domain/entities/category.entity';
import { CategoryDocument } from '../schema/category.schema';

@Injectable()
export class CategoryMongoRepository implements CategoryRepository {
  constructor(
    @InjectModel(CategoryDocument.name) private readonly model: Model<CategoryDocument>,
  ) {}

  private formatCategoryDocument(cat: CategoryDocument): Category {
    return new Category(
      cat._id?.toString() || '',
      cat.name,
      cat.description,
      cat.order,
      cat.isActive,
      cat.createdAt,
    );
  }

  async findAllActive(session?: ClientSession): Promise<Category[]> {
    const docs = await this.model.find({ isActive: true }).sort({ order: 1 }).session(session ?? null).exec();
    return docs.map(doc => this.formatCategoryDocument(doc));
  }

  async findById(id: string, session?: ClientSession): Promise<Category | null> {
    const doc = await this.model.findById(id).session(session ?? null).exec();
    return doc ? this.formatCategoryDocument(doc) : null;
  }

  async create(category: Partial<Category>, session?: ClientSession): Promise<Category> {
    const doc = new this.model(category);
    await doc.save({ session });
    return this.formatCategoryDocument(doc);
  }

  async update(category: Category, session?: ClientSession): Promise<void> {
    await this.model.findByIdAndUpdate(category.id, category, { session });
  }
}