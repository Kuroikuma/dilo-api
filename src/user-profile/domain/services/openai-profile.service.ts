import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { QuestionAnswerPairDto } from '../../application/dtos/generate-profile.dto';
import { LearningProfile } from '../entities/user-profile.entity';

@Injectable()
export class OpenAIPProfileService {
  private readonly logger = new Logger(OpenAIPProfileService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateUserProfile(questionAnswers: QuestionAnswerPairDto[]): Promise<{
    profileText: string;
    learningProfile: LearningProfile;
  }> {
    const prompt = this.buildProfilePrompt(questionAnswers);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente especializado en crear perfiles detallados de estudiantes de inglés. 
            Analiza las respuestas del usuario y genera:
            1. Un perfil de texto completo en español que resuma sus características como aprendiz de inglés.
            2. Un objeto JSON estructurado con los siguientes campos:
               - level: "beginner" | "elementary" | "intermediate" | "upper-intermediate" | "advanced"
               - interests: array de strings (máx 5 intereses principales)
               - goals: array de strings (máx 3 objetivos principales)
               - learningStyle: descripción corta del estilo de aprendizaje preferido
               - motivation: array de strings (factores motivacionales)
               - challenges: array de strings (desafíos o dificultades)
               - preferredTopics: array de strings (temas preferidos para conversación)
               - conversationStyle: estilo de conversación preferido
               - personalContext: contexto personal relevante
            
            Responde EXCLUSIVAMENTE con un objeto JSON válido que tenga esta estructura:
            {
              "profileText": "texto completo del perfil aquí...",
              "learningProfile": { ... }
            }`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0].message.content;
      
      if (!response) {
        throw new Error('OpenAI response is empty');
      }

      // Parsear la respuesta JSON
      const parsedResponse = JSON.parse(response);
      
      return {
        profileText: parsedResponse.profileText,
        learningProfile: parsedResponse.learningProfile
      };

    } catch (error) {
      this.logger.error('Error generating profile with OpenAI:', error);
      // Fallback a perfil básico si OpenAI falla
      return this.generateFallbackProfile(questionAnswers);
    }
  }

  private buildProfilePrompt(questionAnswers: QuestionAnswerPairDto[]): string {
    let prompt = `Por favor, analiza las siguientes respuestas de un estudiante de inglés y genera un perfil detallado:\n\n`;

    questionAnswers.forEach(qa => {
      prompt += `CATEGORÍA: ${qa.category}\n`;
      prompt += `PREGUNTA: ${qa.question}\n`;
      prompt += `RESPUESTA: ${this.formatAnswer(qa.answer)}\n\n`;
    });

    prompt += `\nBasándote en estas respuestas, genera un perfil completo que incluya:
    - Nivel estimado de inglés
    - Intereses y pasatiempos relevantes para el aprendizaje
    - Objetivos específicos con el idioma
    - Estilo de aprendizaje preferido
    - Factores motivacionales
    - Posibles desafíos
    - Temas de conversación preferidos
    - Contexto personal que afecte el aprendizaje`;

    return prompt;
  }

  private formatAnswer(answer: any): string {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    if (typeof answer === 'boolean') {
      return answer ? 'Sí' : 'No';
    }
    if (answer === null || answer === undefined) {
      return 'No respondió';
    }
    return String(answer);
  }

  private generateFallbackProfile(questionAnswers: QuestionAnswerPairDto[]): {
    profileText: string;
    learningProfile: LearningProfile;
  } {
    // Lógica básica para generar un perfil sin OpenAI
    const interests = this.extractInterests(questionAnswers);
    const goals = this.extractGoals(questionAnswers);
    
    return {
      profileText: `Perfil básico del estudiante. Intereses: ${interests.join(', ')}. Objetivos: ${goals.join(', ')}.`,
      learningProfile: {
        level: 'intermediate',
        interests,
        goals,
        learningStyle: 'Mixto',
        motivation: ['Mejora profesional'],
        challenges: ['Falta de práctica constante'],
        preferredTopics: ['Tecnología', 'Viajes'],
        conversationStyle: 'Neutral',
        personalContext: 'Estudiante o profesional interesado en mejorar su inglés'
      }
    };
  }

  private extractInterests(questionAnswers: QuestionAnswerPairDto[]): string[] {
    const interests: string[] = [];
    
    questionAnswers.forEach(qa => {
      if (qa.category.includes('Intereses') && qa.answer) {
        if (Array.isArray(qa.answer)) {
          interests.push(...qa.answer);
        } else {
          interests.push(qa.answer);
        }
      }
    });

    return interests.slice(0, 5);
  }

  private extractGoals(questionAnswers: QuestionAnswerPairDto[]): string[] {
    const goals: string[] = [];
    
    questionAnswers.forEach(qa => {
      if (qa.category.includes('Objetivos') && qa.answer) {
        if (Array.isArray(qa.answer)) {
          goals.push(...qa.answer);
        } else {
          goals.push(qa.answer);
        }
      }
    });

    return goals.slice(0, 3);
  }
}