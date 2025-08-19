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
import { CatalogService } from './catalog.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { PageOptionsDto } from 'src/core/dtos';
import { User } from 'src/users/entities/user.entity';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Roles(Role.Admin)
  @Post()
  create(@Body() createCatalogDto: CreateCatalogDto, @Req() req) {
    const user = req.user as User;
    return this.catalogService.create(createCatalogDto, user);
  }

  @Get()
  findAll(@Query() pageOptionsDto: PageOptionsDto, @Req() req) {
    const user = req.user as User;
    return this.catalogService.findAll(pageOptionsDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catalogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCatalogDto: UpdateCatalogDto) {
    return this.catalogService.update(+id, updateCatalogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catalogService.remove(+id);
  }
}
