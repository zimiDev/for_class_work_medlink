import { NavLink, useNavigate } from 'react-router-dom';
import { removeToken, getUser } from '../utils/auth';
import { useLanguage } from '../i18n/LanguageContext';

function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const user = getUser();
  const { language, setLanguage, t, trRole } = useLanguage();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-md px-4 py-3 text-sm font-bold transition-all ${
      isActive
        ? 'bg-oxygen text-clinical shadow-sm'
        : 'text-slate-600 hover:bg-slate-50 hover:text-clinical'
    }`;

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const renderNavLinks = () => {
    const role = user?.role;
    const links = {
      Admin: [
        ['/', 'dashboard'],
        ['/doctors', 'doctors'],
        ['/schedule', 'schedule'],
        ['/patients', 'patients'],
        ['/diagnoses', 'diagnoses'],
        ['/users', 'users'],
      ],
      Clinician: [
        ['/', 'dashboard'],
        ['/patients', 'patients'],
        ['/diagnoses', 'diagnoses'],
        ['/doctors', 'doctors'],
        ['/schedule', 'schedule'],
      ],
      Receptionist: [
        ['/', 'dashboard'],
        ['/patients', 'patients'],
        ['/doctors', 'doctors'],
        ['/schedule', 'schedule'],
      ],
    };

    const icons = {
      dashboard: 'M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-11h6V4h-6v5Z',
      doctors: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0H5Z',
      schedule: 'M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v13H4V7a2 2 0 0 1 2-2Zm2 6h3v3H8v-3Zm6 0h3v3h-3v-3Z',
      patients: 'M7 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20a5 5 0 0 1 10 0H2Zm10 0a5 5 0 0 1 10 0H12Z',
      diagnoses: 'M6 3h9l3 3v15H6V3Zm8 1.5V7h2.5M9 11h6M9 15h6',
      users: 'M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3ZM8 12c1.66 0 3-1.34 3-3S9.66 6 8 6 5 7.34 5 9s1.34 3 3 3Zm8 2c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4ZM8 14c-.31 0-.65.02-1 .06-2.24.27-5 1.28-5 3.44V19h4v-1c0-1.16.73-2.14 2-3Z',
    };

    const roleLinks = links[role] || [];
    return roleLinks.map(([to, label]) => (
      <NavLink key={to} to={to} end={to === '/'} className={linkClass} onClick={handleNavClick}>
        <svg className="h-5 w-5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icons[label]} />
        </svg>
        <span>{t(label)}</span>
      </NavLink>
    ));
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed left-0 top-0 z-50 flex min-h-screen w-72 transform flex-col overflow-hidden border-r border-slate-200 bg-white text-ink shadow-sm transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative border-b p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-md bg-clinical text-lg font-black text-white">
                CT
              </div>
              <div>
                <h1 className="text-xl font-bold text-ink">{t('appName')}</h1>
                <p className="text-xs font-medium text-secondary">{t('appSubtitle')}</p>
              </div>
            </div>
            <button 
              className="rounded-lg p-2 text-graphite hover:bg-gray-100 md:hidden"
              onClick={() => setIsOpen(false)}
              aria-label={t('close')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </div>
        {user && (
          <div className="mt-5 flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-oxygen text-sm font-black text-clinical">
              {user.username?.slice(0, 1)?.toUpperCase() || 'U'}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{user.username}</p>
              <p className="text-xs font-medium text-secondary">{trRole(user.role)}</p>
            </div>
          </div>
        )}
        </div>

      <nav className="relative flex-1 space-y-2 p-4">
        {renderNavLinks()}
      </nav>

      <div className="relative border-t border-slate-200 p-4">
        <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
          <span className="status-dot mr-2 align-middle" />
          {t('systemOnline')}
        </div>
        <div className="mb-2 flex rounded-md border border-slate-200 bg-white p-1">
          {['uz', 'ru'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`flex-1 rounded py-1.5 text-sm font-bold transition-colors ${
                language === lang ? 'bg-clinical text-white' : 'text-slate-500 hover:text-clinical'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          {t('logout')}
        </button>
      </div>
      </aside>
    </>
  );
}

export default Sidebar;
