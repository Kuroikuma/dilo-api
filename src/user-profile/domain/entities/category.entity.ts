// category.entity.ts
export class Category {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public order: number,
    public isActive: boolean = true,
    public createdAt: Date = new Date(),
  ) {}
}