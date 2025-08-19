import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { UsersModule } from 'src/users/users.module';
import { SystemModule } from 'src/system/system.module';

@Module({
  imports: [TypeOrmModule.forFeature([Shop]), UsersModule, SystemModule],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}
