import { Injectable, Logger } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { Booking } from 'src/booking/entities/booking.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { QueryDashboardDto } from './dto/query-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
  ) {}

  private readonly logger = new Logger(DashboardService.name);

  async findAll(user: User, query: QueryDashboardDto): Promise<DashboardInfo> {
    this.logger.log('USER ID', user.id);

    const isSub = await this.subscriptionService.isSubscription(user.id);
    const todayBooking = await this.todayBooking(query);

    return {
      isSub,
      todayBooking,
    };
  }

  async todayBooking(query: QueryDashboardDto): Promise<number> {
    return this.bookingRepo.count({
      where: {
        createdAt: Raw((alias) => `DATE(${alias}) = :date`, {
          date: query.date,
        }),
      },
    });
  }
}

export interface DashboardInfo {
  isSub: boolean;
  todayBooking: number;
}
