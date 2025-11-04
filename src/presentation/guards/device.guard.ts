import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserMongoRepository } from '../../infrastructure/repositories/user-mongo.repository';

@Injectable()
export class DeviceGuard implements CanActivate {
  constructor(private readonly userRepo: UserMongoRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const deviceId = request.headers['x-device-id'];
    const user = request.user;

    if (!deviceId) {
      throw new UnauthorizedException('Falta el deviceId en headers');
    }

    const userInDb = await this.userRepo.findById(user.id);
    if (!userInDb || userInDb.deviceId !== deviceId) {
      throw new UnauthorizedException('Dispositivo no autorizado');
    }

    return true;
  }
}
