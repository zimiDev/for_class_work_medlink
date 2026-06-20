import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { setToken } from '../utils/auth';
import { useLanguage } from '../i18n/LanguageContext';

function LoginPage() {
  const navigate = useNavigate();
  const { language, setLanguage, t, trRole } = useLanguage();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const demoAccounts = [
    { role: 'Admin', username: 'admin1', password: 'password123' },
    { role: 'Clinician', username: 'dr.sardor', password: 'password123' },
    { role: 'Receptionist', username: 'receptionist1', password: 'password123' },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await login(form);
      setToken(data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error ? t('invalidCredentials') : t('invalidCredentials'));
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-primary text-white lg:block">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-clinical/30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-md bg-clinical text-2xl font-black text-white">
              CT
            </div>
            <div>
              <h1 className="text-3xl font-black">{t('appName')}</h1>
              <p className="text-sm font-semibold text-emerald-100">{t('appSubtitle')}</p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-100">{t('premiumWorkspace')}</p>
            <h2 className="mt-5 text-5xl font-black leading-tight">{t('signInSubtitle')}</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {demoAccounts.map((account) => (
              <div key={account.username} className="rounded-md border border-white/10 bg-white/10 p-4">
                <p className="text-xs font-bold text-emerald-100">{trRole(account.role)}</p>
                <p className="mt-1 font-black text-white">{account.username}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between lg:justify-end">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-md bg-clinical text-lg font-black text-white">CT</div>
              <div>
                <h1 className="text-xl font-black text-primary">{t('appName')}</h1>
                <p className="text-xs font-bold text-secondary">{t('appSubtitle')}</p>
              </div>
            </div>
            <div className="flex rounded-lg border border-primary/10 bg-white/80 p-1 shadow-sm">
              {['uz', 'ru'].map((item) => (
                <button
                  key={item}
                  onClick={() => setLanguage(item)}
                  className={`min-w-12 rounded-md px-3 py-1.5 text-sm font-bold transition-colors ${
                    language === item ? 'bg-primary text-porcelain' : 'text-ink hover:bg-accent'
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="premium-panel rounded-lg p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary">{t('appName')}</p>
              <h2 className="mt-2 text-3xl font-black text-primary">{t('signInTitle')}</h2>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="mb-1.5 block text-sm font-bold text-ink">
                  {t('username')}
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="premium-input w-full px-3 py-2"
                  placeholder={t('username')}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-ink">
                  {t('password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="premium-input w-full px-3 py-2"
                  placeholder={t('password')}
                />
              </div>

              <button type="submit" className="premium-button w-full px-4 py-3 font-black">
                {t('login')}
              </button>
            </form>

            <div className="mt-8 border-t border-primary/10 pt-6">
              <h3 className="mb-4 text-center text-xs font-black uppercase tracking-[0.18em] text-primary/52">
                {t('demoAccounts')}
              </h3>
              <div className="space-y-3">
                {demoAccounts.map((account) => (
                  <button
                    key={account.username}
                    type="button"
                    onClick={() => setForm({ username: account.username, password: account.password })}
                    className="flex w-full items-center justify-between rounded-lg border border-primary/10 bg-white/70 p-3 text-left transition-colors hover:border-secondary/50 hover:bg-porcelain"
                  >
                    <div>
                      <span className="block text-xs font-bold text-secondary">{trRole(account.role)}</span>
                      <span className="block text-sm font-black text-primary">{account.username}</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-primary/70">{account.password}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
