import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto } from '../../presentation/dtos/entitys/create-user.dto';
import { MailService } from '../../infrastructure/email/mailer.service';
import { HttpException } from '@nestjs/common';
import { UserPlanHistoryRepository } from '../../domain/repositories/user-plan-history.repository';
import { UserPlanHistory } from '../../domain/entities/user-plan-history.entity';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailService: MailService,
    private readonly historyRepo: UserPlanHistoryRepository,
  ) {}

  async execute(user: CreateUserDto) {
    const existing = await this.userRepo.findByEmail(user.email);
    if (existing) throw new HttpException('El correo ya está en uso', 400);

    function generarNumeroDe6Digitos(): number {
      return Math.floor(Math.random() * 900000) + 100000;
    }

    const hashed = await bcrypt.hash(user.password, 10);
    const token = `${generarNumeroDe6Digitos()}`;

    const lastTokenReset = new Date();
    lastTokenReset.setDate(lastTokenReset.getDate() + 30);

    let userSaved = await this.userRepo.create({
      ...user,
      password: hashed,
      isEmailVerified: false,
      emailVerificationToken: token,
      tokenBalance: 1000,
      planId: process.env.FREE_PLAN_ID as string,
      lastTokenReset,
    });

    const now = new Date();
    const reason = 'Registro inicial';

    await this.historyRepo.create(
      new UserPlanHistory(
        '',
        userSaved.id,
        process.env.FREE_PLAN_ID as string,
        now,
        null,
        reason,
      ),
    );

    await this.emailService.sendVerificationEmail(user.email, token);
  }
}
