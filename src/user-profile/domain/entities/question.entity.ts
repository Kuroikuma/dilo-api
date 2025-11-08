// question.entity.ts
export enum QuestionType {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  RADIO = 'radio',
  BOOLEAN = 'boolean',
  EMAIL = 'email',
  DATE = 'date',
}

export class Question {
  constructor(
    public readonly id: string,
    public questionText: string,
    public categoryId: string,
    public type: QuestionType,
    public order: number,
    public isRequired: boolean = false,
    public options?: string[],
    public placeholder?: string,
    public helperText?: string,
    public validationRules?: Record<string, any>,
    public isActive: boolean = true,
    public createdAt: Date = new Date(),
  ) {}
}