import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center">
        {t('title')}
      </h1>
    </div>
  );
}
