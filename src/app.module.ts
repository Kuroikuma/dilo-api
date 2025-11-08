import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserSchema, UserDocument } from './infrastructure/database/schemas/user.schema';
import { AuthController } from './presentation/auth.controller';
import { UserMongoRepository } from './infrastructure/repositories/user-mongo.repository';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { DeviceGuard } from './presentation/guards/device.guard';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { ConsumeTokensUseCase } from './application/use-cases/consume-tokens.use-case';
import {
  TokenTransactionDocument,
  TokenTransactionSchema,
} from './infrastructure/database/schemas/token-transaction.schema';
import { PlanDocument, PlanSchema } from './infrastructure/database/schemas/plan.schema';
import {
  UserPlanHistoryDocument,
  UserPlanHistorySchema,
} from './infrastructure/database/schemas/user-plan-history.schema';
import { TokenTransactionMongoRepository } from './infrastructure/repositories/token-transaction-mongo.repository';
import { PlanMongoRepository } from './infrastructure/repositories/plan-mongo.repository';
import { UserPlanHistoryMongoRepository } from './infrastructure/repositories/user-plan-history-mongo.repository';
import { ListPlansUseCase } from './application/use-cases/list-plans.use-case';
import { ChangeUserPlanUseCase } from './application/use-cases/change-user-plan.use-case';
import { GetUserPlanHistoryUseCase } from './application/use-cases/get-user-plan-history.use-case';
import { PlanController } from './presentation/plan.controller';
import { ConfigModule } from '@nestjs/config';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';
import { MongoTransactionService } from './infrastructure/mongo/mongo-transaction.service';
import { ResendVerificationEmailUseCase } from './application/use-cases/resend-verification-email.use-case';
import { RequestPasswordResetUseCase } from './application/use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { AiClassifierService } from './infrastructure/ai/ai-classifier.service';
import { AiCourseService } from './infrastructure/ai/ai-course.service';
import { ClassSessionMongoRepository } from './infrastructure/repositories/class-session-mongo.repository';
import { ClassSessionController } from './presentation/class-session.controller';
import { StartDynamicClassSessionUseCase } from './application/use-cases/start-dynamic-class-session.use-case';
import { ClassSessionDocument, ClassSessionSchema } from './infrastructure/database/schemas/class-session.schema';
import { ContinueClassSessionUseCase } from './application/use-cases/continue-class-session.use-case';
import { GetUserClassSessionsUseCase } from './application/use-cases/get-user-class-sessions.use-case ';
import { GetClassSessionByIdUseCase } from './application/use-cases/get-class-session-by-id.use-case';
import { PaymentController } from './presentation/payment.controller';
import { HttpModule } from '@nestjs/axios';
import { TilopayService } from './infrastructure/paymentGateway/tilopay.services';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './infrastructure/email/mailer.service';
import { ConfirmDeviceChangeUseCase } from './application/use-cases/confirm-device-change.use-case';
import { CancelUserPlanUseCase } from './application/use-cases/cancel-user-plan.use-case';
import { ResetMonthlyTokensUseCase } from './application/use-cases/reset-monthly-tokens';
import { OpenAiSpeechModule } from './openai-speech/openai-speech.module';
import { ChatKitModule } from './chatkit/chatkit.module';
import { UserProfileModule } from './user-profile/user-profile.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
      { name: TokenTransactionDocument.name, schema: TokenTransactionSchema },
      { name: PlanDocument.name, schema: PlanSchema },
      { name: UserPlanHistoryDocument.name, schema: UserPlanHistorySchema },
      { name: ClassSessionDocument.name, schema: ClassSessionSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET, // usa env variable en real
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : 3600 },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST, // 💡 Este es tu host SMTP
        // port: 587, // 465 para SSL, 587 para TLS
        secure: false, // true para TLS, false para STARTTLS
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: '"Soporte Tubachi" <no-reply@tubachi.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(), // permite usar plantillas .hbs
        options: {
          strict: true,
        },
      },
    }),
    OpenAiSpeechModule,
    ChatKitModule,
    UserProfileModule,
  ],
  controllers: [AppController, AuthController, PlanController, PaymentController, ClassSessionController],
  providers: [
    // services
    AppService,
    AiClassifierService,
    AiCourseService,
    MongoTransactionService,

    // repositories
    UserMongoRepository,
    TokenTransactionMongoRepository,
    PlanMongoRepository,
    UserPlanHistoryMongoRepository,
    MongoTransactionService,
    ClassSessionMongoRepository,
    TilopayService,
    MailService,

    // use cases
    {
      provide: LoginUseCase,
      useFactory: (repo: UserMongoRepository, jwtService: JwtService, email: MailService, historyRepo: UserPlanHistoryMongoRepository) =>
        new LoginUseCase(repo, jwtService, email, historyRepo),
      inject: [UserMongoRepository, JwtService, MailService, UserPlanHistoryMongoRepository],
    },
    {
      provide: LogoutUseCase,
      useFactory: (repo: UserMongoRepository) => new LogoutUseCase(repo),
      inject: [UserMongoRepository],
    },
    {
      provide: ConsumeTokensUseCase,
      useFactory: (repo: UserMongoRepository, tokenRepo: TokenTransactionMongoRepository) => new ConsumeTokensUseCase(repo, tokenRepo),
      inject: [UserMongoRepository, TokenTransactionMongoRepository],
    },
    {
      provide: ListPlansUseCase,
      useFactory: (planRepo: PlanMongoRepository) => new ListPlansUseCase(planRepo),
      inject: [PlanMongoRepository],
    },
    {
      provide: ChangeUserPlanUseCase,
      useFactory: (
        userRepo: UserMongoRepository,
        planRepo: PlanMongoRepository,
        historyRepo: UserPlanHistoryMongoRepository,
        transactionRepo: TokenTransactionMongoRepository,
      ) => new ChangeUserPlanUseCase(userRepo, planRepo, historyRepo, transactionRepo),
      inject: [
        UserMongoRepository,
        PlanMongoRepository,
        UserPlanHistoryMongoRepository,
        TokenTransactionMongoRepository,
      ],
    },
    {
      provide: GetUserPlanHistoryUseCase,
      useFactory: (historyRepo: UserPlanHistoryMongoRepository) => new GetUserPlanHistoryUseCase(historyRepo),
      inject: [UserPlanHistoryMongoRepository],
    },
    {
      provide: RegisterUserUseCase,
      useFactory: (repo: UserMongoRepository, email: MailService, historyRepo: UserPlanHistoryMongoRepository) =>
        new RegisterUserUseCase(repo, email, historyRepo),
      inject: [UserMongoRepository, MailService, UserPlanHistoryMongoRepository],
    },
    {
      provide: VerifyEmailUseCase,
      useFactory: (repo: UserMongoRepository) => new VerifyEmailUseCase(repo),
      inject: [UserMongoRepository],
    },
    {
      provide: ResendVerificationEmailUseCase,
      useFactory: (repo: UserMongoRepository, email: MailService) =>
        new ResendVerificationEmailUseCase(repo, email),
      inject: [UserMongoRepository, MailService],
    },
    {
      provide: RequestPasswordResetUseCase,
      useFactory: (repo: UserMongoRepository, email: MailService) =>
        new RequestPasswordResetUseCase(repo, email),
      inject: [UserMongoRepository, MailService],
    },
    {
      provide: ResetPasswordUseCase,
      useFactory: (repo: UserMongoRepository) => new ResetPasswordUseCase(repo),
      inject: [UserMongoRepository],
    },
    {
      provide: ConfirmDeviceChangeUseCase,
      useFactory: (repo: UserMongoRepository) => new ConfirmDeviceChangeUseCase(repo),
      inject: [UserMongoRepository],
    },
    {
      provide: CancelUserPlanUseCase,
      useFactory: (repo: UserMongoRepository, planRepo: PlanMongoRepository, historyRepo: UserPlanHistoryMongoRepository) =>
        new CancelUserPlanUseCase(repo, planRepo, historyRepo),
      inject: [UserMongoRepository, PlanMongoRepository, UserPlanHistoryMongoRepository],
    },
    {
      provide: ResetMonthlyTokensUseCase,
      useFactory: (repo: UserMongoRepository, planRepo: PlanMongoRepository, historyRepo: UserPlanHistoryMongoRepository, transactionRepo: TokenTransactionMongoRepository) =>
        new ResetMonthlyTokensUseCase(repo, planRepo, historyRepo, transactionRepo),
      inject: [UserMongoRepository, PlanMongoRepository, UserPlanHistoryMongoRepository, TokenTransactionMongoRepository],
    },

    //chat
    {
      provide: StartDynamicClassSessionUseCase,
      useFactory: (
        classifier: AiClassifierService,
        sessionRepo: ClassSessionMongoRepository,
        aiService: AiCourseService,
        tokenRepo: TokenTransactionMongoRepository,
        userRepo: UserMongoRepository,
      ) => new StartDynamicClassSessionUseCase(classifier, sessionRepo, aiService, tokenRepo, userRepo),
      inject: [
        AiClassifierService,
        ClassSessionMongoRepository,
        AiCourseService,
        TokenTransactionMongoRepository,
        UserMongoRepository,
      ],
    },
    {
      provide: ContinueClassSessionUseCase,
      useFactory: (
        sessionRepo: ClassSessionMongoRepository,
        aiService: AiCourseService,
        tokenRepo: TokenTransactionMongoRepository,
        userRepo: UserMongoRepository,
      ) => {
        return new ContinueClassSessionUseCase(sessionRepo, aiService, tokenRepo, userRepo);
      },
      inject: [ClassSessionMongoRepository, AiCourseService, TokenTransactionMongoRepository, UserMongoRepository],
    },
    {
      provide: GetUserClassSessionsUseCase,
      useFactory: (sessionRepo: ClassSessionMongoRepository) => {
        return new GetUserClassSessionsUseCase(sessionRepo);
      },
      inject: [ClassSessionMongoRepository],
    },
    {
      provide: GetClassSessionByIdUseCase,
      useFactory: (repo: ClassSessionMongoRepository) => new GetClassSessionByIdUseCase(repo),
      inject: [ClassSessionMongoRepository],
    },

    // strategies
    JwtStrategy,
    DeviceGuard,
    JwtAuthGuard,
  ],
})
export class AppModule {}
