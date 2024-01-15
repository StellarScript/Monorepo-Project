import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
   public appStatus(): { status: string } {
      return { status: 'ok' };
   }
}
