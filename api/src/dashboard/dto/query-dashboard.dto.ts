import { IsDateString, IsOptional } from 'class-validator';

export class QueryDashboardDto {
  @IsDateString()
  @IsOptional()
  date?: string;
}
