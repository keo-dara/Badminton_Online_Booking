import { Test, TestingModule } from '@nestjs/testing';
import { validate } from 'class-validator';
import { AppModule } from 'src/app.module';
import { Role } from 'src/auth/role.enum';
import { UpdateSystemDto } from 'src/system/dto/update-system.dto';
import { SystemService } from 'src/system/system.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

describe('SystemService', () => {
  let systemService: SystemService;
  let userService: UsersService;
  let adminUser: User;
  let rootUser: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    systemService = module.get(SystemService);

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
    expect(systemService).toBeDefined();
    expect(adminUser).toBeDefined();
  });

  it('test update dto', async () => {
    const newDto = new UpdateSystemDto();
    const errors = await validate(newDto);
    expect(errors.length).toBe(0);
  });
});
