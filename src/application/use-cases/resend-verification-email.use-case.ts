import { NotFoundException, UnauthorizedException  } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { MailService } from '../../infrastructure/email/mailer.service';

export class ResendVerificationEmailUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailService: MailService,
  ) {}

  private COOLDOWN_MINUTES = 5;

  async execute(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.isEmailVerified) {
      throw new UnauthorizedException('El correo ya está verificado');
    }

    const now = new Date();
    const lastSent = user.lastVerificationEmailSentAt;
    if (
      lastSent &&
      now.getTime() - lastSent.getTime() < this.COOLDOWN_MINUTES * 60 * 1000
    ) {
      throw new UnauthorizedException(
        `Espera al menos ${this.COOLDOWN_MINUTES} minutos antes de reenviar el correo`,
      );
    }

    function generarNumeroDe6Digitos(): number {
      return Math.floor(Math.random() * 900000) + 100000;
    }

    // Generar nuevo token
    const newToken = `${generarNumeroDe6Digitos()}`;
    user.emailVerificationToken = newToken;
    user.lastVerificationEmailSentAt = now;

    await this.userRepo.update(user);
    await this.emailService.sendVerificationEmail(email, newToken);
  }
}
