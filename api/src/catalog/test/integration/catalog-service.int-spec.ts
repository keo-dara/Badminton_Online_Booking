import { Test } from '@nestjs/testing';
import { validate } from 'class-validator';
import { AppModule } from 'src/app.module';
import { Role } from 'src/auth/role.enum';
import { CatalogService } from 'src/catalog/catalog.service';
import { CreateCatalogDto } from 'src/catalog/dto/create-catalog.dto';
import { Catalog } from 'src/catalog/entities/catalog.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

describe('CatalogService', () => {
  let catalogService: CatalogService;
  let catalog: Catalog;
  let userService: UsersService;
  let adminUser: User;
  let rootUser: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    catalogService = moduleRef.get(CatalogService);
    userService = moduleRef.get(UsersService);

    rootUser = await userService.create({
      userName: 'CatalogService',
      password: 'password',
      role: Role.Root,
    });
    adminUser = await userService.create(
      {
        userName: 'CatalogService2',
        password: 'password',
        role: Role.Admin,
      },
      rootUser,
    );
  });

  it('should be defined', () => {
    expect(catalogService).toBeDefined();
  });

  it('validation for create dto', async () => {
    const errors = await validate(new CreateCatalogDto());

    expect(errors.length).toBe(1);
  });

  it('create catalog', async () => {
    catalog = await catalogService.create(
      {
        name: 'ABA',
      },
      adminUser,
    );

    expect(catalog.name).toBe('ABA');
  });

  it('update working', async () => {
    const updated = await catalogService.update(catalog.id, {
      name: 'ABA2',
    });

    expect(updated.name).toBe('ABA2');
  });

  it('catelog not found', async () => {
    try {
      await catalogService.findOne(1000);
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });
  it('find all item', async () => {
    const items = await catalogService.findAll(
      {
        page: 1,
        take: 10,
      },
      adminUser,
    );

    expect(items.data.length).toBe(1);
  });

  it('delete working', async () => {
    try {
      await catalogService.remove(catalog.id);
      await catalogService.findOne(catalog.id);
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });
});
