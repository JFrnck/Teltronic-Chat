import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';

@Injectable()
export class MetaApiService {
  private readonly token?: string;
  private readonly phoneId?: string;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.token = this.configService.get<string>('WHATSAPP_API_TOKEN');
    this.phoneId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    this.baseUrl = `https://graph.facebook.com/v18.0/${this.phoneId}/messages`;
  }

  // Única responsabilidad: Enviar un mensaje de texto puro
  async sendText(to: string, texto: string): Promise<void> {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: { body: texto },
    };

    try {
      await firstValueFrom(
        this.httpService.post(this.baseUrl, payload, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }),
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Fallo en Meta API: ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  }

  // Mañana aquí agregarás: enviarPdf(), enviarPlantilla(), enviarBotonLink()
}



