import { Controller, Get, Req } from '@nestjs/common';
import type { AuthenticatedRequest } from './guards/supabase-auth.guard';

@Controller('auth')
export class AuthController {
  @Get('me')
  getMe(@Req() request: AuthenticatedRequest) {
    return request.user;
  }
}
