import { Injectable, NotFoundException } from '@nestjs/common';
import { Plan } from './entities/plan.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private repo: Repository<Plan>,
  ) {}

  async create(): Promise<void> {
    const plan1 = new Plan();
    plan1.name = '1 Month';
    plan1.price = 5;
    plan1.duration = 30;
    const result = await this.repo.create(plan1);
    await this.repo.save(result);

    const plan2 = new Plan();
    plan2.name = '6 Months';
    plan2.price = 25;
    plan2.duration = 30 * 6;
    const result2 = await this.repo.create(plan2);
    await this.repo.save(result2);

    const plan3 = new Plan();
    plan3.name = '12 Months';
    plan3.price = 45;
    plan3.duration = 30 * 12;
    const result3 = await this.repo.create(plan3);
    await this.repo.save(result3);

    const plan4 = new Plan();
    plan4.name = '5 Years';
    plan4.price = 99;
    plan4.duration = 30 * 12 * 5;
    const result4 = await this.repo.create(plan4);
    await this.repo.save(result4);

    const plan5 = new Plan();
    plan5.name = '99 Years';
    plan5.price = 249;
    plan5.duration = 30 * 12 * 99;
    const result5 = await this.repo.create(plan5);
    await this.repo.save(result5);
  }

  async findAll(): Promise<Plan[]> {
    const count = await this.count();
    if (count !== 0) {
      return this.repo.find();
    }

    await this.create();

    return this.repo.find();
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async findOne(id: number): Promise<Plan> {
    const plan = await this.repo.findOne({
      where: {
        id,
      },
    });

    if (!plan) {
      new NotFoundException('Plan does not found');
    }

    return plan;
  }
}
