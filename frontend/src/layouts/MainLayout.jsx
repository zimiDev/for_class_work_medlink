import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useLanguage } from '../i18n/LanguageContext';

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex min-h-screen flex-1 flex-col overflow-x-hidden md:ml-72">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="ghost-button p-2 md:hidden"
                aria-label={t('menu')}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                  {t('premiumWorkspace')}
                </p>
                <h1 className="text-lg font-black text-ink sm:text-xl">{t('appName')}</h1>
              </div>
            </div>
            <div className="hidden items-center gap-3 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 lg:flex">
              <span className="status-dot" />
              <span>{t('systemOnline')}</span>
            </div>
            <div className="flex items-center gap-2">
              {['uz', 'ru'].map((item) => (
                <button
                  key={item}
                  onClick={() => setLanguage(item)}
                  className={`min-w-12 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                    language === item ? 'bg-primary text-porcelain' : 'text-secondary hover:bg-accent'
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="w-full flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
