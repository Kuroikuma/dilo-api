export enum TokenTransactionType {
    USAGE = 'usage',
    MONTHLY_CREDIT = 'monthly_credit',
    MANUAL_ADJUSTMENT = 'manual_adjustment',
  }
  
  export class TokenTransaction {
    constructor(
      public readonly id: string,
      public userId: string,
      public amount: number,
      public type: TokenTransactionType,
      public description: string,
      public createdAt: Date
    ) {}
  }
  