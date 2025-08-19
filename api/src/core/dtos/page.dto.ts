import { IsArray } from 'class-validator';

export class PageDto<T, U> {
  @IsArray()
  readonly data: T[];

  readonly meta: U;

  constructor(data: T[], meta: U) {
    this.data = data;
    this.meta = meta;
  }
}
