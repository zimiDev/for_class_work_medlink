import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { useToast } from '../components/Toast';
import { useLanguage } from '../i18n/LanguageContext';
import * as doctorService from '../services/doctorService';

const SPECIALTIES = [
  'Kardiologiya', 'Nevrologiya', 'Pediatriya', 'Ortopediya',
  'Dermatologiya', 'Ginekologiya', 'Oftalmologiya', 'Stomatologiya',
  'Psixiatriya', 'Onkologiya', 'Endokrinologiya', 'Revmatologiya',
  'Jarrohlik', 'Terapiya', 'Reanimatologiya',
];

const DEPARTMENTS = [
  'Yurak markazi', 'Miya va Umurtqa', 'Bolalar salomatligi',
  "Suyak va Bo'g'in", 'Teri kasalliklari', 'Ayollar salomatligi',
  "Ko'z kasalliklari", 'Tish davolash', 'Ruhiy salomatlik',
  'Saraton davolash', 'Ichki sekretsiya', "Bo'g'im kasalliklari",
  'Umumiy jarrohlik', 'Terapevtik', 'Shoshilinch yordam',
];

const POSITIONS = [
  'Bosh shifokor', 'Shifokor-mutaxassis', 'Ordinatorlik shifokor',
  'Rezident shifokor', 'Konsultant shifokor', 'Kichik tibbiy xodim',
];

const SHIFTS = ['day', 'night', 'rotating'];

function DoctorFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { t, trShift } = useLanguage();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    specialty: '',
    department: '',
    position: '',
    shift: 'day',
    contact: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDoctor, setLoadingDoctor] = useState(isEdit);

  useEffect(() => {
    async function fetchDoctor() {
      setLoadingDoctor(true);
      try {
        const data = await doctorService.getById(id);
        const doctor = data.data || data;
        setForm((prev) => ({
          ...prev,
          name: doctor.name || '',
          specialty: doctor.specialty || '',
          department: doctor.department || '',
          position: doctor.position || '',
          shift: doctor.shift || 'day',
          contact: doctor.contact || '',
        }));
      } catch (error) {
        console.error('Failed to fetch doctor:', error);
        setServerError(t('loadingDoctor'));
      } finally {
        setLoadingDoctor(false);
      }
    }

    if (isEdit) fetchDoctor();
  }, [id, isEdit, t]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = t('nameRequired');
    if (!form.specialty) newErrors.specialty = t('specialtyRequired');
    if (!form.department) newErrors.department = t('departmentRequired');
    if (!form.position) newErrors.position = t('fieldRequired');
    if (!form.shift) newErrors.shift = t('fieldRequired');
    if (!isEdit) {
      if (!form.username.trim()) newErrors.username = t('usernameRequired');
      if (!form.password.trim()) newErrors.password = t('passwordRequired');
      else if (form.password.length < 6) newErrors.password = t('passwordShort');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEdit) await doctorService.update(id, form);
      else await doctorService.create(form);
      showToast(t('savedSuccessfully'));
      navigate('/doctors');
    } catch (error) {
      const message = error.response?.data?.error || t('saveDoctorFailed');
      setServerError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  if (loadingDoctor) {
    return <div className="py-8 text-center text-sm font-bold text-primary/60">{t('loadingDoctor')}</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-black text-primary">
        {isEdit ? t('editDoctor') : t('addNewDoctor')}
      </h1>

      {serverError && <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">{serverError}</div>}

      <form onSubmit={handleSubmit} className="premium-panel rounded-lg p-4 sm:p-6">
        {!isEdit && (
          <section className="mb-6 space-y-4 border-b border-primary/10 pb-6">
            <h2 className="text-base font-black text-primary">{t('accountCredentials')}</h2>
            <FormInput label={t('username')} name="username" value={form.username} onChange={handleChange} error={errors.username} required placeholder={t('enterUsernameClinician')} />
            <FormInput label={t('password')} name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} required placeholder={t('enterPasswordMin')} />
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-base font-black text-primary">{t('doctorProfile')}</h2>
          <FormInput label={t('name')} name="name" value={form.name} onChange={handleChange} error={errors.name} required placeholder={t('enterDoctorName')} />
          <SelectField label={t('specialty')} name="specialty" value={form.specialty} onChange={handleChange} error={errors.specialty} required placeholder={t('selectSpecialty')} options={SPECIALTIES.map((value) => ({ value, label: value }))} />
          <SelectField label={t('department')} name="department" value={form.department} onChange={handleChange} error={errors.department} required placeholder={t('selectDepartment')} options={DEPARTMENTS.map((value) => ({ value, label: value }))} />
          <SelectField label={t('position')} name="position" value={form.position} onChange={handleChange} error={errors.position} required placeholder={t('selectPosition')} options={POSITIONS.map((value) => ({ value, label: value }))} />
          <SelectField label={t('shift')} name="shift" value={form.shift} onChange={handleChange} error={errors.shift} required placeholder={t('selectShift')} options={SHIFTS.map((value) => ({ value, label: trShift(value) }))} />
          <FormInput label={t('contact')} name="contact" value={form.contact} onChange={handleChange} error={errors.contact} placeholder={t('phoneOrEmail')} />
        </section>

        <div className="flex flex-wrap gap-3 pt-6">
          <button type="submit" disabled={loading} className="premium-button px-6 py-2 text-sm font-bold disabled:opacity-50">
            {loading ? t('saving') : isEdit ? t('updateDoctor') : t('createDoctor')}
          </button>
          <button type="button" onClick={() => navigate('/doctors')} className="ghost-button px-6 py-2 text-sm font-bold">
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

function SelectField({ label, name, value, onChange, error, required, placeholder, options }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-bold text-primary/76">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select id={name} name={name} value={value} onChange={onChange} className={`premium-input w-full px-3 py-2 ${error ? 'border-red-500' : ''}`}>
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default DoctorFormPage;
