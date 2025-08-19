import { IsString } from 'class-validator';

export class CreateShopDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;
}
