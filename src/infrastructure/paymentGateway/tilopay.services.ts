// src/token/token.service.ts
import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs'; // Necesario para convertir el Observable a Promise
import { ActionResponse, ApiSuscriptorResponse } from '../../presentation/dtos/tilopay-webhook.dto';

@Injectable()
export class TilopayService {
  private readonly logger = new Logger(TilopayService.name);
  private token: string | null = null;
  private tokenExpiry: number | null = null; // Timestamp de expiración

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Obtiene un token de un servicio externo.
   * Si el token existe y no ha expirado, devuelve el token cacheado.
   * De lo contrario, realiza una nueva petición para obtenerlo.
   * @returns El token de acceso.
   */
  async getTokenSDK(): Promise<string> {
    // Verifica si el token existe y si no ha expirado
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      this.logger.log('Usando token cacheado.');
      return this.token;
    }

    this.logger.log('Obteniendo un nuevo token de la URL externa...');
    const tilopayApiUrl = `${this.configService.get<string>('TILOPAY_API_URL')}/login`;
    const apiUser = this.configService.get<string>('TILOPAY_API_USER');
    const password = this.configService.get<string>('TILOPAY_PASSWORD');
    const key = this.configService.get<string>('TILOPAY_API_KEY');

    if (!tilopayApiUrl || !apiUser || !password) {
      this.logger.error('Variables de entorno para la URL o credenciales del token no configuradas.');
      throw new InternalServerErrorException('Configuración del token externo incompleta.');
    }

    try {
      // Realiza la petición POST para obtener el token
      const response = await firstValueFrom(
        this.httpService.post(
          tilopayApiUrl,
          {
            apiuser: apiUser,
            password: password,
            key : key,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      // Asume que la respuesta contiene el token en 'access_token' y la expiración en 'expires_in'
      const { access_token, expires_in } = response.data;

      if (!access_token) {
        this.logger.error('La respuesta de la API externa no contiene access_token.');
        throw new InternalServerErrorException('No se pudo obtener el token de la API externa.');
      }

      this.token = access_token;
      // Calcula el tiempo de expiración (en milisegundos)
      // Restamos un pequeño margen (e.g., 60 segundos) para evitar tokens a punto de expirar
      this.tokenExpiry = Date.now() + (expires_in * 1000) - (60 * 1000);
      this.logger.log('Token obtenido y cacheado exitosamente.');
      return this.token || '';
    } catch (error) {
      this.logger.error(`Error al obtener el token externo: ${error.message}`, error.stack);
      // Puedes manejar diferentes tipos de errores aquí (e.g., 401, 403, network errors)
      if (error.response) {
        // El servidor respondió con un estado fuera del rango 2xx
        this.logger.error(`Datos de error de la respuesta: ${JSON.stringify(error.response.data)}`);
        throw new InternalServerErrorException(`Error al obtener el token: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        this.logger.error('No se recibió respuesta al intentar obtener el token.');
        throw new InternalServerErrorException('No se recibió respuesta del servicio externo.');
      } else {
        // Algo más causó el error
        throw new InternalServerErrorException('Error desconocido al obtener el token externo.');
      }
    }
  }

  async getSuscriptorRepeat(planId: number): Promise<ApiSuscriptorResponse> {

    const tilopayApiUrl = `${this.configService.get<string>('TILOPAY_API_URL')}/getSuscriptorRepeat`;
    const key = this.configService.get<string>('TILOPAY_API_KEY');
    const token = await this.getTokenSDK();

    const response = await firstValueFrom(  
      this.httpService.post(
        tilopayApiUrl,
        {
          key: key,
          id: planId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    );

    return response.data;
  }

  async getSuscriptorIdByEmail(email: string, planId: number): Promise<number> {
    const response = await this.getSuscriptorRepeat(planId);
    const suscriptor = response.suscriptor.find(suscriptor => suscriptor.email === email);

    if (!suscriptor) {
      throw new NotFoundException('No se encontró el suscriptor.');
    }
    return suscriptor.id;
  }

  async pauseSuscription(email: string, planId: number): Promise<ActionResponse> {
    const suscriptorId = await this.getSuscriptorIdByEmail(email, planId);
    const tilopayApiUrl = `${this.configService.get<string>('TILOPAY_API_URL')}/pauseSuscriptorRepeat`;
    const key = this.configService.get<string>('TILOPAY_API_KEY');
    const token = await this.getTokenSDK();

    const response = await firstValueFrom(
      this.httpService.post(
        tilopayApiUrl,
        {
          key: key,
          id_suscriptor: suscriptorId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    );

    return response.data;
  }

  async reactiveSuscriptor(email: string, planId: number): Promise<ActionResponse> {
    const suscriptorId = await this.getSuscriptorIdByEmail(email, planId);
    const tilopayApiUrl = `${this.configService.get<string>('TILOPAY_API_URL')}/reactiveSuscriptorRepeat`;
    const key = this.configService.get<string>('TILOPAY_API_KEY');
    const token = await this.getTokenSDK();

    const response = await firstValueFrom(
      this.httpService.post(
        tilopayApiUrl,
        {
          key: key,
          id_suscriptor: suscriptorId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    );

    return response.data;
  }
}