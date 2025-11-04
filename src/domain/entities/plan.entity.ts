export class Plan {
    constructor(
      public readonly id: string,
      public name: string,
      public tokensPerMonth: number,
      public priceUsd: number,
      public features: string[],
      public isActive: boolean,
      public planId: number,
    ) {}
  }
  