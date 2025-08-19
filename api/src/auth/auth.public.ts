import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const IS_SUBSCRIBE_KEY = 'isSubscribe';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const SubscriptionOnly = () => SetMetadata(IS_SUBSCRIBE_KEY, true);
