export class Message {
  constructor(
    public role: 'user' | 'assistant',
    public content: string,
    public timestamp: Date,
  ) {}
}

export class ClassSession  {
  constructor(
    public readonly id: string,
    public userId: string,
    public title: string,
    public basePrompt: string,
    public messages: Message[],
    public createdAt: Date,
    public updatedAt: Date,
    public level: string,
  ) {}
}
