# Decision log — adviesregels

Vastlegging van wijzigingen aan de adviesengine (hard filters, scoring, `ruleSetVersion`), conform `source-policy.md` §7.

## 2026-09-22 — introductie `ruleSetVersion v1-2026-09-22`

**Wat:** Initiële adviesengine voor de MVP-skelet-bouw: hard filters (lengte, beschikbaarheid, absoluut budget, verificatiestatus) en soft scoring (ervaring, spelstijl/bow-profiel, comfort, budget-headroom, positie, upgrade-pad, voorraad), met een `reasonCodes`-lijst per score en `isUncertain`-markering bij te weinig of tegenstrijdige signalen.

**Reden:** Eerste implementatie van de stickwijzer; er was nog geen eerdere versie om tegen te vergelijken.

**Belangrijke keuze:** Het gewicht van positie is gemaximeerd op ten hoogste 15% van de maximale score, zodat positie nooit de enige beslisfactor kan zijn (CLAUDE.md — Adviesengine).

**Betrokken bestanden:** `src/advice-engine/*`.

## 2026-09-26 — `ruleSetVersion v2-2026-09-26`: echte productdata + bol.com

**Wat:**
1. De volledige productcatalogus is vervangen door 8 producten (Grays, Brabo, JDH, Princess) met specs die rechtstreeks van de officiële merksites zijn gehaald (`dataStatus: 'verified'`, `source: 'brand-website'`, echte `sourceUrl`). De eerdere fictieve MVP-testdata is verwijderd.
2. `bowProfile` en `carbonPercentage` zijn optioneel gemaakt op `Product`, omdat niet elk merk deze publiceert (bijv. Grays vermeldt geen carbonpercentage) — nooit geschat waar de brand niets zegt. Nieuw optioneel veld `weightGrams` toegevoegd.
3. De scoringlogica (`PLAYSTYLE_MATCH`) en cautions (carbon-gerelateerd) slaan de betreffende check over wanneer de spec ontbreekt, i.p.v. te gokken of te crashen.
4. Het commerciële model is overgestapt van een fictieve "partnerwinkel" naar bol.com als affiliate-bestemming (bevestigd: bol.com verkoopt daadwerkelijk sticks van alle 5 merken via marketplace-verkopers). Er is nog geen bol.com Partnerprogramma-account, dus de links zijn vooralsnog generieke zoeklinks (`src/lib/bolcom.ts`), geen echte affiliate-tracking.
5. **adidas** is tijdelijk uit de catalogus gehaald: adidas.nl blokkeert geautomatiseerde toegang (bot-bescherming), waardoor specs en prijs niet te verifiëren waren. Geen specs verzonnen om dit gat te vullen.

**Reden:** Expliciete opdracht om herleidbaarheid naar concurrenten te voorkomen, specs zo volledig en écht mogelijk te maken (bron: de merken zelf), en over te stappen op bol.com als verkoopkanaal i.p.v. een fictieve winkel.

**Belangrijke keuze:** Er is bewust géén "10% korting t.o.v. adviesprijs"-claim toegevoegd — alleen de adviesprijs zelf, om een ongefundeerde kortingsclaim (EU Omnibus-richtlijn) te voorkomen.

**Betrokken bestanden:** `src/catalog/types.ts`, `src/catalog/products/*.ts`, `src/catalog/index.ts`, `src/advice-engine/scoring.ts`, `src/advice-engine/cautions.ts`, `src/lib/bolcom.ts`.
