import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { TimeModule } from 'src/time/time.module';
import { KhqrModule } from 'src/khqr/khqr.module';
import { CustomerModule } from 'src/customer/customer.module';
import { CourtModule } from 'src/court/court.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    TimeModule,
    KhqrModule,
    CustomerModule,
    CourtModule,
    UsersModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
