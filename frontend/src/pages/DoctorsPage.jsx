/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { useToast } from '../components/Toast';
import * as doctorService from '../services/doctorService';
import { getUser } from '../utils/auth';
import { useLanguage } from '../i18n/LanguageContext';

function DoctorsPage() {
  const navigate = useNavigate();
  const user = getUser();
  const { t, trShift } = useLanguage();
  const { showToast } = useToast();

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [shift, setShift] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (department) params.department = department;
      if (shift) params.shift = shift;

      const data = await doctorService.getAll(params);
      setDoctors(data.doctors || data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setLoading(false);
    }
  }, [department, page, search, shift]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  async function handleDelete(id) {
    if (!window.confirm(t('confirmDeleteDoctor'))) return;
    try {
      await doctorService.remove(id);
      showToast(t('deletedSuccessfully'));
      fetchDoctors();
    } catch (error) {
      console.error('Failed to delete doctor:', error);
      showToast(t('errorOccurred'), 'error');
    }
  }

  const columns = [
    { key: 'name', label: t('name'), render: (row) => <Highlight value={row.name} term={search} /> },
    { key: 'specialty', label: t('specialty'), render: (row) => <Highlight value={row.specialty} term={search} /> },
    { key: 'department', label: t('department'), render: (row) => <Highlight value={row.department} term={search} /> },
    { key: 'position', label: t('position') },
    { key: 'shift', label: t('shift'), render: (row) => <ShiftBadge shift={row.shift} label={trShift(row.shift)} /> },
    { key: 'contact', label: t('contact') },
  ];

  const totalPages = Math.ceil(total / limit);

  const isAdmin = user?.role === 'Admin';

  function exportToCSV() {
    if (!doctors.length) return;
    const headers = ['name', 'specialty', 'department', 'position', 'shift', 'contact'];
    const rows = doctors.map((doctor) => headers.map((key) => `"${String(doctor[key] || '').replaceAll('"', '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'doctors.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="clinic-page space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="clinic-section-title">{t('careCoordination')}</p>
            <h1 className="mt-2 text-3xl font-black text-primary">{t('doctors')}</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">{t('searchDoctors')}</p>
          </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button onClick={exportToCSV} className="ghost-button px-4 py-2 text-sm font-bold">
              {t('exportCsv')}
            </button>
            <button onClick={() => navigate('/doctors/new')} className="premium-button px-4 py-2 text-sm font-bold">
              {t('addDoctor')}
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Filters */}
      <div className="premium-panel flex flex-col gap-4 rounded-lg p-4 md:flex-row">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('searchDoctors')}
          />
        </div>
        <div className="w-full md:w-auto">
          <input
            type="text"
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
            placeholder={t('filterDepartment')}
            className="premium-input w-full px-4 py-2 md:w-auto"
          />
        </div>
        <div className="w-full md:w-56">
          <select
            value={shift}
            onChange={(e) => { setShift(e.target.value); setPage(1); }}
            className="premium-input w-full px-4 py-2"
          >
            <option value="">{t('allShifts')}</option>
            <option value="day">{t('dayShift')}</option>
            <option value="night">{t('nightShift')}</option>
            <option value="rotating">{t('rotatingShift')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-32 space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm font-bold text-primary/58">{t('loadingDoctors')}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={doctors}
          emptyStateMessage={t('noDoctorsFound')}
          actions={(row) => (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/doctors/${row.id}`)}
                className="ghost-button px-3 py-1 text-sm font-bold"
              >
                {t('view')}
              </button>
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigate(`/doctors/${row.id}/edit`)}
                    className="ghost-button px-3 py-1 text-sm font-bold"
                  >
                    {t('edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="rounded-lg bg-red-100 px-3 py-1 text-sm font-bold text-red-700 transition-colors hover:bg-red-200"
                  >
                    {t('delete')}
                  </button>
                </>
              )}
            </div>
          )}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

function ShiftBadge({ shift, label }) {
  const styles = {
    day: 'bg-amber-100 text-amber-800',
    night: 'bg-indigo-100 text-indigo-800',
    rotating: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-black ${styles[shift] || 'bg-gray-100 text-gray-700'}`}>
      {label}
    </span>
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

export default DoctorsPage;
