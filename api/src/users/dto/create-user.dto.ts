import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Role } from 'src/auth/role.enum';
import { CreateShopDto } from 'src/shop/dto/create-shop.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  userName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsIn([Role.Admin, Role.Retailer])
  role: Role;

  @IsString()
  @IsOptional()
  @IsUrl()
  profilePicture?: string;

  @IsString()
  @IsOptional()
  systemName?: string;

  @ValidateNested()
  shop?: CreateShopDto;

  @IsInt()
  @IsOptional()
  shopId?: number;
}

export class CreatePaymentUserDto {
  @IsString()
  tag: string;

  @IsString()
  accountID: string;

  @IsString()
  merchantID: string;

  @IsString()
  merchantName: string;

  @IsString()
  merchantCity: string;

  @IsString()
  acquiringBank: string;

  @IsNumberString()
  authCode?: string;
}
