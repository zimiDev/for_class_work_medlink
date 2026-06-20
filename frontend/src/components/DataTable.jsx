import { useLanguage } from '../i18n/LanguageContext';

function DataTable({ columns, data, actions, emptyStateMessage }) {
  const { t } = useLanguage();

  return (
    <div className="premium-panel overflow-hidden rounded-lg">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-500"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                {t('actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id || index} className="border-b border-slate-100 transition-colors even:bg-slate-50/60 hover:bg-oxygen">
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3 text-sm font-medium text-ink">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="whitespace-nowrap px-4 py-3 text-sm">{actions(row)}</td>
              )}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-4 py-8 text-center"
              >
                <div className="flex flex-col items-center justify-center space-y-2 py-6">
                  <span className="grid h-12 w-12 place-items-center rounded-md bg-slate-100 text-lg font-black text-secondary">0</span>
                  <p className="font-semibold text-primary/70">{emptyStateMessage || t('noRecords')}</p>
                  <p className="text-xs text-primary/46">{t('adjustFilters')}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default DataTable;
