# Contentlijn "Welke hockeystick kopen?"

Vastgelegd op 15 november 2026, op opdracht van de eigenaar (masterprompt "Structureel contentthema 'Welke hockeystick kopen?'"). De regels staan in [merkplatform.md](merkplatform.md), onder "Contentlijnen". De gegevens staan in `marketing/sites/jouwhockeystick.json` (`contentlijnen`), de keuze per plek in `src/marketing/contentlijn.ts`, en de stap van de planner in [social-planner.md](social-planner.md), STAP 2c2.

## Waarom

De zoekvraag "welke hockeystick kopen" stond bij de nulmeting op 10 vertoningen, 0 klikken en positie 54,5. De hubpagina is `/kennis/hoe-kies-je-de-juiste-hockeystick` (PR #246). Social helpt daar indirect bij: met relevante bezoekers, bekendheid en vertrouwen. Een betere positie schrijven we niet aan social toe.

## Hoe de lijn werkt

| Onderdeel | Keuze |
|---|---|
| Plek in het ritme | De post van dinsdag en de video van woensdag: 1 post en 1 video per week, binnen 2 posts en 2 video's (besluit eigenaar 2026-11-15). Er komen geen extra Metricool-posts bij. |
| Indeling | Een contentlijn boven de vier pijlers. Elk subthema hangt aan één pijler (besluit eigenaar 2026-11-15). |
| Methode | De Jouwhockeystick-methode zoals de site die uitlegt: speler, stick, maat (`src/content/methode.ts`). De volgorde uit de masterprompt (maat, ontwikkelfase, speelstijl, materiaal, budget) staat onder de drie delen: ontwikkelfase, speelstijl en budget vallen onder speler, materiaal en stickgevoel onder stick, en de lengte is maat. |
| Seizoen | Startwaarden per omgeving (zaal, veld, algemeen), zie de tabel hieronder. |
| Herhaling | Hetzelfde subthema pas na 14 dagen, dezelfde pagina pas na 6 weken. Items buiten de lijn tellen mee voor de rust van een pagina. |
| UTM | `utm_campaign=welke-hockeystick-kopen`, `utm_content=<content-ID>`, `utm_medium=social` (besluit eigenaar 2026-11-15). |
| Pulse en Push | Pulse. In een Push-blok eindigt elk item met de vervolgstap van dat blok. Geen aanbiedingen, ook niet in een Push. |

### Subthema's

| Subthema | Centrale vraag | Pijler | Methode | Pagina's (omgeving) |
|---|---|---|---|---|
| Sticklengte | Welke maat hockeystick heb ik nodig? | maat | maat | lengte-tabel (algemeen), stickwijzer (algemeen) |
| Beginners | Welke hockeystick is geschikt voor een beginner? | spel | speler | kinderen-en-beginners (veld), praktische tips (algemeen) |
| Kinderen | Welke hockeystick koop ik voor mijn kind? | maat | speler | zaalstick-voor-kinderen (zaal), kinderen-en-beginners (veld), cadeau (algemeen) |
| Carbon | Hoeveel procent carbon heb ik nodig? | spel | stick | meer-carbon (veld) |
| Kromming | Low bow of mid bow? | spel | stick | low-bow-vs-mid-bow (veld) |
| Speelstijl | Welke stick past bij mijn manier van hockeyen? | spel | speler | hoe-kies-je (algemeen), methodiek (algemeen) |
| Budget | Hoeveel kost een goede hockeystick? | vergelijken | speler | zaalstick-budget (zaal), wat-kost (veld) |
| Vergelijken | Hoe vergelijk ik geschikte hockeysticks? | vergelijken | stick | /zaalsticks (zaal), /sticks (veld), waar-koop-je (algemeen), blog kopen (algemeen) |
| Veld versus zaal | Welke stick heb ik nodig voor mijn speelomgeving? | zaal | speler | veldstick-zaalhockey (zaal) |

### Seizoen (startwaarden)

| Periode | Zaal | Veld | Algemeen | Voorrang |
|---|---:|---:|---:|---|
| November t/m januari | 70% | 15% | 15% | veld versus zaal, kinderen, budget, vergelijken |
| Februari t/m april | 10% | 60% | 30% | vergelijken, carbon, kromming, speelstijl |
| Mei t/m augustus | 0% | 40% | 60% | kinderen, lengte, beginners |
| September en oktober | 30% | 40% | 30% | beginners, kinderen, vergelijken, veld versus zaal |

Het aandeel wordt gemeten over de laatste 8 items van de lijn. Bijstellen gaat via een les van de Onderzoeker en een PR naar de configuratie.

## Planning: vier weken vanaf 16 november

Gemaakt met `npm run marketing:research -- lijn welke-hockeystick-kopen 2026-11-16 4 …`, met de studio zoals die op 15 november stond. De eerste twee weken waren al gevuld met concepten die bij de lijn passen. Die blijven staan, zodat niets dubbel wordt gepland.

| Datum | Soort | Subthema | Pagina | Stand op 15-11 |
|---|---|---|---|---|
| di 17 nov | Post | Kromming | /kennis/low-bow-vs-mid-bow | bestaand: `20261117-low-of-mid-bow`, goedgekeurd, **nog niet in Metricool** (zie open punten) |
| wo 18 nov | Video | Carbon | /kennis/zaalstick-voor-kinderen | bestaand: `20261101-zaal-carbon`, ingepland |
| di 24 nov | Post | Vergelijken | /blog/hockeystick-kopen | bestaand: `20261124-checklist-stick-kopen`, te keuren |
| wo 25 nov | Video | Speelstijl | /kennis/hoe-kies-je-de-juiste-hockeystick | bestaand: `20261125-bow-profielen`, te keuren |
| di 1 dec | Post | Budget | /kennis/wat-kost-een-hockeystick | nieuw: brief A |
| wo 2 dec | Video | Carbon | /kennis/meer-carbon-hockeystick-beter | nieuw: brief B |
| di 8 dec | Post | Kinderen | /kennis/hockeystick-cadeau | nieuw: brief C |
| wo 9 dec | Video | Vergelijken | /sticks | nieuw: brief D |

**Waarom de lijn in week 3 en 4 minder zaal heeft dan 70%:** alle zaalpagina's van de lijn hebben in de 6 weken ervoor al een post of video (`/zaalsticks` op 16, 23 en 28 november, `veldstick-zaalhockey` op 27 en 30 november, `zaalstick-voor-kinderen` op 18 en 26 november, `zaalstick-budget` op 20 november). De lijn kiest dan veld of algemeen in plaats van een pagina te herhalen. Op donderdag blijft zaal het thema. Meer zaal in de lijn vraagt een nieuwe zaalpagina, bijvoorbeeld de evaluatie van `/zaalsticks` na 20 november of een content-brief over de maat van een zaalstick.

### Bestaande items die bij de lijn horen

De planner zet bij de eerstvolgende run deze velden op de items (STAP 2c2, punt 0). Er verandert niets aan tekst, beeld of planning.

| Item | contentlijn | subthema | omgeving |
|---|---|---|---|
| posts/20261117-low-of-mid-bow | welke-hockeystick-kopen | kromming | veld |
| videos/20261101-zaal-carbon | welke-hockeystick-kopen | carbon | zaal |
| posts/20261124-checklist-stick-kopen | welke-hockeystick-kopen | vergelijken | algemeen |
| videos/20261125-bow-profielen | welke-hockeystick-kopen | speelstijl | algemeen |

De UTM van die items blijft zoals hij is: ze waren al gemaakt (en deels ingepland) en een gewijzigde link zou een tweede versie vragen. In het Weekrapport tellen ze via de studio mee bij de lijn.

### Productiebriefs voor week 3 en 4

De Social-planner maakt hier op vrijdag 20 en 27 november de concepten van, met de feiten van de pagina en de redactiecontrole. Ze vallen in de Indoor-Push (tot 15 december), dus elk item eindigt met "Kies je zaalstick". Er zijn geen nieuwe beelden of video-opnames nodig: de render maakt de slides en scènes in de huisstijl.

**A. di 1 dec, post (carrousel), Budget, /kennis/wat-kost-een-hockeystick**
- Vraag: Hoeveel kost een goede hockeystick?
- Invalshoek: een duurdere stick is niet vanzelf beter. Eerst de maat, dan wat de speler doet.
- Slides: opening met de vraag; wanneer een eenvoudige stick prima is; waarom de maat zwaarder weegt dan de prijs; een zaalstick is een aparte keuze, met een verwijzing naar zaalstick-budget; slot.
- Geen bedragen in de post (regel van het merkplatform). De prijzen staan op de pagina.

**B. wo 2 dec, video (kennis), Carbon, /kennis/meer-carbon-hockeystick-beter**
- Hook (mythe): "Meer carbon is niet altijd beter".
- Scènes: wat het carbonpercentage zegt; voor wie weinig carbon past (wie de basis nog leert); waarom het in de zaal weinig oplevert; slot.
- Hooktype afwisselen met de video van 25 november (vergelijking).

**C. di 8 dec, post (één beeld of carrousel), Kinderen, /kennis/hockeystick-cadeau** (Validatie: experimenteel, zie hieronder)
- Vraag: Welke hockeystick koop ik voor mijn kind?
- Moment: kerst (6 t/m 24 december). Invalshoek: een stick als cadeau kies je op lengte, veld of zaal, en hoe lang het kind al speelt.
- Bewijs: de lengte bepaalt de maat; een aparte zaalstick is volgens de spelregels niet verplicht.

**D. wo 9 dec, video (lijstje of kennis), Vergelijken, /sticks**
- Vraag: Hoe vergelijk ik geschikte hockeysticks?
- Invalshoek: vergelijk eerst op wat past (niveau, bow, lengte) en daarna op de winkel; de winkels staan naast elkaar op totaalprijs.
- Als sticklijstje: precies 3 sticks uit `src/catalog/products`, van minstens 2 merken, alfabetisch, met de voetnoot "Selectie december 2026, geen ranking. Prijzen op de site."

## Validatie van invalshoeken (besluit eigenaar 2026-11-15)

Een oudergerichte formulering is een hypothese, geen bewezen zoekkans. Elk item en elk voorstel van de lijn krijgt daarom het veld `validatie` (`bewezen`, `aannemelijk` of `experimenteel`), en bij een formulering-test ook `formulering` (`neutraal`, `ouder`, `dochter`, `zoon`, `situatie`).

| Niveau | Wanneer | Wat erbij staat |
|---|---|---|
| Bewezen | De formulering of het onderwerp staat in een bron die we hebben: Search Console (vertoningen), PostHog (paginaprestaties, AI-verwijzingen), een AI-meting of een interne zoekopdracht. | De exacte bron, periode en meetwaarde. |
| Aannemelijk | Logische uitbreiding van een bewezen patroon, zonder directe data voor deze formulering. | Het bewezen patroon waar het op aansluit, en "Niet gevalideerd: hypothese voor experiment." |
| Experimenteel | Nieuwe formulering zonder onderbouwing. | "Geen data beschikbaar: te testen als experiment", en welke data nodig is. |

Regels:
- Zijn de bronnen niet beschikbaar, dan is elk voorstel `experimenteel`.
- Een experimentele invalshoek wordt nooit als SEO- of GEO-kans gepresenteerd.
- Er wordt nooit gezegd dat een formulering beter presteert zonder data uit een bron. Gebruik geen zoekvolume, CTR of verkeer dat niet uit een beschikbare bron komt.
- Leeftijd is context bij de vraag van een ouder en nooit bewijs voor zoekgedrag.
- Zien we een verschil tussen varianten, dan is dat een signaal voor vervolgonderzoek, geen oorzaak. Conclusies pas vanaf 5 items per variant, en dan nog als richting.

### Beschikbare bronnen op 15 november 2026

| Bron | Beschikbaar | Beperking |
|---|---|---|
| Search Console (issue #11, 10 okt t/m 6 nov) | Ja | Het rapport toont per tabel 15 zoekwoorden; 1069 van 2091 vertoningen komen van zeldzame zoekwoorden die Google niet per zoekwoord toont. Een formulering die er niet staat, is dus niet bewezen afwezig. |
| PostHog (Conversie-rapport, issue #54) | Ja | Cookieloos, een bezoek is één bezoeker op één dag; kleine aantallen (69 bezoekers in de week). |
| Interne zoekopdrachten (`/zoeken`) | Nee | `search_results` telt alleen aantallen; de getypte tekst blijft bewust buiten analytics (privacy). |
| AI-verwijzingen (PostHog) | Beperkt | Eén ChatGPT-bezoek in de week ervoor, naar `/kennis/hockeystick-lengte-tabel`; nul in de week erna. |
| AI-nulmeting 11-11 | Ja | Vraag 4 (kind): geen citatie van onze site bij vier platformen. Richtinggevend, niet exact. |
| Buyer Intelligence fase 1.5 | Ja | 50 stickwijzer-bezoekdagen, intern verkeer niet uitgesloten. Zegt iets over wie de stickwijzer invult, niet over zoekgedrag. |

### Classificatie van de ouderinvalshoeken

| Invalshoek / formulering | Status | Onderbouwing / databron |
|---|---|---|
| Welke hockeystick voor een kind dat begint, en welke merken | Bewezen | Search Console, zoekwoord "hockey strick beginnen kind welke merken": 45 vertoningen, positie 5,2, 0 kliks, pagina `/kennis/hockeystick-kinderen-en-beginners` (10 okt t/m 6 nov). |
| Hockeystick junior | Bewezen | Search Console, "hockeystick junior": 33 vertoningen, positie 36,0, 0 kliks, pagina `/sticks`. |
| Hockeystick junior maat | Bewezen | Search Console, "hockeystick junior maat": 14 vertoningen, positie 41,9, 0 kliks, pagina `/kennis/hockeystick-kinderen-en-beginners`. |
| Welke hockeystick kopen? (neutraal) | Bewezen | Search Console, "welke hockeystick kopen": 21 vertoningen, positie 58,5, 0 kliks, pagina `/blog/hockeystick-kopen`. |
| Beste hockeystick voor beginners | Bewezen als zoekwoord, niet als claim | Search Console: 22 vertoningen, positie 53,2, 0 kliks. Wij schrijven nergens "beste"; de post gaat over kiezen. |
| Welke hockeystick koop ik voor mijn kind? (ouder) | Aannemelijk | Sluit aan op de bewezen kindzoekwoorden hierboven; de formulering zelf staat niet in de data. Niet gevalideerd: hypothese voor experiment. |
| Mijn kind begint met hockey. Welke stick heeft het nodig? (situatie) | Aannemelijk | Sluit aan op "hockey strick beginnen kind welke merken" (45 vertoningen). Niet gevalideerd: hypothese voor experiment. |
| Welke hockeystick koop ik voor mijn dochter? | Experimenteel | Geen data beschikbaar: te testen als experiment. Nodig: vertoningen of klikken op deze formulering in Search Console. |
| Welke hockeystick koop ik voor mijn zoon? | Experimenteel | Geen data beschikbaar: te testen als experiment. Zelfde data nodig. |
| Mijn zoon begint met hockey. Welke stick heeft hij nodig? | Experimenteel | Geen data beschikbaar: te testen als experiment. |
| Leeftijdsgebonden vragen, zoals "hockeystick voor een kind van 8" | Experimenteel | Geen data beschikbaar: te testen als experiment. Leeftijd is alleen context bij de vraag van een ouder. |
| Hockeystick als cadeau (Sinterklaas, kerst) | Experimenteel | Geen zoekwoord over cadeau in Search Console of PostHog. Het seizoen is een aanname. Brief C (8 dec) is daarom een experiment. |
| Zaalstick voor een kind | Aannemelijk | Zaalzoekwoorden zijn bewezen (bijvoorbeeld "zaalhockeystick": 106 vertoningen, positie 12,2), de combinatie met kind is dat niet. |
| Nieuwe AI-formuleringen voor ouders ("Welke stick koop ik voor mijn dochter volgens AI?") | Experimenteel | AI-nulmeting 11-11, vraag 4 (kind): geen citatie bij vier platformen. Geen data die een AI-formulering onderbouwt. |

Verwachtingen die hier niet uit volgen: dat ouders de grootste groep zijn. In de stickwijzer kiest 38% voor een kind en 60% voor zichzelf (Buyer Intelligence fase 1.5, n = 50 bezoekdagen). Dat is een weerlegde aanname uit fase 1, geen basis voor extra oudercontent.

### Testmatrix ouderperspectief

Gebruik de varianten alleen als de inhoud gelijkwaardig blijft: dezelfde pagina, dezelfde feiten, dezelfde vorm, alleen de formulering in de hook en de titel verschilt.

| Variant (`formulering`) | Voorbeeld | Eerste toepassing |
|---|---|---|
| Neutraal | Welke hockeystick kiezen voor een kind? | Week 1 |
| Ouder | Welke hockeystick koop ik voor mijn kind? | Week 2 |
| Dochter | Welke hockeystick koop ik voor mijn dochter? | Later, als experiment |
| Zoon | Welke hockeystick koop ik voor mijn zoon? | Later, als experiment |
| Situatie | Mijn kind begint met hockey. Welke stick heeft het nodig? | Week 3 |

Opzet:
- **Eén variabele per keer.** Hetzelfde onderwerp en dezelfde pagina, dezelfde weekdag en tijd, 1 tot 2 weken uit elkaar (de regels uit `abtest.ts`).
- **Een kindposting heeft hooguit één formulering per onderwerp** en komt niet in dezelfde week als een andere test. De hooktest uit het bouwplan gaat voor; een formuleringstest start pas als die is beslist of niet loopt.
- **Dochter en zoon pas na neutraal en ouder**, en alleen als er daar al iets uit komt. Het zijn experimenten.
- **Meten:** bereik, bewaard en bezoeken via `utm_content` en het veld `formulering`. Het Weekrapport zet de varianten naast elkaar zonder oordeel en schrijft een verschil op als signaal voor vervolgonderzoek.
- **Wat het niet is:** een SEO-test. Social-prestaties zeggen niets over zoekgedrag; Search Console blijft de enige bron voor zoekwoorden.

## Meet- en optimalisatieroutine

| Wanneer | Wie | Wat |
|---|---|---|
| Maandag | Conversie-rapport | Nieuwe tabel "Bezoeken uit social per campagne": bezoeken, stickwijzer-starts, vergelijker (/sticks of /zaalsticks) en winkelkliks per campagne. |
| Maandag | Weekrapport | Sectie Contentlijnen: per subthema items, bereik, bewaard, bezoeken, starts, vergelijker en winkelkliks, met de zes vragen uit de masterprompt. Apart: de Search Console-regel van "welke hockeystick kopen" tegen de nulmeting. |
| Donderdag | Onderzoeker | Minstens twee van de tien voorstellen voor de lijn, met een nieuwe invalshoek. Hooguit één les over het aandeel of de voorrang per seizoen, vanaf 5 items. |
| Vrijdag | Social-planner | Vult de dinsdag- en woensdagplek van de lijn (STAP 2c2), laat bestaande items staan. |
| Jij | In de studio | Goedkeuren of aanpassen. Niets gaat online zonder jouw goedkeuring. |

Met de huidige aantallen zegt een week weinig. Conclusies per subthema pas vanaf 5 items.

## Open punten

- **17 november staat nog niet in Metricool.** `20261117-low-of-mid-bow` is op 13 november goedgekeurd, maar Metricool heeft er op 15 november geen post voor en er staat geen fout bij. Kijk in de studio of de statusregel oranje is, en zo nodig in de log van `social-render.yml`.
- **Metricool-tegoed.** Het ritme blijft 2 posts en 2 video's, ongeveer 8 Metricool-posts per week. Het gratis plan houdt op bij 20 per maand.
- **Een nieuwe zaalpagina** geeft de lijn in de winter meer ruimte (zie hierboven).
