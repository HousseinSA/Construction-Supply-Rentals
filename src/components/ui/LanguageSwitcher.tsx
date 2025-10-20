'use client';

import { useState } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const currentLanguage = languages.find(lang => lang.code === locale);

  const handleLanguageChange = (langCode: string) => {
    router.push(pathname, { locale: langCode });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-white"
      >
        <Globe size={16} />
        <span className="hidden sm:block text-sm font-medium">
          {currentLanguage?.name}
        </span>
        <span className="sm:hidden text-lg">{currentLanguage?.flag}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                locale === lang.code ? 'bg-orange-50 text-primary' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}