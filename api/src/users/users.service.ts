import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { authenticator } from 'otplib';
import {
  calculateSkip,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
} from 'src/core/dtos';
import { System } from 'src/system/entities/system.entity';
import { SystemService } from 'src/system/system.service';
import { CreateSystemDto } from 'src/system/dto/create-system.dto';
import { Order } from 'src/core/constants/order.enum';
import { Shop } from 'src/shop/entities/shop.entity';
import { Role } from 'src/auth/role.enum';
import { CreateShopDto } from 'src/shop/dto/create-shop.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    private systemService: SystemService,
  ) {}

  logger = new Logger(UsersService.name);

  async create(createUserDto: CreateUserDto, user?: User): Promise<User> {
    // find user by id
    let createdBy: User;
    let shop: Shop;
    let system: System = user?.system;

    this.logger.log('Create user with shopID', createUserDto.shopId);
    this.logger.log(createUserDto);

    const existing = await this.findOneByUsername(createUserDto.userName);

    if (createUserDto.shopId) {
      shop = await this.shopRepository.findOne({
        where: {
          id: createUserDto.shopId,
        },
      });
    }

    if (existing) {
      throw new BadRequestException('Username is already exist');
    }

    if (!system || user.role === Role.Root) {
      const systemDto = new CreateSystemDto();
      systemDto.name = createUserDto.systemName;
      system = await this.systemService.create(systemDto);
    }

    if (user) {
      createdBy = await this.findOne(user.id);

      // if user not found, throw error
      if (!createdBy) {
        throw new NotFoundException('User not found');
      }
    }
    createUserDto.profilePicture = this.randomImageUrl();

    const result = await this.userRepository.create({
      ...createUserDto,
      createdBy,
      system: system,
      shop: shop,
    });

    const savedUser = await this.userRepository.save(result);

    // asign shop to user
    if (createUserDto.shop) {
      this.logger.log('New Shop to user', savedUser.id);
      const newShop = await this.createShop(createUserDto.shop, savedUser);
      await this.setShopToUser(savedUser.id, newShop);
    }

    return savedUser;
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    user: User,
  ): Promise<PageDto<User, PageMetaDto>> {
    this.logger.log('FIND ALL');

    this.logger.log(pageOptionsDto);

    const queryBuilder = this.userRepository.createQueryBuilder('users');

    if (pageOptionsDto.search) {
      queryBuilder.andWhere('LOWER(users.userName) LIKE LOWER(:search)', {
        search: `%${pageOptionsDto.search}%`,
      });
    }

    queryBuilder
      .orderBy('users.createdAt', pageOptionsDto.order ?? Order.DESC)
      .skip(calculateSkip(pageOptionsDto))
      .take(pageOptionsDto.take);

    // join createdBy relation
    queryBuilder.leftJoinAndSelect('users.createdBy', 'createdBy');
    queryBuilder.leftJoinAndSelect('users.shop', 'shop');

    if (user.role === Role.Admin) {
      queryBuilder.andWhere('users.system = :systemId', {
        systemId: user.system.id,
      });
    }

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['system', 'shop'],
    });
  }

  async update(id: number, { profilePicture }: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    const updatedField = {
      profilePicture,
    };

    return await this.userRepository.save({
      ...user,
      ...updatedField,
    });
  }

  async updateByUserName(username: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { userName: username },
    });

    user.password = password;
    await this.userRepository.save(user);
    return user;
  }

  findOneByUsername(userName: string): Promise<User> {
    return this.userRepository.findOne({
      where: { userName },
      relations: ['system'],
    });
  }

  randomImageUrl(): string {
    const urls = [
      'https://supersale-api.supasales.pro/uploads/avatar1.png',
      'https://supersale-api.supasales.pro/uploads/avatar3.png',
      'https://supersale-api.supasales.pro/uploads/avatar4.png',
      'https://supersale-api.supasales.pro/uploads/avatar5.png',
      'https://supersale-api.supasales.pro/uploads/avatar6.png',
    ];

    const randomIndex = Math.floor(Math.random() * urls.length);
    return urls[randomIndex];
  }

  /// check if user exist in db
  async isUserExist(): Promise<boolean> {
    const user = await this.userRepository.find({
      take: 1,
    });

    return user.length > 0;
  }

  async setTwoFactorAuthenticationSecret(secret: string, id: number) {
    const user = await this.findOne(id);

    const updatedField = {
      twoFactorAuthenticationSecret: secret,
    };

    return await this.userRepository.save({
      ...user,
      ...updatedField,
    });
  }

  async removeTwoFactorAuthenticationSecret(id: number) {
    const user = await this.findOne(id);

    const updatedField = {
      twoFactorAuthenticationSecret: null,
    };

    return await this.userRepository.save({
      ...user,
      ...updatedField,
    });
  }

  isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    twoFactorAuthenticationSecret: string,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: twoFactorAuthenticationSecret,
    });
  }

  async setSystemToUser(id: number, system: System): Promise<User> {
    await this.userRepository.update(
      {
        id: id,
      },
      {
        system: system,
      },
    );

    return this.userSubscriptionInfo(id);
  }

  async userSubscriptionInfo(userId: number): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['system'],
    });
  }

  async setShopToUser(id: number, shop: Shop): Promise<User> {
    const user = await this.findOne(id);

    user.shop = shop;

    return await this.userRepository.save(user);
  }

  async createShop(createShopDto: CreateShopDto, user: User): Promise<Shop> {
    const result = this.shopRepository.create({
      ...createShopDto,
      system: user.system,
    });

    return this.shopRepository.save(result);
  }

  async blockUser(id: number, blockBy: User) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        system: {
          id: blockBy.system.id,
        },
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    user.blockedAt = new Date();

    return this.userRepository.save(user);
  }
}
