# Merkplatform jouwhockeystick.nl

Het vaste kader voor elke post, video en campagne. De Social-planner, de Onderzoeker en de content-agent lezen dit bestand vóór ze iets maken. Hoe het klinkt staat in [merkstem.md](merkstem.md); de redactiecontrole in `src/marketing/editorCheck.ts`. Lessen uit de resultaten komen hier alleen bij na een vinkje van de eigenaar (fase 3 van [bouwplan-2.0.md](bouwplan-2.0.md)).

## Voor wie

Ouders van jeugdspelers en beginners, in Nederland en, later, Vlaanderen. Ze willen een stick die past, zonder verstand van hockeymateriaal te hoeven hebben.

## Belofte

In een paar minuten de juiste maat en hooguit drie sticks die passen, met de reden en de bron.

## Kernzin en pay-off

- **Kernzin:** "Eerlijk, passend advies". Elke post moet hierbij passen. Past een idee er niet bij, dan maken we het niet.
- **Pay-off:** "Eerlijk stickadvies op maat".

## Bewijszinnen

Gebruik deze, of een korte vorm ervan, als bewijs in een post. Ze zijn waar en controleerbaar:

1. Elk gegeven heeft een bron en een controledatum.
2. De maat komt uit dezelfde lengtetabel als de stickwijzer.
3. Vijf winkels naast elkaar op totaalprijs; de vergoeding speelt geen rol.

## Pijlers

1. **De juiste maat.** Lengte, en bij schoenen de maat en de pasvorm.
2. **Kiezen op je spel.** Kromming, carbon en gewicht naast wat de speler doet.
3. **Zaal of indoor.** Het zaalseizoen, de regels en de keuze tussen een veldstick en een zaalstick.
4. **Eerlijk vergelijken.** Prijzen, winkels en bronnen naast elkaar.

Schoenen volgen dezelfde pijlers.

## Vaste series

Elke serie is herkenbaar aan achtergrond en motief, niet aan nieuwe kleuren. Baloranje blijft voor de hoofdknop en de bal.

| Serie | Achtergrond | Motief | Vast label |
|---|---|---|---|
| Maatje | krijt | liniaal | |
| Kromming | inkt | lijn van de bow | |
| Eerste stick | krijt | silhouet zonder gezicht | |
| Zaal en Indoor | veldblauw | zaalvloer met boarding | |
| Wist je dat FIH | veldblauw | | "Volgens de FIH-spelregels" |
| Nieuw in de catalogus | inkt | | "Nieuw in onze catalogus" |

Het eerste beeld van een post heeft een kop van hooguit 6 woorden.

## De toets per idee

Een idee gaat alleen door als het op alle drie ja scoort:

1. **Helpt het de lezer?** Weet een ouder na de post iets wat helpt bij kiezen.
2. **Past het bij de kernzin?** Eerlijk en passend, zonder verkooppraat.
3. **Staat er een live pagina?** Een post verwijst altijd naar een pagina die al online staat.

## De vijf bouwstenen van een post

1. **Opening:** het eerste beeld of de eerste zin, met het probleem of de vraag van de lezer.
2. **Herkenning:** de situatie die de lezer kent.
3. **Belofte:** wat de lezer na de post weet of kan.
4. **Bewijs:** een feit met bron, een bewijszin of de regel uit de lengtetabel.
5. **Vervolgstap:** één stap, meestal de stickwijzer of de pagina.

## Contentlijnen

Oudergerichte formuleringen zijn hypothesen. Elk item van een lijn heeft `validatie` (bewezen, aannemelijk, experimenteel) met de bron erbij; zie "Validatie" in [contentlijn-welke-hockeystick-kopen.md](contentlijn-welke-hockeystick-kopen.md).

Een contentlijn is een koopvraag die het hele jaar terugkomt. Ze staat boven de pijlers, en elk subthema hangt aan één pijler, zodat niets dubbel wordt ingedeeld. Een lijn vult vaste plekken in het bestaande ritme. Ze voegt geen posts toe en heeft geen eigen kalender. De gegevens staan in `marketing/sites/jouwhockeystick.json` (`contentlijnen`), de keuze per plek in `src/marketing/contentlijn.ts`. Uitleg en meetroutine: [contentlijn-welke-hockeystick-kopen.md](contentlijn-welke-hockeystick-kopen.md).

### Welke hockeystick kopen?

- **Plek in het ritme:** de post van dinsdag en de video van woensdag (1 post en 1 video per week, binnen 2 posts en 2 video's; besluit eigenaar 2026-11-15). De donderdag blijft vrij voor een ondersteunende post als er een eigen invalshoek is.
- **Methode:** de Jouwhockeystick-methode, in haar eigen volgorde: speler (niveau, speelwensen en budget), stick (bow-profiel en stickgevoel), maat (de lengte als harde voorwaarde). Elk subthema noemt de stap waar het bij hoort.
- **Vaste boodschap:** duurder, meer carbon of een bekend merk is niet vanzelf een betere keuze. De stick moet passen bij de speler.
- **Subthema's:** sticklengte, beginners, kinderen, carbon, kromming, speelstijl, budget, vergelijken, veld versus zaal. Elk heeft een centrale vraag en een of meer live pagina's.
- **Seizoen:** van november tot en met januari ongeveer 70% zaal. Van februari tot en met april vooral veld, vergelijken, carbon, kromming en speelstijl. Van mei tot en met augustus jeugd, lengte en beginners. In september en oktober beginners, ouders, vergelijken en de aanloop naar de zaal. Dit zijn startwaarden. Een les van de Onderzoeker kan ze bijstellen, met een vinkje van de eigenaar.
- **Herhaling:** hetzelfde subthema komt pas na 14 dagen terug en dezelfde pagina pas na 6 weken. Zo komt een subthema alleen met een nieuwe invalshoek terug.
- **Pulse en Push:** de lijn hoort bij Pulse. In een Push-blok eindigen haar items met de vervolgstap van dat blok. Een eigen campagne of een Peak maakt de lijn niet. Aanbiedingen noemen we nooit, ook niet in een Push.
- **Meten:** `utm_campaign=welke-hockeystick-kopen`, `utm_content` = het content-ID. Niet elk item hoeft een klik te vragen. Een uitleg-item mag vooral bereik en vertrouwen opleveren.

## Pulse-inhoudslijnen

De vaste stroom tussen campagnes door:

1. **Bewijs:** een gegeven met bron, een vergelijking.
2. **Uitleg:** één onderwerp kort uitgelegd.
3. **Mensen:** hoe de redactie werkt, zonder gezichten.
4. **Ontwikkeling:** wat er nieuw is op de site of in de catalogus.
5. **Moment:** het seizoen, Sinterklaas, de start van het zaalseizoen.

## Nooit

- Kortingsclaims, prijzen in een post, "beste", reviews, personen in beeld of AI-avatars.
- Clickbait, medische uitspraken, uitroeptekens en gedachtestreepjes.
- Een post zonder partnerlink-vermelding als de post naar winkels verwijst.
