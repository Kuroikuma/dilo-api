import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';
import { CreateCategoryDto } from './create-category.dto';


export class CreateCategoryWithQuestionsDto {
  @ApiProperty({
    description: 'Información de la categoría que se creará',
    type: () => CreateCategoryDto,
  })
  @ValidateNested()
  @Type(() => CreateCategoryDto)
  readonly category: CreateCategoryDto;

  @ApiProperty({
    description: 'Listado de preguntas pertenecientes a la categoría',
    type: () => [CreateQuestionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  readonly questions: CreateQuestionDto[];
}
