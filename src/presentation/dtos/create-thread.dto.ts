// create-thread.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateThreadDto {
  @ApiProperty({
    description: 'ID del usuario que crea el thread',
    example: '680598edc5e68f0ff3b88b07',
  })
  readonly userId: string;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales en formato JSON',
    type: Object,
    example: { context: 'chat', language: 'es' },
  })
  readonly metadata?: Record<string, any>;

  @ApiProperty({
    description: 'ID del asistente que participará en el thread',
    example: 'asst_blaBJwNdirYGAMruTY3jlPAw',
  })
  readonly assistantId: string;

  @ApiProperty({
    description: 'Contenido del mensaje a enviar',
    example: 'Hola, ¿cómo estás?',
  })
  readonly message: string;
}

// send-message.dto.ts
export class SendMessageDto {
  @ApiProperty({
    description: 'ID del thread donde se enviará el mensaje',
    example: 'thread-789',
  })
  readonly threadId: string;

  @ApiProperty({
    description: 'Contenido del mensaje a enviar',
    example: 'Hola, ¿cómo estás?',
  })
  readonly message: string;

  @ApiProperty({
    description: 'Indica si el mensaje es una respuesta a un thread',
    example: false,
  })
  readonly isResponseThread?: boolean;
}

export class ChangeThreadTitleDto {
  @ApiProperty({
    description: 'ID del thread donde se enviará el mensaje',
    example: 'thread-789',
  })
  readonly threadId: string;

  @ApiProperty({
    description: 'Nuevo título del thread',
    example: 'Nuevo título del thread',
  })
  readonly newTitle: string;
}

export class DeleteThreadDto {
  @ApiProperty({
    description: 'ID del thread a eliminar',
    example: 'thread-789',
  })
  readonly threadId: string;
}

export class GenerateImageDto {
  @ApiProperty({
    description: 'ID del thread del que se generará la imagen',
    example: 'thread-789',
  })
  readonly threadId: string;

  @ApiProperty({
    description: 'Prompt para generar la imagen',
    example: 'Un gato con una pata de color azul',
  })
  readonly prompt: string;
}