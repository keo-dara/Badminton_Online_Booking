import { Module } from '@nestjs/common';
import { TimeService } from './time.service';
import { TimeController } from './time.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedTime, Time } from './entities/time.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Time, GeneratedTime])],
  controllers: [TimeController],
  providers: [TimeService],
  exports: [TimeService],
})
export class TimeModule {}
