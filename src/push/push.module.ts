import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { PushController } from './push.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    providers: [PushService, PrismaService],
    controllers: [PushController],
})
export class PushModule {}
