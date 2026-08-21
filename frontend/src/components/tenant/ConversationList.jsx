export default function ConversationList() {
  return (
    <div className="space-y-3">
      {['Support team', 'Owner', 'Manager'].map((item) => (
        <div key={item} className="rounded-xl border border-slate-200 p-3">
          <p className="font-medium">{item}</p>
          <p className="text-sm text-slate-500">Latest activity today.</p>
        </div>
      ))}
    </div>
  );
}
