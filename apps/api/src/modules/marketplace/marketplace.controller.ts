import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { MarketplaceService } from './marketplace.service';

@Public()
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('home')
  getHome() {
    return this.marketplaceService.getHome();
  }
}
