'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBell from '@/components/NotificationBell';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Menu, X, User, LayoutDashboard, LogOut, Shield } from 'lucide-react';

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const t = useTranslations();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSignOut() {
    setMobileOpen(false);
    setUserMenuOpen(false);
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

  function getProfileLink() {
    if (!user) return '/masuk';
    if (user.role === 'admin') return `/admin/profil/${user.id}`;
    return `/${user.role}/profil`;
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

  const dropdownBg = isDark
    ? 'bg-[#1a2a1f] border-white/10'
    : 'bg-white border-black/10';
  const dropdownItemHover = isDark
    ? 'hover:bg-white/5'
    : 'hover:bg-black/5';
  const dropdownText = isDark ? 'text-gray-200' : 'text-slate-700';
  const dropdownSubtext = isDark ? 'text-gray-400' : 'text-slate-500';

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
            {t('nav.products')}
          </Link>
          <Link
            href='/lelang'
            className={`text-sm transition-colors ${navText}`}
          >
            {t('nav.auctions')}
          </Link>
          <Link href='/rfq' className={`text-sm transition-colors ${navText}`}>
            {t('nav.rfq')}
          </Link>

          <LanguageSwitcher />
          <ThemeToggle />

          {loading ? null : user && <NotificationBell />}

          {loading ? (
            <div
              className={`h-9 w-20 animate-pulse rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`}
            />
          ) : user ? (
            /* ── desktop user dropdown ── */
            <div className='relative' ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  isDark
                    ? 'border-white/10 text-gray-300 hover:bg-white/5'
                    : 'border-black/10 text-slate-700 hover:bg-black/5'
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                    user.role === 'admin' ? 'bg-purple-500' : 'bg-[#00aa5b]'
                  }`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className='max-w-[100px] truncate'>{user.name}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </button>

              {userMenuOpen && (
                <div
                  className={`absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border py-1 shadow-lg ${dropdownBg}`}
                >
                  {/* User info header */}
                  <div className={`border-b px-4 py-3 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                    <p className={`text-sm font-semibold ${dropdownText}`}>
                      {user.name}
                    </p>
                    <p className={`text-xs ${dropdownSubtext}`}>
                      {user.email}
                    </p>
                    {user.role === 'admin' && (
                      <span className='mt-1 inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400'>
                        <Shield className='h-3 w-3' />
                        {t('nav.admin')}
                      </span>
                    )}
                  </div>

                  {/* Menu items */}
                  <div className='py-1'>
                    {dashboardLink && (
                      <Link
                        href={dashboardLink}
                        onClick={() => setUserMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${dropdownText} ${dropdownItemHover}`}
                      >
                        <LayoutDashboard className='h-4 w-4 opacity-60' />
                        {t('common.dashboard')}
                      </Link>
                    )}
                    <Link
                      href={getProfileLink()}
                      onClick={() => setUserMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${dropdownText} ${dropdownItemHover}`}
                    >
                      <User className='h-4 w-4 opacity-60' />
                      {t('common.profile')}
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className={`border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                    <button
                      onClick={handleSignOut}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}
                    >
                      <LogOut className='h-4 w-4 opacity-60' />
                      {t('common.logout')}
                    </button>
                  </div>
                </div>
              )}
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
                {t('common.login')}
              </Link>
              <Link
                href='/daftar'
                className='rounded-lg bg-[#00aa5b] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_12px_rgba(0,170,91,0.2)] ring-1 ring-[#00aa5b]/20 transition-all hover:bg-[#82de9b] hover:text-black hover:shadow-[0_0_20px_rgba(0,170,91,0.3)]'
              >
                {t('common.register')}
              </Link>
            </div>
          )}
        </nav>

        {/* ── mobile right: notification + theme toggle + hamburger ── */}
        <div className='flex items-center gap-2 md:hidden'>
          {loading ? null : user && <NotificationBell />}
          <LanguageSwitcher />
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
            {/* Navigation links */}
            <Link
              href='/produk'
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-medium transition-colors ${navText}`}
            >
              {t('nav.products')}
            </Link>
            <Link
              href='/lelang'
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-medium transition-colors ${navText}`}
            >
              {t('nav.auctions')}
            </Link>
            <Link
              href='/rfq'
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-medium transition-colors ${navText}`}
            >
              {t('nav.rfq')}
            </Link>

            {/* Divider */}
            <div className={`my-1 h-px ${isDark ? 'bg-white/5' : 'bg-black/6'}`} />

            {loading ? null : user ? (
              <>
                {/* User info card */}
                <div
                  className={`rounded-xl border p-3 ${
                    isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/3'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
                        user.role === 'admin' ? 'bg-purple-500' : 'bg-[#00aa5b]'
                      }`}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className={`text-sm font-semibold truncate ${dropdownText}`}>
                        {user.name}
                      </p>
                      <p className={`text-xs truncate ${dropdownSubtext}`}>
                        {user.email}
                      </p>
                      {user.role === 'admin' && (
                        <span className='mt-0.5 inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-400'>
                          <Shield className='h-2.5 w-2.5' />
                          {t('nav.admin')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* User menu items */}
                {dashboardLink && (
                  <Link
                    href={dashboardLink}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${dropdownText} ${dropdownItemHover}`}
                  >
                    <LayoutDashboard className='h-4 w-4 opacity-60' />
                    {t('common.dashboard')}
                  </Link>
                )}
                <Link
                  href={getProfileLink()}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${dropdownText} ${dropdownItemHover}`}
                >
                  <User className='h-4 w-4 opacity-60' />
                  {t('common.profile')}
                </Link>

                {/* Logout button */}
                <button
                  onClick={handleSignOut}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}
                >
                  <LogOut className='h-4 w-4 opacity-60' />
                  {t('common.logout')}
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
                  {t('common.login')}
                </Link>
                <Link
                  href='/daftar'
                  onClick={() => setMobileOpen(false)}
                  className='rounded-lg bg-green-600 px-4 py-2.5 text-center text-sm font-semibold text-white'
                >
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
