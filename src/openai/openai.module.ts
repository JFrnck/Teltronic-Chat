 import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [OpenaiService],
  exports: [OpenaiService], 
})
export class OpenaiModule {}