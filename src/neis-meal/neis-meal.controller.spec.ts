import { Test, TestingModule } from '@nestjs/testing';
import { NeisMealController } from './neis-meal.controller';

describe('NeisMealController', () => {
    let controller: NeisMealController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NeisMealController],
        }).compile();

        controller = module.get<NeisMealController>(NeisMealController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
