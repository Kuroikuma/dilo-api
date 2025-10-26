// src/chatkit/chatkit.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatKitSessionsService } from './chatkit-sessions.service';
import { ChatKitSessionsController } from './chatkit-sessions.controller';

@Module({
  imports: [ConfigModule],
  providers: [ChatKitSessionsService],
  controllers: [ChatKitSessionsController],
  exports: [ChatKitSessionsService],
})
export class ChatKitModule {}