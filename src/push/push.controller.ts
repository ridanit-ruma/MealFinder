import { Body, Controller, Delete, Get, Logger, Post, Query } from '@nestjs/common';
import { PushService } from './push.service';
import * as webPush from 'web-push';
import { ConfigService } from '@nestjs/config';

@Controller('push')
export class PushController {
    constructor(
        private readonly pushService: PushService,
        private readonly configService: ConfigService,
    ) {}

    @Post('subscribe')
    async subscribe(@Body() subscription: webPush.PushSubscription) {
        const id = await this.pushService.addSubscriptionInfo(subscription);
        Logger.debug('New subscription info: ', subscription);
        return { status: 'ok', id };
    }

    @Get('send')
    async send(@Query('key') key: string) {
        Logger.debug(`Received request to send push notifications | Key: ${key}`);
        if (key === this.configService.getOrThrow('ADMIN_KEY')) {
            Logger.debug('Sending push notifications');
            await this.pushService.sendPushNotifications();
            return { status: 'ok' };
        }
    }

    @Post('unsubscribe')
    async unsubscribe(@Body() { id }: { id: number }) {
        await this.pushService.removeSubscriptionInfo(id);
        return { status: 'ok' };
    }
}
