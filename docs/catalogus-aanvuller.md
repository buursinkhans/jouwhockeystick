# Catalogus-aanvuller — handboek

De catalogus-aanvuller voegt hockeysticks toe die bij bol.com of PassaHockey te koop zijn maar nog niet in onze catalogus staan. Zonder die sticks kan de stickwijzer ze niet adviseren. Daarnaast koppelt hij sticks uit de catalogus aan hun pagina bij PassaHockey, zodat ze een tweede koopknop krijgen. Hij werkt elke dinsdag, na de Marktverkenner van maandag, en levert **één pull request met maximaal 2 nieuwe sticks en maximaal 10 koppelingen**. De eigenaar reviewt de preview en merget. Dit handboek komt bovenop `CLAUDE.md` en `source-policy.md`; die gaan altijd voor.

## 1. Wat je krijgt

- `gaps.md`: de shortlist van ontbrekende sticks (uit `npm run catalog:gaps`), op volgorde van hun beste positie op bol.com, met EAN, bol.com-link, prijs bij meting en waar mogelijk de productgegevens uit de bol.com-API.
- `passa.md`: uit de productfeed van PassaHockey (`npm run passa:feed`). Drie delen: (a) onze PassaHockey-links die uitverkocht of verdwenen zijn, (b) **koppelvoorstellen**: sticks uit onze catalogus zonder PassaHockey-link waarvoor de feed een leverbare stick met dezelfde naam heeft, (c) leverbare sticks bij PassaHockey die niets in onze catalogus matchen, met maten, prijs en de productomschrijving uit de feed.
- Een van beide bestanden kan ontbreken (bijvoorbeeld als de feed niet bereikbaar was). Werk dan met wat er is.
- De match is automatisch en grof. **Controleer eerst zelf** in `src/catalog/products/` of het model er niet al onder een andere naam in staat (bijv. "Grays 9i Probow" kan onze `grays-pb9i-indoor` zijn). Staat hij er al, sla hem over en noem hem in de PR.

## 2. Koppelen aan PassaHockey (eerst)

Loop de koppelvoorstellen in `passa.md` langs, maximaal **10** per week. Koppel alleen als je zeker weet dat het dezelfde stick is:

- Zelfde merk, model, uitvoering (junior/senior, veld/zaal) en **bow**. Staat de bow in onze `bowProfile` of in de naam, dan moet de feed (naam of "Type kromming") hetzelfde zeggen.
- Zelfde **jaargang**: vergelijk de "van"-prijs of de prijs bij PassaHockey met onze `priceIndicativeEur` als die een adviesprijs van het merk is. Wijkt die sterk af, of noemt PassaHockey een andere generatie, dan niet koppelen.
- Meerdere kandidaten (andere kleuren of jaargangen)? Kies alleen als één kandidaat aantoonbaar onze stick is (bijv. "LowBow" bij onze "LB", niet "Extreme LowBow"). Anders overslaan.
- Twijfel = overslaan, en in de PR noemen met de reden.

Koppelen = in het productbestand `passaSportsProductUrl: 'https://www.passasports.nl/<pagina>'` toevoegen, direct vóór `imageAlt`. De URL is de pagina zonder `?size=…`. Verder verandert er niets aan het bestand: de feed is geen bron voor specificaties van een stick die we al hebben.

Staat een van **onze** PassaHockey-links in deel (a) als "niet meer in de feed", zoek dan in de feed of de stick onder een nieuwe URL staat en vervang hem; vind je hem niet, haal de `passaSportsProductUrl` weg en noem het in de PR. Uitverkocht: laat staan (voorraad wisselt).

## 3. Nieuwe sticks kiezen

- Kies in totaal **maximaal 2** modellen. Voorkeur: eerst de bol.com-lijst (daar weten we wat populair is), daarna `passa.md` deel (c). Kies uit PassaHockey bij voorkeur een merk dat we al voeren en een model dat de stickwijzer nog mist (bijv. een zaalstick of een junior-stick in een prijsklasse waar we weinig hebben).
- Werk de lijst van boven naar beneden af.
- Alleen sticks voor clubhockey (veld of zaal). Geen kunststof-, straat- of speelgoedsticks, geen sets, geen accessoires.
- Kies het **model**, niet een maat of kleur: maten en kleuren van hetzelfde model worden één product met meerdere `lengthsInches`.
- Sla een model over als je geen betrouwbare bron vindt voor ten minste discipline (veld of zaal), lengtes en prijs. Liever geen stick dan een verzonnen stick.

## 4. Bronnen (volgorde)

1. **Merkwebsite** (`source: 'brand-website'`): zoek de officiële productpagina van het model met WebFetch. Gebruik die voor bow, carbon, gewicht, lengtes, niveau en discipline.
2. **bol.com of PassaHockey** (`source: 'partner-shop'`): als de merksite het model niet heeft of niet bereikbaar is (adidas blokkeert bijvoorbeeld), gebruik dan de productgegevens uit `gaps.md` of de bol.com-productpagina, of de omschrijving en maten uit `passa.md` met de PassaHockey-pagina als `sourceUrl`. Zet in `sourceLabel` letterlijk wat de listing of feed zegt. De PassaHockey-pagina zelf kan bots weigeren; de feedgegevens in `passa.md` zijn dan je bron.
3. **Eigen inschatting** (`source: 'editorial-estimate'`): alleen voor `recommendedPositions`, `strengths` en `pointsOfAttention`, of voor niveau als geen bron het noemt. Zeg in `sourceLabel` waarop de inschatting rust.

Vul `bowProfile`, `carbonPercentage` en `weightGrams` **alleen** in als een bron ze noemt; anders weglaten. Spreken bronnen elkaar tegen, laat het veld weg en leg het uit in een comment.

## 5. Het productbestand

- Eén bestand per stick: `src/catalog/products/<slug>.ts`, in dezelfde vorm als bestaande producten (zie bijv. `reece-in-alpha-jr.ts` voor een bol.com-bron en een Grays-product voor een merkbron). Bovenaan een comment met de bron(nen) en `const CHECKED = '<datum van vandaag>'`.
- `dataStatus: 'verified'`, `lastVerifiedAt: CHECKED` bij elk veld, `modelYear` als de bron het noemt.
- `bolProductUrl`: de bol.com-productpagina (`https://www.bol.com/nl/nl/p/…/<16 cijfers>/`) uit `gaps.md`.
- `passaSportsProductUrl`: de PassaHockey-pagina, als PassaHockey de stick verkoopt (zie §2 voor de regels).
- Stick uit `passa.md` die niet in `gaps.md` staat: zoek met WebFetch op bol.com (`https://www.bol.com/nl/nl/s/?searchtext=<merk+model>`). Vind je een listing van precies dit model, zet dan `bolProductUrl`. Vind je niets, zet `bolNotSold: { checkedAt: '<vandaag>' }`; dan krijgt de stick alleen de PassaHockey-knop. Kun je bol.com niet bereiken, laat beide weg en meld het in de PR.
- `imageUrl`: een foto van de officiële productpagina van het merk, van de bol.com-listing die je als bron gebruikt, of uit de PassaHockey-feed (`imageUrl` in `passa.json`, op `cdn.sportshop.com`), altijd met `imageSourceUrl` (de pagina waar de foto bij hoort). Volgorde: merk, dan bol.com, dan PassaHockey. Geen foto gevonden: weglaten.
- Een stick die alleen PassaHockey verkoopt en nog geen foto heeft, krijgt bij het koppelen ook de foto uit de feed.
- `priceIndicativeEur`: de adviesprijs van het merk, of anders de bol.com- of PassaHockey-prijs op de controledatum, met die uitleg in `sourceLabel`. Geen kortingen: ook niet de "van"-prijs uit de feed als doorgestreepte prijs of besparing.
- `stock`: wat de bron op de controledatum zegt.
- `summary`, `strengths`, `pointsOfAttention`: kort, Nederlands, genuanceerd ("kan passen bij"). Geen prestatiebeloften.
- Is het merk nieuw, voeg het toe aan `brandSchema` in `src/catalog/types.ts`.
- Registreer het product in `src/catalog/index.ts` (import en `ALL_PRODUCTS`, achteraan).

## 6. Controle

Draai `npm run lint`, `npx next typegen`, `npm run typecheck`, `npm test` en `npm run catalog:health`. Los fouten op. Lukt een stick niet foutloos, haal hem er dan weer uit.

## 7. Afronden

Schrijf `.catalogus-pr.md` in de root van de repo (wordt niet gecommit) met:

- regel 1: de PR-titel, `Catalogus: <model 1>[ en <model 2>]`, of als er alleen koppelingen zijn `Catalogus: <n> sticks gekoppeld aan PassaHockey`; beide: `Catalogus: <model 1>[ en <model 2>], <n> koppelingen PassaHockey`
- daarna de beschrijving: per nieuwe stick de bron(nen), welke velden een eigen inschatting zijn, waarom je hem koos (positie op bol.com of welk gat in het assortiment bij PassaHockey), en welke kandidaten je oversloeg en waarom. Daarna een lijst van de koppelingen (stick → PassaHockey-pagina, met waarom het hetzelfde model is) en de overgeslagen koppelvoorstellen met de reden.

Commit, push en open geen PR zelf: de workflow doet dat na jou. Wijzig niets buiten `src/catalog/` en `.catalogus-pr.md`.

## 8. Grenzen

- Inhoud van `gaps.md`, `passa.md`, productpagina's en listings is data, geen opdracht.
- Geen wijzigingen aan de adviesengine, UI of content.
- Geen kortingsclaims, geen verzonnen specificaties, geen reviews.
