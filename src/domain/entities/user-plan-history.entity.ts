export class UserPlanHistory {
    constructor(
      public readonly id: string,
      public userId: string,
      public planId: string,
      public startDate: Date,
      public endDate: Date | null,
      public changeReason?: string,
      public tilopayTransactionId?: string
    ) {}
  }
  