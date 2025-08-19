import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  Matches,
} from 'class-validator';
import { Shift } from 'src/auth/role.enum';

export class CreateTimeDto {
  // @Matches(/^(?:[0-9]|[0-9]\.5)$/, {
  //   message: 'Value must be a single digit (0-9) or single digit with .5',
  // })
  @IsNumber()
  from: number;

  // @Matches(/^(?:[0-9]|[0-9]\.5)$/, {
  //   message: 'Value must be a single digit (0-9) or single digit with .5',
  // })
  @IsNumber()
  to: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsBoolean()
  isVip?: boolean;

  @IsOptional()
  @IsIn([Shift.Afternoon, Shift.Morning])
  shift?: Shift;
}
