import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../domain/repositories/user.repository';

export class ResetPasswordUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(token: string, newPassword: string) {
    const user = await this.userRepo.findByResetToken(token);
    if (!user) throw new Error('Token inválido');

    if (!user.resetPasswordTokenExpiresAt || user.resetPasswordTokenExpiresAt < new Date()) {
      throw new Error('El token ha expirado');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiresAt = undefined;

    await this.userRepo.update(user);
  }
}
