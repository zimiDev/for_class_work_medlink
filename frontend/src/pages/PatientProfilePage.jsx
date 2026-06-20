import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as patientService from '../services/patientService';
import { hasRole } from '../utils/auth';
import { useLanguage } from '../i18n/LanguageContext';

function PatientProfilePage() {
  const { id } = useParams();
  const { t, trGender, trSeverity, trShift, locale } = useLanguage();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatient() {
      setLoading(true);
      try {
        const response = await patientService.getById(id);
        setPatient(response.data || response);
      } catch (error) {
        console.error('Failed to fetch patient:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPatient();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">{t('loading')}</div>;
  }

  if (!patient) {
    return <div className="text-center py-8 text-gray-500">{t('patientNotFound')}</div>;
  }

  const diagnoses = patient.diagnoses || [];
  const sortedDiagnoses = [...diagnoses].sort(
    (a, b) => new Date(a.date || a.created_at) - new Date(b.date || b.created_at)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">{t('patientProfile')}</h1>

      <div className="premium-panel rounded-lg p-6">
        <h2 className="mb-4 text-lg font-black text-primary">{t('patientInformation')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">{t('name')}</span>
            <p className="text-gray-800 font-medium">
              {patient.first_name} {patient.last_name}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">{t('age')}</span>
            <p className="text-gray-800 font-medium">{patient.age}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">{t('gender')}</span>
            <p className="text-gray-800 font-medium">{trGender(patient.gender)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">{t('phone')}</span>
            <p className="text-gray-800 font-medium">{patient.phone || t('notAvailable')}</p>
          </div>
          <div className="md:col-span-2">
            <span className="text-sm text-gray-500">{t('address')}</span>
            <p className="text-gray-800 font-medium">{patient.address || t('notAvailable')}</p>
          </div>
        </div>
      </div>

      <div className="premium-panel rounded-lg p-6">
        <h2 className="mb-4 text-lg font-black text-primary">{t('assignedDoctor')}</h2>
        {patient.doctor ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">{t('doctorName')}</span>
              <p className="text-gray-800 font-medium">{patient.doctor.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">{t('specialty')}</span>
              <p className="text-gray-800 font-medium">{patient.doctor.specialty}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">{t('shift')}</span>
              <p className="text-gray-800 font-medium">{trShift(patient.doctor.shift)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">{t('contact')}</span>
              <p className="text-gray-800 font-medium">{patient.doctor.contact || t('notAvailable')}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">{t('noDoctorAssigned')}</p>
        )}
      </div>

      {!hasRole('Receptionist') && (
        <div className="premium-panel rounded-lg p-6">
          <h2 className="text-lg font-black text-primary mb-4">{t('diagnosisHistory')}</h2>
          {sortedDiagnoses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                      {t('icdCode')}
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                      {t('description')}
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                      {t('severity')}
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                      {t('date')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDiagnoses.map((diagnosis, index) => (
                    <tr key={diagnosis.id || index} className="border-b even:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{diagnosis.icd_code}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{diagnosis.description}</td>
                      <td className="px-4 py-3 text-sm">
                        <SeverityBadge severity={diagnosis.severity} label={trSeverity(diagnosis.severity)} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(diagnosis.date || diagnosis.created_at).toLocaleDateString(locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">{t('noDiagnosesRecorded')}</p>
          )}
        </div>
      )}
    </div>
  );
}

function SeverityBadge({ severity, label }) {
  const styles = {
    mild: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    severe: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[severity] || 'bg-gray-100 text-gray-800'}`}>
      {label}
    </span>
  );
}

export default PatientProfilePage;
