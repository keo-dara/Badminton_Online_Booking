import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { ShopPageOptionDto } from './dto/shop-page-option.dto';
import { User } from 'src/users/entities/user.entity';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Roles(Role.Admin)
  @Post()
  create(@Body() createShopDto: CreateShopDto, @Req() req) {
    const user = req.user as User;
    return this.shopService.create(createShopDto, user);
  }

  @Get()
  findAll(@Query() pageOptionsDto: ShopPageOptionDto, @Req() req) {
    const user = req.user as User;
    return this.shopService.findAll(pageOptionsDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shopService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateShopDto: UpdateShopDto,
    @Req() req,
  ) {
    const user = req.user as User;
    return this.shopService.update(+id, updateShopDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shopService.remove(+id);
  }
}
