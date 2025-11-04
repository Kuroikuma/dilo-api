import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat';

@Injectable()
export class AiCourseService {
  private openai: OpenAI;

  constructor(private config: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateResponse(
    prompt: string,
    // ahora usamos el tipo correcto
    messages: ChatCompletionMessageParam[],
  ): Promise<string> {
    // construimos el mensaje de sistema
    const systemMessage: ChatCompletionMessageParam = {
      role: 'system',
      content: prompt,
    };


    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  }
}
