import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import {
  CreateBookingDto,
  GuessCreateBookingDto,
} from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { SaleQueryDto } from 'src/sale/dto/sale-query.dto';
import { Public } from 'src/auth/auth.public';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Public()
  @Post('guess')
  createPublic(@Body() createBookingDto: GuessCreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }

  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @Req() req) {
    const user = req.user;
    return this.bookingService.create(createBookingDto, user);
  }

  @Get()
  findAll(@Query() query: SaleQueryDto) {
    return this.bookingService.findAll(query);
  }

  @Public()
  @Get('qr/:id')
  getKHQRImage(@Param('id') id: string) {
    return this.bookingService.generateKhqr(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(+id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(+id);
  }

  @Get('telegram/test')
  testTelegram() {
    return this.bookingService.sendMessageToGroup(
      'Test telegram working fine!!',
    );
  }
}
