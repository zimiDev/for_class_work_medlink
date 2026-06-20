/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as diagnosisService from '../services/diagnosisService';
import { hasRole } from '../utils/auth';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { useToast } from '../components/Toast';
import { useLanguage } from '../i18n/LanguageContext';

function DiagnosesPage() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;
  const navigate = useNavigate();
  const { t, trSeverity, locale } = useLanguage();
  const { showToast } = useToast();

  const fetchDiagnoses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, page, limit };
      if (severity) params.severity = severity;
      const response = await diagnosisService.getAll(params);
      setDiagnoses(response.data || response);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch diagnoses:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, severity]);

  useEffect(() => {
    fetchDiagnoses();
  }, [fetchDiagnoses]);

  function handleSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleSeverityChange(e) {
    setSeverity(e.target.value);
    setPage(1);
  }

  async function handleDelete(id) {
    if (!window.confirm(t('confirmDeleteDiagnosis'))) return;
    try {
      await diagnosisService.remove(id);
      showToast(t('deletedSuccessfully'));
      fetchDiagnoses();
    } catch (error) {
      console.error('Failed to delete diagnosis:', error);
      showToast(t('errorOccurred'), 'error');
    }
  }

  const columns = [
    { key: 'icd_code', label: t('icdCode'), render: (row) => <Highlight value={row.icd_code} term={search} /> },
    { key: 'description', label: t('description'), render: (row) => <Highlight value={row.description} term={search} /> },
    { key: 'severity_badge', label: t('severity') },
    { key: 'patient_name', label: t('patient') },
    { key: 'formatted_date', label: t('date') },
  ];

  const tableData = diagnoses.map((diagnosis) => ({
    ...diagnosis,
    severity_badge: (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          diagnosis.severity === 'mild'
            ? 'bg-green-100 text-green-800'
            : diagnosis.severity === 'moderate'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {trSeverity(diagnosis.severity)}
      </span>
    ),
    formatted_date: new Date(diagnosis.date || diagnosis.created_at).toLocaleDateString(locale),
  }));

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="clinic-page space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="clinic-section-title">{t('triageQueue')}</p>
            <h1 className="mt-2 text-3xl font-black text-primary">{t('diagnoses')}</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">{t('searchDiagnoses')}</p>
          </div>
        {(hasRole('Admin') || hasRole('Clinician')) && (
          <button
            onClick={() => navigate('/diagnoses/new')}
            className="premium-button px-4 py-2 text-sm font-bold"
          >
            {t('addDiagnosis')}
          </button>
        )}
        </div>
      </div>

      <div className="premium-panel flex flex-col gap-4 rounded-lg p-4 sm:flex-row">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder={t('searchDiagnoses')}
          />
        </div>
        <select
          value={severity}
          onChange={handleSeverityChange}
          className="premium-input w-full px-4 py-2 sm:w-auto"
        >
          <option value="">{t('allSeverities')}</option>
          <option value="mild">{t('mild')}</option>
          <option value="moderate">{t('moderate')}</option>
          <option value="severe">{t('severe')}</option>
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm font-bold text-primary/58">{t('loadingDiagnoses')}</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={tableData}
            emptyStateMessage={t('noDiagnosesFound')}
            actions={(row) => (
              <div className="flex gap-2">
                {(hasRole('Admin') || hasRole('Clinician')) && (
                  <button
                    onClick={() => navigate(`/diagnoses/${row.id}/edit`)}
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

export default DiagnosesPage;
