# NebenkostenFuchs

Kostenloser Prüfer für Nebenkostenabrechnungen unter https://nebenkostenfuchs.zenkner-technology.de

Abrechnung hochladen, unzulässige Posten, Rechenfehler und verpasste Fristen finden, Musterschreiben als PDF oder Word erzeugen, Erfolg als Teilen-Karte posten.

## Prinzip

1. Text aus PDF (unpdf) oder Foto (Tesseract) auf dem Server auslesen
2. Personendaten maskieren (`src/lib/mask`), Abbruch wenn danach noch IBAN oder Namen erkennbar sind
3. Gemini liest nur Zahlen und Positionen als JSON aus (`src/lib/llm`)
4. Bewertung durch die Regel-Engine (`src/lib/rules`), Kataloge in `src/data/katalog.ts`
5. Nichts wird gespeichert außer anonymer Statistik, Rate-Limit-Hash und Teilen-Karten

Musterschreiben entstehen komplett im Browser (`src/lib/letters`).

## Entwicklung

```
npm install
cp .env.example .env   # GEMINI_API_KEY eintragen, DATABASE_URL leer lassen = In-Memory
npm run dev            # http://localhost:4030
```

## Selbst betreiben

```
cp .env.example .env    # Werte eintragen
docker compose up -d --build
```

Die App läuft danach auf `127.0.0.1:4030` und sollte hinter einem Reverse Proxy mit TLS betrieben werden.

## Logo

`npm run brand` erzeugt alle Logo-Varianten und Icons in `public/brand` neu.

## Lizenz

NebenkostenFuchs Source-Available License (NKF-1.0): Der Quellcode ist zur Einsicht, zum Lernen und zur privaten, nicht-kommerziellen Nutzung freigegeben. Kommerzielle Nutzung und der Betrieb als öffentlicher Dienst nur mit schriftlicher Zustimmung. Details in [LICENSE](LICENSE).

## Hinweis

NebenkostenFuchs ist eine automatisierte Prüfung anhand allgemeiner gesetzlicher Regeln und keine Rechtsberatung.
