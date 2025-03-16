import * as webPush from 'web-push';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { PushPayload } from './push.interface';
import { NeisMealService } from 'src/neis-meal/neis-meal.service';

@Injectable()
export class PushService {
    private VAPID_KEYS = {
        publicKey: process.env.PUBLIC_KEY,
        privateKey: process.env.PRIVATE_KEY,
    };
    constructor(
        private prisma: PrismaService,
        private neisMealService: NeisMealService,
    ) {
        webPush.setVapidDetails(
            'mailto:minenaturecrew@gmail.com',
            this.VAPID_KEYS.publicKey ?? '',
            this.VAPID_KEYS.privateKey ?? '',
        );
    }
    async sendPushNotification(subscription: webPush.PushSubscription, payload: PushPayload, subscriptionId: number) {
        try {
            await webPush.sendNotification(subscription, JSON.stringify(payload));
        } catch (error) {
            Logger.error('Error sending push notification', error);
            try {
                await this.prisma.subscriptions.delete({
                    where: {
                        subscriptionId: subscriptionId,
                    },
                });
            } catch (error) {
                Logger.error('Error deleting subscription', error);
            }
        }
    }
    async addSubscriptionInfo(subscription: webPush.PushSubscription) {
        await this.prisma.subscriptions.create({
            data: {
                subscriptionInfo: JSON.stringify(subscription),
            },
        });
    }
    @Cron('0 0 12 * * *')
    async sendPushNotifications() {
        try {
            const subscriptions = await this.prisma.subscriptions.findMany();
            const payload = {
                title: '오늘의 급식이 도착했습니다!',
                body: '급식을 확인해보세요!',
            };
            await Promise.all(
                subscriptions.map(async (subscription) => {
                    const parsedSubscription = JSON.parse(subscription.subscriptionInfo) as webPush.PushSubscription;
                    Logger.debug('Sending push notification');
                    await this.sendPushNotification(parsedSubscription, payload, subscription.subscriptionId);
                }),
            );
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        }
    }
}
