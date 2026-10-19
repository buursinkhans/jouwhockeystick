# Decision log — adviesregels

Vastlegging van wijzigingen aan de adviesengine (hard filters, scoring, `ruleSetVersion`), conform `docs/source-policy.md` §7.

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

## 2026-09-27 — `ruleSetVersion v3-2026-09-27`: scoring-bias tegen Grays gecorrigeerd + Grays uitgebreid

**Wat:**
1. **Scoring-fix:** `scoreComfort` gaf voorheen 0 punten wanneer `carbonPercentage` ontbreekt (bijv. bij Grays, die geen carbonpercentage publiceert). Dat behandelde "onbekend" feitelijk hetzelfde als "bevestigd geen match", wat merken met onvolledige specs structureel benadeelde in de ranking — een gat in gepubliceerde data werd zo een verkapt kwaliteitsoordeel. Onbekend carbonpercentage krijgt nu dezelfde neutrale score als "geen voorkeur" (helft van `comfortMatch`), maar claimt nooit de `COMFORT_MATCH`-reasonCode (die blijft alleen verschijnen bij een daadwerkelijk geverifieerde match).
2. **Grays uitgebreid met 3 topmodellen** (JB 12+, PB 11+, DB 10+ — allemaal met echte specs/foto's van grays-hockey.eu), waarmee Grays van 3 naar 6 producten gaat — nu het merk met de meeste producten in de catalogus.
3. **Onderzoek bevestigde:** Grays sponsort via "Team Grays" meerdere Nederlandse internationals, waaronder olympisch kampioenen (Parijs 2024) — zie de nieuwe `/merken`-pagina hieronder.

**Reden:** Gebruiker merkte terecht op dat Grays zelden in adviezen verscheen, ondanks brede naamsbekendheid bij (top)spelers. Onderzoek wees twee oorzaken aan: te weinig Grays-producten in de catalogus, en een scoring-bug die Grays structureel benadeelde omdat het merk geen carbonpercentage publiceert.

**Betrokken bestanden:** `src/advice-engine/scoring.ts`, `src/advice-engine/ruleSetVersion.ts`, `src/catalog/products/grays-jb12-plus-composite.ts`, `grays-pb11-plus-composite.ts`, `grays-db10-plus-composite.ts`, `src/catalog/index.ts`.

## 2026-09-27 — echte productfoto's, merkenpagina en kleinere fixes

**Wat:**
- Alle 16 producten tonen nu de echte productfoto van de officiële merkpagina (`imageUrl`/`imageSourceUrl` op `Product`), met de bestaande SVG-illustratie als fallback wanneer die ontbreekt. Bewust géén bol.com-foto's (geen bevestigd Partnerprogramma, en marketplace-voorraad bleek eerder al te fluctueren) en geen Next/Image-optimalisatie (voorkomt het beheren van remote-patterns voor meerdere externe hostnamen).
- Nieuwe pagina `/merken`: per merk (Grays, Brabo, JDH, Princess, adidas) officieel logo, korte kenmerken en — alleen waar op een officiële bron te bevestigen — Nederlandse hockeyinternationals die het merk sponsoren, inclusief twee echte, woordelijk overgenomen citaten van Brabo-atletenpagina's (Thierry Brinkman, Pien Sanders) en één van een Nederlands international-keeper over Grays. Geen enkel citaat is verzonnen; waar geen citaat gevonden kon worden, is dat expliciet zo vermeld i.p.v. iets te verzinnen.
- Knoptekst "Bekijk op bol.com" overal aangepast naar "Bekijk en koop op bol.com".

**Betrokken bestanden:** `src/catalog/types.ts`, `src/components/catalog/ProductImage.tsx` (nieuw), `src/content/brands.ts` (nieuw), `src/app/merken/page.tsx` (nieuw), diverse productbestanden (`imageUrl`/`imageSourceUrl`).

## 2026-09-27 — adidas toegevoegd via bol.com als bron

**Wat:** 2 echte adidas-sticks toegevoegd — adidas Estro .4 (€179, mid-bow, 70% carbon, 650g) en adidas Estro .75 LE 26/27 (€229,95, carbon materiaal zonder vermeld percentage). Specs, prijs en voorraadstatus komen van bol.com-listings (`source: 'partner-shop'`), niet van adidas zelf — adidas.nl blokkeert nog altijd geautomatiseerde toegang. Een derde gevonden model (adidas X24 Compo 3, 30% carbon) is bewust niet toegevoegd: bol.com toonde deze als "niet leverbaar" zonder zichtbare prijs, en we verzinnen geen prijs voor een echt, met naam genoemd product.

**Belangrijk verschil met de andere merken:** bij Grays/Brabo/JDH/Princess is `priceIndicativeEur` de officiële adviesprijs van het merk zelf. Bij deze twee adidas-producten is het een momentopname van de actuele bol.com-verkoopprijs (expliciet zo gelabeld in `sourceLabel`) — dat is een ander soort getal, en de generieke `ProductNotice`-tekst is daarom aangepast van "Adviesprijs (fabrikant)" naar het neutralere "Richtprijs", zodat er geen onterechte fabrikantsclaim ontstaat voor deze twee producten.

**Reden:** Expliciete opdracht om adidas via bol.com te sourcen nu adidas.nl niet te raadplegen is. bol.com is voor dit project al de aangewezen verkooppartner, en `partner-shop` is een bestaand, toegestaan brontype in het schema (docs/source-policy.md §2) — dit is dus geen nieuwe categorie, alleen de eerste keer dat we hem voor specs gebruiken i.p.v. alleen voor prijs.

**Betrokken bestanden:** `src/catalog/products/adidas-estro-4.ts`, `adidas-estro-75-le.ts`, `src/catalog/index.ts`, `src/components/ui/ProductNotice.tsx`, `src/content/brands.ts`.

## 2026-10-01 — `ruleSetVersion v4-2026-10-01`: keuzehulp v1.1 met drie adviesroutes

**Leidend document:** `complete-instructie-hockeystick-keuzehulp-claude-code.md` (implementatiespecificatie v1.1, in de bovenliggende projectmap). Op expliciete opdracht is de stickwijzer volgens die specificatie herbouwd.

**Wat:**
1. **Drie routes** (START / ONTWIKKEL / PRESTATIE). De gebruiker kiest zelf de situatie; op basis van leeftijdsgroep en ervaring stellen we een andere route voor als die logischer is, maar de eigen keuze beslist (`src/advice-engine/route.ts`, `answers.ts`).
2. **Vragenlijst per route** met de vraag-id's uit de specificatie, data-gedreven (`src/content/stickwijzer/questions.ts`). START heeft zes schermen; voortgang staat in `sessionStorage`.
3. **Lengteadvies** volgens de maatguide uit de specificatie, met een tweede maat op een grens (`sizeAdvice.ts`). Vanaf 163 cm is het advies 36,5"; 37,5"/38,5" worden niet meer geadviseerd.
4. **Bow-profielen** omgezet naar `ultrabow | midbow | dynabow | probow | lowbow | extreme_lowbow`. Waar het merk zelf een profielnaam voert, is die overgenomen (Grays DB 10+ → dynabow, Grays PB 11+ → probow, JDH X93 Pro Bow → probow, Princess Competition 1 Star PROBOW → probow op basis van de modelnaam). Grays Aura GT Junior ("Classic bow, straighter curve") is redactioneel ingedeeld als ultrabow; dat stond eerder ten onrechte als low-bow.
5. **Harde filters** (§6.1): maat, ervaringsband, START-uitsluitingen, eerste aanname versus ~85%+ carbon, dragflickspecialist zonder dragflickrol, budget, "alleen direct leverbaar", en de publicatieblokkades uit §11 (ontbrekend bow-profiel, ontbrekende bron, onbekend modeljaar, niet leverbaar, onlogische startermarkering).
6. **Scoring per route** met de gewichten uit §6.2 en maximaal drie rollen: beste match (minimaal 70/100), veilige keuze, ambitieuze keuze.
7. **Bronnen en claims**: `SourceRecord`/`ContentClaim` met validatieregels (`src/sources/`), bronregel per adviesreden, "Bronnen en methode" per stick en een publieke pagina `/methodiek`.
8. **Analytics**: `advice_started`, `route_selected`, `question_answered`, `advice_completed`, `advice_product_viewed`, `advice_feedback_submitted`, naast de bestaande `quiz_start`/`quiz_complete`.

**Eigen keuzes waar de specificatie niets of iets tegenstrijdigs zegt:**
- De adviesregels per product (`adviceRules` in de specificatie) worden **afgeleid** uit de bestaande, bronvermelde productdata (`productRules.ts`) in plaats van per product ingetypt, zodat een markering nooit de eigen specs kan tegenspreken.
- De PRESTATIE-gewichten in de specificatie tellen op tot 97; de resterende 3 punten gaan naar beschikbaarheid.
- De leeftijdsgroep 11–12 telt mee als "≤ 11" bij het routevoorstel.
- Scoort de beste stick onder de 70, dan heet hij "dichtstbijzijnde optie" in plaats van "beste match".
- Bestaat de geadviseerde maat niet in de catalogus, dan tonen we geen match, maar apart en met waarschuwing hooguit één maat **korter** (nooit langer). De catalogus heeft geen 27", 29", 31" en 33".
- Hercontrole blijft 12 maanden (strenger dan de 18 maanden uit de specificatie).
- De samenhang doel ↔ bow-profiel (`BOW_GOAL_SUPPORT`) is een redactionele adviesregel, geen meting.

**Bewust niet gebouwd (zie open punten in de oplevering):** adminlaag, API-endpoints en auditlog (§11/§13 — vragen een database en login), e-mail van het advies en opt-in opvolging (privacy/toestemming), de events voor winkelmand en aankoop (er is geen checkout), vrije tekstvelden (`medical_or_adaptation`, `notes`, `current_stick_brand_model`), `need_accessories` en `sustainability_preference` (geen productdata), en de wetenschappelijke passage uit §8.2 (er is nog geen geverifieerde onafhankelijke bron). `marginBand` is niet in het datamodel opgenomen.

**Gevolg voor de catalogus:** beide adidas-modellen worden niet meer geadviseerd (geen modeljaar bij de bron; de Estro .75 LE ook geen bow-profiel). Ze blijven zichtbaar op `/sticks`.

**Betrokken bestanden:** `src/advice-engine/*`, `src/sources/*`, `src/content/stickwijzer/*`, `src/content/methodiek.ts`, `src/components/stickwijzer/*`, `src/app/stickwijzer/*`, `src/app/methodiek/page.tsx`, `src/catalog/types.ts`, `src/catalog/labels.ts`, `src/catalog/modelYear.ts`, `src/catalog/index.ts`, productbestanden (bow-profiel), `src/lib/analytics/events.ts`, `src/components/layout/Footer.tsx`.

## 2026-10-06 — bol.com Partnerprogramma gekoppeld

**Wat:** bol.com-knoppen gebruiken nu partnerlinks (`partner.bol.com/click/click`, site ID 1547833, tekstlink-formaat `f=TXL`) met een sub-ID per plek: `stickwijzer`, `productpagina`, `catalogus`, `vergelijk`. Het site ID staat als standaardwaarde in `src/lib/retailers.ts` en kan per omgeving worden overschreven met `NEXT_PUBLIC_BOL_PARTNER_SITE_ID`. Onder elke winkelknop staat een korte partnerlink-vermelding met een link naar de nieuwe sectie "Partnerlinks" op `/methodiek`; de privacyverklaring (v1.1) noemt de toeschrijving door bol.com.

**Geen wijziging aan de adviesregels:** de score heeft geen invoer voor vergoeding, marge of sponsoring; `ruleSetVersion` blijft gelijk.

**Betrokken bestanden:** `src/lib/retailers.ts`, `src/components/ui/RetailerLink(s).tsx`, aanroepen van `RetailerLinks`, `src/content/methodiek.ts`, `src/app/methodiek/page.tsx`, `src/content/privacy.ts`, `src/lib/analytics/events.ts`.

## 2026-10-06 — PassaSports verwijderd

**Wat:** de PassaSports-knoppen zijn van de site gehaald; bol.com (via het Partnerprogramma) is voorlopig de enige winkel. Reden: er is nu geen partnerprogramma voor PassaSports beschikbaar voor deze site. Methodiek en privacyverklaring zijn daarop aangepast.

**Betrokken bestanden:** `src/lib/retailers.ts`, `src/lib/retailers.test.ts`, `src/components/ui/RetailerLinks.tsx`, `src/content/methodiek.ts`, `src/content/privacy.ts`, `CLAUDE.md`.

## 2026-10-05 — Zaalsticks-sectie (nog niet live)

**Wat:** nieuw veld `discipline` (`veld` | `zaal`) op `Product`, met bron; producten zonder dit veld zijn veldsticks. Vijf echte zaalsticks toegevoegd (Grays PB10Xi, JB8Xi, DB7Xi, PB9i en Princess Competition JR 10 STAR Indoor), met specs van de merksites. Nieuwe pagina `/zaalsticks` met de spelregelverschillen uit de FIH Rules of Indoor Hockey (2023) en de stickeisen uit beide FIH-regelboeken, een redactionele keuzehulp in tekst en de zaalsticks uit de catalogus. `/sticks` toont nu alleen veldsticks, met een verwijzing naar de zaalsticks.

**Adviesregels:** de stickwijzer adviseert alleen veldsticks (`passesData` sluit zaalsticks uit). Er is geen zaal-route en geen zaal-scoring; `ruleSetVersion` blijft gelijk, omdat de uitkomst voor veldsticks niet verandert.

**Bekend gat:** de Princess-zaalstick heeft geen modeljaar bij de bron; dat is pas een probleem als zaalsticks ooit in een advies komen.

**Betrokken bestanden:** `src/catalog/types.ts`, `src/catalog/discipline.ts`, `src/catalog/index.ts`, `src/catalog/labels.ts`, `src/catalog/compare.ts`, vijf nieuwe productbestanden, `src/advice-engine/hardFilters.ts`, `src/content/zaal.ts`, `src/app/zaalsticks/page.tsx`, `src/app/sticks/page.tsx`, `src/app/sticks/[slug]/page.tsx`, `src/components/catalog/ProductSpecTable.tsx`, `src/components/layout/Header.tsx`, `src/app/sitemap.ts`, `src/app/llms.txt/route.ts`.

## 2026-10-05 — Zaalsticks aangevuld via bol.com (nog niet live)

**Wat:** zes zaalsticks toegevoegd op basis van bol.com-listings (`source: 'partner-shop'`): Grays 4i en 6i Dynabow, Scoop Indoor Mid Bow 20% Carbon, Scoop WDN Junior, The Indian Maharadja Arctic Wood en TK 3 Control Bow Junior. Daarmee komen er instapprijzen (vanaf €24,99) en juniormaten bij. Nieuwe merken in het model: Scoop, The Indian Maharadja en TK (alleen in het zaalassortiment; nog zonder merkprofiel op `/merken`).

**Bewust niet overgenomen:** het "verpakkingsgewicht" uit de listings (niet het stickgewicht) en bij de Grays 4i/6i de doelgroep "Kinderen", die botst met de titel "Senior" en de maten 36,5"/37,5". Prijzen zijn verkoopprijzen op bol.com op de controledatum, geen adviesprijzen.

**Geen wijziging aan de adviesregels:** zaalsticks blijven buiten de stickwijzer.

## 2026-10-05 — Veldsticks aangevuld via bol.com; kortere maat in de zaalkeuzehulp (nog niet live)

**Wat:** twaalf veldsticks toegevoegd op basis van bol.com-listings (`source: 'partner-shop'`), vooral junior (27", 28", 30"–36") en instapprijzen vanaf €19,99; nieuwe merken Osaka, Stag en Ritual. Tegenstrijdige of onbruikbare listinggegevens zijn weggelaten en per veld toegelicht (verpakkingsgewicht, "van"-prijzen, "Carbon" met 0% carbon, doelgroep "Kinderen" bij seniormaten, ontbrekend bow-type).

**Gevolg voor de stickwijzer:** alleen de twee listings met een seizoen in de titel (adidas Fabela .30 en Estro .60, 26/27) kunnen in een advies komen. De overige tien missen een modeljaar of bow-type en worden volgens §11 niet geadviseerd; ze staan wel in de catalogus en bij vergelijken. Geen wijziging aan de adviesregels zelf.

**Zaalkeuzehulp:** bestaat de geadviseerde maat voor een kind niet, dan toont de keuzehulp apart sticks die één maat korter zijn, met een waarschuwing — dezelfde regel als in de stickwijzer. Nooit langer.

## 2026-10-05 — `ruleSetVersion v5-2026-10-05`: onbekend modeljaar sluit niet meer uit

**Wat:** `unknown_model_year` is geen publicatieblokkade meer. Sticks zonder bevestigd modeljaar (vooral bol.com-listings) worden meegewogen en aangeboden zoals elke andere stick, met het aandachtspunt "Het modeljaar is niet bevestigd…" (`MODEL_YEAR_UNCONFIRMED`) en "Modeljaar: Niet bevestigd" op de kaart. De methodiekpagina is aangepast.

**Reden:** expliciete keuze van de eigenaar. Zonder deze wijziging bleef het gat in juniormaten (27"–33") in de stickwijzer bestaan, terwijl er passende sticks in de catalogus staan.

**Afwijking van de specificatie:** §11 noemt "onbekend modeljaar" als blokkade; dat volgen we hier bewust niet. Ontbrekend bow-profiel, ontbrekende bron, niet leverbaar en onlogische startermarkering blijven wel blokkades.

## 2026-10-06 — PostHog voor klikgedrag, funnels en heatmaps

**Wat:** PostHog (EU-cloud, Frankfurt; gratis plan, één project) naast Simple Analytics. Draait cookieloos (`cookieless_mode: 'always'`): geen cookies of browseropslag, geen sessie-opnames, geen persoonsprofielen. Legt paginaweergaven, kliks (autocapture), heatmaps en dead clicks vast, plus alle eigen events via `trackEvent`. Uit op localhost. Privacyverklaring bijgewerkt naar v1.2.

**Bewust niet:** sessie-opnames, omdat die toestemming en een banner vereisen. Pas overwegen als funnels en heatmaps een probleem tonen dat ze niet verklaren.

**In PostHog ingesteld door de eigenaar:** cookieless server hash mode, IP-adressen niet bewaren, autorisatie van het domein voor de toolbar.

## 2026-10-06 — Tweede blog en rijkere artikelopmaak

**Wat:** blog "Hockeystick kopen? Zo kies je een stick die bij je past" (`/blog/hockeystick-kopen`) toegevoegd als tweede blog. Artikelsecties ondersteunen nu naast alinea's ook lijsten, tabellen en een slotnotitie, plus inline **vet**, *cursief* en bronlinks (alleen http/https). Bestaande artikelen werken ongewijzigd. De blogoverzichtspagina toont de volgorde die de redactie kiest in plaats van nieuwste eerst.

**Redactioneel:** tekst van de eigenaar overgenomen. Alleen de opmaak is gelijkgetrokken: alle bowprofielen en alle vijf teststappen hebben nu een vetgedrukt label. Alle inline bronnen staan ook in de bronnenlijst onder het artikel.

## 2026-10-08 — SEO-verbeteringen: rolverdeling content, vergelijkbare sticks, nieuwe kennispagina's

**Aanleiding:** een SEO-review van de live site (stickpagina's dun en sjabloonmatig, kannibalisatie tussen drie artikelen over "hockeystick kiezen/kopen", geen stickwijzerlinks in de tekst, ontbrekende pagina's met eigen zoekintentie).

**Wat:**
- **Rolverdeling:** `/blog/hockeystick-kopen` is de hoofdpagina voor "hockeystick kopen/kiezen". `/kennis/hoe-kies-je-de-juiste-hockeystick` is nu "Hockeystick-begrippen uitgelegd" en `/blog/hockeystick-kiezen-praktische-tips` is nu "Zes veelgemaakte fouten". Beide linken naar de hoofdpagina. De URL's zijn bewust gelijk gebleven.
- **Nieuwe kennispagina's:** `/kennis/hockeystick-lengte-tabel` (tabel gegenereerd uit `LENGTH_GUIDE`, dezelfde bron als de stickwijzer), `/kennis/hockeystick-kinderen-en-beginners` en `/kennis/low-bow-vs-mid-bow`. Productlijsten en prijsbereiken in deze pagina's komen uit de catalogus, niet uit tekst. Nieuw overzicht `/kennis`; "Kennisbank" in het menu wijst daarheen.
- **Interne links:** elk artikel linkt in de tekst naar de stickwijzer en naar verwante pagina's. Een test bewaakt dat elke interne link naar een bestaande pagina wijst.
- **Vergelijkbare sticks** (`src/catalog/similar.ts`): elke stickpagina toont 2–3 sticks uit dezelfde discipline en maatgroep (junior/volwassen), gerangschikt op niveau, richtprijs, gedeelde lengtes en bow-profiel. De vergelijkingszin komt alleen uit catalogusdata; een ontbrekend gegeven wordt weggelaten, niet geschat.
- **Titels stickpagina's:** "[naam]: specs en advies".
- **Structured data:** Product kreeg merk als Brand, categorie, URL en afbeelding. Article en BlogPosting kregen publisher en mainEntityOfPage; de kennisauteur is nu Organization (was ten onrechte Person). Breadcrumbs van kennispagina's lopen via "Kennisbank".
- `/zaalsticks` gebruikt als title "Zaalsticks: zo kies je een hockeystick voor de zaal" in plaats van een aparte pagina "zaalhockeystick kiezen", om nieuwe kannibalisatie te voorkomen.

**Bewust afgeweken van het SEO-advies:**
- Geen "review" in de titel van stickpagina's: we testen de sticks niet zelf, dus dat zou misleidend zijn.
- Geen `offers` of prijs in de Product-markup: de prijs is een richtprijs en de verkoop gebeurt bij de partnerwinkel. Geen Review- of Rating-markup.
- De handgeschreven vergelijkende alinea per stick is nog niet gedaan. Die wacht op data uit Search Console over welke sticks impressies krijgen.

## 2026-10-08 — Blog "Met welke stick speelt Oranje?"

**Wat:** blog op basis van `oranje-dames-stickmerken.md` en `oranje-heren-stickmerken.md` van de eigenaar, als één verhaal over dames en heren (`/blog/met-welke-stick-speelt-oranje`). Elke vermelding staat erbij met hoe zeker die is (speelt met het merk / ambassadeur / medeontwikkelaar / historisch). Er worden geen exacte wedstrijdmodellen genoemd, geen foto's van spelers gebruikt en geen citaten opgenomen. Er staat ook nadrukkelijk bij dat de spelers de site niet aanbevelen. Het blok "Deze merken in onze catalogus" wordt uit de catalogus gegenereerd en zegt expliciet dat het niet de wedstrijdsticks van de spelers zijn.

**Linkbeleid (aangepast op verzoek van de eigenaar):** deze pagina bevat geen externe links. Bronnen staan alleen als tekst in de bronnenlijst onderaan, en PassaSports wordt niet in de lopende tekst genoemd. De tabellen tonen alleen het merk, plus een eigen collectie of medeontwikkeling als die er is. Informatie van vóór 2025 nemen we niet op (daarom staat Jip Janssen, met een vermelding uit 2020/2021, er niet in). PassaSports, Jumbo Sports en De Hockeywinkel staan voor andere pagina's wel op de `nofollow`-lijst.

## 2026-10-08 — Wekelijkse catalogus-controle en kwaliteitscontrole per PR

**Aanleiding:** eerste stap naar een agent-gedreven werkwijze. Agents doen voorstellen via pull requests; de eigenaar beoordeelt en merget.

**Wat:**
- `src/catalog/health.ts` controleert elke stick op: kwartaalcontrole nodig (een `lastVerifiedAt` ouder dan 3 maanden, bronbeleid §3), verborgen op de site (ouder dan 12 maanden, via `isProductActive`), ongeldige datum, testdata en ontbrekende productfoto. Alleen lezen; wijzigt geen data.
- `npm run catalog:health` drukt het rapport af. Het script draait op Node's eigen TypeScript-ondersteuning met een kleine resolve-hook (`scripts/ts-resolve.mjs`), zonder extra dependency zoals tsx.
- `.github/workflows/catalog-health.yml` draait elke maandag en houdt één GitHub-issue "Catalogus-controle" bij.
- `.github/workflows/ci.yml` draait lint, typecheck, tests en build bij elke PR. Dit is de kwaliteitspoort voor alle agent-PR's.
- `getCatalogProducts()` in `src/catalog/index.ts` geeft ook inactieve producten terug, alleen voor interne controles.

**Bewust niet:** controle op directe bol.com-productlinks. Alle sticks gebruiken nu bewust een zoeklink; dat pakt de feed-agent op zodra er toegang tot de bol.com Partner-API is.

## 2026-10-08 — Directe bol.com-productlinks

**Wat:** nieuw optioneel veld `bolProductUrl` per stick (alleen `https://www.bol.com/nl/nl/p/…`). Winkelknoppen linken via het Partnerprogramma direct naar die productpagina; zonder dit veld blijft het een zoekopdracht. Ingevuld voor de 20 sticks waarvan de bol.com-productpagina al als bron in de catalogus stond. Het event `retailer_click` heeft nu `linkType` (`product` of `search`), zodat we de conversie van beide kunnen vergelijken. De catalogus-controle meldt sticks die nog een zoeklink hebben.

**Let op:** een paar bol.com-pagina's zijn een specifieke maat (bijv. Brabo O'geez 28", Indian Maharadja Arctic Wood 36,5", Stag Magic 33", Scoop Indoor 36,5"). Op bol.com kan de bezoeker daar van maat wisselen; de feed-agent controleert straks of de pagina's nog bestaan.

## 2026-10-08 — bol.com feed-agent, testrun

**Wat:** `scripts/bol-feed-check.ts` (`npm run bol:feed-check`) zoekt elke stick op in de bol.com Marketing Catalog API (`https://api.bol.com/marketing/catalog/v1`, client-credentials via `login.bol.com`). Sticks met `bolProductUrl`: product-ID → EAN → titel, bol.com-prijs en aanbod. Sticks zonder: de drie beste zoekresultaten als kandidaten. De workflow "bol.com feed (testrun)" draait alleen handmatig en zet het rapport in één issue.

**Bewust niet:** de agent wijzigt niets. Kandidaten worden nooit automatisch gekoppeld en `priceIndicativeEur` blijft de adviesprijs van de fabrikant (CLAUDE.md, Testfase-scope). Of de site live bol.com-prijzen gaat tonen, is een apart besluit van de eigenaar.

**Sleutels:** `BOL_CLIENT_ID` en `BOL_CLIENT_SECRET` staan alleen als GitHub Secret; de site zelf heeft ze niet nodig.

## 2026-10-08 — Directe bol.com-links, tweede reeks (9 sticks)

**Wat:** `bolProductUrl` voor 9 sticks die de feed-testrun (issue #5) eenduidig bij bol.com vond: Grays JB 6, JB 10, PB 11+, Aura GT Junior, DB7Xi Indoor; Brabo Elite Five WTB LB, G-Force Elite X One LB JR; Princess Competition JR 3K 10 STAR, Premium JR 4K 10 STAR. Door de eigenaar goedgekeurd. Waar bol.com meerdere maten als aparte pagina heeft, is de eerste gekozen; op bol.com kan de bezoeker van maat wisselen. Daarmee hebben 29 van de 41 sticks een directe link.

**Open:** Brabo Elite X One LB en Grays PB9i Indoor (twijfelachtige match) en 9 sticks die bol.com niet verkoopt. Besluit van de eigenaar volgt.

## 2026-10-08 — "Niet verkrijgbaar bij bol.com"

**Aanleiding:** de feed-testrun (issue #5) vond 10 sticks niet bij bol.com. Hun winkelknop leidde naar een zoekopdracht met andere producten.

**Wat (besluit eigenaar):** nieuw optioneel veld `bolNotSold: { checkedAt }`. Voor die sticks toont de site "Niet verkrijgbaar bij bol.com" in plaats van een winkelknop, en de prijsvermelding wordt "Richtprijs · niet verkrijgbaar bij bol.com". Gezet voor: JDH X01, X93 en Junior Mid Bow; Princess Competition 1 Star Probow, Premium 4K 10 Star (senior), Competition JR 10 Star Indoor; Grays JB 12+, DB 10+, PB10Xi, JB8Xi. De catalogus-controle meldt ze apart. De feed-testrun blijft ze opzoeken, zodat zichtbaar wordt als bol.com ze alsnog gaat verkopen.

**Bewust niet:** de stickwijzer adviseert deze sticks nog steeds. Of ze uit de adviezen moeten, is een apart besluit.

## 2026-10-08 — Laatste twee bol.com-twijfelgevallen

**Besluit eigenaar:** Brabo Elite X One LB is dezelfde stick als "Brabo Elite X One Forged Carbon LB Bl/Or Senior" op bol.com en krijgt een directe link. Grays PB9i Indoor is niet dezelfde stick als "Grays 9i Probow Indoor" en wordt "niet verkrijgbaar bij bol.com". Sticks die bol.com niet verkoopt, blijven bewust in de stickwijzer-adviezen. Daarmee: 30 directe links, 11 niet verkrijgbaar, 0 zoeklinks.

## 2026-10-08 — Wekelijkse Search Console-agent

**Wat:** `src/seo/searchConsole.ts` analyseert Search Analytics-rijen (zoekwoord × pagina) van de laatste 28 dagen tegen de 28 daarvoor: totalen, "bijna pagina 1" (positie 5–20), "goed zichtbaar, weinig kliks" (top 5, CTR < 2%), nieuwe zoekwoorden en vertoningen per stickpagina. `scripts/search-console-report.ts` (`npm run seo:report`) haalt de data op als Google-service-account; de JWT wordt met Node's eigen crypto ondertekend, zonder Google-library. De workflow "Search Console-rapport" draait elke maandag en houdt één issue bij.

**Toegang:** secret `GSC_SERVICE_ACCOUNT_JSON`; het service-account heeft in Search Console alleen rechten "Beperkt" (lezen). Property: eerst `sc-domain:jouwhockeystick.nl`, anders `https://jouwhockeystick.nl/`; vast te zetten met de repository-variabele `GSC_SITE_URL`.

**Bewust niet:** de agent past geen titels of content aan. Hij levert de data voor de handgeschreven vergelijkende alinea's per stick (zie 2026-10-08, SEO-verbeteringen) en voor latere content-PR's.

## 2026-10-09 — Content-agent en artikel "Zaalstick voor kinderen"

**Content-agent:** `docs/content-agent.md` is het handboek voor alle content (agent en redactie): brief via een issue met label `content-brief`, eerst controleren op botsing met bestaande pagina's, catalogusdata in plaats van vaste tekst, bron per claim, en de controles vóór de PR. De agent draait als Claude Code GitHub Action (`.github/workflows/claude.yml`) op het Claude-abonnement van de eigenaar (secret `CLAUDE_CODE_OAUTH_TOKEN`), reageert op `@claude` in issues en PR's, en merget nooit zelf.

**Artikel:** `/kennis/zaalstick-voor-kinderen`, gekozen door de eigenaar met het oog op het zaalseizoen. Eigen zoekintentie (zaalstick voor een kind) naast `/zaalsticks` (zaalstick kiezen in het algemeen) en `/kennis/hockeystick-kinderen-en-beginners` (veldstick). Spelregelclaims komen uit dezelfde FIH-bronnen als `/zaalsticks`; de lijst juniorzaalsticks, prijsrange en lengtebereik worden uit de catalogus gegenereerd.

**Correctie:** in `/kennis/hockeystick-kinderen-en-beginners` stond "Een zaalstick is lichter en dunner dan een veldstick", zonder bron en in strijd met `/zaalsticks` (dezelfde maximale eisen). Vervangen door een verwijzing naar het nieuwe artikel.

**Bewust niet:** geen "beste zaalstick"-claims; het aanbod juniorzaalsticks is klein (3 sticks, 32–36 inch) en dat staat er eerlijk bij.
## 2026-10-09 — Agent-regiekamer (dashboard)

**Wat:** een dashboard in claude.ai dat laat zien welke agents er zijn (gebouwd en gepland), hoe vaak ze draaiden en met welke uitkomst, welke PR's ze maakten en wat de resultaten zijn (catalogus, Google). `scripts/agent-dashboard-data.ts` (`npm run dashboard:data -- <map>`) verzamelt de cijfers uit GitHub en de catalogus als JSON. Een geplande taak ververst het dashboard elke maandagochtend.

**Bewust niet:** het resterende Claude-tegoed van het abonnement; dat is niet uit te lezen. Het dashboard toont in plaats daarvan het aantal AI-runs en hun duur, en verwijst naar Instellingen → Gebruik in claude.ai.

## 2026-10-09 — Merkprofielen voor alle merken in de catalogus

**Wat:** /merken heeft nu een profiel voor alle 11 merken. Nieuw zijn Osaka, The Indian Maharadja, TK, Ritual, Scoop en Stag. De feiten komen van de eigen sites van de merken: de About-pagina's van Osaka, The Indian Maharadja en Ritual, het persbericht van TK Sports en de atletenpagina van Yibbi Jansen bij Osaka.

**Scoop en Stag:** voor deze twee merken vonden we geen officiële merkwebsite. Het profiel zegt dat eerlijk, verwijst naar de bol.com-listing als bron van de productgegevens en bevat geen achtergrond over het merk.

**Pagina:**
- De intro en de metadata noemen de merken nu dynamisch, in plaats van "vijf merken".
- Merken met alleen zaalsticks (Scoop) linken naar /zaalsticks, omdat het merkfilter op /sticks alleen veldsticks toont.
- Zonder logo staat de merknaam niet meer twee keer op de pagina.
- Een test bewaakt dat elk merk in de catalogus een profiel heeft.

## 2026-10-10 — Assortiment uitgebreid naar 73 sticks en 16 merken; PassaSports tijdelijk zonder koppeling

**Wat:** 32 sticks toegevoegd (`CATALOG_VERSION 2026-10-10`), gericht op de gaten in het assortiment:
- veldsticks in 24", 29" en 31";
- zaalsticks voor kinderen van 26" tot 30";
- veldsticks voor volwassen beginners onder €100;
- gevorderde sticks tussen €50 en €125;
- ervaren junioren.

**Merken:** Y1, Reece, Ravi, Csign en Malik zijn nieuw. Y1 en Reece hebben een merkprofiel van hun eigen site. Voor Ravi, Csign en Malik hebben we geen officiële merksite gevonden; hun profiel zegt dat eerlijk.

**Bronnen:**
- 26 sticks komen van bol.com-listings, elk met een directe partnerlink naar de productpagina.
- 6 sticks komen van PassaSports-productpagina's, omdat bol.com ze niet verkoopt. Dat is per stick nagezocht.
- Velden die elkaar in een listing tegenspreken, zijn weggelaten en uitgelegd in het sourceLabel, bijvoorbeeld een titel met "Pro bow" terwijl de specificaties "Mid bow" noemen.
- Bij PassaSports-sticks zonder niveau-vermelding is het niveau een redactionele inschatting, met de reden erbij.
- Bij PassaSports-sticks zijn geen productfoto's overgenomen, omdat er nog geen partnerschap is.

**PassaSports (tijdelijk):** de eigenaar regelt een affiliatekoppeling met PassaSports, naar verwachting op maandag 12 oktober.
- Tot die tijd heeft een stick die alleen PassaSports verkoopt (`bolNotSold` + `passaSportsProductUrl`, zie `isPassaSportsOnly`) geen koopknop, maar de melding "Te koop bij PassaSports — koppeling volgt".
- Zulke sticks worden in de stickwijzer gewoon meegewogen en kunnen als beste keuze uitkomen.
- Sticks die bol.com én PassaSports verkopen, houden hun bol.com-knop; de PassaSports-URL staat al klaar voor de koppeling.

**Test aangepast:** de enginetest voor "een maat korter" ging ervan uit dat er geen 31"-beginnersstick in de catalogus stond. Hij gebruikt nu een eigen gefilterde catalogus, zodat de test niet meer afhangt van het assortiment.

## 2026-10-10 — UX-ronde met UI/UX Pro Max

**Werkwijze:** de site is doorgelicht met de regels van de skill UI/UX Pro Max (v2.13.0). Daarbij is per pagina geautomatiseerd gemeten:
- schermbreedtes 375, 768, 1024 en 1440;
- tikdoelen, contrast en focus;
- koppen en horizontaal scrollen.

Het kleur- en lettertypeadvies van de skill (paars, Barlow) is niet overgenomen: de merkinstructie gaat voor.

**Aangepast:**
- **Toegankelijkheid:**
  - een duidelijke focusring in veldblauw, wit op de blauwe footer;
  - een skiplink "Direct naar de inhoud";
  - `prefers-reduced-motion` wordt gerespecteerd;
  - handcursor op knoppen, die Tailwind v4 standaard weghaalt.
- **Navigatie:**
  - op mobiel een menuknop met een lijst van 44 px-tikdoelen, in plaats van twee rijen kleine links van 20 px hoog (onder de WCAG-ondergrens van 24 px);
  - de huidige pagina is gemarkeerd (`aria-current`).
- **Tikdoelen van minimaal 44 px:**
  - merkfilters op /sticks;
  - formuliervelden en de toestemmings-checkbox op /interesse;
  - de keuzelijsten op /vergelijk;
  - de bronlinks op /merken (minimaal 24 px).
- **Structuur:** /sticks heeft een H2 boven de lijst, zodat er geen kopniveau meer wordt overgeslagen. Op mobiel staat het woordmerk niet meer dubbel boven de vouw (header én hero).

**Afwijking van de merkinstructie:** op mobiel is het header-icoon 26 px in plaats van 32 px, zodat logo, Stickwijzer-knop en menuknop tot 360 px op één rij passen. Het woordmerk is daardoor 138 px breed, 2 px onder het minimum van 140 px uit §4.1.

## 2026-10-11 — Artikel "Kun je met een veldstick zaalhockeyen?"

**Wat:** `/kennis/veldstick-zaalhockey` (issue #16). Eigen zoekintentie: mag en kan een veldstick in de zaal, voor alle spelers. Botst niet met `/zaalsticks` (zaalstick kiezen in het algemeen) en `/kennis/zaalstick-voor-kinderen` (kinderen); beide zijn in de tekst gelinkt. Spelregelclaims komen uit dezelfde FIH-bronnen; de zaalstickprijs komt uit de catalogus.

**Bewust niet:** de brief had geen ingevulde hoofdvraag of doelgroep; de titel is als hoofdvraag gebruikt. Geen uitspraken over club- of competitieregels (niet te verifiëren; verwezen naar de club) en geen prestatieclaims over zaal- versus veldsticks.
## 2026-10-11 — Technical SEO-agent

**Wat:** `src/seo/technicalSeo.ts` (pure functies, met tests) en `scripts/technical-seo.ts` (`npm run seo:technical`) controleren elke pagina uit de live sitemap: status 200, doorverwijzingen, noindex, title en meta description (aanwezig, lengte, uniek), canonical gelijk aan de URL, precies één H1, afbeeldingen zonder alt-tekst en laadtijd. Daarna worden alle interne links op die pagina's gecontroleerd op kapotte bestemmingen. Workflow "Technical SEO" draait elke maandag en houdt één issue bij; wijzigt een PR de controle zelf, dan zet hij het rapport op die PR.

**Waarom nu:** Google heeft de site nog niet geïndexeerd; technische fouten (noindex, verkeerde canonical, kapotte links) zijn dan het eerste om uit te sluiten.

**Bewust niet:** externe links (bol.com en bronnen) worden niet gecontroleerd; partnerlinks en merksites blokkeren of beperken geautomatiseerde verzoeken. Geen Core Web Vitals; de laadtijd is alleen die van de HTML.

## 2026-10-11 — Orchestrator

**Wat:** `.github/workflows/orchestrator.yml` draait elke maandag na de rapporten (Claude Code GitHub Action, abonnement van de eigenaar). Hij volgt `docs/orchestrator.md`: leest de rapporten, lopend werk, bestaande content, catalogus en eerdere besluiten; zet maximaal 2 content-briefs uit (labels `content-brief` + `voorstel`) en één issue "Weekplanning". Hij mag alleen lezen en issues maken, sluiten en becommentariëren.

**Goedkeuring:** briefs bevatten geen `@claude`. De eigenaar keurt een brief goed met de reactie `@claude akkoord`; pas dan schrijft de content-agent. Dat houdt kwaliteit en Claude-tegoed in de hand, en voorkomt dat agents elkaar eindeloos aansturen.

## 2026-10-11 — E-mail en nieuwsbrief: Brevo (later)

**Besluit eigenaar:** EU-proof werken; als het zover is wordt het **Brevo** (Frans, data in de EU volgens Brevo; let op een Amerikaanse subverwerker, te controleren in de verwerkersovereenkomst). Resend viel af (VS). Plan, in deze volgorde: aanmeldformulier met dubbele opt-in en aanpassing privacyverklaring (expliciete opdracht eigenaar nodig), lijst-bewaker (script), nieuwsbrief-agent vanaf ±50 inschrijvers (concept in Brevo, eigenaar verstuurt), inbox-agent via Brevo Inbound Parsing op een apart subdomein zodat `info@` ongemoeid blijft. Beide AI-agents staan als "Gepland" in de Agent-regiekamer.

**Optie n8n (besproken 2026-10-11, geparkeerd):** nu niet toevoegen; GitHub Actions + Claude dekken plannen, rapporten en PR's, en een tweede platform kost alleen onderhoud. Heroverwegen in de Brevo-fase, voor het koppelen van losse apps (interesseformulier → Brevo/sheet, binnenkomende mail → agent, eventueel social). Eerst kijken of de automatiseringen van Brevo volstaan; zo niet, dan n8n in een EU-variant (zelf gehost in de EU of n8n Cloud; hostinglocatie dan controleren).

## 2026-10-11 — Artikel "Zaalstick: wat krijg je voor een klein of ruim budget?"

**Wat:** `/kennis/zaalstick-budget` (issue #20). Legt per prijsniveau (onder €50, €50–100, vanaf €100) uit wat de catalogus noemt aan carbon, bow-profiel en maten; alle cijfers en lijsten worden uit de catalogus gegenereerd. Botst niet met `/zaalsticks` (spelregels, lengte, selectie) en `/kennis/zaalstick-voor-kinderen` (kinderen); beide zijn gelinkt. Zaalsticks die niet bij bol.com te koop zijn staan erbij vermeld.

**Bewust niet:** geen "beste"-lijst, geen kortingsclaims, geen claim dat een duurdere stick beter speelt, geen herhaling van spelregels en lengte. Ontbreekt een gegeven in de bron, dan staat dat er zo en wordt het niet geraden.

## 2026-10-11 — Marktverkenner

**Wat:** elke maandag (vóór de Orchestrator) leest `scripts/market-scan.ts` (`npm run market:scan`) de openbare sitemaps van PassaSports, Daka en Vrijbuiter (alleen pagina's met "hockey" in het pad) en de 50 populairste resultaten voor "hockeystick" en "zaalhockeystick" via de bol.com-API. Hij vergelijkt met vorige week (bewaard op de branch `data/marktverkenning`, zonder deploy) en zet het rapport in één issue met label `marktverkenning`. Bij wijzigingen plaatst Claude een korte duiding (max. 5 punten) als reactie. De Orchestrator leest dit mee.

**Concurrenten (keuze eigenaar):** bol.com, PassaSports, Daka, Vrijbuiter.

**Netjes scrapen:** alleen sitemaps en robots.txt, één site tegelijk, 2 seconden tussen verzoeken (de crawl-delay van PassaSports), eigen user-agent met contact-URL, maximaal 80 sitemapbestanden per site, één keer per week. Geen productpagina's of prijzen van concurrenten ophalen.

**Bewust niet:** het GEO-scorebord (AI-zichtbaarheid via OpenRouter) staat op de plank tot de eigenaar het vraagt.

## 2026-10-11 — Homepage: zaalseizoensband, compactere hero en logo-animatie

**Aanleiding:**
- De homepage had niets voor zaalbezoekers, terwijl de stickwijzer alleen veldsticks adviseert.
- Op een 14"-laptop stond alles onder de hero onder de vouw.

**Wat:**
- **Seizoensband (versie A, live):** "Het zaalseizoen komt eraan", direct onder de hero. De knop gaat naar de zaalkeuze (`/zaalsticks`), met een tekstlink naar *Zaalstick voor kinderen*.
  - De band staat er alleen van oktober tot en met februari. De homepage wordt dagelijks opnieuw opgebouwd (`revalidate`), dus de band gaat vanzelf aan en uit.
  - De knop is veldblauw: oranje blijft voor de stickwijzer (merkinstructie).
- **Versie B** ("Een goede stick begint bij jouw spel", met de zaalstick als bijzondere stick) staat klaar in de code. Wisselen kan met `HOME_INTRO_VARIANT` in `src/content/home.ts`.
- **Meten:** `home_block_click` (block, target), om in PostHog te zien wat de band toevoegt naast `quiz_start`.
- **Hero compacter:** het grote icoon is 176 px (was 256, nog boven het minimum van 128 px voor boog en grip uit §3.2). Het woordmerk met pay-off blijft (§5), maar kleiner. Op 1440×780 staat de band volledig in beeld; op 1366×650 de titel en de knop.
- **Logo-animatie:** de stick schept de bal uit de krul naar zijn plek als punt van de j.
  - Eén vloeiende, gesamplede curve en één keer afgespeeld, in ongeveer 1,7 s.
  - De stick draait nooit (§4.2); het eindbeeld is precies het logo.
  - Bij "minder beweging" wordt de animatie niet afgespeeld.

## 2026-10-11 — Content inplannen met een publicatiedatum

**Besluit eigenaar:** content moet vooruit gemaakt kunnen worden en op een gekozen datum live gaan.

**Hoe:** `publishedAt` (JJJJ-MM-DD, Nederlandse tijd) is de publicatiedatum. Daarvóór staat een pagina niet op de live site: niet als pagina, niet in overzichten, sitemap of `llms.txt` (`src/content/schedule.ts`). Op Netlify-previews is hij wel te zien, met de melding "Gepland voor …". De workflow *Geplande publicatie* kijkt elke ochtend (±06:00) of er iets live moet en laat Netlify dan opnieuw bouwen via de build hook (secret `NETLIFY_BUILD_HOOK`; 15 credits per publicatiedag). De planning staat in een issue met label `publicatieplanning` en op de Agent-bediening onder *Gepland*.

**Datum meegeven:** veld *Publicatiedatum* in het brief-sjabloon en in het formulier op de bediening; in een open PR met `@claude zet de publicatiedatum op JJJJ-MM-DD`.

**Regel:** een live pagina linkt niet naar een geplande pagina (test).

## 2026-10-11 — Catalogus-aanvuller

**Wat:** elke dinsdag (na de Marktverkenner) zoekt `npm run catalog:gaps` populaire sticks uit de bol.com-toplijsten die niet in de catalogus staan, met productgegevens uit de bol.com-API. Claude voegt er maximaal 2 toe volgens `docs/catalogus-aanvuller.md` (merksite eerst, anders bol.com als `partner-shop`; specs alleen met bron) en de workflow opent één PR (`catalogus/<datum>`). Eén catalogus-PR tegelijk: staat er nog een open, dan slaat hij de week over. De eigenaar merget.

**Waarom:** een stick die niet in de catalogus staat, kan de stickwijzer niet adviseren en levert dus geen klik naar bol.com op. De Marktverkenner liet zien dat o.a. de Grays DB 5 (#1 op bol.com) ontbrak.

**Techniek:** PR's die met het workflow-token worden geopend starten zelf geen andere workflows; de workflow start daarom de Kwaliteitscontrole (`ci.yml`, nu ook `workflow_dispatch`) zelf op de branch.

## 2026-10-12 — Clubpagina en Club-outreach

**Besluit eigenaar:** inzetten op organische groei, geen advertenties. Hockeyclubs zijn de grootste hefboom: zij krijgen elk seizoen de vraag "welke stick moet mijn kind hebben?".

**Wat:** pagina `/clubs` ("Stickadvies voor nieuwe leden van jouw hockeyclub") met een printbare lengtetabel (uit `LENGTH_GUIDE`, dus gelijk aan de stickwijzer), een tekst voor de nieuwsbrief en eerlijke uitleg over de bol.com-vergoeding. Header en footer verdwijnen bij printen. Link in de footer; in de sitemap.

**Club-outreach-agent:** geplande taak (dinsdag, of op verzoek) die volgens `docs/club-outreach.md` per run max. 5 clubs zoekt via de KNHB-clubfinder en per club een persoonlijke mail klaarzet op de privépagina *Club-outreach*. Alleen algemene rol-adressen van de club, geen namen van personen, afmeldzin in elke mail, één herinnering na 14 dagen. **De eigenaar verstuurt elke mail zelf**; de agent verstuurt niets. De clublijst staat in de privé-database van die pagina, niet in deze (openbare) repo.

## 2026-10-12 — Instagram-studio

**Besluit eigenaar:** organisch groeien via Instagram (en Facebook, zakelijk), twee weken vooruit gepland, met een kwartaalplan voor de grote thema's. De eigenaar plaatst zelf (of plant in via Meta Business Suite).

**Hoe:** een aparte pagina *Instagram-studio* (claude.ai-artifact, naast de Agent-bediening) met de planning van de komende 14 dagen, het kwartaalplan, nieuwe modellen van de merken en losse posts. Een geplande taak (de Instagram-planner) vult elke vrijdag de lege dagen (di Kiezen, do Zaal/Veld, za Bewaren) en houdt het kwartaalplan 3 maanden vooruit bij, volgens `docs/instagram.md`. De studio tekent de slides zelf in de huisstijl (1080 × 1350, met een marge die ook een vierkante uitsnede overleeft) en biedt ze aan om te downloaden.

**Bewust niet:** automatisch plaatsen (vraagt een goedgekeurde Meta-app), de Meta Pixel op de site (vraagt cookietoestemming en een aangepaste privacyverklaring), prijzen of voorraad in posts (een geplaatste post wordt niet bijgewerkt), spelers en citaten, verzonnen groeidoelen. Meten gaat via de UTM-link in PostHog en Simple Analytics.

## 2026-10-12 — Instagram (@jouwhockeystick): link en postsblok

**Wat:**
- **Link:** "Volg ons op Instagram @jouwhockeystick" staat in de footer. De Organization-JSON-LD heeft `sameAs` met het profiel; die link is ook zichtbaar op de pagina.
- **Postsblok op de homepage** (`InstagramFeed`), onder de uitgelichte sticks. Het toont de laatste 6 posts, met een link naar de post zelf.
  - Het blok verschijnt pas als er posts zijn én een toegangstoken is ingesteld; daarvoor toont de site niets.
  - Bij een fout (bijvoorbeeld een verlopen token) verdwijnt het blok stil; de pagina breekt nooit.

**Hoe:**
- De officiële Instagram API with Instagram Login (`graph.instagram.com`, `/me/media`). Daarvoor zijn een professioneel Instagram-account en een Meta-app van het type Business nodig.
- Het token staat alleen als omgevingsvariabele `INSTAGRAM_ACCESS_TOKEN` in Netlify, nooit in de code.
- De lijst wordt elk uur opnieuw opgehaald, omdat de afbeeldings-URL's van Instagram verlopen.

**Privacy:** de afbeeldingen lopen via de eigen afbeeldingsoptimalisatie van de site (`next/image`, alleen `*.cdninstagram.com` en `*.fbcdn.net` zijn toegestaan). Bezoekers laden daardoor niets rechtstreeks van Meta, en er komen geen scripts of cookies van Instagram op de site. De privacyverklaring hoeft daarom niet te veranderen. Er is bewust geen Instagram-embedscript gebruikt: dat laadt code en cookies van Meta.

**Openstaand:** het token verloopt na 60 dagen. Het moet daarvóór worden ververst (handmatig, of later met een geplande GitHub-workflow die het via de Netlify-API bijwerkt).

## 2026-10-12 — Marktverkenner volgt ook nieuwe modellen bij de merken

**Wat:** de Marktverkenner leest naast de winkels nu ook de openbare sitemaps van de eigen webshops van Grays, Princess, Brabo en JDH. Daarvan bewaart hij alleen productpagina's die waarschijnlijk een stick zijn (geen ballen, tassen, schoenen, kleding of bescherming; `brandProductUrls`). Nieuwe productpagina's verschijnen in het wekelijkse rapport onder "Nieuw bij <merk> (merk)". De eerste week is een nulmeting.

**Waarom:** nieuwe modellen (bijv. de collectie voor het volgende seizoen) zo vroeg mogelijk zien, voor de catalogus en voor Instagram ("nieuw in de catalogus").

**Netjes scrapen:** dezelfde regels als voor de winkels: alleen robots.txt en sitemaps, één site tegelijk, 2 seconden tussen verzoeken, één keer per week. adidas.nl blokkeert geautomatiseerde toegang en wordt niet gelezen.

## 2026-10-12 — `ruleSetVersion v6-2026-10-12`: vraag over linkshandige stick verwijderd; startscherm compacter

**Wat:**
- De vraag "Is een linkshandige (omgekeerde) stick nodig?" is uit alle drie de routes gehaald, met alles wat eraan hing:
  - de verwijsregel in de engine (bij "ja" geen sticks maar een doorverwijzing naar persoonlijke hulp);
  - het veld `referral` in het adviesresultaat;
  - de tekst en het resultaatscherm voor die doorverwijzing.
  - Oude antwoorden die nog in de sessie staan, worden door het schema genegeerd.
- **Startscherm:** de routeblokken tonen alleen naam en aantal stappen; "Voor wie", "Waar we op letten" en "Wat je krijgt" staan in een uitklapper. De uitleg over de route staat nu boven de blokken, zodat de knop "Start" (was "Volgende") direct onder de blokken staat.

**Reden:** keuze van de eigenaar; de vraag is voor de doelgroep niet relevant.

**Afwijking van de specificatie:** de complete-instructie noemt linkshandigheid als uitzondering met doorverwijzing. Die volgen we hier bewust niet meer. Elke stick in de catalogus is een reguliere (rechtse) stick.

## 2026-10-12 — Nieuwe schrijfstijl: vriendelijker, en bronnen alleen onderaan

**Wat:** alle 3 blogs en 7 kennisbankartikelen zijn herschreven in een vriendelijkere, persoonlijkere en levendigere toon.
- Bronvermeldingen in de lopende tekst ("[Bron: …]", "volgens een hockeywinkel …", "in de bron") zijn weg; de onderbouwing staat alleen nog in de bronnenlijst onder het artikel.
- Feiten, interne links, catalogusdata en de hoofdvraag in de eerste 80 woorden zijn gebleven.
- Ook de automatisch gegenereerde zinnen in *Zaalstick: wat krijg je voor een klein of ruim budget?* zijn aangepast.

**Huisstijl:** `docs/content-agent.md` §3 beschrijft de nieuwe toon met voorbeelden, en de regel "bronnen onderaan, niet in de tekst". Een test (`src/content/articles.test.ts`) bewaakt dat er geen externe links of "[Bron:" in de tekst staan en dat elk artikel bronnen heeft.

**Reden:** keuze van de eigenaar; de teksten waren te zakelijk.

## 2026-10-12 — `ruleSetVersion v7-2026-10-12`: merk van de huidige stick en merkvoorkeur

**Wat:** twee nieuwe, optionele vragen op het scherm "Huidige stick", in alle routes. Ze verschijnen alleen als de speler al een stick heeft.
- "Van welk merk is de huidige stick?" — de merken uit de catalogus, plus "Ander merk" en "Weet ik niet".
- "Wil je bij hetzelfde merk blijven?" — "Ja, liefst hetzelfde merk" of "Maakt niet uit". Deze vraag verschijnt alleen als het merk bekend is.

**Regel (keuze eigenaar: zwaar meewegen, maar altijd een alternatief):**
- Bij "Ja, liefst hetzelfde merk" krijgen sticks van dat merk +12 punten (`BRAND_PREFERENCE_POINTS`, `brandFit` in de score). Het totaal blijft maximaal 100. De reden `BRAND_PREFERENCE` staat zichtbaar bij de stick.
- De best passende stick van dat merk staat altijd in het advies als hij redelijk past (≥ 60 punten). Haalt hij de top niet op eigen kracht, dan krijgt hij de rol "Van je huidige merk".
- Zijn alle getoonde sticks van dat merk, dan komt de best passende stick van een ander merk erbij als "Alternatief van een ander merk".
- Past geen enkele stick van het merk, dan zegt het advies dat eerlijk en toont het andere merken.
- Bij "Maakt niet uit", "Ander merk", "Weet ik niet" of zonder huidige stick verandert er niets.

De methodiekpagina is bijgewerkt met de nieuwe rollen.

**Onderzocht: waarom Grays zelden de beste match is** (simulatie met 435 antwoordcombinaties):
- Grays is het grootste merk bij de kandidaten en komt het vaakst voor in het advies, maar is maar in 10% van de gevallen de beste match.
- Oorzaak 1, assortiment: onze Grays-veldsticks zitten aan de twee uitersten (goedkope beginnerssticks voor junioren, en sticks van €350–450 voor ervaren spelers). In 104 scenario's komt geen enkele Grays door de filters.
- Oorzaak 2: Grays vermeldt geen carbonpercentages. Daardoor scoort "stickgevoel" neutraal (0,5), wat in de prestatieroute gemiddeld 6 punten scheelt.
- Getest en verworpen: het gevoel afleiden uit het niveau maakt het voor Grays slechter, want veel Grays-sticks zijn voor ervaren spelers en worden dan als "direct" gelezen.
- De prijs is geen oorzaak: de beste match is in 19% van de gevallen de goedkoopste kandidaat. Prijs telt alleen mee bij een gelijke score.

## 2026-10-13 — catalogus `2026-10-13`: 11 Grays-veldsticks in het middensegment

**Wat:** de gaten in het Grays-assortiment zijn gevuld met DB 6, DB 8, DB 10, JB 8, PB 8, MB 7, MB 8, AC500, AC600, AC700 en AC800 (€125–350). Er is geen merkbonus en de adviesregels zijn niet gewijzigd. Grays moet het halen op passende sticks, niet op voorrang.

**Bronnen, per gegeven:**
- Bow, maten, adviesprijs, afbeelding en (waar Grays het noemt) niveau komen van de productpagina's van Grays. Noemt Grays geen niveau, dan staat er een gelabelde redactionele inschatting met de reden erbij.
- Carbon komt uit het bronnenoverzicht van de eigenaar (Grays_hockeysticks_Claude.pdf). Alleen expliciet genoemde waarden zijn ingevuld: DB 8 en JB 8 (70%). Beperkt bevestigde, tegenstrijdige of onbekende waarden zijn bewust leeg gelaten, met de reden als comment in het productbestand. Niets is afgeleid uit de naam of uit een buurmodel.
- bol.com geldt alleen voor de leverbaarheid en de link. De Grays-listings op bol.com tonen standaardwaarden ("Beginner", "0% carbon", "Kinderen") die Grays en speciaalzaken tegenspreken.
- Niet opgenomen: PB 7+ (bol.com noemt "PB 7+", Grays "PB 7"; mogelijk een ander model) en JB 9 (niet leverbaar bij bol.com).

**Effect** (dezelfde simulatie met 435 combinaties):
- Grays als beste match: van 44 naar 54. Grays staat nu op de vierde plek, het was de zesde.
- Grays in het advies: van 238 naar 294 plaatsen.
- Achterstand van de beste Grays op de beste match: van 8,2 naar 7,6 punten.
- Nog open: in de prestatieroute kost het onbekende carbonpercentage een Grays-stick gemiddeld 7,5 punten op stickgevoel. De grootste volgende winst is het verifiëren van carbonpercentages bij Grays zelf, en niet een aanpassing aan de regels.

## 2026-10-13 — `ruleSetVersion v8-2026-10-13`: nieuwe lengtetabel

**Aanleiding:** we hebben onze tabel vergeleken met de maattabel van Grays en met een tweede tabel die de eigenaar vond (bron onbekend, alleen als controle gebruikt). Bij kinderen adviseert Grays 1–2 inch langer dan wij, en de tweede tabel ongeveer 1 inch korter. Onze tabel zit ertussen en blijft daarom het uitgangspunt. Voor lange spelers adviseren beide bronnen 37,5 en 38,5 inch, terwijl wij altijd 36,5 adviseerden.

**Wat:**
- Nieuwe rijen: 37,5 inch vanaf 185 cm en 38,5 inch vanaf 193 cm. Die grenzen volgen ongeveer Grays (184/193). De tweede tabel legt de grenzen lager (179/189); dat vangen we op met het alternatief.
- Elke rij met één maat noemt nu ook een maat die kan passen:
  - Kinderen (tot 163 cm): altijd de kortere buurmaat, nooit een langere. Zo blijft "niet op de groei kopen" overeind.
  - Volwassenen: de buurmaat aan de dichtstbijzijnde kant, dus 35 of 37,5 bij 36,5.
- Merken die alleen even maten maken, zoals de Grays Aura (26/28/30/32/34), vallen zo niet meer weg op één inch.
- De onzekerheid stijgt niet door deze buurmaat. Alleen op de onderste grens van een rij blijft de melding "op de grens tussen twee maten" staan.
- De tabel op /kennis/hockeystick-lengte-tabel komt uit dezelfde bron (`LENGTH_GUIDE` en `alsoFitsInch`) en heeft een kolom "Kan ook passen". Grays staat als bron onderaan.

**Gevolg:** de aparte "een maat korter"-fallback wordt bij kinderen bijna nooit meer gebruikt, omdat de kortere maat nu gewoon meetelt. Een stick in de buurmaat scoort wel lager op maat dan een stick in de hoofdmaat.

## 2026-10-13 — melding als er geen ambitieuze keuze is

**Wat:** heeft het advies geen "ambitieuze keuze", dan staat onder de sticks waarom niet (`noAmbitiousReason` in het adviesresultaat):
- `no_step_up`: in deze maat en dit budget is er geen stick die een verantwoorde stap verder gaat dan de beste match.
- `weak_fit`: zulke sticks zijn er wel, maar ze scoren onder de 60 punten.
- `brand_preference`: de plek is gebruikt voor een stick van het huidige merk of van een ander merk.

De adviesregels zelf zijn niet veranderd.

**Reden:** keuze van de eigenaar. Een ontbrekende derde stick moet niet lijken op een fout.

**Onderzocht: komt Brabo te vaak als beste uit?** Over alle profielen niet (54 van 426). Bij ervaren volwassenen met een budget vanaf €125 wint de Brabo Elite Five WTB LB wel in 33–64% van de gevallen. De reden: Brabo noemt hem zelf "for experienced players" en vermeldt expliciet 50% carbon. Daarmee is hij een van de weinige sticks in €125–250 met een bevestigd niveau "ervaren" én een bekend carbonpercentage. Concurrenten met een onbekend carbonpercentage krijgen de helft van de punten voor stickgevoel. Dit is niet aangepast: de data klopt, en een correctie per merk zou het advies sturen. De hefboom is meer geverifieerde carbonpercentages bij andere merken.

## 2026-10-13 — Conversie-rapport en Review-agent

**Conversie-rapport:** `src/analytics-report/conversion.ts` (pure functies, met tests) en `scripts/conversion-report.ts` (`npm run analytics:report`) halen elke maandag vóór de Orchestrator via de PostHog Query API (EU) de laatste 7 volle dagen op, naast de 7 daarvoor. Het rapport toont de stickwijzer-trechter, het afhaken per vraag (verplichte vragen in alle routes, in de volgorde van de START-route), de uitkomst van het advies (match of de reden van geen match), kliks naar bol.com per plek, linktype, stick en pagina, de homepage-blokken en dead en rage clicks. Bovenaan staan automatische signalen met lage drempels, omdat de site jong is. De workflow "Conversie-rapport" houdt één issue bij met label `conversie`; de Orchestrator leest het mee en zet signalen onder *Voor jou*.

**Meten zonder cookies:** PostHog draait cookieloos met een server-hash die elke dag wisselt. Een bezoeker is daardoor binnen een dag te volgen, niet over meerdere dagen; de trechter telt "bezoeker-dagen". Bewust geen cookies: een toestemmingsbanner maakt de data bij weinig verkeer kleiner en scheef, en de verkoop telt bol.com zelf. Heroverwegen bij ±1.000 stickwijzer-starts per maand en een vraag die alleen data over meerdere dagen beantwoordt. In cookieloze modus draait het botfilter van PostHog niet; het rapport filtert zelf bekende bot-user-agents en alle adressen behalve jouwhockeystick.nl (zoals Netlify-previews).

**Toegang:** secret `POSTHOG_PERSONAL_API_KEY` (personal API key met alleen "Query Read"), variabele `POSTHOG_PROJECT_ID`.

**Review-agent:** `.github/workflows/review.yml` beoordeelt elke PR die `src/content/` of `src/catalog/` raakt volgens `docs/review-agent.md`: brief, botsing met bestaande pagina's, bron per claim, geen vaste productcijfers in tekst, verboden taal, linkbeleid, en bij catalogus-PR's een steekproef van de specs tegen de bron (WebFetch). Hij zet één reactie in de PR (✅ of ⚠️ met genummerde punten) en werkt die bij een volgende run bij. Opnieuw beoordelen: label `herbeoordeel`. De Catalogus-aanvuller start de review zelf, omdat zijn PR's geen andere workflows starten.

**Bewust niet:** de review-agent wijzigt niets, keurt niets goed en schrijft nooit `@claude` (de workflow haalt het ook weg), zodat agents elkaar niet eindeloos aansturen. De eigenaar beslist of de content-agent de punten oplost. Geen review op pure code-PR's en niet op PR's uit forks.

## 2026-10-13 — Distributie via de Instagram-planner

**Besluit eigenaar:** geen aparte distributie-agent. De Instagram-planner (geplande Claude-taak, elke vrijdag; zie 2026-10-12 — Instagram-studio) doet de distributie. Een /kennis- of /blog-pagina waarvan `publishedAt` in de afgelopen 7 dagen valt en die nog geen post heeft, krijgt de eerstvolgende lege postdag (di, do of za); hooguit twee per run. De zes-weken-regel geldt daar niet. Daarna vult de planner de overige lege dagen zoals voorheen.

**Dashboard:** de rij "Distributie" in de Agent-regiekamer heet nu "Instagram-planner (distributie)" met status *Actief*. De taak draait niet in GitHub Actions, dus het dashboard toont geen runs voor deze rij.

**Bewust niet (nog):** Pinterest (staat op "later"), de nieuwsbrief (wacht op Brevo) en clubs (outreach staat op pauze). De eigenaar plaatst posts zelf; er gaat niets automatisch online.

## 2026-10-13 — Bow-profielvisual in "Low bow of mid bow"

**Wat:** een interactieve, schematische figuur op `/kennis/low-bow-vs-mid-bow`: kies een profiel (standaard, mid bow, pro bow/dynabow, low bow, extreme low bow) en zie waar het diepste punt van de kromming ongeveer ligt, met de andere profielen vaag ter vergelijking en de FIH-grens van 25 mm als lijn. Inline SVG, geen nieuwe dependency. Event `figure_interaction` om te zien of bezoekers de figuur gebruiken.

**Waarom zo:** naar aanleiding van de vraag of we sticks in 3D kunnen tonen (img2threejs). Een 3D-model per stick, nagetekend uit een productfoto, zou het bow-profiel raden en is dan een productclaim zonder bron; daarnaast beeldrechten en extra gewicht op mobiel. Een generieke uitleg zonder productkoppeling heeft die bezwaren niet.

**Bewust niet:** geen koppeling aan specifieke sticks en geen millimeters per profiel. De plek van het diepste punt is een redactionele weergave die het artikel volgt, geen meting; elk profiel is even diep getekend. Dat staat onder de figuur.

## 2026-10-14 — TikTok als test, met kort adres `/tiktok`

**Besluit eigenaar:** TikTok krijgt geen eigen strategie, maar een test van zes weken: de Reels voor Instagram gaan op dezelfde dag ook op TikTok (@jouwhockeystick). Evaluatie eind januari op sitebezoek per Reel uit TikTok tegenover Instagram; zie `docs/instagram.md` §9.

**Waarom niet meer:** de doelgroep (ouders van jeugdspelers) zit vooral op Instagram en Facebook; TikTok-gebruikers in Nederland zijn overwegend jonger dan 35, en jeugdspelers zijn een gevoelige doelgroep voor affiliate-content. Een eigen kanaal kost de eigenaar extra handwerk. Hergebruik van Reels kost vrijwel niets.

**Kort adres:** het account is persoonlijk (de zakelijke variant vraagt bedrijfsverificatie) en heeft geen klikbare link. De bio noemt daarom `jouwhockeystick.nl/tiktok`; dat adres stuurt tijdelijk (307) door naar `/stickwijzer` met UTM-tags voor TikTok (`next.config.ts`), zodat het bezoek in PostHog te herkennen is.

**Bewust niet:** de TikTok-pixel of een koppeling met TikTok Business (vraagt cookietoestemming en een andere privacyverklaring), promoten, bedrijfsverificatie.

## 2026-10-14 — Catalogus-hercontroleur

**Aanleiding:** de catalogus-controle meldt sticks die aan hun kwartaalcontrole toe zijn (bronbeleid §3), maar niemand voerde die uit. Bijna de hele catalogus (±87 sticks, gecontroleerd tussen 26 september en 13 oktober) valt tussen 26 december en 13 januari tegelijk aan.

**Wat:** `src/catalog/recheck.ts` (met tests) en `npm run catalog:recheck` kiezen elke week de sticks waarvan de kwartaalcontrole binnen 28 dagen valt, oudste eerst, hooguit 12. De workflow "Catalogus-hercontrole" draait elke donderdag; Claude controleert ze opnieuw bij de bron volgens `docs/catalogus-hercontroleur.md` en de workflow opent één PR (`hercontrole/<datum>`). Eén hercontrole-PR tegelijk; staat er nog een open, dan slaat hij de week over. Door de horizon van 28 dagen is de eerste run op donderdag 3 december. Bij 12 per week is de laatste groep (gecontroleerd 10–13 oktober) eind januari klaar, een paar weken na de vervaldatum; dat is zonder gevolg voor de site (verbergen gebeurt pas na 12 maanden). Sneller kan door `RECHECK_BATCH_SIZE` te verhogen.

**Gaten vullen:** per stick noemt de lijst welke gegevens ontbreken (carbonpercentage, bow-profiel, modeljaar). Noemt de bron ze nu wel, dan vult de hercontroleur ze in. Dat raakt het punt van 13 oktober: een onbekend carbonpercentage kost vooral Grays-sticks punten in het advies.

**Bewust niet:** sticks toevoegen of verwijderen, `bolNotSold`/`bolProductUrl` aanpassen, waarden schatten. Een onbereikbare of tegenstrijdige bron laat het veld en de datum ongemoeid en komt onder *Voor jou*.

## 2026-10-14 — Instagram-community: feedback ophalen en een volglijst van clubs

**Besluit eigenaar:** een agent voor de juiste volgers op Instagram. Eerst Instagram; de komende weken vooral **feedback ophalen**. Samenwerkingen met creators pas over ongeveer vier weken, na zijn sein.

**Wat:** de geplande taak *Instagram-community* (woensdag, of met de knop op de studio) volgt `docs/instagram-community.md`. Elke run:
- verwerkt de feedback die de eigenaar in de Instagram-studio noteert (zonder namen) tot hooguit 5 thema's met een voorstel;
- zet hooguit 3 story-vragen (poll, vraagsticker, quiz, slider) klaar, gekoppeld aan de posts van die week en het Conversie-rapport;
- stelt hooguit 5 clubaccounts voor om te volgen, alleen accounts die de club zelf op haar website noemt (via de KNHB-clubfinder).

Alles staat op de tab *Community* van de Instagram-studio; de eigenaar doet zelf het volgen, reageren en plaatsen.

**Bewust niet:**
- automatisch volgen, liken, reageren of DM'en (verboden door Meta, risico op een ban, en de doelgroep is voor een deel minderjarig);
- de Meta-API of instagram.com lezen (handboek Instagram §10);
- personen op de volglijst (alleen organisaties), winkels of merken;
- DM's of samenwerkingsvoorstellen aan clubs (club-outreach staat op pauze);
- Vlaanderen en TikTok-community (later, na een besluit van de eigenaar).

## 2026-10-14 — `ruleSetVersion v9-2026-10-14`: merk van de huidige stick altijd tonen als het kan

**Aanleiding:** de eigenaar koos "bij hetzelfde merk blijven" (Grays) en zag geen Grays in het advies. Uit metingen bleek dat het puntenminimum (60) daar niet de oorzaak was. Het lag aan de harde filters: binnen het budget, of op het juiste niveau in de geadviseerde maat, was er geen Grays.

**Wat:**
1. De best passende stick van het merk die door de filters komt, staat altijd in het advies. Het minimum van 60 punten vervalt.
2. Komt geen enkele stick van het merk binnen het budget, dan tonen we de best passende stick die aan alle andere filters voldoet (maat, niveau, veiligheid, leverbaarheid). Daarbij staat de melding `ABOVE_BUDGET`. Alleen de stick van het eigen merk kan zo boven budget komen.
3. Kan het echt niet, dan zegt het advies waarom (`missReason`): geen stick in deze maat, niet op dit niveau, te stijf voor de opgegeven techniek of niet leverbaar.

Er blijft altijd minstens één stick van een ander merk staan.

**Effect** (180 profielen die bij Grays willen blijven): Grays staat nu in 140 van de 148 adviezen, eerst in 136. De overige 8 zijn spelers van 158 cm in de prestatieroute: in 35 inch heeft Grays bij ons alleen een beginnersstick, en dat zegt het advies nu ook.

**Ook:** overal staat nu "aerial/scoopen" in plaats van "aerial(s)". Dat is opgenomen in de huisstijl (`docs/content-agent.md` §3).

## 2026-10-14 — optionele vragen dichtgeklapt

**Wat:** op elk scherm van de stickwijzer staan de optionele vragen samen in één dichtgeklapt blok: "Advies nog preciezer maken? · N extra vragen, optioneel: …". Dat blok staat onder de verplichte vragen. Heeft een van die vragen al een antwoord, bijvoorbeeld als je terugbladert, dan staat het blok open. Het openen wordt gemeten met het event `optional_questions_open` (met de scherm-id), zodat we zien of bezoekers de extra vragen gebruiken.

De vragen en de adviesregels zelf zijn niet veranderd. De vragen over het merk van de huidige stick zitten ook in dit blok.

**Reden:** keuze van de eigenaar. De vragenlijst was voor de gemiddelde bezoeker te overweldigend.

## 2026-10-14 — `ruleSetVersion v10-2026-10-14`: eigen merk altijd eerste keuze; merkvraag verplicht

**Wat (keuze eigenaar):**
- **Merkvragen verplicht.** "Van welk merk is de huidige stick?" is verplicht zodra iemand een huidige stick heeft. "Wil je bij hetzelfde merk blijven?" is verplicht zodra het merk bekend is. Beide staan dus niet meer in het blok met extra vragen. "Wat bevalt" en "wat moet anders" blijven extra vragen.
- **Eigen merk altijd eerst.** Kiest iemand "Ja, liefst hetzelfde merk", dan bestaat het advies uit twee sticks:
  1. "Eerste keuze: jouw merk", met de tekst "Je wilt bij Grays blijven. Daarom adviseren we de Grays X."
  2. "Kijk ook eens naar", met de best passende stick van een ander merk.
- **Filters versoepeld voor het eigen merk.** Dat geldt alleen voor de stick van dat merk, in deze volgorde: eerst het budget, dan het niveau. Er staat dan een zichtbare melding bij (`ABOVE_BUDGET`, `LEVEL_MISMATCH`). Maat, gegevens, veiligheid en leverbaarheid worden nooit versoepeld. Heeft het merk geen stick in de geadviseerde maat, dan zegt het advies dat.
- **Eerlijk bij een minder goede match.** Scoort de stick van het eigen merk onder de 70, dan staat er dat hij op een paar punten minder goed past. Het advies krijgt dan ook de melding "minder zeker".
- **Melding over de ambitieuze keuze** wordt bij merkvoorkeur niet getoond.
- **Extra-vragenblok:** het woord "optioneel" is weg uit de samenvatting.

**Afweging:** de eigenaar wil dat een merkvoorkeur altijd terugkomt in het advies. Daar staat tegenover dat de eerste keuze niet altijd de best passende stick is. Dat maken we zichtbaar met de meldingen en met het alternatief van een ander merk. Een test bewaakt dat een speler die bij Grays wil blijven altijd een Grays als eerste keuze krijgt, zolang Grays in die maat een stick heeft.

## 2026-10-14 — "Waarom zoek je nu een nieuwe stick?" alleen bij een huidige stick

**Wat (keuze eigenaar):** deze vraag verschijnt alleen als de speler al een stick heeft, en is dan verplicht. Zonder stick is het altijd een eerste stick, dus de vraag zegt dan niets. De optie "Eerste stick" is uit de antwoorden gehaald. De waarde `first_stick` blijft in het schema, zodat oude opgeslagen antwoorden geldig blijven. De adviesregels gebruiken deze vraag niet; alleen de uitleg verandert.

## 2026-10-14 — `ruleSetVersion v11-2026-10-14`: eerst de stick, dan de maat; niveau uit de antwoorden

**Aanleiding:** de eigenaar zag dat de stickwijzer kinderen in een selectieteam, met 4 of meer seizoenen, vaak een beginnersstick adviseerde. Een doorrekening van 702 scenario's (3 spelertypes × 13 lengtes × 3 routes × 6 budgetten) bevestigde dat:
- Het niveau kwam alleen uit de gekozen route. Speelniveau, seizoenen, trainingen en techniekcijfers telden niet mee.
- Maat leverde iedere stick die door het filter kwam dezelfde 20–30 punten op.
- Een beginnersstick verloor bij een gevorderde speler maar 8 punten en heette dan nog "beste match".
- In de prestatieroute gaf de stickwijzer voor kinderen tot 33 inch geen advies, omdat er in die maten alleen beginnerssticks zijn.

**Wat (keuze eigenaar):**
- **Niveau uit de antwoorden.** De route bepaalt alleen nog welke vragen we stellen (`derivePlayerBand` in `playerContext.ts`).
  - Minder dan één seizoen: beginner.
  - Jeugd tot en met 15: de leeftijd is het uitgangspunt. Onder 11 jaar beginner, 11–15 jaar gevorderd.
  - Vanaf 16: gevorderd.
  - Eén niveau hoger bij een prestatiesignaal: de prestatieroute, selectie-, competitief of topniveau, of 4+ seizoenen met een zekere aanname. Niet als de speler de aanname of de basis nog leert.
  - Kinderen onder 11 zonder voorkeur voor stickgevoel krijgen "zacht", tenzij er een prestatiesignaal is.
- **Maat is geen score meer, maar de laatste controle.** De engine kiest eerst op de stick zelf (niveau, doelen, bow-profiel, gevoel, budget) en kijkt daarna of de stick er in de geadviseerde maat is. De maatpunten zijn verdeeld over de kenmerken:

  | Onderdeel | Start | Ontwikkel | Prestatie |
  |---|---|---|---|
  | Ervaring / controle | 35 | 30 | 20 |
  | Doel / acties | 20 | 25 | 30 |
  | Bow-profiel | 15 | 20 | 20 |
  | Stickgevoel | 15 | 15 | 20 |
  | Budget | 15 | 10 | 7 |
  | Beschikbaarheid | 0 | 0 | 3 |

  Bij een gelijke score gaat de geadviseerde maat voor de tweede maat. Een langere stick dan geadviseerd blijft bij kinderen uitgesloten.
- **Te simpel kost punten, te moeilijk blijft een filter.**
  - Op niveau 100% van de ervaringspunten, één niveau eenvoudiger 50%, twee niveaus eenvoudiger 10%.
  - Een stick buiten het niveaubereik naar beneden (een beginnersstick voor een ervaren speler) valt niet meer weg, maar is nooit "beste match". Hij heet dan "dichtstbijzijnde optie", met de melding `BELOW_LEVEL`.
  - De beste match is de hoogst scorende stick binnen het niveaubereik die minstens 70 haalt.
  - Een stick boven het niveau van de speler blijft uitgesloten, net als de veiligheidsregels.
- **Eerlijk als de beste stick niet in de maat bestaat** (`bestModelOtherSize`). Past een stick qua niveau beter, of scoort hij minstens 10 punten hoger, maar bestaat hij niet in de geadviseerde maat, dan noemt het resultaat hem. Het gaat om sticks met een maat binnen 2 inch van het advies. Bij kinderen staat erbij dat ze geen langere maat moeten kiezen.
- **Veel te goedkoop telt mee.** Kost een stick minder dan de helft van de onderkant van het budget, dan krijgt hij 40% van de budgetpunten (was 80%).
- **Merkbonus.**
  - De +12 geldt alleen voor sticks binnen het niveaubereik van de speler.
  - Er wordt gerangschikt op de score zonder plafond. Het plafond van 100 maakte sticks van het eigen merk vaak gelijk, waarna de goedkoopste won in plaats van de best passende.
  - Bij merkvoorkeur gaat een stick van dat merk op niveau (desnoods boven budget) voor een stick van dat merk die te simpel is.
- **Resultaat:** het resultaat noemt nu voor welk niveau we adviseren, en waarom.
- **Methodiek:** de methodiekpagina is bijgewerkt.

**Afwijking van de specificatie:** §6.2 geeft maat 20–30 punten. Dat volgen we bewust niet meer (zie hierboven).

**Effect** (dezelfde 702 scenario's, met de catalogus van vandaag):
- Selectiekind tot 158 cm, route "Volgende stick": een beginnersstick als "beste match" in 1 van de 60 gevallen (was 50). Zijn er in die maat alleen beginnerssticks (tot en met 33 inch), dan heet de stick nu "dichtstbijzijnde optie", met de melding erbij.
- Prestatieroute voor kinderen tot 158 cm: altijd een advies (was 50 van de 60 keer geen advies).
- Beginner (minder dan één seizoen) in de prestatieroute: beginnerssticks (was: sticks voor gevorderden).
- Volwassen ervaren speler, route "Volgende stick": in 13 van de 18 gevallen een stick voor ervaren spelers (was 0).

**Nog open:** het gat in de catalogus (geen gevorderde juniorsticks tot en met 33 inch). Dit is een aparte opdracht voor de Catalogus-aanvuller.

## 2026-10-16 — Video-pilot: explainers met Remotion

**Besluit eigenaar:** explainer-video's voor YouTube en Reels, als pilot van zes weken met één onderwerp (*Welke lengte hockeystick?*). De eigenaar uploadt zelf.

**Wat:**
- Map `video/` met een los Remotion-project (video in code, React). Eigen `package.json`, buiten de site-build, lint en typecheck van de root. De video's importeren `LENGTH_GUIDE`, de huisstijlkleuren en de lettertypen uit de repo, dus ze kloppen na een nieuwe render altijd met de site.
- Twee video's en een thumbnail: een Short (9:16, ±31 s) voor YouTube Shorts, Instagram/Facebook Reels en TikTok, en een uitleg (16:9, ±55 s) met de hele tabel voor YouTube.
- Workflow *Video renderen* rendert bij elke PR die `video/` raakt en zet de bestanden als download bij de run.
- Kort adres `/youtube` (307) naar de stickwijzer met `utm_source=youtube&utm_medium=video`, zoals `/tiktok`.
- Handboek `docs/video.md`, uploadteksten in `video/teksten/`, sjabloon *Video-brief*.

**Waarom Remotion:** het past in de bestaande stack (TypeScript, React), Claude kan het schrijven en de cijfers komen uit dezelfde bron als de site. Gratis voor een individu of een bedrijf tot 3 medewerkers; bij groei is een licentie nodig.

**Bewust niet:** voice-over (de eigenaar kan die zelf inspreken), muziek, mensen in beeld, AI-avatars, automatisch uploaden of een YouTube-API, YouTube-embeds op de site (cookies). Nog geen wekelijkse video-agent: eerst de evaluatie eind november.

## 2026-10-16 — Video's levendiger, met eigen muziek

**Besluit eigenaar:** de pilotvideo was te rustig; meer tempo en een standaard muziekje eronder.

**Wat:** eigen house-nummer (≈128 BPM, Am–F–C–G) en geluidseffecten, in code gemaakt met `video/audio/genereer.py` en opgeslagen in `assets/video/`. Scènes duren een heel aantal beats, met overgangen op de beat, tekst die woord voor woord binnenkomt, tellers, sticks die invallen, een voortgangsbalk en een openingsslag met de bal. De Short is ingekort tot ±24 s, de uitleg tot ±46 s. Er komt ook een Short *zonder muziek* voor wie in Instagram of TikTok zelf een nummer kiest.

**Waarom eigen muziek:** geen licentie, geen naamsvermelding en geen kans op copyright-claims, op elk platform. Een eerste versie met een pentatonische melodie klonk volgens de eigenaar "Chinees"; die melodie is vervangen door akkoorden en een arpeggio.

## 2026-10-16 — PassaSports-partnerlinks via TradeTracker

**Wat:** het affiliateprogramma van PassaSports is goedgekeurd. Het loopt via TradeTracker: campagne "Passasports.nl", met deeplinking en referentietracking.
- **Koopknop:** sticks die alleen PassaSports verkoopt (`isPassaSportsOnly`) krijgen nu een knop "Bekijk en koop bij PassaSports". Die vervangt de melding "koppeling volgt".
- **Linkformaat:** overgenomen van een link die op 2026-10-16 met de linkgenerator in TradeTracker is gemaakt: `https://www.passasports.nl/tt/passa-nl/?tt=39608_12_517408_<referentie>&r=<pad>`. Een test bewaakt dat de site precies die link maakt.
- **Referentie:** de plek op de site (stickwijzer, productpagina, catalogus, vergelijk, zaalkeuze), net als de sub-ID bij bol.com. Zo zie je in TradeTracker waar verkopen vandaan komen.
- **Alleen productlinks:** zonder productpagina is er geen knop. We linken nooit naar een zoekpagina van PassaSports.
- **Linkattributen:** de knop krijgt `rel="noopener noreferrer sponsored"`. Bronlinks naar passasports.nl blijven `nofollow`.
- **Vermelding:** de partnerlinkzin noemt nu bol.com én PassaSports. Bij de knop staat "Niet te koop bij bol.com, wel bij PassaSports. PassaSports is dan de verkoper." De methodiekpagina legt het uit.
- **Bij bol.com én PassaSports:** zo'n stick houdt alleen de bol.com-knop.
- **Commissie:** wordt nergens in de code of tekst aangenomen.

**Nog open:** de privacytekst noemt alleen het bol.com Partnerprogramma. Die passen we alleen aan op uitdrukkelijke opdracht van de eigenaar.

## 2026-10-16 — twee koopknoppen als bol.com én PassaSports de stick verkopen; privacytekst bijgewerkt

**Wat (keuze eigenaar):**
- **Koopknoppen:** een stick krijgt een knop voor elke winkel die hem verkoopt.
  - Bij beide winkels: "Bekijk en koop op bol.com" (gevulde knop) en "Bekijk en koop bij PassaSports" (omlijnde knop).
  - Bij één winkel: alleen die knop.
  - De prijsregel wordt dan "bekijk actuele prijs bij bol.com of PassaSports".
- **Sticks gekoppeld:** 17 sticks uit de catalogus die PassaSports ook verkoopt, hebben nu een `passaSportsProductUrl`, gecontroleerd op 2026-10-16: pagina bestaat, juiste model, leverbaar. Het gaat om:
  - Grays: 4i, 6i, AC500, AC600, AC700, AC800, DB 10, JB 10, JB3Xi en PB 11+;
  - adidas Fabela .30;
  - Osaka Pro Tour 40 2.0 Lowbow;
  - Princess Competition 10 Star LowBow Indoor Junior;
  - Reece Noxx 600, Ritual Specialist 55, TK Maxi Junior en Y1 LB X.2.
- **Bewust niet gekoppeld (twijfel):**
  - Indian Maharadja Blade 10: PassaSports verkoopt de ProBow, wij hebben de midbow.
  - Indian Maharadja Pro 10 Junior en JDH X93 Pro Bow: meerdere jaargangen of uitvoeringen.
  - Osaka Pro Tour GF 2.0 Junior: PassaSports noemt een "Grow Bow", wij een midbow.
  - TK 3 Control Bow Junior Indoor: modelnaam niet eenduidig.
  - Princess Premium 4K 10 Star: bij PassaSports alleen als zaalstick.
- **TK Maxi Junior:** de link gaat naar de roze uitvoering. PassaSports heeft een aparte pagina per kleur.
- **Privacytekst** (in opdracht van de eigenaar): een alinea erbij over PassaSports en TradeTracker, die na een klik cookies kunnen plaatsen voor de toeschrijving. De doorklikzin noemt nu ook PassaSports.

## 2026-10-16 — PassaHockey-knop in eigen rood; pagina "Waar koop je een hockeystick?"

**Wat (keuze eigenaar):**
- **Knop:** "Bekijk en koop bij PassaHockey". De link landt in de hockeywinkel van PassaSports, die zichzelf PassaHockey noemt.
- **Kleur:** het rood van PassaHockey, `#ED003B` (token `passa`, knopvariant `passa`). Witte tekst haalt daarop een contrast van 4,5:1 (WCAG AA). Bij hover wordt het donkerder (`#C40031`).
- **Teksten:** zichtbare winkelteksten noemen nu PassaHockey: de partnerlinkzin, de prijsregel, de privacytekst, de methodiekpagina, de footer en "Over ons". Waar het om de verkoper gaat, staat "PassaHockey (PassaSports)".
- **Nieuwe pagina** `/kennis/waar-koop-je-een-hockeystick`:
  - Een stick koop je overal; via de site kun je bestellen bij bol.com of PassaHockey.
  - Een vergelijkingstabel met: soort winkel, wie verkoopt, verzendkosten, retourneren en bezorging. Gecontroleerd op 2026-10-16, met bronnen onderaan.
  - Een korte uitleg dat we via partnerlinks een klein bedrag verdienen, dat jij hetzelfde betaalt, en dat het advies er niet door verandert.
  - Aantallen sticks per winkel, berekend uit de catalogus.
  - Link vanuit de footer en de methodiekpagina.
- **Huisstijl:** de regel "bol.com is de enige winkel" in `docs/content-agent.md` is vervangen door "partnerwinkels bol.com en PassaHockey".

## 2026-10-16 — "sleeppush" in plaats van "dragflick"

**Wat (keuze eigenaar):** overal waar bezoekers het zien, staat nu "sleeppush": in de vragen en antwoordopties van de stickwijzer, de schermtitel, de uitleg bij het advies, de methodiekpagina en de sterke punten van de Ritual Specialist 55. Letterlijke citaten van merken en winkels ("drag flicking") blijven staan. De interne codes (`dragflick`, `skill_dragflick`) zijn niet veranderd, zodat opgeslagen antwoorden en analytics blijven werken. De regel staat ook in de huisstijl (`docs/content-agent.md` §3).

## 2026-10-17 — PassaHockey-productfeed: koppelen, aanvullen en controleren

**Wat (opdracht eigenaar: "verwerk naast bol.com ook de sticks via PassaSports in de catalogus"):**
- **Bron:** de productfeed "PassaHockey" (#2490853) van de TradeTracker-campagne Passasports.nl, in XML, elke nacht bijgewerkt. Per maat en kleur één regel (ca. 23.500), waarvan ca. 800 stickpagina's. De feed-URL bevat alleen ons site-ID (517408, staat ook in elke partnerlink) en het feed-ID; hij is geen geheim en staat in `src/catalog/passaFeed.ts`. Geen scrapen: de sitemap van PassaSports weigert automatische toegang (HTTP 403).
- **`npm run passa:feed`** (alleen lezen) legt de feed naast de catalogus en maakt een rapport met drie delen: onze PassaHockey-links die uitverkocht of verdwenen zijn, koppelvoorstellen (onze stick zonder link, zelfde merk/model/junior-senior/veld-zaal in de feed) en leverbare sticks die we nog niet hebben.
- **Matchen:** op modelnaam, niet op EAN (de catalogus heeft geen EAN's). Schrijfwijzen worden gelijkgetrokken ("DB 8" = "DB8" = "Dynabow 8", "JB 12+" = "JB+ 12", "Pro Bow" = "ProBow", "LB" = "LowBow"). Een voorstel is nooit automatisch een koppeling: de Catalogus-aanvuller controleert model, bow en jaargang.
- **Catalogus-aanvuller (dinsdag):** krijgt naast `gaps.md` (bol.com) nu `passa.md`. Per PR maximaal 10 koppelingen en, zoals voorheen, maximaal 2 nieuwe sticks, nu ook uit het assortiment van PassaHockey. Een nieuwe stick die bol.com niet verkoopt, krijgt `bolNotSold` en alleen de PassaHockey-knop. Draait ook als de marktmeting ontbreekt; valt de feed uit, dan gaat het bol.com-deel gewoon door.
- **Catalogus-controle (maandag):** het issue krijgt een blok "Onze PassaHockey-links" met uitverkochte en verdwenen links.
- **Marktverkenner:** leest PassaSports voortaan uit de feed (stickpagina's) in plaats van de sitemap. De eerste week is voor PassaSports een nulmeting.
- **Nu gekoppeld (12 sticks):** alleen voorstellen met precies één PassaHockey-pagina én een "van"-prijs die binnen €5 van onze adviesprijs ligt (zelfde jaargang). Grays JB 6, JB 12+, DB 5, JB 8, PB 8, MB 8, MB 7, PB10Xi en DB2Xi; Princess Competition 1 Star ProBow; Brabo G-Force Elite X One LB JR; Reece Alpha JR. De overige voorstellen (o.a. JDH X93/X1, Brabo Elite Five en X One, Grays DB 6/DB 8/DB 10+) laten we aan de wekelijkse controle met de hand.
- **Geen kortingen:** de feed bevat een "van"-prijs. Die gebruiken we alleen om jaargangen te vergelijken, nooit als doorgestreepte prijs of besparing op de site (Omnibus-richtlijn).
- **Foto's uit de feed (keuze eigenaar):** toegestaan, met `imageSourceUrl` naar de PassaHockey-pagina. Volgorde bij een nieuwe stick: merkfoto, dan bol.com, dan PassaHockey. Nu toegevoegd bij de zes sticks die alleen PassaHockey verkoopt en nog geen foto hadden: Malik LowBow 2 en LowBow 4 Junior, Osaka Midbow Hout Indoor Junior en Probow GF Indoor Junior, Y1 Indoor Mid Bow W1 en Y1 Indoor Low Bow C50.
- **Y1 Indoor Low Bow C50 (keuze eigenaar):** de 2026/2027-uitvoering staat niet meer in de feed. De stick wijst nu naar de 2025/2026-uitvoering "Y1 Indoor IL.C50", met maat (37,5 inch), prijs (€124,95) en modeljaar 2025 uit de feed.

## 2026-10-17 — Social-studio: één kalender voor alle kanalen, wekelijkse video

**Besluit eigenaar:** zo veel mogelijk door een agent laten doen, één keer per week vooruit plannen, en alles in één kalender zien.

**Wat:**
- De *Instagram-studio* heet nu **Social-studio**: dezelfde pagina en database, plus een weekkalender met alle kanalen. Dat zijn Instagram + Facebook (post), Reel, YouTube Shorts, YouTube en TikTok. Per kanaal staat de status *klaar*, *ingepland* of *geplaatst*. Een blok *Plan de week in* laat per programma (Meta Business Suite, YouTube Studio, TikTok Studio) zien wat nog ingepland moet worden.
- **Woensdag = video.** De *Social-planner* (voorheen Instagram-planner, elke vrijdag) schrijft voor elke woensdag een videoscript met de teksten per kanaal (collection `videos`). De studio animeert het in de browser in de huisstijl, met onze eigen muziek, en de eigenaar downloadt een MP4 (Short 9:16 en YouTube 16:9) plus de thumbnail. Regels: `docs/video.md` §7.
- Ingeplande items springen na het geplande moment vanzelf op *geplaatst*. Zo hoeft de eigenaar alleen in het weekend te klikken.

**Waarom in de browser en niet via GitHub:** geen PR, merge of render-run per video. De planner schrijft alleen data, net als bij de posts. Remotion in `video/` blijft er voor video's met een eigen animatie.

**Bewust niet:** automatisch plaatsen of een koppeling met de API's van Meta, YouTube of TikTok. Plannen doet de eigenaar zelf, in de eigen programma's van de platforms.
## 2026-10-17 — Bulkimport van het PassaHockey-assortiment

**Wat (keuze eigenaar):** alle sticks die PassaHockey levert en die nog niet in de catalogus staan, komen in één keer op de site. Doel: de stickwijzer en de catalogus adviseren uit het hele aanbod in plaats van uit 87 sticks.
- **Wat erin komt:** leverbare stickmodellen (kleuren samengenomen) van merken in onze catalogus, plus Nike en Yibbi. Niet: keepersticks, accessoires, babysticks, sticks met alleen een artikelcode als naam, sticks waarvan veld/zaal onbekend is, en sticks met een bekend modeljaar vóór 2025.
- **Modeljaar:** de feed heeft geen modeljaar. Alleen bij Y1, Ritual en Indian Maharadja staat het jaar betrouwbaar in de artikelcode; daar vullen we `modelYear` in en vallen oudere collecties af. Bij de andere merken blijft het jaar leeg (nooit gokken); "nu leverbaar" is daar de maatstaf.
- **Specs uit de feed:** kromming uit "Type kromming" in de omschrijving, anders uit de naam; spreken die elkaar tegen, of is het een kromming die we niet kennen (late bow, control bow), dan blijft het leeg. Carbonpercentage uit "Carbonpercentage"/"Percentage carbon". Lengtes, prijs (laagste verkoopprijs), voorraad, veld/zaal, junior/senior en foto uit de losse velden. Bron overal: de PassaHockey-pagina (`partner-shop`).
- **Eigen inschattingen (gelabeld):** niveau uit carbon en prijs (≥70% carbon of ≥ €200: ervaren; ≥30% of ≥ €80: gevorderd; anders beginner); positie uit de kromming; sterke en aandachtspunten uit vaste, genuanceerde zinnen. Elke stick meldt dat de gegevens van PassaHockey komen en nog niet met het merk zijn vergeleken.
- **Koopknop:** alleen PassaHockey. bol.com is voor deze sticks niet gecontroleerd; daarom geen bol.com-knop (een zoeklink kan op een ander product landen) en ook geen tekst "niet te koop bij bol.com", maar "PassaHockey (PassaSports) is de verkoper".
- **Google:** pagina's van geïmporteerde sticks krijgen `noindex` en staan niet in de sitemap, omdat ze sjabloonteksten hebben en de site al pagina's op "Gevonden – niet geïndexeerd" heeft. Ze tellen pas mee als een stick met de hand is verrijkt (dan verdwijnt `feedImport`).
- **Waar ze verschijnen:** stickwijzer, `/sticks` (met merkfilter), de lijst op `/zaalsticks`, `/vergelijk`, vergelijkbare sticks en hun eigen productpagina. Niet in kennisartikelen, op de homepage, in de zaalkeuzehulp (die draait in de browser; klein houden) en in de sitemap.
- **Bijhouden:** `npm run passa:import` schrijft `src/catalog/imported/passahockey.ts`. De workflow PassaHockey-sync draait elke woensdag en opent een PR als prijzen, voorraad of het assortiment veranderen; de eigenaar merget (15 Netlify-credits per merge). Breekt de feed af (minder dan 200 sticks), dan stopt de import en blijft de catalogus staan.
- **Eerste import (17 oktober):** 545 sticks (412 veld, 133 zaal; kromming bekend bij 422, carbon bij 354, foto bij alle). Niet opgenomen: 24 (18 met een modeljaar vóór 2025, 6 met alleen een artikelcode als naam).
- **Live gezet zonder preview-review**, op uitdrukkelijke opdracht van de eigenaar ("push direct naar Netlify"), na een groene kwaliteitscontrole.

## 2026-10-18 — documentatie opgeruimd

**Wat (opdracht eigenaar):**
- **`docs/README.md` is de inhoudsopgave.** De `README.md` in de root beschrijft nu het project in plaats van de standaardtekst van Next.js.
- **Spec in de repo:** de leidende specificatie staat nu in de repo als `docs/spec/keuzehulp-instructie-v1.1.md`. Eerst stond ze alleen lokaal, buiten git, waardoor de agents op GitHub haar niet konden lezen. Het oude addendum over bronverwijzingen zit volledig in v1.1 (hoofdstuk 9) en staat daarom niet in de repo.
- **Merkinstructie in de repo:** `docs/merkinstructie.md`, eerst alleen lokaal.
- **Verplaatst naar `docs/`:** `docs/source-policy.md` en `docs/business-model.md` uit de root, en `docs/archief/partner-pitch.md` naar `docs/archief/`. Alle verwijzingen zijn bijgewerkt, ook in de agent-prompts van de workflows.
- **`CLAUDE.md` bijgewerkt naar de werkelijkheid:**
  - twee partnerwinkels (bol.com en PassaHockey);
  - het event `retailer_click`;
  - richtprijzen uit merk- of winkelbron;
  - geen verwijzing meer naar het niet-bestaande `docs/test-mvp-scope.md`;
  - een nieuwe sectie "Documentatie".
- **`docs/business-model.md`:** een sectie "Huidige situatie: twee partnerwinkels" vervangt het verouderde plan met het mailto-formulier.

## 2026-10-18 — Instagram-token automatisch verversen

**Wat (opdracht eigenaar):** de workflow "Instagram-token verversen" draait op de 1e van elke maand. Zo verloopt het token niet meer na 60 dagen, wat anders rond 11 december was gebeurd. De workflow:
1. leest het token voor productie uit Netlify (`INSTAGRAM_ACCESS_TOKEN`);
2. vraagt Instagram om een nieuw token (`refresh_access_token`);
3. zet het nieuwe token terug in Netlify;
4. start een nieuwe deploy.

**Hoe het veilig blijft:**
- Het token komt nooit in een log of in de code.
- Benodigd: de GitHub Secrets `NETLIFY_AUTH_TOKEN` en `NETLIFY_SITE_ID`.
- Mislukt het, bijvoorbeeld omdat het token al verlopen is of omdat de variabele in Netlify als geheim gemarkeerd staat, dan faalt de workflow en mailt GitHub de eigenaar.

**Kosten:** één extra deploy per maand.

## 2026-10-18 — "Hoe denkt dit merk over sticks?" op /merken

**Wat (opdracht eigenaar):** elk merkprofiel kan een onderwerp "Hoe denkt [merk] over sticks?" hebben (`philosophy` in `src/content/brands.ts`).
- **Bron:** alleen de eigen website van het merk, gecontroleerd op 2026-10-18. De tekst zegt steeds wat het merk zelf beweert ("volgens Grays …"). Het is geen oordeel van ons en geen bewezen effect. De bronnen staan per merk eronder.
- **Ingevuld:**

  | Merk | Waar het over gaat |
  |---|---|
  | Grays | vorm eerst, elf bows, geschiedenis en AeroCore |
  | Brabo | praktijkervaring, stijfheidsschaal 1–10 |
  | Princess | carbon, curve, details en star rating |
  | Ritual | een stick per speelstijl, klein assortiment, prototypes |
  | Y1 | samen met spelers ontwikkeld, klimaatneutraal volgens het merk |
  | Osaka | design als startpunt |
  | The Indian Maharadja | design en kwaliteit; techniek legt het merk niet uit |
  | Yibbi | zelfvertrouwen, stick getest op gevoel en balans |

- **Leeg (geen uitleg op de eigen site):**

  | Merk | Reden |
  |---|---|
  | adidas | site blokkeert bezoek |
  | JDH | site gaat over sportkleding |
  | Reece | site gaat over teamkleding |
  | TK | alleen productbeschrijvingen |
  | Malik, Nike | niets gevonden over hun sticks |
  | Scoop, Stag, Ravi, Csign | geen eigen website |

- **Test:** `src/content/brandPhilosophy.test.ts` bewaakt dat de bronnen geen winkel of derde partij zijn.

## 2026-10-18 — Verkooprapport (alleen aantallen)

**Wat:** de workflow "Verkooprapport" draait op maandag, vóór de orchestrator. Het rapport komt in één issue met het label `verkoop`.
- **Bronnen:** de bol.com Affiliate Reporting API (`promotion-report`) en het referentierapport van TradeTracker (`getReportReference`, campagne 39608, site 517408).
- **Inhoud:**
  - kliks en bestellingen per plek op de site (sub-ID of referentie);
  - de tien meest aangeklikte sticks bij bol.com;
  - de vergelijking met de week ervoor.
- **Geen bedragen (keuze eigenaar):** de repository is openbaar, dus omzet en commissie staan er niet in. Een test bewaakt dat. De bedragen zie je in de portalen zelf.
- **Als een bron faalt:** dat staat in het rapport, en het andere deel gaat gewoon door. De sleutels komen nooit in het rapport of in een log.
- **Plek per klik:** links die geen bekende plek meesturen, zoals de testlink uit het bol-dashboard, staan onder "Overig".
- **PassaHockey per stick:** TradeTracker toont niet per stick, omdat onze links alleen de plek meesturen.
- **Ongetest:** het formaat van de TradeTracker-respons is gebouwd volgens de WSDL, maar nog niet met echte gegevens geprobeerd. De eerste run laat zien of het klopt.

## 2026-10-19 — Test: explainer-video met AI-presentator (Colossyan)

**Besluit eigenaar:** naast de animatievideo's één explainer met een AI-presentator testen, over de kromming van de stick (`/kennis/low-bow-vs-mid-bow`). Kromming gekozen boven carbon: er staat al een pagina live, het onderwerp is goed in beeld te brengen, en veel merken noemen geen carbonpercentage.

**Tool:** Colossyan (Europees bedrijf, goedkope instap, PowerPoint-import waarbij de sprekersnotities de tekst van de avatar worden). HeyGen viel af omdat het een Amerikaans bedrijf is; een avatar is biometrische data. Claude zelf maakt geen realistische mensen of stemmen.

**Regels:** zie `docs/video.md` §9. Stock-avatar of de eigenaar zelf, AI-vermelding in beeld en in de gesproken tekst, AI-label op elk platform (EU AI Act art. 50, van toepassing sinds 2 augustus 2026). De eigenaar maakt en uploadt zelf.

**Afwijking:** `docs/video.md` §3 sloot AI-avatars en mensen in beeld uit; voor deze ene test geldt een uitzondering. Evaluatie eind november, samen met de video-pilot.

## 2026-10-19 — carbonpercentages van Grays uit de PassaHockey-feed

**Aanleiding (eigenaar):** Grays is een veelgebruikt merk, maar kwam weinig als advies uit de stickwijzer. Een belangrijke oorzaak (zie 2026-10-12 en 2026-10-13): bij de meeste Grays-sticks ontbrak het carbonpercentage, waardoor ze voor stickgevoel maar de helft van de punten kregen.

**Wat:** 15 handmatig beheerde Grays-veldsticks hebben nu een carbonpercentage uit de productfeed van PassaHockey (`source: 'partner-shop'`, gecontroleerd op 2026-10-19).

| Stick | Carbon |
|---|---|
| DB 5 | 30% |
| DB 6, JB 6 | 40% |
| AC500, MB 7 | 50% |
| AC600 | 60% |
| AC700, MB 8, PB 8 | 70% |
| AC800 | 80% |
| DB 10, DB 10+, JB 10, JB 12+, PB 11+ | 95% |

Bij DB 8 en JB 8 (al 70% van twee winkels) bevestigt de feed die waarde.

**Waarom de feed en niet bol.com:**
- De feed is compleet en volgt een vast patroon in de nummering van Grays (4 = 20%, 5 = 30%, 6 = 40%, 7 = 50%, 8 = 70%, 9 = 90%, 10 = 95%).
- Hij komt overeen met de waarden die het bronnenoverzicht van de eigenaar als expliciet noemde (DB 8 en JB 8: 70%).
- bol.com toont bij 9 van de 15 sticks 0%, een standaardwaarde die niet kan kloppen voor een composietstick. Bij de overige wijkt bol.com af: DB 5 50%, JB 6 60%, en 100% bij DB 10, JB 10 en PB 11+. Het label van elke stick vermeldt de afwijkende bol-waarde.
- Eén feedwaarde is bewust niet gebruikt: Midbow 7 Junior 5%, een kennelijke fout. Die stick staat ook niet in onze handmatige catalogus.

Het aandachtspunt "carbonpercentage niet vermeld" is vervangen door "Grays vermeldt het carbonpercentage zelf niet; het komt van PassaHockey".

**Effect** (simulatie met 435 antwoordcombinaties, zelfde engine):

| | Voor | Na |
|---|---|---|
| Grays als beste match | 81 | 123 |
| Grays in het advies (alle plekken) | 229 | 297 |

Geen merkbonus en geen wijziging in de adviesregels; alleen de data is vollediger.

**Tests:** twee tests gebruikten de JB 6 als voorbeeld van een stick zonder carbonpercentage. Ze gebruiken nu een variant zonder carbon.

## 2026-10-19 — homepage: foto's in de hero

**Wat (keuze eigenaar):** de hero toont twee foto's van een jeugdspeelster: de dochter van de eigenaar, gepubliceerd met toestemming.
- **Foto's:** beide vierkant bijgesneden. Alle metadata (EXIF) is verwijderd.
- **Wisselen:** om de 10 seconden met een zachte overgang, zonder knoppen. Het doel is dat er iets beweegt op de homepage.
- **Labels:** de drie redenen-labels staan op desktop linksboven op de foto, op mobiel eronder, zodat ze stick en bal niet bedekken.
- **Logo-embleem:** het geanimeerde logo zit niet meer in de hero. De code blijft bestaan.

**Afwijking WCAG 2.2.2 (keuze eigenaar):** bij beeld dat langer dan 5 seconden vanzelf beweegt, vraagt de norm een pauzeknop. Die is er bewust niet. Ter compensatie:
- de wissel pauzeert zolang de muis op de foto staat;
- na drie rondes (een minuut) stopt het wisselen;
- bij "minder beweging" (`prefers-reduced-motion`) staat de foto stil.
