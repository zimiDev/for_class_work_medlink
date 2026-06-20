import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import api from '../services/api';
import { getUser } from '../utils/auth';
import { useLanguage } from '../i18n/LanguageContext';

function DashboardPage() {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, diagnoses: 0 });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentDiagnoses, setRecentDiagnoses] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [shiftStats, setShiftStats] = useState({ day: 0, night: 0, rotating: 0 });
  const [severityStats, setSeverityStats] = useState({ mild: 0, moderate: 0, severe: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUser();
  const role = user?.role;
  const { t, trGender, trSeverity, trShift, locale } = useLanguage();

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await api.get('/dashboard/stats');
        const payload = response.data.data || response.data;
        setStats({
          doctors: payload.totalDoctors || 0,
          patients: payload.totalPatients || 0,
          diagnoses: payload.totalDiagnoses || 0,
        });
        setRecentPatients(payload.recentPatients || []);
        setRecentDiagnoses(payload.recentDiagnoses || []);
        setShiftStats(payload.shiftStats || { day: 0, night: 0, rotating: 0 });
        setSeverityStats(payload.severityStats || { mild: 0, moderate: 0, severe: 0 });

        if (role === 'Receptionist') {
          const docRes = await api.get('/doctors?limit=5');
          const docsData = docRes.data.doctors || docRes.data.data || docRes.data || [];
          setDoctorsList(docsData.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [role]);

  const pageCopy = useMemo(() => {
    if (role === 'Clinician') return { title: t('clinicianTitle'), intro: t('clinicianIntro') };
    if (role === 'Receptionist') return { title: t('receptionistTitle'), intro: t('receptionistIntro') };
    return { title: t('adminTitle'), intro: t('adminIntro') };
  }, [role, t]);

  const actions = useMemo(() => {
    const byRole = {
      Admin: [
        { label: t('addDoctor'), path: '/doctors/new', mark: 'DR' },
        { label: t('registerPatient'), path: '/patients/new', mark: 'PT' },
        { label: t('recordDiagnosis'), path: '/diagnoses/new', mark: 'DX' },
        { label: t('manageUsers'), path: '/users', mark: 'US' },
      ],
      Clinician: [
        { label: t('newDiagnosis'), path: '/diagnoses/new', mark: 'DX' },
        { label: t('patientDirectory'), path: '/patients', mark: 'PT' },
      ],
      Receptionist: [
        { label: t('registerPatient'), path: '/patients/new', mark: 'PT' },
        { label: t('doctorRoster'), path: '/doctors', mark: 'DR' },
      ],
    };
    return byRole[role] || [];
  }, [role, t]);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-clinical" />
        <p className="text-sm font-bold text-slate-500">{t('loadingWorkspace')}</p>
      </div>
    );
  }

  const severeCount = recentDiagnoses.filter((item) => item.severity === 'severe').length;
  const date = (value) => (value ? new Date(value).toLocaleDateString(locale) : '-');

  return (
    <div className="clinic-page space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="grid gap-0 lg:grid-cols-[1fr_20rem]">
          <div className="p-5">
            <p className="clinic-section-title">{t('clinicPulse')}</p>
            <h1 className="mt-2 text-2xl font-black text-primary sm:text-3xl">{pageCopy.title}</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">{pageCopy.intro}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MiniMetric label={t('todayFlow')} value={stats.patients} />
              <MiniMetric label={t('triageQueue')} value={severityStats.severe || 0} />
              <MiniMetric label={t('careCoordination')} value={stats.doctors} />
            </div>
          </div>
          <div className="border-t border-slate-200 bg-slate-50/70 p-5 lg:border-l lg:border-t-0">
            <p className="clinic-section-title">{t('recordsControl')}</p>
            <div className="mt-4 space-y-3">
              <InfoLine label={t('username')} value={user?.username || '-'} />
              <InfoLine label={t('role')} value={user?.role || '-'} />
              <InfoLine label={t('date')} value={new Date().toLocaleDateString(locale)} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {role === 'Receptionist' ? (
          <>
            <StatCard title={t('registeredPatients')} value={stats.patients} icon="PT" />
            <StatCard title={t('activeDoctors')} value={stats.doctors} icon="DR" />
          </>
        ) : role === 'Clinician' ? (
          <>
            <StatCard title={t('myPatients')} value={stats.patients} icon="PT" />
            <StatCard title={t('myDiagnoses')} value={stats.diagnoses} icon="DX" />
            <StatCard title={t('severeCases')} value={severeCount} icon="!" />
          </>
        ) : (
          <>
            <StatCard title={t('totalDoctors')} value={stats.doctors} icon="DR" />
            <StatCard title={t('totalPatients')} value={stats.patients} icon="PT" />
            <StatCard title={t('totalDiagnoses')} value={stats.diagnoses} icon="DX" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="premium-panel rounded-lg p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-black text-primary">{t('shiftCoverage')}</h2>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500">
              {t('systemOnline')}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {['day', 'night', 'rotating'].map((shift) => (
              <div key={shift} className="rounded-md border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{trShift(shift)}</p>
                <p className="mt-2 text-2xl font-black text-primary">{shiftStats[shift] || 0}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-500">
            {t('doctorsOnDayShift')}: {shiftStats.day || 0}
          </p>
        </section>
        <SeverityChart title={t('diagnosisSeverityChart')} stats={severityStats} t={t} />
      </div>

      <section className="premium-panel rounded-lg p-5">
        <h2 className="text-base font-black text-primary">{t('quickActions')}</h2>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {actions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="group flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-teal-200 hover:bg-oxygen"
            >
              <span className="font-bold text-primary">{action.label}</span>
              <span className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-slate-50 text-xs font-black text-slate-600 group-hover:border-teal-200 group-hover:text-clinical">
                {action.mark}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashboardTable
          title={role === 'Clinician' ? t('patientsUnderCare') : role === 'Receptionist' ? t('recentIntakes') : t('recentPatients')}
          headers={[t('name'), t('age'), t('gender'), t('date')]}
          empty={t('noRecentPatients')}
          rows={recentPatients.map((patient) => [
            `${patient.first_name} ${patient.last_name}`,
            patient.age,
            trGender(patient.gender),
            date(patient.created_at),
          ])}
        />

        {role === 'Receptionist' ? (
          <DashboardTable
            title={t('doctorDirectory')}
            headers={[t('doctor'), t('specialty'), t('department')]}
            empty={t('noDoctorRecords')}
            rows={doctorsList.map((doctor) => [doctor.name, doctor.specialty, doctor.department])}
          />
        ) : (
          <DashboardTable
            title={role === 'Clinician' ? t('diagnosisRecords') : t('recentDiagnoses')}
            headers={[t('patient'), t('icdCode'), t('severity'), t('dateLogged')]}
            empty={t('noRecentDiagnoses')}
            rows={recentDiagnoses.map((diagnosis) => [
              diagnosis.patient_name || '-',
              diagnosis.icd_code,
              <SeverityBadge key={`${diagnosis.id}-severity`} severity={diagnosis.severity} label={trSeverity(diagnosis.severity)} />,
              date(diagnosis.created_at),
            ])}
          />
        )}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/70 px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-primary">{value}</p>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-3 py-2">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <span className="truncate text-sm font-black text-primary">{value}</span>
    </div>
  );
}

function DashboardTable({ title, headers, rows, empty }) {
  return (
    <section className="premium-panel overflow-hidden rounded-lg">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-black text-primary">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead className="bg-slate-50">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map((row, index) => (
              <tr key={index} className="border-t border-slate-100 even:bg-slate-50/60">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-sm font-medium text-ink">
                    {cell}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SeverityChart({ title, stats, t }) {
  const counts = stats || { mild: 0, moderate: 0, severe: 0 };
  const total = Math.max(Object.values(counts).reduce((sum, value) => sum + value, 0), 1);
  const rows = [
    ['mild', counts.mild],
    ['moderate', counts.moderate],
    ['severe', counts.severe],
  ];

  return (
    <section className="premium-panel rounded-lg p-5">
      <h2 className="text-base font-black text-primary">{title}</h2>
      <div className="mt-4 space-y-3">
        {rows.map(([severity, value]) => (
          <div key={severity}>
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{t(severity)}</span>
              <span>{value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-clinical"
                style={{ width: `${Math.max((value / total) * 100, value > 0 ? 8 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SeverityBadge({ severity, label }) {
  const styles = {
    mild: 'bg-emerald-100 text-emerald-700',
    moderate: 'bg-amber-100 text-amber-800',
    severe: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-black ${styles[severity] || 'bg-gray-100 text-gray-700'}`}>
      {label}
    </span>
  );
}

export default DashboardPage;
