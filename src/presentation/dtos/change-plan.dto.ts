import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ChangePlanDto {
  @ApiProperty({
    example: '2454545887878787',
    description: 'Id del plan a cambiar',
  })
  @IsString()
  planId: string;

  @ApiProperty({
    example: 'No puedo comprar este plan',
    description: 'Razón del cambio de plan',
  })
  @IsString()
  reason: string;

  @IsEmail() 
  email: string;
}
