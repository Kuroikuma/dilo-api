// src/chatkit/chatkit.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatKitSessionsService } from './chatkit-sessions.service';
import { ChatKitSessionsController } from './chatkit-sessions.controller';
import { UserMongoRepository } from '../infrastructure/repositories/user-mongo.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDocument, UserSchema } from '../infrastructure/database/schemas/user.schema';
import { UserProfileSummaryMongoRepository } from 'src/user-profile/infrastructure/mongo/repositories/user-profile-summary-mongo.repository';
import { UserProfileSummaryDocument, UserProfileSummarySchema } from 'src/user-profile/infrastructure/mongo/schema/user-profile-summary.schema';

@Module({
  imports: [ConfigModule, MongooseModule.forFeature([{ name: UserDocument.name, schema: UserSchema }]), MongooseModule.forFeature([{ name: UserProfileSummaryDocument.name, schema: UserProfileSummarySchema }])],
  providers: [
    UserMongoRepository,
    UserProfileSummaryMongoRepository,
    {
      provide: ChatKitSessionsService,
      useFactory: (configService: ConfigService, userRepo: UserMongoRepository, userProfileSummaryRepo: UserProfileSummaryMongoRepository) => {
        return new ChatKitSessionsService(configService, userRepo, userProfileSummaryRepo);
      },  
      inject: [ConfigService, UserMongoRepository, UserProfileSummaryMongoRepository],
    },
  ],
  controllers: [ChatKitSessionsController],
  exports: [ChatKitSessionsService],
})
export class ChatKitModule {}