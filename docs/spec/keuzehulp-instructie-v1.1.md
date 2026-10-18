# Complete implementatie-instructie — Hockeystick-keuzehulp voor jouwhockeystick.nl

> **Doelgroep:** Claude Code / ontwikkelteam  
> **Documentstatus:** integrale implementatiespecificatie v1.1  
> **Taal interface:** Nederlands  
> **Doel:** bouw een uitlegbare en commercieel eerlijke keuzehulp voor veldhockeysticks, met een korte route voor beginnende kinderen en een verdiepende route voor gevorderde spelers.  
> **Principe:** advies is onderbouwd met productdata, eigen metingen, praktijktests en bronnen; verkoopmarge mag nooit de adviesvolgorde bepalen.

---

## 1. Productvisie en uitgangspunten

De keuzehulp helpt spelers, ouders en coaches niet om “de duurste” of “de populairste” stick te vinden, maar om een stick te kiezen die past bij maat, ontwikkelfase, gewenste acties, voorkeur voor stickgevoel, beschikbaarheid en budget.

### 1.1 Drie adviesroutes

1. **START** — beginnende kinderen en nieuwe hockeyers. Kort, rustig en oudervriendelijk; maximaal drie betaalbare startmodellen.
2. **ONTWIKKEL** — jeugdspelers die de basis kennen en spelvoorkeuren ontdekken. Advies over controle, allround spel, eerste 3D en gerichte ontwikkeling.
3. **PRESTATIE** — gevorderde jeugd en senioren. Gedetailleerde match op acties, techniek, bow-profiel, directheid, demping en budget.

### 1.2 Niet-onderhandelbare ontwerpregels

- Geef geen garantie op betere prestaties, selectie, doelpunten of blessurepreventie.
- Gebruik positie alleen als ondersteunende factor; speelstijl en technische acties zijn belangrijker.
- Bij beginnende kinderen zijn juiste maat, hanteerbaarheid, controle en plezier belangrijker dan hoog carbon, een extreme bow of merkstatus.
- Adviseer een extreme low bow of dragflick-specialist nooit als eerste stick of standaardadvies voor beginners.
- Adviseer geen 85–100% carbon als standaard voor een beginnende jeugdspeler.
- Toon maximaal drie aanbevelingen: `beste match`, `veilige keuze` en — alleen indien verantwoord — `ambitieuze keuze`.
- Benoem bij elk product: waarom passend, voor wie minder passend en welke afweging de speler maakt.
- Houd fabrikantgegevens, eigen metingen, praktijktest en redactioneel oordeel technisch en visueel gescheiden.
- Werk altijd met exact merk, model, modeljaar/seizoen en sticklengte. Meng nooit gegevens van verschillende generaties zonder expliciete duiding.
- Toon advies als hulpmiddel; maat, techniek, gevoel en een test in de hand blijven relevant.
- Productmarge, affiliatevergoeding of sponsoring mag geen scorefactor in de klantmatch zijn.

### 1.3 UX-principes

- Eén vraag per scherm op mobiel.
- Toon voortgang, bijvoorbeeld `Stap 3 van 8`.
- Gebruik begrijpelijke taal; leg jargon uit via tooltips of uitklapbare uitleg.
- Laat gebruikers teruggaan en antwoorden aanpassen; bereken direct opnieuw.
- Sla voortgang tijdelijk op in `sessionStorage`.
- Vraag geen account vóór advies. Naam en e-mail zijn pas na de uitslag optioneel.
- Zorg voor labels, toetsenbordnavigatie, contrast en heldere foutmeldingen.

---

## 2. Beslisarchitectuur

### 2.1 Routebepaling

Gebruik de volgende logica als startpunt, maar laat de gebruiker zijn/haar route altijd bevestigen of wijzigen.

```text
IF leeftijd <= 11 EN hockeyervaring < 1 volledig seizoen:
    route = START
ELSE IF hockeyervaring < 2 seizoenen OF speler geeft aan de basis nog te leren:
    route = ONTWIKKEL
ELSE:
    route = PRESTATIE
```

Toon vervolgens:

```text
Welke situatie past het best?
- Ik ben net begonnen / koop mijn eerste stick
- Ik speel al een tijdje en wil mijn volgende stick kiezen
- Ik speel gevorderd en wil gericht vergelijken
```

### 2.2 Beslisvolgorde

1. Juiste sticksoort, beschikbare lengte en eventuele juniorgrip.
2. Ervaring en beheersing van eerste aanname/basisvaardigheden.
3. Budget en voorraadstatus.
4. Bow, carbon/stijfheid, balans, demping en kopvorm.
5. Gewenste acties, huidige stick en persoonlijke voorkeur.
6. Uitlegbare aanbeveling met bronnen en nuance.

Lengte en route zijn harde filters. Budget en voorraad zijn harde filters wanneer de gebruiker dit aangeeft. Bow, feel en materiaal zijn gewogen voorkeuren.

---

## 3. Vragenlijst per categorie

Elke vraag bevat technisch minimaal: `id`, `route`, `required`, `question`, `helpText`, `options` en `dataUse`.

### A. Start en route

| ID | Vraag | Antwoorden | Routes | Verplicht | Gebruik |
|---|---|---|---|---|---|
| `advice_goal` | Voor wie zoek je een stick? | mezelf; mijn kind; iemand anders | alle | ja | Past resultaattaal aan |
| `route_self_select` | Welke situatie past het best? | eerste stick; volgende stick; gevorderd vergelijken | alle | ja | Bepaalt/corrigeert route |
| `age_band` | In welke leeftijdsgroep valt de speler? | onder 8; 8–10; 11–12; 13–15; 16–18; 18+ | alle | ja | Jeugdcontext en taalniveau |
| `experience_seasons` | Hoe lang speelt de speler hockey? | proeflessen; <1 seizoen; 1 seizoen; 2–3 seizoenen; 4+ seizoenen | alle | ja | Ervaringsband en adviescomplexiteit |

Vraag geen geboortedatum; leeftijdsgroep is privacyvriendelijk en voldoende.

### B. Maat en fysieke fit

| ID | Vraag | Antwoorden | Routes | Verplicht | Gebruik |
|---|---|---|---|---|---|
| `height_cm` | Hoe lang is de speler met schoenen aan? | numeriek 95–210 cm | alle | ja | Primaire lengtebepaling |
| `height_uncertain` | Weet je de lengte niet precies? | ja; nee | alle | nee | Toon meetinstructie |
| `current_length_inch` | Welke sticklengte gebruikt de speler nu? | 24, 26–35, 36.5, onbekend | ONTWIKKEL/PRESTATIE | nee | Controle huidige maat |
| `junior_grip_needed` | Is een smallere juniorgrip wenselijk? | ja; nee; onbekend | START/ONTWIKKEL | nee | Filter juniorvarianten |

Gebruik onderstaande maatguide als indicatieve mapping. Toon bij grensgevallen een bereik en geen schijnprecisie.

```ts
const lengthGuide = [
  { minCm: 95, maxCm: 107, sizes: [22, 24] },
  { minCm: 108, maxCm: 115, sizes: [24, 26] },
  { minCm: 116, maxCm: 122, sizes: [27, 28] },
  { minCm: 123, maxCm: 127, sizes: [29] },
  { minCm: 128, maxCm: 132, sizes: [30] },
  { minCm: 133, maxCm: 137, sizes: [31] },
  { minCm: 138, maxCm: 142, sizes: [32] },
  { minCm: 143, maxCm: 147, sizes: [33] },
  { minCm: 148, maxCm: 154, sizes: [34] },
  { minCm: 155, maxCm: 162, sizes: [35] },
  { minCm: 163, maxCm: 210, sizes: [36.5] }
];
```

Toon altijd: “Koop niet extra groot ‘op de groei’; een te lange stick kan balcontrole en houding bemoeilijken.”

### C. Ervaring en technische basis

| ID | Vraag | Antwoorden | Routes | Verplicht | Gebruik |
|---|---|---|---|---|---|
| `first_touch_confidence` | Hoe gaat het aannemen van een harde bal? | ik leer dit nog; meestal goed; onder druk goed; heel zeker | ONTWIKKEL/PRESTATIE | ja | Stuurt maximale stijfheid |
| `core_skills_stage` | Wat past het best bij de basis? | oefenen aannemen/passen/dribbelen; basis meestal goed; acties verfijnen | START/ONTWIKKEL | ja | Vereenvoudigt profiel |
| `playing_level` | Op welk niveau speelt de speler? | training/proef; jeugd/recreatief; breedte; selectie; senior recreatief; senior competitief; top | ONTWIKKEL/PRESTATIE | nee | Secundaire context |
| `training_frequency` | Hoe vaak hockeyt de speler per week? | 1; 2; 3; 4+ | ONTWIKKEL/PRESTATIE | nee | Ontwikkel- en duurzaamheidcontext |

### D. Speelstijl en ontwikkeldoelen

Laat maximaal twee hoofddoelen kiezen.

| ID | Vraag | Antwoorden | Routes | Verplicht | Gebruik |
|---|---|---|---|---|---|
| `primary_goals` | Wat wil de speler vooral leren of verbeteren? | aannemen/controleren; passen/flats; harde slag; dribbelen/3D; backhand; aerials; dragflick; allround | alle | ja | Hoofdmotor score |
| `fun_style` | Waar heeft de speler het meeste plezier in? | opbouwen/passen; overal meedoen; dribbels/acties; afronden; verdedigen/onderscheppen | START/ONTWIKKEL | ja | Kindvriendelijke speelstijlproxy |
| `positions` | Waar speelt de speler meestal? | verdediging; middenveld; aanval; wisselend/nog onbekend | ONTWIKKEL/PRESTATIE | nee | Alleen verfijning |
| `match_actions_frequency` | Welke acties komen vaak voor? Kies max. 3 | harde flats; passes op tempo; slag; backhand; 3D; lift; aerial; dragflick | PRESTATIE | ja | Gedetailleerde profielmatch |

### E. Techniek per actie — alleen PRESTATIE

| ID | Vraag | Antwoorden | Verplicht | Gebruik |
|---|---|---|---|---|
| `skill_flat_pass` | Hoe zeker zijn flats en harde passes? | 1–5 | ja | Stabiliteit/directheid |
| `skill_hit` | Hoe zeker is de harde slag? | 1–5 | ja | Power/balans |
| `skill_dribble_3d` | Hoe zeker zijn dribbels, lifts en 3D? | 1–5 | ja | Bow/kopvorm |
| `skill_aerial` | Welke rol hebben aerials? | nooit; in ontwikkeling; regelmatig; belangrijk wapen | ja | Bow/stabiliteit |
| `skill_backhand` | Hoe belangrijk is backhand? | nauwelijks; soms; regelmatig; heel belangrijk | ja | Kopvorm/lage backhand-zone |
| `skill_dragflick` | Welke rol heeft dragflick? | geen; oefenen; soms nemen; vaste specialist | ja | Drempel voor specialistische sticks |

### F. Stickgevoel en materiaalvoorkeur

| ID | Vraag | Antwoorden | Routes | Verplicht | Gebruik |
|---|---|---|---|---|---|
| `feel_preference` | Welk gevoel zoekt de speler? | zacht/controlerend; in balans; direct/krachtig; onbekend | ONTWIKKEL/PRESTATIE | ja | Stijfheid/demping |
| `stick_weight_preference` | Welke handling voelt prettig? | zo licht mogelijk; in balans; steviger/stabieler; onbekend | PRESTATIE | nee | Gewicht/balans |
| `bow_experience` | Met welk profiel is ervaring? | standaard; pro/late; low; extreme low; onbekend | PRESTATIE | nee | Voorkomt radicale overstap |
| `vibration_sensitivity` | Stoort trilling bij aannemen of harde passes? | ja; soms; nee; onbekend | PRESTATIE | nee | Demping/comfort |

Tooltipt tekst:

```text
Zacht en controlegericht: vaak prettiger bij aannemen en voor verdere basisontwikkeling.
In balans: een combinatie van controle en directe passing.
Direct en krachtig: een stijver, sneller gevoel; vooral passend als de eerste aanname op tempo betrouwbaar is.
```

### G. Huidige stick en reden van vervanging

| ID | Vraag | Antwoorden | Routes | Verplicht | Gebruik |
|---|---|---|---|---|---|
| `has_current_stick` | Heeft de speler al een stick? | ja; nee | alle | ja | Toont vervolgvragen |
| `current_stick_brand_model` | Welke stick is dat? | vrije tekst + optionele autocomplete | ONTWIKKEL/PRESTATIE | nee | Referentie; nooit specs aannemen zonder bevestiging |
| `current_stick_like` | Wat bevalt? Kies max. 2 | controle; power; gewicht; dribbelen; uiterlijk; niets bijzonders | ONTWIKKEL/PRESTATIE | nee | Sterke punten behouden |
| `current_stick_problem` | Wat wil de speler anders? Kies max. 2 | te zwaar; te licht; te hard; te zacht; lastig aannemen; weinig power; lastig liften; te kort; te lang; beschadigd; uitgegroeid; onbekend | alle | nee | Veranderingsrichting |
| `replacement_reason` | Waarom zoek je nu? | eerste stick; uit maat; beschadigd; volgende stap; nieuw seizoen; anders | alle | ja | Resultaatcopy/analytics |

### H. Budget, voorraad en koopvoorkeur

| ID | Vraag | Antwoorden | Routes | Verplicht | Gebruik |
|---|---|---|---|---|---|
| `budget_band` | Wat is passend voor alleen de stick? | tot €75; €75–125; €125–175; €175–250; >€250; eerst vergelijken | alle | ja | Filter en uitleg |
| `purchase_timing` | Wanneer is de stick nodig? | deze week; binnen 2 weken; voor seizoen; oriënterend | alle | nee | Voorraad/CTA |
| `availability_preference` | Wat is belangrijker? | alleen direct leverbaar; beste match ook later; geen voorkeur | alle | nee | Filter/sortering |
| `need_accessories` | Zijn accessoires nodig? | grip; tape; bescherming; geen; onbekend | alle | nee | Relevante optionele bundel |

Accessoires zijn nooit verplicht voor een geldig advies en mogen niet vóór de adviesuitslag als upsell worden getoond.

### I. Context en uitzonderingen

| ID | Vraag | Antwoorden | Routes | Verplicht | Gebruik |
|---|---|---|---|---|---|
| `left_handed_requirement` | Is een linkshandige/omgekeerde stick nodig? | nee; ja; onbekend | alle | ja | Verwijs bij uitzondering naar persoonlijke hulp; toon geen fout product |
| `medical_or_adaptation` | Zijn er fysieke/praktische aandachtspunten? | optioneel vrij tekstveld, max. 500 tekens | alle | nee | Geen medische claims; handmatige opvolging |
| `sustainability_preference` | Is levensduur/materiaalimpact extra belangrijk? | ja; nee; geen voorkeur | alle | nee | Alleen bij aantoonbare productdata |
| `notes` | Is er iets dat we moeten weten? | optioneel, max. 500 tekens | alle | nee | Context; niet automatisch als feit interpreteren |

---

## 4. Starterroute voor kinderen

### 4.1 Maximale flow

Gebruik maximaal zes inhoudelijke schermen:

1. Voor wie / startsituatie
2. Leeftijdsgroep en ervaring
3. Lichaamslengte met schoenen aan
4. Eerste stick of vervanging
5. Wat vindt het kind leuk aan hockey?
6. Budget

### 4.2 Starterregels

```text
IF route == START:
  filter op: junior_eligible OR starter_eligible
  filter uit: extreme_lowbow, dragflick_specialist, elite_only
  prefer carbon <= 30% OR soft_control_rating >= 4
  prefer bow in [ultrabow, midbow, dynabow]
  vereis beschikbare aanbevolen lengte
  weeg prijs passend binnen budget hoog
  toon maximaal drie producten
```

### 4.3 Vaste resultaatopbouw START

```text
Titel: Een goede start begint met een stick die makkelijk hanteert.

Samenvatting:
Voor een beginnende speler zijn passende lengte, hanteerbaarheid en controle belangrijker dan maximale slagkracht of een specialistische kromming.

Keuze 1 — Beste start
[product]
Waarom: [maat + controle + prijs]
Goed voor: [basisvaardigheden]
Minder geschikt als: [speler aantoonbaar technisch verder is]

Keuze 2 — Allround volgende stap
[product]
Waarom: [allround profiel]

Keuze 3 — Iets ambitieuzer
[product]
Waarom: [bescheiden ontwikkelstap]
Let op: [niet noodzakelijk in de eerste maanden]

Vaste ondertekst:
Een stick maakt een speler niet automatisch beter. De juiste maat en een stick waarmee aannemen, passen en dribbelen prettig voelen, geven de beste basis om te leren.
```

---

## 5. Productdatamodel

Productdata is de bron van waarheid. De adviesengine mag nooit alleen op titels of vrije producttekst vertrouwen.

```ts
type BowPreference = 'ultrabow' | 'midbow' | 'dynabow' | 'probow' | 'lowbow' | 'extreme_lowbow';
type ExperienceBand = 'starter' | 'developing' | 'advanced';

type StickProduct = {
  id: string;
  brand: string;
  model: string;
  season: string;
  fullName: string;
  active: boolean;
  productUrl: string;
  imageUrls: string[];
  priceEur: number;
  salePriceEur?: number;
  stockByLength: Record<string, number>;
  availableLengthsInch: number[];

  audience: Array<'junior' | 'adult' | 'starter' | 'developing' | 'advanced'>;
  playerProfiles: Array<'control' | 'allround' | 'creative' | 'power' | 'dragflick'>;
  recommendedExperience: ExperienceBand[];

  manufacturerSpecs: {
    compositionText?: string;
    carbonPercent?: number;
    fiberglassPercent?: number;
    aramidPercent?: number;
    bowType: BowPreference;
    bowMm?: number;
    bowLocationMm?: number;
    headShape?: string;
    gripType?: string;
    manufacturerClaims: string[];
    sourceUrl: string;
    sourceCheckedAt: string;
  };

  ownMeasurements?: {
    measuredWeightGramsByLength?: Record<string, number>;
    balancePointMmFromToe?: Record<string, number>;
    measuredBowMm?: number;
    measuredBowLocationMm?: number;
    measurementDate: string;
    methodVersion: string;
    sampleCount: number;
  };

  editorialAssessment?: {
    firstTouch: 1 | 2 | 3 | 4 | 5;
    flatPass: 1 | 2 | 3 | 4 | 5;
    hitPower: 1 | 2 | 3 | 4 | 5;
    dribble3d: 1 | 2 | 3 | 4 | 5;
    aerial: 1 | 2 | 3 | 4 | 5;
    backhand: 1 | 2 | 3 | 4 | 5;
    vibrationDamping: 1 | 2 | 3 | 4 | 5;
    maneuverability: 1 | 2 | 3 | 4 | 5;
    stability: 1 | 2 | 3 | 4 | 5;
    testedBy: Array<{ role: string; level: string; testDate: string }>;
    testMethodVersion: string;
    limitations: string[];
  };

  adviceRules: {
    minExperienceBand: ExperienceBand;
    maxExperienceBand?: ExperienceBand;
    starterAllowed: boolean;
    juniorAllowed: boolean;
    suitableGoals: string[];
    unsuitableGoals?: string[];
    strengths: string[];
    tradeoffs: string[];
    doNotRecommendWhen: string[];
  };

  commerce: {
    marginBand?: 'low' | 'medium' | 'high';
    affiliate: boolean;
    sponsored: boolean;
  };
  updatedAt: string;
};
```

### Datakwaliteitsregels

- Vul fabrikantgegevens alleen vanuit officiële merk- of geverifieerde distributeurbron.
- Toon eigen metingen pas wanneer werkelijk gemeten volgens een versieerbaar protocol.
- Label eigen praktijktest altijd als redactionele, ervaringsgerichte beoordeling.
- Ontbrekende data is beter dan verzonnen data.
- Marge mag uitsluitend voor interne analyse bestaan en nooit in de adviesfunctie worden gebruikt.

---

## 6. Scoring en aanbevelingslogica

### 6.1 Harde uitsluitingen

Een product is niet adviseerbaar wanneer:

```text
- De geadviseerde sticklengte niet beschikbaar is.
- De prijs boven budget ligt, tenzij “eerst vergelijken” is gekozen.
- Het product niet direct beschikbaar is terwijl “alleen direct leverbaar” is gekozen.
- De stick niet past bij de ervaringsband.
- De route START is en de stick extreme low bow, dragflick-specialist of elite-only is.
- Eerste aanname <= 2 is en de stick direct/powergericht met circa 85% carbon of meer is.
- Dragflick geen rol speelt en de stick een uitgesproken dragflick-specialist is.
- Bow-profiel of beschikbare lengte ontbreekt in productdata.
```

### 6.2 Scorecomponenten

```ts
type ScoreBreakdown = {
  sizeFit: number;
  experienceFit: number;
  skillGoalFit: number;
  feelFit: number;
  bowFit: number;
  budgetFit: number;
  availabilityFit: number;
  total: number;
  explanationTags: string[];
};
```

| Onderdeel | START | ONTWIKKEL | PRESTATIE |
|---|---:|---:|---:|
| Maat / beschikbare lengte | 30 | 25 | 20 |
| Ervaring / controle | 25 | 20 | 15 |
| Doel / acties | 15 | 20 | 25 |
| Bow-profiel | 10 | 15 | 15 |
| Feel, gewicht, demping | 10 | 10 | 15 |
| Budget | 10 | 10 | 7 |

### 6.3 Resultaatrollen

1. **Beste match:** hoogste score, minimaal 70/100.
2. **Veilige keuze:** beste controle-/comfortalternatief zonder hogere complexiteit dan beste match.
3. **Ambitieuze keuze:** één verantwoorde ontwikkelstap vooruit; alleen als ervaring en techniek dat toelaten.

Toon geen derde product uitsluitend om drie resultaten te vullen.

### 6.4 Uitlegbare output

Iedere productkaart toont minimaal drie herleidbare redenen plus één aandachtspunt:

```text
Waarom deze stick past
- Beschikbaar in jouw maat.
- De controlegerichte opbouw past bij je doel om aannemen en passen te verbeteren.
- Het allround bow-profiel ondersteunt basistechniek en eerste 3D-acties.

Let op vóór je koopt
- Deze stick is minder gericht op maximale slagkracht dan een stijvere high-carbonstick.
```

---

## 7. Uitkomstschermen en copyregels

Iedere uitkomst bevat:

1. Titel afgestemd op route.
2. Samenvatting van maximaal 45 woorden.
3. Lengteadvies inclusief grensgeval-/onzekerheidsmelding.
4. Maximaal drie productkaarten.
5. Per kaart: prijs, beschikbare lengte, kernkenmerken, waarom passend, let op en CTA.
6. Uitklapbare sectie `Waarom dit advies?` met bronnen en methode.
7. Link naar productreview, testmethode en alternatieven.
8. Disclaimer dat het advies een hulpmiddel is.

Gebruik wel:

- “Een sterke match voor jouw antwoorden.”
- “Een logisch startpunt als…”
- “Ontworpen voor…”
- “Past doorgaans beter bij…”

Gebruik niet:

- “De beste stick voor jou, gegarandeerd.”
- “Deze stick maakt je beter.”
- “Deze stick voorkomt blessures.”
- “Professionele kwaliteit is altijd beter.”

---

## 8. Feitelijke onderbouwing

### 8.1 Redactionele kernregel

Een hoger carbonpercentage is geen universele kwaliteitsrangorde. Carbonpercentage, vezelopbouw, kern, balans, demping, kopvorm en productietolerantie bepalen samen hoe een stick aanvoelt. Vergelijk percentages daarom hooguit als globale indicatie en nooit als absolute prestatiemeter.

### 8.2 Wetenschappelijke nuance

Gebruik onderstaande strekking in de methodiek:

```text
Beschikbaar onderzoek wijst erop dat stijfheid, massa, effectieve massa en demping de balrespons en het waargenomen stickgevoel kunnen beïnvloeden. Dat bewijs zegt niet dat één commerciële stick voor elke speler het beste is. Daarom combineren wij technische data met ervaring, speeldoel en waar mogelijk praktijktests.
```

Gebruik wetenschap voor algemene principes, niet als bewijs voor een individuele commerciële winnaar.

---

## 9. Bronnen en citeerbare onderbouwing

### 9.1 Doel

Bronverwijzingen zijn verplicht bij inhoudelijke claims. Zij verhogen controleerbaarheid, bewaken de scheiding tussen feiten en marketing, en helpen zoekmachines en generatieve systemen de inhoud beter te begrijpen.

Plaats de bron direct naast de claim en voeg onderaan een volledig bronoverzicht toe.

### 9.2 Verplichte bronlabels

| Label | Gebruik voor | Verplicht tonen | Formulering |
|---|---|---|---|
| **Fabrikantgegevens** | Carbon, bow, materialen, maten, kopvorm, officiële productdoelstelling | uitgever, officiële link, controledatum | “Volgens de fabrikant…” |
| **Eigen meting** | Gewicht, balanspunt, werkelijke lengte/kromming van een sample | datum, maat, sample-aantal, protocolversie | “Wij maten bij één sample…” |
| **Praktijktest** | Gevoel, first touch, vibratie, handling, 3D/backhand/power | testdatum, testers, methode, context | “Onze testers ervoeren…” |
| **Onafhankelijke bron** | Onderzoek, bondsinformatie, algemene techniek en regels | auteur/organisatie, titel, jaar, bronlink | “Onderzoek suggereert…” |
| **Spelerquote** | Persoonlijke ervaring en voorkeur | naam, team/rol, bron, merkrelatie | “Volgens [naam]…” |
| **Redactionele adviesregel** | Vertaling van profiel naar advies | methodieklink en gebruikte profielantwoorden | “Wij adviseren dit omdat…” |

### 9.3 Bronregels

- Gebruik officiële merk- of distributeurbron voor specificaties; gebruik retailerbron alleen als geen primaire bron beschikbaar is.
- Presenteer fabrikantclaims nooit als onafhankelijk bewijs.
- Toon modeljaar/seizoen en `gecontroleerd op`-datum.
- Benoem bij één sample dat productievariatie mogelijk is.
- Presenteer praktijktests als ervaringsgegevens, niet als gegarandeerde effecten.
- Quotes zijn illustratief; toon altijd een eventuele ambassadeurs- of sponsorrelatie.
- Geef `niet gemeten`, `niet bevestigd` of `nog niet getest` weer als data ontbreekt.
- Controleer seizoen-/modeldata minimaal eens per 18 maanden en bij collectie-update.

### 9.4 Bronhiërarchie

| Prioriteit | Brontype | Geschikt voor | Niet gebruiken als |
|---:|---|---|---|
| 1 | Eigen gestandaardiseerde metingen | Vergelijking van werkelijk geteste exemplaren | Universele claim op basis van één sample |
| 2 | Peer-reviewed onderzoek | Algemene biomechanica en materiaalprincipes | Bewijs voor één commercieel model |
| 3 | Officiële merk-/distributeurbron | Specificaties en productdoel | Onafhankelijk prestatierendement |
| 4 | Bond of spelregels | Regels en vereisten | Subjectief productadvies |
| 5 | Spelerquote / coachinterview | Ervaring en context | Objectieve rangorde |
| 6 | Retailer-/expertgids | Praktische context | Primaire productspecificatie |
| 7 | Forum/social | Signalen voor FAQ’s | Feitelijke onderbouwing |

### 9.5 Bronnen op de adviesuitkomst

```text
Waarom deze stick bij jouw profiel past

1. Beschikbaar in maat 33 inch
   Fabrikantgegevens / actuele voorraad — gecontroleerd op [datum]

2. Controlegerichte opbouw
   Fabrikantgegevens — [merk], gecontroleerd op [datum]

3. Geschikt als allround ontwikkelstap
   Redactionele adviesregel — gebaseerd op ervaring, eerste aanname en doel

4. Praktijktest
   Alleen wanneer beschikbaar: [aantal] testers ervoeren [samenvatting].
   Dit is een ervaringsbeoordeling, geen gegarandeerd effect.
```

Implementeer de component:

```text
[Waarom dit advies?]
[Bronnen en methode ▾]
```

### 9.6 Datamodel voor bronnen en claims

```ts
type SourceType =
  | 'manufacturer'
  | 'official_distributor'
  | 'independent_research'
  | 'academic_thesis'
  | 'governing_body'
  | 'own_measurement'
  | 'field_test'
  | 'player_quote'
  | 'coach_interview'
  | 'retailer_guide'
  | 'editorial_analysis';

type EvidenceStrength =
  | 'primary'
  | 'independent'
  | 'first_hand'
  | 'manufacturer_claim'
  | 'expert_opinion'
  | 'context_only';

type SourceRecord = {
  id: string;
  sourceType: SourceType;
  evidenceStrength: EvidenceStrength;
  title: string;
  publisher: string;
  author?: string;
  publishedAt?: string;
  checkedAt: string;
  url?: string;
  doi?: string;
  claimSummary: string;
  limitations?: string[];
  relatedProductIds?: string[];
  relatedQuestionIds?: string[];
  relatedClaimIds?: string[];
  disclosure?: {
    sponsored?: boolean;
    brandAmbassador?: boolean;
    affiliateRelationship?: boolean;
    conflictOfInterestText?: string;
  };
  ownTestMetadata?: {
    testProtocolVersion: string;
    testDate: string;
    sampleCount: number;
    sampleDescription: string;
    testerCount?: number;
    testerProfiles?: Array<{
      role: 'player' | 'coach' | 'parent' | 'reviewer';
      level?: string;
      ageBand?: string;
    }>;
    testConditions?: {
      fieldType?: string;
      weather?: string;
      ballType?: string;
      notes?: string;
    };
  };
  quoteMetadata?: {
    speaker: string;
    speakerRole?: string;
    teamOrClub?: string;
    quoteText: string;
    quoteContext?: string;
    brandRelationship?: 'none_known' | 'ambassador' | 'sponsored' | 'employee' | 'unknown';
  };
};

type ClaimType =
  | 'product_specification'
  | 'manufacturer_claim'
  | 'own_measurement'
  | 'field_test_observation'
  | 'general_technical_explanation'
  | 'scientific_interpretation'
  | 'player_experience'
  | 'editorial_advice_rule';

type ContentClaim = {
  id: string;
  claimType: ClaimType;
  text: string;
  shortText?: string;
  appliesTo: {
    productIds?: string[];
    productAttributes?: string[];
    adviceRoutes?: Array<'START' | 'ONTWIKKEL' | 'PRESTATIE'>;
    pageTypes?: Array<'product' | 'comparison' | 'guide' | 'advice_result'>;
  };
  sourceIds: string[];
  confidence: 'high' | 'moderate' | 'limited';
  displayedLabel:
    | 'Fabrikantgegevens'
    | 'Eigen meting'
    | 'Praktijktest'
    | 'Onafhankelijke bron'
    | 'Spelerquote'
    | 'Redactionele adviesregel';
  lastReviewedAt: string;
  reviewerId: string;
};
```

### 9.7 Validatieregels

```text
- Een product-specificatieclaim heeft minimaal een manufacturer,
  official_distributor of own_measurement bron.
- Een algemene wetenschappelijke claim heeft minimaal independent_research
  of academic_thesis als bron.
- Een quoteclaim bevat quoteMetadata en zichtbare disclosure over merkrelatie.
- “Eigen meting” bevat protocolversie, datum en sample-aantal.
- “Praktijktest” bevat datum, aantal testers, methode en testcontext.
- Seizoensgebonden bron ouder dan 18 maanden: markeren voor hercontrole.
- Niet-geverifieerde claim: nooit gebruiken als automatische adviesreden.
- Fabrikantclaim niet vertalen naar “bewezen beter”, “objectief beter” of
  “gegarandeerd”.
- Structured data bevat uitsluitend zichtbare, controleerbare pagina-inhoud.
```

### 9.8 Structured data

Gebruik alleen structured data die overeenkomt met zichtbare content:

- `Product`, `Offer`, `Brand`
- `Review` voor echte zichtbare redactionele reviews
- `positiveNotes` en `negativeNotes` bij zichtbare voor-/nadelen
- `AggregateRating` alleen bij echte zichtbare en controleerbare klantreviews
- `FAQPage` alleen bij zichtbare echte FAQ’s
- `BreadcrumbList`, `Organization`, `Person` waar relevant

Niet doen: reviewsterren of gemiddelden verzinnen, verborgen FAQ’s markeren, bronnen/quotes in schema opnemen die niet op de pagina staan, of schema gebruiken om onzeker marketingmateriaal sterker te laten lijken.

### 9.9 Citeerbare GEO-paginaopbouw

Gebruik bij productreview, vergelijking en kennisartikel deze volgorde:

```text
1. Direct antwoord op de hoofdvraag (40–80 woorden).
2. Voor wie relevant / voor wie niet.
3. Feiten en specificaties met bronlabels.
4. Eigen metingen en/of praktijktest met methode en beperkingen.
5. Belangrijkste afwegingen.
6. Concrete, genuanceerde adviesconclusie.
7. Bronnen en methodiek.
8. Auteur, testdatum en laatste update.
```

Publiceer geen massa’s vrijwel identieke AI-productpagina’s. Originele testdata, methode, auteursinformatie, actualiteit en bronkoppelingen wegen zwaarder dan volume.

---

## 10. Privacy en analytics

### Dataminimalisatie

- Geen geboortedatum; gebruik leeftijdsgroep.
- Geen naam, e-mail, telefoonnummer of club nodig voor advies.
- Vrije tekstvelden zijn optioneel en maximaal 500 tekens.
- Gebruik een willekeurige `advice_session_id`.
- E-mailadvies is opt-in; marketingtoestemming staat los van e-mailverzending.

### Analytics-events

```ts
type AdviceAnalyticsEvent = {
  event:
    | 'advice_started'
    | 'route_selected'
    | 'question_answered'
    | 'advice_completed'
    | 'advice_product_viewed'
    | 'advice_product_added_to_cart'
    | 'advice_product_purchased'
    | 'advice_feedback_submitted';
  adviceSessionId: string;
  route?: 'START' | 'ONTWIKKEL' | 'PRESTATIE';
  questionId?: string;
  answerKey?: string;
  productId?: string;
  timestamp: string;
};
```

Meet voltooiing, uitval per vraag, gekozen doelen/budgetten, advies-naar-aankoop, retouren en opt-in tevredenheid na 3–5 trainingen. Optimaliseer niet uitsluitend op conversie: een hoge verkoopscore is geen bewijs dat een advies beter is.

---

## 11. Publicatieblokkades

Er is geen aparte beheeromgeving; productdata wordt in de catalogusbestanden beheerd.

Blokkeer adviespublicatie bij ontbrekende lengtevoorraad, ontbrekende bron voor kernspecificatie, onlogische startermarkering bij extreme low bow/high carbon, volledig uitverkochte producten of onbekend modeljaar.

---

## 12. Acceptatiecriteria

### Scenario 1 — Eerste stick kind

```text
Leeftijd: 8–10
Ervaring: nog geen volledig seizoen
Lengte: 132 cm
Plezier: overal meedoen
Budget: €75–125
```

Verwachting: route START; advies rond 30 inch; uitsluitend junior/startersticks; geen extreme low bow/high-carbontopstick; maximaal drie heldere opties.

### Scenario 2 — Jeugd in ontwikkeling

```text
Leeftijd: 13–15
Ervaring: 2 seizoenen
Lengte: 154 cm
Basis: meestal goed
Doel: passen/flats + dribbelen/3D
Gevoel: in balans
Budget: €125–175
```

Verwachting: route ONTWIKKEL; lengteadvies rond 34 inch; voorkeur voor controle/allround Dynabow of Probow, afhankelijk catalogus; duidelijke afweging tussen controle en 3D.

### Scenario 3 — Gevorderde aanvaller zonder dragflickrol

```text
Leeftijd: 16–18
Ervaring: 5 seizoenen
Lengte: 174 cm
Eerste aanname: onder druk goed
Doel: 3D + backhand
Gevoel: direct/krachtig
Dragflick: geen
Budget: €175–250
```

Verwachting: PRESTATIE; 36.5 inch; Probow/Lowbow mogelijk; dragflick-specialist/extreme low bow niet als primaire match; expliciete trade-off voor first touch.

### Scenario 4 — Ambitieuze beginner met hoog budget

```text
Leeftijd: 11–12
Ervaring: 1 seizoen
Eerste aanname: leren
Doel: harde slag
Budget: >€250
```

Verwachting: geen 95–100% carbon als beste advies vanwege budget/ambitie; een controlegerichte allroundstick is logischer; slechts beperkte ambitieuze stap met duidelijke waarschuwing.

### Scenario 5 — Geen passende voorraad

```text
Route: START
Benodigde lengte: 31 inch
Alle geschikte 31-inch modellen uitverkocht
Voorkeur: alleen direct leverbaar
```

Verwachting: geen verkeerde maat als beste match; transparante melding; optie voor voorraadmelding, persoonlijk advies of uitsluitend verantwoord alternatief.

---

## 13. Technische bouwsuggestie

### Front-end

- Mobiele multi-step wizard met client- én servervalidatie.
- Toegankelijke radio buttons, checkboxlimieten en numerieke lengte-invoer.
- Geen gevoelige gegevens in URL-parameters.
- Resultaten uit een versieerbare catalogus/API.
- Toon `adviceVersion`, bijvoorbeeld `Keuzehulp v1.1`.

### Back-end

- Server-side validatie van alle antwoorden.
- Pure, testbare scorefunctie met versie `advice_rules_version`.
- Log bij iedere uitslag de productcatalogusversie zodat advies later uitlegbaar blijft.
- Geen verborgen commerciële rankingfactoren.

### Aanbevolen endpoints

```text
POST /api/advice/start
POST /api/advice/answer
POST /api/advice/calculate
GET  /api/products/:id
POST /api/advice/feedback
POST /api/advice/email-result
GET  /api/sources/:id
```

### Response van adviesberekening

```ts
type AdviceResponse = {
  adviceSessionId: string;
  adviceVersion: string;
  route: 'START' | 'ONTWIKKEL' | 'PRESTATIE';
  sizeAdvice: {
    primaryInch: number;
    alternativeInch?: number;
    explanation: string;
    confidence: 'high' | 'medium' | 'low';
  };
  results: Array<{
    role: 'best_match' | 'safe_choice' | 'ambitious_choice';
    productId: string;
    score: number;
    reasons: string[];
    cautions: string[];
    sourceLabels: Array<'manufacturer' | 'own_measurement' | 'field_test' | 'independent_source' | 'editorial_rule'>;
  }>;
  noMatchMessage?: string;
  methodUrl: string;
};
```

---

## 14. Methodiekpagina

Plaats deze inhoud of een inhoudelijk gelijkwaardige versie publiek op de site:

```text
Hoe komt ons stickadvies tot stand?

Wij kijken eerst naar wat niet onderhandelbaar is: de juiste sticklengte, de ervaring van de speler, beschikbaarheid in die maat en het budget. Daarna vergelijken we de speelwensen, zoals aannemen, passen, dribbelen, 3D, backhand of dragflick.

Voor beginnende hockeyers adviseren we bewust eenvoudiger. Dan staan maat, hanteerbaarheid, controle en plezier voorop. Een heel stijve of extreem gekromde stick is niet automatisch beter om hockey te leren.

Voor ervaren spelers wegen we meer kenmerken mee, zoals gewenste acties, voorkeur voor een zachter of directer stickgevoel en ervaring met verschillende bow-profielen.

Wij vertellen niet alleen wát wij adviseren, maar ook waarop dat advies is gebaseerd. Per stick maken we onderscheid tussen gegevens van de fabrikant, onze eigen metingen, praktijktests en onafhankelijke bronnen. Zo zie je wat vaststaat, wat wij zelf hebben gemeten en waar ervaring of persoonlijke voorkeur meespeelt.

Een stickadvies blijft een hulpmiddel: de juiste maat, techniek, speelstijl en het gevoel in de hand bepalen samen wat voor jou de beste keuze is.
```

---

## 15. Implementatievolgorde

1. Productcatalogus en datamodel, inclusief seizoen, lengtevoorraad en bronvelden.
2. START-route met harde veiligheids- en productfilters.
3. Lengtecalculator met grensgevallen en uitleg.
4. Uitkomstscherm met beste match, veilige keuze en optionele ambitieuze keuze.
5. ONTWIKKEL-route.
6. PRESTATIE-route en gedetailleerde skillvragen.
7. Bronnen-/claimsdatamodel, broncomponenten en publicatievalidatie.
8. Privacyvriendelijke analytics en feedbackloop.
9. Uitbreiding naar meerdere merken pas na betrouwbare productdata en waar mogelijk eigen testdata.

**Lanceer smal:** begin met 10–20 zorgvuldig beheerde modellen. Een kleine, actuele en uitlegbare catalogus is waardevoller dan honderden modellen met incomplete of gekopieerde data.
