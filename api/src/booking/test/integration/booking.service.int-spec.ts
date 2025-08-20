import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { Role, SaleStatus, Shift } from 'src/auth/role.enum';
import { BookingService } from 'src/booking/booking.service';
import { Booking } from 'src/booking/entities/booking.entity';
import { CourtService } from 'src/court/court.service';
import { Court } from 'src/court/entities/court.entity';
import { Time } from 'src/time/entities/time.entity';
import { TimeService } from 'src/time/time.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

describe('BookingService', () => {
  let bookingService: BookingService;
  let timeService: TimeService;
  let time: Time;
  let time2: Time;
  let time3: Time;
  let booking: Booking;
  let adminUser: User;
  let rootUser: User;
  let court: Court;
  let court2: Court;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    bookingService = module.get(BookingService);
    timeService = module.get(TimeService);
    const userService = module.get(UsersService);
    const courtService = module.get(CourtService);
    time = await timeService.create({
      from: 8,
      to: 9,
      price: 1,
      shift: Shift.Morning,
    });
    time2 = await timeService.create({
      from: 10,
      to: 11,
      price: 1,
      shift: Shift.Morning,
    });
    time3 = await timeService.create({
      from: 12,
      to: 1,
      price: 36,
      shift: Shift.Morning,
    });

    rootUser = await userService.create({
      userName: 'sadsadasas',
      password: 'password',
      role: Role.Root,
    });
    adminUser = await userService.create(
      {
        userName: 'CatalogsdsadsdasService2',
        password: 'password',
        role: Role.Admin,
      },
      rootUser,
    );
    court = await courtService.create(
      {
        name: 'New Court',
        description: '',
        timeId: [time.id, time2.id],
        enable: true,
      },
      adminUser,
    );
    court2 = await courtService.create(
      {
        name: 'New Court',
        description: '',
        timeId: [time.id, time2.id],
        enable: true,
        discount: 30,
      },
      adminUser,
    );
  });

  it('it should stop proccess when it done', async () => {
    expect(bookingService.processingOrder).toBe(false);
    expect(bookingService.processingBooking).toBe(false);
    await bookingService.clearBookingLast();
    await bookingService.unprocessBookingLast();
    expect(bookingService.processingBooking).toBe(false);
    expect(bookingService.processingOrder).toBe(false);
  });

  it('should be define', () => {
    expect(adminUser.system).toBeDefined();
    expect(bookingService).toBeDefined();
  });

  it('is proccessing is false', () => {
    expect(bookingService.processingOrder).toBe(false);
    expect(bookingService.processingBooking).toBe(false);
  });

  it('booking create work', async () => {
    booking = await bookingService.create(
      {
        timeId: [time.id, time2.id],
        customer: 'user',
        phone: '012334466',
        bookingAt: Date.now(),
        courtId: court.id,
        bookPercent: 50,
      },
      adminUser,
    );

    expect(booking.customer).toBe('user');
    expect(booking.status).toBe(SaleStatus.Pending);
    expect(booking.price).toBe(1);
    expect(booking.total).toBe(2);
    expect(booking.discount).toBe(0);
    expect(booking.courtName).toBe(court.name);
  });

  it('bad request time is booking', async () => {
    try {
      const result = await bookingService.create(
        {
          timeId: [time.id],
          customer: 'user',
          phone: '012334466',
          bookingAt: Date.now(),
          courtId: court.id,
          bookPercent: 100,
        },
        adminUser,
      );

      expect(result).toBeUndefined();
    } catch (error) {
      expect(error.status).toBe(400);
    }
  });

  it('update paid time is booked', async () => {
    const result = await bookingService.update(booking.id, {
      status: SaleStatus.Paid,
      pushNotification: true,
    });

    expect(result.times[0].isBooked).toBe(true);
    expect(result.notification).toBe(true);
  });

  it('time is already booked', async () => {
    try {
      const result = await bookingService.create(
        {
          timeId: [time.id],
          customer: 'user',
          phone: '012334466',
          bookingAt: Date.now(),
          bookPercent: 100,
          courtId: court.id,
        },
        adminUser,
      );

      expect(result).toBeUndefined();
    } catch (error) {
      expect(error.status).toBe(400);
    }
  });

  it('booking create next days', async () => {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    const tomorrow = Date.now() + oneDayInMilliseconds;

    booking = await bookingService.create(
      {
        timeId: [time.id],
        customer: 'user',
        phone: '012334466',
        bookingAt: tomorrow,
        bookPercent: 100,
        courtId: court.id,
      },
      adminUser,
    );

    expect(booking.customer).toBe('user');
    expect(booking.status).toBe(SaleStatus.Pending);
  });

  it('clear payment test', async () => {
    const bookingAt = Date.now();
    const bookingPlus24Hours = bookingAt + 999 * 60 * 60 * 1000;
    await bookingService.create(
      {
        timeId: [time.id, time2.id],
        customer: 'user',
        phone: '012334466',
        bookingAt: bookingPlus24Hours,
        courtId: court.id,
        bookPercent: 50,
      },
      adminUser,
    );

    const result = await bookingService.clearBookingLast();

    expect(result.length).toBe(2);
    expect(bookingService.processingOrder).toBe(false);
  });

  it('filter by date', async () => {
    const today = new Date();
    const formate_date = today.toISOString().split('T')[0];
    const bookings = await bookingService.findAll({
      page: 1,
      take: 10,
      date: formate_date,
    });

    expect(bookings.meta.itemCount).toBe(3);
  });

  it('filter by phone', async () => {
    const bookings = await bookingService.findAll({
      page: 1,
      take: 10,
      phone: '014',
    });

    expect(bookings.meta.itemCount).toBe(0);
  });

  it('filter by code to be one', async () => {
    const bookings = await bookingService.findAll({
      page: 1,
      take: 10,
      no: booking.no,
    });

    expect(bookings.data[0].times[0].displayTime.length).toBeGreaterThan(5);
    expect(bookings.meta.itemCount).toBe(1);
  });

  it('booking when payment is 100% should be paid', async () => {
    const oneDayInMilliseconds = 96 * 60 * 60 * 1000;
    const tomorrow = Date.now() + oneDayInMilliseconds;

    const booking = await bookingService.create(
      {
        timeId: [time.id],
        customer: 'user',
        phone: '012334466',
        bookingAt: tomorrow,
        bookPercent: 100,
        courtId: court.id,
      },
      adminUser,
    );

    const updated = await bookingService.update(booking.id, {
      status: SaleStatus.Paid,
    });

    expect(booking.bookPercent).toBe(100);
    expect(updated.status).toBe(SaleStatus.Paid);
  });

  describe('make sure discount working', () => {
    it('create booking with court has discount', async () => {
      booking = await bookingService.create(
        {
          timeId: [time.id, time2.id],
          customer: 'user',
          phone: '012334466',
          bookingAt: Date.now(),
          courtId: court2.id,
          bookPercent: 100,
        },
        adminUser,
      );
      expect(booking.customer).toBe('user');
      expect(booking.status).toBe(SaleStatus.Pending);
      expect(booking.price).toBe(1.4);
      expect(booking.discount).toBe(30);
      expect(booking.total).toBe(1.4);
      expect(booking.courtName).toBe(court.name);
    });

    it('updated paid working', async () => {
      const result = await bookingService.update(booking.id, {
        status: SaleStatus.Paid,
      });

      expect(result.times[0].isBooked).toBe(true);
      expect(result.price).toBe(1.4);
      expect(result.total).toBe(1.4);
      expect(booking.discount).toBe(30);
    });

    it('should be round', async () => {
      booking = await bookingService.create(
        {
          timeId: [time3.id],
          customer: 'user',
          phone: '012334466',
          bookingAt: Date.now(),
          courtId: court2.id,
          bookPercent: 100,
        },
        adminUser,
      );
      expect(booking.customer).toBe('user');
      expect(booking.status).toBe(SaleStatus.Pending);
      expect(booking.price).toBe(25.2);
      expect(booking.discount).toBe(30);
      expect(booking.total).toBe(25.2);
      expect(booking.courtName).toBe(court.name);
    });
  });

  it('cancel booking push notification', async () => {
    const oneDayInMilliseconds = 192 * 60 * 60 * 1000;
    const booking = await bookingService.create(
      {
        timeId: [time.id],
        customer: 'user',
        phone: '012334466',
        bookingAt: Date.now() + oneDayInMilliseconds,
        courtId: court.id,
        bookPercent: 0,
      },
      adminUser,
    );

    const result = await bookingService.update(booking.id, {
      status: SaleStatus.Cancelled,
      pushNotification: true,
    });
    const messageStatus = bookingService.makeStatusMessage({
      ...booking,
      status: SaleStatus.PaidSome,
    });

    expect(messageStatus).toBe('UNPAID');
    expect(result.notification).toBe(true);
    expect(result.status).toBe(SaleStatus.Cancelled);
  });
});
