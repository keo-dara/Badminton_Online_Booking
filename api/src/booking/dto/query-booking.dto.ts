import { PartialType } from '@nestjs/mapped-types';
import { IsBooleanString, IsIn, IsOptional } from 'class-validator';
import { SaleStatus } from 'src/auth/role.enum';
import { PageOptionsDto } from 'src/core/dtos';

export class BookingQueryDto extends PartialType(PageOptionsDto) {
  @IsIn([SaleStatus.Pending, SaleStatus.Cancelled, SaleStatus.Paid])
  @IsOptional()
  status?: SaleStatus;

  @IsBooleanString()
  @IsOptional()
  ignoreDraft?: string;
}
