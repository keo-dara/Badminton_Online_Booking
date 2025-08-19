import { Catalog } from 'src/catalog/entities/catalog.entity';
import { CoreEntity } from 'src/core/entities/core.entities';
import { Customer } from 'src/customer/entities/customer.entity';
import { Shop } from 'src/shop/entities/shop.entity';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class System extends CoreEntity {
  @Column()
  name: string;

  @OneToMany(() => User, (user) => user.system)
  users: User[];

  @OneToMany(() => Subscription, (system) => system.status)
  subscriptions: Subscription[];

  @OneToMany(() => Shop, (shop) => shop.system)
  shops: Shop[];

  @OneToMany(() => Catalog, (c) => c.system)
  catalogs: Catalog[];

  @Column({ default: 0 })
  tax: number;

  @OneToMany(() => Customer, (customer) => customer.system)
  customers: Customer[];
}
