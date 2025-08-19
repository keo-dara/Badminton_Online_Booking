import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PlanController } from 'src/plan/plan.controller';
import { PlanService } from 'src/plan/plan.service';

describe('PlanController', () => {
  let controller: PlanController;
  let service: PlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    controller = module.get<PlanController>(PlanController);
    service = module.get<PlanService>(PlanService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('Plan service Teting', () => {
    it('counting plan', async () => {
      const count = await service.count();

      expect(count).toBe(0);
    });

    it('it does not exist', async () => {
      const plans = await service.findAll();
      expect(plans.length).toBe(5);
    });

    it('it exist', async () => {
      const plans = await service.findAll();
      expect(plans.length).toBe(5);
    });

    it('it not found', async () => {
      try {
        await service.findOne(100);
      } catch (error) {
        expect(error.status).toBe(404);
      }
    });
  });
});
