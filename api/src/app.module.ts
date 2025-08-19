import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { User } from './users/entities/user.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { DashboardModule } from './dashboard/dashboard.module';
import appConfig from './core/config';
import { ConfigModule } from '@nestjs/config';
import { KhqrModule } from './khqr/khqr.module';
import { KhQr } from './khqr/entities/khqr.entity';
import { PlanModule } from './plan/plan.module';
import { Plan } from './plan/entities/plan.entity';
import { SubscriptionModule } from './subscription/subscription.module';
import { ShopModule } from './shop/shop.module';
import { Subscription } from './subscription/entities/subscription.entity';
import { CustomerModule } from './customer/customer.module';
import { SystemModule } from './system/system.module';
import { System } from './system/entities/system.entity';
import { CatalogModule } from './catalog/catalog.module';
import { Shop } from './shop/entities/shop.entity';
import { Catalog } from './catalog/entities/catalog.entity';
import { Customer } from './customer/entities/customer.entity';
import { BookingModule } from './booking/booking.module';
import { TimeModule } from './time/time.module';
import { GeneratedTime, Time } from './time/entities/time.entity';
import { Booking } from './booking/entities/booking.entity';
import { CourtModule } from './court/court.module';
import { Court } from './court/entities/court.entity';
import { TelegrafModule } from 'nestjs-telegraf';
@Module({
  imports: [
    TelegrafModule.forRoot({
      token: appConfig.telegramToken,
      launchOptions: false,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: appConfig.database.host,
      port: appConfig.database.port,
      username: appConfig.database.username,
      password: appConfig.database.password,
      database: appConfig.database.name,
      synchronize: appConfig.database.synchronize,
      logging: false,
      autoLoadEntities: appConfig.database.autoLoadEntities,
      dropSchema: appConfig.database.dropSchema,
      entities: [
        User,
        KhQr,
        Plan,
        Subscription,
        System,
        Shop,
        Catalog,
        Customer,
        Time,
        GeneratedTime,
        Booking,
        Court,
      ],
    }),
    JwtModule.register({
      global: true,
      secret: appConfig.jwt.secret,
      signOptions: { expiresIn: appConfig.jwt.expiresIn },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SystemModule,
    UsersModule,
    SubscriptionModule,
    AuthModule,
    HttpModule,
    DashboardModule,
    KhqrModule,
    PlanModule,
    ShopModule,
    CustomerModule,
    CatalogModule,
    TimeModule,
    BookingModule,
    CourtModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
