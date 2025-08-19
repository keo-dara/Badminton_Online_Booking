import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  appInfo(): string {
    return 'App is running!';
  }
}
