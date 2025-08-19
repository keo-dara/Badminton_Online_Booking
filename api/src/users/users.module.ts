import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { SystemModule } from 'src/system/system.module';
import { Shop } from 'src/shop/entities/shop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Shop]), SystemModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
