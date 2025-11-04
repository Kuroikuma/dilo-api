import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({
    example: 'test@tubachi.io',
    description: 'Correo electrónico del nuevo usuario',
  })
  @IsEmail()
  email: string;
}
