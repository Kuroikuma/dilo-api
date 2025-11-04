import { IsString, IsOptional } from 'class-validator';

export class SynthesizeSpeechDto {
  @IsString()
  text: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  voice?: string; // e.g. "nova" o "alloy"
}
