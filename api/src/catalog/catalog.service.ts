import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Catalog } from './entities/catalog.entity';
import { FindOperator, ILike, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import {
  calculateSkip,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
} from 'src/core/dtos';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Catalog)
    private catelogRepo: Repository<Catalog>,
    private userService: UsersService,
  ) {}

  async create(
    createCatalogDto: CreateCatalogDto,
    user: User,
  ): Promise<Catalog> {
    const catelog = this.catelogRepo.create({
      ...createCatalogDto,
      system: user.system,
    });

    return this.catelogRepo.save(catelog);
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    user: User,
  ): Promise<PageDto<Catalog, PageMetaDto>> {
    const whereClause: { name?: FindOperator<string> } = {};

    if (pageOptionsDto.search) {
      whereClause.name = ILike(`%${pageOptionsDto.search}%`);
    }

    const [orders, itemCount] = await Promise.all([
      this.catelogRepo.find({
        skip: calculateSkip(pageOptionsDto),
        take: pageOptionsDto.take,
        where: {
          ...whereClause,
          system: { id: user.system.id },
        },
        order: { id: pageOptionsDto.order },
      }),
      this.catelogRepo.count({
        where: {
          ...whereClause,
          system: { id: user.system.id },
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(orders, pageMetaDto);
  }
  async findOne(id: number): Promise<Catalog> {
    const exist = await this.catelogRepo.findOne({
      where: {
        id,
      },
    });

    if (!exist) {
      throw new NotFoundException('Catalog does not exist!!');
    }

    return exist;
  }

  async update(
    id: number,
    updateCatalogDto: UpdateCatalogDto,
  ): Promise<Catalog> {
    const existing = await this.findOne(id);

    if (updateCatalogDto.name) {
      existing.name = updateCatalogDto.name;
    }

    await this.catelogRepo.save(existing);

    return existing;
  }

  async remove(id: number): Promise<boolean> {
    const exist = await this.findOne(id);

    await this.catelogRepo.softDelete({
      id: exist.id,
    });

    return true;
  }
}
