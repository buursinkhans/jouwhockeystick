# Prijsvergelijking per stick — architectuurnotitie

**Status:** fase 0 en fase 1 gebouwd (2026-10-27), met optie A uit §4.
- **Fase 0**, de overlapmeting: issue #99.
- **Fase 1**, het blok "Waar te koop" op de stickpagina en in elk stickadvies: `src/components/offers/WhereToBuy.tsx`, met gegevens uit `src/catalog/offers/`.

De besluiten staan in `docs/decision-log.md` (2026-10-26 en 2026-10-27).

**Afwijkingen van dit voorstel in fase 1:**
- Het blok staat voor álle sticks, niet alleen voor de 20–30 meest geadviseerde. Het kost niets extra: de prijzen gaan mee in de wekelijkse PR.
- Bij bol.com tonen we alleen sticks met een bevestigde bol.com-pagina, nooit een zoeklink.
**Samenhang:** `docs/business-model.md` §5a (partnerprogramma's), `CLAUDE.md` (Commerce), `src/lib/retailers.ts`, `src/catalog/livePrice.ts`.

---

## 1. Wat we bouwen

Na het advies ("welke stick past bij mij?") helpt de site met de tweede vraag: "waar koop ik hem?". Per stick een blok **Waar te koop**: elke partnerwinkel die hem verkoopt, met prijs, verzendkosten, voorraad en de datum waarop we de prijs lazen, gesorteerd op totaalprijs.

**Niet:** een losse prijsvergelijker naast het advies, prijsalerts, of een "goedkoopst"-belofte. Het advies blijft de hoofdzaak; vergelijken is de stap erna.

## 2. Spelregels (vastgelegd in CLAUDE.md)

1. **Sorteren op totaalprijs** (prijs plus verzendkosten voor één stick). Nooit op commissie, cookieduur of netwerk. Bij gelijke prijs: de winkel waarvan we de prijs het recentst lazen, daarna alfabetisch.
2. **Commissie speelt nergens een rol**: niet in de adviesscore, niet in de volgorde, niet in welke winkel een opvallende knop krijgt. Alle winkelknoppen zien er hetzelfde uit.
3. **Uitleg op de pagina**: één zin bij het blok ("Gesorteerd op prijs incl. verzending. We verdienen een vergoeding als je via een link koopt; dat verandert de volgorde niet.") met een link naar de volledige uitleg op /methodiek.
4. **Alleen de actuele feedprijs.** Geen van-/voorprijzen, geen doorgestreepte bedragen, geen "X% korting", geen "goedkoopst!". Wel: "laagste prijs in de feeds op [datum]".
5. **Datum altijd zichtbaar**: "Prijs gelezen op [datum]". Is de prijs ouder dan 14 dagen, dan verbergen we het bedrag en tonen we alleen de knop ("Bekijk de actuele prijs bij [winkel]").
6. **Alleen bevestigde koppelingen.** Twijfelt de matcher of het bij de winkel om hetzelfde model (en hetzelfde modeljaar) gaat, dan tonen we die winkel niet. Een verkeerde koppeling schaadt meer dan een ontbrekende.
7. **Alleen goedgekeurde programma's.** Een winkel komt pas op de site na goedkeuring en een besluit in de decision log (`business-model.md` §5a).
8. **Sticks die geen partnerwinkel verkoopt** blijven in het advies en op hun pagina, met de melding dat we geen partnerwinkel kennen.

## 3. De drie lastige stukken

### 3.1 Koppelen (matching)

Hockeysticks hebben vaak geen betrouwbare EAN, en winkels noemen hetzelfde model verschillend ("JDH X93TT Pro Bow 2025/26" vs "JDH X93 TT PB 25"). Daarom twee stappen:

- **Automatisch voorstel.** Een script vergelijkt per winkelfeed merk, modelnaam (genormaliseerd), bow-type, collectiejaar en EAN waar die er is, en geeft per koppeling een zekerheid: `zeker` (EAN gelijk, of merk + model + jaar exact), `twijfel` of `geen`.
- **Vastleggen in de repo.** Koppelingen staan per stick in één bestand (`src/catalog/offers/matches.ts`): slug → per winkel het product-ID in de feed. `zeker` gaat mee in de wekelijkse PR; `twijfel` komt in het PR-verslag als lijstje om met de hand te bevestigen. Zo ziet de eigenaar elke nieuwe koppeling voordat hij live staat.

### 3.2 Gegevensmodel

Per stick een lijst aanbiedingen, los van de productdata (CLAUDE.md: catalogus en prijzen gescheiden):

```ts
type Offer = {
  retailer: RetailerId;        // 'bolcom' | 'passasports' | 'plutosport' | ...
  productUrl: string;          // winkelpagina; de trackinglink bouwt retailers.ts
  priceEur: number;            // actuele prijs in de feed, incl. btw
  shippingEur: number | null;  // null = onbekend; dan staat dat erbij
  inStock: boolean;
  lengths?: string[];          // op voorraad volgens de feed, als de feed dat geeft
  readAt: string;              // JJJJ-MM-DD
};
```

`src/lib/retailers.ts` krijgt per nieuwe winkel een `getUrl` voor de trackinglink van het netwerk (Awin, Daisycon), zoals nu voor bol.com en TradeTracker.

### 3.3 Prijzen actueel houden zonder Netlify-credits te verbranden

Dat is de architectuurkeuze in §4.

## 4. Architectuur: hoe komen nieuwe prijzen op de site?

**Gegeven (bron: Netlify-documentatie, oktober 2026):** een productie-deploy kost 15 credits; deploy-previews 0; rekentijd van functions 10 credits per GB-uur; webverzoeken 2 credits per 10.000. Ons budget is 1.000 credits per maand. De PassaHockey-sync opent nu al elke woensdag een PR; die merge kost al 15 credits per week.

### Optie A — Meeliften op de wekelijkse sync-PR (aanbevolen voor fase 1)

Eén wekelijkse feed-agent leest alle goedgekeurde feeds (bol.com, TradeTracker, Awin, later Daisycon) en zet de aanbiedingen in de repo, in dezelfde PR als de PassaHockey-sync. De eigenaar merget één keer per week, zoals nu.

- **Extra credits:** 0 (de wekelijkse deploy gebeurt al).
- **Actualiteit:** prijzen tot 7 dagen oud. Voor sticks voldoende: prijzen wisselen vooral rond de seizoenswissel en uitverkopen. De winkel toont na de klik altijd de actuele prijs.
- **Controle:** elke wijziging gaat via PR, CI en preview, zoals afgesproken.
- **Nadeel:** een prijsverlaging of uitverkochte stick staat soms een week verkeerd. Opgevangen door regel 5 (bedrag verbergen na 14 dagen) en de datum bij elke prijs.

### Optie B — Prijzen buiten de build, pagina ververst zichzelf (fase 2, als A te traag blijkt)

De feed-agent schrijft de aanbiedingen dagelijks naar een apart databestand (bijv. in Netlify Blobs). De stickpagina's worden één keer per dag opnieuw opgebouwd (`revalidate`, wat de homepage nu al doet) en lezen dan dat bestand.

- **Extra credits:** geen deploys; wel wat rekentijd. Ruwe schatting: 30–500 pagina's × één keer per dag × een fractie van een seconde blijft ruim onder 10 credits per maand. Te meten in de eerste maand.
- **Actualiteit:** prijzen tot 1 dag oud.
- **Nadeel 1:** prijsdata gaat live zonder PR. Dat wijkt af van de afspraak "elke wijziging via een PR" en vraagt een expliciet besluit van de eigenaar.
- **Nadeel 2:** de agent heeft een Netlify-sleutel nodig (GitHub-secret) en schrijft naar de productieomgeving. Productieconfiguratie: alleen op expliciete opdracht.

### Optie C — Prijzen in de browser laden (afgeraden)

Het blok haalt de prijzen pas in de browser op. Goedkoop en actueel, maar de prijzen staan dan niet in de server-HTML. Dat strijdt met CLAUDE.md (GEO/SEO: belangrijke inhoud server-rendered) en kost juist de vindbaarheid op "[model] prijs".

### Advies

Start met **A**. Meet daarna twee dingen: hoe vaak verandert een prijs binnen een week, en hoe vaak klikt iemand op een winkel waar de stick volgens de winkelpagina toch niet (meer) leverbaar blijkt? Pas als dat vaak gebeurt, is B de moeite (en het besluit over prijzen zonder PR) waard.

## 5. Gefaseerde aanpak

| Fase | Wat | Winkels | Voorwaarde |
|---|---|---|---|
| 0 | Overlapmeting: hoeveel van de gecontroleerde sticks zijn bij 2+ winkels te koop, en hoeveel scheelt de prijs? | bol.com, PassaHockey, Plutosport | Feeds van de drie actieve programma's |
| 1 | Blok "Waar te koop" op de stickpagina en onder elke stick in het stickwijzer-advies, voor de 20–30 meest geadviseerde sticks (optie A) | idem | Overlap ≥ 20% en merkbare prijsverschillen (`business-model.md` §5a) |
| 2 | Daisycon toevoegen (Jumbo Sport, DAKA), HockeyCity zodra goedgekeurd (heeft het een feed?) | + 3 | Goedkeuring; besluit per winkel |
| 3 | Decathlon via Odyssey; alle gecontroleerde sticks; eventueel optie B | + 1 | Odyssey goedgekeurd en EU-check (§5a) |

## 6. Meten

- **Nieuwe events:** `offer_block_view` (blok in beeld) en `retailer_click` uitgebreid met `position` (plek in de lijst) en `offer_count` (aantal winkels). Bestaande `retailer_click` blijft de basis.
- **Succes na 4–6 weken:** winkelkliks per bezoeker op stickpagina's met het blok vs zonder; aandeel kliks op een andere winkel dan bol.com; commissie per 1.000 bezoekers (salesrapport).
- **Signaal om te stoppen of bij te sturen:** veel kliks op winkels die de stick niet (meer) leveren, of klachten over prijzen die niet kloppen.

## 7. Open punten

1. **Verzendkosten:** niet elke feed geeft ze. Voorstel: vast bedrag per winkel uit de openbare verzendvoorwaarden, met bron en datum, tot de feed het levert.
2. **HockeyCity:** cookieduur in het dashboard nog onbekend; heeft het programma een productfeed?
3. **Odyssey Partnerships (Decathlon):** waar zit het bedrijf en waar staan de gegevens (EU-afspraak)?
4. **Privacy- en cookietekst:** nieuwe trackingdomeinen (Awin, Daisycon) kunnen een aanpassing vragen. Alleen op expliciete opdracht van de eigenaar.
5. **Prijsweergave in structured data:** `Offer`/`AggregateOffer` mag alleen als de prijs zichtbaar en actueel is. Pas toevoegen in fase 1 na controle van regel 5.
