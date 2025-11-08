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

export enum Operator {
  EQUALS = 'equals',
  CONTAINS = 'contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  IN = 'in',
  NOT_EMPTY = 'not_empty',
}

export interface Condition {
  parentQuestionId: string;
  operator: Operator;
  expectedValue: any;
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

     // campos para preguntas condicionales
     public parentQuestionId?: string,
     public condition?: Condition,
     public isConditional: boolean = false,
  ) {}
}