import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required.');
  }

  const email = process.env.DEV_SUPERADMIN_EMAIL ?? 'admin@multicatalogo.demo';
  const password =
    process.env.DEV_SUPERADMIN_PASSWORD ?? 'Admin123456!';

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: listedUsers, error: listError } =
    await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });

  if (listError) {
    throw listError;
  }

  const existingSupabaseUser = listedUsers.users.find(
    (user) => user.email === email,
  );

  const supabaseUser = existingSupabaseUser
    ? (
        await supabase.auth.admin.updateUserById(existingSupabaseUser.id, {
          password,
          email_confirm: true,
          user_metadata: {
            display_name: 'Admin',
          },
        })
      ).data.user
    : (
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            display_name: 'Admin',
          },
        })
      ).data.user;

  if (!supabaseUser) {
    throw new Error('Could not create or update Supabase admin user.');
  }

  const appUser = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      supabaseUserId: supabaseUser.id,
      displayName: 'Admin',
    },
    create: {
      email,
      supabaseUserId: supabaseUser.id,
      displayName: 'Admin',
    },
  });

  const membership = await prisma.membership.findFirst({
    where: {
      userId: appUser.id,
      tenantId: null,
      role: 'SUPER_ADMIN',
    },
  });

  if (!membership) {
    await prisma.membership.create({
      data: {
        userId: appUser.id,
        tenantId: null,
        role: 'SUPER_ADMIN',
      },
    });
  }

  console.log(
    JSON.stringify(
      {
        email,
        password,
        supabaseUserId: supabaseUser.id,
      },
      null,
      2,
    ),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
