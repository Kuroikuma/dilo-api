import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Message } from '../../../domain/entities/class-session.entity';

@Schema({ timestamps: true })
export class Thread extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  threadId: string; // ID del thread de OpenAI

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  assistantId?: string;

  @Prop({ type: [Message], required: true })
  messages: Message[];

  @Prop({required: true})
  title: string;
}

export const ThreadSchema = SchemaFactory.createForClass(Thread);