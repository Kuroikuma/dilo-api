import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AskInClassDto {
  @ApiProperty({
    example: 'Me gustaria aprender matemáticas:Calculo',
    description: 'Pregunta a la que se responderá el chat',
  })
  @IsString()
  question: string;
}
