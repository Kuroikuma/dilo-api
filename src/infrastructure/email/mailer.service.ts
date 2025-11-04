// src/mailer/mailer.service.ts

import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

interface IMailOptions {
  to: string;
  subject: string;
  template: string;
  context: any;
}

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(to: string, name: string) {
    await this.mailerService.sendMail({
      to,
      subject: '¡Bienvenido a Tubachi!',
      template: './welcome', // `src/mailer/templates/welcome.hbs`
      context: {
        name, // se usará en la plantilla
      },
    });
  }

  async sendPlainText(to: string, subject: string, body: string) {
    await this.mailerService.sendMail({
      to,
      subject,
      text: body,
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Verifica tu cuenta',
      template: './verificationEmail', // `src/mailer/templates/verification.hbs`
      context: {
        token, // se usará en la plantilla
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const baseUrl = `${process.env.DOMAIN_WEB}/reset-password`;
    const resetUrl = `${baseUrl}?token=${token}`;

    await this.mailerService.sendMail({
      to,
      subject: 'Restablece tu contraseña',
      template: './passwordResetEmail', // `src/mailer/templates/password-reset.hbs`
      context: {
        resetUrl, // se usará en la plantilla
      },
    });
  }

  async sendMail({ to, subject, template, context }: IMailOptions) {
    await this.mailerService.sendMail({
      to,
      subject,
      template: `./${template}`, // `src/mailer/templates/${template}.hbs`
      context,
    });
  }
}
