import Link from "next/link";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="border-b border-linie">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Logo />
        <nav className="flex items-center gap-5 text-sm font-semibold">
          <Link href="/ratgeber" className="hidden hover:text-fuchs sm:inline">Ratgeber</Link>
          <Link href="/pruefen" className="btn btn-primaer !py-2 !px-4 text-sm">Jetzt prüfen</Link>
        </nav>
      </div>
    </header>
  );
}
