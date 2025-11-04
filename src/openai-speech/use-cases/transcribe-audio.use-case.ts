import { Injectable } from '@nestjs/common';
import { OpenAiSpeechService } from '../openai-speech.service';

@Injectable()
export class TranscribeAudioUseCase {
  constructor(private readonly speechService: OpenAiSpeechService) {}

  async execute(file: Express.Multer.File) {
    return this.speechService.transcribeAudio(file);
  }
}
