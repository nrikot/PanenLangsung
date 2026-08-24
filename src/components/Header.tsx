'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import ThemeToggle from '@/components/ThemeToggle';
import { Menu, X } from 'lucide-react';
// import { Quantico } from 'next/font/google';
// const quantico = Quantico({
//   weight: ['400', '700'],
//   style: ['normal', 'italic'],
//   subsets: ['latin'],
//   variable: '--font-quantico',
//   display: 'swap',
// });

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDark = theme === 'dark';

  async function handleSignOut() {
    setMobileOpen(false);
    await signOut();
    router.push('/');
  }

  function getDashboardLink() {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'petani':
        return '/petani/dashboard';
      case 'pembeli':
        return '/pembeli/dashboard';
      default:
        return null;
    }
  }

  const dashboardLink = getDashboardLink();

  const headerBg = isDark
    ? 'border-white/5 bg-[#0d1410]/80'
    : 'border-black/6 bg-white/85';

  const navText = isDark
    ? 'text-[#8b9e93] hover:text-gray-100'
    : 'text-slate-500 hover:text-slate-900';
  const logoText = isDark ? 'text-gray-100' : 'text-slate-900';
  const blueAccent = isDark
    ? 'text-[var(--electric-blue-2)]'
    : 'text-[var(--electric-blue)]';
  const greenAccent = isDark
    ? 'text-[var(--electric-blue)]'
    : 'text-[var(--electric-blue-2)]';
  const greenHover = isDark ? 'hover:text-green-300' : 'hover:text-green-700';

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl ${headerBg}`}
    >
      <div className='mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4'>
        <Link
          href='/'
          className={`brand-name text-lg font-extrabold tracking-tight sm:text-xl ${logoText}`}
        >
          <span className={greenAccent}>Panen</span>
          <span className={blueAccent}>Langsung</span>
        </Link>

        {/* ── desktop nav ── */}
        <nav className='hidden items-center gap-5 md:flex lg:gap-6'>
          <Link
            href='/produk'
            className={`text-sm transition-colors ${navText}`}
          >
            Produk
          </Link>
          <Link
            href='/lelang'
            className={`text-sm transition-colors ${navText}`}
          >
            Lelang
          </Link>
          <Link href='/rfq' className={`text-sm transition-colors ${navText}`}>
            RFQ
          </Link>

          <ThemeToggle />

          {loading ? (
            <div
              className={`h-9 w-20 animate-pulse rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`}
            />
          ) : user ? (
            <div className='flex items-center gap-3'>
              {dashboardLink && (
                <Link
                  href={dashboardLink}
                  className={`text-sm font-medium transition-colors ${blueAccent} ${greenHover}`}
                >
                  Dashboard
                </Link>
              )}
              <Link
                href={
                  user.role === 'admin'
                    ? '/admin/dashboard'
                    : `/${user.role}/profil`
                }
                className={`text-sm transition-colors ${navText}`}
              >
                {user.name}
              </Link>
              {user.role === 'admin' && (
                <Link
                  href={`/admin/profil/${user.id}`}
                  className={`text-sm transition-colors ${navText}`}
                >
                  Profil
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className={`text-sm transition-colors ${isDark ? 'text-red-400/80 hover:text-red-400' : 'text-red-500 hover:text-red-600'}`}
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className='flex items-center gap-3'>
              <Link
                href='/masuk'
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                  isDark
                    ? 'border-white/20 text-gray-300 hover:border-white/20 hover:bg-white/5 hover:text-gray-100'
                    : 'border-black/12 text-slate-600 hover:border-black/10 hover:bg-black/5 hover:text-slate-900'
                }`}
              >
                Masuk
              </Link>
              <Link
                href='/daftar'
                className='rounded-lg bg-[#00aa5b] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_12px_rgba(0,170,91,0.2)] ring-1 ring-[#00aa5b]/20 transition-all hover:bg-[#82de9b] hover:text-black hover:shadow-[0_0_20px_rgba(0,170,91,0.3)]'
              >
                Daftar
              </Link>
            </div>
          )}
        </nav>

        {/* ── mobile right: theme toggle + hamburger ── */}
        <div className='flex items-center gap-2 md:hidden'>
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
              isDark
                ? 'border-white/10 bg-white/5 text-[#8b9e93] hover:bg-white/10 hover:text-gray-100'
                : 'border-black/10 bg-black/5 text-slate-500 hover:bg-black/8 hover:text-slate-700'
            }`}
          >
            {mobileOpen ? (
              <X className='h-4.5 w-4.5' />
            ) : (
              <Menu className='h-4.5 w-4.5' />
            )}
          </button>
        </div>
      </div>

      {/* ── mobile menu ── */}
      {mobileOpen && (
        <div
          className={`border-t px-5 pb-5 pt-4 md:hidden ${isDark ? 'border-white/5' : 'border-black/6'}`}
        >
          <div className='flex flex-col gap-3'>
            <Link
              href='/produk'
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-medium transition-colors ${navText}`}
            >
              Produk
            </Link>
            <Link
              href='/lelang'
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-medium transition-colors ${navText}`}
            >
              Lelang
            </Link>
            <Link
              href='/rfq'
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-medium transition-colors ${navText}`}
            >
              RFQ
            </Link>

            <div
              className={`my-1 h-px ${isDark ? 'bg-white/5' : 'bg-black/6'}`}
            />

            {loading ? null : user ? (
              <>
                {dashboardLink && (
                  <Link
                    href={dashboardLink}
                    onClick={() => setMobileOpen(false)}
                    className={`text-sm font-medium ${blueAccent}`}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href={
                    user.role === 'admin'
                      ? '/admin/dashboard'
                      : `/${user.role}/profil`
                  }
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium ${navText}`}
                >
                  Profil Saya
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href={`/admin/profil/${user.id}`}
                    onClick={() => setMobileOpen(false)}
                    className={`text-sm font-medium ${navText}`}
                  >
                    Admin Profil
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className={`text-left text-sm font-medium ${isDark ? 'text-red-400/80' : 'text-red-500'}`}
                >
                  Keluar
                </button>
              </>
            ) : (
              <div className='flex flex-col gap-2.5'>
                <Link
                  href='/masuk'
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg border px-4 py-2.5 text-center text-sm font-semibold transition-all ${
                    isDark
                      ? 'border-white/10 text-gray-300 hover:bg-white/5'
                      : 'border-black/12 text-slate-600 hover:bg-black/5'
                  }`}
                >
                  Masuk
                </Link>
                <Link
                  href='/daftar'
                  onClick={() => setMobileOpen(false)}
                  className='rounded-lg bg-green-600 px-4 py-2.5 text-center text-sm font-semibold text-white'
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
