import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { Order } from '../constants/order.enum';

export class PageOptionsDto {
  @IsEnum(Order)
  @IsOptional()
  order?: Order = Order.DESC;

  @IsNumberString()
  @IsOptional()
  page?: number = 1;

  @IsNumberString()
  @IsOptional()
  take?: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumberString()
  @IsOptional()
  startDate?: number;

  @IsNumberString()
  @IsOptional()
  endDate?: number;

  constructor(partial: Partial<PageOptionsDto>) {
    Object.assign(this, partial);
  }
}

export const calculateSkip = (dto: PageOptionsDto): number => {
  return (dto.page - 1) * dto.take;
};
