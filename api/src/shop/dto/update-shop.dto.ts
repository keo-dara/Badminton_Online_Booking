import { PartialType } from '@nestjs/mapped-types';
import { CreateShopDto } from './create-shop.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateShopDto extends PartialType(CreateShopDto) {
  @IsBoolean()
  @IsOptional()
  activeShop?: boolean;

  @IsString()
  @IsOptional()
  paymentString?: string;
}
