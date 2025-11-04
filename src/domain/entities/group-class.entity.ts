export class GroupClass {
  constructor(
    public readonly id: string,
    public userId: string,
    public name: string,
    public createdAt: Date,
    public updatedAt: Date,
    public description?: string,
  ) {}
}
