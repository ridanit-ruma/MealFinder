import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NeisMealModule } from './neis-meal/neis-meal.module';
import { PushModule } from './push/push.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
    imports: [NeisMealModule, PushModule],
    controllers: [AppController],
    providers: [AppService, PrismaService],
})
export class AppModule {}
