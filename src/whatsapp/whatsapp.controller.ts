import { Controller, Get, Post, Body, Query, Res, HttpStatus, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { WhatsappService } from './whatsapp.service';
import { WhatsappSignatureGuard } from './guards/whatsapp-signature.guards';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  // 1. Verificación del Webhook (Solo se usa una vez al configurar en Meta)
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      return res.status(HttpStatus.OK).send(challenge);
    }
    return res.sendStatus(HttpStatus.FORBIDDEN);
  }

  // 2. Recepción de mensajes y eventos
 @Post()
  @UseGuards(WhatsappSignatureGuard)
  async receiveMessage(@Body() body: any, @Res() res: Response) {
    res.sendStatus(HttpStatus.OK);

    try {
      await this.whatsappService.handleWebhook(body);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('❌ Error procesando webhook:', error.message);
      }
    }
  }
}




