import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth/auth.service';
import { Role } from 'src/auth/role.enum';
import { ShopService } from 'src/shop/shop.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

describe('User Server Integration Test', () => {
  let usersService: UsersService;
  let authService: AuthService;
  let rootUser: User;
  let shopService: ShopService;
  let adminUser: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    usersService = moduleRef.get(UsersService);
    authService = moduleRef.get(AuthService);
    shopService = moduleRef.get(ShopService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
    expect(authService).toBeDefined();
    expect(shopService).toBeDefined();
  });

  it('create new user when no users in db', async () => {
    const result = await authService.signIn({
      username: 'test',
      password: 'p@ssw0rd',
    });

    rootUser = await usersService.create({
      userName: 'CatalogService',
      password: 'password',
      role: Role.Root,
    });

    expect(result.accessToken).toBeDefined();
    expect(result.justCreated).toBe(true);
    expect(result.id).toBeDefined();
  });

  it('shop cant be empty for new member', async () => {
    try {
      const admin = await authService.register(
        {
          userName: 'test122',
          password: '123123',
          role: Role.Admin,
          shop: {
            name: 'ssdasds',
            address: 'dasd',
            phone: '012334455',
          },
        },
        rootUser,
      );
      adminUser = await usersService.findOne(admin.id!);
      await authService.register(
        {
          userName: 'test122dasds',
          password: '123123',
          role: Role.Admin,
        },
        adminUser,
      );
    } catch (error) {
      expect(error.status).toBe(400);
    }
  });

  it('login', async () => {
    const result = await authService.signIn({
      username: 'test',
      password: 'p@ssw0rd',
    });

    expect(result.accessToken).toBeDefined();
    expect(result.justCreated).toBe(false);
  });

  it('register', async () => {
    const result = await authService.register(
      {
        userName: 'test1',
        password: '123123',
        role: Role.Retailer,
      },
      rootUser,
    );

    expect(result.accessToken).toBeDefined();
    expect(result.justCreated).toBe(true);
    expect(result.id).toBeDefined();
  });

  it('no user me', async () => {
    const user = new User();
    user.id = 100;
    const result = await authService.me(user);

    expect(result).toBeUndefined();
  });

  it('me', async () => {
    const result = await authService.me(rootUser);

    expect(result.password).toBe('');
  });

  it('sell cant create admin', async () => {
    try {
      await authService.register(
        {
          userName: 'reseller',
          password: '123123',
          role: Role.Retailer,
        },
        rootUser,
      );
    } catch (error) {
      expect(error.status).toBe(403);
    }
  });

  it('generate secret two factor work', async () => {
    const updated = await authService.generateTwoFactorAuthenticationSecret(
      rootUser.id,
    );

    const userUpdated = await authService.me(rootUser);
    expect(userUpdated.twoFactorAuthenticationSecret).toBe(updated.secret);
  });

  it('403 for no authenticate opt', async () => {
    try {
      await authService.signIn({
        username: 'test',
        password: 'p@ssw0rd',
      });
    } catch (error) {
      expect(error.status).toBe(403);
    }
  });

  it('update password for root', async () => {
    const result = await authService.resetPassword(
      rootUser.userName,
      rootUser.password,
      rootUser,
    );

    expect(result.updatedAt).toBeDefined();
  });

  it('user not the same system', async () => {
    try {
      const admin1 = await usersService.create({
        userName: 'admin3',
        password: 'admdadasdas',
        role: Role.Admin,
        shop: {
          name: 'adas',
          address: 'dasdas',
          phone: 'dssadas',
        },
      });

      const admin2 = await usersService.create({
        userName: 'admin2',
        password: 'admdadasdas',
        role: Role.Admin,
      });

      await authService.resetPassword(admin2.userName, '12345678', admin1);
    } catch (error) {
      expect(error.status).toBe(400);
    }
  });
  it('admin change only user with the same system', async () => {
    const admin1 = await usersService.create({
      userName: 'admin65',
      password: 'admdadasdas',
      role: Role.Admin,
      shop: {
        name: 'adas',
        address: 'dasdas',
        phone: 'dssadas',
      },
    });

    const admin2 = await usersService.create(
      {
        userName: 'admin264353',
        password: 'admdadasdas',
        role: Role.Admin,
      },
      admin1,
    );

    const result = await authService.resetPassword(
      admin2.userName,
      '12345678',
      admin1,
    );
    expect(result.updatedAt).toBeDefined();
  });

  it('user is blocked', async () => {
    const user = await usersService.create(
      {
        userName: 'sdasdsadas1222',
        password: 'password',
        role: Role.Sale,
      },
      adminUser,
    );

    await usersService.blockUser(user.id, adminUser);

    expect(user.deletedAt).toBeDefined();

    try {
      await authService.signIn({
        username: 'sdasdsadas1222',
        password: 'password',
      });
    } catch (error) {
      expect(error.status).toBe(401);
    }
  });
});
