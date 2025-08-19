import { IsNumberString } from 'class-validator';

export class QsFindOneCourtDto {
  @IsNumberString()
  bookingDate: string;
}
