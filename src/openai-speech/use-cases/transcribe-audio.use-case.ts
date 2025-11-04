import { Injectable } from '@nestjs/common';
import { OpenAiSpeechService } from '../openai-speech.service';

@Injectable()
export class TranscribeAudioUseCase {
  constructor(private readonly speechService: OpenAiSpeechService) {}

  async execute(file: any) {
    return this.speechService.transcribeAudio(file);
  }
}
