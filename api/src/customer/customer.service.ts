import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { FindOperator, ILike, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import {
  calculateSkip,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
} from 'src/core/dtos';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ICustomerResponse } from 'src/core/interfaces/customer';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    private readonly httpService: HttpService,
  ) {}

  logger = new Logger(CustomerService.name);

  async create(
    createCustomerDto: CreateCustomerDto,
    user: User,
  ): Promise<Customer & { exId?: number }> {
    const system = user?.system;

    if (!user?.system) {
      throw new BadRequestException('You must have system');
    }

    const existing = await this.customerRepo.findOne({
      where: {
        name: createCustomerDto.name,
        phone: createCustomerDto.phone,
      },
    });

    if (existing) {
      return existing;
    }

    const customer = await this.customerRepo.create({
      ...createCustomerDto,
      system,
    });

    return await this.customerRepo.save(customer);
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    user: User,
  ): Promise<PageDto<Customer, PageMetaDto>> {
    const whereClause: { name?: FindOperator<string> } = {};

    if (pageOptionsDto.search) {
      whereClause.name = ILike(`%${pageOptionsDto.search}%`);
    }

    const [orders, itemCount] = await Promise.all([
      this.customerRepo.find({
        skip: calculateSkip(pageOptionsDto),
        take: pageOptionsDto.take,
        where: {
          ...whereClause,
          system: { id: user.system.id },
        },
        order: { id: pageOptionsDto.order },
      }),
      this.customerRepo.count({
        where: {
          ...whereClause,
          system: { id: user.system.id },
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(orders, pageMetaDto);
  }

  findOne(id: number, user: User): Promise<Customer> {
    const exist = this.customerRepo.findOne({
      where: {
        id: id,
        system: { id: user.system.id },
      },
    });

    if (!exist) {
      throw new NotFoundException();
    }

    return exist;
  }

  update(id: number, { name, phone }: UpdateCustomerDto) {
    return this.customerRepo.update(
      {
        id: id,
      },
      {
        name: name,
        phone: phone,
      },
    );
  }

  async remove(id: number, user: User) {
    const founded = await this.findOne(id, user);

    return this.customerRepo.softDelete({
      id: founded.id,
    });
  }
}
