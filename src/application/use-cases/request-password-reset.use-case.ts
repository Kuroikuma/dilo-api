import { MailService } from '../../infrastructure/email/mailer.service';
import { UserRepository } from '../../domain/repositories/user.repository';
import { v4 as uuidv4 } from 'uuid';

export class RequestPasswordResetUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailService: MailService,
  ) {}

  async execute(email: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error('Usuario no encontrado');

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutos

    user.resetPasswordToken = token;
    user.resetPasswordTokenExpiresAt = expiresAt;

    await this.userRepo.update(user);
    await this.emailService.sendPasswordResetEmail(email, token);
  }
}
