import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Operator, QuestionType } from '../../domain/entities/question.entity';

class ConditionDto {
  @ApiProperty({
    description: 'Operador lógico de la condición',
    enum: Operator,
    example: Operator.EQUALS,
  })
  @IsNotEmpty()
  @IsString()
  operator: Operator;

  @ApiProperty({
    description: 'Valor esperado para cumplir la condición',
    example: 'Sí',
  })
  expectedValue: any;
}

export class CreateQuestionDto {
  @ApiProperty({
    description: 'Texto de la pregunta',
    example: '¿Cuál es tu lenguaje de programación favorito?',
  })
  @IsString()
  @IsNotEmpty()
  readonly questionText: string;

  @ApiProperty({
    description: 'Identificador de la categoría a la que pertenece la pregunta',
    example: 'cat_12345',
  })
  @IsString()
  @IsNotEmpty()
  readonly categoryId: string;

  @ApiProperty({
    description: 'Tipo de pregunta',
    enum: QuestionType,
    example: QuestionType.MULTISELECT,
  })
  @IsEnum(QuestionType)
  readonly type: QuestionType;

  @ApiProperty({
    description: 'Orden en el que aparece la pregunta',
    example: 1,
  })
  @IsInt()
  @Min(0)
  readonly order: number;

  @ApiPropertyOptional({
    description: 'Indica si la pregunta es obligatoria',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly isRequired?: boolean = false;

  @ApiPropertyOptional({
    description: 'Lista de opciones (para preguntas de tipo selección)',
    example: ['JavaScript', 'Python', 'Go'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  readonly options?: string[];

  @ApiPropertyOptional({
    description: 'Texto de marcador de posición (placeholder)',
    example: 'Escribe tu respuesta aquí...',
  })
  @IsOptional()
  @IsString()
  readonly placeholder?: string;

  @ApiPropertyOptional({
    description: 'Texto de ayuda o aclaración para el usuario',
    example: 'Puedes seleccionar más de una opción.',
  })
  @IsOptional()
  @IsString()
  readonly helperText?: string;

  @ApiPropertyOptional({
    description: 'Reglas de validación adicionales',
    example: { minLength: 3, maxLength: 100 },
    type: Object,
  })
  @IsOptional()
  @IsObject()
  readonly validationRules?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'ID de la pregunta padre (si existe)',
    example: 'qst_98765',
  })
  @IsOptional()
  @IsString()
  readonly parentQuestionId?: string;

  @ApiPropertyOptional({
    description: 'Condición que determina si esta pregunta debe mostrarse',
    type: () => ConditionDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConditionDto)
  readonly condition?: ConditionDto;
}
