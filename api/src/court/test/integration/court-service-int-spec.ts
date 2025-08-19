import { Test } from '@nestjs/testing';
import { validate } from 'class-validator';
import { AppModule } from 'src/app.module';
import { Role } from 'src/auth/role.enum';
import { CreateCatalogDto } from 'src/catalog/dto/create-catalog.dto';
import { CourtService } from 'src/court/court.service';
import { Court } from 'src/court/entities/court.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

describe('CourtService', () => {
  let courtService: CourtService;
  let court: Court;
  let userService: UsersService;
  let adminUser: User;
  let rootUser: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    courtService = moduleRef.get(CourtService);
    userService = moduleRef.get(UsersService);

    rootUser = await userService.create({
      userName: 'CourtService',
      password: 'password',
      role: Role.Root,
    });
    adminUser = await userService.create(
      {
        userName: 'CourtService2',
        password: 'password',
        role: Role.Admin,
      },
      rootUser,
    );
  });

  it('should be defined', () => {
    expect(courtService).toBeDefined();
  });

  it('validation for create dto', async () => {
    const errors = await validate(new CreateCatalogDto());

    expect(errors.length).toBe(1);
  });

  it('create court', async () => {
    court = await courtService.create(
      {
        name: 'ABA',
        description: '',
        timeId: [],
        enable: false,
        discount: 20,
      },
      adminUser,
    );

    expect(court.name).toBe('ABA');
    expect(court.discount).toBe(20);
  });

  it('update working', async () => {
    const updated = await courtService.update(court.id, {
      name: 'ABA2',
      discount: 10,
    });

    expect(updated.name).toBe('ABA2');
    expect(updated.discount).toBe(10);
  });

  it('court not found', async () => {
    try {
      await courtService.findOne(1000);
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });
  it('find all item', async () => {
    const items = await courtService.findAll({
      page: 1,
      take: 10,
    });

    expect(items.data.length).toBe(1);
  });

  it('delete working', async () => {
    try {
      await courtService.remove(court.id);
      await courtService.findOne(court.id);
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });
});
