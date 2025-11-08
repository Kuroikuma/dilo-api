import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class UserDocument extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  surname: string;

  @Prop({ type: Types.ObjectId, required: true })
  planId: Types.ObjectId;

  @Prop({ default: 1000 })
  tokenBalance: number;

  @Prop({ default: () => new Date() })
  lastTokenReset: Date;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  emailVerificationToken?: string;

  @Prop({ default: null })
  lastVerificationEmailSentAt?: Date;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordTokenExpiresAt?: Date;

  @Prop()
  deviceId?: string;

  @Prop()
  deviceChangeToken?: string;

  @Prop()
  deviceChangeTokenExpiresAt?: Date;

  @Prop()
  pendingNewDeviceId?: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
