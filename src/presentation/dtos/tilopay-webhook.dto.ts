import {
  IsString,
  IsNumber,
  IsOptional,
  IsEmail,
  IsDateString,
  IsNumberString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscribeWebhookDto {
  @IsNumber() id_plan: number;
  @IsEmail() email: string;
  @IsString() modality: string;
  @IsNumber() amount: number;
  @IsOptional() @IsString() frequency?: string;
  @IsOptional() @IsString() coupon?: string;
  @IsNumber() free_trial: number;
  @IsDateString() next_payment_date: string;
  @IsNumber() paymentId: number;
  @IsString() orderNumber: string;
}

export class PaymentWebhookDto {
  @IsNumber() id_plan: number;
  @IsEmail() email: string;
  @IsNumber() amount: number;
  @IsString() auth: string;
  @IsString() orderNumber: string;
}

export class RejectedWebhookDto {
  @IsNumber() id_plan: number;
  @IsEmail() email: string;
  @IsNumber() amount: number;
}

export class UnsubscribeWebhookDto {
  @ApiProperty({
    example: 22941281,
    description: 'ID del plan',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '555',
    description: 'ID del plan',
  })
  @IsNumberString()
  planId: number;
}

export class ReactiveWebhookDto {
  @IsNumber() id_plan: number;
  @IsEmail() email: string;
  @IsDateString() next_payment_date: string;
}

export interface Suscriptor {
  id: number;
  name: string;
  lastname: string;
  email: string;
  modality: string;
  amount: string;
  expire: string; // formato: YYYY-MM-DD
  coupon: string;
  status: string;
  create: string; // formato: YYYY-MM-DD HH:mm:ss
}

export interface ApiSuscriptorResponse {
  type: string;
  message: string;
  suscriptor: Suscriptor[];
}

export interface ActionResponse {
  type: string;
  status: number;
  message: string;
}

export class PaymentCallbackDto {
  @ApiProperty({
    example: '1',
    description: 'Código de respuesta de la transacción',
  })
  @IsString()
  code: string;

  @ApiProperty({
    example: 'Transaccion aprobada',
    description: 'Descripción del estado de la transacción',
  })
  @IsString()
  description: string;

  @ApiProperty({ example: '123456', description: 'Código de autorización' })
  @IsString()
  auth: string;

  @ApiProperty({
    example: 'sdk-order-1748912564379',
    description: 'Identificador del pedido',
  })
  @IsString()
  order: string;

  @ApiProperty({
    example: '2883620',
    description: 'ID de transacción de Tilopay (TPT)',
  })
  @IsNumberString()
  tpt: string;

  @ApiPropertyOptional({ example: '', description: 'Campo opcional crd' })
  @IsOptional()
  @IsString()
  crd?: string;

  @ApiPropertyOptional({ example: '', description: 'Campo opcional padded' })
  @IsOptional()
  @IsString()
  padded?: string;

  @ApiPropertyOptional({
    example: 'MasterCard',
    description: 'Marca de la tarjeta',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Últimos dígitos de la tarjeta',
  })
  @IsOptional()
  @IsString()
  'last-digits'?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'ID de transacción en el gateway',
  })
  @IsOptional()
  @IsString()
  'gateway-transaction'?: string;

  @ApiPropertyOptional({
    example: '2883620',
    description: 'ID de transacción Tilopay',
  })
  @IsOptional()
  @IsString()
  'tilopay-transaction'?: string;

  @ApiProperty({
    example: '4798380f46a7ca46b65ccb4a23061ff5...',
    description: 'Hash de validación del pedido',
  })
  @IsString()
  OrderHash: string;

  @ApiProperty({ example: '290', description: 'Datos adicionales devueltos' })
  @IsString()
  returnData: string;
}

export class CancelPlanDto {
  @ApiProperty({
    example: '22941281-f93a-454a-8ff5-03803154fc5d',
    description: 'ID del usuario',
  })
  @IsString()
  userId: string;
}
