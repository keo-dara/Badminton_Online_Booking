import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCourtDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  timeId: number[];

  @IsBoolean()
  enable: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  discount?: number;
}
