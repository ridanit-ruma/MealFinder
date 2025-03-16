import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { PushService } from './push.service';
import * as webPush from 'web-push';

@Controller('push')
export class PushController {
    constructor(private readonly pushService: PushService) {}

    @Post('subscribe')
    async subscribe(@Body() subscription: webPush.PushSubscription) {
        await this.pushService.addSubscriptionInfo(subscription);
        Logger.debug('New subscription info: ', subscription);
        return { status: 'ok' };
    }
    @Get('send')
    async send(@Query('key') key: string) {
        if (key === process.env.AdminKey) {
            await this.pushService.sendPushNotifications();
            return { status: 'ok' };
        }
    }
}
