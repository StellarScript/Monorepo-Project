import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @Post('authenticate')
   public async Authenticate() {
      return await this.authService.authenticate();
   }
}
