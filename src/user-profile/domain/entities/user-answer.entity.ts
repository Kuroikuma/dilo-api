export class UserAnswer {
  constructor(
    public readonly id: string,
    public userId: string,
    public questionId: string,
    public answerValue: any,
    public answeredAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}