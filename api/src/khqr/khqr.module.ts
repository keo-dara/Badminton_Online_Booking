import { Module } from '@nestjs/common';
import { KhqrService } from './khqr.service';
import { KhqrController } from './khqr.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KhQr } from './entities/khqr.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([KhQr]), HttpModule],
  controllers: [KhqrController],
  providers: [KhqrService],
  exports: [KhqrService],
})
export class KhqrModule {}
