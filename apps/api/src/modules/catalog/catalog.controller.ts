import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { GetProductsDto } from './dto/get-products.dto';
import { CatalogService } from './catalog.service';

@Public()
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get(':tenantSlug/storefront')
  getStorefront(@Param('tenantSlug') tenantSlug: string) {
    return this.catalogService.getStorefront(tenantSlug);
  }

  @Get(':tenantSlug/categories')
  getCategories(@Param('tenantSlug') tenantSlug: string) {
    return this.catalogService.getCategories(tenantSlug);
  }

  @Get(':tenantSlug/products')
  getProducts(
    @Param('tenantSlug') tenantSlug: string,
    @Query() query: GetProductsDto,
  ) {
    return this.catalogService.getProducts(tenantSlug, query);
  }

  @Get(':tenantSlug/products/:productSlug')
  getProduct(
    @Param('tenantSlug') tenantSlug: string,
    @Param('productSlug') productSlug: string,
  ) {
    return this.catalogService.getProductBySlug(tenantSlug, productSlug);
  }

  @Post(':tenantSlug/quote-requests')
  createQuoteRequest(
    @Param('tenantSlug') tenantSlug: string,
    @Body()
    body: {
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      message?: string;
      items?: Array<{
        productId?: string;
        quantity?: number;
      }>;
    },
  ) {
    return this.catalogService.createQuoteRequest(tenantSlug, body);
  }
}
