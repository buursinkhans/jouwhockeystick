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

## 2026-09-26 — bugfix: onterechte "lengte en budget spraken elkaar tegen"-melding

**Wat:** `applyHardFilters` gaf alleen een lege productlijst terug zonder reden; de UI toonde daarom altijd dezelfde (verzonnen) verklaring "lengte en budget spraken elkaar mogelijk tegen", ook als in werkelijkheid maar één filter (vaak alleen budget, of alleen lengte) alles uitsloot. `applyHardFilters` rapporteert nu welke stap (`verification | length | availability | budget`) de kandidatenlijst als eerste leegmaakte, en `QuizResult` toont een melding die bij die specifieke oorzaak past. Geen wijziging aan de filterregels zelf — alleen aan de diagnose/melding, dus geen `ruleSetVersion`-ophoging.

**Onderliggende oorzaak destijds:** de nieuwe, echte catalogus (zie hierboven) bevat alleen volwassen sticks vanaf 36,5" en vanaf €130 — een gebruiker met een kortere lichaamslengte of een bescheiden budget kreeg daardoor voorheen ten onrechte de melding dat lengte én budget tegenstrijdig waren, terwijl het gewoon een catalogus-dekkingsgat is (geen juniorsticks/instapmodellen onder €130 meer in de catalogus).

**Tevens gefixt:** bol.com-zoeklink bevat nu altijd het woord "hockeystick" naast de modelnaam (een kale modelnaam als "JDH X93 Pro Bow" kon op bol.com matchen met ongerelateerde producten, bijv. koptelefoons).

**Betrokken bestanden:** `src/advice-engine/hardFilters.ts`, `src/advice-engine/types.ts`, `src/advice-engine/engine.ts`, `src/components/stickwijzer/QuizResult.tsx`, `src/lib/bolcom.ts`.

## 2026-09-26 — juniorsticks toegevoegd (5 nieuwe producten)

**Wat:** 5 echte juniorsticks toegevoegd, rechtstreeks gesourced van de officiële merksites: Grays Aura GT Junior (€30, lengtes 26"–35"), JDH Junior Mid Bow (€85, composiet zonder carbon), Brabo G-Force Elite X One LB JR (€119,99, 40% carbon), Princess Competition JR 3K 10 STAR (€99,99, 30% carbon) en Princess Premium JR 4K 10 STAR (€129,99, 40% carbon). Een zesde gevonden Brabo-juniormodel (Traditional Carbon 80 JR) is bewust niet toegevoegd omdat de merksite meldde dat deze momenteel niet leverbaar is.

**Reden:** De catalogus bevatte tot nu toe alleen volwassen sticks (36,5"+, vanaf €130), wat direct de oorzaak was van de eerdere bugfix hierboven (onterecht "geen match"-scherm bij kortere lengtes/lagere budgetten). Met deze toevoeging dekt de catalogus nu 26"–38,5" en €30–€350.

**Betrokken bestanden:** `src/catalog/products/grays-aura-gt-junior.ts`, `jdh-junior-mid-bow.ts`, `brabo-gforce-elite-x-one-lb-jr.ts`, `princess-competition-jr-3k-10-star.ts`, `princess-premium-jr-4k-10-star.ts`, `src/catalog/index.ts`.
