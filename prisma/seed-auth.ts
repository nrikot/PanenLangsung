import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'EnterYourDemoPasswordHere';

async function supabaseAdminRequest(
  path: string,
  method: string,
  body?: unknown,
) {
  const url = `${process.env.SUPABASE_URL}/auth/v1/${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

interface AuthUser {
  id: string;
  email: string;
}

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(
    `Found ${users.length} users. Syncing Supabase Auth accounts...\n`,
  );

  // Get ALL existing auth users (paginate)
  let allAuthUsers: AuthUser[] = [];
  let page = 1;
  while (true) {
    const data = await supabaseAdminRequest(
      `admin/users?page=${page}&per_page=50`,
      'GET',
    );
    const batch = (data.users || []) as AuthUser[];
    allAuthUsers = allAuthUsers.concat(batch);
    if (batch.length < 50) break;
    page++;
  }

  const authByEmail = new Map<string, AuthUser>();
  for (const au of allAuthUsers) {
    if (au.email) authByEmail.set(au.email, au);
  }

  for (const user of users) {
    const existing = authByEmail.get(user.email);

    if (existing) {
      if (existing.id === user.id) {
        console.log(`  OK    ${user.email} (ID matches)`);
        continue;
      }

      // ID mismatch — delete old auth user and recreate with correct ID
      console.log(
        `  FIX   ${user.email} (Auth ID ${existing.id} != Prisma ID ${user.id}, recreating...)`,
      );
      await supabaseAdminRequest(`admin/users/${existing.id}`, 'DELETE');
    }

    const result = await supabaseAdminRequest('admin/users', 'POST', {
      id: user.id,
      email: user.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { role: user.role, name: user.name },
    });

    if (result.error) {
      console.log(
        `  FAIL  ${user.email}: ${result.error.message || result.error}`,
      );
    } else {
      console.log(`  OK    ${user.email} (${user.role})`);
    }
  }

  console.log(`\n=== SEMUA AKUN DEMO ===`);
  console.log(`Password universal: ${DEMO_PASSWORD}`);
  console.log('');
  users.forEach((u) => {
    console.log(`  ${u.role.padEnd(8)} | ${u.email.padEnd(30)} | ${u.name}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
