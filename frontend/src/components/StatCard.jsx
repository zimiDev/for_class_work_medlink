function StatCard({ title, value, icon }) {
  return (
    <div className="premium-panel rounded-lg p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-black text-primary">{value}</p>
          <p className="mt-1 text-sm font-bold text-slate-500">{title}</p>
        </div>
        {icon && (
          <div className="grid h-12 w-12 place-items-center rounded-md bg-oxygen text-lg font-black text-clinical">{icon}</div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
