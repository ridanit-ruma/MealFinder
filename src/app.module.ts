import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NeisMealModule } from './neis-meal/neis-meal.module';
import { PushModule } from './push/push.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [NeisMealModule, PushModule, ConfigModule.forRoot(), ScheduleModule.forRoot()],
    controllers: [AppController],
    providers: [AppService, PrismaService],
})
export class AppModule {}
