import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @ApiProperty({
    description: 'Identificador de la pregunta',
    example: 'qst_12345',
  })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    description: 'Valor de la respuesta (puede ser texto, número, booleano, etc.)',
    example: 'Sí',
  })
  @IsDefined()
  answerValue: any;
}

export class SaveAnswersDto {
  @ApiProperty({
    description: 'Lista de respuestas del usuario',
    type: [AnswerDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
