import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Message } from '../../../domain/entities/class-session.entity';

@Schema()
export class ClassSessionDocument extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  level: string;

  @Prop({ required: true })
  basePrompt: string;

  @Prop({ type: [Message], required: true })
  messages: Message[];

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const ClassSessionSchema = SchemaFactory.createForClass(ClassSessionDocument);
