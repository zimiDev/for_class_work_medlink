import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as doctorService from '../services/doctorService';
import { useLanguage } from '../i18n/LanguageContext';

function DoctorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, trGender, trShift } = useLanguage();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const response = await doctorService.getById(id);
        setDoctor(response.data || response);
      } catch (error) {
        console.error('Failed to fetch doctor profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctor();
  }, [id]);

  if (loading) {
    return <div className="py-8 text-center text-sm font-bold text-primary/60">{t('loadingDoctor')}</div>;
  }

  if (!doctor) {
    return <div className="py-8 text-center text-sm font-bold text-primary/60">{t('doctorNotFound')}</div>;
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/doctors')} className="ghost-button px-4 py-2 text-sm font-bold">
        {t('doctors')}
      </button>

      <section className="premium-panel rounded-lg p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-secondary">{t('doctorProfile')}</p>
            <h1 className="mt-2 text-3xl font-black text-primary">{doctor.name}</h1>
            <p className="mt-2 text-sm font-semibold text-primary/60">{doctor.position}</p>
          </div>
          <ShiftBadge label={trShift(doctor.shift)} shift={doctor.shift} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Info label={t('specialty')} value={doctor.specialty} />
          <Info label={t('department')} value={doctor.department} />
          <Info label={t('contact')} value={doctor.contact || t('notAvailable')} />
          <Info label={t('shift')} value={trShift(doctor.shift)} />
        </div>
      </section>

      <section className="premium-panel overflow-hidden rounded-lg">
        <div className="border-b border-primary/10 px-5 py-4">
          <h2 className="text-lg font-black text-primary">{t('assignedPatients')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px]">
            <thead className="bg-primary/[0.03]">
              <tr>
                {[t('name'), t('age'), t('gender'), t('phone'), t('address')].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-primary/56">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(doctor.patients || []).map((patient) => (
                <tr key={patient.id} className="border-t border-primary/8 even:bg-white/40">
                  <td className="px-4 py-3 text-sm font-semibold text-ink">{patient.first_name} {patient.last_name}</td>
                  <td className="px-4 py-3 text-sm text-ink">{patient.age}</td>
                  <td className="px-4 py-3 text-sm text-ink">{trGender(patient.gender)}</td>
                  <td className="px-4 py-3 text-sm text-ink">{patient.phone}</td>
                  <td className="px-4 py-3 text-sm text-ink">{patient.address}</td>
                </tr>
              ))}
              {(!doctor.patients || doctor.patients.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm font-semibold text-primary/48">{t('noPatientsFound')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-primary/10 bg-white/70 p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-primary/46">{label}</p>
      <p className="mt-2 font-bold text-primary">{value}</p>
    </div>
  );
}

function ShiftBadge({ shift, label }) {
  const styles = {
    day: 'bg-amber-100 text-amber-800',
    night: 'bg-indigo-100 text-indigo-800',
    rotating: 'bg-purple-100 text-purple-800',
  };
  return <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${styles[shift] || 'bg-gray-100 text-gray-700'}`}>{label}</span>;
}

export default DoctorProfilePage;
