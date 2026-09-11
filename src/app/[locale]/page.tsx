import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import HeroCTA from '@/components/HeroCTA';
import SupplyChainBg from '@/components/SupplyChainBg';
import {
  Leaf,
  Shield,
  Coins,
  MapPin,
  Workflow,
  BadgeCheck,
  Fingerprint,
} from 'lucide-react';

export default async function HomePage() {
  const t = await getTranslations('home');

  const features = [
    {
      icon: Workflow,
      title: t('features.automatedRfq.title'),
      description: t('features.automatedRfq.description'),
    },
    {
      icon: BadgeCheck,
      title: t('features.verificationLevel.title'),
      description: t('features.verificationLevel.description'),
    },
    {
      icon: Fingerprint,
      title: t('features.uniqueVerification.title'),
      description: t('features.uniqueVerification.description'),
    },
    {
      icon: Shield,
      title: t('features.escrowPayment.title'),
      description: t('features.escrowPayment.description'),
    },
    {
      icon: Coins,
      title: t('features.harvestAuction.title'),
      description: t('features.harvestAuction.description'),
    },
    {
      icon: MapPin,
      title: t('features.localGpsSearch.title'),
      description: t('features.localGpsSearch.description'),
    },
  ];

  const puzzleCardStyles: {
    bg: string;
    border: string;
    iconBg: string;
    iconText: string;
  }[] = [
    {
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      border: 'border-emerald-200/60 dark:border-white/10',
      iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
      iconText: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      bg: 'bg-indigo-50 dark:bg-indigo-900/30',
      border: 'border-indigo-200/60 dark:border-white/10',
      iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
      iconText: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      border: 'border-amber-200/60 dark:border-white/10',
      iconBg: 'bg-amber-100 dark:bg-amber-500/20',
      iconText: 'text-amber-600 dark:text-amber-400',
    },
    {
      bg: 'bg-teal-50 dark:bg-teal-900/30',
      border: 'border-teal-200/60 dark:border-white/10',
      iconBg: 'bg-teal-100 dark:bg-teal-500/20',
      iconText: 'text-teal-600 dark:text-teal-400',
    },
  ];

  const puzzleCards = [
    {
      icon: Leaf,
      title: t('puzzleCards.organic.title'),
      desc: t('puzzleCards.organic.desc'),
      visual: 'cell' as const,
    },
    {
      icon: Shield,
      title: t('puzzleCards.escrow.title'),
      desc: t('puzzleCards.escrow.desc'),
      visual: 'vault' as const,
    },
    {
      icon: Coins,
      title: t('puzzleCards.bestPrice.title'),
      desc: t('puzzleCards.bestPrice.desc'),
      visual: 'sparkline' as const,
    },
    {
      icon: MapPin,
      title: t('puzzleCards.nearestLocation.title'),
      desc: t('puzzleCards.nearestLocation.desc'),
      visual: 'network' as const,
    },
  ];

  const sparklineDark = ['bg-amber-500/30', 'bg-amber-400/50'];

  return (
    <div>
      <Header />

      {/* ══════════════════════ Hero ══════════════════════ */}
      <section
        className='relative overflow-hidden'
        style={{ backgroundColor: 'var(--hero-bg)' }}
      >
        {/* radial glow */}
        <div
          className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]'
          style={
            {
              '--tw-gradient-from': 'var(--hero-glow)',
              '--tw-gradient-via': 'var(--hero-bg)',
              '--tw-gradient-to': 'var(--hero-bg)',
            } as React.CSSProperties
          }
        />

        {/* topographic lines (dark mode only — hidden in light via opacity) */}
        <div className='hero-topo-pattern pointer-events-none absolute inset-0 dark:opacity-[0.04] opacity-0' />

        {/* indonesia map background */}
        <SupplyChainBg />

        <div className='relative mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-20 lg:py-28'>
          <div className='grid items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16'>
            {/* ── left — text ── */}
            <div>
              <span
                className='mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium sm:mb-5 sm:text-sm'
                style={{
                  backgroundColor: 'var(--hero-badge-bg)',
                  borderColor: 'var(--hero-badge-border)',
                  color: 'var(--hero-badge-text)',
                }}
              >
                <span
                  className='h-1.5 w-1.5 rounded-full animate-pulse'
                  style={{ backgroundColor: 'var(--hero-dot)' }}
                />
                {t('badge')}
              </span>

              <h1
                className='mb-5 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl'
                style={{ color: 'var(--hero-heading)' }}
              >
                {t('heroTitle1')}{' '}
                <span
                  className={undefined}
                  style={{ color: 'var(--hero-dot)' }}
                >
                  {t('heroTitle2')}
                </span>
              </h1>

              <p
                className='mb-8 max-w-lg text-base leading-relaxed sm:mb-10 sm:text-lg lg:text-xl'
                style={{ color: 'var(--hero-sub)' }}
              >
                {t('heroSubtitle')}
              </p>

              <HeroCTA />

              {/* social proof */}
              <div className='mt-8 flex items-center gap-3 sm:mt-12 sm:gap-4'>
                <div className='flex -space-x-2'>
                  {[
                    'bg-green-600',
                    'bg-emerald-500',
                    'bg-teal-600',
                    'bg-amber-500',
                    'bg-green-700',
                  ].map((c, i) => (
                    <div
                      key={i}
                      className={`h-8 w-8 rounded-full ${c} ring-2 ring-white dark:ring-[#0d1410] sm:h-9 sm:w-9`}
                      style={
                        {
                          '--tw-ring-color': 'var(--hero-bg)',
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </div>
                <div className='text-sm'>
                  <span
                    className='font-semibold'
                    style={{ color: 'var(--hero-heading)' }}
                  >
                    2.400+
                  </span>{' '}
                  <span style={{ color: 'var(--hero-sub)' }}>
                    {t('activeUsers')}
                  </span>
                </div>
              </div>
            </div>

            {/* ── right — interlocking puzzle grid ── */}
            <div className='hidden lg:block'>
              <div className='relative grid grid-cols-2 gap-3'>
                {puzzleCards.map((card, i) => {
                  const cs = puzzleCardStyles[i];
                  const radiusClass =
                    i === 0
                      ? 'rounded-tl-[3rem]'
                      : i === 1
                        ? 'rounded-tr-[3rem]'
                        : i === 2
                          ? 'rounded-tl-[3rem]'
                          : 'rounded-tr-[3rem]';
                  // const mtClass = i === 2 || i === 3 ? '-mt-10' : 'mt-10';
                  const mtClass = i === 2 || i === 3 ? '' : '';

                  return (
                    <div
                      key={i}
                      className={`group relative border p-6 backdrop-blur-xl transition-all duration-300 ${radiusClass} ${mtClass} ${cs.bg} ${cs.border} dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`}
                    >
                      <div
                        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${cs.iconBg} ${cs.iconText}`}
                      >
                        <card.icon className='h-5 w-5' />
                      </div>
                      <p className='text-sm font-bold dark:text-gray-100 text-slate-900'>
                        {card.title}
                      </p>
                      <p className='mt-1 text-xs leading-relaxed dark:text-[#8b9e93] text-slate-500'>
                        {card.desc}
                      </p>
                      {/* micro visuals */}
                      {card.visual === 'cell' && (
                        <div className='mt-4 flex items-center gap-1.5'>
                          <div className='h-8 w-8 rounded-full border dark:border-emerald-500/30 border-emerald-300/50 dark:bg-emerald-500/10 bg-emerald-100 flex items-center justify-center'>
                            <div className='h-3 w-3 rounded-full dark:bg-emerald-400/40 bg-emerald-300/50' />
                          </div>
                          <div className='flex-1 space-y-1'>
                            <div className='h-1.5 w-full rounded-full dark:bg-emerald-500/10 bg-emerald-200/60' />
                            <div className='h-1.5 w-3/4 rounded-full dark:bg-emerald-500/10 bg-emerald-200/60' />
                            <div className='h-1.5 w-1/2 rounded-full dark:bg-emerald-500/10 bg-emerald-200/60' />
                          </div>
                        </div>
                      )}
                      {card.visual === 'vault' && (
                        <div className='mt-4 flex items-center justify-center gap-2'>
                          <div className='h-7 w-7 rounded border dark:border-indigo-500/30 border-indigo-300/50 dark:bg-indigo-500/10 bg-indigo-100 flex items-center justify-center'>
                            <div className='h-2.5 w-2.5 rounded-full border-2 dark:border-indigo-400/50 border-indigo-400' />
                          </div>
                          <div className='h-px w-6 dark:bg-indigo-500/20 bg-indigo-300/40' />
                          <div className='h-7 w-7 rounded border dark:border-indigo-500/30 border-indigo-300/50 dark:bg-indigo-500/10 bg-indigo-100 flex items-center justify-center'>
                            <div className='h-2 w-2 rounded-sm dark:bg-indigo-400/50 bg-indigo-400' />
                          </div>
                        </div>
                      )}
                      {card.visual === 'sparkline' && (
                        <div className='mt-4 flex items-end gap-1 h-8'>
                          {[40, 65, 45, 80, 55, 90, 70, 95].map((h, j) => (
                            <div
                              key={j}
                              className={`flex-1 rounded-t-sm transition-all duration-300 ${sparklineDark[j % 2]} dark:${sparklineDark[j % 2]}`}
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      )}
                      {card.visual === 'network' && (
                        <div className='mt-4 relative h-8 w-full'>
                          <div className='absolute left-0 top-1/2 h-px w-full -translate-y-1/2 dark:bg-teal-500/20 bg-teal-300/40' />
                          <div className='absolute left-[10%] top-0 h-2 w-2 rounded-full dark:bg-teal-400/50 bg-teal-400' />
                          <div className='absolute left-[35%] top-1 h-2.5 w-2.5 rounded-full dark:bg-teal-400/70 bg-teal-500 ring-2 dark:ring-teal-400/20 ring-teal-200' />
                          <div className='absolute left-[60%] top-0.5 h-1.5 w-1.5 rounded-full dark:bg-teal-400/40 bg-teal-400/70' />
                          <div className='absolute left-[85%] top-1 h-2 w-2 rounded-full dark:bg-teal-400/50 bg-teal-400' />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ Features ══════════════════════ */}
      <section
        className='relative py-16 sm:py-20 lg:py-24'
        style={{
          borderTop: '1px solid var(--feature-border)',
          backgroundColor: 'var(--feature-bg)',
        }}
      >
        <div className='mx-auto max-w-7xl px-5 sm:px-6'>
          <div className='mb-12 text-center sm:mb-16'>
            <span
              className='mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium sm:text-sm'
              style={{
                borderColor: 'var(--hero-badge-border)',
                backgroundColor: 'var(--hero-badge-bg)',
                color: 'var(--hero-badge-text)',
              }}
            >
              {t('featuresBadge')}
            </span>
            <h2
              className='mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl'
              style={{ color: 'var(--feature-heading)' }}
            >
              {t('featuresTitle')}
            </h2>
            <p
              className='mx-auto mt-4 max-w-xl text-sm sm:text-base'
              style={{ color: 'var(--feature-sub)' }}
            >
              {t('featuresSubtitle')}
            </p>
          </div>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {features.map((f) => (
              <div
                key={f.title}
                className='group relative rounded-2xl border p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6'
                style={{
                  borderColor: 'var(--feature-card-border)',
                  backgroundColor: 'var(--feature-card-bg)',
                }}
              >
                <div
                  className='mb-4 flex h-10 w-10 items-center justify-center rounded-xl'
                  style={{ backgroundColor: 'var(--feature-icon-bg)' }}
                >
                  <f.icon
                    className='h-5 w-5'
                    style={{ color: 'var(--feature-icon)' }}
                  />
                </div>
                <h3
                  className='mb-2 text-sm font-bold sm:text-base'
                  style={{ color: 'var(--feature-heading)' }}
                >
                  {f.title}
                </h3>
                <p
                  className='text-xs leading-relaxed sm:text-sm'
                  style={{ color: 'var(--feature-sub)' }}
                >
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA ══════════════════════ */}
      <section
        className='relative bg-[#82de9b] dark:bg-[#00aa5b]'
        style={{
          borderTop: '1px solid var(--feature-border)',
        }}
      >
        <div className='relative  text-black dark:text-white mx-auto max-w-4xl px-5 py-16 text-center sm:px-6 sm:py-24'>
          <h2 className='mb-4 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl'>
            {t('ctaTitle')}
          </h2>
          <p className='mb-8 text-sm sm:mb-10 sm:text-base'>
            {t('ctaSubtitle')}
          </p>
          <div className='flex flex-wrap items-center justify-center gap-3 sm:gap-4'>
            <Link
              href='/daftar'
              className='rounded-xl bg-[#ffffff] text-[#383838] px-6 py-3 text-sm font-bold shadow-lg transition-all duration-200 hover:scale-105 sm:px-8 sm:py-3.5'
            >
              {t('ctaRegister')}
            </Link>
            <Link
              href='/produk'
              className='rounded-xl border px-6 py-3 text-sm font-bold transition-all duration-200 text-[#e8e8e8] hover:text-[#ffffff] bg-white/20 hover:bg-white/10 sm:px-8 sm:py-3.5'
              style={{
                borderColor: 'rgba(255,255,255,0.3)',
              }}
            >
              {t('ctaCatalog')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{ borderTop: '1px solid var(--footer-border)' }}
        className='py-8 bg-[#00aa5b] dark:bg-[#82de9b]'
      >
        <div
          className='mx-auto max-w-7xl px-5 text-center text-sm sm:px-6'
          style={{ color: 'var(--footer-text)' }}
        >
          <p>&copy; {new Date().getFullYear()} PanenLangsung</p>
        </div>
      </footer>
    </div>
  );
}
