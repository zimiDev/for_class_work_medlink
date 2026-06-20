import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as patientService from '../services/patientService';
import * as doctorService from '../services/doctorService';
import { validateRequired, validateAge, validatePhone } from '../utils/validators';
import FormInput from '../components/FormInput';
import { useToast } from '../components/Toast';
import { useLanguage } from '../i18n/LanguageContext';

function PatientFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    doctor_id: '',
  });
  const [doctors, setDoctors] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await doctorService.getAll({ limit: 100 });
        setDoctors(response.data || response);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      }
    }

    async function fetchPatient() {
      setLoading(true);
      try {
        const response = await patientService.getById(id);
        const patient = response.data || response;
        setFormData({
          first_name: patient.first_name || '',
          last_name: patient.last_name || '',
          age: patient.age || '',
          gender: patient.gender || '',
          phone: patient.phone || '',
          address: patient.address || '',
          doctor_id: patient.doctor_id || '',
        });
      } catch (error) {
        console.error('Failed to fetch patient:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();
    if (isEdit) fetchPatient();
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validate() {
    const newErrors = {};
    if (!validateRequired(formData.first_name)) {
      newErrors.first_name = t('firstNameRequired');
    }
    if (!validateRequired(formData.last_name)) {
      newErrors.last_name = t('lastNameRequired');
    }
    if (!validateRequired(formData.age)) {
      newErrors.age = t('ageRequired');
    } else if (!validateAge(formData.age)) {
      newErrors.age = t('ageInvalid');
    }
    if (!validateRequired(formData.gender)) {
      newErrors.gender = t('genderRequired');
    }
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = t('phoneInvalid');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = { ...formData, age: Number(formData.age) };
      if (isEdit) {
        await patientService.update(id, data);
      } else {
        await patientService.create(data);
      }
      showToast(t('savedSuccessfully'));
      navigate('/patients');
    } catch (error) {
      console.error('Failed to save patient:', error);
      const message = error.response?.data?.error || t('savePatientFailed');
      setErrors({ submit: message });
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  if (loading && isEdit && !formData.first_name) {
    return <div className="text-center py-8 text-gray-500">{t('loading')}</div>;
  }

  return (
    <div className="clinic-page">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="clinic-section-title">{t('recordsControl')}</p>
          <h1 className="mt-2 text-2xl font-black text-primary">
            {isEdit ? t('editPatient') : t('addPatient')}
          </h1>
        </div>

      {errors.submit && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="premium-panel rounded-lg p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            label={t('firstName')}
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            error={errors.first_name}
            required
          />

          <FormInput
            label={t('lastName')}
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            error={errors.last_name}
            required
          />

          <FormInput
            label={t('age')}
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            error={errors.age}
            required
          />

        <div className="mb-4">
          <label htmlFor="gender" className="mb-1.5 block text-sm font-bold text-ink">
            {t('gender')} <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`premium-input w-full px-3 py-2 ${errors.gender ? '!border-red-500' : ''}`}
          >
            <option value="">{t('selectGender')}</option>
            <option value="Male">{t('male')}</option>
            <option value="Female">{t('female')}</option>
            <option value="Other">{t('other')}</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
        </div>

        <FormInput
          label={t('phone')}
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
        />

        <div className="mb-4">
          <label htmlFor="address" className="mb-1.5 block text-sm font-bold text-ink">
            {t('address')}
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="premium-input w-full px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="doctor_id" className="mb-1.5 block text-sm font-bold text-ink">
            {t('assignedDoctor')}
          </label>
          <select
            id="doctor_id"
            name="doctor_id"
            value={formData.doctor_id}
            onChange={handleChange}
            className="premium-input w-full px-3 py-2"
          >
            <option value="">{t('selectDoctor')}</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="premium-button px-6 py-2 text-sm font-bold disabled:opacity-50"
          >
            {loading ? t('saving') : isEdit ? t('updatePatient') : t('createPatient')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="ghost-button px-6 py-2 text-sm font-bold"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}

export default PatientFormPage;
