import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Role } from '../role.enum';
import { CreateShopDto } from 'src/shop/dto/create-shop.dto';

export class SignUpDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsIn([Role.Admin, Role.Sale])
  role?: Role;

  @IsOptional()
  @IsNumberString()
  authCode?: string;

  @IsInt()
  @IsOptional()
  shopId?: number;

  @IsString()
  @IsOptional()
  systemName?: string;

  @ValidateNested()
  shop?: CreateShopDto;
}
