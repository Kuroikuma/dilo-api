import { ApiProperty } from '@nestjs/swagger';

export class ThreadDto {
  @ApiProperty({
    description: 'ID único del hilo',
    example: 'thread_12345',
  })
  id: string;

  @ApiProperty({
    description: 'Título o nombre del hilo',
    example: 'Conversación sobre soporte técnico',
  })
  title: string;

  @ApiProperty({
    description: 'Fecha de creación del hilo',
    example: '2025-10-26T15:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Último mensaje del hilo',
    example: 'Gracias por tu ayuda',
    required: false,
  })
  lastMessage?: string;

  @ApiProperty({
    description: 'Cantidad de mensajes en el hilo',
    example: 12,
  })
  messageCount: number;
}
