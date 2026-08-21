export default function StatusBadge({ status = 'Pending' }) {
  const palette = {
    Pending: 'bg-amber-100 text-amber-700',
    Approved: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-rose-100 text-rose-700',
    Active: 'bg-emerald-100 text-emerald-700',
    Inactive: 'bg-slate-200 text-slate-700'
  };

  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${palette[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}
