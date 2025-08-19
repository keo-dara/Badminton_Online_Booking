import { Test, TestingModule } from '@nestjs/testing';
import { validate } from 'class-validator';
import { AppModule } from 'src/app.module';
import { Role } from 'src/auth/role.enum';
import { CreateShopDto } from 'src/shop/dto/create-shop.dto';
import { UpdateShopDto } from 'src/shop/dto/update-shop.dto';
import { Shop } from 'src/shop/entities/shop.entity';
import { ShopService } from 'src/shop/shop.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

describe('ShopService', () => {
  let shopService: ShopService;
  let userService: UsersService;
  let adminUser: User;
  let rootUser: User;
  let shop: Shop;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    shopService = module.get(ShopService);
    userService = module.get(UsersService);

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
    expect(shopService).toBeDefined();
    expect(userService).toBeDefined();
    expect(rootUser).toBeDefined();
  });

  it('validation create shop', async () => {
    const newDto = new CreateShopDto();
    const errors = await validate(newDto);
    expect(errors.length).toBe(3);
  });
  it('validation update shop', async () => {
    const newDto = new UpdateShopDto();
    const errors = await validate(newDto);
    expect(errors.length).toBe(0);
  });

  it('create shop working', async () => {
    shop = await shopService.create(
      {
        name: 'Supa',
        address: 'AbABAbABABABA',
        phone: '012556677',
      },
      adminUser,
    );
    expect(shop.name).toBe('Supa');
    expect(shop.address).toBe('AbABAbABABABA');
    expect(shop.phone).toBe('012556677');
  });

  it('find not found', async () => {
    try {
      await shopService.findOne(100);
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });

  it('find with pagination working', async () => {
    const result = await shopService.findAll(
      {
        page: 1,
        take: 10,
      },
      adminUser,
    );

    expect(result.data.length).toBe(1);
  });

  it('search working', async () => {
    const result = await shopService.findAll(
      {
        page: 1,
        take: 10,
        search: 'not found',
      },
      adminUser,
    );

    expect(result.data.length).toBe(0);
  });

  it('update shop working', async () => {
    const updated = await shopService.update(
      shop.id,
      {
        name: 'Supa2',
        activeShop: false,
      },
      adminUser,
    );

    expect(updated.name).toBe('Supa2');
    expect(updated.phone).toBe(shop.phone);
  });

  it('update khqr', async () => {
    const updated = await shopService.update(
      shop.id,
      {
        paymentString:
          '00020101021129190015kimseng_te@aclb5204599953038405802KH5910Kimseng Te6010Phnom Penh63044722',
      },
      adminUser,
    );

    expect(updated.paymentString).toBe(
      '00020101021129190015kimseng_te@aclb5204599953038405802KH5910Kimseng Te6010Phnom Penh63044722',
    );
  });

  it('delete working', async () => {
    try {
      await shopService.remove(shop.id);
      await shopService.findOne(shop.id);
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });
});
