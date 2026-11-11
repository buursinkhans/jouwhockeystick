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

## Verkooprapport: wat het toont en wat nog ontbreekt

Het verkooprapport (`sales-report.yml`, maandag 05:41 UTC, issue met label `verkoop`) telt alleen aantallen, nooit bedragen: de repository is openbaar. Sinds 2026-11-11 staan er vijf winkels in.

| Winkel | Bron | Sleutel in de link | Kliks | Verkopen |
|---|---|---|---|---|
| bol.com | Affiliate Reporting API | `subid` (de plek) en `name` (de stick) | per plek en per stick | per plek en per stick |
| PassaHockey, HockeyCity | TradeTracker, referentierapport | referentie (de plek) | per plek | per plek |
| Plutosport | Awin, publisher-API | `clickref` (de plek) | alleen in totaal (rapport per adverteerder) | per plek (transacties) |
| Daka | Daisycon, statistieken per sub-ID | `ws` (de plek) | per plek | per plek |

- **Plutosport:** de verkopen komen uit `GET /publishers/{id}/transactions/` (zonder afgewezen en verwijderde transacties), de kliks uit `GET /publishers/{id}/reports/advertiser` (regio NL). Awin geeft geen kliks per `clickref`, dus per plek staat daar een streepje.
- **Daka:** `GET /publishers/{id}/statistics/subid`, gefilterd op programma 7290 en media 441384. Verkopen zijn open plus goedgekeurde transacties.
- **Elke bron valt apart uit.** Ontbreekt een sleutel, dan staat er "kon niet worden opgehaald" met de reden, nooit een nul.

**GitHub-secrets die het rapport leest** (de waarden komen nooit in code, logs of het issue):

| Secret | Voor | Status |
|---|---|---|
| `BOL_AFFILIATE_CLIENT_ID`, `BOL_AFFILIATE_CLIENT_SECRET` | bol.com | **Ontbreekt in de repo:** de lijst met secrets heeft `BOL_CLIENT_ID`, `BOL_CLIENT_SECRET` en `BOL_CLIENT_ID_RAPPORT`, maar niet deze namen. Daarom stond bol.com in het rapport van 9 november als "sleutels ontbreken". |
| `TRADETRACKER_CUSTOMER_ID`, `TRADETRACKER_PASSPHRASE` | PassaHockey, HockeyCity | Staat er |
| `AWIN_API_TOKEN` | Plutosport | Nieuw |
| `DAISYCON_CLIENT_ID`, `DAISYCON_REFRESH_TOKEN` (en `DAISYCON_CLIENT_SECRET` als de app er een heeft) | Daka | Nieuw |

**Hoe de eigenaar de nieuwe sleutels maakt**
- **Awin:** ui.awin.com/awin-api (of "API Credentials" in het gebruikersmenu), wachtwoord invullen, "Show my API token". Het token hoort bij de eigen gebruiker en vraagt beheerrechten op het uitgeversaccount. De documentatie noemt geen verlooptijd. Zet het als `AWIN_API_TOKEN`.
- **Daisycon:** de API gebruikt OAuth 2.1 met PKCE (autorisatiecode, geen vaste sleutel). Je maakt een app in Daisycon en doorloopt eenmalig de login om een refresh-token te krijgen. De uitleg staat in het artikel "API Authentication with OAuth" van de Daisycon-hulp (voor mij niet leesbaar). Zet `client_id` en refresh-token als secrets.

**Beperkingen en risico's (eerlijk)**
- **Daisycon-token:** de documentatie zegt niets leesbaars over het vervallen van een refresh-token. Geeft Daisycon bij elke vernieuwing een nieuw token, dan werkt het opgeslagen token na de eerste run mogelijk niet meer, en een workflow kan geen nieuw secret opslaan. Het rapport meldt dat zodra Daisycon een ander token teruggeeft. Dit is alleen met echte sleutels te testen.
- **Awin-velden:** de documentatie noemt `clickRef` en `clickRefs` als voorwaardelijke velden zonder de rest van het antwoord te beschrijven. De code leest beide vormen. Staan alle verkopen na de eerste run onder "Overig (andere of oude link)", dan heet het veld anders en pas ik de parser aan. Het token gaat in de `Authorization`-header; staat er toch HTTP 401, dan verwacht Awin het als queryparameter.
- **Cijfers uit de netwerken** komen per dag of per week en kunnen later nog veranderen (open naar goedgekeurd of afgewezen). Een week zegt weinig bij 1 of 2 verkopen per week: kijk naar een reeks weken.
- **Nog niet gebouwd:** Jumbo Sports (Daisycon, aangevraagd) staat niet in het rapport.

## Van klik naar omzet: voorstel voor latere analyse (niet gebouwd)

Het enige wat elke winkel en PostHog delen is de **plek** (`placement`): in het netwerk is dat het sub-ID, de `clickref` of de referentie, in PostHog is het `retailer_click.placement`. Daarom kan het rapport nu antwoorden op "welke plek levert verkopen". De vervolgvragen vragen meer dan dat:

1. **Welke retailers converteren het best?** Kan nu al, per winkel: verkopen gedeeld door kliks per week (bol.com, PassaHockey, HockeyCity en Daka; bij Plutosport met de totale kliks). Tel pas conclusies als er over enkele weken genoeg verkopen zijn, en vergelijk de kliks van het netwerk met `retailer_click` in PostHog: een verschil is meetverlies (adblockers).
2. **Welke content levert omzet?** Het netwerk kent de pagina niet. Voorstel in twee stappen:
   - Stap A, zonder wijziging aan links: in PostHog per bezoeker-dag het pad van pagina naar winkelklik tellen (zoals de bestaande trechter), dus kliks per instappagina. Gecombineerd met de conversie per winkel uit dit rapport geeft dat een **schatting** van verkopen per pagina, die we ook zo moeten noemen.
   - Stap B, met akkoord van de eigenaar: de pagina in het sub-ID meegeven, bijvoorbeeld `productpagina.<artikel>`. Dat wijzigt de partnerlinks en de plaatsnamen in het rapport (`PLACEMENT_LABELS`).
3. **Welke adviesroutes en welke stickadviezen presteren?** De route, de rol (`best_match`, `safe_choice`, ...) en de plek in het advies zitten sinds PR #218 in `retailer_click`, maar niet in de links. Twee winkels hebben daar al een kanaal voor zonder het hoofd-sub-ID te wijzigen: Awin `clickRef2` tot en met `clickRef6`, en Daisycon `subid_2` en `subid_3` (de statistieken-API kan erop filteren). Bij bol.com staat de stick al in `name`. TradeTracker heeft alleen de referentie.
   Voorstel: eerst de rol en plek in `clickRef2` en `subid_2` zetten voor Plutosport en Daka, en pas als dat werkt overwegen hetzelfde bij bol.com en TradeTracker te doen via het sub-ID zelf.
4. **Wat we niet kunnen:** een klik niet koppelen aan één bestelling per persoon (geen cookies, de netwerken geven aantallen per sub-ID) en geen bedragen in de openbare repo. Voor omzet per route is dus een privé-weergave nodig (bijvoorbeeld de eigen netwerk-dashboards), of een rapport dat alleen verhoudingen toont.

## Risico's en afhankelijkheden

- Een nieuw veld op `retailer_click` verandert een bestaand event; alle velden zijn optioneel, en de bestaande rapporten lezen alleen de oude velden.
- Het rapport en de tabel "Per plek in het stickadvies" tonen pas iets na de eerste klikken na de livegang; oudere klikken hebben geen rol.
- `?intern=aan` werkt per browser en per apparaat. Zonder opnieuw te openen na het wissen van browserdata telt een bezoek weer mee.
