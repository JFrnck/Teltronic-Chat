import { Injectable } from '@nestjs/common';
import { MetaApiService } from './api/meta-api.service';

@Injectable()
export class WhatsappService {
  // Inyectamos nuestro propio cliente en lugar de HttpService
  constructor(private readonly metaApi: MetaApiService) {}

  async handleWebhook(body: any) {
    const value = body.entry?.[0]?.changes?.[0]?.value;

    if (value?.messages) {
      const message = value.messages[0];
      const from = message.from;
      const text = message.text?.body;

      console.log(`📩 Recibido: ${text} de ${from}`);

      try {
        // La llamada ahora es limpia y semántica
        await this.metaApi.sendText(from, `JeanBot procesó: "${text}"`);
        console.log(`✅ Mensaje respondido a ${from}`);
      } catch (error: unknown) {
         if (error instanceof Error) {
            console.error('❌ No se pudo enviar el mensaje:', error.message);
         }
      }
    }
  }
}