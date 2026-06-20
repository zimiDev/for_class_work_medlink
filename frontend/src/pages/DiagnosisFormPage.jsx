import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as diagnosisService from '../services/diagnosisService';
import * as patientService from '../services/patientService';
import { validateRequired } from '../utils/validators';
import FormInput from '../components/FormInput';
import { useToast } from '../components/Toast';
import { useLanguage } from '../i18n/LanguageContext';

function DiagnosisFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    patient_id: '',
    icd_code: '',
    description: '',
    severity: '',
  });
  const [patients, setPatients] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const response = await patientService.getAll({ limit: 100 });
        setPatients(response.data || response);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      }
    }

    async function fetchDiagnosis() {
      setLoading(true);
      try {
        const response = await diagnosisService.getById(id);
        const diagnosis = response.data || response;
        setFormData({
          patient_id: diagnosis.patient_id || '',
          icd_code: diagnosis.icd_code || '',
          description: diagnosis.description || '',
          severity: diagnosis.severity || '',
        });
      } catch (error) {
        console.error('Failed to fetch diagnosis:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
    if (isEdit) fetchDiagnosis();
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
    if (!validateRequired(formData.patient_id)) {
      newErrors.patient_id = t('patientRequired');
    }
    if (!validateRequired(formData.icd_code)) {
      newErrors.icd_code = t('icdRequired');
    }
    if (!validateRequired(formData.description)) {
      newErrors.description = t('descriptionRequired');
    }
    if (!validateRequired(formData.severity)) {
      newErrors.severity = t('severityRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEdit) {
        await diagnosisService.update(id, formData);
      } else {
        await diagnosisService.create(formData);
      }
      showToast(t('savedSuccessfully'));
      navigate('/diagnoses');
    } catch (error) {
      console.error('Failed to save diagnosis:', error);
      const message = error.response?.data?.error || t('saveDiagnosisFailed');
      setErrors({ submit: message });
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  if (loading && isEdit && !formData.icd_code) {
    return <div className="text-center py-8 text-gray-500">{t('loading')}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">
        {isEdit ? t('editDiagnosis') : t('addDiagnosis')}
      </h1>

      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-4">
        <div className="mb-4">
          <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700 mb-1">
            {t('patient')} <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="patient_id"
            name="patient_id"
            value={formData.patient_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${
              errors.patient_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{t('selectPatient')}</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.first_name} {patient.last_name}
              </option>
            ))}
          </select>
          {errors.patient_id && <p className="text-red-500 text-sm mt-1">{errors.patient_id}</p>}
        </div>

        <FormInput
          label={t('icdCode')}
          name="icd_code"
          value={formData.icd_code}
          onChange={handleChange}
          error={errors.icd_code}
          required
          placeholder="J06.9"
        />

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            {t('description')} <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
            {t('severity')} <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${
              errors.severity ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{t('selectSeverity')}</option>
            <option value="mild">{t('mild')}</option>
            <option value="moderate">{t('moderate')}</option>
            <option value="severe">{t('severe')}</option>
          </select>
          {errors.severity && <p className="text-red-500 text-sm mt-1">{errors.severity}</p>}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {loading ? t('saving') : isEdit ? t('updateDiagnosis') : t('createDiagnosis')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/diagnoses')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DiagnosisFormPage;
