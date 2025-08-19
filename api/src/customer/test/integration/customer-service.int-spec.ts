import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { Role } from 'src/auth/role.enum';
import { CustomerService } from 'src/customer/customer.service';
import { Shop } from 'src/shop/entities/shop.entity';
import { ShopService } from 'src/shop/shop.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

describe('Customer Service', () => {
  let customService: CustomerService;
  let userService: UsersService;
  let shopService: ShopService;
  let user: User;
  let user2: User;
  let shop: Shop;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    customService = moduleRef.get(CustomerService);
    userService = moduleRef.get(UsersService);
    shopService = moduleRef.get(ShopService);

    user = await userService.create(
      {
        userName: 'root_customer',
        password: '12345678',
        role: Role.Root,
      },
      undefined,
    );
    user2 = await userService.create(
      {
        userName: 'admin_customer',
        password: '12345678',
        role: Role.Admin,
      },
      user,
    );

    shop = await shopService.create(
      {
        name: 'AAA',
        address: 'AA',
        phone: 'AAA',
      },
      user2,
    );

    user2 = await userService.setShopToUser(user2.id, shop);
  });

  it('to be define', () => {
    expect(customService).toBeDefined();
    expect(customService).toBeDefined();
  });

  it('create customer', async () => {
    const result = await customService.create(
      {
        phone: '012445566',
        name: 'customer1',
      },
      user2,
    );
    const newu = await customService.create(
      {
        phone: '012445566',
        name: 'customer1',
      },
      user2,
    );

    expect(newu.id).toBe(result.id);
    expect(result.name).toBe('customer1');
    expect(result.phone).toBe('012445566');
    expect(result.system).toBeDefined();
  });

  it('find customer work', async () => {
    const result = await customService.findAll(
      {
        page: 1,
        take: 10,
      },
      user2,
    );

    expect(result.data.length).toBe(1);
  });

  it('find one work', async () => {
    const result = await customService.create(
      {
        phone: '012445566',
        name: 'customer1',
      },
      user2,
    );

    const found = await customService.findOne(result.id, user2);

    expect(found.name).toBe('customer1');
    expect(found.phone).toBe('012445566');
  });

  it('delete work', async () => {
    try {
      const result = await customService.create(
        {
          phone: '012445566',
          name: 'customer1',
        },
        user2,
      );

      await customService.remove(result.id, user2);
      await customService.findOne(result.id, user2);
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });
});
