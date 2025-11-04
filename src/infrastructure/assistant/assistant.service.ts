import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import OpenAI from 'openai';
import { Thread } from '../database/schemas/thread.schema';
import { CreateThreadDto, GenerateImageDto, SendMessageDto } from '../../presentation/dtos/create-thread.dto';
import { promptGenerateTitle } from '../ai/prompt ';
import { ConsumeTokensUseCase } from '../../application/use-cases/consume-tokens.use-case';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AssistantService {
  private openai: OpenAI;

  constructor(
    @InjectModel(Thread.name) private readonly threadModel: Model<Thread>,
    private configService: ConfigService,
    private firebaseService: FirebaseService,
    private readonly consumeTokensUseCase: ConsumeTokensUseCase, // ConfigService para acceder a las variables de entorno
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateTitle(userMessage: string) {
    const prompt = promptGenerateTitle(userMessage);
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 15,
      temperature: 0.2, // Baja aleatoriedad
    });
    return response.choices[0]?.message?.content?.trim() || '';
  }

  // Crear un nuevo thread en OpenAI y guardarlo en Mongo
  async createThread(createThreadDto: CreateThreadDto): Promise<Thread> {
    const openAIThread = await this.openai.beta.threads.create({
      metadata: createThreadDto.metadata,
    });

    const title = await this.generateTitle(createThreadDto.message);

    const threadMongo = new this.threadModel({
      userId: createThreadDto.userId,
      threadId: openAIThread.id,
      metadata: createThreadDto.metadata,
      assistantId: createThreadDto.assistantId,
      title: title,
      messages: [],
    });

    await threadMongo.save();

    const response = await this.sendMessage({
      message: createThreadDto.message,
      threadId: openAIThread.id,
      isResponseThread: true,
    });

    return response as Thread;
  }

  async deleteThread(threadId: string): Promise<void> {
    const threadMongo = await this.threadModel.findOne({ threadId });
    if (!threadMongo) {
      throw new HttpException('Thread no encontrado', 404);
    }
    await this.threadModel.deleteOne({ threadId });
  }

  async changeThreadTitle(threadId: string, newTitle: string): Promise<Thread> {
    const threadMongo = await this.threadModel.findOne({ threadId });
    if (!threadMongo) {
      throw new HttpException('Thread no encontrado', 404);
    }
    threadMongo.title = newTitle;
    await threadMongo.save();
    return threadMongo;
  }

  async sendMessage(sendMessageDto: SendMessageDto): Promise<string | Thread> {
    const { threadId, message } = sendMessageDto;
    let threadMongo = await this.threadModel.findOne({ threadId });

    if (!threadMongo) {
      throw new HttpException('Thread no encontrado ni en OpenAI ni en Mongo', 404);
    }

    const assistantId = threadMongo.assistantId;
    await this.openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });

    threadMongo.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Crear run del assistant
    const run = await this.openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId || '',
    });

    // Esperar a que el run se complete
    let runStatus = await this.openai.beta.threads.runs.retrieve(run.id, { thread_id: threadId });
    while (runStatus.status !== 'completed') {
      await new Promise((res) => setTimeout(res, 1000));
      runStatus = await this.openai.beta.threads.runs.retrieve(run.id, { thread_id: threadId });

      if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
        throw new HttpException(`Run fallido: ${runStatus.status}`, 500);
      }
    }

    //cantidad de tokens usados
    const tokensUsed = runStatus?.usage?.total_tokens || 0;

    await this.consumeTokensUseCase.execute(threadMongo.userId, tokensUsed, threadMongo.title);
    // 🔥 Aquí está la diferencia: filtrar por run_id
    const messages = await this.openai.beta.threads.messages.list(threadId, {
      limit: 10,
    });

    const lastRunMessages = messages.data.filter((m) => m.run_id === run.id && m.role === 'assistant');

    //@ts-ignore
    const assistantResponse = lastRunMessages?.[0]?.content?.[0]?.text?.value || 'Sin respuesta del asistente';

    threadMongo.messages.push({
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date(),
    });

    //@ts-ignore
    threadMongo.updatedAt = new Date();
    await threadMongo.save();

    return sendMessageDto.isResponseThread ? threadMongo : assistantResponse;
  }

  async generateImage(generateImageDto: GenerateImageDto): Promise<string> {
    const prompt = generateImageDto.prompt;
    const threadId = generateImageDto.threadId;

    let threadMongo = await this.threadModel.findOne({ threadId });

    if (!threadMongo) {
      throw new HttpException('Thread no encontrado ni en OpenAI ni en Mongo', 404);
    }
    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url',
      });

      const imageUrl = response.data?.[0]?.url || '';
      const imageName = `images/${threadId}/${Date.now()}.png`;

      // Subir a Firebase y obtener URL permanente
      const firebaseUrl = await this.firebaseService.uploadImageFromUrl(imageUrl, imageName);

      threadMongo.messages.push({
        role: 'user',
        content: prompt,
        timestamp: new Date(),
      });

      threadMongo.messages.push({
        role: 'assistant',
        content: firebaseUrl,
        timestamp: new Date(),
      });

      await threadMongo.save();

      return firebaseUrl;
    } catch (error) {
      throw new HttpException(error.message, error.status );
    }
  }

  async getUserThreads(userId: string): Promise<Thread[]> {
    const threads = await this.threadModel.find({ userId }).exec();
    return threads;
  }
}
