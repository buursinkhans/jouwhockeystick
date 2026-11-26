# SEO-seizoen uit Google Trends (handboek)

Doel: het seizoen meewegen in het maandelijkse SEO-kansenrapport (`docs/seo-market-intelligence-plan.md`, Fase 2). Vertoningen in Search Console stijgen en dalen met het seizoen. Zonder seizoen lijkt een gewone daling in december een verlies aan positie. Google Trends laat zien wat het seizoen alleen al zou veranderen.

**Een Trends-cijfer is een relatieve index (0 tot 100), geen aantal zoekopdrachten.** Het is afgerond op hele getallen, en 0 betekent "te weinig om te tonen", niet "niemand zoekt". Een Trends-index staat nergens als volume in het rapport.

## De ankerterm (besluit eigenaar, 2026-11-25)

- **Anker: `hockeystick`.** Het is de enige term die nooit op 0 staat en niet grof afgerond wordt (in de eerste export: laagste maand 26, hoogste 100 over 61 maanden). Hij geeft het patroon van het jaar.
- **Kleine termen** zijn ongeveer 5 procent van `hockeystick` of minder. Naast het anker komen ze op 0 tot 8 uit, en bij een waarde van 2 of 3 kan één afrondingsstap al 17 tot 25 procent schelen. Daarom staan ze in een **eigen export per thema, zonder `hockeystick`**. De grootste term van zo'n export staat dan op 100. Daaruit lezen we alleen het **jaarpatroon**: in welke maanden de zoekactiviteit stijgt en daalt.
- **Thema's onderling vergelijken we niet op grootte.** Dat kan niet. Voor grootte gebruiken we Search Console (echte vertoningen).

## Een export maken

Instellingen voor elke export: **Nederland**, **laatste 5 jaar**, **Google Zoeken** (web), **alle categorieën**. Download het bestand met het pijltje rechtsboven bij de grafiek "Interesse in de loop van de tijd" (niet bij "Toenemende zoekopdrachten"). Je mag meer dan vijf termen invoeren.

| Thema | Termen |
|---|---|
| `referentie` | hockeystick, plus naar keuze enkele kleine termen ter vergelijking |
| `maat` | hockeystick maat, hockeystick lengte, welke maat hockeystick, hockeystick kind, hockeystick junior, hockeystick beginner |
| `merken` | adidas hockeystick, osaka hockeystick, brabo hockeystick, grays hockeystick, indian maharadja, princess hockeystick, jdh hockeystick, nike hockeystick |
| `zaal` | zaalhockeystick, hockeystick zaal, indoor hockeystick, zaalhockey |
| `kopen` | hockeystick kopen, hockeystick sale, beste hockeystick, hockeystick aanbieding |

Let op de spelling: het merk is **Grays**, niet Greys. Een term die overal op 0 staat, wordt bij de import weggelaten en gemeld.

Per kwartaal een nieuwe set: ongeveer 6 tot 10 exports, rond 30 minuten.

## Importeren

Plak de inhoud van het CSV-bestand in een sessie met Claude, of geef het bestand. Claude draait:

```
npm run trends:import -- <bestand.csv> --thema <thema> [--proef]
```

- `--proef` controleert alleen en schrijft niets.
- De regio en de exportdatum komen uit de bestandsnaam die Google geeft (`time_series_NL_..._20261125-2141.csv`). Zijn ze niet te lezen, dan kan dat met `--regio` en `--geexporteerd`.

**Wat de import controleert**
- Is het een CSV met datums en getallen? Een webpagina, een leeg bestand, een onbekend datumformaat, ontbrekende waarden of datums door elkaar worden geweigerd, met de reden.
- Minstens 8 datapunten. Een jaarpatroon vraagt minstens twee volledige kalenderjaren; de maand die nog loopt telt nooit mee.
- Termen die overal 0 zijn, worden weggelaten en gemeld.
- Een thema-export mag het anker niet bevatten; een referentie-export moet het bevatten.
- **Dubbel:** dezelfde vergelijking (thema, termen, periode en instellingen) met dezelfde of een oudere exportdatum wordt niet nog eens geïmporteerd. Een nieuwere export van dezelfde vergelijking vervangt de oude.
- Na een import maakt het script de seizoensagenda (`docs/marketing/seizoensagenda.md`) opnieuw. Dat kan ook met `npm run trends:agenda`. Het bestand wordt nooit met de hand aangepast; een test faalt als het niet klopt met de gegevens.
- De instellingen worden vastgelegd: thema, rol, regio, zoektype, categorie, periode, granulariteit en exportdatum.

De gegevens staan in `data/trends/` (één JSON-bestand per export) en worden meegecommit. Het is een openbare, geaggregeerde index, geen Search Console- of PostHog-gegevens.

## Wat het rapport ermee doet

- **Verwacht seizoenseffect:** het gemiddelde jaarpatroon van `hockeystick` voor de laatste 28 dagen gedeeld door dat van de 28 daarvoor. Dat is een verwachting uit eerdere jaren, zonder de groei van de site of van de markt.
- **Werkelijk en zonder seizoen:** de echte verandering in niet-merkvertoningen, en die gedeeld door de verwachte verandering. Dit is een richting. De positie blijft de hoofdmaat.
- **Volgende golf:** de eerstvolgende maand waarin een gemiddeld jaar minstens 15 indexpunten stijgt, met een voorbereidingsvenster van 8 tot 4 weken eerder. **Dat venster is een hypothese**; na een jaar eigen data toetsen we of eerder beginnen loont.
- **Thema's, per term:** de piekmaanden (maanden die minstens 10 procent boven het jaargemiddelde liggen, hooguit vier) en de betrouwbaarheid. Een thema wordt nooit opgeteld, omdat de som bij zaal het speelseizoen met het koopseizoen zou mengen.
  - **Gelijkenis tussen jaren:** de gemiddelde correlatie van de twaalf maanden van de volledige jaren. Een echt seizoen herhaalt zich (0,6 of hoger; in de eerste exports 0,65 tot 0,99), losse pieken niet (rond 0).
  - `goed`: gelijkenis minstens 0,6, gemiddelde index minstens 20 en hooguit 10 procent nullen. Te lezen per maand.
  - `richting`: gelijkenis minstens 0,6 en een waarde in minstens 8 maanden, maar klein of met stille maanden. Alleen te lezen als patroon over het jaar.
  - `te klein`: het patroon herhaalt zich niet of er is te weinig. Zo'n term krijgt geen piekmaanden en telt niet mee.
- **Seizoensagenda:** een gewone tekstpagina uit dezelfde gegevens, zonder cijfers van de site: de golven van het jaar, de piekmaanden per thema en het voorbereidingsvenster. De Orchestrator leest die in plaats van een losse zin over het seizoen.
- **Verouderd:** een export van meer dan 100 dagen oud wordt als verouderd gemeld. Maak dan een nieuwe.

## Beperkingen

- Een patroon uit 4 jaar mist ontwikkelingen die nieuw zijn (een merk dat opkomt, een weekend met slecht weer).
- De maand van de export loopt nog en telt niet mee. De waarde 100 van een lopende maand kan scheef zijn.
- `hockeystick` omvat ook ijshockey en niet-koopintentie (bijvoorbeeld een Sinterklaasknutsel). Het patroon is dus een gemengd patroon.
- Er is geen Trends-API: die is een alpha voor een beperkt aantal testers (zie het plan, A.6). Er is bewust geen onofficiële koppeling.

## Beheer

De drempels staan bovenin `src/seo/trends.ts` (`RELIABLE_MEAN`, `RELIABLE_MAX_ZEROS`, `CONSISTENT`, `MIN_NONZERO_MONTHS`, `PEAK_INDEX`, `WAVE_STEP`, `PREPARE_WEEKS`, `STALE_DAYS`, `ANCHOR_TERM`), met tests in `src/seo/trends.test.ts`.
