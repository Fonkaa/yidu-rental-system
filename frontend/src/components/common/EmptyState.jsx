export default function EmptyState({ title = 'No items found', message = 'Try adjusting your filters.' }) {
  return (
    <div className="card p-10 text-center">
      <h3 className="text-xl font-semibold text-slate-700">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}
