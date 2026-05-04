import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MembershipRole } from '@prisma/client';
import { User, createClient } from '@supabase/supabase-js';
import { AppEnvironment } from '../../../common/config/validate-env';
import { PrismaService } from '../../prisma/prisma.service';

export type AuthUserContext = {
  supabaseUser: User;
  appUser: {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  memberships: Array<{
    id: string;
    tenantId: string | null;
    role: MembershipRole;
    tenant: {
      id: string;
      name: string;
      slug: string;
      subdomain: string;
    } | null;
  }>;
  roles: MembershipRole[];
};

@Injectable()
export class AuthService {
  private readonly supabaseUrl?: string;
  private readonly supabaseKey?: string;

  constructor(
    private readonly configService: ConfigService<AppEnvironment, true>,
    private readonly prisma: PrismaService,
  ) {
    this.supabaseUrl = this.configService.get('SUPABASE_URL', { infer: true });
    this.supabaseKey =
      this.configService.get('SUPABASE_SECRET_KEY', { infer: true }) ??
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true }) ??
      this.configService.get('SUPABASE_PUBLISHABLE_KEY', { infer: true }) ??
      this.configService.get('SUPABASE_ANON_KEY', { infer: true });
  }

  isConfigured(): boolean {
    return Boolean(this.supabaseUrl && this.supabaseKey);
  }

  async getUserFromAccessToken(accessToken: string): Promise<AuthUserContext> {
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new ServiceUnavailableException(
        'Supabase Auth is not configured on the API.',
      );
    }

    const supabase = createClient(this.supabaseUrl, this.supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user || !data.user.email) {
      throw new UnauthorizedException('Invalid access token.');
    }

    const appUser = await this.syncAppUser(data.user);
    const memberships = await this.prisma.membership.findMany({
      where: {
        userId: appUser.id,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            subdomain: true,
          },
        },
      },
      orderBy: [{ createdAt: 'asc' }],
    });

    return {
      supabaseUser: data.user,
      appUser: {
        id: appUser.id,
        email: appUser.email,
        displayName: appUser.displayName,
        avatarUrl: appUser.avatarUrl,
      },
      memberships: memberships.map((membership) => ({
        id: membership.id,
        tenantId: membership.tenantId,
        role: membership.role,
        tenant: membership.tenant
          ? {
              id: membership.tenant.id,
              name: membership.tenant.name,
              slug: membership.tenant.slug,
              subdomain: membership.tenant.subdomain,
            }
          : null,
      })),
      roles: memberships.map((membership) => membership.role),
    };
  }

  private async syncAppUser(supabaseUser: User) {
    const email = supabaseUser.email;

    if (!email) {
      throw new UnauthorizedException('Supabase user email is required.');
    }

    const existingBySupabaseId = await this.prisma.user.findUnique({
      where: {
        supabaseUserId: supabaseUser.id,
      },
    });

    if (existingBySupabaseId) {
      return this.prisma.user.update({
        where: {
          id: existingBySupabaseId.id,
        },
        data: {
          email,
          displayName:
            supabaseUser.user_metadata?.display_name ??
            supabaseUser.user_metadata?.name ??
            existingBySupabaseId.displayName,
          avatarUrl:
            supabaseUser.user_metadata?.avatar_url ??
            supabaseUser.user_metadata?.picture ??
            existingBySupabaseId.avatarUrl,
        },
      });
    }

    const existingByEmail = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingByEmail) {
      return this.prisma.user.update({
        where: {
          id: existingByEmail.id,
        },
        data: {
          supabaseUserId: supabaseUser.id,
          displayName:
            supabaseUser.user_metadata?.display_name ??
            supabaseUser.user_metadata?.name ??
            existingByEmail.displayName,
          avatarUrl:
            supabaseUser.user_metadata?.avatar_url ??
            supabaseUser.user_metadata?.picture ??
            existingByEmail.avatarUrl,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        supabaseUserId: supabaseUser.id,
        email,
        displayName:
          supabaseUser.user_metadata?.display_name ??
          supabaseUser.user_metadata?.name ??
          null,
        avatarUrl:
          supabaseUser.user_metadata?.avatar_url ??
          supabaseUser.user_metadata?.picture ??
          null,
      },
    });
  }
}
