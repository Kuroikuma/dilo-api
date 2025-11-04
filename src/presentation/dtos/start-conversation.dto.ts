import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StartConversationDto {
  @ApiProperty({
    example: 'Me gustaria aprender matemáticas:Calculo',
    description: 'Pregunta a la que se responderá el chat',
  })
  @IsString()
  question: string;

  @ApiProperty({
    example: 'primer grado',
    description: 'Nivel de conocimientos del usuario',
  })
  @IsString()
  level: string;
}
