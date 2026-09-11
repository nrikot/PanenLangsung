'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'jv', label: 'Basa Jawa', flag: '🇮🇩' },
] as const;

export default function LanguageSwitcher() {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  function handleLanguageChange(code: string) {
    router.replace(pathname, { locale: code });
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/10 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-gray-300 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        title={t('switcher')}
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{currentLang.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a2a1f] py-1 shadow-lg">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                locale === lang.code
                  ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-medium'
                  : 'text-slate-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{t(lang.code as 'id' | 'en' | 'jv')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
