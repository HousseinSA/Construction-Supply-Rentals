'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { User, LogIn } from 'lucide-react';

export default function AuthButtons() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const t = useTranslations('common');

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowAuthModal(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors cursor-pointer"
      >
        <LogIn size={16} />
<span>{t('login')}</span>
      </button>
      
      <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors cursor-pointer">
        <User size={16} />
<span>{t('signup')}</span>
      </button>
    </div>
  );
}