import { UserRepository } from '../../domain/repositories/user.repository';

export class VerifyEmailUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(token: string) {
    const user = await this.userRepo.findByVerificationToken(token);
    if (!user) throw new Error('Token inválido');

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await this.userRepo.update(user);
  }
}
