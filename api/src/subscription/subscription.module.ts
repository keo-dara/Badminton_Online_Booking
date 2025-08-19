import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { UsersModule } from 'src/users/users.module';
import { PlanModule } from 'src/plan/plan.module';
import { KhqrModule } from 'src/khqr/khqr.module';
import { System } from 'src/system/entities/system.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, System]),
    UsersModule,
    PlanModule,
    KhqrModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
