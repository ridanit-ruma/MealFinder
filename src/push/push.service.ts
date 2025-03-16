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
                Logger.log('Deleted subscription due to error');
            } catch (error) {
                Logger.error('Error deleting subscription', error);
            }
        }
    }

    async addSubscriptionInfo(subscription: webPush.PushSubscription): Promise<number> {
        const sub = await this.prisma.subscriptions.create({
            data: {
                subscriptionInfo: JSON.stringify(subscription),
            },
        });

        return sub.subscriptionId;
    }

    async removeSubscriptionInfo(subscriptionId: number) {
        await this.prisma.subscriptions.delete({
            where: {
                subscriptionId: subscriptionId,
            },
        });
    }

    async sendPushNotifications(code: number) {
        try {
            const subscriptions = await this.prisma.subscriptions.findMany();
            const mealDataRaw = (await this.neisMealService.getReadyMealData(code)).dish;
            if (!(mealDataRaw instanceof Array)) return;
            const mealData = mealDataRaw.map((meal) => {
                return meal.split(' ')[1];
            });
            const payload = {
                title: '오늘의 급식이 도착했습니다!',
                body: mealData.join(', '),
            };
            await Promise.all(
                subscriptions.map(async (subscription) => {
                    const parsedSubscription = JSON.parse(subscription.subscriptionInfo) as webPush.PushSubscription;
                    Logger.debug(`Sending push notification to: ${subscription.subscriptionId}`);
                    await this.sendPushNotification(parsedSubscription, payload, subscription.subscriptionId).catch(
                        (err) => Logger.error(err),
                    );
                }),
            );
        } catch (error) {
            Logger.error('Error fetching subscriptions', error);
        }
    }

    @Cron('0 0 8 * * *')
    async sendBreakfastPushNotifications() {
        await this.sendPushNotifications(1);
    }

    @Cron('0 0 12 * * *')
    async sendLunchPushNotifications() {
        await this.sendPushNotifications(2);
    }

    @Cron('0 0 16 * * *')
    async sendDinnerPushNotifications() {
        await this.sendPushNotifications(3);
    }
}
