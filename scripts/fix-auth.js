const fs = require("fs");
const path = require("path");

const root = process.cwd();

const files = [
  { file: "src/app/admin/pembeli/page.tsx", role: "admin" },
  { file: "src/app/admin/verifikasi/page.tsx", role: "admin" },
  { file: "src/app/admin/sengketa/page.tsx", role: "admin" },
  { file: "src/app/admin/transaksi/page.tsx", role: "admin" },
  { file: "src/app/admin/petani/page.tsx", role: "admin" },
  { file: "src/app/petani/dashboard/page.tsx", role: "petani" },
  { file: "src/app/petani/profil/page.tsx", role: "petani" },
  { file: "src/app/petani/ulasan/page.tsx", role: "petani" },
  { file: "src/app/petani/rfq/page.tsx", role: "petani" },
  { file: "src/app/petani/lelang/page.tsx", role: "petani" },
  { file: "src/app/petani/chat/page.tsx", role: "petani" },
  { file: "src/app/petani/pesanan/page.tsx", role: "petani" },
  { file: "src/app/petani/produk/tambah/page.tsx", role: "petani" },
  { file: "src/app/petani/produk/[id]/edit/page.tsx", role: "petani" },
  { file: "src/app/pembeli/dashboard/page.tsx", role: "pembeli" },
  { file: "src/app/pembeli/profil/page.tsx", role: "pembeli" },
  { file: "src/app/pembeli/ulasan/page.tsx", role: "pembeli" },
  { file: "src/app/pembeli/rfq/page.tsx", role: "pembeli" },
  { file: "src/app/pembeli/lelang/page.tsx", role: "pembeli" },
  { file: "src/app/pembeli/chat/page.tsx", role: "pembeli" },
  { file: "src/app/pembeli/pesanan/page.tsx", role: "pembeli" },
];

for (const { file, role } of files) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP: ${file} (not found)`);
    continue;
  }

  let content = fs.readFileSync(fullPath, "utf-8");

  // Already fixed?
  if (content.includes("const { user, loading: authLoading, signOut } = useAuth()")) {
    console.log(`SKIP: ${file} (already fixed)`);
    continue;
  }

  // 1. Remove the broken useEffect block (two variants)
  // Variant A: simple sub-page
  const brokenEffect1 = /useEffect\(\(\) => \{\s*if \(!authLoading && \(!user \|\| user\.role !== "\)\) \{\s*if \(!stored\) \{ router\.push\("\/masuk"\); return; \}\s*setUser\(JSON\.parse\(stored\)\);\s*\}, \[router\]\);/s;
  // Variant B: dashboard with multi-line
  const brokenEffect2 = /useEffect\(\(\) => \{\s*if \(!authLoading && \(!user \|\| user\.role !== "\)\) \{\s*if \(!stored\) \{\s*router\.push\("\/masuk"\);\s*return;\s*\}\s*const parsed = JSON\.parse\(stored\);\s*if \(parsed\.role !== "[^"]*"\) \{\s*router\.push\("\/masuk"\);\s*return;\s*\}\s*setUser\(parsed\);\s*\}, \[router\]\);/s;
  // Variant C: tambah page with stored check
  const brokenEffect3 = /useEffect\(\(\) => \{\s*if \(!authLoading && \(!user \|\| user\.role !== "\)\) \{\s*if \(!stored \|\| JSON\.parse\(stored\)\.role !== "petani"\) \{\s*router\.push\("\/masuk"\);\s*return;\s*\}\s*fetchCommodities\(\);/s;

  let newEffect = "";

  if (brokenEffect3.test(content)) {
    newEffect = `useEffect(() => {
    if (!authLoading && (!user || user.role !== "${role}")) {
      router.push("/masuk");
      return;
    }
    if (user) {
      fetchCommodities();
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          setForm((f) => ({
            ...f,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6),
          }));
        },
        () => {}
      );
    }
  }, [user, authLoading, router]);`;
    content = content.replace(brokenEffect3, newEffect);
    // Remove trailing }, [router]); that's left after replacement
    content = content.replace(/\s*\}, \[router\]\);[\s\S]*?navigator\.geolocation/m, "");
  } else if (brokenEffect2.test(content)) {
    newEffect = `useEffect(() => {
    if (!authLoading && (!user || user.role !== "${role}")) {
      router.push("/masuk");
    }
  }, [user, authLoading, router]);`;
    content = content.replace(brokenEffect2, newEffect);
  } else if (brokenEffect1.test(content)) {
    newEffect = `useEffect(() => {
    if (!authLoading && (!user || user.role !== "${role}")) {
      router.push("/masuk");
    }
  }, [user, authLoading, router]);`;
    content = content.replace(brokenEffect1, newEffect);
  } else {
    console.log(`WARN: ${file} - no broken useEffect pattern found`);
  }

  // 2. Replace the user state declaration
  content = content.replace(
    /const \[user, setUser\] = useState<(?:User |)\{[^}]+\} \| null>\(null\);/,
    "const { user, loading: authLoading, signOut } = useAuth();"
  );

  // 3. Remove the User interface
  content = content.replace(/interface User \{[^}]+\}\n\n?/, "");

  // 4. Fix imports: remove useState if only used for user
  // Check if useState is still used elsewhere
  const stateAfterUser = content.replace(/const \{[^}]+\} = useAuth\(\);/, "");
  if (!stateAfterUser.includes("useState")) {
    content = content.replace(
      'import { useEffect, useState } from "react";',
      'import { useEffect } from "react";'
    );
  }

  // 5. Fix loading guard
  content = content.replace(
    /if \(!user\) return <div[^>]*>Memuat\.\.\.<\/div>;/,
    'if (authLoading || !user) return <div className="flex min-h-screen items-center justify-center">Memuat...</div>;'
  );

  // 6. Fix logout button
  content = content.replace(
    /onClick=\{\(\) => \{ localStorage\.clear\(\); router\.push\("\/masuk"\); \}\}/g,
    "onClick={async () => { await signOut(); router.push('/masuk'); }}"
  );

  fs.writeFileSync(fullPath, content, "utf-8");
  console.log(`DONE: ${file}`);
}
