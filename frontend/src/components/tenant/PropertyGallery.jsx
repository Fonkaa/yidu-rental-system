export default function PropertyGallery() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {[1,2,3].map((item) => (
        <div key={item} className="h-32 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300" />
      ))}
    </div>
  );
}
