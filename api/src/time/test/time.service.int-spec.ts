import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import { TimeService } from '../time.service';
import { CreateTimeDto } from '../dto/create-time.dto';
import { validate } from 'class-validator';
import { Shift } from 'src/auth/role.enum';
import { convertDisplay24Hour } from 'src/util/helper';

describe('TimeService', () => {
  let userService: UsersService;
  let timeService: TimeService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userService = module.get(UsersService);
    timeService = module.get(TimeService);
  });

  it('to be define', () => {
    expect(userService).toBeDefined();
    expect(timeService).toBeDefined();
  });

  it('validation work', async () => {
    const dto = new CreateTimeDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(3);
  });

  it('finding existing time working', async () => {
    const time = await timeService.create({
      from: 1,
      to: 2,
      price: 1,
      shift: Shift.Afternoon,
      isVip: false,
    });
    expect(time.displayTime).toBe('13:00-14:00');
    await timeService.createGTime(time, Date.now(), false, 1);
  });

  it('testing display time', async () => {
    const time = await timeService.create({
      from: 10,
      to: 11,
      price: 1,
      shift: Shift.Morning,
      isVip: false,
    });
    expect(time.displayTime).toBe('10:00-11:00');
  });

  it('testing time with 30 minutes', async () => {
    const time = await timeService.create({
      from: 12,
      to: 1,
      price: 1,
      shift: Shift.Afternoon,
      isVip: false,
    });

    expect(timeService.displayTime([time])[0].displayTime).toBe('12:00-13:00');
    expect(time.displayTime).toBe('12:00-13:00');
  });

  it('find haft time working', async () => {
    const time = await timeService.create({
      from: 6.5,
      to: 7.5,
      price: 10,
      shift: Shift.Afternoon,
      isVip: false,
    });

    const old = await timeService.createGTime(time, Date.now(), false, 1);
    const newTime = await timeService.createGTime(time, Date.now(), false, 1);
    const gTime = await timeService.checkBusyGtimeNoThrow(time, Date.now(), 1);

    expect(gTime).not.toBeNull();
    expect(old.createdAt).toStrictEqual(newTime.createdAt);

    const gTime2 = await timeService.checkBusyGtimeNoThrow(
      time,
      Date.now() + 48 * 60 * 60 * 1000,
      1,
    );

    expect(gTime2).toBe(null);
  });

  it('testing time working all condition', async () => {
    expect(convertDisplay24Hour(12, 1, Shift.Afternoon)).toBe('12:00-13:00');
    expect(convertDisplay24Hour(1.0, 2.0, Shift.Afternoon)).toBe('13:00-14:00');
    expect(convertDisplay24Hour(7.5, 8.5, Shift.Afternoon)).toBe('19:30-20:30');
    expect(convertDisplay24Hour(7.5, 8.5, Shift.Afternoon)).toBe('19:30-20:30');
  });
});
// update
