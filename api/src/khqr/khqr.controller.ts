import { Controller } from '@nestjs/common';
import { KhqrService } from './khqr.service';

@Controller('khqr')
export class KhqrController {
  constructor(private readonly khqrService: KhqrService) {
    // extract qr and verity khqr
  }
}
