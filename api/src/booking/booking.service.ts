import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './entities/booking.entity';
import { Between, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeService } from 'src/time/time.service';
import { SalePayment, SaleStatus } from 'src/auth/role.enum';
import * as qr from 'qrcode';
import { calculateSkip, PageDto, PageMetaDto } from 'src/core/dtos';
import { KhQr } from 'src/khqr/entities/khqr.entity';
import { User } from 'src/users/entities/user.entity';
import { KhqrService } from 'src/khqr/khqr.service';
import { Cron } from '@nestjs/schedule';
import { GeneratedTime } from 'src/time/entities/time.entity';
import { CustomerService } from 'src/customer/customer.service';
import { CourtService } from 'src/court/court.service';
import appConfig from 'src/core/config';
import { Telegraf } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';
import { convertDisplay24Hour } from 'src/util/helper';
import { SaleQueryDto } from 'src/sale/dto/sale-query.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private timeService: TimeService,
    private khqrService: KhqrService,
    private customerService: CustomerService,
    private courtService: CourtService,
    @InjectBot() private bot: Telegraf,
  ) {}

  logger = new Logger(BookingService.name);

  async create(createBookingDto: CreateBookingDto, user?: User) {
    const court = await this.courtService.findOne(createBookingDto.courtId);

    const times = await Promise.all(
      createBookingDto.timeId.map((id) => this.timeService.findOne(id)),
    );
    let gTimes: GeneratedTime[] = await Promise.all(
      times.map((time) =>
        this.timeService.checkBusyGtime(
          time,
          createBookingDto.bookingAt,
          court.id,
        ),
      ),
    );

    let payment: KhQr;
    let payment2: KhQr;

    const discountPercent = court.discount / 100;
    const listingPrice = times.reduce((p, c) => {
      return p + c.price * 1;
    }, 0);
    const discount = listingPrice * discountPercent;
    const total = Math.floor((listingPrice - discount) * 100) / 100;

    const price = (createBookingDto.bookPercent * total) / 100;
    const price2 = total - price;

    if (user?.shop?.paymentString) {
      const info = this.khqrService.parseQrString(user.shop.paymentString);
      payment = await this.khqrService.newTransaction(price, info);
      payment2 = await this.khqrService.newTransaction(price2, info);
    } else {
      const info = this.khqrService.parseQrString('');
      payment = await this.khqrService.newTransaction(price, info);
      payment2 = await this.khqrService.newTransaction(price2, info);
    }

    if (gTimes[0] === null) {
      gTimes = await Promise.all(
        times.map((g) =>
          this.timeService.createGTime(
            g,
            createBookingDto.bookingAt,
            true,
            court.id,
          ),
        ),
      );
    } else {
      gTimes = await Promise.all(
        gTimes.map((g) =>
          this.timeService.updateGTime(g.id, {
            isBooked: false,
            isBusy: true,
          }),
        ),
      );
    }

    const count = await this.bookingRepository.count();

    if (user) {
      await this.customerService.create(
        {
          name: createBookingDto.customer,
          phone: createBookingDto.phone,
        },
        user,
      );
    }

    const booking = await this.bookingRepository.create({
      times: gTimes,
      customer: createBookingDto.customer,
      phone: createBookingDto.phone,
      price,
      total: total,
      no: `NO${count + 1000}`,
      payment,
      payment2,
      bookPercent: createBookingDto.bookPercent,
      bookingDate: new Date(createBookingDto.bookingAt),
      court,
      courtName: court.name,
      discount: court.discount,
    });

    return await this.bookingRepository.save(booking);
  }

  async findAll(query: SaleQueryDto) {
    if (query.startDate && query.endDate) {
      const startDate = new Date(Number(query.startDate));
      const endDate = new Date(Number(query.endDate));

      if (endDate < startDate) {
        throw new BadRequestException(
          'End date must be greater than start date',
        );
      }
    }

    const whereCondition: any = {
      status: query.status,
    };

    if (query.startDate) {
      whereCondition.createdAt = Between(
        new Date(Number(query.startDate)),
        new Date(Number(query.endDate)),
      );
    }

    if (query.date) {
      whereCondition.createdAt = Raw((alias) => `DATE(${alias}) = :date`, {
        date: query.date,
      });
    }

    if (query.phone) {
      whereCondition.phone = Raw((alias) => `${alias} LIKE :phone`, {
        phone: `%${query.phone}%`,
      });
    }

    if (query.no) {
      whereCondition.no = Raw((alias) => `${alias} LIKE :no`, {
        no: `%${query.no}%`,
      });
    }

    const [bookings, itemCount] = await Promise.all([
      this.bookingRepository.find({
        skip: calculateSkip(query),
        take: query.take,
        order: {
          id: query.order,
        },
        relations: ['times', 'times.time', 'court'],
        where: whereCondition,
      }),
      this.bookingRepository.count({
        where: whereCondition,
      }),
    ]);
    const data = bookings.map((booking) => ({
      ...booking,
      times: booking.times
        .map((t) => ({
          ...t,
          displayTime:
            t?.time == null
              ? 'NA'
              : convertDisplay24Hour(t.time.from, t.time.to, t.time.shift),
        }))
        .sort((a, b) => (a.time?.from ?? 0) - (b.time?.from ?? 0)),
    }));
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto: query });
    return new PageDto(data, pageMetaDto);
  }

  async findOne(id: number) {
    const booking = await this.bookingRepository.findOne({
      where: {
        id,
      },
      relations: ['times', 'payment', 'times.time', 'payment2'],
    });

    if (!booking) {
      throw new NotFoundException('booking is not found');
    }

    const now = Date.now();
    const hashString = ``;

    booking.hashString = this.khqrService.getHash(hashString);
    booking.url = appConfig.abaApiUrl;

    booking.time = now;
    booking.merchantId = appConfig.merchantId;

    return booking;
  }

  async findOneWithBusy(id: number) {
    const booking = await this.bookingRepository.findOne({
      where: {
        id,
      },
      relations: ['times', 'payment'],
    });

    if (!booking) {
      throw new NotFoundException('booking is not found');
    }

    return booking;
  }

  async update(
    id: number,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const booking = await this.findOne(id);

    if (updateBookingDto.status === SaleStatus.Paid) {
      let status = SaleStatus.PaidSome;

      if (
        booking.status === SaleStatus.PaidSome ||
        booking.bookPercent === 100
      ) {
        status = SaleStatus.Paid;
      }

      booking.status = status;

      await Promise.all(
        booking.times.map((time) =>
          this.timeService.updateGTime(time.id, {
            isBooked: true,
            isBusy: false,
          }),
        ),
      );
    }

    if (updateBookingDto.status === SaleStatus.Expired) {
      booking.status = SaleStatus.Expired;

      await Promise.all(
        booking.times.map((time) =>
          this.timeService.updateGTime(time.id, {
            isBooked: false,
            isBusy: false,
          }),
        ),
      );
    }

    if (updateBookingDto.status === SaleStatus.Cancelled) {
      booking.status = updateBookingDto.status;

      await Promise.all(
        booking.times.map((time) =>
          this.timeService.updateGTime(time.id, {
            isBooked: false,
            isBusy: false,
          }),
        ),
      );
    }

    if (updateBookingDto.customer) {
      booking.customer = updateBookingDto.customer;
    }
    if (updateBookingDto.phone) {
      booking.phone = updateBookingDto.phone;
    }

    const enableNotification =
      booking.status === SaleStatus.PaidSome ||
      booking.status === SaleStatus.Paid ||
      booking.status === SaleStatus.Cancelled;

    if (enableNotification && updateBookingDto.pushNotification == true) {
      this.logger.log(`Sending notification for booking ID: ${booking.id}`);
      // send notification to telegram
      await this.sendMessageToGroup(this.makeMessage(booking));
    } else {
      this.logger.log(`No notification sent for booking ID: ${booking.id}`);
    }

    await this.bookingRepository.save(booking);

    const found = await this.findOne(id);

    found.notification =
      enableNotification && updateBookingDto.pushNotification == true;
    return found;
  }

  async remove(id: number) {
    const found = await this.findOne(id);

    if (found.status !== SaleStatus.Expired) {
      throw new BadRequestException(
        'Wait for booking time release before cancel!',
      );
    }

    return this.bookingRepository.softDelete({
      id,
    });
  }

  async generateKhqr(id: number): Promise<{
    qr: string;
    booking: Booking;
    amount: number;
  }> {
    const booking = await this.findOne(id);

    if (!booking.payment) {
      throw new NotFoundException('Configure your KHQR for scan to pay');
    }

    const dataqr =
      booking.status === SaleStatus.PaidSome
        ? booking.payment2.data
        : booking.payment.data;
    const amount =
      booking.status === SaleStatus.PaidSome
        ? booking.payment2.amount
        : booking.payment.amount;

    const qr = await this.generateQr(dataqr);
    return {
      qr,
      booking,
      amount,
    };
  }

  async generateQr(value: string): Promise<string> {
    return await qr.toDataURL(value);
  }

  processingOrder: boolean = false;

  @Cron('*/1 * * * * *')
  async clearBookingLast() {
    if (this.processingOrder) {
      return [];
    }

    this.processingOrder = true;

    const lastBookings: {
      id: number;
      md5: string;
      no: string;
      total: number;
      price: number;
    }[] = await this.bookingRepository.query(
      `
        SELECT s.id, kq.md5, s.price, s.total, s.no
        FROM "booking" s
        LEFT JOIN kh_qr kq ON s."paymentId" = kq.id
        WHERE s."updatedAt" >= NOW() - INTERVAL '5 minutes'
          AND s.status = 'pending'
        LIMIT 50
      `,
    );

    // this.logger.log(lastBookings);
    if (lastBookings.length === 0) {
      this.processingOrder = false;
      return [];
    }

    const md5list = lastBookings.map(({ no }) => no);

    const payments = await Promise.all(
      md5list.map(async (no) => {
        return this.khqrService.checkTransactionAba(no);
      }),
    );

    this.logger.log('Result from ABA');
    // this.logger.log(payments);

    const successId: {
      id: number;
      price: number;
      total: number;
    }[] = [];

    if (payments) {
      payments.forEach((item) => {
        this.logger.log(item);
        if (item && item.payment_status === 'APPROVED') {
          const filteredResult = appConfig.isTestEnv
            ? lastBookings
            : lastBookings.filter((info) => info.no === item.no);

          const { id, price, total } = filteredResult[0];
          successId.push({
            id,
            price,
            total,
          });
        }
      });
    }

    this.logger.log('SHOULD UPDATE');
    this.logger.log(successId);
    const items: Booking[] = [];

    await Promise.all(
      successId.map(async ({ id }) => {
        const updated = await this.update(id, {
          status: SaleStatus.Paid,
          paymentType: SalePayment.KhQr,
          pushNotification: true,
        });
        items.push(updated);
        return updated;
      }),
    );
    this.processingOrder = false;
    this.logger.log(`clearBookingLast STATE: ${this.processingOrder}`, items);

    return items;
  }

  processingBooking: boolean = false;

  @Cron('*/5 * * * * *')
  async unprocessBookingLast() {
    if (this.processingBooking) {
      return [];
    }

    this.processingBooking = true;

    const result: { id: number; md5: string }[] =
      await this.bookingRepository.query(
        `
        SELECT s.id, kq.md5
        FROM "booking" s
        LEFT JOIN kh_qr kq ON s."paymentId" = kq.id
        WHERE s."updatedAt" < NOW() - INTERVAL '5 minutes'
          AND s.status = 'pending'
        LIMIT 50
      `,
      );
    const idlist = result.map(({ id }) => id);

    const items: Booking[] = [];

    await Promise.all(
      idlist.map(async (id) => {
        const updated = await this.update(id, {
          status: SaleStatus.Expired,
        });

        items.push(updated);
      }),
    ).finally(() => {
      this.processingBooking = false;
    });
  }

  async sendMessageToGroup(message: string): Promise<boolean> {
    if (appConfig.isTestEnv) {
      return true;
    }

    try {
      if (appConfig.telegramGroup) {
        await this.bot.telegram.sendMessage(appConfig.telegramGroup, message);
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  makeMessage(booking: Booking): string {
    const display = booking.times
      .map(({ time }) => convertDisplay24Hour(time.from, time.to, time.shift))
      .join(' ');

    return `
    🚨 NEW BOOKING (ID: ${booking.no})
    👤 Customer: ${booking.customer}
    📞 Phone: ${booking.phone}

    🏸 ${booking.courtName}
    ⏰ ${display}

    💰 Deposit: $${booking.price} (${booking.bookPercent}%)
    💳 Payment Status: ${this.makeStatusMessage(booking)}
    🕒 ${booking.createdAt.toDateString()}

    🖥 Manage order in Portal: https://admin.vsmashbadminton.online
      `;
  }

  makeStatusMessage(booking: Booking): string {
    if (booking.bookPercent == 0 && booking.status == SaleStatus.PaidSome) {
      return 'UNPAID';
    }

    return booking.status.toUpperCase();
  }
}
