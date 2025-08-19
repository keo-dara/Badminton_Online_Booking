import { PartialType } from '@nestjs/mapped-types';
import {
  IsBooleanString,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { SaleStatus } from 'src/auth/role.enum';
import { PageOptionsDto } from 'src/core/dtos';

export class SaleQueryDto extends PartialType(PageOptionsDto) {
  @IsIn([
    SaleStatus.Draft,
    SaleStatus.Cancelled,
    SaleStatus.Paid,
    SaleStatus.PaidSome,
  ])
  @IsOptional()
  status?: SaleStatus;

  @IsBooleanString()
  @IsOptional()
  ignoreDraft?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  no?: string;
}
