import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  LoginUseCase,
  LoginUseCaseParams,
} from '../application/use-cases/login.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { DeviceGuard } from './guards/device.guard';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';
import { VerifyEmailUseCase } from '../application/use-cases/verify-email.use-case';
import { LoginDto } from './dtos/login.dto';
import { CreateUserDto } from './dtos/entitys/create-user.dto';
import { ResendVerificationEmailUseCase } from '../application/use-cases/resend-verification-email.use-case';
import { ResendVerificationDto } from './dtos/resend-verification.dto';
import { RequestPasswordResetDto } from './dtos/request-reset.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { RequestPasswordResetUseCase } from '../application/use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from '../application/use-cases/reset-password.use-case';
import { ConfirmDeviceChangeUseCase } from '../application/use-cases/confirm-device-change.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationUseCase: ResendVerificationEmailUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly confirmDeviceChangeUseCase: ConfirmDeviceChangeUseCase,
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto): Promise<LoginUseCaseParams> {
    return this.loginUseCase.execute(body.email, body.password, body.incomingDeviceId);
  }

  @UseGuards(JwtAuthGuard, DeviceGuard)
  @Post('logout')
  async logout(@Request() req) {
    await this.logoutUseCase.execute(req.user.id);
    return { message: 'Logout correcto' };
  }

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    await this.registerUseCase.execute(body);
    return {
      message: 'Registro exitoso, revisa tu correo para verificar tu cuenta',
    };
  }

  @Get('confirm-device')
  async confirmDevice(@Query('token') token: string) {
    let response = await this.confirmDeviceChangeUseCase.execute(token);
    return response;
  }

  @Get('verify-email')
  async verify(@Query('token') token: string) {
    await this.verifyEmailUseCase.execute(token);
    return { message: 'Correo verificado exitosamente' };
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: ResendVerificationDto) {
    await this.resendVerificationUseCase.execute(body.email);
    return { message: 'Correo de verificación reenviado' };
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() body: RequestPasswordResetDto) {
    await this.requestPasswordResetUseCase.execute(body.email);
    return {
      message:
        'Correo enviado con instrucciones para restablecer la contraseña',
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.resetPasswordUseCase.execute(body.token, body.newPassword);
    return { message: 'Contraseña restablecida correctamente' };
  }
}
