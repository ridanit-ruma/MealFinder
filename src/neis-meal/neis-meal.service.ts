import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { allergyList } from './neis-meal.constant';
import { MealData, NeisMeal } from './neis-meal.interface';
import { Logger } from '@nestjs/common';
import * as moment from 'moment-timezone';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NeisMealService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {}
    async getReadyMealData(code: number) {
        const today = moment().tz('Asia/Seoul');
        if (today.hours() >= 17) {
            today.add(1, 'days');
        }
        const mealInfo = await this.getMealData(today.format('YYYYMMDD'), code);
        return {
            date: mealInfo.mealDate,
            dish: mealInfo.mealInfo.dish,
            cal: mealInfo.mealInfo.cal,
            nutr: mealInfo.mealInfo.nutr,
        };
    }
    private async fetchMealData(date: string, code: number) {
        const apiUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${this.configService.getOrThrow('KEY')}&Type=json&ATPT_OFCDC_SC_CODE=${this.configService.getOrThrow('ATPT_OFCDC_SC_CODE')}&SD_SCHUL_CODE=${this.configService.getOrThrow('SD_SCHUL_CODE')}&MMEAL_SC_CODE=${code}&MLSV_YMD=${date}`;
        try {
            const response = await fetch(apiUrl);
            const data = (await response.json()) as NeisMeal;
            if (data.mealServiceDietInfo) {
                const mealData = data.mealServiceDietInfo[1].row[0];
                return {
                    mealDate: date,
                    mealCode: code,
                    mealInfo: {
                        dish: this.cookMealData(mealData.DDISH_NM),
                        cal: mealData.CAL_INFO,
                        nutr: mealData.NTR_INFO.split('<br/>'),
                    },
                };
            } else {
                return false;
            }
        } catch (error) {
            Logger.error(`[ERROR] Failed to get meal data: ${error}`);
            return false;
        }
    }
    private cookMealData(dishs: string) {
        return dishs.split('<br/>').map((dish: string, i: number) => {
            const cookedDish = dish.replace(/\(([\d.]+)\)/g, (match, numbers: string) => {
                const allergyNames = numbers
                    .split('.')
                    .map((num: keyof typeof allergyList) => allergyList[num])
                    .join(', ');
                return `(${allergyNames})`;
            });
            return `${i + 1}. ${cookedDish}`;
        });
    }
    async getMealData(date: string, code: number): Promise<MealData> {
        const databaseMealData = await this.prisma.meals.findMany({
            where: {
                mealDate: date,
                mealCode: code,
            },
            select: {
                mealInfo: true,
            },
        });
        if (databaseMealData.length === 0) {
            const newMealData = await this.fetchMealData(date, code);
            if (newMealData) {
                await this.prisma.meals.create({
                    data: {
                        mealDate: newMealData.mealDate,
                        mealCode: newMealData.mealCode,
                        mealInfo: newMealData.mealInfo,
                    },
                });
                Logger.debug(`[INFO] New meal data has been created: ${newMealData.mealDate}`);
                return newMealData;
            } else {
                Logger.debug(`[INFO] Meal data has not been found: ${date}`);
                return {
                    mealDate: date,
                    mealCode: code,
                    mealInfo: {
                        dish: '급식 정보가 없습니다.',
                        cal: '급식 정보가 없습니다.',
                        nutr: '급식 정보가 없습니다.',
                    },
                };
            }
        }
        Logger.debug(`[INFO] Meal data has been found in the database: ${date}`);
        return {
            mealDate: date,
            mealCode: code,
            mealInfo: {
                dish: (databaseMealData[0].mealInfo as MealData['mealInfo']).dish,
                cal: (databaseMealData[0].mealInfo as MealData['mealInfo']).cal,
                nutr: (databaseMealData[0].mealInfo as MealData['mealInfo']).nutr,
            },
        };
    }
    @Cron('0 0 0 4 3 *')
    async resetDatabase() {
        try {
            await this.prisma.meals.deleteMany();
            Logger.debug('[INFO] Database has been reset.');
        } catch (error) {
            Logger.error(`[ERROR] Failed to reset database: ${error}`);
        }
    }
}
