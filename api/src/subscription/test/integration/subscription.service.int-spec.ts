import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/auth/role.enum';
import { User } from 'src/users/entities/user.entity';
import { CreateSubscriptionDto } from 'src/subscription/dto/create-subscription.dto';
import { PlanService } from 'src/plan/plan.service';

describe('SubscriptionController', () => {
  let subService: SubscriptionService;
  let userService: UsersService;
  let planService: PlanService;
  let user: User;
  // let user2: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    subService = module.get<SubscriptionService>(SubscriptionService);
    userService = module.get<UsersService>(UsersService);
    planService = module.get<PlanService>(PlanService);
    planService.findAll();

    user = await userService.create(
      {
        userName: 'user2s',
        password: '12345678',
        role: Role.Admin,
      },
      undefined,
    );
    // user2 = await userService.create(
    //   {
    //     userName: 'user2sss',
    //     password: '12345678',
    //     role: Role.Admin,
    //   },
    //   undefined,
    // );
  });

  it('should be defined', () => {
    expect(subService).toBeDefined();
    expect(userService).toBeDefined();
  });

  it('user does not yet subscribe', async () => {
    const user = await userService.create(
      {
        userName: 'user3s',
        password: '12345678',
        role: Role.Admin,
      },
      undefined,
    );
    const isSub = await subService.isSubscription(user.id);
    expect(isSub).toBe(false);
  });

  it('create subscription for user', async () => {
    const createDto = new CreateSubscriptionDto();
    createDto.planId = 1;
    const result = await subService.create(createDto, user);
    expect(result).toBeDefined();
  });

  // it('user subscribe set to success', async () => {
  //   const result = await subService.checkTransactionSubscriptionLast();
  //   expect(result.length).toBe(1);
  // });

  // it('user already subscribe', async () => {
  //   try {
  //     const createDto = new CreateSubscriptionDto();
  //     createDto.planId = 1;
  //     await subService.create(createDto, user);
  //   } catch (error) {
  //     expect(error.status).toBe(400);
  //   }
  // });

  // it('user subscription cancel', async () => {
  //   const createDto = new CreateSubscriptionDto();
  //   createDto.planId = 1;
  //   await subService.create(createDto, user2, new Date('2022-03-25'));
  //   const result = await subService.clearTransactionSubscription();
  //   expect(result.length).toBe(1);
  // });
});
