import Link from "next/link";

export function Logo({ klein = false }: { klein?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="NebenkostenFuchs Startseite">
      <img src="/brand/logo-mark.svg" alt="" width={klein ? 32 : 40} height={klein ? 32 : 40} />
      <span className={`${klein ? "text-lg" : "text-xl"} tracking-tight`}>
        Nebenkosten<b className="text-fuchs font-extrabold">Fuchs</b>
      </span>
    </Link>
  );
}
