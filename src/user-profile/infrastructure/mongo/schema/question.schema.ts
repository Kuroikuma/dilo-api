// question.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { QuestionType } from '../../../domain/entities/question.entity';

@Schema()
export class QuestionDocument extends Document {
  @Prop({ required: true })
  questionText: string;

  @Prop({ type: Types.ObjectId, ref: 'CategoryDocument', required: true })
  categoryId: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: ['text', 'number', 'select', 'multiselect', 'radio', 'boolean', 'email', 'date'], 
    default: 'text'
  })
  type: string;

  @Prop({ required: true })
  order: number;

  @Prop({ default: false })
  isRequired: boolean;

  @Prop({ type: [String], default: [] })
  options: string[];

  @Prop()
  placeholder: string;

  @Prop()
  helperText: string;

  @Prop({ type: Object })
  validationRules: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: () => new Date() })
  createdAt: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(QuestionDocument);