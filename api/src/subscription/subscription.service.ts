import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Subscription } from './entities/subscription.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { PlanService } from 'src/plan/plan.service';
import { KhqrService } from 'src/khqr/khqr.service';
import * as qr from 'qrcode';
import { Cron } from '@nestjs/schedule';
import { BakongStatus, SubscriptionStatus } from 'src/auth/role.enum';
import { Plan } from 'src/plan/entities/plan.entity';
import { System } from 'src/system/entities/system.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(System)
    private systemRepo: Repository<System>,
    private usersService: UsersService,
    private planService: PlanService,
    private khqrService: KhqrService,
  ) {}

  processingOrder: boolean = true;
  processingClear: boolean = true;
  logger = new Logger(SubscriptionService.name);

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
    user: User,
    createAt?: Date,
  ): Promise<{
    id: number;
    qr: string;
  }> {
    const isSubAlready = await this.isSubscription(user.id);

    if (isSubAlready) {
      throw new BadRequestException('You already subscribe!!');
    }

    const subscription = new Subscription();

    subscription.system = user.system;
    subscription.plan = await this.planService.findOne(
      createSubscriptionDto.planId,
    );

    const info = this.khqrService.parseQrString(
      '00020101021129190015kimseng_te@aclb5204599953038405802KH5910Kimseng Te6010Phnom Penh63044722',
    );

    subscription.payment = await this.khqrService.newTransaction(
      subscription.plan.price,
      info,
    );
    subscription.startDate = new Date();
    subscription.createdAt = createAt;
    await this.subscriptionRepo.save(subscription);

    const qr = await this.generateQr(subscription.payment.data);

    return {
      id: subscription.id,
      qr,
    };
  }

  async generateQr(value: string): Promise<string> {
    return await qr.toDataURL(value);
  }

  async findOne(id: number): Promise<Subscription> {
    return this.subscriptionRepo.findOne({
      where: {
        id,
      },
      relations: ['payment', 'plan'],
    });
  }

  async mySystemExpiredDate(user: User): Promise<string> {
    const sub = await this.subscriptionRepo.findOne({
      where: {
        system: {
          id: user.system.id,
        },
      },
    });

    return sub.endDate.toDateString();
  }

  async update(
    id: number,
    plan: Plan,
    status: SubscriptionStatus,
  ): Promise<Subscription> {
    const now = new Date();
    const endDate = this.addDays(now, plan.duration);
    this.logger.log(status);

    const sub = await this.subscriptionRepo.findOne({
      where: {
        id,
      },
    });

    sub.status = status;
    sub.endDate = endDate;

    await this.subscriptionRepo.save(sub);

    return this.findOne(id);
  }

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
  }

  async isSubscription(userId: number): Promise<boolean> {
    const user = await this.usersService.userSubscriptionInfo(userId);

    if (!user?.system) {
      return false;
    }

    const subscriptions = await this.subscriptionRepo.find({
      where: {
        status: SubscriptionStatus.Active,
        system: {
          id: user.system.id,
        },
      },
    });

    this.logger.log(subscriptions);

    const currentDate = new Date();
    for (const subscription of subscriptions) {
      if (
        subscription.status === 'active' &&
        subscription.endDate &&
        subscription.endDate > currentDate
      ) {
        return true;
      }
    }

    return false;
  }

  @Cron('*/1 * * * * *')
  async checkTransactionSubscriptionLast() {
    if (this.processingOrder) {
      return [];
    }

    this.processingOrder = true;

    const result: { id: number }[] = await this.subscriptionRepo.query(
      'SELECT id FROM "subscription" WHERE "createdAt" >= NOW() - INTERVAL \'5 minutes\' AND status = \'pending\'',
    );

    if (result.length != 0) {
      this.logger.verbose(`Processing user subscription: ${result.length}`);
    }

    const items: Subscription[] = [];
    await Promise.all(
      result.map(async ({ id }) => {
        const sub = await this.findOne(id);
        const payment = await this.khqrService.validateTransaction(sub.payment);

        if (payment && payment.status === BakongStatus.Success) {
          const updated = await this.update(
            id,
            sub.plan,
            SubscriptionStatus.Active,
          );
          items.push(updated);
        }
      }),
    ).finally(() => {
      this.processingOrder = false;
    });
    return items;
  }

  @Cron('*/1 * * * * *')
  async clearTransactionSubscription() {
    if (this.processingClear) {
      return [];
    }

    this.processingClear = true;

    const result: { id: number }[] = await this.subscriptionRepo.query(
      'SELECT id FROM "subscription" WHERE "createdAt" <= NOW() - INTERVAL \'5 minutes\' AND status = \'pending\'',
    );

    if (result.length != 0) {
      this.logger.verbose(`Processing user subscription: ${result.length}`);
    }

    const items: Subscription[] = [];
    await Promise.all(
      result.map(async ({ id }) => {
        const sub = await this.findOne(id);
        const updated = await this.update(
          id,
          sub.plan,
          SubscriptionStatus.Cancelled,
        );
        items.push(updated);
      }),
    ).finally(() => {
      this.processingClear = false;
    });
    return items;
  }
}
