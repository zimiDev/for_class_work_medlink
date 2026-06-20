import { useLanguage } from '../i18n/LanguageContext';

function PlaceholderPage({ title }) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold text-primary">{title}</h1>
        <p className="text-gray-500 mt-2">{t('underConstruction')}</p>
      </div>
    </div>
  );
}

export default PlaceholderPage;
