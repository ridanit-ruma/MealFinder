import { Test, TestingModule } from '@nestjs/testing';
import { NeisMealService } from './neis-meal.service';

describe('NeisMealService', () => {
    let service: NeisMealService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [NeisMealService],
        }).compile();

        service = module.get<NeisMealService>(NeisMealService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
