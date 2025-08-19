import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Court } from './entities/court.entity';
import { FindOperator, ILike, Repository } from 'typeorm';
import {
  calculateSkip,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
} from 'src/core/dtos';
import { TimeService } from 'src/time/time.service';
import { QsFindOneCourtDto } from './dto/qs-find-one.dto';
import { GeneratedTime, Time } from 'src/time/entities/time.entity';
import { convertDisplay24Hour } from 'src/util/helper';

@Injectable()
export class CourtService {
  constructor(
    @InjectRepository(Court)
    private courtRepo: Repository<Court>,
    private timeService: TimeService,
  ) {}

  logger = new Logger('CourtService');

  async create(createCourtDto: CreateCourtDto, user: User) {
    const times = await Promise.all(
      createCourtDto.timeId.map((id) => this.timeService.findOne(id)),
    );
    this.logger.log(user);
    const court = await this.courtRepo.create({ ...createCourtDto, times });

    return this.courtRepo.save(court);
  }

  async findAll(pageOptionsDto: PageOptionsDto, enable?: boolean) {
    const whereClause: { name?: FindOperator<string>; enable?: boolean } = {};

    if (pageOptionsDto.search) {
      whereClause.name = ILike(`%${pageOptionsDto.search}%`);
    }

    if (enable !== undefined) {
      whereClause.enable = enable;
    }

    const [courts, itemCount] = await Promise.all([
      this.courtRepo.find({
        skip: calculateSkip(pageOptionsDto),
        take: pageOptionsDto.take,
        where: whereClause,
        relations: ['times'],
        order: { id: pageOptionsDto.order },
      }),
      this.courtRepo.count({
        where: whereClause,
      }),
    ]);

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(courts, pageMetaDto);
  }

  async findOne(id: number) {
    const exist = await this.courtRepo.findOne({
      where: { id },
      relations: ['times'],
    });

    if (!exist) {
      throw new NotFoundException('court not found');
    }
    return exist;
  }

  async findOneWithBusy(id: number, qs: QsFindOneCourtDto) {
    this.logger.log('find one with busy');

    const existing = await this.findOne(id);

    this.logger.log('original time length', existing.times.length);

    let gTimes: (GeneratedTime | null)[] = await Promise.all(
      existing.times.map((time) =>
        this.timeService.checkBusyGtimeNoThrow(time, +qs.bookingDate, id),
      ),
    );

    const hasNullGTime = gTimes.some((gTime) => gTime === null);

    if (hasNullGTime) {
      this.logger.log('generated is not exist: ', hasNullGTime);
      gTimes = await Promise.all(
        existing.times.map((g) =>
          this.timeService.createGTime(g, +qs.bookingDate, false, id),
        ),
      );
    }

    const availability = gTimes.map((g) => {
      const isDisable = this.isDisable(
        g.time,
        g.isBusy,
        g.isBooked,
        new Date(+qs.bookingDate),
      );

      const displayTime = convertDisplay24Hour(
        g.time.from,
        g.time.to,
        g.time.shift,
      );

      return { ...g, isDisable, displayTime };
    });

    this.logger.log('generated time length', gTimes.length);
    return {
      court: existing,
      availability: availability,
    };
  }

  async update(id: number, updateCourtDto: UpdateCourtDto) {
    const exist = await this.findOne(id);

    if (updateCourtDto.timeId) {
      const times = await Promise.all(
        updateCourtDto.timeId.map((id) => this.timeService.findOne(id)),
      );
      exist.times = times;
    }

    exist.enable = updateCourtDto.enable ?? true;
    exist.name = updateCourtDto.name;
    exist.description = updateCourtDto.description;
    exist.discount = updateCourtDto.discount;

    return this.courtRepo.save(exist);
  }

  remove(id: number) {
    return this.courtRepo.softDelete({
      id,
    });
  }
  isDisable(time: Time, isBusy: boolean, isBooked: boolean, date: Date) {
    const now = new Date();
    const from = Number(time.from);

    if (now.toDateString() !== date.toDateString()) {
      return isBusy || isBooked;
    }

    if (time.shift === 'morning') {
      return isBusy || isBooked || from <= now.getHours();
    }

    if (time.shift === 'afternoon') {
      // Correct afternoon logic, including 12 PM
      let from24Hour = from; // Default to 12-hour for 12 PM case
      if (from !== 12) {
        // For other afternoon hours (1 PM, 2 PM, etc.)
        from24Hour = from + 12;
      }
      return isBusy || isBooked || from24Hour <= now.getHours();
    }

    return false;
  }
}
