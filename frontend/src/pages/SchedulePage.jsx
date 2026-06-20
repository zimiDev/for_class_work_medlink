import { useEffect, useMemo, useState } from 'react';
import * as doctorService from '../services/doctorService';
import { useLanguage } from '../i18n/LanguageContext';

const SHIFTS = ['day', 'night', 'rotating'];

function SchedulePage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, trShift } = useLanguage();

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await doctorService.getAll({ limit: 100 });
        setDoctors(response.data || response.doctors || response || []);
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, []);

  const grouped = useMemo(() => SHIFTS.map((shift) => ({
    shift,
    doctors: doctors.filter((doctor) => doctor.shift === shift),
  })), [doctors]);

  if (loading) {
    return <div className="py-8 text-center text-sm font-bold text-primary/60">{t('loadingDoctors')}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-primary">{t('weeklySchedule')}</h1>
        <p className="mt-2 text-sm font-medium text-primary/60">{t('shiftCoverage')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {grouped.map((group) => (
          <section key={group.shift} className="premium-panel rounded-lg p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-primary">{trShift(group.shift)}</h2>
              <span className="rounded-full bg-champagne/40 px-3 py-1 text-xs font-black text-primary">
                {group.doctors.length}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {group.doctors.map((doctor) => (
                <article key={doctor.id} className="rounded-lg border border-primary/10 bg-white/70 p-4">
                  <h3 className="font-black text-primary">{doctor.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-secondary">{doctor.specialty}</p>
                  <p className="mt-1 text-sm text-primary/60">{doctor.department}</p>
                </article>
              ))}
              {group.doctors.length === 0 && (
                <p className="rounded-lg border border-dashed border-primary/15 p-4 text-sm font-semibold text-primary/50">
                  {t('noDoctorsFound')}
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default SchedulePage;
