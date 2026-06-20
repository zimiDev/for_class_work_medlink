import { useLanguage } from '../i18n/LanguageContext';

function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  const { t } = useLanguage();

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={t('search')}
        className="premium-input w-full px-4 py-2 pl-10"
      />
      <svg
        className="absolute left-3 top-3 h-5 w-5 text-secondary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}

export default SearchBar;
