import { Body, Controller, Get, Post, Query, Res, Request, UseGuards } from '@nestjs/common';
import {
  SubscribeWebhookDto,
  PaymentWebhookDto,
  RejectedWebhookDto,
  UnsubscribeWebhookDto,
  ReactiveWebhookDto,
  PaymentCallbackDto,
  CancelPlanDto,
} from './dtos/tilopay-webhook.dto';
import { ChangeUserPlanUseCase } from '../application/use-cases/change-user-plan.use-case';
import { Transactional } from '../common/decorators/transactional.decorator';
import { MongoTransactionService } from '../infrastructure/mongo/mongo-transaction.service';
import { TilopayService } from '../infrastructure/paymentGateway/tilopay.services';
import { Response } from 'express';
import { CancelUserPlanUseCase } from '../application/use-cases/cancel-user-plan.use-case';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { DeviceGuard } from './guards/device.guard';

@Controller('webhooks/tilopay')
export class PaymentController {
  constructor(
    private readonly changePlanUseCase: ChangeUserPlanUseCase,
    public readonly mongoTransactionService: MongoTransactionService,
    private readonly tilopayService: TilopayService,
    private readonly cancelUserPlanUseCase: CancelUserPlanUseCase,
  ) {}

  @Get('subscribe')
  @Transactional()
  async handleSubscribe(@Query() query: SubscribeWebhookDto) {
    // Lógica: registrar suscripción

    console.log('body', query);
    

    await this.changePlanUseCase.execute('Pago exitoso', query.email, query.id_plan, query.orderNumber);

    return { message: 'Suscripción procesada' };
  }

  @Get('token')
  async getTokenSDK() {
    return await this.tilopayService.getTokenSDK();
  }

  @Post('payment')
  async handlePayment(@Body() query: SubscribeWebhookDto, @Res() res: Response) {
    console.log('body', query);

      await this.changePlanUseCase.execute('Pago exitoso', query.email, query.id_plan, query.orderNumber);

    // Lógica: registrar pago
    return res.redirect(302, `https://tu-bachi-three.vercel.app/transaction-success`);
  }

  @Post('rejected')
  handleRejected(@Body() body: RejectedWebhookDto) {
    console.log('body', body);
    // Lógica: registrar pago fallido
    return { message: 'Rechazo procesado' };
  }
  @UseGuards(JwtAuthGuard, DeviceGuard)
  @Post('unsubscribe')
  async handleUnsubscribe(@Request() req) {
    const { planId, email, cancelAt } = await this.cancelUserPlanUseCase.execute(req.user.id);
    await this.tilopayService.pauseSuscription(email, planId);
    // Lógica: cancelar suscripción
    return { message: 'Cancelación procesada', cancelAt  };
  }

  @Post('reactive')
  async handleReactive(@Body() body: ReactiveWebhookDto) {
    console.log('body', body);
    // Lógica: reactivar suscripción
    await this.tilopayService.reactiveSuscriptor(body.email, body.id_plan);
    return { message: 'Reactivación procesada' };
  }

  @Post('cancel')
  async handleCancel(@Body() body: CancelPlanDto) {
    console.log('body', body);
    // Lógica: cancelar suscripción
    await this.cancelUserPlanUseCase.execute(body.userId);
    return;
  }
}
