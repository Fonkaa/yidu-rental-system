export default function PropertyFilter() {
  return (
    <div className="card flex flex-wrap gap-3 p-4">
      <select className="rounded-lg border border-slate-200 px-3 py-2">
        <option>Any type</option>
        <option>Apartment</option>
        <option>Villa</option>
      </select>
      <select className="rounded-lg border border-slate-200 px-3 py-2">
        <option>Any budget</option>
        <option>Under $1000</option>
        <option>$1000 - $2000</option>
      </select>
      <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white">Apply</button>
    </div>
  );
}
