import { CoreEntity } from 'src/core/entities/core.entities';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Plan extends CoreEntity {
  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  duration: number;

  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];
}
