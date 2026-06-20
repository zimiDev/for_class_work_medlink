import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

function AccessDenied() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{t('accessDenied')}</h2>
        <p className="text-gray-600 mb-6">
          {t('accessDeniedText')}
        </p>
        <Link
          to="/"
          className="inline-block bg-primary text-white px-6 py-2 rounded hover:bg-secondary transition-colors"
        >
          {t('backToDashboard')}
        </Link>
      </div>
    </div>
  );
}

export default AccessDenied;
