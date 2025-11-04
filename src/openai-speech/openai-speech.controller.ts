import { Controller, Post, UploadedFile, Body, UseInterceptors, Res, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TranscribeAudioUseCase } from './use-cases/transcribe-audio.use-case';
import { SynthesizeSpeechUseCase } from './use-cases/synthesize-speech.use-case';
import { SynthesizeSpeechDto } from './dto/synthesize-speech.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../presentation/guards/jwt-auth.guard';
import { DeviceGuard } from '../presentation/guards/device.guard';

// @UseGuards(JwtAuthGuard, DeviceGuard)
@Controller('openai/speech')
export class OpenAiSpeechController {
  constructor(
    private readonly transcribeAudio: TranscribeAudioUseCase,
    private readonly synthesizeSpeech: SynthesizeSpeechUseCase,
  ) {}

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('file'))
  async transcribe(@UploadedFile() file: Express.Multer.File) {
    return this.transcribeAudio.execute(file);
  }

  @Post('synthesize')
  async synthesize(@Body() dto: SynthesizeSpeechDto, @Res() res: Response) {
    const { stream, contentType } = await this.synthesizeSpeech.execute(dto);

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': 'inline; filename="speech.wav"',
    });

    stream.pipe(res);
  }
}
