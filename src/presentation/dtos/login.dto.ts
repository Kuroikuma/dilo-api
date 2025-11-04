import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'test@tubachi.io',
    description: 'Correo electrónico del nuevo usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SuperSecure123!',
    description: 'Contraseña del usuario. Debe tener mínimo 6 caracteres',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'device-id-12345',
    description: 'ID del dispositivo que se está usando para iniciar sesión',
  })
  @IsString()
  incomingDeviceId: string;
}
