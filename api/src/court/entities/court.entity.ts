import { Booking } from 'src/booking/entities/booking.entity';
import { CoreEntity } from 'src/core/entities/core.entities';
import { Time } from 'src/time/entities/time.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';

@Entity()
export class Court extends CoreEntity {
  @Column()
  name: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: 'https://i.imgur.com/64q2uy9.png' })
  img: string;

  @ManyToMany(() => Time, (time) => time.courts)
  times: Time[];

  @Column({ default: true })
  enable: boolean;

  @OneToMany(() => Booking, (g) => g.court)
  bookings: Booking[];

  @Column({ default: 0, type: 'real' })
  discount: number;
}
