import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'Car One API',
      timestamp: new Date().toISOString(),
    };
  }
}
