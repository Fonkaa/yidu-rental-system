export default function MessageBubble({ mine = false, text = 'Hello there' }) {
  return (
    <div className={`max-w-xs rounded-xl p-3 ${mine ? 'ml-auto bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
      {text}
    </div>
  );
}
