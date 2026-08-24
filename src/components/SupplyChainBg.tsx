'use client';

import { useTheme } from '@/lib/theme-context';

export default function SupplyChainBg() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className='SVG-BG pointer-events-none absolute inset-0 overflow-hidden text-red dark:text-white'
      aria-hidden
    >
      <img
        src='/images/home-indonesia-lineart.svg'
        alt=''
        className='absolute left-[50%] top-[40%] -translate-x-1/2 -translate-y-1/2 select-none'
        style={{
          color: 'green',
          width: '500%',
          maxWidth: 1980,
          opacity: isDark ? 0.42 : 0.3,
          filter: isDark
            ? 'drop-shadow(0 0 40px rgba(74,222,128,0.15))'
            : 'drop-shadow(0 0 40px rgba(22,101,52,0.08))',
        }}
      />
    </div>
  );
}
