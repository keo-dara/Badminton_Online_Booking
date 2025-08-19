import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { SystemModule } from 'src/system/system.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
  imports: [UsersModule, SystemModule, SubscriptionModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
