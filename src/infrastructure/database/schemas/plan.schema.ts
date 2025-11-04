import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class PlanDocument extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  tokensPerMonth: number;

  @Prop({ required: true })
  priceUsd: Types.Decimal128;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  planId: number;
}

export const PlanSchema = SchemaFactory.createForClass(PlanDocument);
