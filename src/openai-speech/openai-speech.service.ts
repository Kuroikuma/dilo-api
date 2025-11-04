import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SynthesizeSpeechDto } from './dto/synthesize-speech.dto';
import OpenAI from 'openai';
import { Readable } from 'stream';


@Injectable()
export class OpenAiSpeechService {
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
     this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async transcribeAudio(file: any): Promise<any> {
       const stream = Readable.from(file.buffer);

    const transcription = await this.openai.audio.transcriptions.create({
      file: stream as any,
      model: 'whisper-1',
      
    });

    return transcription;
  }

  async synthesizeSpeech(dto: SynthesizeSpeechDto): Promise<{
  stream: Readable;
  contentType: string;
}> {
  const response = await this.openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    input: dto.text,
    voice: dto.voice || 'nova',
    instructions: `Speak in a ${dto.description} voice`,
    response_format: 'wav',
  });

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const stream = Readable.from(buffer);

  return {
    stream,
    contentType: 'audio/wav',
  };
}
}
