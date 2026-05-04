import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { AppEnvironment } from '../../common/config/validate-env';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class UploadsService {
  private client: S3Client | null = null;
  private bucketName: string = '';
  private publicUrl: string = '';

  constructor(
    private readonly configService: ConfigService<AppEnvironment, true>,
  ) {
    const accountId = this.configService.get('R2_ACCOUNT_ID', { infer: true });
    const accessKeyId = this.configService.get('R2_ACCESS_KEY_ID', {
      infer: true,
    });
    const secretAccessKey = this.configService.get('R2_SECRET_ACCESS_KEY', {
      infer: true,
    });
    this.bucketName =
      this.configService.get('R2_BUCKET_NAME', { infer: true }) ?? '';
    this.publicUrl =
      this.configService.get('R2_PUBLIC_URL', { infer: true }) ?? '';

    if (accountId && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  isConfigured(): boolean {
    return this.client !== null && this.bucketName.length > 0;
  }

  async upload(
    file: Buffer,
    originalName: string,
    mimeType: string,
    tenantId: string,
    folder: string = 'general',
  ): Promise<{ url: string; key: string }> {
    if (!this.client || !this.bucketName) {
      throw new BadRequestException(
        'File uploads are not configured. Contact support.',
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.length > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    const extension = this.getExtension(originalName, mimeType);
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const key = `${tenantId}/${folder}/${timestamp}-${randomSuffix}.${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    const url = this.publicUrl
      ? `${this.publicUrl.replace(/\/$/, '')}/${key}`
      : `https://${this.bucketName}.r2.dev/${key}`;

    return { url, key };
  }

  async delete(key: string): Promise<void> {
    if (!this.client || !this.bucketName) {
      return;
    }

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }

  private getExtension(originalName: string, mimeType: string): string {
    const dotIndex = originalName.lastIndexOf('.');

    if (dotIndex > 0) {
      return originalName.substring(dotIndex + 1).toLowerCase();
    }

    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
    };

    return mimeMap[mimeType] ?? 'bin';
  }
}
