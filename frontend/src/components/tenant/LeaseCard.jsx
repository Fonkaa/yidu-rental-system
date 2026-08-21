export default function LeaseCard({ title = 'Lease', status = 'Active' }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">{title}</p>
        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">{status}</span>
      </div>
      <p className="mt-3 text-sm text-slate-500">Lease start: 2026-08-01</p>
    </div>
  );
}
