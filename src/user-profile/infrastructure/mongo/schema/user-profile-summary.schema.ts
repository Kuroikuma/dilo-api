import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class LearningProfileSchema {
  @Prop({ required: true })
  level: string;

  @Prop({ type: [String], required: true })
  interests: string[];

  @Prop({ type: [String], required: true })
  goals: string[];

  @Prop({ required: true })
  learningStyle: string;

  @Prop({ type: [String], required: true })
  motivation: string[];

  @Prop({ type: [String], required: true })
  challenges: string[];

  @Prop({ type: [String], required: true })
  preferredTopics: string[];

  @Prop({ required: true })
  conversationStyle: string;

  @Prop({ required: true })
  personalContext: string;
}

@Schema()
export class UserProfileSummaryDocument extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  profileText: string;

  @Prop({ type: LearningProfileSchema, required: true })
  learningProfile: LearningProfileSchema;

  @Prop({ default: () => new Date() })
  lastUpdated: Date;

  @Prop({ default: 1 })
  version: number;
}

export const UserProfileSummarySchema = SchemaFactory.createForClass(UserProfileSummaryDocument);