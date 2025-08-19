import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Role } from 'src/auth/role.enum';
import { System } from 'src/system/entities/system.entity';
import { CoreEntity } from 'src/core/entities/core.entities';
import { Shop } from 'src/shop/entities/shop.entity';

@Entity({ name: 'users' })
export class User extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userName: string;

  @Column()
  password: string;

  @Column({ nullable: true, default: '' })
  profilePicture: string;
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Retailer,
  })
  role: Role;

  @ManyToOne(() => User, { nullable: true })
  createdBy: User;

  @OneToMany(() => User, (user) => user.createdBy)
  createdUsers: User[];

  @Column('text', { nullable: true })
  twoFactorAuthenticationSecret: string;

  @ManyToOne(() => System, (user) => user.users)
  system: System;

  @ManyToOne(() => Shop, (s) => s.users)
  shop: Shop;

  @Column('date', { nullable: true })
  blockedAt: Date;
}
