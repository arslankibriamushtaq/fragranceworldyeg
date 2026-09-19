export default function PolicyPage({ title, updated, sections }: { title: string; updated: string; sections: { heading: string; body: React.ReactNode }[] }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="section-title">{title}</h1>
        <div className="gold-divider mx-auto" />
        <p className="text-xs text-gray-400 uppercase tracking-widest mt-3">Last updated {updated}</p>
      </div>
      <div className="space-y-8">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-serif text-xl text-forest-900 mb-2">{s.heading}</h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">{s.body}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
