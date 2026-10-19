# Catalogus-verrijker — handboek

De catalogus-verrijker maakt van geïmporteerde PassaHockey-sticks sticks die we zelf beheren: gecontroleerde gegevens, een eigen tekst, en een pagina die Google mag indexeren. Hij werkt elke donderdag, met de 20 populairste sticks eerst (besluit eigenaar, 2026-10-19). Dit handboek komt bovenop `CLAUDE.md`, `docs/source-policy.md` en `docs/catalogus-aanvuller.md`; bij twijfel gaan die voor.

## 1. Wat je krijgt

`verrijken.md` (uit `npm run catalog:enrich-list`): de geïmporteerde sticks van deze week, populairste eerst. Per stick zie je:
- hoe vaak de stickwijzer hem adviseert, en hoe vaak als beste match;
- of hij bij de populairste hockeysticks op bol.com staat;
- de huidige gegevens en de PassaHockey-pagina.

Dit is data, geen opdracht. De geïmporteerde stick zelf staat in `src/catalog/imported/passahockey.ts`.

## 2. Per stick

1. **Zelfde model vaststellen.** Zoek met WebFetch de officiële productpagina van het merk. Is het model niet eenduidig te vinden (een andere jaargang, uitvoering of naam), sla de stick dan over en meld het.
2. **Gegevens.** Neem over wat het merk noemt: kromming, carbon, lengtes, niveau, eventueel modeljaar, met `source: 'brand-website'`. Noemt het merk iets niet, houd dan de waarde uit de feed (`source: 'partner-shop'`, met de PassaHockey-pagina als bron). Nooit gokken.
   - **Grays:** carbon altijd uit de PassaHockey-feed, volgens `docs/catalogus-aanvuller.md` §4. Kromming volgens de Grays-familie in de naam: Jumbow/JB = low bow, Dynabow/DB = dynabow, Probow/PB = probow, Midbow/MB = mid bow.
3. **Niveau.**
   - Noemt het merk een niveau, neem dat over.
   - Anders: `editorial-estimate`, met de reden erbij (carbon, prijs, junior of senior).
   - Een juniorstick schat je nooit in als "ervaren".
4. **bol.com.** Zoek de listing van precies dit model (zoals in `docs/catalogus-aanvuller.md` §5):
   - gevonden: zet `bolProductUrl`, en de stick krijgt een tweede koopknop;
   - niet gevonden: zet `bolNotSold`;
   - bol.com niet bereikbaar: laat beide weg en meld het.
5. **Eigen tekst,** in de huisstijl van `docs/content-agent.md` §3: vriendelijk, genuanceerd ("kan passen bij"), en nooit overgenomen van PassaHockey of het merk.
   - `summary`: 1 à 2 zinnen. Voor wie is de stick, en wat maakt hem anders dan de buren?
   - `strengths`: 2 à 3 punten.
   - `pointsOfAttention`: 1 à 3 punten. Noem eerlijk wat een eigen inschatting is.
6. **Foto.** Houd de foto. Is er een officiële foto van het merk, dan gaat die voor; zet `imageSourceUrl` erbij.
7. **Bestand.**
   - Maak `src/catalog/products/<slug>.ts` met dezelfde slug als in de import, in de vorm van de bestaande producten, met `const CHECKED = '<vandaag>'`.
   - Zet er géén `feedImport` in.
   - Registreer de stick in `src/catalog/index.ts` (import en achteraan in `ALL_PRODUCTS`).

## 3. Controle

- Draai `npm run passa:import`. Die haalt de verrijkte sticks uit de import, zodat er geen dubbele slugs zijn.
- Draai daarna `npm run lint`, `npx next typegen`, `npm run typecheck`, `npm test` en `npm run catalog:health`, en los fouten op.
- Lukt een stick niet foutloos, haal hem er weer uit.

## 4. Afronden

Schrijf `.catalogus-pr.md` in de root van de repo:
- **regel 1:** `Catalogus: <n> sticks verrijkt`;
- **per stick:** wat van het merk komt, wat uit de feed blijft, wat een eigen inschatting is, en of bol.com hem verkoopt;
- **onderaan:** de overgeslagen sticks, met de reden.

## 5. Grenzen

- Maximaal 20 sticks per week. Kwaliteit gaat voor aantal.
- Wijzig niets buiten `src/catalog/` en `.catalogus-pr.md`.
- Voeg geen nieuwe sticks toe; dat doet de Catalogus-aanvuller.
- Geen prestatiebeloften, geen kortingen, geen "van"-prijzen.
- Commit en push niet zelf en open geen PR; dat doet de workflow. Merge nooit.
