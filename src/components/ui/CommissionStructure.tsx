'use client';

import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';

interface CommissionStructureProps {
  variant?: 'full' | 'compact';
  className?: string;
  translationNamespace?: string;
}

export default function CommissionStructure({ 
  variant = 'full', 
  className = '',
  translationNamespace = 'dashboard.settings.commission.structure'
}: CommissionStructureProps) {
  const t = useTranslations(translationNamespace);

  if (variant === 'compact') {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">{t('title')}</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>• {t('rentals')}</div>
              <div>• {t('sales')}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Info className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">{t('title')}</h3>
          <p className="text-blue-700 mb-4">{t('subtitle')}</p>
          
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-100">
              <span className="text-gray-700 font-medium">{t('rentals')}</span>
              <span className="font-bold text-blue-600 text-lg">10%</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-100">
              <span className="text-gray-700 font-medium">{t('sales')}</span>
              <span className="font-bold text-purple-600 text-lg">5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}