import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatKitModule } from './chatkit/chatkit.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ ConfigModule.forRoot({ isGlobal: true }),ChatKitModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
