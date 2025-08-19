import { CoreEntity } from 'src/core/entities/core.entities';
import { System } from 'src/system/entities/system.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Catalog extends CoreEntity {
  @Column()
  name: string;

  @ManyToOne(() => System, (s) => s.catalogs)
  system: System;
}
