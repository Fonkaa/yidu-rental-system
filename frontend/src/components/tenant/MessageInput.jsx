export default function MessageInput() {
  return (
    <div className="flex gap-3">
      <input className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5" placeholder="Type your message..." />
      <button className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white">Send</button>
    </div>
  );
}
