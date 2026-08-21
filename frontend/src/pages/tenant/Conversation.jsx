export default function Conversation() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Conversation</h1>
      <div className="card p-5">
        <div className="space-y-4">
          <div className="max-w-xs rounded-xl bg-slate-100 p-3">Hi, is the apartment still available?</div>
          <div className="ml-auto max-w-xs rounded-xl bg-blue-600 p-3 text-white">Yes, it is available this week.</div>
        </div>
        <div className="mt-6 flex gap-3">
          <input className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5" placeholder="Type a message" />
          <button className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white">Send</button>
        </div>
      </div>
    </div>
  );
}
