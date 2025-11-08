// category.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class CategoryDocument extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  order: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: () => new Date() })
  createdAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(CategoryDocument);