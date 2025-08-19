import { Injectable, Logger } from '@nestjs/common';
import { CreateSystemDto } from './dto/create-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { System } from './entities/system.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(System)
    private systemRepository: Repository<System>,
  ) {}

  logger = new Logger(SystemService.name);

  async create(createSystemDto: CreateSystemDto): Promise<System> {
    const system = new System();
    system.name = createSystemDto.name ?? '';

    const result = this.systemRepository.create(system);
    return await this.systemRepository.save(result);
  }

  findAll() {
    return `This action returns all system`;
  }

  findOne(id: number) {
    return `This action returns a #${id} system`;
  }

  update(id: number, updateSystemDto: UpdateSystemDto, user: User) {
    this.logger.log('ID', id);
    const system = user?.system;
    this.logger.log(updateSystemDto);

    return this.systemRepository.save(system);
  }
}
