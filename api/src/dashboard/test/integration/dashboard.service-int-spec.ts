import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { Role } from 'src/auth/role.enum';
import { DashboardService } from 'src/dashboard/dashboard.service';
import { ShopService } from 'src/shop/shop.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

describe('Dashboard Service', () => {
  let shopService: ShopService;
  let userService: UsersService;
  let dashboardService: DashboardService;
  let adminUser: User;
  let rootUser: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    shopService = module.get(ShopService);
    userService = module.get(UsersService);
    dashboardService = module.get(DashboardService);

    rootUser = await userService.create({
      userName: 'admingod',
      password: 'password',
      role: Role.Root,
    });
    adminUser = await userService.create(
      {
        userName: 'adminshopservice',
        password: 'password',
        role: Role.Admin,
      },
      rootUser,
    );
  });

  it('should be define', () => {
    expect(dashboardService).toBeDefined();
    expect(shopService).toBeDefined();
    expect(userService).toBeDefined();
    expect(rootUser).toBeDefined();
  });

  it('field to define', async () => {
    const result = await dashboardService.findAll(adminUser, {
      date: '2025-02-06',
    });
    expect(result.isSub).toBe(false);
    expect(result.todayBooking).toBe(0);
  });
});
