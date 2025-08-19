import { IsNumberString } from 'class-validator';

export class DateParamQuery {
  @IsNumberString()
  startDate: number;

  @IsNumberString()
  endDate: number;
}
