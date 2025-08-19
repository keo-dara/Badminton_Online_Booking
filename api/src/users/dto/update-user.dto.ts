import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsNumber } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateUserBalanceDto {
  @IsNumber()
  balance: number;
}

export class UpdateUser2Fa {
  @IsBoolean()
  enable: boolean;
}
