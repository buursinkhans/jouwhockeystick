# Seizoensagenda (uit Google Trends)

Dit bestand wordt gemaakt met `npm run trends:agenda` uit `data/trends/`. Pas het niet met de hand aan: een test faalt als het niet klopt met de gegevens. Handboek: `docs/seo-trends-import.md`.

**Bron:** Google Trends, Nederland, Google Zoeken, een relatieve index (0 tot 100), geen zoekaantallen. Export van 2026-11-25. Het patroon komt uit de volledige jaren 2022 tot en met 2025.

**Zo lees je het:** een golf is een maand waarin een gemiddeld jaar minstens 15 indexpunten stijgt ten opzichte van de maand ervoor. Het voorbereidingsvenster van 8 tot 4 weken vóór een golf is een hypothese die we na een jaar eigen data toetsen. Per term gelezen, nooit opgeteld. Wat Trends niet kan zeggen: hoeveel mensen zoeken, en of een zoekopdracht koopintentie heeft. Daarvoor is er Search Console.

## Het jaar volgens hockeystick (het anker)

| Maand | Index (jaargemiddelde is 100) | Wat er gebeurt |
|---|---|---|
| januari | 56 | - |
| februari | 67 | - |
| maart | 104 | golf: stijgt met 37 |
| april | 97 | - |
| mei | 87 | - |
| juni | 93 | - |
| juli | 63 | - |
| augustus | 122 | golf: stijgt met 59, hoog |
| september | 137 | golf: stijgt met 15, hoog |
| oktober | 108 | - |
| november | 182 | golf: stijgt met 74, hoog |
| december | 86 | - |

## Golven en voorbereiding

- **maart:** de index stijgt met 37 punten. Voorbereiden ongeveer 4 jan t/m 1 feb.
- **augustus:** de index stijgt met 59 punten. Voorbereiden ongeveer 6 jun t/m 4 jul.
- **september:** de index stijgt met 15 punten. Voorbereiden ongeveer 7 jul t/m 4 aug.
- **november:** de index stijgt met 74 punten. Voorbereiden ongeveer 6 sep t/m 4 okt.

Opeenvolgende golven (augustus en september) zijn één opbouw: begin met voorbereiden voor de eerste.

## Per thema (per term, nooit opgeteld)

### kopen

Geen term met een vast jaarpatroon. Voor dit thema geeft Trends geen seizoen; gebruik Search Console.

Te klein of zonder vast patroon (niet gelezen): beste hockeystick, hockeystick aanbieding, hockeystick kopen, hockeystick sale.

### maat

| Term | Piekmaanden | Betrouwbaarheid |
|---|---|---|
| hockeystick kind | augustus tot en met november | richting |
| hockeystick lengte | maart; augustus tot en met september; november | richting |
| hockeystick maat | augustus tot en met november | richting |

- **Golf van maart.** Voorbereiden ongeveer 4 jan t/m 1 feb, zodat het klaar staat voor maart.
- **Golf van augustus tot en met november.** Voorbereiden ongeveer 6 jun t/m 4 jul, zodat het klaar staat voor augustus.

Te klein of zonder vast patroon (niet gelezen): hockeystick junior, welke maat hockeystick.

### merken

| Term | Piekmaanden | Betrouwbaarheid |
|---|---|---|
| indian maharadja | juni; augustus tot en met september; november | goed |
| adidas hockeystick | juni; augustus tot en met september; november | richting |

- **Golf van juni.** Voorbereiden ongeveer 6 apr t/m 4 mei, zodat het klaar staat voor juni.
- **Golf van augustus tot en met september.** Voorbereiden ongeveer 6 jun t/m 4 jul, zodat het klaar staat voor augustus.
- **Golf van november.** Voorbereiden ongeveer 6 sep t/m 4 okt, zodat het klaar staat voor november.

Te klein of zonder vast patroon (niet gelezen): brabo hockeystick, grays hockeystick, jdh hockeystick, nike hockeystick, osaka hockeystick, princess hockeystick.

### zaal

| Term | Piekmaanden | Betrouwbaarheid |
|---|---|---|
| hockeystick zaal | november tot en met december | richting |
| indoor hockeystick | oktober tot en met december | richting |
| zaalhockey | november tot en met februari | richting |
| zaalhockeystick | oktober tot en met december | richting |

- **Golf van oktober tot en met februari.** Voorbereiden ongeveer 6 aug t/m 3 sep, zodat het klaar staat voor oktober.

## Wat dit betekent voor de planning

- Content voor een golf maak en publiceer je binnen het voorbereidingsvenster, zodat Google de pagina kan oppikken voordat de golf begint.
- Het koopseizoen voor zaal begint vroeger dan het speelseizoen: let op de piek van `zaalhockeystick` en niet alleen op die van `zaalhockey`.
- Voor termen met koopintentie ("kopen", "sale", "beste") geeft Trends geen seizoen. Gebruik daarvoor Search Console.
- Een thema zonder leesbare term krijgt geen seizoen uit deze agenda.
- Maak elk kwartaal nieuwe exports (zie het handboek). Een export van meer dan 100 dagen oud is verouderd.
