import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTimeDto } from './dto/create-time.dto';
import { UpdateTimeDto } from './dto/update-time.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { GeneratedTime, Time } from './entities/time.entity';
import {
  calculateSkip,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
} from 'src/core/dtos';
import { convertDisplay24Hour } from 'src/util/helper';
@Injectable()
export class TimeService {
  constructor(
    @InjectRepository(Time)
    private timeRepository: Repository<Time>,
    @InjectRepository(GeneratedTime)
    private gTimeRepository: Repository<GeneratedTime>,
  ) {}

  logger = new Logger(TimeService.name);

  async create({
    from,
    to,
    price,
    shift,
    isVip,
  }: CreateTimeDto): Promise<Time> {
    const time = await this.timeRepository.findOne({
      where: {
        from,
        to,
        shift,
        isVip,
      },
    });

    this.logger.log(time);

    if (time) {
      throw new BadRequestException('time is already exist');
    }

    const t = await this.timeRepository.save({
      from,
      to,
      shift,
      price,
      isVip: isVip ?? false,
    });
    this.logger.log(`TIME ID: ${t.id}`);
    t.displayTime = convertDisplay24Hour(from, to, shift);
    return t;
  }

  async createGTime(
    time: Time,
    createdAt?: number,
    isBusy?: boolean,
    courtId?: number,
  ): Promise<GeneratedTime> {
    const existingGTime = await this.findOneGTime(
      time,
      createdAt,
      courtId,
      time.isVip,
    );

    if (existingGTime) {
      return existingGTime;
    }

    const gtime = this.gTimeRepository.create({
      time: time,
      createdAt: new Date(createdAt),
      isBusy: isBusy,
      courtId,
      isVip: time.isVip,
    });

    return this.gTimeRepository.save(gtime);
  }

  async findOneGTime(
    time: Time,
    createdAt: number,
    courtId?: number,
    isVip?: boolean,
  ): Promise<GeneratedTime | null> {
    const startOfDay = new Date(createdAt);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(createdAt);
    endOfDay.setHours(23, 59, 59, 999);

    this.logger.log(
      `findOneGTime TIME ID: ${time.id} FROM: ${time.from} TO: ${time.to} `,
    );

    const found = await this.gTimeRepository.findOne({
      where: {
        createdAt: Between(startOfDay, endOfDay),
        time: {
          from: time.from,
          to: time.to,
          shift: time.shift,
        },
        courtId,
        isVip,
      },
      relations: ['time'],
    });

    this.logger.warn(`NOT FOUND : ID ${found?.id} has TIME ${found?.time?.id}`);

    return found;
  }

  async checkBusyGtime(time: Time, createdAt: number, courtId?: number) {
    const gTime = await this.findOneGTime(time, createdAt, courtId, time.isVip);

    if (gTime && gTime.isBooked === true) {
      throw new BadRequestException(
        `${gTime.time.shift.toUpperCase()}: ${gTime.displayTime}  is already booked`,
      );
    }

    if (gTime && gTime.isBusy === true) {
      throw new BadRequestException(
        `${gTime.time.shift.toUpperCase()}: ${gTime.displayTime} is busy`,
      );
    }
    return gTime;
  }

  async checkBusyGtimeNoThrow(
    time: Time,
    createdAt: number,
    courtId?: number,
  ): Promise<GeneratedTime | null> {
    return await this.findOneGTime(time, createdAt, courtId, time.isVip);
  }

  async findOneGTimeById(id: number): Promise<GeneratedTime> {
    const gTime = await this.gTimeRepository.findOne({
      where: { id },
    });

    return gTime;
  }
  async updateGTime(
    id: number,
    update: { isBooked: boolean; isBusy: boolean },
  ): Promise<GeneratedTime> {
    const time = await this.gTimeRepository.findOne({
      where: { id },
      relations: ['time'],
    });

    if (!time) {
      throw new BadRequestException('time is not exist');
    }

    time.isBooked = update.isBooked;
    time.isBusy = update.isBusy;

    return this.gTimeRepository.save(time);
  }

  async findAll(pageOptionsDto: PageOptionsDto) {
    const [time, itemCount] = await Promise.all([
      this.timeRepository.find({
        skip: calculateSkip(pageOptionsDto),
        take: pageOptionsDto.take,
        order: { id: pageOptionsDto.order },
      }),
      this.timeRepository.count(),
    ]);

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(this.displayTime(time), pageMetaDto);
  }

  async findOne(id: number): Promise<Time> {
    const found = await this.timeRepository.findOne({
      where: {
        id,
      },
    });

    if (!found) {
      throw new NotFoundException('time is not exist');
    }

    return found;
  }

  // loop through the time and formate the display time
  displayTime(times: Time[]): Time[] {
    return times.map((time) => {
      time.displayTime = convertDisplay24Hour(time.from, time.to, time.shift);
      return time;
    });
  }

  async update(id: number, updateTimeDto: UpdateTimeDto): Promise<Time> {
    const existing = await this.findOne(id);

    if (updateTimeDto.from) {
      existing.from = updateTimeDto.from;
    }
    if (updateTimeDto.to) {
      existing.to = updateTimeDto.to;
    }

    if (updateTimeDto.price) {
      existing.price = updateTimeDto.price;
    }

    if (updateTimeDto.shift) {
      existing.shift = updateTimeDto.shift;
    }

    if (updateTimeDto.isVip !== undefined || updateTimeDto.isVip !== null) {
      existing.isVip = updateTimeDto.isVip;
    }

    const time = await this.timeRepository.findOne({
      where: {
        from: existing.from,
        to: existing.to,
        shift: existing.shift,
      },
    });

    if (time && time.id !== existing.id) {
      throw new BadRequestException('Duplicate time');
    }

    return this.timeRepository.save(existing);
  }

  remove(id: number) {
    return this.timeRepository.softDelete({ id });
  }
}
