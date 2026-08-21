export default function RentalRequestForm() {
  return (
    <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-xl font-semibold">Request this property</h3>
      <textarea className="w-full rounded-lg border border-slate-300 px-3 py-2.5" rows="4" placeholder="Tell the owner why you are interested" />
      <button className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white">Submit request</button>
    </form>
  );
}
