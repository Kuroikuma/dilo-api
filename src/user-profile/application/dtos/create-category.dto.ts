import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Tecnología',
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: 'Descripción de la categoría',
    example: 'Artículos y recursos sobre tecnología moderna.',
    required: false,
  })
  @IsString()
  readonly description: string;

  @ApiProperty({
    description: 'Orden de aparición de la categoría (debe ser un número entero positivo)',
    example: 1,
  })
  @IsInt()
  @Min(0)
  readonly order: number;
}
