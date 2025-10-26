import { ApiProperty } from '@nestjs/swagger';
import { ThreadDto } from './thread.dto';

export class ThreadListResponseDto {
  @ApiProperty({
    description: 'Lista de hilos del usuario',
    type: [ThreadDto],
  })
  threads: ThreadDto[];

  @ApiProperty({
    description: 'Número total de hilos encontrados',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'Cursor o token para obtener la siguiente página',
    example: 'thread_123',
    required: false,
  })
  nextCursor?: string;
}
