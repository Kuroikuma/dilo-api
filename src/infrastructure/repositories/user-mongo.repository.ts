import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { UserDocument } from '../database/schemas/user.schema';

@Injectable()
export class UserMongoRepository implements UserRepository {
  constructor(
    @InjectModel(UserDocument.name) private readonly model: Model<UserDocument>,
  ) {}

  findByLastTokenReset(endDate: Date): Promise<User[] | null> {
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 1);
    return this.model.find({ lastTokenReset: { $gte: startDate, $lte: endDate } });
  }

  formatUserDocument(user: UserDocument): User {
    return new User(
      user._id?.toString() || '',
      user.email,
      user.password,
      user.name,
      user.surname,
      user.tokenBalance,
      user.planId.toString(),
      user.motivation,
      user.inspiration,
      user.levelGrade,
      user.profileSummary,
      user.lastTokenReset,
      user.isEmailVerified,
      user.emailVerificationToken,
      user.lastVerificationEmailSentAt,
      user.resetPasswordToken,
      user.resetPasswordTokenExpiresAt,
      user.deviceId,
      user.deviceChangeToken,
      user.deviceChangeTokenExpiresAt,
      user.pendingNewDeviceId,
    );
  }

  async findByEmail(
    email: string,
    session?: ClientSession,
  ): Promise<User | null> {
    const doc = await this.model.findOne({ email }, {}, { session });
    const docUser = doc ? this.formatUserDocument(doc) : null;
    return docUser;
  }

  async findById(id: string, session?: ClientSession): Promise<User | null> {
    const doc = await this.model.findById(id, {}, { session });
    const docUser = doc ? this.formatUserDocument(doc) : null;
    return docUser;
  }

  async update(user: User, session?: ClientSession): Promise<void> {
    await this.model.findByIdAndUpdate(user.id, user, {
      upsert: true,
      session,
    });
  }

  async create(
    userData: Partial<User>,
    session?: ClientSession,
  ): Promise<User> {
    // 1. Asegúrate de que el query busca por un campo único (ej: email)
    const filter = { email: userData.email }; // Usa un identificador único

    // 2. Define la operación de actualización/creación
    const update = {
      $setOnInsert: { ...userData }, // Crea el documento con todos los campos si no existe
    };

    // 3. Ejecuta findOneAndUpdate con upsert
    const doc = await this.model.findOneAndUpdate(
      filter, // Query para buscar (debe ser único)
      update, // Datos a insertar si no existe
      {
        upsert: true, // Crea el documento si no existe
        new: true, // Devuelve el documento creado (no el antiguo)
        session, // Sesión de transacción
      },
    );

    if (!doc) {
      throw new Error('Error al crear el usuario'); // Manejo de errores opcional
    }

    return this.formatUserDocument(doc);
  }

  async findByVerificationToken(
    token: string,
    session?: ClientSession,
  ): Promise<User | null> {
    const doc = await this.model.findOne(
      { emailVerificationToken: token },
      {},
      { session },
    );
    return doc ? this.formatUserDocument(doc) : null;
  }

  async findByResetToken(
    token: string,
    session?: ClientSession,
  ): Promise<User | null> {
    const doc = await this.model.findOne(
      { resetPasswordToken: token },
      {},
      { session },
    );
    return doc ? this.formatUserDocument(doc) : null;
  }

  async findOne(query: any): Promise<User | null> {
    const doc = await this.model.findOne(query);
    return doc ? this.formatUserDocument(doc) : null;
  }
}
