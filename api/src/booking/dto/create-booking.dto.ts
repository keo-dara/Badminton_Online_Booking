import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { SalePayment, SaleStatus } from 'src/auth/role.enum';

export class CreateBookingDto {
  @IsArray()
  @ArrayMaxSize(3)
  timeId: number[];

  @IsString()
  customer: string;

  @IsString()
  phone: string;

  @IsNumber()
  bookingAt: number;

  @IsOptional()
  @IsEnum([
    SaleStatus.Pending,
    SaleStatus.Paid,
    SaleStatus.Expired,
    SaleStatus.Cancelled,
  ])
  status?: SaleStatus;

  @IsNumber()
  courtId: number;

  @IsOptional()
  @IsEnum([SalePayment.Cash, SalePayment.KhQr])
  paymentType?: SalePayment;

  @Min(0)
  @Max(100)
  @IsInt()
  bookPercent: number;
}
export class GuessCreateBookingDto {
  @IsArray()
  @ArrayMaxSize(2)
  timeId: number[];

  @IsString()
  customer: string;

  @IsString()
  phone: string;

  @IsNumber()
  bookingAt: number;

  @IsOptional()
  @IsEnum([
    SaleStatus.Pending,
    SaleStatus.Paid,
    SaleStatus.Expired,
    SaleStatus.Cancelled,
  ])
  status?: SaleStatus;

  @IsNumber()
  courtId: number;

  @IsOptional()
  @IsEnum([SalePayment.Cash, SalePayment.KhQr])
  paymentType?: SalePayment;

  @Min(20)
  @Max(100)
  @IsInt()
  bookPercent: number;
}
