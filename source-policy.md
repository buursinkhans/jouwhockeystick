# Bronbeleid — jouwhockeystick.nl

**Status:** invulling van `docs/source-policy.md`, zoals aangekondigd in de mappenstructuur van `jouwhockeystick-ontwikkelinstructie-vscode-claude-code.md`.
**Doel:** vastleggen hoe claims over sticks worden onderbouwd, hoe bronnen worden vermeld, en hoe de commerciële relatie met de partnerwinkel transparant blijft. Dit document is bindend voor content, productdata en de adviesengine.

---

## 1. Uitgangspunt

Een claim over een product ("dit is een stick met 40% carbon", "geschikt voor O14") staat nooit alleen in een UI-component of los in tekst. Elke claim heeft:

- Een **bron** (merkwebsite, winkelinformatie, technisch datasheet, of expliciet gemarkeerd als eigen inschatting).
- Een **modeljaar**, indien van toepassing.
- Een **`lastVerifiedAt`**-datum.

Dit sluit aan bij `CLAUDE.md`: "Elke producteigenschap moet een bron, modeljaar en `lastVerifiedAt` kunnen hebben."

## 2. Toegestane bronnen

| Type bron | Gebruik | Voorbeeld |
|---|---|---|
| Merkwebsite / officiële specificaties | Primaire bron voor technische specs | Grays-productpagina |
| Partnerwinkel (prijs, voorraad) | Actuele prijs en beschikbaarheid | Voorraadfeed of handmatige update |
| FIH-reglement | Absolute technische grenzen (bow, lengte, gewicht) | FIH Rules of Hockey |
| Eigen redactionele inschatting | Alleen expliciet gemarkeerd als advies, nooit als harde specificatie | "Dit past doorgaans bij beginnende spelers" |

**Niet toegestaan:**
- Ongecontroleerde overname van marketingteksten van derden als objectieve claim.
- Verzonnen of afgeleide specificaties zonder bron.
- Testresultaten, prestatiebeloften of medische claims ("voorkomt blessures", "verbetert je shot met X%").

## 3. Verificatiecyclus

- Controleer productdata van actieve merken minimaal **elk kwartaal** en bij elke seizoensupdate van de fabrikant.
- Een product zonder geldige bron of met een verlopen `lastVerifiedAt` (bijvoorbeeld ouder dan 12 maanden) wordt **niet als actief product getoond** — conform de acceptatiecriteria van Sprint 2 in de ontwikkelinstructie.
- Leg wijzigingen in specificaties vast met datum en bron, zodat de geschiedenis herleidbaar blijft.

## 4. Formulering van adviezen

- Gebruik genuanceerde taal: "kan passen bij", "is een logische richting voor" — nooit absolute garanties.
- Toon bij elk advies minimaal 2–3 zichtbare redenen (reasonCodes), conform de adviesengine-eisen in `CLAUDE.md`.
- Bij tegenstrijdige signalen of onvoldoende informatie: toon een alternatief en benoem de onzekerheid, in plaats van schijnzekerheid te geven.

## 5. Transparantie over de partnerrelatie

Omdat het verdienmodel draait op commissie via de partnerwinkel (zie `business-model.md`), gelden aanvullende regels:

- Op elke pagina met een productaanbeveling of prijsvermelding staat **duidelijk en zonder kleine lettertjes** dat de verkoop via de partnerwinkel loopt.
- De site claimt nergens zelf verkoper, garantieverstrekker of retourpartij te zijn.
- Prijzen die niet rechtstreeks uit een feed van de winkel komen, krijgen een zichtbare vermelding "richtprijs, controleer actuele prijs bij de winkel".
- Deze transparantie-eis staat los van eventuele wettelijke reclame- of affiliate-regels; laat de exacte tekst waar nodig juridisch beoordelen.

## 6. GEO- en citeerbaarheidseisen (aanvulling op `geo-checklist.md`)

Voor content die als bron voor AI-antwoorden moet kunnen dienen:

- Beantwoord de hoofdvraag van een kennisartikel in de eerste 80 woorden, in eigen bewoordingen.
- Citeer nooit langere passages van merkwebsites of andere bronnen; vat samen en verwijs.
- Vermeld auteur, publicatiedatum en (indien van toepassing) bron per artikel.
- Werk structured data (Article, Product, FAQ) alleen bij als de zichtbare pagina-inhoud overeenkomt — geen schema-informatie die niet op de pagina zelf staat.

## 7. Wie is verantwoordelijk

- Contentwijzigingen die een productclaim raken: review door de redactieverantwoordelijke vóór publicatie.
- Wijzigingen aan de adviesregels of scoring: vastleggen in `docs/decision-log.md` met datum, reden en `ruleSetVersion`.
- Vragen over dealer- of promotiebeperkingen van een merk: afstemmen met de partnerwinkel vóór publicatie van gerelateerde content.
