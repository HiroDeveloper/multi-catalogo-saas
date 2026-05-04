import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppEnvironment } from '../../common/config/validate-env';
import { normalizeHostname } from '../../common/http/normalize-hostname';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppEnvironment, true>,
  ) {}

  async resolveTenantByHostname(hostname: string) {
    const normalizedHostname = normalizeHostname(hostname);

    if (!normalizedHostname) {
      throw new BadRequestException('A valid hostname is required.');
    }

    const domainMatch = await this.prisma.domain.findUnique({
      where: {
        hostname: normalizedHostname,
      },
      include: {
        tenant: true,
      },
    });

    if (domainMatch) {
      return this.buildResponse(
        domainMatch.tenant,
        normalizedHostname,
        domainMatch.type,
      );
    }

    const rootDomain = normalizeHostname(
      this.configService.get('PLATFORM_ROOT_DOMAIN', { infer: true }),
    );

    if (normalizedHostname.endsWith(`.${rootDomain}`)) {
      const subdomain = normalizedHostname.replace(`.${rootDomain}`, '');
      const tenant = await this.prisma.tenant.findUnique({
        where: {
          subdomain,
        },
      });

      if (tenant) {
        return this.buildResponse(tenant, normalizedHostname, 'SUBDOMAIN');
      }
    }

    return {
      found: false,
      hostname: normalizedHostname,
    };
  }

  private buildResponse(
    tenant: {
      id: string;
      name: string;
      slug: string;
      subdomain: string;
      status: string;
      plan: string;
      logoUrl: string | null;
      primaryColor: string | null;
      secondaryColor: string | null;
      whatsappNumber: string | null;
    },
    hostname: string,
    domainType: string,
  ) {
    return {
      found: true,
      hostname,
      domainType,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        subdomain: tenant.subdomain,
        status: tenant.status,
        plan: tenant.plan,
        branding: {
          logoUrl: tenant.logoUrl,
          primaryColor: tenant.primaryColor,
          secondaryColor: tenant.secondaryColor,
        },
        contact: {
          whatsappNumber: tenant.whatsappNumber,
        },
      },
    };
  }
}
