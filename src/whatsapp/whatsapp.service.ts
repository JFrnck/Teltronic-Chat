import { Injectable } from '@nestjs/common';
import { MetaApiService } from './api/meta-api.service';
// Importamos el servicio de nuestra IA
import { OpenaiService } from '../openai/openai.service'; 

@Injectable()
export class WhatsappService {
  /**
   * Inyectamos a nuestros dos especialistas:
   * 1. metaApi: Sabe cómo hablar con Facebook.
   * 2. openaiService: Sabe cómo pensar y decidir.
   */
  constructor(
    private readonly metaApi: MetaApiService,
    private readonly openaiService: OpenaiService,
  ) {}

  async handleWebhook(body: any) {
    const value = body.entry?.[0]?.changes?.[0]?.value;

    if (value?.messages) {
      const message = value.messages[0];
      const from = message.from;
      const text = message.text?.body;

      console.log(`\n📩 Usuario ${from} dice: "${text}"`);

      try {
        // 1. Le pasamos el mensaje a la IA para que lo analice
        const respuestaIA = await this.openaiService.analizarMensaje(text);

        // 2. Ejecutamos la decisión de la IA
        if (respuestaIA.tipo === 'texto' && respuestaIA.contenido) {
          
          // La IA decidió que solo es una charla normal
          await this.metaApi.sendText(from, respuestaIA.contenido);
          console.log(`🤖 JeanBot respondió: "${respuestaIA.contenido}"`);
          
        } else if (respuestaIA.tipo === 'herramienta' && respuestaIA.nombreHerramienta === 'enviar_link_facturacion') {
          
          // ¡MAGIA! La IA detectó la intención de compra/facturación.
          // Por ahora enviaremos un texto plano simulando el WebView. 
          // (Más adelante cambiaremos esto por la plantilla oficial con botón).
          const linkWebview = `https://tu-ngrok.app/webview?phone=${from}`;
          const mensajeAccion = `¡Excelente! Para procesar tu solicitud de inmediato, por favor ingresa tus datos de facturación en este formulario seguro:\n\n👉 ${linkWebview}`;
          
          await this.metaApi.sendText(from, mensajeAccion);
          console.log(`🔗 JeanBot detectó intención de compra y envió el link a ${from}`);
        }
        
      } catch (error: unknown) {
         if (error instanceof Error) {
            console.error('❌ Error en el flujo de WhatsappService:', error.message);
         }
      }
    }
  }
}