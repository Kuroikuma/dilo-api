import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { promptClassifier } from './prompt ';

@Injectable()
export class AiClassifierService {
  private openai: OpenAI;

  constructor(private config: ConfigService) {
    this.openai = new OpenAI({ apiKey: config.get<string>('OPENAI_API_KEY') });
  }

  async extractSubjectAndTopic(question: string, level: string): Promise<{ subject: string; topic: string }> {
    const prompt = promptClassifier(question);

    const res = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const jsonStr = res.choices[0].message.content;

    try {
      const data = JSON.parse(jsonStr ?? '{}');
      // if (!data.subject || !data.topic) throw new Error('No se pudo extraer correctamente');
      return data;
    } catch (err) {
      throw new Error('Error al analizar la materia y el tema');
    }
  }
}
