import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import type { IUnitOfWork } from '../../domain/repositories/transaction.interface';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import type { IQuestionRepository } from '../../domain/repositories/question.repository';
import { Question } from '../../domain/entities/question.entity';
import { CreateQuestionDto } from '../dtos/create-question.dto';
import { CATEGORY_REPOSITORY, QUESTION_REPOSITORY, UNIT_OF_WORK } from '../../domain/repositories/repository.tokens';

@Injectable()
export class AddQuestionsToCategoryUseCase {
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: ICategoryRepository,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepo: IQuestionRepository,
  ) {}

  async execute(categoryId: string, questionsDto: CreateQuestionDto[]): Promise<Question[]> {
    return this.unitOfWork.withTransaction(async (transaction) => {
      // 1. Validar que la categoría existe
      const category = await this.categoryRepo.findById(categoryId, transaction);
      if (!category) {
        throw new HttpException(
          `Categoría con ID ${categoryId} no encontrada`,
          HttpStatus.NOT_FOUND
        );
      }

      // 2. Obtener preguntas existentes para validar órdenes duplicados
      const existingQuestions = await this.questionRepo.findByCategory(categoryId, transaction);
      const existingOrders = new Set(existingQuestions.map(q => q.order));

      // 3. Validar y crear las preguntas
      const savedQuestions: Question[] = [];
      
      for (const questionDto of questionsDto) {
        // Validar orden único
        if (existingOrders.has(questionDto.order)) {
          throw new HttpException(
            `Ya existe una pregunta con el orden ${questionDto.order} en esta categoría`,
            HttpStatus.BAD_REQUEST
          );
        }

        // Validar pregunta padre si se especifica
        if (questionDto.parentQuestionId) {
          const parentQuestion = await this.questionRepo.findById(questionDto.parentQuestionId, transaction);
          if (!parentQuestion) {
            throw new HttpException(
              `La pregunta padre con ID ${questionDto.parentQuestionId} no existe`,
              HttpStatus.BAD_REQUEST
            );
          }

          if (parentQuestion.categoryId !== categoryId) {
            throw new HttpException(
              `La pregunta padre debe pertenecer a la misma categoría`,
              HttpStatus.BAD_REQUEST
            );
          }
        }

        // Validar opciones para tipos que las requieren
        if (['select', 'radio', 'multiselect'].includes(questionDto.type) && 
            (!questionDto.options || questionDto.options.length === 0)) {
          throw new HttpException(
            `Las preguntas de tipo ${questionDto.type} deben tener opciones definidas`,
            HttpStatus.BAD_REQUEST
          );
        }

        const question = new Question(
          '',
          questionDto.questionText,
          categoryId,
          questionDto.type,
          questionDto.order,
          questionDto.isRequired,
          questionDto.options,
          questionDto.placeholder,
          questionDto.helperText,
          questionDto.validationRules,
          true,
          new Date(),
          questionDto.parentQuestionId,
          questionDto.condition ? {
            parentQuestionId: questionDto.parentQuestionId!,
            operator: questionDto.condition.operator,
            expectedValue: questionDto.condition.expectedValue,
          } : undefined,
          !!questionDto.parentQuestionId,
        );

        const savedQuestion = await this.questionRepo.save(question, transaction);
        savedQuestions.push(savedQuestion);
        existingOrders.add(questionDto.order); // Actualizar órdenes existentes para siguientes iteraciones
      }

      return savedQuestions;
    });
  }
}