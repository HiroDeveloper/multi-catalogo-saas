import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { ResolveTenantDto } from './dto/resolve-tenant.dto';
import { TenantsService } from './tenants.service';

@Public()
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('resolve')
  resolveTenant(@Query() query: ResolveTenantDto) {
    return this.tenantsService.resolveTenantByHostname(query.hostname);
  }
}
