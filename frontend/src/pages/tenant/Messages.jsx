export default function Messages() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Messages</h1>
      <div className="card divide-y divide-slate-200">
        {['Owner support', 'Property manager', 'Viewings coordinator'].map((name, index) => (
          <div key={name} className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-slate-500">{index % 2 === 0 ? 'Can we schedule a visit?' : 'Thanks for your message.'}</p>
            </div>
            <span className="text-sm text-slate-400">2m ago</span>
          </div>
        ))}
      </div>
    </div>
  );
}
