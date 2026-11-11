# Meten: events, eigen verkeer en rapporten

Hoe de site meet, wat een shop-klik uit de stickwijzer vastlegt, hoe je je eigen bezoeken uitsluit en wat er nog ontbreekt in het verkooprapport. Besluit en reden: [decision-log.md](decision-log.md), 2026-11-11.

## Huidige situatie

| Onderdeel | Waar | Wat |
|---|---|---|
| PostHog (EU, cookieloos) | `src/instrumentation-client.ts`, `src/lib/analytics/posthog.ts` | Alleen op het productiedomein. Geen cookies, geen lokale opslag, geen opnames, geen persoonsprofielen. Via ons eigen domein (`/p8k`). |
| Simple Analytics | `src/app/layout.tsx` | Pagina's en dezelfde funnel-events. |
| Funnel-events | `src/lib/analytics/events.ts`, `track.ts` | `trackEvent` stuurt elk event naar beide diensten. Sessie-id en tijdstip blijven in de browser. |
| `retailer_click` | `src/components/ui/RetailerLink.tsx` | Eén event per klik op een winkelknop: winkel, merk, stick, plek op de site (`placement`), linktype en, in "Waar te koop", de plek van de winkel in de lijst (`position`). |
| Conversie-rapport | `conversion-report.yml`, `src/analytics-report/conversion.ts` | Maandag 05:53 UTC: de trechter, afhaken per vraag en kliks per winkel, plek, stick en pagina, uit PostHog. |
| Verkooprapport | `sales-report.yml`, `src/analytics-report/sales.ts` | Aantallen kliks en bestellingen per plek: bol.com en PassaHockey, en sinds 2026-11-03 HockeyCity. |

## Wat een klik uit de stickwijzer nu vastlegt (2026-11-11)

`retailer_click` krijgt, alleen binnen een stickadvies, vijf velden erbij. Buiten een advies (stickpagina, catalogus, vergelijken) ontbreken ze en blijft het event zoals het was.

| Veld | Waarde | Opmerking |
|---|---|---|
| `adviceRole` | `best_match`, `safe_choice`, `ambitious_choice`, `closest_option`, `other_size`, `other_brand`, `same_brand` | De sleutels van het systeem. `best_match` heet op de site "Onze keuze", op de route START "Beste start". |
| `adviceRank` | 1, 2, 3 | Plek van de stick in het advies zoals getoond. `position` blijft de plek van de winkel. |
| `adviceRoute` | `START`, `ONTWIKKEL`, `PRESTATIE` | De niveaucategorie van het advies. |
| `budgetBand` | `lt_75`, `75_125`, `125_175`, `175_250`, `gt_250`, `compare_first` | Het antwoord op de budgetvraag. |
| `replacementReason` | `first_stick`, `outgrown`, `damaged`, `next_step`, `new_season`, `other` | Alleen als de vraag is beantwoord. |

Dezelfde `route`, `budgetBand` en `replacementReason` staan ook op `quiz_complete` (stickwijzer), zodat je ze zonder koppeling kunt tellen. De stick zelf zit al in `productName` en `brand`.

Een gedeeld advies (`/stickwijzer/advies`) levert wel rol, plek en route, maar geen budget of reden: die antwoorden zijn niet van ons om te meten.

Voorbeeld van wat PostHog ontvangt:

```json
{
  "event": "retailer_click",
  "properties": {
    "retailer": "bolcom",
    "brand": "Merk",
    "productName": "Voorbeeldmodel",
    "placement": "stickwijzer",
    "linkType": "product",
    "position": 1,
    "offerCount": 3,
    "priceShown": true,
    "adviceRole": "best_match",
    "adviceRank": 1,
    "adviceRoute": "ONTWIKKEL",
    "budgetBand": "125_175",
    "replacementReason": "outgrown"
  }
}
```

Het conversie-rapport toont onder "Kliks naar de winkels" de tabel "Per plek in het stickadvies" (rol en plek), zodra een klik een rol heeft.

Niet toegevoegd: lengte, leeftijd, speelwensen en alles wat een vrije tekst of een persoon kan herkennen. Leeftijd en lengte zijn bewust niet nodig om te zien welke stick wordt aangeklikt.

## Eigen verkeer uitsluiten

Open de site eenmaal op elk eigen apparaat met `?intern=aan`, bijvoorbeeld `https://jouwhockeystick.nl/?intern=aan`. Vanaf dan stuurt die browser geen PostHog-metingen en geen funnel-events meer. `?intern=uit` zet het weer terug. Code: `src/lib/analytics/internal.ts`.

- **Hoe:** één sleutel (`jhs-intern`) in de lokale opslag van die browser. Bezoekers zonder de parameter worden niet geraakt; voor hen leest de site alleen die sleutel en doet niets.
- **Waarom niet op IP of via PostHog:** PostHog draait cookieloos en zonder bezoeker-id, dus er is niets om op te filteren, en een IP-filter vraagt een vast adres.
- **Wat het niet dekt:** de paginatelling van Simple Analytics (alleen de funnel-events van de site worden onderdrukt), en een nieuwe browser, een privévenster of gewist browsergeheugen. Open dan de link opnieuw.
- **Iedereen kan het zelf aanzetten.** Dat is geen risico: het sluit alleen de eigen bezoeken van die persoon uit.

### Gevolgen voor cookiebeleid, privacyverklaring en toestemming (niet aangepast)

- **Opslag in de browser:** de privacyverklaring zegt over PostHog "zonder lokale opslag in je browser". Dit is een aparte sleutel, die alleen ontstaat als iemand zelf `?intern=aan` opent. Een voorkeur om niet gemeten te worden wordt meestal gezien als functionele opslag waar geen toestemming voor nodig is, maar dat is een juridische afweging van de eigenaar.
- **Geen toestemmingsbanner nodig** voor gewone bezoekers: voor hen verandert niets.
- **Voorstel voor de privacyverklaring** (alleen na akkoord, niet doorgevoerd): "Wie niet gemeten wil worden, kan dat zelf aanzetten met de link jouwhockeystick.nl/?intern=aan; dat bewaart één instelling in je eigen browser."
- De nieuwe eventvelden (budgetband en reden voor een nieuwe stick) vallen onder wat de verklaring al noemt: "welke antwoorden vaak worden gekozen en op welke winkellinks wordt geklikt", anoniem en zonder koppeling aan een persoon.

## Verkooprapport: wat er is en wat ontbreekt

**Beschikbaar:** bol.com Affiliate Reporting API (kliks en bestellingen per sub-ID en naam) en het TradeTracker-referentierapport (PassaHockey en HockeyCity, per referentie). Het sub-ID en de referentie zijn de plek op de site (`placement`).

**Ontbreekt:**
1. **Plutosport (Awin) en Daka (Daisycon)** staan niet in het rapport, terwijl ze wel een knop hebben. Beide krijgen de plek mee (`clickref`, `ws`).
2. **De rol en plek in het advies** zitten niet in de tracking-links, alleen in het PostHog-event. Een bestelling is dus niet te koppelen aan "Onze keuze" of aan de tweede stick; alleen aan de plek "stickwijzer".
3. **Klik en bestelling zijn niet te koppelen op bezoekersniveau** (cookieloos, en de winkels rapporteren per dag of per sub-ID). Alleen verhoudingen in aantallen zijn mogelijk.

**Voorstel voor een vervolgstap** (niet gebouwd):
1. Plutosport en Daka aan het verkooprapport toevoegen: de Awin-transactie-API (`clickref`) en de Daisycon-statistieken-API (`ws`). Vraagt twee nieuwe GitHub-secrets en een akkoord van de eigenaar.
2. Eerst meten met PostHog (rol en plek per klik, nu aanwezig) en kijken of een verschil tussen rollen groot genoeg is om er tracking-links voor te wijzigen.
3. Pas daarna overwegen om de rol in het sub-ID of de referentie te zetten, bijvoorbeeld `stickwijzer-best_match`. Dat wijzigt de partnerlinks en de plaatsnamen in het verkooprapport (`PLACEMENT_LABELS`), en mag alleen met akkoord van de eigenaar.

## Risico's en afhankelijkheden

- Een nieuw veld op `retailer_click` verandert een bestaand event; alle velden zijn optioneel, en de bestaande rapporten lezen alleen de oude velden.
- Het rapport en de tabel "Per plek in het stickadvies" tonen pas iets na de eerste klikken na de livegang; oudere klikken hebben geen rol.
- `?intern=aan` werkt per browser en per apparaat. Zonder opnieuw te openen na het wissen van browserdata telt een bezoek weer mee.
