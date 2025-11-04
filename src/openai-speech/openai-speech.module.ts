import { Module } from '@nestjs/common';
import { OpenAiSpeechController } from './openai-speech.controller';
import { OpenAiSpeechService } from './openai-speech.service';
import { TranscribeAudioUseCase } from './use-cases/transcribe-audio.use-case';
import { SynthesizeSpeechUseCase } from './use-cases/synthesize-speech.use-case';
import { ConsumeTokensUseCase } from '../application/use-cases/consume-tokens.use-case';
import { UserMongoRepository } from '../infrastructure/repositories/user-mongo.repository';
import { TokenTransactionMongoRepository } from '../infrastructure/repositories/token-transaction-mongo.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDocument, UserSchema } from '../infrastructure/database/schemas/user.schema';
import {
  TokenTransactionDocument,
  TokenTransactionSchema,
} from '../infrastructure/database/schemas/token-transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
      { name: TokenTransactionDocument.name, schema: TokenTransactionSchema },
    ]),
  ],
  controllers: [OpenAiSpeechController],
  providers: [
    OpenAiSpeechService,
    TranscribeAudioUseCase,
    SynthesizeSpeechUseCase,
    UserMongoRepository,
    TokenTransactionMongoRepository,
    {
      provide: ConsumeTokensUseCase,
      useFactory: (repo: UserMongoRepository, tokenRepo: TokenTransactionMongoRepository) =>
        new ConsumeTokensUseCase(repo, tokenRepo),
      inject: [UserMongoRepository, TokenTransactionMongoRepository],
    },
  ],
})
export class OpenAiSpeechModule {}
