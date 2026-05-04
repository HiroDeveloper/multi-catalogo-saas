import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';

type TenantPayload = {
  name?: string;
  slug?: string;
  subdomain?: string;
  status?: string;
  plan?: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  whatsappNumber?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
};

type CategoryPayload = {
  name?: string;
  slug?: string;
  description?: string | null;
  position?: number;
};

type ProductPayload = {
  name?: string;
  slug?: string;
  categoryId?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  sku?: string | null;
  price?: number | string;
  compareAtPrice?: number | string | null;
  featured?: boolean;
  stock?: number;
  status?: string;
  imageUrl?: string | null;
};

type PromotionPayload = {
  name?: string;
  slug?: string;
  type?: string;
  status?: string;
  priority?: number;
  bannerUrl?: string | null;
  couponCode?: string | null;
  stackable?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  rules?: Array<{
    scope: string;
    operator: string;
    value?: string | null;
    minQuantity?: number;
    minAmount?: number | string;
  }>;
};

type BannerPayload = {
  title?: string;
  subtitle?: string | null;
  imageUrl?: string;
  linkUrl?: string | null;
  position?: number;
  status?: string;
  startsAt?: string | null;
  endsAt?: string | null;
};

type CreateTenantPayload = {
  name: string;
  slug?: string;
  subdomain?: string;
  plan?: string;
  whatsappNumber?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

@Roles(MembershipRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get('tenants')
  getTenants() {
    return this.adminService.getTenants();
  }

  @Get('tenants/:tenantId')
  getTenant(@Param('tenantId') tenantId: string) {
    return this.adminService.getTenantDetail(tenantId);
  }

  @Patch('tenants/:tenantId')
  updateTenant(
    @Param('tenantId') tenantId: string,
    @Body() body: TenantPayload,
  ) {
    return this.adminService.updateTenant(tenantId, body);
  }

  @Post('tenants/:tenantId/categories')
  createCategory(
    @Param('tenantId') tenantId: string,
    @Body() body: CategoryPayload,
  ) {
    if (!body.name?.trim()) {
      throw new BadRequestException('Category name is required.');
    }

    return this.adminService.createCategory(tenantId, body);
  }

  @Patch('categories/:categoryId')
  updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() body: CategoryPayload,
  ) {
    return this.adminService.updateCategory(categoryId, body);
  }

  @Delete('categories/:categoryId')
  deleteCategory(@Param('categoryId') categoryId: string) {
    return this.adminService.deleteCategory(categoryId);
  }

  @Post('tenants/:tenantId/products')
  createProduct(
    @Param('tenantId') tenantId: string,
    @Body() body: ProductPayload,
  ) {
    if (!body.name?.trim()) {
      throw new BadRequestException('Product name is required.');
    }

    return this.adminService.createProduct(tenantId, body);
  }

  @Patch('products/:productId')
  updateProduct(
    @Param('productId') productId: string,
    @Body() body: ProductPayload,
  ) {
    return this.adminService.updateProduct(productId, body);
  }

  @Delete('products/:productId')
  deleteProduct(@Param('productId') productId: string) {
    return this.adminService.deleteProduct(productId);
  }

  @Post('tenants/:tenantId/promotions')
  createPromotion(
    @Param('tenantId') tenantId: string,
    @Body() body: PromotionPayload,
  ) {
    if (!body.name?.trim()) {
      throw new BadRequestException('Promotion name is required.');
    }

    return this.adminService.createPromotion(tenantId, body);
  }

  @Patch('promotions/:promotionId')
  updatePromotion(
    @Param('promotionId') promotionId: string,
    @Body() body: PromotionPayload,
  ) {
    return this.adminService.updatePromotion(promotionId, body);
  }

  @Delete('promotions/:promotionId')
  deletePromotion(@Param('promotionId') promotionId: string) {
    return this.adminService.deletePromotion(promotionId);
  }

  // ── Banners ──────────────────────────────────────────

  @Post('tenants/:tenantId/banners')
  createBanner(
    @Param('tenantId') tenantId: string,
    @Body() body: BannerPayload,
  ) {
    if (!body.title?.trim()) {
      throw new BadRequestException('Banner title is required.');
    }
    if (!body.imageUrl?.trim()) {
      throw new BadRequestException('Banner image URL is required.');
    }

    return this.adminService.createBanner(tenantId, body);
  }

  @Patch('banners/:bannerId')
  updateBanner(
    @Param('bannerId') bannerId: string,
    @Body() body: BannerPayload,
  ) {
    return this.adminService.updateBanner(bannerId, body);
  }

  @Delete('banners/:bannerId')
  deleteBanner(@Param('bannerId') bannerId: string) {
    return this.adminService.deleteBanner(bannerId);
  }

  // ── Quote Requests (Orders) ─────────────────────────

  @Get('tenants/:tenantId/quote-requests')
  getQuoteRequests(
    @Param('tenantId') tenantId: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getQuoteRequests(tenantId, status);
  }

  @Get('quote-requests/:requestId')
  getQuoteRequestDetail(@Param('requestId') requestId: string) {
    return this.adminService.getQuoteRequestDetail(requestId);
  }

  @Patch('quote-requests/:requestId')
  updateQuoteRequestStatus(
    @Param('requestId') requestId: string,
    @Body() body: { status?: string },
  ) {
    return this.adminService.updateQuoteRequestStatus(requestId, body.status);
  }

  // ── Create Tenant ───────────────────────────────────

  @Post('tenants')
  createTenant(@Body() body: CreateTenantPayload) {
    if (!body.name?.trim()) {
      throw new BadRequestException('Tenant name is required.');
    }

    return this.adminService.createTenant(body);
  }
}
