import { Injectable } from '@nestjs/common';
import { Condition, Question } from '../entities/question.entity';
import { UserAnswer } from '../entities/user-answer.entity';

@Injectable()
export class QuestionConditionService {
  evaluateCondition(condition: Condition, userAnswers: Map<string, UserAnswer>): boolean {
    const parentAnswer = userAnswers.get(condition.parentQuestionId);
    
    if (!parentAnswer) {
      return false;
    }

    const actualValue = parentAnswer.answerValue;

    switch (condition.operator) {
      case 'equals':
        return actualValue === condition.expectedValue;
      
      case 'contains':
        if (Array.isArray(actualValue)) {
          return actualValue.includes(condition.expectedValue);
        }
        return String(actualValue).includes(String(condition.expectedValue));
      
      case 'greater_than':
        return Number(actualValue) > Number(condition.expectedValue);
      
      case 'less_than':
        return Number(actualValue) < Number(condition.expectedValue);
      
      case 'in':
        if (Array.isArray(condition.expectedValue)) {
          return condition.expectedValue.includes(actualValue);
        }
        return false;
      
      case 'not_empty':
        if (Array.isArray(actualValue)) {
          return actualValue.length > 0;
        }
        return actualValue !== null && actualValue !== undefined && actualValue !== '';
      
      default:
        return false;
    }
  }

  getRelevantQuestions(allQuestions: Question[], userAnswers: UserAnswer[]): Question[] {
    const answersMap = new Map(userAnswers.map(answer => [answer.questionId, answer]));
    const relevantQuestions: Question[] = [];
    const processedQuestions = new Set<string>();

    // Primero procesamos las preguntas raíz
    const rootQuestions = allQuestions.filter(q => !q.parentQuestionId);
    relevantQuestions.push(...rootQuestions);
    rootQuestions.forEach(q => processedQuestions.add(q.id));

    // Luego procesamos recursivamente las preguntas condicionales
    let hasChanges = true;
    while (hasChanges) {
      hasChanges = false;
      
      for (const question of allQuestions) {
        if (processedQuestions.has(question.id) || !question.parentQuestionId) {
          continue;
        }

        if (processedQuestions.has(question.parentQuestionId)) {
          const shouldInclude = !question.condition || 
            this.evaluateCondition(question.condition, answersMap);
          
          if (shouldInclude) {
            relevantQuestions.push(question);
            processedQuestions.add(question.id);
            hasChanges = true;
          }
        }
      }
    }

    return relevantQuestions.sort((a, b) => a.order - b.order);
  }
}