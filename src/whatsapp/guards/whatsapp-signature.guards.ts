import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Request } from 'express';

@Injectable()
export class WhatsappSignatureGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    
    // 1. Extraemos el App Secret (Lo sacarás del panel de Meta)
    const appSecret = this.configService.get<string>('WHATSAPP_APP_SECRET');
    if (!appSecret) {
      console.error('❌ Falta WHATSAPP_APP_SECRET en el .env');
      throw new UnauthorizedException('Configuración de seguridad incompleta');
    }

    // 2. Extraemos la firma que nos envía Meta en los Headers
    const signatureHeader = req.headers['x-hub-signature-256'] as string;
    if (!signatureHeader) {
      throw new UnauthorizedException('Petición rechazada: Falta la firma de Meta');
    }

    // 3. Obtenemos el cuerpo crudo que activamos en main.ts
    // Usamos @ts-ignore temporalmente porque Express estándar no tiene tipado nativo para rawBody
    // @ts-ignore
    const rawBody = req.rawBody; 
    if (!rawBody) {
      throw new UnauthorizedException('Petición rechazada: No se pudo procesar el cuerpo del mensaje');
    }

    // 4. Operación Criptográfica: Calculamos nuestra propia firma
    const hmac = crypto.createHmac('sha256', appSecret);
    const digest = Buffer.from('sha256=' + hmac.update(rawBody).digest('hex'), 'utf8');
    const signature = Buffer.from(signatureHeader, 'utf8');

    // 5. Comparamos ambas firmas de forma segura contra "Ataques de Tiempo"
    if (digest.length !== signature.length || !crypto.timingSafeEqual(digest, signature)) {
      console.warn('⚠️ Intento de acceso denegado: Firma inválida');
      throw new UnauthorizedException('Firma criptográfica inválida');
    }

    // ¡La firma coincide! El guardia abre la puerta.
    return true;
  }
}