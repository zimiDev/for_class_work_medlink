import { useState } from 'react';
import * as authService from '../services/authService';
import { validateEmail, validateRequired } from '../utils/validators';
import FormInput from '../components/FormInput';
import { useToast } from '../components/Toast';
import { useLanguage } from '../i18n/LanguageContext';

function UsersPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validate() {
    const newErrors = {};
    if (!validateRequired(formData.username)) {
      newErrors.username = t('usernameRequired');
    }
    if (!validateRequired(formData.email)) {
      newErrors.email = t('emailRequired');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('emailInvalid');
    }
    if (!validateRequired(formData.password)) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('passwordShort');
    }
    if (!validateRequired(formData.role)) {
      newErrors.role = t('roleRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await authService.register(formData);
      setMessage({ type: 'success', text: t('userRegistered') });
      showToast(t('userRegistered'));
      setFormData({ username: '', email: '', password: '', role: '' });
      setErrors({});
    } catch (error) {
      const errorMsg = error.response?.data?.error || t('registerFailed');
      setMessage({ type: 'error', text: errorMsg });
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">{t('userManagement')}</h1>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('registerNewUser')}</h2>

        <FormInput
          label={t('username')}
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          required
        />

        <FormInput
          label={t('email')}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <FormInput
          label={t('password')}
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <div className="mb-4">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            {t('role')} <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${
              errors.role ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{t('selectRole')}</option>
            <option value="Admin">{t('admin')}</option>
            <option value="Receptionist">{t('receptionist')}</option>
          </select>
          {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {loading ? t('registering') : t('registerUser')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UsersPage;
