import { PartialType } from '@nestjs/mapped-types';
import { PageOptionsDto } from 'src/core/dtos';

export class ShopPageOptionDto extends PartialType(PageOptionsDto) {}
