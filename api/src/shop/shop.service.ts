import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { FindOperator, ILike, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { SystemService } from 'src/system/system.service';
import { calculateSkip, PageDto, PageMetaDto } from 'src/core/dtos';
import { ShopPageOptionDto } from './dto/shop-page-option.dto';
import { User } from 'src/users/entities/user.entity';
import { KHQR } from 'ts-khqr';
import { System } from 'src/system/entities/system.entity';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop) private shopRepo: Repository<Shop>,
    private userService: UsersService,
    private systemService: SystemService,
  ) {}

  async create(createShopDto: CreateShopDto, user: User): Promise<Shop> {
    const result = this.shopRepo.create({
      ...createShopDto,
      system: user.system,
    });

    return this.shopRepo.save(result);
  }

  async findAll(
    pageOptionsDto: ShopPageOptionDto,
    user: User,
  ): Promise<PageDto<Shop, PageMetaDto>> {
    const whereClause: {
      name?: FindOperator<string>;
      system: {
        id: number;
      };
    } = {
      system: {
        id: user.system.id,
      },
    };

    if (pageOptionsDto.search) {
      whereClause.name = ILike(`%${pageOptionsDto.search}%`);
    }

    const orders = await this.shopRepo.find({
      skip: calculateSkip(pageOptionsDto),
      take: pageOptionsDto.take,
      where: whereClause,
    });

    const itemCount = await this.shopRepo.count({
      where: whereClause,
      order: {
        id: pageOptionsDto.order,
      },
    });

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(orders, pageMetaDto);
  }

  async findOne(id?: number): Promise<Shop> {
    const result = await this.shopRepo.findOne({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('Shop does not exist');
    }

    return result;
  }

  async findBySystem(id: number, system: System): Promise<Shop> {
    const result = await this.shopRepo.findOne({
      where: {
        id: id,
        system: {
          id: system.id,
        },
      },
      relations: ['system'],
    });

    if (!result) {
      throw new NotFoundException('Shop does not exist');
    }

    return result;
  }

  async update(
    id: number,
    updateShopDto: UpdateShopDto,
    user: User,
  ): Promise<Shop> {
    const existing = await this.findOne(id);

    if (updateShopDto.name) {
      existing.name = updateShopDto.name;
    }

    if (updateShopDto.phone) {
      existing.phone = updateShopDto.phone;
    }

    if (updateShopDto.address) {
      existing.address = updateShopDto.address;
    }

    if (updateShopDto.activeShop) {
      await this.userService.setShopToUser(user.id, existing);
    }

    if (updateShopDto.paymentString) {
      const isValid = KHQR.verify(updateShopDto.paymentString).isValid;

      if (!isValid) {
        throw new BadRequestException('Khqr code is invalid');
      }

      const bakong = KHQR.parse(updateShopDto.paymentString);

      if (!bakong.data.bakongAccountID.includes('@aclb')) {
        throw new BadRequestException('Khqr is not from bakong acleda!');
      }

      existing.paymentString = updateShopDto.paymentString;
    }

    await this.shopRepo.save(existing);

    return existing;
  }

  async remove(id: number): Promise<boolean> {
    const exist = await this.findOne(id);

    await this.shopRepo.softDelete({
      id: exist.id,
    });

    return true;
  }
}
