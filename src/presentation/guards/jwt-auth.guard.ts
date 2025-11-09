import { UnauthorizedException, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

function isAuthInfo(obj: unknown): obj is { message: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'message' in obj &&
    typeof (obj as Record<string, unknown>).message === 'string'
  );
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard canActivate');
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: TUser, info: unknown): TUser {
    console.log('JwtAuthGuard handleRequest');
    
    if (err || !user) {
      let message = 'Token inválido o no proporcionado';

      if (isAuthInfo(info)) {
        message = info.message;
      }
      console.log('Error de autenticación:', message);
      throw new UnauthorizedException(message);
    }

    console.log('JwtAuthGuard activado, token válido');
    return user;
  }
}
