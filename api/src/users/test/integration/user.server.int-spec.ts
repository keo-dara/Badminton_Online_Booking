import { Test } from '@nestjs/testing';
import { validate } from 'class-validator';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth/auth.service';
import { Role } from 'src/auth/role.enum';
import { Shop } from 'src/shop/entities/shop.entity';
import { ShopService } from 'src/shop/shop.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

describe('User Server Integration Test', () => {
  let usersService: UsersService;
  let authService: AuthService;
  let shopService: ShopService;
  let rootUser: User;
  let shop: Shop;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    usersService = moduleRef.get(UsersService);
    authService = moduleRef.get(AuthService);
    shopService = moduleRef.get(ShopService);

    rootUser = await usersService.create({
      userName: 'root',
      password: '12345678',
      role: Role.Root,
    });

    shop = await shopService.create(
      {
        name: 'Supa',
        address: 'AbABAbABABABA',
        phone: '012556677',
      },
      rootUser,
    );
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
    expect(authService).toBeDefined();
  });

  it('validation create new User', async () => {
    const newDto = new CreateUserDto();
    const errors = await validate(newDto);
    expect(errors.length).toBe(3);
  });

  it('new admin must contain system info', async () => {
    const admin = await usersService.create(
      {
        userName: 'adminuser',
        password: '12345678',
        role: Role.Admin,
        shopId: shop.id,
      },
      rootUser,
    );

    expect(admin.system.id).toBeDefined();
  });

  it('username cant be the same', async () => {
    try {
      await usersService.create(
        {
          userName: 'adminuser2',
          password: '12345678',
          role: Role.Admin,
        },
        rootUser,
      );
      await usersService.create(
        {
          userName: 'adminuser2',
          password: '12345678',
          role: Role.Admin,
        },
        rootUser,
      );
    } catch (error) {
      expect(error.status).toBe(400);
    }
  });

  it('find must have system ', async () => {
    const user = await usersService.findOne(rootUser.id);

    expect(user.system.id).toBeDefined();
  });

  it('set shop to user work', async () => {
    const admin = await usersService.create(
      {
        userName: 'adminuser222',
        password: '12345678',
        role: Role.Admin,
        shopId: shop.id,
      },
      rootUser,
    );
    const user = await usersService.findOne(admin.id);
    await usersService.setShopToUser(user.id, shop);
    const userwithshop = await usersService.findOne(user.id);
    expect(userwithshop.shop.id).toBe(shop.id);
  });

  describe('two factor testing', () => {
    it('set secret to user', async () => {
      const newUser = await usersService.create(
        {
          userName: 'user',
          password: '12345678',
          role: Role.Admin,
        },
        undefined,
      );

      const { password } = await usersService.findOne(newUser.id);
      const user = await usersService.setTwoFactorAuthenticationSecret(
        '123',
        newUser.id,
      );
      expect(user.password).toBe(password);
      expect(user.twoFactorAuthenticationSecret).toBe('123');
    });

    it('remove secret', async () => {
      const user = await usersService.removeTwoFactorAuthenticationSecret(1);
      expect(user.twoFactorAuthenticationSecret).toBe(null);
    });
  });
});
