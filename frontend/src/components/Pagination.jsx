import { useLanguage } from '../i18n/LanguageContext';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useLanguage();

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="premium-button px-4 py-2 text-sm font-bold"
      >
        {t('previous')}
      </button>
      <span className="text-sm font-bold text-primary/62">
        {t('page')} {currentPage} {t('of')} {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="premium-button px-4 py-2 text-sm font-bold"
      >
        {t('next')}
      </button>
    </div>
  );
}

export default Pagination;
