import { Shift } from 'src/auth/role.enum';
import { Booking } from 'src/booking/entities/booking.entity';
import { CoreEntity } from 'src/core/entities/core.entities';
import { Court } from 'src/court/entities/court.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Time extends CoreEntity {
  @Column({
    type: 'decimal',
    default: 0,
  })
  from: number;

  @Column({
    type: 'decimal',
    default: 0,
  })
  to: number;

  @Column({ default: false, type: 'bool' })
  isVip: boolean;

  @Column({
    type: 'decimal',
    default: 0,
  })
  price: number;

  @OneToMany(() => GeneratedTime, (g) => g.time)
  times: GeneratedTime[];

  @Column({
    type: 'enum',
    enum: Shift,
    default: Shift.Morning,
  })
  shift: Shift;

  @ManyToMany(() => Court, (court) => court.times)
  @JoinTable()
  courts: Court[];

  displayTime?: string;
}

@Entity()
export class GeneratedTime extends CoreEntity {
  @ManyToOne(() => Time, (time) => time.times)
  time: Time;

  @ManyToOne(() => Booking, (booking) => booking.times)
  booking: Booking;

  @Column({ default: false, type: 'boolean' })
  isBusy: boolean;

  @Column({ default: false, type: 'boolean' })
  isBooked: boolean;

  @Column({ default: new Date(), type: 'date' })
  bookingDate: Date;

  @Column({ nullable: true })
  courtId: number;

  @Column({ default: false, type: 'bool' })
  isVip: boolean;

  // is booked , is busy , time is passed
  isDisable: boolean;

  // formate display time for user easy understand
  displayTime: string;
}
