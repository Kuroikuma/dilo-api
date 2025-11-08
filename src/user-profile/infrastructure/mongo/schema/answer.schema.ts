// answer.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class UserAnswerDocument extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'QuestionDocument', required: true })
  questionId: Types.ObjectId;

  @Prop({ type: Object })
  answerValue: any;

  @Prop({ default: () => new Date() })
  answeredAt: Date;

  @Prop({ default: () => new Date() })
  updatedAt: Date;
}

export const UserAnswerSchema = SchemaFactory.createForClass(UserAnswerDocument);