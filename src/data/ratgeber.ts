export interface Artikel {
  slug: string;
  titel: string;
  beschreibung: string;
  abschnitte: Array<{ h: string; p: string[]; liste?: string[] }>;
}

export const ARTIKEL: Artikel[] = [
  {
    slug: "nicht-umlagefaehige-nebenkosten",
    titel: "Welche Nebenkosten sind nicht umlagefähig?",
    beschreibung: "Verwaltung, Reparaturen, Rücklagen und mehr: Diese Kosten darf dein Vermieter nicht auf dich umlegen.",
    abschnitte: [
      {
        h: "Die Grundregel",
        p: [
          "Umlegen darf der Vermieter nur Betriebskosten im Sinne der Betriebskostenverordnung (BetrKV), und nur wenn der Mietvertrag das vereinbart. Betriebskosten sind laufend entstehende Kosten für den Betrieb des Hauses. Alles, was der Erhaltung des Gebäudes oder der Verwaltung dient, trägt der Vermieter selbst.",
        ],
      },
      {
        h: "Diese Kosten gehören nicht in deine Abrechnung",
        p: [],
        liste: [
          "Verwaltungskosten, Verwalterhonorar und Kosten der Abrechnungserstellung",
          "Instandhaltung und Reparaturen, auch wenn sie als „Wartung“ getarnt sind",
          "Instandhaltungsrücklagen und Sonderumlagen einer Eigentümergemeinschaft",
          "Bank-, Kontoführungs-, Porto- und Telefonkosten",
          "Rechtsanwalts-, Gerichts- und Mahnkosten",
          "Notdienstpauschalen des Hausmeisters",
          "Leerstandskosten für nicht vermietete Wohnungen",
          "Mietausfall-, Rechtsschutz- und Reparaturversicherungen",
          "Einmalige Anschaffungen wie neue Mülltonnen oder Rauchmelder (Kauf, nicht Miete oder Wartung)",
        ],
      },
      {
        h: "Achtung bei Mischposten",
        p: [
          "Besonders beim Hausmeister werden Reparatur- und Verwaltungsarbeiten gern mitabgerechnet. Der Vermieter muss diese Anteile herausrechnen. Ist die Position auffällig hoch, verlange Einsicht in den Hausmeistervertrag.",
        ],
      },
    ],
  },
  {
    slug: "frist-nebenkostenabrechnung",
    titel: "Frist für die Nebenkostenabrechnung: Wann ist es zu spät?",
    beschreibung: "Zwölf Monate nach Ende des Abrechnungszeitraums muss die Abrechnung bei dir sein. Kommt sie später, musst du nichts nachzahlen.",
    abschnitte: [
      {
        h: "Zwölf Monate für den Vermieter",
        p: [
          "Nach § 556 Abs. 3 BGB muss dir die Abrechnung spätestens zwölf Monate nach Ende des Abrechnungszeitraums zugehen. Endet der Zeitraum am 31. Dezember 2025, muss die Abrechnung bis zum 31. Dezember 2026 in deinem Briefkasten sein.",
          "Entscheidend ist der Zugang bei dir, nicht das Datum auf dem Schreiben. Kommt die Abrechnung zu spät, kann der Vermieter keine Nachzahlung mehr verlangen. Ein Guthaben muss er dir trotzdem auszahlen.",
        ],
      },
      {
        h: "Zwölf Monate für dich",
        p: [
          "Auch du hast eine Frist: Einwendungen musst du spätestens zwölf Monate nach Zugang der Abrechnung erheben. Danach kannst du dich nur noch auf Fehler berufen, die du nicht zu vertreten hast. Der NebenkostenFuchs rechnet dir dieses Datum aus.",
        ],
      },
      {
        h: "Tipp",
        p: [
          "Notiere dir das Eingangsdatum auf dem Umschlag. Verschicke deinen Widerspruch per Einwurf-Einschreiben, damit du den rechtzeitigen Zugang beweisen kannst.",
        ],
      },
    ],
  },
  {
    slug: "belegeinsicht-nebenkosten",
    titel: "Belegeinsicht: So prüfst du die Rechnungen hinter deiner Abrechnung",
    beschreibung: "Du hast das Recht, alle Originalbelege einzusehen. Bis dahin musst du eine Nachzahlung nicht leisten.",
    abschnitte: [
      {
        h: "Dein Recht auf Einsicht",
        p: [
          "Nach § 259 BGB darfst du die Rechnungen, Verträge und Zahlungsbelege einsehen, die der Abrechnung zugrunde liegen. Das gilt für alle Positionen, auch für die Verteilung nach Wohnfläche oder Personen.",
          "Solange der Vermieter die Einsicht verweigert, ist eine Nachforderung nicht fällig (BGH, VIII ZR 189/17). Die Einsicht findet in der Regel im Büro der Verwaltung statt. Fotos mit dem Handy sind erlaubt.",
        ],
      },
      {
        h: "Worauf du achten solltest",
        p: [],
        liste: [
          "Stimmen Rechnungsbeträge und Zeiträume mit der Abrechnung überein?",
          "Enthalten Rechnungen Reparaturen, Material oder Anfahrten für Reparaturen?",
          "Wurden Kosten für Gewerbeeinheiten im Haus vorab abgezogen?",
          "Stimmen die Wohnflächen und Personenzahlen?",
          "Gibt es Rechnungen aus einem anderen Jahr?",
        ],
      },
    ],
  },
  {
    slug: "heizkosten-15-prozent-kuerzen",
    titel: "Heizkosten um 15 Prozent kürzen: Wann das erlaubt ist",
    beschreibung: "Werden Heizkosten nicht nach Verbrauch abgerechnet oder fehlen fernablesbare Zähler, darfst du kürzen.",
    abschnitte: [
      {
        h: "Verbrauch muss zählen",
        p: [
          "Die Heizkostenverordnung verlangt, dass 50 bis 70 Prozent der Heiz- und Warmwasserkosten nach dem tatsächlichen Verbrauch verteilt werden. Der Rest darf nach Wohnfläche verteilt werden.",
          "Rechnet der Vermieter komplett nach Fläche ab, obwohl eine verbrauchsabhängige Abrechnung möglich wäre, darfst du deinen Anteil nach § 12 HeizkostenV um 15 Prozent kürzen.",
        ],
      },
      {
        h: "Weitere Kürzungsrechte",
        p: [
          "Seit der Novelle der Heizkostenverordnung müssen neu eingebaute Zähler fernablesbar sein, und Mieter haben Anspruch auf monatliche Verbrauchsinformationen. Fehlen diese, ist eine Kürzung um jeweils 3 Prozent möglich.",
        ],
      },
    ],
  },
];
