import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

// ----- QuestionAnswerPair DTO -----

export class QuestionAnswerPairDto {
  @ApiProperty({
    description: 'The question text',
    example: 'What is your profession?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'The answer for the question. Can be any type.',
    example: 'Software Engineer',
  })
  @IsOptional()
  answer: any;

  @ApiProperty({
    description: 'Category of the question',
    example: 'personal',
  })
  @IsString()
  @IsNotEmpty()
  category: string;
}

// ----- GenerateProfileDto -----

export class GenerateProfileDto {
  @ApiProperty({
    description: 'User id to generate the profile for',
    example: 'f1a2b3c4-5678-90ab-cdef-1234567890ab',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'List of question-answer pairs',
    type: [QuestionAnswerPairDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerPairDto)
  questionAnswers: QuestionAnswerPairDto[];
}
