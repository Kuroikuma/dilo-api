import { UserRepository } from '../../domain/repositories/user.repository';

export class LogoutUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    user.deviceId = undefined;
    await this.userRepo.update(user);
  }
}
