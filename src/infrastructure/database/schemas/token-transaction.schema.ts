import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class TokenTransactionDocument extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  type: string; // usage, monthly_credit, manual_adjustment

  @Prop({ required: true })
  description: string;

  @Prop({ default: () => new Date() })
  created_at: Date;
}

export const TokenTransactionSchema = SchemaFactory.createForClass(TokenTransactionDocument);
