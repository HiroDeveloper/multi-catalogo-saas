import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MembershipRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../auth/guards/supabase-auth.guard';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @Roles(MembershipRole.SUPER_ADMIN, MembershipRole.TENANT_OWNER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest & { body: { tenantId?: string; folder?: string } },
  ) {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }

    const tenantId = req.body?.tenantId;

    if (!tenantId) {
      throw new BadRequestException('tenantId is required.');
    }

    const result = await this.uploadsService.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      tenantId,
      req.body?.folder ?? 'general',
    );

    return result;
  }

  @Post('status')
  @Roles(MembershipRole.SUPER_ADMIN)
  getUploadStatus() {
    return {
      configured: this.uploadsService.isConfigured(),
    };
  }
}
