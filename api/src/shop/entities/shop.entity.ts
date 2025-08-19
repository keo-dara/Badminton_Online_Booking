import { CoreEntity } from 'src/core/entities/core.entities';
import { System } from 'src/system/entities/system.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Shop extends CoreEntity {
  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @ManyToOne(() => System, (system) => system.shops)
  system: System;

  @OneToMany(() => User, (user) => user.shop)
  users: User[];

  @Column('text', { nullable: true })
  paymentString: string;
}
