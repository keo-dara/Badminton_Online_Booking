import { SubscriptionStatus } from 'src/auth/role.enum';
import { CoreEntity } from 'src/core/entities/core.entities';
import { KhQr } from 'src/khqr/entities/khqr.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { System } from 'src/system/entities/system.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Subscription extends CoreEntity {
  @ManyToOne(() => System, (system) => system.subscriptions)
  system: System;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions)
  plan: Plan;

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.Pending,
  })
  status: SubscriptionStatus;

  @ManyToOne(() => KhQr, (qr) => qr.subscriptions)
  payment: KhQr;
}
