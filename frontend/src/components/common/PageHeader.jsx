export default function PageHeader({ title, action }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
      {action}
    </div>
  );
}
