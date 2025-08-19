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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { User } from 'src/users/entities/user.entity';
import { PageOptionsDto } from 'src/core/dtos';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto, @Req() req) {
    const user = req.user as User;

    return this.customerService.create(createCustomerDto, user);
  }

  @Get()
  findAll(@Query() pageOptionsDto: PageOptionsDto, @Req() req) {
    const user = req.user;
    return this.customerService.findAll(pageOptionsDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    const user = req.user;
    return this.customerService.findOne(+id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const user = req.user;
    return this.customerService.remove(+id, user);
  }
}
