import { Controller, Get, Inject, Query } from '@nestjs/common';
import { NeisMealService } from './neis-meal.service';
import { MealData } from './neis-meal.interface';

@Controller('meal')
export class NeisMealController {
    constructor(
        @Inject(NeisMealService)
        private readonly neisMealService: NeisMealService,
    ) {}
    @Get()
    async getMealData(@Query('date') date: string, @Query('code') code: number) {
        code = parseInt(code.toString());
        const mealData: MealData = await this.neisMealService.getMealData(date, code);
        return mealData;
    }
    @Get('getBreakFastMealData')
    async getBreakFastMealData() {
        const mealData = await this.neisMealService.getReadyMealData(1);
        return mealData;
    }
    @Get('getLunchMealData')
    async getLunchMealData() {
        const mealData = await this.neisMealService.getReadyMealData(2);
        return mealData;
    }
    @Get('getDinnerMealData')
    async getDinnerMealData() {
        const mealData = await this.neisMealService.getReadyMealData(3);
        return mealData;
    }
}
