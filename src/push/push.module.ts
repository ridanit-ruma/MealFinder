import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { PushController } from './push.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { NeisMealService } from 'src/neis-meal/neis-meal.service';

@Module({
    imports: [ConfigModule, ScheduleModule],
    providers: [PushService, PrismaService, NeisMealService],
    controllers: [PushController],
})
export class PushModule {}
