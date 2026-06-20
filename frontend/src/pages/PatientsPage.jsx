/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as patientService from '../services/patientService';
import { hasRole } from '../utils/auth';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { useToast } from '../components/Toast';
import { useLanguage } from '../i18n/LanguageContext';

function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;
  const navigate = useNavigate();
  const { t, trGender } = useLanguage();
  const { showToast } = useToast();

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await patientService.getAll({ search, page, limit });
      setPatients(response.data || response);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  function handleSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function matchesAgeGroup(patient) {
    if (!ageGroup) return true;
    const age = Number(patient.age);
    if (ageGroup === '0-17') return age <= 17;
    if (ageGroup === '18-40') return age >= 18 && age <= 40;
    if (ageGroup === '41-60') return age >= 41 && age <= 60;
    if (ageGroup === '60+') return age > 60;
    return true;
  }

  function exportToCSV() {
    if (!tableData.length) return;
    const headers = ['name', 'age', 'gender_label', 'doctor_name', 'phone', 'address'];
    const rows = tableData.map((patient) => headers.map((key) => `"${String(patient[key] || '').replaceAll('"', '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patients.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete(id) {
    if (!window.confirm(t('confirmDeletePatient'))) return;
    try {
      await patientService.remove(id);
      showToast(t('deletedSuccessfully'));
      fetchPatients();
    } catch (error) {
      console.error('Failed to delete patient:', error);
      showToast(t('errorOccurred'), 'error');
    }
  }

  const columns = [
    { key: 'name', label: t('name'), render: (row) => <Highlight value={row.name} term={search} /> },
    { key: 'age', label: t('age') },
    { key: 'gender_label', label: t('gender') },
    { key: 'doctor_name', label: t('doctor') },
    { key: 'phone', label: t('phone'), render: (row) => <Highlight value={row.phone} term={search} /> },
  ];

  const tableData = patients.filter(matchesAgeGroup).map((patient) => ({
    ...patient,
    name: `${patient.first_name} ${patient.last_name}`,
    gender_label: trGender(patient.gender),
  }));

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="clinic-page space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="clinic-section-title">{t('recordsControl')}</p>
            <h1 className="mt-2 text-3xl font-black text-primary">{t('patients')}</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">{t('searchPatients')}</p>
          </div>
        {(hasRole('Admin') || hasRole('Receptionist')) && (
          <div className="flex flex-wrap gap-2">
            {hasRole('Admin') && (
              <button onClick={exportToCSV} className="ghost-button px-4 py-2 text-sm font-bold">
                {t('exportCsv')}
              </button>
            )}
            <button onClick={() => navigate('/patients/new')} className="premium-button px-4 py-2 text-sm font-bold">
              {t('addPatient')}
            </button>
          </div>
        )}
        </div>
      </div>

      <div className="premium-panel flex flex-col gap-4 rounded-lg p-4 md:flex-row">
        <div className="flex-1">
          <SearchBar value={search} onChange={handleSearch} placeholder={t('searchPatients')} />
        </div>
        <select
          value={ageGroup}
          onChange={(e) => { setAgeGroup(e.target.value); setPage(1); }}
          className="premium-input w-full px-4 py-2 md:w-56"
        >
          <option value="">{t('allAges')}</option>
          <option value="0-17">0-17</option>
          <option value="18-40">18-40</option>
          <option value="41-60">41-60</option>
          <option value="60+">60+</option>
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm font-bold text-primary/58">{t('loadingPatients')}</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={tableData}
            emptyStateMessage={t('noPatientsFound')}
            actions={(row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/patients/${row.id}`)}
                  className="ghost-button px-3 py-1 text-sm font-bold"
                >
                  {t('viewProfile')}
                </button>
                {(hasRole('Admin') || hasRole('Clinician') || hasRole('Receptionist')) && (
                  <button
                    onClick={() => navigate(`/patients/${row.id}/edit`)}
                    className="rounded-lg bg-champagne/40 px-3 py-1 text-sm font-bold text-primary transition-colors hover:bg-champagne/60"
                  >
                    {t('edit')}
                  </button>
                )}
                {hasRole('Admin') && (
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="rounded-lg bg-red-100 px-3 py-1 text-sm font-bold text-red-700 transition-colors hover:bg-red-200"
                  >
                    {t('delete')}
                  </button>
                )}
              </div>
            )}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

function Highlight({ value, term }) {
  const text = String(value || '');
  if (!term.trim()) return text;
  const index = text.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-yellow-200 px-0.5 text-ink">{text.slice(index, index + term.length)}</mark>
      {text.slice(index + term.length)}
    </>
  );
}

export default PatientsPage;
