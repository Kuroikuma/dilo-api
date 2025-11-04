import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class UserPlanHistoryDocument extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  planId: Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate?: Date;

  @Prop()
  changeReason?: string;

  @Prop()
  tilopayTransactionId?: string;
}

export const UserPlanHistorySchema = SchemaFactory.createForClass(UserPlanHistoryDocument);
