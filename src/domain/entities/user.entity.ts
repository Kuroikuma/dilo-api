export enum Plan {
  FREE = 'FREE',
  PLUS = 'PLUS',
  PRO = 'PRO',
}

export const PlanTokensLimit = {
  [Plan.FREE]: 1000,
  [Plan.PLUS]: 4000,
  [Plan.PRO]: 8000,
};

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public password: string,
    public name: string,
    public surname: string,
    public tokenBalance: number,
    public planId: string,
    public lastTokenReset: Date = new Date(),
    public isEmailVerified: boolean = false,
    public emailVerificationToken?: string,
    public lastVerificationEmailSentAt?: Date,
    public resetPasswordToken?: string,
    public resetPasswordTokenExpiresAt?: Date,
    public deviceId?: string,
    public deviceChangeToken?: string, // Token para confirmar el cambio de dispositivo
    public deviceChangeTokenExpiresAt?: Date, // Fecha de expiración del token
    public pendingNewDeviceId?: string, // El ID del nuevo dispositivo que se está intentando autorizar
   
  ) {}

  consumeTokens(amount: number): void {
    if (this.tokenBalance < amount) {
      throw new Error('No tienes suficientes tokens');
    }

    this.tokenBalance -= amount;
  }
}
