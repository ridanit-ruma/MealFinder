import { Module } from '@nestjs/common';
import { NeisMealService } from './neis-meal.service';
import { NeisMealController } from './neis-meal.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ScheduleModule, ConfigModule],
    providers: [NeisMealService, PrismaService],
    controllers: [NeisMealController],
})
export class NeisMealModule {}
