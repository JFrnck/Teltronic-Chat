import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { MetaApiService } from './api/meta-api.service';

// 1. Tienes que importar el módulo de OpenAI aquí arriba
import { OpenaiModule } from '../openai/openai.module'; 

@Module({
  imports: [
    HttpModule,
    OpenaiModule, 
  ],
  controllers: [WhatsappController],
  providers: [
    WhatsappService, 
    MetaApiService
  ],
})
export class WhatsappModule {}