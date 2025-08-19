import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PageDto, PageMetaDto, PageOptionsDto } from 'src/core/dtos';
import { User } from './entities/user.entity';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto, @Req() req) {
    const user = req.user;
    return this.usersService.create(createUserDto, user);
  }

  @Roles(Role.Admin)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @Req() req,
  ): Promise<PageDto<User, PageMetaDto>> {
    const user = req.user;
    return this.usersService.findAll(pageOptionsDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Roles(Role.Root)
  @Get('/system/root')
  @HttpCode(HttpStatus.OK)
  async findAllSysteUser(
    @Query() pageOptionsDto: PageOptionsDto,
    @Req() req,
  ): Promise<PageDto<User, PageMetaDto>> {
    const user = req.user;
    return this.usersService.findAll(pageOptionsDto, user);
  }

  @Roles(Role.Admin)
  @Post('/blocking/:id')
  async blockUser(@Param('id') id: string, @Req() req) {
    const user = req.user;
    return this.usersService.blockUser(+id, user);
  }
}
