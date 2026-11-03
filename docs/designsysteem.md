# Designsysteem — jouwhockeystick.nl

Hoe een pagina eruitziet en waarom. Vastgelegd bij de redesign van november 2026 (decision log 2026-11-03, fase 1–3). Logo, kleurwaarden en tone of voice staan in [`merkinstructie.md`](merkinstructie.md); dit document zegt hoe we die in de site toepassen. Bij strijd gaat de merkinstructie voor.

## 1. Uitgangspunt

De site moet voelen als een deskundige vriend die hockey speelt: rustig, zeker van zijn zaak, geen verkoper. Binnen vijf seconden denkt een bezoeker: "hier krijg ik in twee minuten te horen welke stick past, en waarom". Daarom:

- **Minder, maar beter.** Eén boodschap per sectie, één hoofdactie per scherm.
- **Eerlijkheid zichtbaar, niet luid.** Bronnen, datums en partnervermelding blijven altijd te vinden, maar zo compact mogelijk; de volledige uitleg staat één klik verder.
- **Het product in beeld.** Een stick is een visueel product: foto's groot en op een rustige ondergrond.

## 2. Kleur: vaste rollen

| Kleur | Rol | Niet voor |
|---|---|---|
| Wit | Basisachtergrond van elke pagina (`body`) en van kaarten | — |
| Krijt `#EEF3FA` | Accentvlak: de hero, één band op de homepage, meldingen, gemarkeerde rijen | De hele pagina |
| Veldblauw `#1846A3` | Knoppen, links, actieve filters, stapnummers | Lange tekst |
| Balcoranje `#FF8A1F` | Alleen de stickwijzer-knop (header en hero) en de bal in de voortgangslijn | Andere knoppen, labels, prijzen |
| Inkt `#0D1B2E` | Tekst en koppen | — |
| Lijngrijs `#5B6B7F` | Bijschriften, bronregels, datums (contrast 5,0:1 op krijt, haalt AA) | Lopende tekst |
| Amber (Tailwind `amber-50/900`) | "Let op"-punten en waarschuwingen | Decoratie |

## 3. Typografie

- Koppen: Bricolage Grotesque (`--font-heading`), lopende tekst: Instrument Sans (`--font-sans`).
- Schaal, en niets daartussen:

| Stap | Tailwind | Gebruik |
|---|---|---|
| 1 | `text-4xl`/`sm:text-5xl`, extrabold | H1 op de homepage |
| 2 | `text-3xl`, bold/extrabold | H1 van een pagina, H2 van een homepage-sectie |
| 3 | `text-2xl`, bold | H2 op een pagina |
| 4 | `text-lg`/`text-xl`, bold | H3, kaarttitels |
| 5 | `text-base` | Lopende tekst |
| 6 | `text-sm` / `text-xs` | Bijschriften, bronregels, labels in hoofdletters (`tracking-wide uppercase`) |

- Bronregels zijn `text-xs text-lijngrijs` en staan direct onder de claim (spec §9.1). Nooit kleiner dan `text-xs`.

## 4. Breedtes

| Breedte | Tailwind | Voor |
|---|---|---|
| Lezen | `max-w-3xl` | Artikelen, Over ons, formulieren, het advies |
| Product | `max-w-5xl` | Homepage, catalogus, stickpagina (twee kolommen vanaf `lg`), merken |
| Tussen | `max-w-4xl` | Kennisbank-overzicht, vergelijken |

Zijmarge altijd `px-4 sm:px-6`; geen horizontaal scrollen op 360 px.

## 5. Vormen en componenten

- **Kaart:** wit, `rounded-2xl` of `rounded-3xl`, `border border-rand`, hooguit `shadow-sm`. Eén kaartvorm per lijst.
- **Productfoto:** op wit (`bg-white`), `object-contain`, in de catalogus 160 px, op de stickpagina tot 256 px, in het advies tot 128 px. Geen patroon achter een foto.
- **Zeshoekpatroon** (`bg-hex-light`, `bg-hex-dark`): alleen in de homepage-hero en de footer, als merkaccent. Niet in kaarten, fotovlakken of secties.
- **Knoppen:** `Button`/`ButtonLink` uit `src/components/ui/Button.tsx`. Primair veldblauw, secundair omlijnd; `accent` (oranje) alleen voor de stickwijzer.
- **Profielkaart** (advies): drie vakken (maat, niveau, route) in één rij vanaf `sm`.
- **Filters:** gewone GET-formulieren met `select`; geen JavaScript nodig, elke selectie is een eigen URL, de canonical blijft de ongefilterde pagina.

## 6. Ritme en witruimte

- Secties op de homepage: `py-16` tot `sm:py-20`. Tussen kop en inhoud `mt-10`/`mt-12`.
- Wissel wit en krijt af zodat secties herkenbaar zijn zonder lijnen: hero (krijt), seizoensband (wit), "Zo werkt het" (krijt), voorbeeldadvies en uitgelichte sticks (wit), footer (veldblauw).

## 7. Beweging en laden

- Geen animaties behalve de voortgangslijn en zacht scrollen in de stickwijzer; beide uit bij `prefers-reduced-motion`.
- Server components als standaard. Een script dat niet nodig is om de pagina te tonen, laadt na het eerste beeld (zoals PostHog sinds fase 2).

## 8. Wat we bewust niet doen

Geen "beste"-, "goedkoopst"- of kortingslabels, geen sterren zonder echte reviews, geen nep-urgentie, geen stockfoto's die op echte spelers lijken. Zie `CLAUDE.md` (Commerce, Kernregels).

## 9. Fotografie

- **Mensen:** alleen echte foto's met toestemming: de jeugdspeelster in de hero (dochter van de eigenaar) en het portret van Hans Buursink, hockeyvader (Over ons, en klein in de hero als "Gemaakt door"). Metadata (EXIF, locatie) gaat er altijd af; bestanden in `src/assets/`.
- **Producten:** de foto's van merk of winkel, zoals de catalogus ze heeft.
- **Geen stockfoto's** van spelers, teams of clubs: die lijken op echte mensen en clubs die er niets mee te maken hebben.
- **Open:** eigen fotografie op een club (spelers, ouders langs de lijn, close-ups van sticks), met toestemming van ouders en club. Kan nog niet (eigenaar, 2026-11-03); tot die tijd blijven de huidige foto's.
