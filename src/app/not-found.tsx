import Link from "next/link";

export default function NichtGefunden() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <img src="/brand/logo-mark.svg" alt="" className="mx-auto h-24 w-24" />
      <h1 className="mt-6 font-serif text-3xl font-semibold">Hier hat der Fuchs nichts gefunden.</h1>
      <Link href="/" className="btn btn-primaer mt-8">Zur Startseite</Link>
    </div>
  );
}
