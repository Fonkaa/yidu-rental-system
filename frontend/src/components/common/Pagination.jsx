export default function Pagination({ page = 1, totalPages = 1 }) {
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">Prev</button>
      <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
      <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">Next</button>
    </div>
  );
}
