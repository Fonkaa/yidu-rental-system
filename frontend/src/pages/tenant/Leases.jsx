export default function Leases() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Leases</h1>
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Lease #1001</p>
            <p className="text-sm text-slate-500">Valid until 2027-05-01</p>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">Active</span>
        </div>
      </div>
    </div>
  );
}
