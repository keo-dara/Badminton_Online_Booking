import { BakongStatus } from 'src/auth/role.enum';
import { Booking } from 'src/booking/entities/booking.entity';
import { CoreEntity } from 'src/core/entities/core.entities';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class KhQr extends CoreEntity {
  @Column()
  md5: string;

  @Column('text')
  data: string;

  @Column({
    type: 'enum',
    enum: BakongStatus,
    default: BakongStatus.Pending,
  })
  status: BakongStatus;

  @Column({ type: 'double precision', nullable: true })
  amount: number;

  @Column({ type: 'real', nullable: true })
  amountBakong: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  fromAccountId: string;

  @Column({ nullable: true })
  toAccountId: string;

  @OneToMany(() => Subscription, (subscription) => subscription.payment)
  subscriptions: Subscription[];

  @OneToMany(() => Booking, (sale) => sale.payment)
  bookings: Booking[];

  @OneToMany(() => Booking, (sale) => sale.payment2)
  bookings2: Booking[];
}
