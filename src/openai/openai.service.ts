import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface RespuestaIA {
  tipo: 'texto' | 'herramienta';
  contenido?: string;
  nombreHerramienta?: string;
}

@Injectable()
export class OpenaiService {
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      throw new InternalServerErrorException('Falta OPENAI_API_KEY');
    }

    this.openai = new OpenAI({ apiKey: apiKey });
  }

  async analizarMensaje(mensajeUsuario: string): Promise<RespuestaIA> {
    try {
      // 🌟 EL TRUCO NINJA: Usamos 'as any' para apagar la alerta roja de TypeScript
      // Esto nos permite usar la nueva API gpt-5.4 sin importar qué versión esté en node_modules
      const clienteMagico = this.openai as any;

      const response = await clienteMagico.responses.create({
        model: 'gpt-5.4',
        instructions: `Eres JeanBot, un asistente de ventas amable de la empresa Teltronic. 
        Tu objetivo es ayudar al usuario con consultas de telecomunicaciones. 
        Si el usuario indica que ya quiere generar una factura, comprar un producto o te dicta datos legales (como su RUC), 
        DEBES usar la herramienta "enviar_link_facturacion" para que complete sus datos de forma segura. 
        Si no es así, simplemente responde de forma natural, concisa y amigable.`,
        input: mensajeUsuario,
        tools: [
          {
            type: 'function',
            name: 'enviar_link_facturacion',
            description: 'Llama a esta función SOLO cuando el usuario solicita facturar un servicio, comprar, o menciona que necesita ingresar su RUC.',
            parameters: { type: 'object', properties: {} }
          },
        ],
        tool_choice: 'auto', 
      });

      // Verificamos si llamó a la herramienta
      const toolCall = response.output?.find((item: any) => item.type === 'function_call');

      if (toolCall) {
        return {
          tipo: 'herramienta',
          nombreHerramienta: toolCall.name,
        };
      } else {
        return {
          tipo: 'texto',
          contenido: response.output_text || 'Lo siento, no pude procesar eso.',
        };
      }
    } catch (error) {
      console.error('❌ Error comunicándose con OpenAI:', error);
      return {
        tipo: 'texto',
        contenido: 'Tengo un problema técnico en mi sistema. Por favor, intenta en unos minutos.',
      };
    }
  }
}