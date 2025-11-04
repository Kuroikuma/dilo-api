import { UserRepository } from '../../domain/repositories/user.repository';

export class ConfirmDeviceChangeUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(token: string): Promise<any> {
    const user = await this.userRepo.findOne({ deviceChangeToken: token });

    if (!user) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Error de Confirmación</title>
            <style>
                body { font-family: 'Inter', sans-serif; background-color: #f8d7da; color: #721c24; text-align: center; padding: 50px; }
                .container { background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 30px; max-width: 500px; margin: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                h1 { color: #721c24; }
                p { margin-bottom: 20px; }
                a { color: #007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Error de Confirmación</h1>
                <p>El token de confirmación es inválido o no se encontró ningún usuario asociado.</p>
                <p>Por favor, intenta iniciar sesión de nuevo o contacta con soporte.</p>
                <p><a href="${process.env.DOMAIN_WEB}/login">Ir a la página de inicio de sesión</a></p>
            </div>
        </body>
        </html>
      `;
    }

    if (user.deviceChangeTokenExpiresAt && user.deviceChangeTokenExpiresAt < new Date()) {
      // Limpiar el token expirado
      user.deviceChangeToken = undefined;
      user.deviceChangeTokenExpiresAt = undefined;
      user.pendingNewDeviceId = undefined;
      await this.userRepo.update(user);
      return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Token Expirado</title>
            <style>
                body { font-family: 'Inter', sans-serif; background-color: #fff3cd; color: #856404; text-align: center; padding: 50px; }
                .container { background-color: #fff3cd; border: 1px solid #ffeeba; border-radius: 8px; padding: 30px; max-width: 500px; margin: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                h1 { color: #856404; }
                p { margin-bottom: 20px; }
                a { color: #007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Token Expirado</h1>
                <p>El token de confirmación ha expirado. Por favor, intenta iniciar sesión de nuevo para generar un nuevo correo de confirmación.</p>
                <p><a href="${process.env.DOMAIN_WEB}/login">Ir a la página de inicio de sesión</a></p>
            </div>
        </body>
        </html>
      `;
    }

    // Confirmar el cambio de dispositivo
    user.deviceId = user.pendingNewDeviceId;
    user.deviceChangeToken = undefined;
    user.deviceChangeTokenExpiresAt = undefined;
    user.pendingNewDeviceId = undefined;
    await this.userRepo.update(user);

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Confirmación Exitosa</title>
          <style>
              body { font-family: 'Inter', sans-serif; background-color: #d4edda; color: #155724; text-align: center; padding: 50px; }
              .container { background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 30px; max-width: 500px; margin: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              h1 { color: #155724; }
              p { margin-bottom: 20px; }
              a { color: #007bff; text-decoration: none; }
              a:hover { text-decoration: underline; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>¡Dispositivo Confirmado!</h1>
              <p>Tu nuevo dispositivo ha sido autorizado exitosamente.</p>
              <p>Ahora puedes iniciar sesión con normalidad.</p>
              <p><a href="${process.env.DOMAIN_WEB}/login">Ir a la página de inicio de sesión</a></p>
          </div>
      </body>
      </html>
    `;
  }
}
