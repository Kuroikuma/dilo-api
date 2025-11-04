import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../domain/entities/user.entity';
import { MailService } from '../../infrastructure/email/mailer.service';
import { UserPlanHistoryRepository } from '../../domain/repositories/user-plan-history.repository';

export interface LoginUseCaseParams {
  token: string;
  deviceId: string;
  user: User;
}

export class LoginUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailService,
    private readonly historyRepo: UserPlanHistoryRepository,
  ) {}

  async execute(email: string, password: string, incomingDeviceId: string): Promise<any> {
    const user = await this.userRepo.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isEmailVerified) {
      throw new HttpException('Email no verificado', HttpStatus.BAD_REQUEST);
    }

    if (!incomingDeviceId) {
      throw new HttpException('Device ID no proporcionado', HttpStatus.BAD_REQUEST);
    }

    // Si el usuario ya tiene un deviceId y es diferente al actual
    if (user.deviceId && user.deviceId !== incomingDeviceId) {
      // 1. Generar y almacenar token de cambio de dispositivo
      user.deviceChangeToken = uuidv4();
      user.deviceChangeTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
      user.pendingNewDeviceId = incomingDeviceId;
      await this.userRepo.update(user);

      // 2. Enviar correo de confirmación
      const confirmLink = `${process.env.DOMAIN_BE}/auth/confirm-device?token=${user.deviceChangeToken}`;
      const resetPasswordLink = `${process.env.DOMAIN_WEB}/password-recovery`; // Asegúrate de tener este enlace

      await this.mailerService.sendMail({
        to: user.email,
        subject: '¡Inicio de Sesión en un Nuevo Dispositivo Detectado!',
        template: 'device-change-email', // Nombre de tu archivo .hbs sin la extensión
        context: {
          userName: user.name,
          deviceType: 'Desconocido', // Debes obtener esto del request (User-Agent, etc.)
          operatingSystem: 'Desconocido', // Debes obtener esto del request
          browser: 'Desconocido', // Debes obtener esto del request
          location: 'Desconocida', // Puedes usar un servicio de geolocalización de IP
          ipAddress: '0.0.0.0', // Debes obtener esto del request
          loginDateTime: new Date().toLocaleString(),
          currentDevice: user.deviceId, // Aquí deberías tener una forma de describir el dispositivo anterior
          confirmLink: confirmLink,
          resetPasswordLink: resetPasswordLink,
          currentYear: new Date().getFullYear(),
          appName: 'TuBaChi', // Reemplaza con el nombre real
        },
      });

      return { message: 'Se ha detectado un nuevo dispositivo. Por favor, revisa tu correo electrónico para confirmar el cambio.' };
    }

    const history = await this.historyRepo.findLastByUserId(user.id);

    // Si es el mismo dispositivo o el primer inicio de sesión
    user.deviceId = incomingDeviceId; // Actualiza o establece el deviceId
    await this.userRepo.update(user);

    const token = this.jwtService.sign({ ...user, expiresPlan: history?.endDate || null });
    return { token };
  }
}
