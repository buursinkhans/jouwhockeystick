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

- **Diepte (fase 5):** drie schaduwen in `globals.css`, licht en inktgetint: `shadow-card` (kaart in rust), `shadow-card-hover` (kaart onder de muis) en `shadow-header` (sticky header). Geen andere schaduwen.
- **Kaart:** de utility `card` (wit, afgerond 20 px, haarlijnrand, `shadow-card`). Een kaart die in zijn geheel een link is, krijgt ook `card-link`: hij komt 2 px omhoog met `shadow-card-hover` (niet bij `prefers-reduced-motion`). Een kaart binnen een kaart blijft vlak (`border border-rand`, geen schaduw).
- **Sectielabel:** de utility `eyebrow`, met een kort veldblauw streepje ervoor, boven elke sectiekop op de homepage en in elke paginakop.
- **Header:** een donkere balk erboven met wat we zijn ("Onafhankelijke stickvergelijker · Prijzen van 4 partnerwinkels · Vergoeding telt niet mee in het advies", op een telefoon alleen het eerste) en daaronder de witte header, die meescrolt (`sticky`, licht doorschijnend met blur). Ankers houden daarvoor 5,5 rem vrij (`scroll-padding-top`).
- **Paginakop:** `PageHeader` (`src/components/ui/PageHeader.tsx`): een band van krijt naar wit met kruimelpad, label, H1 en intro, op dezelfde breedte als de body (`PageBody`). Op sticks, zaalsticks, hockeyschoenen, kennisbank, merken, vergelijken, Over ons en methodiek.
- **Productfoto:** op wit (`bg-white`), `object-contain`, in de catalogus 160 px, op de stickpagina tot 256 px, in het advies tot 128 px. Geen patroon achter een foto.
- **Zeshoekpatroon** (`bg-hex-dark`): alleen in de footer, als merkaccent (sinds fase 7 niet meer in de hero). Niet in kaarten, fotovlakken of secties.
- **Knoppen:** `Button`/`ButtonLink` uit `src/components/ui/Button.tsx`. Primair veldblauw, secundair omlijnd; `accent` (oranje) alleen voor de stickwijzer.
- **Profielkaart** (advies): drie vakken (maat, niveau, route) in één rij, ook op een telefoon.
- **Stickkaart in het advies** (fase 6): rolbadge (Beste match, Veilige keuze, Ambitieuze keuze), merk en naam, vier vakken (maat, kromming, carbon, modeljaar), dan "Waarom deze stick past" naast "Waar je op inlevert", en pas daarna "Waar te koop". **De prijs staat nooit bovenaan**: eerst de pasvorm, dan de winkels.
- **Antwoorden in de stickwijzer:** tikvlakken van 48 px; gekozen = blauwe rand, krijt, ring en vet.
- **Filters:** gewone GET-formulieren met `select`; geen JavaScript nodig, elke selectie is een eigen URL, de canonical blijft de ongefilterde pagina.

## 5b. Visuele uitvoering (fase 7)

- **Kleurtrappen:** `veld-donker` (#12378A) en `bal-donker` (#F07A0C) voor hover en ingedrukt (donkerder, nooit lichter), `mist` (#F6F8FC) als zachtste vlak (navigatie, secundaire knop).
- **Typografie:** H1 800, −0,03 em, regelafstand 1,05; H2 750, −0,022 em, 1,15; H3/H4 1,25; lopende tekst 1,6. Koppen gebruiken de optische maat van Bricolage. Alinea's breken met `text-wrap: pretty`, koppen met `balance`.
- **Maten:** homepage-H1 2,6 rem, vanaf `sm` 6xl; sectiekoppen op de homepage 3xl, vanaf `sm` 2,5 rem; paginakop 2,125 rem, vanaf `sm` 5xl.
- **Ritme:** homepage-secties `py-20`, vanaf `sm` `py-28`; paginakop `pb-12`/`sm:pb-16`; footer `pt-16`/`sm:pt-20`.
- **Knoppen:** 44 px hoog, label 15 px, een lichte binnenrand bovenaan, donkerder bij hover en 1 px omlaag bij indrukken (niet bij `prefers-reduced-motion`). In de header houdt de knop een compact label, zodat alles op één regel past.
- **Hero:** geen patroon, een vlak van krijt naar wit, een staande foto (4:5) met één bijschrift erop in plaats van losse pillen.
- **Productkaarten en schoenkaarten:** de hele kaart is de link (de naam is over de kaart uitgerekt), de kooprij ligt erboven als eigen link. Grotere foto (176 px) die bij hover licht vergroot, de naam in 17 px, een samenvatting van twee regels en sterke punten in compacte letter onder een lijn.

## 5a. Vertrouwen (fase 4)

Vertrouwen bouwen we met wat we kunnen aantonen, niet met wat indruk maakt.

- **Getelde feiten** (`ProofFacts`, gegevens uit `src/catalog/trustFacts.ts`): aantal veldsticks, merken, partnerwinkels en de datum waarop de prijzen laatst gelezen zijn. Nooit een getal met de hand intikken.
- **Afspraken** (`PromiseList`, tekst in `src/content/trust.ts`): vier beloftes, elk met een link naar de pagina die laat zien dat we ons eraan houden. Op de homepage en op `/methodiek`.
- **Vergelijking met één webshop:** neutraal over de winkel en zonder namen van andere winkels.
- **In het advies:** drie vaste afspraken boven de eerste stick (`ADVICE_TRUST_POINTS`). **In de stickwijzer:** drie zekerheden boven de eerste vraag.
- **Een gezicht:** foto, naam en "Hockeyvader" alleen op Over ons (op de homepage en in de footer niet, op verzoek van de eigenaar, 2026-11-04).
- **Niet:** reviews, sterren, gebruikersaantallen of "aanbevolen door"-logo's zonder bron die we kunnen tonen. Willen we het aantal gegeven adviezen tonen, dan moet dat uit de statistieken komen (PostHog, `quiz_complete`) en automatisch bijgewerkt worden.

## 6. Ritme en witruimte

- Secties op de homepage: `py-16` tot `sm:py-20`. Tussen kop en inhoud `mt-10`/`mt-12`.
- Wissel wit en krijt af zodat secties herkenbaar zijn zonder lijnen: hero (krijt), seizoensband (wit), "Zo werkt het" (krijt), voorbeeldadvies (wit), "Waarom jouwhockeystick.nl" (krijt), uitgelichte sticks (wit), footer (veldblauw).
- **Footer:** vier kolommen (merk en partnervermelding, Kiezen, Leren, Over ons); op een telefoon onder elkaar.

## 7. Beweging en laden

- Geen animaties behalve de voortgangslijn en zacht scrollen in de stickwijzer; beide uit bij `prefers-reduced-motion`.
- Server components als standaard. Een script dat niet nodig is om de pagina te tonen, laadt na het eerste beeld (zoals PostHog sinds fase 2).

## 8. Wat we bewust niet doen

Geen "beste"-, "goedkoopst"- of kortingslabels, geen sterren zonder echte reviews, geen nep-urgentie, geen stockfoto's die op echte spelers lijken. Zie `CLAUDE.md` (Commerce, Kernregels).

## 9. Fotografie

- **Mensen:** alleen echte foto's met toestemming: de jeugdspeelster in de hero (dochter van de eigenaar) en het portret van Hans Buursink, hockeyvader (alleen op Over ons). Metadata (EXIF, locatie) gaat er altijd af; bestanden in `src/assets/`.
- **Producten:** de foto's van merk of winkel, zoals de catalogus ze heeft.
- **Geen stockfoto's** van spelers, teams of clubs: die lijken op echte mensen en clubs die er niets mee te maken hebben.
- **Open:** eigen fotografie op een club (spelers, ouders langs de lijn, close-ups van sticks), met toestemming van ouders en club. Kan nog niet (eigenaar, 2026-11-03); tot die tijd blijven de huidige foto's.
