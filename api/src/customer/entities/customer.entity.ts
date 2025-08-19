import { CoreEntity } from 'src/core/entities/core.entities';
import { System } from 'src/system/entities/system.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Customer extends CoreEntity {
  @Column()
  name: string;

  @Column()
  phone: string;

  @ManyToOne(() => System, (system) => system.customers)
  system: System;

}
