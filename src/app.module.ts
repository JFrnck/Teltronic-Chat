import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true 
  }),WhatsappModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
