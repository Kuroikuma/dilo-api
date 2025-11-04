import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: '1234567890',
    description: 'Token de reseteo de contraseña',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: '1234567890',
    description: 'Nueva contraseña',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
