import { Injectable } from '@nestjs/common';
import { OpenAiSpeechService } from '../openai-speech.service';
import { SynthesizeSpeechDto } from '../dto/synthesize-speech.dto';

@Injectable()
export class SynthesizeSpeechUseCase {
  constructor(private readonly speechService: OpenAiSpeechService) {}

  async execute(dto: SynthesizeSpeechDto) {
    return this.speechService.synthesizeSpeech(dto);
  }
}
