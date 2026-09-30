import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-linie">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 text-sm sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="font-semibold">NebenkostenFuchs</p>
          <p className="mt-2 max-w-sm text-tinte/70">
            Ein kostenloses Werkzeug von Zenkner Technology. Automatisierte Prüfung nach BetrKV und BGB, keine Rechtsberatung im Einzelfall.
          </p>
        </div>
        <ul className="space-y-2">
          <li><Link href="/pruefen" className="hover:text-fuchs">Abrechnung prüfen</Link></li>
          <li><Link href="/ratgeber" className="hover:text-fuchs">Ratgeber</Link></li>
          <li><Link href="/hinweise" className="hover:text-fuchs">So prüft der Fuchs</Link></li>
        </ul>
        <ul className="space-y-2">
          <li><Link href="/impressum" className="hover:text-fuchs">Impressum</Link></li>
          <li><Link href="/datenschutz" className="hover:text-fuchs">Datenschutz</Link></li>
          <li><a href="https://zenkner-technology.de/projekte/nebenkostenfuchs" className="hover:text-fuchs">Über das Projekt</a></li>
        </ul>
      </div>
    </footer>
  );
}
