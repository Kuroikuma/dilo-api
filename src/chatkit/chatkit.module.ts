// src/chatkit/chatkit.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatKitSessionsService } from './chatkit-sessions.service';
import { ChatKitSessionsController } from './chatkit-sessions.controller';
import { UserMongoRepository } from '../infrastructure/repositories/user-mongo.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDocument, UserSchema } from '../infrastructure/database/schemas/user.schema';

@Module({
  imports: [ConfigModule, MongooseModule.forFeature([{ name: UserDocument.name, schema: UserSchema }])],
  providers: [
    UserMongoRepository,
    {
      provide: ChatKitSessionsService,
      useFactory: (userRepo: UserMongoRepository, configService: ConfigService) => new ChatKitSessionsService(configService, userRepo),
      inject: [UserMongoRepository, ConfigService],
    },
  ],
  controllers: [ChatKitSessionsController],
  exports: [ChatKitSessionsService],
})
export class ChatKitModule {}