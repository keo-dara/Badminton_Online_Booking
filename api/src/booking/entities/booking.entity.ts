import { SalePayment, SaleStatus } from 'src/auth/role.enum';
import { CoreEntity } from 'src/core/entities/core.entities';
import { Court } from 'src/court/entities/court.entity';
import { KhQr } from 'src/khqr/entities/khqr.entity';
import { GeneratedTime } from 'src/time/entities/time.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Booking extends CoreEntity {
  @OneToMany(() => GeneratedTime, (g) => g.booking)
  times: GeneratedTime[];

  @Column()
  customer: string;

  @Column({ type: 'text', default: '' })
  courtName: string;

  @Column()
  phone: string;

  @Column()
  no: string;

  @Column({ type: 'real', default: 0 })
  price: number;

  @Column({ type: 'int', default: 0 })
  discount: number;

  @Column({ type: 'int', nullable: true })
  customerId: number;

  @Column({ type: 'real', default: 0 })
  total: number;

  @Column({ default: new Date(), type: 'date' })
  bookingDate: Date;

  @Column({
    type: 'enum',
    enum: SaleStatus,
    default: SaleStatus.Pending,
  })
  status: SaleStatus;
  //

  @Column({
    type: 'enum',
    enum: SalePayment,
    default: SalePayment.Cash,
  })
  paymentType: SalePayment;

  @ManyToOne(() => KhQr, (s) => s.bookings)
  payment: KhQr;

  @ManyToOne(() => KhQr, (s) => s.bookings2)
  payment2: KhQr;

  @ManyToOne(() => Court, (s) => s.bookings)
  court: Court;

  @Column({ type: 'int', default: 100 })
  bookPercent: number;

  notification?: boolean;

  hashString?: string;

  url?: string;

  time?: number;

  merchantId: string;
}
