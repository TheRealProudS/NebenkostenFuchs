export function Textseite({ titel, stand, children }: { titel: string; stand?: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-serif text-4xl font-semibold">{titel}</h1>
      {stand && <p className="mt-2 text-sm text-tinte/60">Stand: {stand}</p>}
      <div className="prose-fuchs mt-8">{children}</div>
    </article>
  );
}
