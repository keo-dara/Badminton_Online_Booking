import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { User } from 'src/users/entities/user.entity';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto, @Req() req) {
    const user = req.user as User;
    return this.subscriptionService.create(createSubscriptionDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(+id);
  }

  @Get('/system/me')
  findMySub(@Req() req) {
    const user = req.user as User;
    return this.subscriptionService.mySystemExpiredDate(user);
  }
}
