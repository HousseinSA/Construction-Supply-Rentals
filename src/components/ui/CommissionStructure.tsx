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
              <div>• {t('standardEquipment')}</div>
              <div>• {t('highUsage500')}</div>
              <div>• {t('extendedUsage1000')}</div>
              <div>• {t('vehiclesStandard')}</div>
              <div>• {t('vehicles1Month')}</div>
              <div>• {t('vehicles2Months')}</div>
              <div>• {t('forSale')}</div>
            </div>
            <div className="text-xs text-blue-700 mt-2 pt-2 border-t border-blue-200">
              {t('note')}
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
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
              <span className="text-gray-700">{t('standardEquipment')}</span>
              <span className="font-semibold text-blue-600">10%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
              <span className="text-gray-700">{t('highUsage500')}</span>
              <span className="font-semibold text-green-600">9%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
              <span className="text-gray-700">{t('extendedUsage1000')}</span>
              <span className="font-semibold text-green-600">8%</span>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 space-y-2">
              <div className="text-sm font-medium text-orange-800 mb-2">🚛 Vehicles (Camions)</div>
              
              <div className="flex items-center justify-between p-2 bg-white rounded border border-orange-100">
                <span className="text-gray-700 text-sm">{t('vehiclesStandard')}</span>
                <span className="font-semibold text-blue-600">10%</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-white rounded border border-orange-100">
                <span className="text-gray-700 text-sm">{t('vehicles1Month')}</span>
                <span className="font-semibold text-green-600">9%</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-white rounded border border-orange-100">
                <span className="text-gray-700 text-sm">{t('vehicles2Months')}</span>
                <span className="font-semibold text-green-600">8%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
              <span className="text-gray-700">{t('forSale')}</span>
              <span className="font-semibold text-purple-600">5%</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">{t('note')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}