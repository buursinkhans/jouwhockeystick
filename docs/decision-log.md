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

## 2026-10-19 — geïmporteerde sticks: correcties en wekelijkse verrijking

**Aanleiding:** een meting met 950 profielen, op dezelfde manier als de live stickwijzer, laat zien dat geïmporteerde PassaHockey-sticks in 846 adviezen voorkomen en in 645 de beste match zijn. Hun gegevens bepalen dus grotendeels het advies.

Ter correctie van eerdere metingen: die van 2026-10-19 (Grays-carbon) rekende zonder de geïmporteerde sticks. Met alles erbij is Grays in 174 van de 950 adviezen de beste match: tweede, na Brabo (205).

**1. Correcties voor alle geïmporteerde sticks tegelijk** (regels in `src/catalog/feedImport.ts`, zodat de wekelijkse synchronisatie ze toepast):
- **Grays-kromming uit de familienaam.** Jumbow/JB = low bow, Dynabow/DB = dynabow, Probow/PB = probow, Midbow/MB = mid bow. Het "Type kromming" van PassaHockey klopte voor Grays vaak niet; zo stond de JB 10 als "MidBow". Dit corrigeert 31 sticks.
- **Een juniorstick wordt nooit als "ervaren" ingeschat.** Dat gold voor 5 sticks.
- **Een onwaarschijnlijk carbonpercentage valt weg:** 80% of meer bij minder dan €80. Bijvoorbeeld "100%" bij een juniorstick van €49 (2 sticks). Het staat dan als aandachtspunt bij de stick.
- **Keepersticks worden overgeslagen.** Er was er één doorgeglipt.
- **Resultaat:** de import opnieuw gedraaid op de feed van 2026-10-19 geeft 537 sticks (was 545), met 0 Grays-krommingsfouten, 0 juniorsticks als "ervaren" en 0 keepersticks.

**2. Wekelijkse verrijking (keuze eigenaar):** de nieuwe workflow "Catalogus-verrijker" draait elke donderdag.
- **Wat hij doet:** hij verrijkt de 20 populairste geïmporteerde sticks. Hij controleert de gegevens bij het merk, schrijft een eigen tekst, kijkt of bol.com de stick verkoopt, en maakt er een handmatig beheerde stick van. Die mag Google indexeren.
- **Werkwijze:** `docs/catalogus-verrijker.md`. De eigenaar merget; de agent merget nooit zelf.
- **Populariteit:** hoe vaak de stickwijzer een stick adviseert, plus of hij bij de populairste sticks op bol.com staat (`npm run catalog:enrich-list`).
- **Waarom niet de voorraad van PassaHockey:** de feed toont alleen óf een maat leverbaar is (altijd "1"), geen aantallen. PassaHockey kan zijn assortiment ook niet sorteren op populariteit.
- **Waarom niet allemaal tegelijk vrijgeven:** honderden gelijkende pagina's in één keer kunnen de hele site bij Google schaden. 20 per week, met een eigen tekst, is een tempo dat Google vertrouwt.

## 2026-10-19 — `ruleSetVersion v12-2026-10-19`: actuele PassaHockey-prijs, zekerheid van gegevens telt mee

**Aanleiding (eigenaar):** Grays komt weinig uit de stickwijzer, en de prijzen op de site liggen soms ver boven die van PassaHockey. Een voorbeeld: Grays JB 10 met een adviesprijs van €350 en €290,95 bij PassaHockey.

Een analyse met 570 profielen en de volledige catalogus liet twee oorzaken zien:
1. **Gelijke stand.** Grays scoorde vaak precies even hoog als de winnaar. Bij gelijke stand won dan de goedkoopste stick, en Grays is meestal net iets duurder.
2. **Geschat niveau.** Geïmporteerde concurrenten met alleen een geschat niveau, op basis van prijs en carbon, wonnen van sticks met gegevens van het merk.

**Wat:**
- **Actuele prijs.** Verkoopt PassaHockey een van onze eigen sticks, dan gebruiken site en stickwijzer de laagste leverbare prijs uit de PassaHockey-feed. De eerder vastgelegde adviesprijs staat alleen nog in het bronlabel, nooit als korting of doorgestreepte prijs.
  - Code: `src/catalog/livePrice.ts`; de prijzen staan in `src/catalog/imported/passaPrices.ts`.
  - De wekelijkse PassaHockey-synchronisatie werkt ze bij.
  - Nu: 37 sticks.
- **Bij gelijke stand telt eerst de betrouwbaarheid van de gegevens.** De stick waarvan meer kerngegevens van het merk zelf komen (niveau, kromming, carbon, lengtes) wint. Daarna pas eenvoud, dan prijs.
- **Aftrek bij alleen een geschat niveau.** Een stick waarvan we niets van het merk weten en waarvan we het niveau alleen zelf hebben ingeschat, krijgt 3 punten aftrek (`dataFit`). Bij die stick staat de melding `LEVEL_ESTIMATED`: "Voor welk niveau deze stick is, hebben we zelf ingeschat …".

Beide regels belonen betrouwbare gegevens, geen merk.

**Effect** (570 profielen, volledige catalogus inclusief import):

| Groep | Grays als beste match vóór | na |
|---|---|---|
| Totaal | 113 (20%) | **171 (30%)**, nu het vaakst van alle merken |
| Volwassenen die doorgroeien | 35 | 77 |
| Volwassenen, prestatie | 39 | 64 |
| Jeugd die doorgroeit | 36 | 29 |

De daling bij de jeugd komt doordat juniorsticks met gegevens van het merk (bijvoorbeeld Princess) nu winnen van geïmporteerde Grays-juniorsticks waarvan we het niveau alleen geschat hebben.

**Nog open:** de Yibbi Midbow GF wint nog vaak bij de jeugd, met een niveau dat alleen op de prijs is geschat. De Catalogus-verrijker neemt deze stick in zijn eerste ronde mee (nummer 2 op de lijst).

## 2026-10-19 — methodiekpagina bijgewerkt (v12)

De methodiekpagina legt nu uit:
- dat we met de actuele PassaHockey-prijs rekenen als PassaHockey de stick verkoopt;
- dat bij gelijke score de stick met meer gegevens van het merk voorgaat;
- dat een stick met alleen een geschat niveau, en zonder gegevens van het merk, 3 punten aftrek krijgt.

Gecorrigeerd: de zin "sticks waarvan kerngegevens alleen bij een winkel bekend zijn, nemen we niet op in een advies" klopte niet meer sinds de import van 17 oktober.

## 2026-10-19 — Kennisartikel "Is een hockeystick met meer carbon altijd beter?" (#58)

**Wat:** `/kennis/meer-carbon-hockeystick-beter`, over het carbonpercentage binnen composietsticks (stijfheid, vergevingsgezindheid, niveau, overstappen). De tabel met bereiken per niveau wordt uit de catalogus gegenereerd; een ontbrekend percentage is "niet vermeld" en telt niet mee. Linkt naar de bestaande pagina's over begrippen, veelgemaakte fouten, low bow/mid bow, kinderen en zaalsticks.

**Bewust niet:** vaste percentages per niveau als norm, merk- of modelnamen als aanbeveling, prestatieclaims. De afbakening met brief #36 (materiaal) staat in de tekst zonder link; die link volgt zodra #36 live is.

## 2026-10-19 — "Deel dit advies"

**Wat (opdracht eigenaar):** onder het advies van de stickwijzer staat een knop "Deel dit advies". Op een telefoon opent het deelmenu (WhatsApp, Berichten, Mail …); op een computer wordt de link gekopieerd.

**Hoe het werkt:**
- **Het advies zit in de link.** Er wordt niets opgeslagen, er is geen account nodig en er wordt geen e-mailadres gevraagd. De link (`/stickwijzer/advies?a=…&s=…`) bevat de antwoorden uit de stickwijzer en de geadviseerde sticks, maar geen naam of contactgegevens.
- **De ontvanger ziet het advies opnieuw berekend,** met de prijzen en voorraad van dat moment, en de winkelknoppen met onze partnerlinks.
- **Als er iets veranderd is:** is een geadviseerde stick niet meer leverbaar, of past een andere nu beter, dan staat dat in een melding boven het advies.
- **Niet in Google:** de pagina is `noindex` en staat niet in de sitemap.
- **Kapotte link:** dan volgt een vriendelijke melding met een knop naar de stickwijzer.
- **Meten:** `advice_shared` (deelmenu of gekopieerd) en `shared_advice_opened` (met `changed`).

## 2026-10-19 — juiste aantal sticks op de homepage; "passen er X" in het advies

**Aanleiding (advies van buiten):** de homepage zei dat de stickwijzer 87 sticks vergelijkt, terwijl de catalogus 469 veldsticks toont.

**Wat klopte:** 469. De stickwijzer adviseert uit alle veldsticks, inclusief de PassaHockey-import. De 87 was een oude telling van alleen de handmatig beheerde sticks, en daarbij ook de zaalsticks. Het voorgestelde onderscheid ("87 in de stickwijzer") zou dus niet kloppen.

**Wat:**
- De homepage telt nu precies de sticks waaruit de stickwijzer kiest: alle veldsticks, inclusief de import. De tekst luidt "vergelijkt je antwoorden met alle … veldsticks in onze catalogus".
- Het advies zegt nu hoeveel sticks bij de maat, het niveau en het budget passen (`candidateCount`), en dat daaruit de best passende worden getoond.

## 2026-10-19 — vertrouwen zichtbaar bovenaan de homepage

**Aanleiding (advies van buiten, eigenaar akkoord):** laat al in het eerste scherm zien waarom bezoekers het advies kunnen vertrouwen.

**Wat:** onder de knop "Start de stickwijzer" staat één regel met vinkjes:
- "<aantal> veldsticks van <aantal> merken" (automatisch geteld, zoals de stickwijzer ze gebruikt);
- "Bron bij elk gegeven";
- "Vergoedingen tellen niet mee in het advies";
- de link "Zo werkt ons advies →" naar /methodiek.

Bewust níet het woord "onafhankelijk", omdat de site partnerlinks heeft. "Geen account nodig · 6 tot 11 korte stappen" is weg uit de hero; op de stickwijzer-pagina staat al dat je geen account nodig hebt. Op 1366×768 en 390×844 staat de regel boven de vouw.

**Aanpassing 2026-10-19 (keuze eigenaar):** "Vergoedingen tellen niet mee in het advies" is bovenaan vervangen door "Onafhankelijk advies". Dat is verdedigbaar, want de score kent geen invoer voor vergoeding, winkel of merk. De partnerlinks blijven bij elke winkelknop vermeld, en /methodiek legt uit hoe het zit.

## 2026-10-21 — content-agent alleen voor de eigenaar en medewerkers

**Aanleiding (eigenaar):** voorkomen dat anderen het Claude-abonnement van de eigenaar gebruiken.

**Risico:** de repository is openbaar. De content-agent (`claude.yml`) startte op elke "@claude" in een issue of reactie, en dat kan iedereen met een GitHub-account typen. De Claude-actie controleert zelf al op schrijfrechten, maar de workflow startte wel.

**Wat:** de workflow start nu alleen als de schrijver van het issue, de reactie of de review `OWNER`, `MEMBER` of `COLLABORATOR` is. Het label `akkoord` vraagt al schrijfrechten en blijft werken.

**Wat al zo was:**
- Geheime sleutels zijn in GitHub na het opslaan niet meer te lezen en worden in logs weggestreept.
- Pull requests van buitenstaanders krijgen geen sleutels.
- Geen enkele agent zet zelf "@claude" neer.

## 2026-10-21 — beveiligingscontrole

**Gecontroleerd en in orde:**
- HTTPS met HSTS en doorverwijzing naar https://jouwhockeystick.nl.
- Geen sleutels in de code of de git-geschiedenis; `.env`-bestanden staan in `.gitignore`.
- In de browser alleen openbare waarden: het site-ID van bol.com en de projectsleutel van PostHog.
- De invoer van stickwijzer en interesseformulier wordt gecontroleerd met Zod. Netlify filtert spam, met een honeypot-veld.
- Geen database, dus geen Row Level Security nodig.
- De workflows hebben beperkte rechten, gebruiken geen `pull_request_target` en zetten geen issuetekst ongecontroleerd in een opdracht.

**Opgelost:**
- **JSON-LD veilig weggeschreven.** De gestructureerde gegevens werden met `JSON.stringify` in een `<script>`-tag gezet. Een naam met `</script>`, bijvoorbeeld uit de PassaHockey-feed, had daarmee code kunnen uitvoeren. Nu loopt het via `jsonLdHtml` (`src/lib/jsonLd.ts`), die `<`, `>` en `&` escapet.
- **Beveiligingsheaders erbij:** `frame-ancestors 'self'` en `X-Frame-Options` (tegen clickjacking), `Referrer-Policy` en `Permissions-Policy`. De header `X-Powered-By` staat uit.
- **Pakketten bijgewerkt.** Next.js 16.3.6 → 16.4.2 (een cache-probleem), plus `sharp` en `source-map-js` via `npm audit fix`. Voor wat live draait, meldt `npm audit` nu 0 kwetsbaarheden.

**Bewust niet:**
- Een volledige Content-Security-Policy. Die vraagt een nonce-opzet voor de inline scripts van Next.js en de analytics, met een risico dat de site breekt; dat is een apart traject.
- De overgebleven meldingen in de lint-tooling (alleen ontwikkeling). De voorgestelde "fix" is een oude major versie.

## 2026-10-21 — wekelijkse Beveiligingscontrole

**Wat:** Een nieuwe workflow `security.yml` (maandag 05:29 UTC, vóór de Orchestrator). Hij controleert de live site (headers, doorverwijzingen, certificaat), draait `npm audit` en `npm outdated` en zoekt naar sleutels in de code. Het rapport komt in het issue met label `beveiliging`, dat de Orchestrator meeleest. Zijn er updates binnen de huidige versiegrenzen (`npm update` en `npm audit fix`, nooit met `--force`), dan opent hij één PR, maar alleen als lint, typecheck, tests en build slagen.

**Reden:** Verzoek van de eigenaar om de beveiliging en de onderliggende software elke week te laten controleren.

**Belangrijke keuzes:**
- Grote versies (major, bijv. TypeScript 7 en ESLint 10) gaan nooit automatisch; die staan in het rapport en vragen handwerk.
- De agent merget nooit. Een merge zet de updates live.
- Het rapport noemt bij een gevonden sleutel alleen het bestand en de soort, nooit de waarde: de repo is openbaar.
- Accounts (tweestapsverificatie) kan de agent niet controleren; dat staat in het rapport als werk voor de eigenaar.

**Betrokken bestanden:** `src/security/securityReport.ts`, `scripts/security-check.ts`, `.github/workflows/security.yml`, `docs/beveiliging.md`, `docs/orchestrator.md`.

## 2026-10-22 — Verbeteringen na de eerste Search Console- en conversiecijfers

**Aanleiding:** advies aan de eigenaar op basis van het Search Console-rapport (19 september t/m 16 oktober: 410 vertoningen, gemiddelde positie 24,7) en het conversierapport (12 t/m 18 oktober). De eigenaar vroeg alle adviezen te verwerken.

**Wat:**
- **/zaalsticks op "zaalhockeystick":** de pagina stond op positie 8–15 voor acht varianten van die zoekterm. De titel is nu "Zaalhockeystick kiezen: waar let je op in de zaal?" en de eerste zin noemt het woord. Er is een blok met veelgestelde vragen bijgekomen; de prijsvraag wordt uit de catalogus berekend. De ankerteksten op de homepage en in drie zaalartikelen zeggen nu "zaalhockeystick kiezen". De zin "een zaalstick is lichter en dunner dan een veldstick" op de homepage is vervangen: volgens de spelregels gelden dezelfde maximale eisen (zie de pagina zelf). Er is geen nieuwe pagina gemaakt; het besluit van 2026-10-08 tegen kannibalisatie blijft staan.
- **Dead clicks:** de knop "Volgende/Bekijk advies" in de stickwijzer was grijs en deed niets zolang een vraag openstond. Hij is nu altijd klikbaar; een klik met een open vraag noemt die vraag en springt ernaartoe. Op de homepage zagen de drie labels bij de foto eruit als knoppen. De foto met de labels leidt nu naar de stickwijzer (event `home_block_click` met `block: 'hero'`). Hij is voor schermlezers en het toetsenbord verborgen, omdat de hoofdknop er al staat.
- **Uitslag van de stickwijzer:** de winkelknoppen staan nu direct na de redenen en de aandachtspunten, vóór "Bronnen en methode". Op een telefoon hoef je dus minder ver te scrollen; de aandachtspunten blijven vóór de knop staan.
- **Krommingsfamilies van Grays:** elke curated Grays-stick met een JB- of DB-familie toont een tabel "De Jumbow-lijn van Grays" (of Dynabow) met carbon, niveau en richtprijs per model, uit de catalogus (`src/catalog/family.ts`). Dit is de "eigen vergelijkende alinea" van 2026-10-08. Hij heeft geen vaste prijzen in de tekst, zodat hij niet veroudert. Alleen curated sticks, want hun gegevens zijn met de hand gecontroleerd.
- **Blog en lengtetabel:** de blog blijft de hoofdpagina voor "hockeystick kiezen/kopen" (besluit 2026-10-08). De link naar de lengtetabel noemt nu "welke maat hockeystick", voor de zoekvraag "hockeystick maat".
- **Conversierapport:** de labels zeggen nu "winkel" in plaats van "bol.com", want de kliks naar PassaHockey telden al mee. Er zijn twee tabellen bijgekomen: kliks per winkel en dead clicks per element (pagina, element en tekst). Sticknamen staan er niet meer dubbel in ("Grays Grays JB 10"). Kan PostHog de elementen niet leveren, dan blijft die tabel leeg en draait de rest gewoon door.

**Niet in code:** links van andere sites (clubs, nieuwsbrieven, social bio's). Dat is werk voor de eigenaar.

**Betrokken bestanden:** `src/content/zaal.ts`, `src/app/zaalsticks/page.tsx`, `src/content/home.ts`, `src/content/articles/{veldstick-zaalhockey,zaalstick-voor-kinderen,zaalstick-budget}.ts`, `src/content/blogPosts/hockeystick-kopen.ts`, `src/components/stickwijzer/{QuizForm,RecommendationCard}.tsx`, `src/components/home/{Hero,HomeBlockLink}.tsx`, `src/lib/analytics/events.ts`, `src/catalog/family.ts`, `src/components/catalog/FamilyTable.tsx`, `src/app/sticks/[slug]/page.tsx`, `src/analytics-report/conversion.ts`, `scripts/conversion-report.ts`.

## 2026-10-22 — Catalogus-verrijker: hulpbestand van passa:import

De eerste run (met de hand gestart) maakte geen pull request. Claude had `npm run passa:import` gedraaid, en dat schrijft zonder pad een rapport naar `passa-import.md` in de hoofdmap. De veiligheidscheck "alleen src/catalog/" weigerde daarom. De workflow verwijdert dat bestand nu vóór de check, en `.gitignore` sluit het uit.

## 2026-10-22 — Shorts: hook op het eerste beeld, drie per week, lijstjes en algemene hockey

**Aanleiding (cijfers YouTube Analytics via vidIQ, 17–22 oktober):** de Short over de lengte had 138 weergaven, maar maar 16 kijkers bleven langer dan een paar seconden (YouTube vergelijkt: begin ±55% van vergelijkbare Shorts). Wie bleef, keek gemiddeld 60%, en het einde scoorde beter dan vergelijkbare Shorts. 131 van de 147 weergaven kwamen uit de Shorts-feed; de lange video's kregen er samen 9. Kleine aantallen: een signaal, geen bewijs.

**Besluit eigenaar:** inzetten op betere hooks, de frequentie "wat opvoeren, niet overdreven", ook lijstjes en algemene hockey, en vaker oproepen om te volgen.

**Wat:**
- **Hook vanaf frame 1:** de Social-studio toont de kop van de eerste scène direct en volledig (met een korte punch), in plaats van woord voor woord. Kortere opening (4–7 beats). De Remotion-video over de lengte kreeg hetzelfde, met de kop "Is de stick van je kind te lang?".
- **Ritme:** drie Shorts per week (ma lijstje, wo kennis, vr algemene hockey of kennis). Alleen woensdag ook een lange YouTube-video. Doel 13–20 seconden.
- **Hooktypes** in het veld `hook` (vraag, fout, getal, mythe, vergelijking, resultaat), afwisselend, zodat we per type kunnen meten.
- **Lijstjes** in een nieuwe scène `item`. Sticklijstjes noemen modellen (keuze eigenaar), maar zonder "beste", ranking, prijs of oordeel; alleen vaste specificaties uit de catalogus, minstens twee merken. Dit is een bewuste uitzondering op de regel "geen modelnamen als aanbeveling" in `docs/video.md` §3. De regel "geen beste-stickclaims" blijft staan.
- **Algemene hockey** mag, hooguit 1 op de 3 video's, met FIH als bron voor spelregels en zonder personen.
- **Volg-oproep** één keer, in de slot-scène onder de knop naar de stickwijzer ("Volg voor 3 stick-tips per week"), plus dezelfde zin in de beschrijving van de Short.
- **Gerelateerde video:** elke Short linkt in YouTube Studio naar de nieuwste YouTube-video.
- Regels: `docs/video.md` §7 en §7a. De Social-planner (geplande taak) is bijgewerkt.

**Bewust niet:** een volg-oproep aan het begin of halverwege (kost kijkers op het moment dat ze beslissen), meer dan drie Shorts per week vóór de evaluatie, en trending audio (we houden onze eigen muziek; op de versie zonder muziek mag de eigenaar zelf een nummer uit de bibliotheek van het platform kiezen).

**Evaluatie:** eind november, samen met de video-pilot: per hooktype en per soort het aandeel kijkers dat blijft, plus sitebezoek met `utm_source=youtube`.

## 2026-10-22 — Video's automatisch inplannen op YouTube na goedkeuring

**Besluit eigenaar:** "is er echt niet te bouwen dat we dit geautomatiseerd doorzetten naar YouTube en/of Instagram?" → ja, eerst YouTube. Dit vervangt "bewust niet: automatisch plaatsen" uit het besluit van 17 oktober (Social-studio), alleen voor YouTube.

**Wat:**
- **Goedkeuren** in de Social-studio is de enige poort: zonder klik van de eigenaar gaat er niets naar YouTube. Na goedkeuring is herschrijven vergrendeld (intrekken kan zolang hij nog niet is opgepakt).
- **Renderen op GitHub** met dezelfde code als de studio: de renderer staat nu in `video/studio/videoart.js` en de studio laadt dat bestand. Headless Chromium tekent elk beeld, ffmpeg voegt muziek en geluidseffecten toe (H.264/AAC, 30 fps).
- **Workflow *Video publiceren*** uploadt via de YouTube Data API: privé tot het geplande moment, niet voor kinderen, Sport, Nederlands; thumbnail bij de 16:9-video. Volgens de huidige documentatie blijven uploads van een niet-geverifieerd API-project niet meer op privé staan, en heeft uploaden een eigen quotum (100 per dag).
- **Geplande taak *Video-publicatie*** verbindt studio en workflow (direct na goedkeuren, plus elke ochtend 09:41) en schrijft het resultaat terug.
- **Sleutels** alleen als GitHub-secrets (`YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN`); de eigenaar maakt ze eenmalig aan volgens `docs/video.md` §10.

**Waarom niet via vidIQ:** die koppeling kan wel een Reel op Instagram zetten, maar geen eigen video op YouTube, niet inplannen, en werkt alleen in een open gesprek.

**Bewust niet (nog):** Instagram en Facebook via de API van Meta (geen eigen inplanfunctie; wij zouden het moment zelf moeten bewaken), TikTok (beoordeling door TikTok nodig), de *Gerelateerde video* van een Short (niet via de API).

## 2026-10-22 — Eén bron voor de aantallen sticks en merken

**Wat:** de homepage (twee keer) en /merken halen hun aantallen uit `getCatalogStats` (`src/catalog/stats.ts`). Die telt dezelfde lijsten die /sticks en /zaalsticks tonen, inclusief de PassaHockey-import. /merken telde eerst de handgeschreven merkprofielen; nu toont de pagina alleen profielen van merken die op dat moment in de catalogus staan. Verdwijnt een merk uit de feed, dan dalen het aantal op de homepage en op /merken dus samen. Een test (`stats.test.ts`) bewaakt dat de aantallen overeenkomen met de lijsten en dat elk merk in de catalogus een profiel heeft.

**Reden:** verzoek van de eigenaar dat het aantal op de homepage altijd gelijk blijft aan de catalogus.

## 2026-10-22 — Stickwijzer: minder schermen, dezelfde vragen (wacht op go van de eigenaar)

**Aanleiding:** de eigenaar vindt de stickwijzer lang, maar wil hem niet "te eenvoudig" maken. De data is nog te dun om vragen te schrappen (10 starts, 5 adviezen in een week).

**Wat:**
- **Schermen samengevoegd, geen vraag geschrapt.** Leeftijd, ervaring en lengte staan op één scherm "Over de speler" (id `age_experience`, waar de routesuggestie aan hangt). Ontwikkel: aannemen en basis samen, en doelen, speelstijl en gevoel samen. Prestatie: aannemen, doelen en wedstrijdacties samen, en het stickgevoel bij het tweede techniekscherm. Start gaat van 6 naar 5 schermen, Ontwikkel van 10 naar 6 en Prestatie van 11 naar 7.
- **Resterende tijd** naast de stapteller: "nog ongeveer 1 minuut" of "laatste stap". Gerekend op ongeveer 10 seconden per verplichte vraag die nog open staat (`src/content/stickwijzer/progress.ts`).
- **Conversierapport per route en scherm:** hoeveel bezoekers per route elk scherm afronden, en hoeveel daarna een advies krijgen. Het rapport herkent een scherm aan de eerste verplichte vraag die altijd gesteld wordt. Na ongeveer 50 starts laat dit zien welk scherm of welke vraag echt kost; pas dan schrappen we gericht.

**Afwijking van de specificatie:** v1.1 §2 vraagt "één vraag per scherm op mobiel". Dat deden we al niet overal (leeftijd en ervaring stonden al samen). Nu staan er twee tot vier verplichte vragen op een scherm. De reden: elk scherm is een klik "Volgende" en dus een moment om af te haken, en de vragen zijn kort (keuzerondjes). Het maximum van zes inhoudelijke schermen voor Start (§4.1) blijft gehaald.

**Aanvulling (uitslag):** op verzoek van de eigenaar begint de uitslag nu met "Onze aanbeveling(en)" en één regel met de maat ("In maat 34 inch (of 33 inch)") en het aantal passende sticks. Daarna volgen de meldingen (eigen merk, andere maat, onzeker advies), de partnerlinkregel en de sticks met hun winkelknoppen. De uitleg over het niveau, de tip voor ouders en het volledige lengteadvies staan onder de sticks, gevolgd door "Waarom dit advies?". Er is niets weggelaten; alleen de volgorde is anders.

## 2026-10-22 — YouTube: laatste klik met een label op GitHub

**Aanleiding:** de eerste goedkeuring in de Social-studio kwam niet door. De geplande taak *Video-publicatie* mocht de workflow niet starten: de veiligheidscontrole van onbeheerde taken laat een agent niet zelf iets publiceren. Dat is terecht; we omzeilen het niet.

**Besluit eigenaar:** de laatste klik ligt bij de eigenaar, op GitHub. "Klaarzetten voor YouTube" in de studio maakt een goedkeurings-issue (label `video-klaar`); het label `publiceren`, gezet door de eigenaar van de repo, start de workflow. Hetzelfde patroon als PR's mergen.

**Wat verandert:** de workflow start op dat label (met controle op de afzender), leest het script uit het issue, zet het resultaat op hetzelfde issue en sluit het bij succes. Een tweede label op een al ingepland issue doet niets. De taak start geen workflows meer; hij maakt issues en schrijft resultaten terug. De studio toont "Publiceren op GitHub →" en "Status ophalen".

## 2026-10-23 — Zaalhockeystick: kop op de homepage en keuze per budget op /zaalsticks

**Wat:**
- De kop van het zaalblok op de homepage (oktober t/m februari) is nu "Zaalhockeystick kiezen voor het zaalseizoen" in plaats van "Het zaalseizoen komt eraan". "Zaalhockeystick" is de zoekterm met de meeste vertoningen.
- Bovenaan /zaalsticks staat een blok "Zaalsticks per budget" met per prijsgroep (onder €50, €50–100, vanaf €100) twee of drie sticks. Gekozen uit de curated catalogus: niet "niet beschikbaar", één per merk, eerst de meeste gegevens van het merk zelf, dan de laagste prijs, en minstens één volwassen stick als de groep die heeft. Populariteit en vergoeding spelen geen rol. Daaronder een link naar de volledige lijst.
- De prijsgroepen staan op één plek (`src/catalog/indoorTiers.ts`), en het artikel "Zaalstick: wat krijg je voor een klein of ruim budget?" gebruikt ze ook.

**Reden:** advies na de Search Console-cijfers. Bezoekers zagen eerst een lijst van 164 sticks; nu zien ze eerst een korte keuze.

## 2026-10-23 — "Onafhankelijk" minder vaak herhalen

**Wat (besluit eigenaar):** het te vaak herhalen dat vergoeding geen rol speelt maakt het juist minder geloofwaardig. "Onafhankelijk advies" blijft bovenaan de homepage staan, en /methodiek legt het volledig uit. Weggehaald uit de intro van de stickwijzer, de footer en het blok "Zaalsticks per budget". De regel bij de winkelknoppen zegt nu alleen dat het partnerlinks zijn en dat we een vergoeding kunnen krijgen, met de link "Meer uitleg". Die vermelding blijft verplicht (CLAUDE.md, Commerce). Dit draait een deel van de wijziging van 2026-10-22 terug.

## 2026-10-23 — /sticks als landingspagina voor "veldhockeystick(s)"

**Aanleiding:** Search Console: /sticks had 143 vertoningen op een gemiddelde positie van 37, voor onder meer "veldhockeystick" en "veldhockeysticks". De pagina was alleen een lijst.

**Wat:**
- **Inhoud in `src/content/veld.ts`**, met dezelfde opzet als `zaal.ts`. H1 "Veldhockeysticks vergelijken"; `<title>` "Veldhockeysticks vergelijken: lengte, bow, carbon en niveau", met een eigen meta-omschrijving. De intro noemt "veldhockeystick" in de eerste 80 woorden en linkt naar de stickwijzer, de lengtetabel, low bow of mid bow, meer carbon, en /blog/hockeystick-kopen.
- **Blok "Veldsticks per niveau"** (beginner, gevorderd, ervaren): 2–3 curated sticks per niveau, met dezelfde regels als "Zaalsticks per budget". Die regels staan nu op één plek, in `pickVaried` (`src/catalog/picks.ts`); `tierPicks` gebruikt die ook. Het niveau-veld bestaat voor elke stick, dus indelen op budget was niet nodig.
- **Vijf veelgestelde vragen** (lengte, bow, carbon, prijs, het verschil met een zaalstick), met FAQPage-structured data uit dezelfde zichtbare tekst. Carbon en prijzen worden uit de catalogus berekend (`veldFaq`).
- De merkfilter en de volledige lijst staan eronder. Met een merkfilter actief verdwijnen de nieuwe blokken, zodat je direct de gefilterde lijst ziet. De canonical blijft /sticks.
- **Nieuw event `catalog_block_click`** (page, block, target) voor kliks in de intro, de niveaus en de FAQ. Een klik op een winkelknop telt als target "winkel"; de partnerlink zelf zit niet in het event, want die klik telt al als `retailer_click`.
- De linktest controleert nu ook de pagina-teksten van /sticks en /zaalsticks.

**Bewust niet:**
- Geen "kiezen" of "kopen" als hoofdterm (die zijn van /blog/hockeystick-kopen, besluit 2026-10-08).
- Geen nieuwe URL, geen wijziging aan de blog, geen "beste"-claims of ranking.
- Geen FAQPage op /zaalsticks: de brief nam aan dat die er al was, maar dat was niet zo. Dat is een aparte keuze.
- `catalog_block_click` staat nog niet als tabel in het conversierapport.

## 2026-10-23 — Geïmporteerde sticks op /aanbod, dicht voor crawlers (aanvulling op 2026-10-17, onderdeel Google)

**Aanleiding:** Search Console (23 oktober) toont 72 pagina's "Gevonden – momenteel niet geïndexeerd", en dat aantal stijgt. De geïmporteerde PassaHockey-sticks hadden al `noindex` en stonden niet in de sitemap. Maar /sticks, /zaalsticks, /vergelijk en "vergelijkbare sticks" linken ernaar, dus Google moest ze ophalen om de noindex te zien. Dat kost crawlbudget dat beter naar de pagina's gaat die we wel geïndexeerd willen hebben.

**Wat:**
- **Eigen pad:** geïmporteerde sticks staan op `/aanbod/<slug>`, gecontroleerde sticks blijven op `/sticks/<slug>`. Beide routes gebruiken dezelfde paginacomponent (`ProductDetail`). De noindex blijft staan.
- **robots.txt:** `Disallow: /aanbod/`; de rest is ongewijzigd.
- **Doorverwijzingen (308):** `/sticks/<geïmporteerd>` gaat naar `/aanbod/…`, en `/aanbod/<inmiddels met de hand verrijkt>` gaat naar `/sticks/…`. Een onbekende slug geeft een 404. De beslissing staat in `resolveProductRoute` (`src/catalog/productRoute.ts`).
- **Eén helper voor alle productlinks:** `productPath(product)` (`src/catalog/paths.ts`) wordt gebruikt in de lijsten, /vergelijk, vergelijkbare sticks, de stickwijzer-uitslag, de zaalkeuze, de breadcrumbs, de canonical, de structured data, de sitemap en artikellinks. `paths.ts` haalt de catalogus niet binnen, zodat browsercomponenten (de zaalkeuze) hem zonder extra gewicht kunnen gebruiken.
- **Partnerlinks:** de sub-ID's en referenties hangen aan de plek (`placement`), niet aan het pad. Op /aanbod is dat nog steeds "productpagina", dus het conversie- en verkooprapport blijven vergelijkbaar. Het signaal "veelbekeken stickpagina zonder klik" in het conversierapport telt /aanbod nu ook mee.
- **Sitemap:** bevat nog steeds alleen gecontroleerde sticks; een test bewaakt dat er geen /aanbod-URL in komt.

**Gevolg:** wordt een geïmporteerde stick met de hand verrijkt (`feedImport` verdwijnt), dan verhuist hij vanzelf naar /sticks en komt hij in de sitemap. Oude links blijven werken via de doorverwijzing.

**Bewust niet:** geen nofollow op de links, geen wijziging aan de import, de stickwijzer of de Netlify-instellingen.

**Risico en controle (na review):** omdat robots.txt /aanbod/ afsluit, kan Google de `noindex` op die pagina's niet meer lezen. URL's waar veel naar gelinkt wordt, kunnen daardoor toch in de index komen als "Geïndexeerd, maar geblokkeerd door robots.txt", zonder inhoud. Dat risico nemen we bewust: zonder blokkade moet Google elke pagina ophalen om de noindex te zien, en dat was juist het probleem. Oude `/sticks/<geïmporteerd>`-URL's die Google al kent, verwijzen door naar /aanbod en vallen daarna uit de index.
- **Controle:** kijk over 3 tot 4 weken in Search Console → Pagina's. "Gevonden – momenteel niet geïndexeerd" hoort te dalen. Verschijnen er /aanbod-URL's onder "Geïndexeerd, maar geblokkeerd door robots.txt", haal dan de `Disallow` weg en laat alleen de noindex staan.
- **Search Console-rapport:** `src/seo/searchConsole.ts` kijkt alleen naar /sticks/-pagina's. Dat blijft zo: /aanbod wordt niet geïndexeerd en hoort daar niet in te staan. Het conversierapport telt /aanbod wel mee, omdat bezoekers die pagina's wel zien.

## 2026-10-23 — Meta description van stickpagina's uit catalogusdata; wervende formuleringen herschreven

**Aanleiding:** de meta description van /sticks/[slug] en /aanbod/[slug] was gelijk aan `product.summary`. Die bevat soms merkentaal, zoals "maximale dominantie op het veld" bij de Grays JB 10. Dat botst met de regel tegen absolute prestatieclaims (CLAUDE.md).

**Wat:**
- **`productMetaDescription`** (`src/catalog/metaDescription.ts`) bouwt de description uit discipline, merk, bow, carbon, niveau en lengtes, gevolgd door "Bekijk specs, passende lengte en vergelijkbare sticks." Bijvoorbeeld: "Veldstick van Grays met low bow en 95% carbon, voor ervaren spelers. In 36,5, 37,5 en 38,5 inch. Bekijk specs, …".
  - Bow en carbon staan er alleen in als ze van het merk of een winkel-listing komen; een eigen inschatting staat (met label) op de pagina, maar niet als feit in de description. Bij 0% carbon staat er "zonder carbon".
  - Is het niveau een eigen inschatting, dan staat er "kan passen bij …" in plaats van "voor …" (22 curated sticks).
  - Een ontbrekend gegeven wordt weggelaten, nooit geschat.
  - Past de tekst niet binnen 158 tekens (`MAX_DESCRIPTION_LENGTH`, nu geëxporteerd uit `src/lib/site.ts`), dan valt eerst de lengteregel weg en daarna de slotzin.
  - Geldt ook voor geïmporteerde sticks (noindex). De title blijft "[naam]: specs en advies".
- **Herschreven (10 teksten in 8 sticks):**
  - Eigen wervende woorden: "maximale dominantie", "maximale power en respons", "een zo krachtig mogelijke stick" en "D-dominantie" in Grays JB 10, JB 12+, Brabo Elite X One LB, JDH X93 Pro Bow en Princess Premium 4K 10 Star. Die zinnen stoppen nu bij het feit (bijv. "Volledig carbon (100%)"), zonder nieuwe eigenschap zoals "stijf" die geen bron noemt (opmerking van de Review-agent).
  - Citaten met "ideal/ideale/ideaal" in Grays PB9i, Scoop WDN Junior en Indian Maharadja Arctic Wood: de inhoud van het citaat en de bron blijven, het wervende woord verdwijnt.
  - Citaten in `sourceLabel` (het bewijs bij een gegeven) blijven letterlijk staan.
- **Tests:**
  - Voor alle 545+ sticks: de description past binnen de maximale lengte, bevat geen "undefined", "null" of "NaN" en geen claimwoorden (waaronder "zo … mogelijk").
  - De eigen teksten van de curated sticks (summary, sterke punten, aandachtspunten) bevatten geen claimwoorden.

**Bewust niet:** geen wijziging aan titels, URL's, prijzen of structured data; geen offers, rating of review.

## 2026-10-23 — Core Web Vitals: /stickwijzer zonder verspringing

**Aanleiding:** PageSpeed Insights (mobiel, 23-10). /zaalsticks: prestaties 76, LCP 2,9 s, CLS 0,121. /stickwijzer (14:18): prestaties 71, LCP 3,4 s, CLS 0,401.

**Gemeten (Lighthouse 12 mobiel, lokale productiebuild; 2 runs per pagina, 4 runs voor /zaalsticks en /sticks):**
- **/stickwijzer:** CLS 0,401, bevestigd. De keuzehulp laadt alleen in de browser, met als plaatshouder één regel tekst. Zodra stap 1 verschijnt (op mobiel ongeveer 1250 px hoog), schuift de sectie "Drie routes in de stickwijzer" naar beneden.
- **/zaalsticks:** CLS 0,000 lokaal én live, ook met echte netwerkvertraging. De 0,121 van PageSpeed kon ik niet reproduceren.
- **LCP:** op /zaalsticks en /sticks is het LCP-element de introalinea. De echte render duurt lokaal ongeveer 0,17 s; de 3–3,8 s van Lighthouse is een schatting op een gesimuleerd traag netwerk. Die schatting wordt vooral bepaald door het CSS-bestand (dat het tekenen blokkeert), het vooraf geladen Bricolage-lettertype (77 KB), JavaScript en het aantal elementen (6322 op /zaalsticks, vooral de volledige lijst).
- **Blokkeertijd (TBT):** hoog op /zaalsticks (mediaan 476 ms) en /sticks (1269 ms), en sterk wisselend tussen runs. Lighthouse wijst vooral naar de grootte van de pagina's: /zaalsticks is 1,45 MB HTML (72 KB gecomprimeerd), /sticks 3,7 MB (113 KB), vooral door de volledige lijsten die zowel als HTML als in de React-gegevens meekomen.

**Wat:**
- **/stickwijzer:** de plaatshouder neemt tijdens het laden minstens één schermhoogte in op mobiel (`min-h-[100svh]`) en 34rem op bredere schermen. De sectie eronder staat daardoor al buiten beeld en verspringt niet zichtbaar.
  - Bewust geen server-gerenderde stap 1: een bezoeker met opgeslagen voortgang zou dan eerst stap 1 zien en daarna naar de juiste stap springen.
  - `ssr: false`, de vragen, de logica en de events zijn ongewijzigd.
- **Geprobeerd en teruggedraaid:** de winkelknoppen (`RetailerLink`, een client component per knop) omzetten naar server-HTML met één klikmeter in de layout. Met 4 runs per kant werd het niet beter: /zaalsticks ging van score 83,5 naar 79,5 (TBT 476 naar 597 ms), en /sticks kreeg een hogere LCP (3,03 naar 3,61 s), omdat de HTML ongeveer 8% groter werd. De regel 'geen pagina slechter' gaat voor, dus die wijziging zit niet in deze PR.

**Bewust niet:**
- Foto's blijven gehotlinkt.
- Geen wijziging aan headers, CSP of netlify.toml.
- Het lettertype is niet aangepast. Bricolage zonder optische-maat-as of zonder preload zou de geschatte LCP verlagen, maar is een merkkeuze (merkinstructie). Dat is een voorstel aan de eigenaar.
- De lijsten zijn niet ingekort. De lengte van de lijsten op /zaalsticks (164) en /sticks (470) is de grootste oorzaak van de trage meting op die pagina's; een kortere eerste weergave met "toon alle" is een voorstel aan de eigenaar.

## 2026-10-24 — IndexNow: Bing automatisch melden welke pagina's veranderd zijn

**Aanleiding:** Bing Webmaster Tools (23-10) toont pagina's als "Discovered but not crawled". De eigenaar moest indexering met de hand aanvragen.

**Wat:**
- **Sleutel:** `public/<sleutel>.txt`, met de sleutel als inhoud; dezelfde waarde staat in `src/seo/indexnow.ts`. **Deze sleutel is geen geheim:** het IndexNow-protocol vraagt hem openbaar op de eigen site, zodat Bing kan controleren dat de melding van de eigenaar van het domein komt. Hij hoort dus niet in GitHub Secrets; de regel "geen secrets in code" gaat over echte geheimen.
- **`npm run indexnow`** (`scripts/indexnow.ts`, zonder nieuwe dependencies):
  - `changed <before> <after>` vertaalt de gewijzigde bestanden naar pagina's. Productbestand → /sticks/<slug>, artikel → /kennis/<slug>, blog → /blog/<slug>, de eigen `page.tsx` van een vaste route → die route, en de inhoudsbestanden van /zaalsticks, /sticks, /, /methodiek, /merken, /clubs en /privacy.
  - Gedeelde code (layout, componenten, `[slug]`-routes, de import) telt niet mee; die stuurt geen volledige lijst.
  - `all` stuurt de hele sitemap; alleen met de hand.
  - Altijd gefilterd op de live sitemap, dus nooit /aanbod (geïmporteerde sticks), /interesse of /stickwijzer/advies. Eén verzoek per run; de URL's en de HTTP-status (200/202 = goed) staan in het log. `--dry-run` logt zonder te versturen.
- **Workflow `indexnow.yml`:** Netlify meldt zijn deploys niet aan GitHub (geen `deployment_status`, geen status op de commit). De workflow start daarom na een push naar `main` en wacht tot `/version.txt` deze commit of een nieuwere laat zien, met een time-out van 25 minuten.
  - `/version.txt` (`src/app/version.txt/route.ts`) toont de commit van de build (`COMMIT_REF` van Netlify). De repo is openbaar, dus dat zegt niets geheims.
  - Komt de commit niet live (build mislukt of overgeslagen), dan meldt hij niets en geeft hij een waarschuwing.
  - Met de hand te starten met `changed` of `all`. Alleen `contents: read`, geen secrets.

**Bewust niet:** geen Google-ping (Google doet niet mee aan IndexNow, en de oude sitemap-ping is uitgezet); geen wijziging aan netlify.toml, DNS, robots.txt of de inhoud van de sitemap; geen URL's buiten de sitemap.

## 2026-10-24 — /kennis/veldstick-zaalhockey beantwoordt "verschil veldhockey zaalhockey stick"

**Aanleiding:** Search Console: "verschil veldhockey zaalhockey stick" staat gemiddeld op positie 21. Het bestaande artikel beantwoordt die vraag, maar noemde het verschil niet expliciet. Er komt geen nieuwe pagina.

**Wat:**
- **Optionele `seoTitle` in het Article-type** (zoals `ZAAL.seoTitle`), gebruikt in de metadata van /kennis en /blog. Dit artikel krijgt "Veldstick of zaalstick: wat is het verschil?"; de H1 ("Kun je met een veldstick zaalhockeyen?") en de URL blijven gelijk.
- **Intro:** noemt "verschil" en het antwoord in de eerste 80 woorden. De regels zijn gelijk (FIH), het spel verschilt, en dat betekent iets voor je stick.
- **Bovenaan een H2 "Wat is het verschil tussen een veld- en zaalstick?"**, met drie H3's:
  - de spelregels (de bestaande FIH-tekst);
  - het gebruik (push en flick, geen slag, de bal laag);
  - de sticks volgens onze catalogus.
  - De twee oude H2's "Mag een veldstick in de zaal?" en "Wat is anders aan het zaalspel?" zijn daarin opgegaan; hun tekst is behouden.
- **Catalogusvergelijking** (`src/content/disciplineCompare.ts`): lengte, gewicht, meest voorkomende kromming en carbon van veld- tegenover zaalsticks, berekend uit de catalogus.
  - Alleen de sticks die we met de hand hebben gecontroleerd. De feedwaarden zijn niet met de hand nagekeken, en met de import erbij verschuiven de bereiken sterk: bij zaalsticks loopt carbon dan tot 95% in plaats van 30%. De tekst zegt dat erbij.
  - Een punt valt weg als een kant minder dan 3 sticks met dat gegeven heeft. Gewicht staat nu bij te weinig sticks en wordt daarom niet getoond.
  - Alles staat als "in onze catalogus", niet als algemene waarheid.
- **/zaalsticks:** de eerste FAQ linkt naar het artikel met de ankertekst "verschil tussen een veld- en zaalstick".

**Bewust niet:** geen claim "lichter en dunner" (verwijderd op 2026-10-22; een test bewaakt dat); geen nieuwe URL; geen vaste getallen in de tekst.

## 2026-10-24 — /sticks en /zaalsticks: geïmporteerde sticks pas na een klik

**Aanleiding:** de Core Web Vitals-meting van 2026-10-23 wees de volledige lijsten aan als de grootste oorzaak van de trage meting: /sticks 470 sticks (3,7 MB HTML), /zaalsticks 164 (1,45 MB).

**Besluit eigenaar:** de lijsten splitsen. De gecontroleerde sticks blijven direct op de pagina; de geïmporteerde PassaHockey-sticks laden pas na een klik. Het lettertype blijft zoals het is (merkkeuze).

**Wat:**
- **De server-HTML** van /sticks en /zaalsticks bevat de intro, de keuzeblokken en alle gecontroleerde sticks, met hun links naar /sticks/<slug>; via die links vindt Google de indexeerbare pagina's.
  - Daaronder staat de knop "Toon ook X sticks uit het aanbod van PassaHockey", met X berekend uit de catalogus.
- **Aanpak:** na de klik haalt `ImportedSticks` (client) tegelijk twee dingen op: het statische JSON-bestand `/data/aanbod-veld.json` of `/data/aanbod-zaal.json` (`src/app/data/[file]/route.ts`, `force-static`, `X-Robots-Tag: noindex`), en de code van `ProductGrid` (dynamische import). Daarmee rendert hij dezelfde kaarten als de lijst erboven.
  - Waarom niet een aparte route met server-gerenderde HTML: dan moet er HTML in de pagina worden gezet buiten React om, en tellen de winkelknoppen daarin niet mee voor `retailer_click`.
  - Waarom niet een tweede versie van de kaart: `ProductCard` werkt al in de browser, dus er is maar één kaart om bij te houden.
  - De geïmporteerde sticks zitten niet meer in de HTML of de React-gegevens van de eerste paginalading. Een test (`listSplit.test.ts`) rendert de pagina's en controleert dat geen enkele geïmporteerde slug in de HTML staat. De React-gegevens zitten in dezelfde HTML-respons van de build; daar is met `curl` gecontroleerd dat ook geen geïmporteerde slug voorkomt. `ImportedSticks` krijgt alleen het aantal mee.
- **Met een merkfilter** (/sticks?brand=…) staan alle sticks van dat merk direct op de pagina, geïmporteerde ook, en is er geen knop.
- **Aantallen:** "Bekijk alle veldsticks (N)" en de kop van de lijst blijven het totaal uit `getCatalogStats` tonen (besluit 2026-10-22). Op /zaalsticks rekent de prijsvraag in de FAQ nog steeds over alle zaalsticks.
  - Omdat de kop het totaal noemt en de lijst eerst alleen de gecontroleerde sticks toont, staat eronder: "Hieronder staan de X sticks die we met de hand hebben gecontroleerd. De Y sticks uit het aanbod van PassaHockey laad je met de knop onder de lijst." (`splitListNote`). Zo zegt de pagina eerlijk wat er staat (opmerking van de Review-agent).
- **Event:** `catalog_block_click` met `block: 'aanbod'`, `target: 'aanbod-laden'` en `page: 'sticks' | 'zaalsticks'`.

**Gemeten (lokale productiebuild, Lighthouse 12 mobiel, 4 runs voor /sticks en /zaalsticks):**
- **HTML:** /sticks van 3,70 MB naar 0,65 MB (gecomprimeerd 113 naar 50 KB), /zaalsticks van 1,45 naar 0,39 MB (72 naar 40 KB).
- **Elementen:** /sticks van 16.974 naar 2.871, /zaalsticks van 6.315 naar 1.352.
- De Lighthouse-scores wisselen sterk tussen runs op dezelfde code; zie de tabel in de PR.

**Bewust niet:** geïmporteerde sticks blijven in de stickwijzer, /vergelijk en vergelijkbare sticks; geen wijziging aan /aanbod, robots.txt of de sitemap; het lettertype blijft (merkkeuze); geen nieuwe dependencies.

## 2026-10-24 — Paden met dubbele schuine strepen: 308 naar enkele strepen

**Aanleiding:** een PageSpeed-meting op https://jouwhockeystick.nl//stickwijzer crashte met "This page couldn't load": `SecurityError: Failed to execute 'replaceState' on 'History': A history state object with URL 'https://stickwijzer/' cannot be created`. De router van Next.js leest "//stickwijzer" als de host "stickwijzer".

**Oorzaak:** lokaal stuurt `next start` zulke paden zelf al door met een 308. Live niet: Netlify serveert de gecachete pagina voor "//stickwijzer" rechtstreeks uit de CDN-cache (`Cache-Status: "Netlify Edge"; hit`, status 200). De Next-server, en dus zijn doorverwijzing, komt dan niet aan bod.

**Wat:** `src/proxy.ts` (Next 16; voorheen middleware) stuurt een pad met twee of meer opeenvolgende schuine strepen met een 308 door naar hetzelfde pad met enkele strepen, met behoud van de query string. De logica staat in `collapseSlashes` (`src/lib/slashes.ts`).
- **Waarom de proxy en niet `redirects` in next.config.ts:** die redirects voert de Next-server uit, en die wordt bij een cachetreffer op Netlify niet aangeroepen. De proxy wordt met @netlify/plugin-nextjs een Edge Function, en die draait vóór de cache.
- **Smalle matcher:** `/(/.*)` en `/(.*//.*)`. Gecontroleerd op de gebouwde regex: hij raakt //stickwijzer, ///zaalsticks en /kennis//…, en niet /stickwijzer, /, /sticks/<slug>, /_next/static/… of /data/…. Normale verzoeken komen de proxy dus niet tegen.

**Bewust niet:** geen wijziging aan netlify.toml, DNS, beveiligingsheaders of andere redirects.

## 2026-10-26 — PostHog via ons eigen domein (reverse proxy)

**Aanleiding:** PostHog → Web analytics → Installation Health meldt "Reverse proxy: some metrics may not be accurate". Adblockers blokkeren verzoeken naar eu.i.posthog.com, ook de cookieloze meting.

**Besluit eigenaar (26-10-2026):** PostHog-verkeer via het eigen domein laten lopen, inclusief akkoord op een aanpassing van de privacytekst.

**Wat:**
- **Rewrites in `next.config.ts`** volgens PostHogs Next.js-handleiding voor de EU: `/p8k/static/*` en `/p8k/array/*` gaan naar eu-assets.i.posthog.com, de rest van `/p8k/*` naar eu.i.posthog.com. Het pad `/p8k` is bewust neutraal; "ingest" of "posthog" staan op blokkeerlijsten.
  - `api_host` is nu `/p8k`; `ui_host` blijft https://eu.posthog.com.
  - De cookieloze instellingen zijn ongewijzigd.
- **`skipTrailingSlashRedirect: true`**, op advies van PostHog. Hun API-paden eindigen op een slash, en zonder deze instelling zou elke meting eerst een 308 krijgen. Om toch één URL per pagina te houden, staat er een expliciete redirect "/pagina/" → "/pagina" voor alles behalve `/p8k`; dat deed Next.js eerst zelf.
- **IP-adres:** PostHog gebruikt in de cookieloze modus het IP-adres (gehasht met een dagelijks wisselende salt, samen met browser en domein) om unieke bezoekers per dag te tellen. De rewrite van Next.js geeft de headers van het verzoek ongewijzigd door, en Netlify zet daarin `X-Forwarded-For` met het IP van de bezoeker. PostHog krijgt dus, net als vóór de proxy, het IP-adres; zonder dat zouden alle bezoekers als één bezoeker tellen. Er gaan geen extra gegevens mee.
- **Privacytekst (versie 1.3, 26-10-2026):** één zin erbij: "De metingen voor PostHog gaan via ons eigen domein naar PostHog in de Europese Unie." De voorgestelde toevoeging dat PostHog het IP-adres daardoor niet ontvangt, staat er niet in, omdat dat niet klopt (zie hierboven).
- **CSP/headers:** niet gewijzigd. De CSP bevat alleen `frame-ancestors` (besluit 2026-10-21), dus er is geen connect-src of script-src die eu.i.posthog.com toestaat of nu zou moeten weghalen.
- **Conversierapport:** werkt ongewijzigd. Het filtert op `properties.$host`, en dat zet de browser uit het adres van de pagina, niet uit het adres waar het verzoek heen gaat.

**Netlify:** op Netlify voert de Next-server de rewrites uit. Elk verzoek naar `/p8k` is dus een functie-aanroep. Schatting: 4–8 verzoeken per paginaweergave (config en flags bij het laden, en gebundelde events voor pageview, klikken, heatmap en pageleave); scripts blijven in de browsercache. Dat is ongeveer 4.000–8.000 verzoeken per 1.000 paginaweergaven.

**Bewust niet:** geen wijziging aan src/proxy.ts, netlify.toml, DNS of Simple Analytics; geen cookies, opslag of opnames; het IP-adres niet weggefilterd (dan werkt de cookieloze telling niet meer).

## 2026-10-26 — Prijsvergelijking per stick: besluit en spelregels (nog niet gebouwd)

**Aanleiding:** met Plutosport (Awin) is er naast bol.com en PassaHockey een derde goedgekeurd partnerprogramma; HockeyCity, Jumbo Sports, DAKA en Decathlon zijn aangevraagd. Daarmee is vergelijken per stick haalbaar: na het advies ("welke stick past?") helpt de site ook met "waar koop ik hem?".

**Besluit eigenaar:** de prijsvergelijking komt er, als tweede stap na het advies. Eerst de spelregels en de architectuur vastleggen, dan bouwen in fasen.

**Wat (alleen documentatie):**
- **Spelregels** in `CLAUDE.md` (Commerce): sorteren op totaalprijs inclusief verzending, nooit op commissie; alle winkelknoppen gelijk; alleen de actuele feedprijs met datum; geen van-/voorprijzen of kortingsclaims; bedrag verbergen als de prijs ouder is dan 14 dagen; uitleg over sortering en vergoeding bij het blok; alleen bevestigde koppelingen en goedgekeurde programma's.
- **Architectuurnotitie** `docs/spec/prijsvergelijking.md`: gegevensmodel, koppelen van sticks tussen winkels, drie opties om prijzen actueel te houden en een gefaseerde aanpak.
- **Partnertabel** in `docs/business-model.md` §5a bijgewerkt met commissie, cookieduur en status per winkel volgens de dashboards.

**Advies architectuur (keuze eigenaar bij merge):** optie A, meeliften op de wekelijkse sync-PR. Kost geen extra Netlify-credits, want de wekelijkse merge gebeurt al, en elke prijswijziging blijft via PR, CI en preview lopen. Optie B (dagelijks, zonder PR) pas als metingen laten zien dat wekelijks te traag is; dat vraagt een apart besluit over prijsdata zonder PR en een Netlify-sleutel. Optie C (prijzen in de browser) valt af omdat de prijzen dan niet in de server-HTML staan.

**Waarom de commissie geen rol speelt:** Jumbo Sports biedt 12% en 100 dagen cookie, ruim meer dan de rest. Juist daarom liggen de sorteerregels vast voordat Jumbo live gaat: de volgorde moet uitlegbaar blijven ("Eerlijk stickadvies op maat"), en de Europese consumentenregels vragen dat een vergelijker vertelt waarop hij rangschikt.

**Bewust niet:** nog geen code, geen nieuwe winkel op de site, geen wijziging aan privacy- of cookietekst (nieuwe trackingdomeinen alleen op expliciete opdracht), geen wijziging aan de adviesscore of `ruleSetVersion`.

**Volgende stap:** fase 0, de overlapmeting met de feeds van bol.com, PassaHockey en Plutosport (`business-model.md` §5a: bij minder dan zo'n 20% overlap levert vergelijken weinig op).

## 2026-10-26 — Plutosport-feed en overlapmeting (fase 0 prijsvergelijking)

**Wat:** een script en een handmatige workflow (`scripts/plutosport-feed.ts`, `.github/workflows/plutosport-feed.yml`) lezen de productfeed van Plutosport (Awin, CSV met gzip), houden alleen de veld- en zaalhockeysticks over en koppelen die aan onze gecontroleerde catalogus. Het rapport komt in één issue (label `plutosport-feed`): per stick bol.com ja/nee, de PassaHockey-prijs, de Plutosport-prijs plus verzending, de voorraad en de koppelzekerheid, met bovenaan het aandeel sticks dat bij 2 of meer winkels te koop is en het mediane prijsverschil. Er verandert niets aan de site.

**Koppelen** (`src/catalog/plutosportFeed.ts`, volgens `spec/prijsvergelijking.md` §3.1):
- **EAN eerst.** Onze catalogus heeft geen EAN's; die komen uit de PassaHockey-feed, via de PassaHockey-pagina van de stick. Zo is de EAN-route alleen beschikbaar voor sticks die we aan PassaHockey koppelen.
- **Dan de naam:** merk, modelwoorden (dezelfde normalisatie als de PassaHockey-feed, dus "PB" = Pro Bow en "JB 12+" = "JB12+"), veld/zaal, junior/senior, bow en collectiejaar ("2025/26" en "25/26" = 2025, zoals onze modeljaren).
- **Zeker** alleen bij dezelfde EAN, of als merk, model, bow en jaar allemaal kloppen. **Twijfel** als er iets ontbreekt (geen jaar aan een van beide kanten, bow niet vermeld, extra woorden in de naam zoals "TT" of "+"). **Geen** bij een andere bow, discipline, leeftijdsgroep of jaargang.
- Lengtes worden samengevoegd via `parent_product_id`, anders via de productpagina.

**Verzendkosten:** de feed heeft geen `delivery_cost`. In `src/lib/retailers.ts` staat daarom een vast bedrag uit de openbare voorwaarden van Plutosport (https://www.plutosport.nl/bezorgen-afhalen, gelezen 2026-10-26): €6,95 (laagste tarief, DHL ServicePoint), gratis vanaf €75.

**Beveiliging:** de feed-URL bevat een API-sleutel en staat alleen in het GitHub-secret `AWIN_PLUTOSPORT_FEED_URL`. Het script print hem nooit; foutmeldingen noemen alleen de HTTP-status of het soort fout.

**Bewust niet:** geen Plutosport-knop op de site (dat is PR 2, na akkoord op het rapport), geen van-/voorprijzen of kortingskolommen in de feed, geen wijziging aan de adviesscore, `ruleSetVersion` of privacytekst, geen nieuwe dependency (de CSV-lezer en gzip gebruiken alleen Node).

**Aanvulling (2026-10-26, na de eerste run):** de feed is in Awin gefilterd op hockey (eigenaar), dus klein; de eerste run stopte op 93 regels. De ondergrens voor het aantal regels is daarom 50 (een kapotte download), en het aantal stickmodellen (minstens 15) is de echte controle. Het rapport toont nu altijd wat er in de feed zit (kolommen, productpagina's, parent-ID's, regels met maat en op voorraad, de hele feed per categorie en per merk), ook als de meting wordt afgebroken. Zo is te zien of het Awin-filter of ons filter sticks mist.

## 2026-10-27 — Plutosport als derde partnerwinkel (knop, nog geen prijzen)

**Wat:** sticks die Plutosport verkoopt, krijgen een knop "Bekijk en koop bij Plutosport" naast bol.com en PassaHockey: op de stickpagina, de catalogus, het stickadvies, de zaalkeuze en de vergelijkpagina. `retailer_click` krijgt `retailer: 'plutosport'`. Prijzen van Plutosport tonen we nog niet en er is nog geen blok "Waar te koop"; de richtprijsregel blijft gelden.

**Welke sticks:** alleen koppelingen die de matcher 'zeker' noemt (`spec/prijsvergelijking.md` §3.1), met een leverbare stick bij Plutosport. Ze staan in `src/catalog/offers/matches.ts` (gegenereerd), los van de productdata; de catalogus voegt `plutosportProductUrl` toe aan het product. Bij de eerste meting: 39 sticks, 5 gecontroleerde en 34 geïmporteerde PassaHockey-sticks, bijna allemaal via dezelfde EAN. Twijfelgevallen krijgen geen knop; ze staan als lijstje in de PR om met de hand te bevestigen.

**Trackinglink:** een Awin-deeplink, `https://www.awin1.com/cread.php?awinmid=8342&awinaffid=3132918&clickref=<plek>&ued=<productpagina>`. Niet de `pclick.php`-link uit de feed: de documentatie van Awin beschrijft `clickref` bij deeplinks, maar zegt niet dat het op `pclick.php` werkt. `src/lib/retailers.ts` accepteert alleen productpagina's op plutosport.nl (geen zoek- of categoriepagina, geen andere landensite, geen query) en valt nooit terug op een zoekopdracht. awin1.com is een nieuw trackingdomein; de privacy- en cookietekst is bewust niet aangepast (besluit eigenaar).

**Opmaak:** de Plutosport-knop heeft dezelfde opmaak als die van bol.com; geen winkel krijgt een opvallender knop vanwege de vergoeding. De vermelding bij de knoppen noemt nu alle winkels die de stick verkopen ("Niet te koop bij bol.com, wel bij PassaHockey (PassaSports) en Plutosport. De winkel waar je koopt, is dan de verkoper."). Ook de partnerlink-zin en de uitleg op /methodiek noemen Plutosport.

**Wekelijks:** de PassaHockey-sync (woensdag) draait na de import ook de Plutosport-feed en neemt een gewijzigde `matches.ts` mee in dezelfde PR (optie A: geen extra live-zetting). Mislukt de download bij Awin, dan blijven de koppelingen zoals ze waren.

**Bewust niet:** geen wijziging aan de adviesscore of `ruleSetVersion`, geen commissie in de UI, geen kortingsclaims, geen privacy- of cookietekst. Het artikel `/kennis/waar-koop-je-een-hockeystick` noemt Plutosport nog niet.

## 2026-10-27 — Plutosport-sticks die we nog niet hadden in de catalogus (import)

**Wat:** Plutosport-sticks die niet in onze catalogus staan (niet gecontroleerd en niet via PassaHockey), staan nu in de catalogus en doen mee in de stickwijzer, net als de PassaHockey-import van 2026-10-17: pagina op /aanbod met `noindex`, niet in de sitemap, alleen een Plutosport-knop ("Plutosport is de verkoper."). Bij de eerste run: 14 sticks, vooral jeugdsticks van adidas en Princess en seniorsticks van The Indian Maharadja. Ze staan in `src/catalog/imported/plutosport.ts` (gegenereerd door `npm run plutosport:feed -- --write-import`) en worden elke woensdag bijgewerkt in de PassaHockey-sync, in dezelfde PR.

**Geen dubbele sticks:**
- Een Plutosport-stick die aan een stick in de catalogus is gekoppeld, ook als twijfelgeval, wordt niet geïmporteerd. Andere kleuren van hetzelfde model (Plutosport heeft een pagina per kleur) ook niet.
- Een oudere jaargang van een stick die we al hebben (PassaHockey verkoopt de Sword 20 van 2026, Plutosport nog die van 2025), wordt niet geïmporteerd: twee bijna gelijke sticks maken het advies onduidelijk.
- Een jeugdstick herkent de matcher nu ook aan onze lengtes (onze "adidas Youngstar .9" van 31 inch heeft geen "Junior" in de naam).
- De bow wordt apart vergeleken: staat hij niet in de naam bij Plutosport, dan is dat een twijfelreden, geen uitsluiting. Een andere bow sluit nog steeds uit.

**Gegevens:**
- **Lengte:** uit het artikelnummer (`merchant_product_id`, bijv. "10221001_36 1/2"). Plutosport vult `Fashion:size` en `dimensions` niet.
- **Bow:** alleen als de naam hem noemt (ook "PB", "LB").
- **Carbon:** alleen als de omschrijving of de specificaties precies één percentage met het woord carbon noemen.
- **Modeljaar:** uit de naam of de artikelcode van The Indian Maharadja. Een bekend modeljaar vóór 2025 wordt overgeslagen, net als bij PassaHockey.
- **Niveau en posities:** onze eigen inschatting, zo vermeld.

Babysticks (18 inch) en keepersticks slaan we over.

**Teksten:** de knop en de regel op /sticks en /zaalsticks heten nu "sticks uit het aanbod van PassaHockey en Plutosport".

**Bewust niet:** geen wijziging aan de adviesscore of `ruleSetVersion` (de import gebruikt dezelfde velden en dezelfde aftrek voor een geschat niveau), geen prijzen in een blok "Waar te koop", geen privacytekst.

## 2026-10-26 — Hockeyschoenen als sectie, geen aparte site

**Besluit eigenaar:** hockeyschoenen komen als sectie `/hockeyschoenen` op jouwhockeystick.nl. Het domein jouwhockeyschoen(en).nl is geregistreerd, maar er komt geen tweede site. Een doorverwijzing volgt alleen op expliciete opdracht (DNS).

**Waarom:**
- Alles is herbruikbaar: wijzer-opzet, catalogusmodel, agents, partnerlinks en de autoriteit van het domein.
- Per verkoop blijft er veel minder over: ca. €2,20 per paar tegen €4,75 per stick. Dat komt door de lagere prijs en doordat de commissie vervalt bij retour (35% verondersteld).
- Een sectie voegt in de businesscase ca. 25% commissie toe tegen bijna geen kosten. Cijfers: `business-model.md` §5b.

**Marktverkenning:** de Marktverkenner kon deze vraag niet beantwoorden. Hij scant alleen sticks (`marketScan.ts` filtert schoenen er bewust uit) en meet geen zoekvolume. Daarom is eenmalig met de hand verkend: Decathlon (ca. 400 paren, keuzegids), Plutosport (ca. 240), Daka (125, €31–€160, pasvormadvies per merk), schoenen.nl (422 paren van ca. 10 winkels). Geen van hen combineert ondergrond, pasvorm per merk en groeimarge in één keuzehulp.

**Plan:** issue #100 (schoenenwijzer, 5 tot 8 artikelen, aparte schoenencatalogus, meetpunten na 3 maanden).

**Bewust niet:** nog geen code, geen DNS, geen wijziging aan de stickwijzer, adviesscore of `ruleSetVersion`, en de Marktverkenner nog niet uitgebreid (pas als de sectie doorgaat).

## 2026-10-27 — Prijsvergelijking fase 1: blok "Waar te koop"

**Wat:** het blok "Waar te koop" vervangt de losse winkelknoppen op de stickpagina en in elk stickadvies (`docs/spec/prijsvergelijking.md`, fase 1; ontwerp "Funnel advies naar winkel").
- **Volledige versie op de stickpagina:**
  - per winkel een kaart met de totaalprijs en daaronder prijs + verzending en de voorraad in de gekozen maat;
  - een knop "Naar [winkel]";
  - maatknoppen; de stickwijzer stuurt de geadviseerde maat mee met `?maat=`.
- **Compacte versie in de advieskaart:**
  - de twee bovenste winkels in de geadviseerde maat;
  - "Vergelijk alle N winkels" naar `#waar-te-koop` op de stickpagina, alleen bij 3 of meer winkels.
- **Beide versies:**
  - de regel "N partnerwinkels · op prijs incl. verzending · gelezen op [datum]";
  - de uitklapper "Hoe we vergelijken";
  - de partnerlink-vermelding en "de winkel is de verkoper".
- **Prijsveld:** de advieskaart en de stickpagina tonen "vanaf €X bij N partnerwinkels" als er een actuele prijs is, anders de richtprijs zoals voorheen.

**Gegevens** (`src/catalog/offers/`, alles via de wekelijkse sync-PR, optie A):
- **bol.com:** de prijs via de Marketing Catalog API (`scripts/bol-prices.ts`, nieuw bestand `bolPrices.ts`). Alleen sticks met een bevestigde bol.com-pagina; zonder prijs staat bol.com er zonder bedrag. Geeft de API minder dan de helft van de prijzen van vorige week terug, dan blijft het oude bestand staan.
- **PassaHockey:** prijs en (nieuw) leverbare lengtes in `passaPrices.ts`. Voor geïmporteerde sticks de feedgegevens van de stick zelf.
- **Plutosport:** prijs en lengtes (nieuw) in `matches.ts`. Voor geïmporteerde sticks de feedgegevens van de stick zelf.
- **Verzendkosten**, de goedkoopste standaardoptie per winkel, met bron en datum in `src/lib/retailers.ts`:
  - PassaHockey: €5,95 onder €25, €3,95 tot en met €79, gratis daarboven (passasports.nl/faq-verzenden-bezorgen);
  - Plutosport: €6,95, gratis vanaf €75 (plutosport.nl/bezorgen-afhalen);
  - bol.com: gratis vanaf €25, daaronder onbekend (€2,99 als bol.com verstuurt, niets bij een partner).

**Sortering** (`src/catalog/offers/sort.ts`, met tests):
1. Op totaalprijs (prijs + verzending; onbekende verzendkosten tellen als €0 en staan er zo bij).
2. Een winkel zonder de gekozen maat komt onder de winkels die hem wel hebben. Een winkel die geen lengtes noemt (bol.com), telt als "maat kiezen bij de winkel".
3. Zonder prijs of met een prijs ouder dan 14 dagen (hele kalenderdagen) onderaan, zonder bedrag, met de knop "Bekijk de actuele prijs".
4. Bij een gelijke prijs eerst de recentst gelezen prijs, dan alfabetisch.

Nooit op commissie, netwerk of cookieduur. De leeftijd van een prijs wordt bepaald bij het bouwen van de pagina; door de wekelijkse deploy is een prijs normaal hooguit 7 dagen oud.

**Opmaak:** alle winkelknoppen zijn een outline in veldblauw (`variant="shop"`), ook op de catalogus- en vergelijkpagina's. De rode PassaHockey-knop vervalt, zodat geen winkel opvallender is.

**Structured data:** op de stickpagina `Offer` (één winkel) of `AggregateOffer` (meer), alleen voor prijzen die zichtbaar en niet ouder dan 14 dagen zijn; anders geen `offers`.

**Meten:**
- nieuw event `offer_block_view`: blok in beeld, met plek, aantal winkels en aantal winkels met prijs;
- `retailer_click` krijgt in het blok `position`, `offerCount` en `priceShown`.

**Bewust niet:** geen kortings- of "goedkoopst"-teksten, geen van-/voorprijzen, geen wijziging aan de adviesscore of `ruleSetVersion`, geen privacytekst. Een stick zonder bevestigde winkelpagina krijgt geen bol.com-zoeklink meer in het blok (spelregel 6). Dat zijn nu 5 gecontroleerde sticks; die tonen "We kennen nog geen partnerwinkel".

## 2026-10-27 — Schoenen in de feeds: eenmalige controle (stap 2 plan /hockeyschoenen)

**Wat:** een script en een handmatige workflow (`scripts/shoe-feed-check.ts`, `.github/workflows/schoenen-feedcheck.yml`, Actions → "Schoenen in de feeds") tellen de hockeyschoenen in de PassaHockey-feed (TradeTracker) en de Plutosport-feed (Awin). Per winkel: aantal modellen, veld/zaal, junior, merken, prijsbereik en mediaan van wat op voorraad is, aandeel met EAN, en de categorieteksten waarop het filter heeft geselecteerd. Het rapport komt in één issue (label `schoenen-feed`). Plan: #100.

**Hoe:** de logica staat los in `src/catalog/shoeFeed.ts`, met tests. Hij gebruikt de bestaande feedlezers (`parseRecord` uit `passaFeed.ts` is daarvoor geëxporteerd). Een schoen is een product met "hockey" in categorie of naam en "schoen/shoe" in de categorie (of "hockeyschoen" in de naam), zonder sokken, inlegzolen, handschoenen, keeper- of ijshockeyspullen.

**Beveiliging:** de Plutosport-feed-URL bevat een API-sleutel en komt alleen uit het secret `AWIN_PLUTOSPORT_FEED_URL`; het script print hem nooit.

**Bewust niet:** geen schoenen in de catalogus of op de site, geen wijziging aan de stickfilters (`isPlayerStick`, `isHockeyStickRow`, `marketScan.ts`), de adviesscore of de privacytekst. bol.com wordt nog niet gemeten.

## 2026-10-27 — Schoenen in de feeds: strenger filter na de eerste meting

**Waarom:** de eerste meting (#107) telde 540 modellen bij PassaHockey, waaronder slippers (Adilette), schoenverzorging en volleybal- en korfbalschoenen. PassaHockey hangt één schoen in veel categorieën, en elk pad met "hockey" telde mee (bijv. "Hockey > Black Friday"). Bij Plutosport zaten er twee sticks tussen, en de overlap op naam was 0 omdat de winkels hun schoenen anders noemen.

**Wat:** een schoen telt alleen nog mee als minstens één categoriepad zelf over hockeyschoenen gaat ("Hockey > Hockeyschoenen", "Hockey > Zaalhockey > Zaalhockey schoenen", "Hockey > Schoenen > Veldhockey"), of als de naam "hockeyschoen" bevat. Paden met accessoires of verzorging, en namen met stick, slipper of sandaal vallen af. Veld of zaal volgt alleen uit die hockeyschoenenpaden. De overlap tussen de winkels wordt nu op EAN bepaald; beide feeds hebben bij elk model een EAN.

## 2026-10-27 — "Waar te koop" compacter, onder elke stick

**Waarom:** het eerste ontwerp (een kaart per winkel met een eigen knop) werd te lang. Er komen nog minstens drie partnerwinkels bij. De eigenaar wilde het compacter, met een duidelijke call to action. Na een opzet in twee varianten koos hij variant A: de bovenste rij met een iets dikkere rand, niet gevuld.

**Wat:**
- **Rijen:** elke winkel is één aanklikbare rij (min. 56 px hoog) met "Koop bij [winkel]", daaronder verzending en voorraad, en rechts de prijs incl. verzending. Volgorde zoals eerder: laagste prijs incl. verzending bovenaan (`sortOffers`). De bovenste rij met een actuele prijs heeft een rand van 2 px in veldblauw, de andere 1 px lichtgrijs. Die nadruk volgt alleen de prijs, nooit de vergoeding; CLAUDE.md en `spec/prijsvergelijking.md` zijn daarop aangepast. Nergens "goedkoopst" of "beste prijs".
- **Stickpagina:** maatknoppen, drie rijen, de rest achter "Toon nog N winkels".
- **Stickwijzer-advies:** twee rijen in de geadviseerde maat en "Vergelijk alle N winkels" naar de stickpagina.
- **Onder elke stickkaart** (catalogus, vergelijkpagina, zaalkeuze): één rij met de winkel met de laagste prijs incl. verzending, en "Vergelijk alle N winkels" als er meer zijn. Zonder winkel staat de richtprijs er, met "nog geen partnerwinkel bekend". De losse knoppen (`RetailerLinks`) en de knopvarianten `passa` en `shop` zijn weg.
- **Onder elk blok:** één regel "Op prijs incl. verzending · gelezen op [datum] · Partnerlink, de winkel is de verkoper" en de uitklapper "Hoe we vergelijken".

**Meten:** ongewijzigd. `retailer_click` met `position`, `offerCount` en `priceShown`; `offer_block_view` op de stickpagina en in het advies, niet op de honderden kaarten in de catalogus.

## 2026-10-28 — PostHog: events ongecomprimeerd door de proxy (herstel)

**Probleem:** sinds de PostHog-proxy op ons eigen domein live ging (`/p8k`, 2026-10-26), kwamen er geen events meer binnen in PostHog. De browser verstuurde ze wel, maar PostHog weigerde elk event met HTTP 400 ("invalid GZIP data", "invalid UTF8 in request payload").

**Oorzaak:** posthog-js verstuurt events gecomprimeerd (gzip). De proxy (Next.js-rewrites op Netlify) beschadigt zo'n binaire inhoud onderweg; gewone JSON komt wel heel aan. Getoetst met een testbericht met een ongeldige sleutel, dus zonder data in ons project: via de proxy geeft gzip 400 en JSON 200; rechtstreeks naar PostHog werken beide. Het laden van de scripts en de configuratie via `/p8k` werkte wel; daarom leek de koppeling in orde.

**Herstel:** `disable_compression: true` in de PostHog-instellingen. De instellingen staan nu in `POSTHOG_INIT_OPTIONS` (`src/lib/analytics/posthog.ts`), met een test. Getoetst in een echte browser op de lokale build: de events vertrekken nu als JSON. Events zijn klein, dus ongecomprimeerd versturen kost weinig.

**Verloren:** de PostHog-events van 26 oktober (na de livegang van de proxy) tot het moment dat deze wijziging live staat. Simple Analytics liep gewoon door en heeft de bezoekersaantallen over die dagen.

**Later te overwegen:** de proxy als Netlify-proxyregel (`netlify.toml`, op CDN-niveau) in plaats van een Next.js-rewrite, zodat ook gecomprimeerde verzoeken heel blijven. Niet nu: dat is op de beveiligde preview niet te testen.

## 2026-10-28 — Technische geschiktheid voor ChatGPT Search en andere AI-zoekmachines

**Audit van de live site.** Alle 115 sitemap-URL's opgehaald met de user-agent van OAI-SearchBot, en de belangrijkste pagina's ook met GPTBot, ChatGPT-User, Bingbot, PerplexityBot, ClaudeBot, Googlebot en Applebot.
- **In orde:**
  - robots.txt staat alles toe, behalve /aanbod/ (bewust);
  - geen firewall of CDN die bots weert: Netlify antwoordt elke crawler met dezelfde volledige HTML;
  - alle URL's geven 200, met een canonical naar zichzelf, geen noindex, één H1, een eigen titel en beschrijving, geldige JSON-LD (Organization/WebSite, BreadcrumbList, Product met prijzen, Article, BlogPosting, FAQPage) en 244 tot ruim 1.000 woorden tekst in de server-HTML;
  - geen weespagina's, en geen intern gelinkte pagina die in de sitemap ontbreekt;
  - `llms.txt` bestaat; IndexNow meldt wijzigingen aan Bing.
- **Kleine punten:**
  - 11 hubpagina's zonder `lastmod`;
  - 3 paren sticks met dezelfde automatische beschrijving;
  - 15 titels langer dan 60 tekens;
  - `http://www` gaat in twee stappen naar `https://` zonder www;
  - `llms.txt` en het artikel "Waar koop je een hockeystick" noemen Plutosport nog niet.

**Gedaan (veilig, alleen toevoegingen):**
- **Sitemap:** `lastmod` voor /sticks, /zaalsticks, /kennis, /blog en /privacy, uit de datum die de pagina zelf toont (of het nieuwste artikel). Dezelfde 115 URL's als live, gecontroleerd. IndexNow werkt op gewijzigde bestanden en verandert hierdoor niet.
- **Technical SEO-rapport (wekelijks):** een sectie "AI-crawlers en zoekmachines" (`src/seo/aiCrawlers.ts`). Per crawler: staat robots.txt het toe (RFC 9309), en krijgt hij met zijn eigen user-agent dezelfde HTML als een gewone bezoeker? Een blokkade op IP-adres is zo niet te zien.
- **Conversierapport (wekelijks):**
  - ChatGPT zet `utm_source=chatgpt.com` in zijn links. Dat telde als "Campagne: chatgpt.com"; nu als "AI-assistent: ChatGPT", net als een verwijzing vanaf chatgpt.com. Zo ook Perplexity, Copilot, Gemini en Claude, elk apart.
  - **Alleen exacte waarden, geen trefwoorden:**
    - verwijzende domeinen: chatgpt.com, chat.openai.com, perplexity.ai, www.perplexity.ai, copilot.microsoft.com, gemini.google.com en claude.ai;
    - `utm_source`: alleen de gedocumenteerde waarde `chatgpt.com`.

    Lijsten `AI_REFERRER_DOMAINS` en `AI_UTM_SOURCES` in `src/analytics-report/conversion.ts`.
  - **Nieuw: "Bezoeken uit AI-assistenten, per landingspagina".**
    - Een bezoek is één bezoeker op één dag (PostHog draait cookieloos en kent geen sessies).
    - De landingspagina is de eerste pageview van die dag, en de bron de `utm_source` of verwijzende site van díe pageview.
    - Elk bezoek telt één keer.

    Per pageview zou dezelfde ChatGPT-bezoeker dubbel tellen: Next.js laat de referrer bij interne navigatie staan, en de eerste pagina draagt ook de utm. Gemeten: 284 pageviews tegenover 154 bezoeken in twee weken.
  - **"Waar bezoekers vandaan komen":** de AI-regels komen nu uit dezelfde telling per bezoek, zodat ze niet dubbel tellen. De andere bronnen zijn niet veranderd.
  - **Gevalideerd tegen PostHog** met een tijdelijke stap op de PR-branch (weer verwijderd):
    - de query draait zonder fout;
    - dezelfde opbouw zonder AI-filter geeft echte landingspagina's;
    - een testbezoek met `utm_source=chatgpt.com` op /kennis/hockeystick-lengte-tabel (28 oktober, 21:5x UTC, door mij) komt er precies één keer uit. Dat testbezoek staat dus in PostHog.

**Bewust niet:** geen wijziging aan titels, beschrijvingen, canonicals, robots.txt of noindex (bestaande SEO), geen eigen bezoekregistratie van crawlers (dat vraagt een functie op elk verzoek, en die kost Netlify-credits).

## 2026-10-29 — /zaalsticks: tekst voor kiezen, kopen en vergelijken (SEO-groei, nulmeting)

**Aanleiding:** SEO-groeianalyse van /zaalsticks met akkoord van de eigenaar op de voorstellen A t/m F.
- **Search Console** (28 september t/m 25 oktober): de pagina staat voor haar hoofdzoekwoorden op pagina 2: "zaalhockeystick" op 12,8 met 99 vertoningen, "zaalstick hockey" op 14,0. Het meervoud "zaalhockeysticks" staat veel lager (35,4). De vraag "verschil veldhockey zaalhockey stick" komt binnen op /zaalsticks (23,9) en op /kennis/zaalstick-budget (15,7).
- **Teksten verouderd sinds "Waar te koop" (2026-10-27):** de beschrijving noemde "richtprijs", de prijsvraag alleen richtprijzen, en de notitie alleen bol.com als bron.

**Wat (alleen tekst; titel, H1, URL, canonical, ankers, productgegevens, winkelknoppen en structured data ongewijzigd, geen FAQPage):**
- **A. Meta description:** "Zaalhockeystick kiezen of kopen? … met alle zaalsticks uit onze catalogus naast elkaar en wekelijks bijgewerkte winkelprijzen." Er staat bewust "wekelijks bijgewerkt" en niet "actueel": de winkelprijzen komen via de wekelijkse sync en vervallen na 14 dagen.
- **B. Intro:** één zin erbij over vergelijken en de partnerwinkels, met het meervoud "zaalhockeysticks". Het antwoord blijft in de eerste 80 woorden.
- **C. Kop van de lijst:** "Alle zaalhockeysticks in onze catalogus". Het anker `#alle-zaalsticks` blijft gelijk.
- **D. Prijsvraag:** het bereik blijft een richtprijs; erbij staat dat je per stick de prijs bij de partnerwinkels ziet, "inclusief verzendkosten voor zover die bekend zijn" (bij bol.com onder €25 zijn ze onbekend), en dat die wekelijks wordt bijgewerkt.
- **E. Nieuwe FAQ "Waar kun je een zaalhockeystick kopen?":** geschreven vanuit de bezoeker ("waar je wilt"), met de tip om model en lengte mee te nemen, de partnerlink-vermelding en een link naar het winkelartikel.
- **F. Notitie bij de lijst:** de bron van een gegeven (merk of winkel) en de partnerwinkels, niet meer alleen bol.com.
- **Artikel "Waar koop je een hockeystick?":** Plutosport toegevoegd, met verzendkosten, retour (30 dagen, €1,95) en bezorging, nagekeken op plutosport.nl op 29 oktober. De H1 noemt de drie winkels. Zoektitel (nieuw, korter): "Waar koop je een hockeystick? De winkels naast elkaar". Aantallen per winkel en "bij twee of meer winkels" komen uit de catalogus. De partnerlink-uitleg blijft; erbij staat dat de winkels op prijs inclusief bekende verzendkosten staan. URL ongewijzigd. Ook de linktekst op /methodiek noemt nu de drie winkels.

**Aanvulling vóór de merge (review eigenaar):**
- **Footer:** "Aankopen verlopen via onze partnerwinkels bol.com, PassaHockey en Plutosport; de winkel is de verkoper. Winkelprijzen werken we wekelijks bij en richtprijzen zijn een indicatie: de actuele prijs zie je bij de winkel." De oude tekst noemde alleen bol.com en PassaHockey, en alleen richtprijzen.
- **`ZAAL.updatedAt` → 2026-10-29.** Die datum bepaalt de zichtbare "bijgewerkt op" (twee keer op de pagina), `dateModified` in de Article-markup en `lastmod` in de sitemap (#116).
- **Claims getoetst:**
  - De woensdagsync draaide op 21 en 28 oktober en beide PR's zijn dezelfde dag gemerged. Alle prijsbronnen (bol.com, PassaHockey, Plutosport) staan op 28 oktober.
  - "Wekelijks bijgewerkt" klopt zolang de wekelijkse sync-PR wordt gemerged. Blijft hij liggen, dan verdwijnt een prijs na 14 dagen vanzelf (`isPriceFresh`) en staat de richtprijs er weer.
  - De verzendkosten zijn het goedkoopste standaardtarief uit de openbare voorwaarden. Bij bol.com onder €25 zijn ze onbekend en staat dat erbij. Dat dekt "inclusief verzendkosten voor zover die bekend zijn".
- **Bijgesteld:** de kaarten in de lijst tonen per stick alleen de winkel met de laagste prijs en "Vergelijk alle N winkels"; de complete lijst staat op de stickpagina. Intro, prijsvraag, koop-FAQ en notitie zeggen dat nu zo ("met bij elke stick een link naar de partnerwinkels", "op de pagina van elke stick").
- **Privacyverklaring:** niet gewijzigd (alleen op akkoord van de eigenaar). Een voorstel staat in PR #117.

**Bewust niet:** geen wijziging aan het budgetartikel. Het is nu de best scorende pagina voor de vraag over het verschil, en het effect van de wijziging van /kennis/veldstick-zaalhockey (2026-10-24) is nog niet meetbaar. Geen nieuwe pagina. Geen andere volgorde van de blokken. De privacytekst noemt Plutosport nog niet; die wordt alleen op opdracht van de eigenaar aangepast.

**Nulmeting (livegang = merge-datum van deze PR):**
- **Pagina /zaalsticks** (opgave eigenaar uit Search Console): 526 vertoningen, 3 kliks, gemiddelde positie 14,3.
- **Per zoekwoord** (28 september t/m 25 oktober):

  | Zoekwoord | Positie | Vertoningen | Kliks |
  |---|---|---|---|
  | zaalhockeystick | 12,8 | 99 | 0 |
  | zaalstick hockey | 14,0 | 46 | 0 |
  | zaalhockeysticks | 35,4 | 38 | 0 |
  | hockeystick zaalhockey | 25,4 | 32 | 0 |
  | zaalsticks | 8,4 | 19 | 0 |
  | zaalhockeystick kopen | 20,0 | 4 | 1 |
  | verschil veldhockey zaalhockey stick | 23,9 (/zaalsticks), 15,7 (/kennis/zaalstick-budget) | 29 + 6 | 0 |

**Meetplan:** na 4 en na 8 weken, telkens 28 dagen in Search Console met de filter pagina = /zaalsticks.
- **Per zoekwoord:** de positie en de CTR van de zoekwoorden hierboven, en welke pagina Google kiest voor de vraag over het verschil.
- **Winkelkliks:** `retailer_click` vanaf /zaalsticks in het conversierapport (PostHog; let op de meetstoring van 26 tot 28 oktober, #113).
- **Seizoen:** november t/m februari is zaalseizoen, dus vertoningen en kliks stijgen sowieso. Beoordeel vooral de positie en de CTR per zoekwoord, en vergelijk met de seizoenstrend van de site als geheel.
- **Geen automatisch terugdraaien:** daalt de positie, dan volgt eerst een advies op basis van voldoende gegevens (besluit eigenaar). Een daling van één of twee weken is bij zo weinig vertoningen geen betrouwbaar signaal.

## 2026-10-29 — Privacyverklaring 1.4: Awin, Plutosport, partnerlinks en externe afbeeldingen; nofollow voor plutosport.nl

**Opdracht eigenaar:** de privacyverklaring bijwerken voor Plutosport/Awin, de partnerlinks en externe afbeeldingen, en het nofollow-punt uit de review van PR #117 afhandelen.

**Privacyverklaring (versie 1.4, 29 oktober), sectie "Afbeeldingen en links van derden":**
- **Afbeeldingen:** behalve de merken en bol.com ook PassaSports en Plutosport, en de beeldservers die zij gebruiken. Gecontroleerd in de catalogus: de meeste foto's komen van cdn.sportshop.com (de PassaHockey-feed), verder van media.s-bol.com, cdn.plutosport.com, de sites van de merken en een Webflow-CDN.
- **Doorklikken:** bol.com, PassaHockey of Plutosport. Erbij staat wat onze links meegeven: alleen de plek op onze site (`subid`, `reference`, `clickref`) en, bij bol.com, de naam van de stick (`name`, zie `src/lib/retailers.ts`). Geen persoonlijke kenmerken.
- **Nieuw:** wij plaatsen geen cookies, ook niet voor partnerlinks; cookies van winkels en netwerken komen pas na een klik, op hun eigen websites.
- **Nieuw: Awin en Plutosport.** Na een klik gaat de bezoeker langs awin1.com. Awin registreert technische gegevens (IP-adres, browser, tijdstip, verwijzende pagina) en geeft een klikkenmerk mee aan Plutosport. Awin en Plutosport kunnen cookies plaatsen om een aankoop toe te schrijven, en Plutosport verwerkt een bestelling onder zijn eigen beleid. Wij zien kliks en aankopen zonder naam, adres of andere identificerende gegevens.
- **Ongewijzigd:** de bestaande alinea's over bol.com en TradeTracker, en de rest van de verklaring. Ook de intro ("we plaatsen geen cookies") klopt nog.
- **Niet beoordeeld:** of en hoe Awin gegevens buiten de EER verwerkt. Dat staat in het privacybeleid van Awin. Dit is geen juridisch advies.

**Nofollow:**
- **`plutosport.nl` op de `nofollow`-lijst** (`src/content/linkPolicy.ts`), net als `passasports.nl`. Een bronlink naar een winkel in een artikel (bijv. de verzend- en retourvoorwaarden in "Waar koop je een hockeystick?") is geen winkelknop. De winkelknoppen zelf blijven partnerlinks met `rel="sponsored"`.
- **bol.com staat niet op de lijst:** het was de enige partner toen de lijst ontstond. Of bol.com-bronlinks ook `nofollow` moeten krijgen, is een open keuze voor de eigenaar.
- **Handboeken:** `docs/content-agent.md` en `docs/review-agent.md` noemen nu de drie partnerwinkels en de nofollow-regel voor winkels als bron.

## 2026-10-29 — Lengtetabel: meten zonder schoenen, compacte tabel, interne links, lengte versus leeftijd

**Aanleiding:** SEO-analyse van /kennis/hockeystick-lengte-tabel (nulmeting 157 vertoningen, 2 kliks, positie 8,1) met akkoord van de eigenaar.
- **Bewezen:** de stickwijzer vroeg de lengte "met schoenen aan", het artikel zei "zonder schoenen", terwijl ze dezelfde tabel gebruiken.
- **Bewezen:** op mobiel viel de vierde tabelkolom buiten beeld.
- **Bewezen:** stickpagina's en de advieskaart linkten niet naar de tabel.

**Wat:**
- **Overal zonder schoenen.**
  - Stickwijzer-vraag: "Hoe lang is de speler, zonder schoenen?"
  - /methodiek: "lichaamslengte zonder schoenen".
  - Zaalkeuze op /zaalsticks: "cm, zonder schoenen".
  - Het artikel en /clubs zeiden al "zonder schoenen".
  - `LENGTH_GUIDE` en de adviesregels zijn niet veranderd, dus geen nieuwe `ruleSetVersion`.
  - **Meetinstructie bij "Weet je de lengte niet precies?"** (`height_uncertain`): "laat de speler zonder schoenen rechtop tegen een muur staan…". Er stond "met hockeyschoenen aan". Die bleef bij de eerste versie van deze PR staan, omdat de test alleen op "met schoenen" zocht. Gecorrigeerd na review van de eigenaar.
  - **Leidende spec bijgewerkt** op opdracht van de eigenaar: `docs/spec/keuzehulp-instructie-v1.1.md` zegt nu bij `height_cm` en in de flow "zonder schoenen", met een wijzigingsregel bovenaan.
  - **Regressietest:** doorzoekt de hele `src`-map en de spec op "met (…)schoenen" en "schoenen aan", en controleert dat elke stickwijzer-vraag die schoenen noemt "zonder schoenen" zegt.
- **Tabel in drie kolommen:** "Lichaamslengte", "Stick (inch)" en "Kan ook (inch)".
  - De aanbevolen lengte staat ook in centimeters, in kleinere tekst ("ca. 93 cm").
  - Onder de tabel: "1 inch = 2,54 cm."
  - Alle maten en alternatieven komen nog steeds uit `LENGTH_GUIDE` en `alsoFitsInch`.
  - Een tabelcel in een artikel mag daarvoor nu `{ text, note }` zijn (`src/content/types.ts`, `ArticleBody`).
  - Op kleine schermen is de celpadding iets kleiner (`px-3`, vanaf `sm` weer `px-4`); dat geldt voor alle artikeltabellen.
- **Interne links:**
  - Op de stickpagina staat onder "Beschikbare lengtes" de zin "Welke lengte past bij jou? Bekijk de hockeystick lengte tabel."
  - Op de advieskaart staat onder de maat de link "Waarom deze maat?".
  - Geen link tijdens het invullen van de stickwijzer. Het pad staat op één plek: `LENGTH_TABLE_PATH` in `src/lib/site.ts`.
- **Sectie "Lichaamslengte, niet leeftijd":** de door de eigenaar aangeleverde tekst. Geen leeftijdstabel en geen nieuwe maatclaims.
- **Wijzigingsdatum:** het artikel krijgt `updatedAt` 2026-10-29. Die datum is zichtbaar, staat als `dateModified` in de Article-markup en als `lastmod` in de sitemap. De opbouw van de structured data verandert niet.

**Ongewijzigd:** SEO-title, meta description, H1, URL, canonical, structured data (Article en BreadcrumbList, geen FAQ), bestaande links en bronnen, productgegevens en partnerlinks. De titel en beschrijving blijven zo tot de zoekopdrachten uit Search Console zijn beoordeeld.

**Meten:** na 4 en 8 weken, zoals in de analyse. Eerst de zoekopdrachten van deze pagina exporteren uit Search Console als nulmeting per zoekwoord.

## 2026-10-30 — /sticks: meta description met aantallen, datum van het aanbod, prijs- en carbonvraag

**Wat:**
1. **Meta description.** De oude tekst (183 tekens) werd op 158 tekens afgekapt, ook in de Open Graph-beschrijving ("…per niveau en…"). Nieuw: `Vergelijk {N} veldhockeysticks van {M} merken op lengte, bow, carbon en niveau, met de bron bij elk gegeven. Plus een eerste keuze per niveau.` N en M komen uit `getCatalogStats` (dezelfde telling als de koppen en het merkfilter op de pagina), via `generateMetadata`. Met de huidige catalogus 141 tekens; met vier cijfers per aantal nog binnen 158. Ontbreekt een aantal of wordt de tekst te lang, dan valt hij terug op een vaste tekst zonder getallen (148 tekens). SEO-title, H1 en canonical zijn ongewijzigd.
2. **Datum van aanbod en prijzen.** Onder de byline staat apart: "Aanbod en winkelprijzen gelezen op {datum}" (of "tussen {datum} en {datum}" als de feeds op verschillende dagen zijn gelezen). De datums komen uit de vijf bestanden die de wekelijkse sync genereert (PassaHockey-import en -prijzen, Plutosport-import en -koppelingen, bol.com-prijzen); elk script schrijft zijn datum alleen na een geslaagde lezing. Ontbreekt een datum of is hij ongeldig, dan staat er geen regel; de huidige datum wordt nooit gebruikt (`src/catalog/feedDates.ts`).
3. **Redactionele datum.** `VELD.updatedAt` blijft alleen voor inhoudelijke wijzigingen en is daarom nu eenmalig 2026-10-30 (deze FAQ-wijziging). De sitemap-`lastmod` van /sticks volgt die datum en verandert niet bij een prijs- of catalogusupdate.
4. **Prijsvraag.** Het antwoord zegt nu dat het aantal en de prijzen juniorsticks en sticks voor volwassenen samen zijn, geeft beide ranges apart en meldt dat de ranges per niveau ook beide bevatten. Alles blijft berekend uit de catalogus.
5. **Carbonvraag.** Het bereik uit de catalogus (live 0% tot 100%: houten en glasvezelsticks naast volledig carbon) is vervangen door praktische uitleg in lijn met het carbonartikel, met de link ernaar.

**Reden:** analyse van /sticks op 2026-10-29 (afgekapte meta description, verouderd ogende datum, weinig zeggende carbonrange, prijsrange zonder vermelding van juniorsticks).

**Ongewijzigd:** SEO-title, H1, URL, canonical, FAQPage-markup (zelfde vijf vragen, tekst gelijk aan de zichtbare antwoorden), merkfilter, productaantallen, de lijst en de knop met feedsticks, winkelknoppen en partnerlinks.

**Betrokken bestanden:** `src/app/sticks/page.tsx`, `src/content/veld.ts`, `src/catalog/feedDates.ts`, `src/content/sticksSeo.test.ts`, `src/content/veld.test.ts`, `src/content/articles.test.ts`.

**Meten:** nulmeting is de Search Console-export van 29 oktober (/sticks: 0 klikken, 226 vertoningen, positie 32,54). Klikratio en vertoningen van /sticks na 4 en 8 weken vergelijken.

## 2026-10-31 — Hockeyschoenen fase 1a: datamodel, feedimport en keuzemodel als spec

**Wat:**
1. **Spec.** Het keuzemodel van de eigenaar (`advies_hockeyschoenen_keuzemodel.docx`) staat letterlijk als `docs/spec/hockeyschoenen-keuzemodel.md` en is leidend voor `/hockeyschoenen`. In `CLAUDE.md` staat een korte sectie "Hockeyschoenen" met de harde regels.
2. **Datamodel** (`src/catalog/shoes/types.ts`, Zod), los van de stickcatalogus. Elke eigenschap uit §7 is óf onbekend (`{ value: 'onbekend' }`, zonder bron), óf een `SourcedValue` met bronsoort en controledatum. Ondergronden zijn `bevestigd`/`ongeschikt`/`onbekend`; pasvorm per voorvoet, hiel en wreef apart, met de beschrijving van de bron en een code (`smal`/`normaal`/`ruim`); vochtbescherming houdt waterafstotend en waterdicht uit elkaar.
3. **Feedimport** (`src/catalog/shoes/feedImport.ts`, `scripts/shoe-import.ts`, gegenereerd `src/catalog/shoes/imported.ts`):
   - kleurpagina's van één model worden één model (merk plus genormaliseerde naam; heren, dames, junior en indoor blijven aparte modellen);
   - zelfde naam maar een ander artikelnummer in de URL (bijv. ASICS `1071a101` en `1071a133`) blijft apart, met het artikelnummer in de slug, en staat in het rapport;
   - PassaHockey en Plutosport worden alleen op EAN gekoppeld, nooit op naam;
   - alle inhoudelijke eigenschappen staan op onbekend; alleen de maten uit de feed staan erin, als winkelgegeven;
   - per winkel een listing met de goedkoopste kleur op voorraad, de laagste feedprijs, voorraad, maten (ook per maat op voorraad) en leesdatum;
   - geïmporteerde modellen hebben `feedImport` en krijgen `noindex` tot ze met de hand zijn verrijkt (zoals sticks, 2026-10-17).
4. **Veld of zaal alleen uit een winkel die het zegt.** PassaHockey zet alle schoenen in de algemene categorie "Hockeyschoenen" en alleen zaalschoenen daarnaast onder zaalhockey; een veldcategorie heeft die winkel niet. Daarom: zaal als een winkel het model (in welke kleur ook) onder zaalhockey zet of "indoor" in de naam staat; veld alleen als Plutosport het onder "Veldhockey" zet; anders onbekend. Zeggen de winkels het tegenovergestelde, dan onbekend en in het rapport. Het bestaande feedrapport (`shoe-feed-check`) telt de algemene categorie nog als veld; dat rapport verandert niet.
5. **Wekelijkse sync.** `passa-sync.yml` draait `shoes:import` na de Plutosport-stap en zet het bestand en het rapport in dezelfde PR. Kan een van beide feeds niet worden gelezen, dan blijft het bestand van vorige week staan. De Plutosport-URL komt alleen uit het secret `AWIN_PLUTOSPORT_FEED_URL`; de feedlezers en `redact` staan nu gedeeld in `scripts/shoe-feeds.ts`.
6. **Eerste bestand.** Lokaal gemaakt met alleen de PassaHockey-feed (`--passa-only`; het Awin-secret staat alleen in GitHub): 190 modellen uit 451 pagina's, 49 zaal en 141 onbekend, 0 veld. De eerste woensdagsync vult Plutosport aan, met de veldindeling en de koppelingen.

**Reden:** fase 1 van het plan voor `/hockeyschoenen` (#100), op verzoek van de eigenaar gesplitst in 1a (dit) en 1b (10–15 gecontroleerde modellen). Akkoord eigenaar op 2026-10-31: kleuren samenvoegen, eerste bestand alleen PassaHockey.

**Niet in deze stap:** pagina's, de schoenenwijzer, artikelen, gecontroleerde modellen. De privacyverklaring wordt op verzoek van de eigenaar aangepast in fase 3, als duidelijk is wat de schoenenwijzer verwerkt.

**Betrokken bestanden:** `src/catalog/shoes/*`, `src/catalog/shoeFeed.ts` (maten op voorraad en afbeelding per model), `scripts/shoe-import.ts`, `scripts/shoe-feeds.ts`, `scripts/shoe-feed-check.ts`, `.github/workflows/passa-sync.yml`, `package.json`, `docs/spec/hockeyschoenen-keuzemodel.md`, `docs/README.md`, `CLAUDE.md`.

## 2026-10-31 — Hockeyschoenen fase 1b: 13 gecontroleerde modellen

**Wat:** 13 schoenmodellen met gegevens van de merksite (gelezen op 2026-10-31), in `src/catalog/shoes/products/`: Grays AeroCage X10, AeroCage X10 Junior, Raid 2.0, Stealth en Stealth Junior; Osaka KAI Mk1 - Pro Tour en Furo Court; Brabo Elite, Force, Force Zaal en Tribute Zaal; Mizuno Wave Lynx 3 en Wave Lynx 3 Jr. Verdeling: 10 veld en 3 zaal; 7 senior en 6 junior.

**Regels die we hierbij hebben toegepast:**
1. **Alleen wat het merk zegt, letterlijk.** Elke ingevulde eigenschap heeft de URL van de productpagina, het citaat van het merk en de controledatum. Wat het merk niet noemt, blijft onbekend; per model staat in `evidenceLimits` wat niet is vastgesteld.
2. **Ondergrond alleen bij naam.** Water- of zandkunstgras is alleen bevestigd als het merk die ondergrond noemt (Grays AeroCage X10: beide; Osaka KAI: water). "All surfaces", "all pitches" of "kunstgras" is geen claim over water of zand en blijft onbekend (Grays Raid 2.0 en Stealth, Brabo, Mizuno). "Sand-based courts" bij Osaka gaat over padelbanen en telt niet als zandveld. Semi-water of hybride noemt geen enkel merk.
3. **Pasvorm alleen met een breedte.** Geen merk zegt iets over de breedte van voorvoet, hiel of wreef. Claims als "COMFORT FIT PLUS last", "Superior Heel Fit" of "sock-like fit" staan daarom bij de beperkingen, niet als pasvorm.
4. **Gewicht alleen met maat.** Mizuno noemt 340 g (senior) en 275 g (junior) zonder schoenmaat; dat gewicht blijft onbekend.
5. **Non-marking** is alleen bevestigd bij de twee Brabo-zaalschoenen, waar Brabo "non-marking zool" schrijft. Osaka Furo Court noemt het niet.
6. **Waterdicht ≠ waterafstotend:** Grays Raid 2.0 "waterproof upper" (waterdicht volgens de fabrikant), Grays Stealth "water-repellent PU vamp" (waterafstotend).
7. **Modeljaar** uit het seizoenslabel van het merk (Grays: Season_2024–2026; Osaka: "26-27"). Brabo en Mizuno noemen geen seizoen: geen modeljaar.
8. **Koppeling met de feeds op EAN.** Voor Grays, Osaka en Brabo zijn de EAN's de barcodes uit de productgegevens van het merk, van alle kleuren (`products/eans.ts`). Mizuno publiceert geen barcodes; daar zijn het de EAN's uit de PassaHockey-feed onder hetzelfde Mizuno-artikelnummer (X1GA2630, X1GC2630), met de hand bevestigd. Een feedmodel met een gedeelde EAN wordt verborgen en geeft zijn winkelgegevens aan het gecontroleerde model; de volgende sync haalt zulke modellen ook uit `imported.ts`. Daarbij bleek dat de twee Osaka-artikelen die de import apart hield (`ftw00033`, `ftw00044`) kleuren van één model zijn.

**Niet opgenomen:** ASICS en adidas (de merksite weigert automatische toegang, HTTP 403), The Indian Maharadja (geen productgegevens in de pagina) en Nike (geen hockeyschoenen op de eigen site). Voor die merken is een andere bron nodig: de eigenaar beslist of winkelgegevens (`partner-shop`, zichtbaar gemarkeerd) daarvoor mogen.

**Betrokken bestanden:** `src/catalog/shoes/products/{source,eans,grays,osaka,brabo,mizuno,index}.ts`, `src/catalog/shoes/index.ts`, `src/catalog/shoes/feedImport.ts` (`mergeListings`), tests in `src/catalog/shoes/`.

## 2026-11-01 — Hockeyschoenen: besluiten eigenaar na fase 1b

**Besluiten van de eigenaar (2026-11-01):**
1. **Winkelgegevens mogen** voor merken waarvan de site niet te lezen is (ASICS, adidas, The Indian Maharadja, Nike), zichtbaar als winkelbron (`partner-shop`).
2. **"Alle ondergronden" telt als water én zand.** Een claim van de bron als "all surfaces", "all pitches" of "every surface" bevestigt waterveld en zandveld. Semi-water of hybride blijft een eigen claim nodig hebben. "Kunstgras" of "grip in all directions" is geen claim voor alle ondergronden.
3. **Brabo Tribute Zaal blijft junior.**

**Wat er daardoor veranderde:**
- **Grays Raid 2.0, Stealth en Stealth Junior:** water en zand bevestigd (Grays: "all surfaces", "all playing surfaces").
- **Osaka KAI Mk1 - Pro Tour:** zand bevestigd via "across every surface". Water was al bevestigd. Osaka bedoelt met de claim ook padel en training; dat staat bij de beperkingen.
- **Twee modellen met winkelbron**, uit de productomschrijving in de PassaHockey-feed (de site van PassaHockey zelf weigert automatische toegang):
  - ASICS Gel-Peake 3: veld, senior;
  - The Indian Maharadja Pro Slim Indoor: zaal, senior; de eerste zaalschoen voor volwassenen met een hockeyclaim.
  Die winkelteksten zijn algemeen en verschillen per kleur. Ze leggen alleen veld of zaal en de maten vast. Ondergrond, pasvorm en non-marking blijven onbekend. EAN's komen uit de feed voor dat model.
- **adidas en Nike:** niet opgenomen, omdat het maximum van 15 modellen bereikt is. Nike heeft bovendien geen hockeyschoenen op de eigen site.

**Totaal:** 15 gecontroleerde modellen; 11 veld en 4 zaal; 9 senior en 6 junior.

**Betrokken bestanden:** `src/catalog/shoes/products/{grays,osaka,shopSourced,source,eans,index}.ts`, `src/catalog/shoes/health.test.ts`, `CLAUDE.md`.

## 2026-11-01 — Hockeyschoenen fase 2: pagina's, winkelknoppen en navigatie

**Wat:**
1. **`/hockeyschoenen`:**
   - de intro beantwoordt "welke hockeyschoenen heb je nodig?" in de eerste 80 woorden;
   - filters veld/zaal en junior/senior als gewone links (`?type=`, `?leeftijd=`), canonical `/hockeyschoenen`;
   - de gecontroleerde modellen staan als kaarten; de feedmodellen laadt een knop pas na een klik, als lichte lijst uit `/data/aanbod-schoenen.json`, net als de feedsticks (besluit eigenaar 2026-11-01; `noindex` op hun pagina's);
   - verder uitleg over de status en de "Pascontrole" uit §10.
   Een model met onbekend veld of zaal staat niet in een gefilterde lijst: onbekend telt niet als match.
2. **`/hockeyschoenen/[slug]`** voor alle modellen. Op elke pagina:
   - de statusregel "Basis en zekerheid", met bronsoort en controledatum;
   - "Waar te koop";
   - "Wat je nog moet controleren": de concrete controles die uit de onbekende eigenschappen volgen;
   - "Wat de bron zegt": per eigenschap de waarde of "Onbekend", met bronsoort, citaat, link en datum;
   - "Wat niet is vastgesteld", de pascontrole en vergelijkbare modellen (zelfde soort en leeftijdsgroep, nooit aangevuld met onbekende soorten).
   Feedmodellen krijgen `noindex` en een melding dat ze niet gecontroleerd zijn.
3. **Status per model (laag C):**
   - **onvoldoende informatie:** een feedmodel, of veld/zaal onbekend;
   - **voorwaardelijk:** gecontroleerd, met veld of zaal bevestigd;
   - **goede onderbouwing:** daarnaast ook ondergrond (veld) of non-marking (zaal) bevestigd, plus een pasvormgegeven.
   Nu staan alle 15 gecontroleerde modellen op voorwaardelijk, omdat geen enkel merk een breedte noemt. Het schoenadvies in fase 3 voegt de antwoorden van de speler toe.
4. **"Waar te koop" voor schoenen** gebruikt dezelfde `Offer`-vorm, `OfferRows` en voetregel als bij sticks: sorteren op prijs plus verzending, geen bedrag na 14 dagen, de partnerlink-vermelding en "de winkel is de verkoper". Maatknoppen zijn er niet, want schoenmaten zijn geen inch-lengtes. Wel staan de maten die de feed per maat op voorraad noemt per winkel vermeld, over alle kleuren samen, met de opmerking dat de winkel de maat bij het bestellen bevestigt. bol.com doet nog niet mee: er zijn geen bol-gegevens voor schoenen.
5. **Structured data:** `Product` met `Offer` of `AggregateOffer` alleen voor zichtbare prijzen die hooguit 14 dagen oud zijn; geen review- of rating-schema.
6. **SEO:** in de sitemap staan het overzicht en alleen de gecontroleerde modellen (lastmod = laatste controledatum); in `llms.txt` staat het overzicht; overal breadcrumbs.
7. **Navigatie:** "Hockeyschoenen" in het menu en de footer, en op de uitkomst van de stickwijzer de rustige regel "Ook nieuwe hockeyschoenen nodig?". Niet op de homepage.
8. **Analytics:**
   - `retailer_click` met de nieuwe placements `schoenpagina` en `schoenencatalogus` (`schoenwijzer` staat klaar voor fase 3);
   - `offer_block_view` op de modelpagina;
   - `catalog_block_click` met `page: 'hockeyschoenen'` en de blokken `intro`, `filters`, `modellen` en `pascontrole`;
   - het verkooprapport kent de nieuwe placements.
9. **Kleine, veilige verbredingen in gedeelde code:**
   - `RetailerLink`, `OfferRows` en `Retailer.getUrl` nemen het merk als `string`, want schoenmerken staan niet in de stick-`Brand`-lijst;
   - `OfferFoot` (de voetregel van "Waar te koop") is geëxporteerd en kent een schoentekst ("voor één paar").
   De stickpagina's veranderen niet.
10. **Foto's:** elke listing krijgt voortaan de feedafbeelding van de gelinkte kleur. Tot de volgende sync neemt de catalogus die over van het verborgen feedmodel.

**Nog niet in deze fase:** de knop naar de schoenenwijzer (fase 3) en links naar schoenartikelen (fase 4).

**Betrokken bestanden:**
- nieuw: `src/app/hockeyschoenen/{page,[slug]/page}.tsx`, `src/components/shoes/*`, `src/catalog/shoes/{offers,certainty}.ts`, `src/content/hockeyschoenen.ts` (+ test);
- gewijzigd: `src/catalog/shoes/{index,types,feedImport}.ts`, `src/lib/retailers.ts`, `src/lib/analytics/events.ts`, `src/components/ui/RetailerLink.tsx`, `src/components/offers/{OfferRows,WhereToBuy}.tsx`, `src/components/catalog/TrackedBlock.tsx`, `src/content/offers.ts`, `src/components/layout/{Header,Footer}.tsx`, `src/components/stickwijzer/QuizResult.tsx`, `src/app/sitemap.ts`, `src/app/llms.txt/route.ts`, `src/analytics-report/sales.ts`.

## 2026-11-01 — Hockeyschoenen fase 3: de schoenenwijzer (`schoen-v1.0`) en privacyverklaring 1.5

**Wat:**
1. **Vragen** (`src/content/schoenenwijzer/questions.ts`): de acht hoofdvragen uit §5 en de maatvraag. Vervolgvragen staan er alleen waar het antwoord de selectie of de uitleg verandert: tweede ondergrond, sessieduur, positie (optioneel, alleen context) en toestemming voor een duurder alternatief. De vervolgvragen over de huidige schoen (merk, model, wat past) zijn in v1 weggelaten, omdat ze de selectie nog niet veranderen. "Voor beide" geeft twee aparte adviezen.
2. **Adviesregels** (`src/shoe-advice/`, los van de stickengine):
   - **Laag A, harde voorwaarden:** veld/zaal, ondergrond of non-marking, maat en voorraad, budget. Elke voorwaarde is `voldoet`, `voldoet-niet` (uitgesloten) of `onbekend` (voorwaardelijk, met een controle).
   - **Modellen met onbekend veld/zaal** zijn geen kandidaat, omdat het de verkeerde soort schoen kan zijn.
   - **Maat:** alleen wat de feed per maat op voorraad noemt. "41,5" en "41 1/2" zijn dezelfde maat. Een maat die de winkel wel noemt maar niet op voorraad heeft, sluit het model uit; zonder maatgegevens blijft de maat onbekend.
   - **Budget:** boven het budget alleen met toestemming, en dan nooit als eerste advies.
   - **Laag B, persoonlijke aansluiting:** een geordende vergelijking zonder gewichten, in deze volgorde: boven budget, primaire voorwaarde, aantal onbekende voorwaarden, pasvormconflicten, pasvormmatches (voorvoet, hiel en wreef apart), ondergronden, leeftijdsgroep, belasting, bewegingsstijl, voorkeuren, prijs. Een latere stap telt alleen bij gelijkstand, dus een voorkeur compenseert nooit een pasvormconflict. Onbekend telt nergens. Positie wordt niet gebruikt.
   - **Leeftijdsgroep:** bij gelijke gegevens eerst het model voor de leeftijdsgroep van de speler (junior voor kind of jeugd, senior voor een volwassene). Het is nooit een uitsluiting, en komt het andere model in beeld, dan staat dat bij "Mogelijk minder geschikt wanneer".
   - **Laag C, zekerheid:**
     - onvoldoende informatie: de primaire voorwaarde (ondergrond bij veld, non-marking bij zaal) is niet bevestigd;
     - goede onderbouwing: geen onbekende harde voorwaarde, een pasvormgegeven en geen open pascontrole;
     - voorwaardelijk: al het andere.
   - **Resultaat:** hooguit drie modellen, alleen echte kandidaten: eerste pasadvies, alternatief met een ander eigenschappenprofiel en een voordeliger alternatief. Er wordt nooit opgevuld.
   - **Geen dooie advisering:** heeft geen model de primaire voorwaarde bevestigd, of valt alles af, dan volgt een eerlijke melding met de reden en een link naar het overzicht.
   - **Keepers:** een vaste begrenzingstekst, zonder schoenen.
3. **Vraag 7 blijft in de browser** (`fitNotes.ts`):
   - het antwoordschema van de server weigert vraag 7, en `toServerAnswers` laat hem weg;
   - pijn of blessure geeft alleen een vaste verwijstekst, zonder diagnose en zonder invloed op de selectie;
   - een eigen inlegzool of brace maakt "goede onderbouwing" voorwaardelijk en voegt een pascontrole toe;
   - blaren geeft een pascontrole zonder oorzaakclaim.
4. **Analytics:**
   - `quiz_start` en `quiz_complete` krijgen `quiz: 'stick' | 'schoen'`; de stickwijzer stuurt nu `'stick'`;
   - de schoenenwijzer stuurt geen antwoorden;
   - `retailer_click` met placement `schoenwijzer`;
   - het formulier heeft `ph-no-capture`, zodat PostHog-autocapture geen knopteksten van antwoorden vastlegt;
   - `before_send` haalt de querystring (met de antwoorden) van gedeelde schoenadviezen uit alle eventeigenschappen.
5. **Delen:** `/hockeyschoenen/wijzer/advies` (noindex, opnieuw berekend). De link bevat de antwoorden zonder vraag 7. `shareHref` en de deelknop zijn generiek gemaakt (pad en tekst).
6. **Pagina's en links:** `/hockeyschoenen/wijzer` staat in de sitemap en `llms.txt`, en het overzicht heeft de knop "Doe de schoenenwijzer". De wijzer adviseert alleen uit de gecontroleerde modellen.
7. **Privacyverklaring 1.5** (opdracht eigenaar, 2026-11-01):
   - nieuwe sectie "De schoenenwijzer": antwoorden niet opgeslagen, vraag 7 alleen in de browser, geen antwoorden in de statistieken, deellink zonder vraag 7;
   - de schoenenwijzer staat er ook bij in de intro, de beschrijving, de passage over partnerlinks en de passage over kinderen.

**Geverifieerd in een echte browser (Edge headless, 390 px):** de wizard doorgeklikt met pijn of blessure bij vraag 7 en maat 42. De enige POST naar de server bevat geen vraag 7, en de uitkomst toont de vaste verwijstekst, het profiel, twee modellen met redenen, controles, basis en winkelrij.

**Open punt (niet aangepast, buiten opdracht):**
- de deellink van de stickwijzer (`/stickwijzer/advies?a=…`) staat niet in de privacyverklaring;
- de antwoorden van de stickwijzer gaan via de URL en PostHog-autocapture wel in de statistieken. Dat laatste is in lijn met de tekst ("welke antwoorden vaak worden gekozen"), maar de deellink niet.

**Betrokken bestanden:**
- nieuw: `src/shoe-advice/*`, `src/content/schoenenwijzer/*`, `src/components/schoenenwijzer/*`, `src/app/hockeyschoenen/wijzer/**`;
- gewijzigd: `src/lib/analytics/{events,posthog}.ts`, `src/lib/shareAdvice.ts`, `src/components/stickwijzer/{QuizForm,ShareAdviceButton}.tsx`, `src/content/privacy.ts` (+ test), `src/content/hockeyschoenen.ts`, `src/app/hockeyschoenen/page.tsx`, `src/app/sitemap.ts`, `src/app/llms.txt/route.ts`, `CLAUDE.md`.

## 2026-11-01 — Hockeyschoenen: non-marking uit de foto, goede onderbouwing zonder pasvorm, deellink stickwijzer

**Besluiten van de eigenaar (2026-11-01, na PR #126):**
1. **Kleur van de zool:**
   - controleer de kleur van de zool op de foto's;
   - bij elke kleur behalve zwart gaan we uit van non-marking;
   - bij schoenen waar non-marking niet bevestigd is, komt een waarschuwing.
2. **"Goede onderbouwing"** mag zonder pasvormgegevens.
3. **De deellink van de stickwijzer** wordt rechtgezet in de privacyverklaring.

**Wat er daardoor veranderde:**
1. **Non-marking uit de foto:**
   - de productfoto's van de winkel (vier aanzichten per kleur) zijn op 2026-11-01 met het oog bekeken bij de twee gecontroleerde zaalschoenen zonder bevestiging door het merk:
     - Osaka Furo Court (kleur Pineneedle): donkergroene loopzool met een gomkleurig middenstuk;
     - The Indian Maharadja Pro Slim Indoor (wit en mint): lichtgrijze loopzool.
   - Geen van beide is zwart, dus beide hebben nu `indoorNonMarking` = bevestigd als **`editorial-estimate`**, met de zoolkleur en de fotopagina als bron.
   - Brabo Force Zaal en Tribute Zaal waren al bevestigd door Brabo.
   - De feedmodellen zijn niet op de foto beoordeeld; hun non-marking blijft onbekend.
2. **Waarschuwing:** elke zaalschoen zonder bevestiging door merk of winkel (een inschatting of onbekend) krijgt een waarschuwing:
   - op de modelpagina, als blok onder de status;
   - op de kaarten, kort;
   - in de uitkomst van de schoenenwijzer.
   In de eigenschappentabel staat bij een inschatting "Aangenomen (inschatting, niet bevestigd)", nooit "Bevestigd".
3. **Schoenenwijzer:** een geschatte non-marking zool telt als voldaan, maar geeft de controle "niet bevestigd door merk of winkel" en nooit "goede onderbouwing".
4. **Goede onderbouwing zonder pasvorm:**
   - **per model:** de ondergrond (veld) of de non-marking zool (zaal) is bevestigd door merk of winkel;
   - **in de wijzer:** daarnaast geen onbekende harde voorwaarde, geen open pascontrole voor een probleem dat de speler noemde, en geen conflict;
   - de teksten zeggen dat de pasvorm de eigen controle blijft;
   - gevolg: de gecontroleerde veldschoenen met een ondergrondclaim en de Brabo-zaalschoenen staan nu op goede onderbouwing.
5. **Deellink stickwijzer:**
   - de sectie "De stickwijzer" in de privacyverklaring beschrijft nu dat "Deel dit advies" de antwoorden en sticks in de link zet, dat wij die niet bewaren, en dat de antwoorden uit het webadres worden gehaald voordat het in de statistieken komt;
   - de PostHog-filter (`before_send`) haalt de antwoorden nu uit gedeelde stick- én schoenadviezen;
   - dit valt binnen versie 1.5, die nog niet live is.

**Betrokken bestanden:**
- `src/catalog/shoes/{certainty.ts,products/{source,osaka,shopSourced}.ts}`;
- `src/components/shoes/{NonMarkingWarning,ShoeCard,ShoeSpecTable}.tsx`, `src/app/hockeyschoenen/[slug]/page.tsx`, `src/components/schoenenwijzer/ShoeAdviceView.tsx`;
- `src/shoe-advice/{engine,types}.ts`, `src/content/{hockeyschoenen,privacy}.ts`, `src/content/schoenenwijzer/resultCopy.ts`, `src/lib/analytics/posthog.ts`;
- tests.

## 2026-11-01 — Hockeyschoenen fase 4: content-briefs en interne links

**Wat:**
1. **Zes content-briefs** als issues met het label `content-brief`. Elke brief heeft een vaste slug en verwijst naar de juiste paragrafen van het keuzemodel; ook staat erin wat er niet in mag (verboden claims, geen diagnose, geen vaste prijzen of maten, geen millimeterregel).
   - #127: Welke hockeyschoenen heb je nodig?
   - #128: water-, zand- of semi-waterveld
   - #129: kinderen, maat en groeiruimte
   - #130: smalle of brede voet
   - #131: zaalhockeyschoenen of gewone indoorschoenen
   - #132: wanneer zijn je hockeyschoenen versleten
2. **De agent start pas na akkoord per brief.** De briefs bevatten bewust geen "@claude": een issue van de eigenaar met "@claude" start de content-agent meteen (`claude.yml`). De agent start nu pas als de eigenaar het label `akkoord` zet. Gecontroleerd: alle runs bij het aanmaken waren "skipped".
3. **Links naar de artikelen zodra ze live staan** (`src/content/shoeArticles.ts`). Het overzicht, de modelpagina's, de uitkomst van de schoenenwijzer en het gedeelde advies tonen "Meer weten over hockeyschoenen" met alleen de artikelen die nu zichtbaar zijn, op de afgesproken slug. Zolang er geen enkel artikel is, is er geen blok. De links gaan als prop naar de wizard, zodat de browser geen artikelen laadt.
4. **Rustige verwijzingen:**
   - in de lengtetabel een zin in de laatste sectie naar `/hockeyschoenen`;
   - op `/zaalsticks` een regel naar `/hockeyschoenen?type=zaal`.
   De `updatedAt` van beide pagina's is niet veranderd: het gaat alleen om een link, niet om de inhoud.
5. **De linkcontrole in de tests** (`articles.test.ts`) kent nu `/hockeyschoenen/wijzer` en de modelpagina's, zodat schoenartikelen daarnaar kunnen linken.
6. **Handboek content-agent:** een regel voor schoenartikelen (keuzemodel, schoencatalogus, vaste slug).
7. **Issue #100** bijgewerkt met de status per stap.

**Betrokken bestanden:** `src/content/shoeArticles.ts` (+ test), `src/components/shoes/ShoeArticleLinks.tsx`, de pagina's van `/hockeyschoenen`, `src/components/schoenenwijzer/{ShoeQuiz,ShoeAdviceView}.tsx`, `src/content/articles/hockeystick-lengte-tabel.ts`, `src/content/zaal.ts`, `src/app/zaalsticks/page.tsx`, `src/content/articles.test.ts`, `docs/content-agent.md`.

## 2026-11-01 — Artikel "Welke hockeyschoenen heb je nodig?" (#127)

**Wat:** kennisartikel `/kennis/welke-hockeyschoenen-heb-je-nodig`, de uitgebreide uitleg achter `/hockeyschoenen`, in de volgorde van het keuzemodel (§2). Het aantal gecontroleerde modellen komt uit `src/catalog/shoes`.
**Bewust niet:** "beste schoen", blessure- of pasvormbeloftes, grip-/dempingsscores, prijzen, maten, millimeterregel, schoen per positie, diagnose bij pijn. Geen botsing met bestaande artikelen: geen enkel artikel behandelt schoenen.

## 2026-11-01 — /hockeyschoenen: drie intentiesecties, voortgang van de schoenenwijzer, fix geplande publicatie

**Wat (PR A uit de SEO-analyse van 2026-11-01):**
1. **Drie H2-secties op `/hockeyschoenen`:** Veldhockeyschoenen, Zaalhockeyschoenen en Hockeyschoenen voor kinderen.
   - Elke sectie beantwoordt één keuzevraag, met een feitenregel uit de catalogus (`intentFacts`), een crawlbare filterlink (`?type=veld`, `?type=zaal`, `?leeftijd=junior`) en de link naar het bijbehorende artikel zodra dat live staat (#128, #131, #129).
   - Een model met onbekend veld of zaal telt nergens mee; feedmodellen tellen alleen waar de categorie van de winkel het zegt.
   - Title, H1 en canonical zijn ongewijzigd, en er zijn geen nieuwe pagina's.
   - Meetblok `intenties` in `catalog_block_click`.
2. **Voortgang van de schoenenwijzer:**
   - "Vraag 3 van 8" telt de hoofdvragen die bij de antwoorden horen (7 bij zaal, 2 bij een keeper);
   - een vervolgvraag houdt het nummer van zijn hoofdvraag ("· aanvullende vraag");
   - de maat is "Laatste stap: je maat";
   - "stap x van y" blijft zichtbaar en de balk volgt de echte stappen;
   - zolang vraag 1 open is, telt de voortgang met het veldpad, zodat hij niet van 7 naar 8 springt;
   - de laatste stap volgt nu alleen uit de getoonde vragen;
   - metadata en intro zeggen "maximaal acht vragen … plus je maat".
3. **Fix geplande publicatie:**
   - de workflow *Geplande publicatie* draaide zonder `npm ci`;
   - sinds het eerste schoenartikel (#134) importeert de artikellijst de schoencatalogus (`zod`), en de ochtendcontrole faalde op 2026-11-01 met `ERR_MODULE_NOT_FOUND`;
   - zonder fix waren de artikelen van 2 tot en met 6 november niet automatisch live gegaan;
   - nu: npm-cache en `npm ci` vóór de planningscontrole, met een test.
4. **Publicatie gecontroleerd:**
   - een gepland artikel is vóór zijn datum (Nederlandse tijd) niet bereikbaar (`getArticleBySlug` → 404), niet in de sitemap en niet gelinkt (`shoeArticleLinks` gebruikt dezelfde zichtbare lijst);
   - de ochtendrun bouwt de site op de datum opnieuw;
   - een artikel dat ná zijn datum wordt gemerged, staat meteen live bij de merge-build.

**Restrisico:** `/hockeyschoenen` wordt per aanvraag opgebouwd en toont de link vanaf middernacht. De artikelpagina zelf komt na de ochtendbuild (ongeveer 05:00–06:00) live, tenzij die al eerder op aanvraag wordt opgebouwd. Een link kan dus een paar uur naar een pagina wijzen die nog niet in de build zit.

**Betrokken bestanden:** `src/content/hockeyschoenen.ts`, `src/content/shoeArticles.ts`, `src/app/hockeyschoenen/page.tsx`, `src/content/schoenenwijzer/questions.ts`, `src/components/schoenenwijzer/ShoeQuiz.tsx`, `src/app/hockeyschoenen/wijzer/page.tsx`, `src/lib/analytics/events.ts`, `src/components/catalog/TrackedBlock.tsx`, `.github/workflows/publicatie.yml`, `src/content/shoesSeo.test.ts`.

## 2026-11-01 — Kennisartikel: hockeyschoenen voor water-, zand- of semi-waterveld (#128, live 2026-11-02)

**Wat:** `/kennis/hockeyschoenen-waterveld-zandveld`, fase 4 van #100. Beantwoordt in de intro of je een water-, zand- of semi-waterschoen nodig hebt, hoe je je ondergrond herkent (vraag je club, denk aan uitwedstrijden) en wat "volgens de fabrikant geschikt" op onze pagina's betekent, inclusief "alle ondergronden" = water én zand (besluit 2026-11-01).
**Waarom dit onderwerp:** keuzemodel §3 (geen kunstmatige scheiding water/zand). De slug staat in `SHOE_ARTICLE_SLUGS`, dus de schoenpagina's linken er vanzelf naar zodra het live is. Geen botsing met `welke-hockeyschoenen-heb-je-nodig`: dat artikel geeft de volgorde van stappen, dit gaat alleen over de ondergrond.
**Bewust niet:** modelclaims en aantallen in vaste tekst (tellingen komen uit `src/catalog/shoes`), grip- of slijtagescores, "waterveld = lange noppen"-regels, prijzen, millimeterregel, blessure- of pijnadvies.

## 2026-11-01 — Artikel `hockeyschoenen-kinderen-maat` (#129)

- **Wat:** kennisartikel "Hockeyschoenen voor kinderen: maat en groeiruimte", live op 2026-11-03; beantwoordt hoe je de maat kiest en hoeveel groeiruimte goed is.
- **Waarom:** fase 4 van #100; de schoenpagina's linken er vanzelf naar (slug uit `shoeArticles.ts`). Basis: keuzemodel §5, §9 profiel D en §10.
- **Bewust niet:** millimeterregel, prijzen, maten of modelclaims in vaste tekst (alleen het aantal juniormodellen uit de catalogus), premiummodellen voor kinderen, advies bij pijn of blessure, grip-/dempingsscores.

## 2026-11-03 — HockeyCity als vierde partnerwinkel (fase 1: knop en prijzen)

**Opdracht eigenaar (2026-11-03):** HockeyCity heeft de samenwerking via TradeTracker goedgekeurd; toevoegen als extra partner, ook in de privacyverklaring.

1. **Trackinglink** (`src/lib/retailers.ts`): `hockeycity.nl/tracking/tradetracker/redirect/?tt=27931_1633756_517408_<plek>&r=<productpagina>`, de vorm uit de links in de productfeed van HockeyCity (campagne 27931, materiaal = de feed 1633756, onze site 517408). De plek op de site gaat als referentie mee, zoals bij PassaHockey. Alleen productpagina's (`*.html` op www.hockeycity.nl, zonder query), nooit een zoek- of categoriepagina.
2. **Feed** (`src/catalog/hockeyCityFeed.ts`, feed "HockeyCity.nl - Algemeen", XML): ongeveer 620 producten, waarvan ongeveer 260 sticks en 70 schoenen. Eén regel per productpagina, zonder lengtes of maten en met één prijs: de actuele prijs. De `fromPrice` (een hogere van-prijs bij ongeveer 130 producten) gebruiken we nergens.
3. **Sticks koppelen alleen op naam.** De GTIN's van sticks (en tassen, kleding) zijn eigen nummers van HockeyCity (prefix 52619…), geen EAN van het merk; die vergelijken we nergens. De matcher van Plutosport (`matchStick`, nu algemeen voor elke winkel) eist merk, model, bow en modeljaar. HockeyCity zet het modeljaar zelden in de naam; alleen bij The Indian Maharadja staat het in het artikelnummer (10 + jaar). Eerste run: **4 zekere koppelingen** (Indian Maharadja Gold 95), 155 twijfelgevallen. Twijfel krijgt géén knop; klopt een koppeling (zelfde model én modeljaar), dan zet de eigenaar hem in `src/catalog/offers/hockeyCityConfirmed.ts`. De wekelijkse sync-PR toont de eerste 40.
4. **Schoenen alleen op EAN** (CLAUDE.md, Hockeyschoenen): bij adidas, ASICS, Indian Maharadja, Brabo en een deel van Osaka staat de echte EAN. Een pagina gaat naar het model (gecontroleerd of uit de feeds) met die EAN; een gecontroleerd model gaat voor. Eerste run: 23 modellen. Zonder maten per voorraad zegt de site bij HockeyCity niets over maten.
5. **Wekelijks** in de PassaHockey-sync (`passa-sync.yml`), ná de schoenenimport: `npm run hockeycity:feed -- --write` schrijft `src/catalog/offers/hockeyCity.ts`. Een mislukte download laat het bestand van vorige week staan. Alleen pagina's die de feed op voorraad heeft, krijgen een knop.
6. **Verzendkosten:** de veelgestelde vragen zeggen €5 en gratis boven €75; de banner op elke pagina en de winkelmand zeggen gratis vanaf €100. We rekenen met €5 onder €100, zodat een totaalprijs nooit te laag uitvalt (bron https://www.hockeycity.nl/service/, gelezen 2026-11-03). In het artikel staan beide bedragen.
7. **Teksten:** partnerlink-vermelding, footer, methodiek, "Richtprijs · bekijk actuele prijs bij …", het artikel `waar-koop-je-een-hockeystick` (vierde kolom, met de voorwaarden van HockeyCity en bronnen), de `nofollow`-lijst voor bronlinks, de docs voor de content- en review-agent.
8. **Privacyverklaring 1.6** (opdracht eigenaar): HockeyCity bij de winkels voor productfoto's en doorklikken, en een alinea dat links naar HockeyCity via TradeTracker lopen, zoals bij PassaHockey.
9. **Verkooprapport:** dezelfde TradeTracker-login, het referentierapport van campagne 27931 als eigen kolom.

**Bewust niet:** sticks of schoenen die alleen HockeyCity verkoopt importeren (fase 2, aparte PR), maten of lengtes bij HockeyCity tonen, de van-prijs, koppelen op HockeyCity's eigen nummers.

**Betrokken bestanden:** `src/lib/retailers.ts`, `src/catalog/hockeyCityFeed.ts`, `src/catalog/plutosportFeed.ts` (matcher algemeen), `src/catalog/offers/{index,hockeyCity,hockeyCityConfirmed}.ts`, `src/catalog/{index,types,feedDates}.ts`, `src/catalog/shoes/{index,types}.ts`, `scripts/hockeycity-feed.ts`, `scripts/sales-report.ts`, `src/analytics-report/sales.ts`, `.github/workflows/passa-sync.yml`, de teksten hierboven en hun tests, `src/catalog/hockeyCityFeed.test.ts`.

## 2026-11-03 — HockeyCity fase 2: wat alleen HockeyCity verkoopt (sticks en schoenen, noindex)

**Opdracht eigenaar (2026-11-03):** ook de sticks en schoenen tonen die alleen HockeyCity verkoopt; de eigenaar wil een zo breed mogelijk aanbod ("wij bieden alles"). Keuze eigenaar: lengtes en maten van de productpagina's van HockeyCity lezen, omdat de feed ze niet heeft.

1. **Productpagina's:** de wekelijkse sync leest per HockeyCity-stick en -schoen de openbare productgegevens van de pagina (`<pagina>?format=json`, Lightspeed), één verzoek per seconde, hoogstens 500 per run, met een herkenbare user-agent. Eerste run: 177 pagina's in ongeveer 3,5 minuut, geen enkele mislukt. Kan meer dan 20% niet gelezen worden, dan schrijft de sync niets en blijven de bestanden van vorige week staan. Dit is geen feed: HockeyCity kan het blokkeren; dan meldt de sync-PR dat.
2. **Sticks die alleen HockeyCity verkoopt** (`src/catalog/imported/hockeycity.ts`): op voorraad, niet gekoppeld (zeker of twijfel) aan iets wat we al tonen (gecontroleerd, PassaHockey- of Plutosport-import), één per modelnaam. Lengtes en prijs per leverbare lengte van de productpagina. Dezelfde import als Plutosport (`toFeedProduct`, nu voor beide winkels): specs alleen van de winkel, niveau en positie onze inschatting, `noindex`, alleen de HockeyCity-knop. Twijfelgevallen worden niet apart geïmporteerd, zodat een stick nooit twee keer verschijnt.
3. **Sticks die we al hadden:** de HockeyCity-knop krijgt nu ook de leverbare lengtes en de prijs van een leverbare lengte; staat op de pagina geen lengte op voorraad, dan vervalt de knop.
4. **Schoenen** gaan door de bestaande schoenenimport (`buildShoeImport`, HockeyCity als derde winkel): EU-maten, voorraad per maat en de EAN van het merk per maat van de pagina. Een pagina met een EAN die we al kennen, wordt een winkelrij bij dat model; de rest wordt een eigen feedmodel (`src/catalog/shoes/importedHockeyCity.ts`, `noindex`), veld of zaal uit de categorie van HockeyCity ("Veldhockeyschoenen", "Zaalhockeyschoenen") als winkelbron. **Heeft een HockeyCity-schoen dezelfde naam als een model dat we al tonen maar geen gedeelde EAN, dan importeren we hem niet** (geen koppeling op naam, en ook niet dubbel tonen); de sync-PR noemt ze. UK- of US-maten nemen we nooit over. Een schoen met alleen maten onder EU 36 is een kinderschoen, ook zonder "JR" in de naam (adidas Youngstar). Een schoenendroger en riemen in de schoenencategorie vallen eruit.
5. **Merken:** "Princess Hockey" en "TK Hockey" in de feed zijn Princess en TK. **Mercian, Cyclone en Naked** zijn nieuw in de merkenlijst, met een merkprofiel dat zegt dat de gegevens van HockeyCity komen en nog niet met de merksite zijn vergeleken.
6. **Workflow:** de HockeyCity-stap draait na de Plutosport- en schoenenimport, dus wat die al tonen, wordt niet nog eens geïmporteerd; `src/catalog/shoes/importedHockeyCity.ts` mag in de sync-PR.

**Bewust niet:** twijfelgevallen automatisch koppelen of importeren, schoenen op naam koppelen, sticks zonder leverbare lengte, de van-prijs.

**Betrokken bestanden:** `src/catalog/hockeyCityFeed.ts`, `scripts/hockeycity-feed.ts`, `src/catalog/plutosportImport.ts` (import voor beide winkels), `src/catalog/shoes/{feedImport,index,types,importedHockeyCity}.ts`, `src/catalog/shoeFeed.ts`, `src/catalog/imported/hockeycity.ts`, `src/catalog/{index,types,feedImport,feedDates}.ts`, `src/catalog/offers/{index,hockeyCity}.ts`, `src/content/brands.ts`, `src/components/catalog/ImportedSticks.tsx`, `src/content/catalogLists.ts`, `.github/workflows/passa-sync.yml`, `CLAUDE.md` en de tests.

## 2026-11-03 — Redesign fase 1: minder uitleg, eerder naar de stick

**Opdracht eigenaar (2026-11-03):** een designreview van de hele site, en daarna de aanbevelingen kritisch beoordelen en in fasen uitvoeren, eerst lokaal om te bekijken. Fase 1 zijn de kleine verbeteringen; fase 2 (stickwijzer per vraag, filters in de catalogus, stickpagina in twee kolommen, lichter laden) en fase 3 (eigen fotografie, vastgelegd designsysteem) volgen na akkoord.

1. **Homepage:** de drie uitlegsecties ("Wat doet de stickwijzer?", "Drie routes", "Zo werkt het") zijn één sectie in drie stappen, met de routes als één regel. Het voorbeeldadvies en de uitgelichte sticks blijven. Het woordmerk in de hero blijft staan (merkinstructie §4: homepage-hero met pay-off), net als de zaalseizoenband (de stickwijzer adviseert geen zaalsticks).
2. **Hoofdmenu:** van acht naar zes links. Vergelijk en Blog staan nu in de footer; vergelijken begint op een stickpagina of in een advies, waar de eerste stick al gekozen is. URL's blijven gelijk.
3. **Stickadvies:** per stick drie redenen zichtbaar, de rest onder "Nog N redenen", elk nog steeds met de bron ernaast (spec §9.1 en §9.5; minimaal 2–3 zichtbare redenen). Grotere productfoto. De prijs heet "vanaf €X in [maat]", omdat die alleen winkels telt met de geadviseerde maat op voorraad; eerder stond er "bij N partnerwinkels" terwijl het blok ook rijen zonder die maat toont.
4. **Stickwijzer, eerste stap:** "Stap 1 · 5 tot 7 stappen, afhankelijk van de route"; na de routekeuze verandert er niets.
5. **Stickpagina:** grotere foto op desktop. De rij "Voorraadstatus" uit de catalogus vervalt als "Waar te koop" een actuele winkelprijs toont: daar staat de voorraad per winkel en lengte, en de algemene status sprak die soms tegen.
6. **Over ons en clubpagina:** noemden nog één of twee winkels; nu alle vier. Over ons heeft een alinea "Zo verdienen we geld" (vergoeding per aankoop, telt niet mee in het advies, winkels op volgorde van prijs incl. verzending).
7. **Merkprofielen:** Mercian aangevuld vanaf de eigen site (herkomst, 1974, productie, FIH-regels, een citaat). Voor Cyclone en Naked vonden we geen officiële merksite (nakedhockey.com is een geparkeerd domein); hun profiel zegt dat nu met datum.

**Bewust niet overgenomen uit de review:** alleen sticks met foto uitlichten (de lege vlakken in de review kwamen door lazy loading in de screenshot; alle uitgelichte sticks en gecontroleerde schoenen hebben een foto), de schoenlabels "Goede onderbouwing" en "Voorwaardelijk" hernoemen (begrippen uit het keuzemodel, laag C), contrast van grijze tekst (#5b6b7f op #eef3fa is 5,0:1 en haalt AA).

**Betrokken bestanden:** `src/components/home/StickwijzerExplainer.tsx`, `src/components/layout/{Header,Footer}.tsx`, `src/components/stickwijzer/{RecommendationCard,QuizForm}.tsx`, `src/content/stickwijzer/progress.ts`, `src/components/catalog/{ProductDetail,ProductSpecTable}.tsx`, `src/app/over-ons/page.tsx`, `src/content/clubs.ts`, `src/content/brands.ts` en de tests.

## 2026-11-03 — Redesign fase 2: structuur van wijzer, advies, catalogus en stickpagina

**Opdracht eigenaar (2026-11-03):** na akkoord op fase 1 ook fase 2 en 3 bouwen, eerst lokaal bekijken.

1. **Stickwijzer, één vraag tegelijk op mobiel (spec §1.3):** de schermen blijven zoals ze zijn, dus stappen, opgeslagen voortgang en analytics veranderen niet. Op een telefoon schuift een antwoord op een keuzevraag de volgende open vraag van het scherm in beeld, en na de laatste de knoppen (`src/content/stickwijzer/flow.ts`). Optionele vragen tellen niet mee, en bij `prefers-reduced-motion` springt het zonder animatie. **Afwijking van de review:** geen aparte schermen per vraag. Dat zou het aantal stappen verdrievoudigen, de opgeslagen voortgang en de trechter per scherm breken en botsen met "maximaal zes inhoudelijke schermen" (spec §4.1).
2. **Advies, profielkaart:** boven de sticks staan drie vakken: jouw maat (met "Waarom deze maat?"), het niveau waarvoor we adviseren en de route. Alles komt uit het advies zelf; de uitleg staat eronder.
3. **Catalogus, filters (`/sticks`):** niveau, lengte, budget, kromming en merk als gewoon GET-formulier. Het werkt zonder JavaScript, de canonical blijft `/sticks` en het bestaande `?brand=` blijft werken. Met een filter tonen we gecontroleerde én geïmporteerde sticks, 48 per pagina. Het budget telt de laagste actuele winkelprijs incl. verzending (in de gekozen lengte), anders de richtprijs. Bij nul resultaten volgt een eerlijke melding met een link naar de stickwijzer, en we versoepelen geen filter. Met een filter tonen we de merkchips niet, omdat het formulier het merk al heeft.
4. **Stickpagina, twee kolommen vanaf `lg`:** links foto, naam en details, rechts prijs en "Waar te koop", die bij scrollen in beeld blijven. Op mobiel blijft de volgorde: kop, kopen, details.
5. **Laden:** PostHog laadt met een dynamische import na het eerste beeld (305 kB onverpakt, het grootste script op elke pagina). Events van vóór dat moment wachten in een wachtrij van hoogstens 50 (`src/lib/analytics/posthogClient.ts`) en gaan in volgorde mee zodra PostHog klaar is. Lukt het laden niet, dan vervalt de wachtrij. Simple Analytics krijgt alles zoals voorheen. De PostHog-instellingen (cookieloos, proxy, gedeelde adviezen eruit) zijn ongewijzigd.
6. **Vergelijken:** sticks per merk gegroepeerd in de keuzelijst. Met één stick gekozen tonen we drie vergelijkbare sticks als directe vergelijking; zonder keuze drie voorbeeldvergelijkingen. Grotere foto's, en rijen met een verschil zijn gemarkeerd (ook voor schermlezers).
7. **Kennisbank:** vier thema's (Een stick kiezen, Zaalhockey, Hockeyschoenen, Kopen) met snelkoppelingen, kaarten met leestijd en wijzigingsdatum. Een nieuw artikel zonder thema komt onder "Meer uitleg", zodat het nooit wegvalt (`src/content/kennisThemes.ts`).
8. **Merken:** een index met logo's bovenaan die naar elk profiel springt.

**Betrokken bestanden:** `src/components/stickwijzer/{QuizForm,QuizResult}.tsx`, `src/content/stickwijzer/{flow,resultCopy}.ts`, `src/catalog/filters.ts`, `src/components/catalog/{CatalogFilters,ProductDetail}.tsx`, `src/app/sticks/page.tsx`, `src/instrumentation-client.ts`, `src/lib/analytics/{posthogClient,track}.ts`, `src/app/vergelijk/page.tsx`, `src/content/kennisThemes.ts`, `src/app/kennis/page.tsx`, `src/app/merken/page.tsx`, `src/components/ui/Card.tsx` en de tests.

## 2026-11-03 — Redesign fase 3: designsysteem vastgelegd en toegepast

**Wat:** `docs/designsysteem.md` legt vast hoe pagina's eruitzien: kleurrollen, typeschaal, drie breedtes, kaarten, foto's, ritme, beweging en wat we bewust niet doen. Bij strijd gaat de merkinstructie voor.

1. **Witte basis:** de `body` is wit in plaats van krijt. Krijt blijft het accentvlak van de merkinstructie ("lichte vlakken, achtergrond van secties"): de hero, één band op de homepage ("Zo werkt het"), meldingen en gemarkeerde rijen.
2. **Zeshoekpatroon** alleen nog in de homepage-hero en de footer, als merkaccent. Het staat niet meer achter productfoto's (catalogus, schoenen, zaalstickkiezer) en niet meer in de zaalsectie.
3. **Productfoto's** staan op wit en zijn groter in de kaarten (160 px). De foto's van merken en winkels hebben zelf een witte achtergrond, dus er staat geen wit vlak meer op een gekleurd vlak.

**Open, vraagt de eigenaar:** eigen fotografie op een club (met toestemming van ouders en club), en Over ons met foto, naam en hockeyachtergrond van de oprichter.

**Betrokken bestanden:** `docs/designsysteem.md`, `docs/README.md`, `src/app/layout.tsx`, `src/components/catalog/ProductCard.tsx`, `src/components/shoes/ShoeCard.tsx`, `src/components/zaal/IndoorSelector.tsx`, `src/app/zaalsticks/page.tsx`, `src/components/home/StickwijzerExplainer.tsx`.

## 2026-11-03 — Redesign fase 3: een gezicht in plaats van clubfotografie

**Opdracht eigenaar (2026-11-03):** foto's op een club lukken nog niet; bedenk een alternatief of houd de oude foto. Voor Over ons: deze foto, naam Hans Buursink, en als achtergrond alleen "Hockeyvader".

1. **Over ons:** portret met naam en "Hockeyvader", direct onder de inleiding. De foto is verkleind (720×960, 42 kB) en zonder metadata opgeslagen (`src/assets/over-ons/hans-buursink.jpg`), net als de herofoto's.
2. **Homepage-hero:** onder de vertrouwensregel staat een kleine link "Gemaakt door Hans Buursink, hockeyvader" met het portret, naar `/over-ons`. Klikken meten we als `home_block_click` (block `hero`, target `/over-ons`). Een echt gezicht bovenaan is het alternatief voor clubfotografie; de foto's van de jeugdspeelster blijven.
3. **Geen stockfoto's** van spelers of clubs (`docs/designsysteem.md` §9).

**Betrokken bestanden:** `src/app/over-ons/page.tsx` (+ test), `src/components/home/Hero.tsx`, `src/assets/over-ons/hans-buursink.jpg`, `src/lib/analytics/events.ts` (commentaar), `docs/designsysteem.md`.

## 2026-11-03 — Redesign fase 4: vertrouwen met bewijs

**Opdracht eigenaar (2026-11-03):** meer vertrouwen, autoriteit en bewijs inbouwen in homepage, stickwijzer, advies, vergelijken, navigatie en footer; direct bouwen in plaats van adviseren.

1. **Getelde feiten** (`src/catalog/trustFacts.ts`): veldsticks, merken, partnerwinkels, met de hand nagelopen sticks en de leesdatum van de prijzen, allemaal uit catalogus en feeds. Op de homepage als vier tegels.
2. **Vier afspraken** (`src/content/trust.ts`, `PromiseList`): de vergoeding telt nooit mee; bron en datum bij elk gegeven; actuele prijzen zonder kortingstrucs; eerlijk over de afweging. Elke afspraak linkt naar de pagina die het laat zien. Op de homepage ("Waarom jouwhockeystick.nl") en bovenaan `/methodiek`.
3. **Vergelijking met één webshop:** aanbod, prijs, keuze, gegevens en belang, neutraal over de winkel. **Bewust geen namen van andere winkels:** een vergelijking met een genoemde winkel moet per winkel objectief en controleerbaar zijn, en een winkel kan partner worden.
4. **Homepage-hero:** de tekst noemt nu ook dat je per stick ziet bij welke van de vier partnerwinkels hij te koop is, met de prijs incl. verzending.
5. **Stickwijzer:** drie zekerheden boven de eerste vraag (geen account, antwoorden in je browser, vergoedingen tellen niet mee); het aantal stappen staat in de stapteller eronder. Dezelfde beloftes als ervoor; "geen geboortedatum" staat nog bij de leeftijdsvraag zelf.
6. **Advies:** drie vaste afspraken boven de eerste stick.
7. **Footer:** vier kolommen (merk en partnervermelding, Kiezen, Leren, Over ons), met "Gemaakt door Hans Buursink, hockeyvader".

**Bewust niet:**
- **Reviews, sterren en gebruikersaantallen:** we hebben geen bron die we kunnen tonen, en het zou verboden schijnbewijs zijn (CLAUDE.md, GEO/SEO).
- **Het aandeel merkgegevens als feit op de homepage:** 33% van de specificaties van de nagelopen sticks komt van de merksite. Dat staat per gegeven op de stickpagina, maar helpt op de homepage geen keuze.

**Betrokken bestanden:** `src/catalog/trustFacts.ts`, `src/content/trust.ts` (+ test), `src/components/trust/{ProofFacts,PromiseList}.tsx`, `src/components/home/{WhyUs,HomePage,Hero}.tsx`, `src/app/stickwijzer/page.tsx`, `src/components/stickwijzer/QuizResult.tsx`, `src/content/stickwijzer/resultCopy.ts`, `src/app/methodiek/page.tsx`, `src/components/layout/Footer.tsx`, `docs/designsysteem.md`.

## 2026-11-04 — Redesign fase 5: globale UI, weg van het documentgevoel

**Opdracht eigenaar (2026-11-03):** een moderne, sportieve en strakke huisstijl met Tailwind, met duidelijke hiërarchie, subtiele kaarten met lichte schaduwen en een header die direct laat zien dat we een onafhankelijke vergelijker zijn.

1. **Header:** een donkere balk erboven: "Onafhankelijke stickvergelijker", "Prijzen van 4 partnerwinkels" (geteld uit `src/lib/retailers.ts`), "Vergoeding telt niet mee in het advies" en een link naar /methodiek. Op een telefoon staat alleen het eerste punt. De header zelf scrolt mee (sticky, licht doorschijnend). Ankers en de sticky kolom op de stickpagina houden daar ruimte voor.
2. **Diepte:** drie schaduwtokens en de utilities `card`, `card-link` en `eyebrow` in `globals.css`. Alle losse kaarten gebruiken `card`; kaarten die in hun geheel een link zijn (kennisbank, vergelijkingen, merkenindex) krijgen `card-link`. Een kaart binnen een kaart blijft vlak.
3. **Paginakop** (`PageHeader`/`PageBody`): sticks, zaalsticks, hockeyschoenen, kennisbank, merken, vergelijken, Over ons en methodiek beginnen met een band (kruimelpad, label, H1, intro; bij sticks ook de filters). De H1 en de intro blijven gelijk, dus de hoofdvraag staat nog steeds in de eerste 80 woorden.
4. **Typografie:** H1 zwaarder en strakker (800, −0,025 em, `text-wrap: balance`), en antialiasing.

Binnen de merkinstructie: veldblauw als hoofdkleur, oranje alleen voor de stickwijzer, het zeshoekpatroon alleen in hero en footer.

**Betrokken bestanden:** `src/app/globals.css`, `src/components/layout/Header.tsx`, `src/components/ui/{PageHeader,Card}.tsx`, de pagina's hierboven, de kaartcomponenten (`ProductCard`, `ShoeCard`, `SimilarSticks`, `WhereToBuy`, `ShoeWhereToBuy`, `CatalogFilters`, `IndoorSelector`, `ShoeQuiz`, `ShoeAdviceView`), `src/components/catalog/ProductDetail.tsx` (sticky afstand), `docs/designsysteem.md`.

## 2026-11-04 — Redesign fase 6: eerst de pasvorm, dan de winkels

**Opdracht eigenaar (2026-11-04):** het advies is het product; eerst de pasvorm, dan pas de prijs. Gezag zichtbaar vóór er iets gevraagd wordt, mobiel eerst, nette randgevallen.

1. **Stickkaart in het advies** (`RecommendationCard`):
   - de rol staat als badge bovenaan (Beste match met doel-icoon en blauw vlak, Veilige keuze met schild, Ambitieuze keuze met bliksem), en de beste match heeft een lichte blauwe rand;
   - daaronder merk, naam en samenvatting, en vier vakken: jouw maat, kromming, carbon en modeljaar. **De prijs staat niet meer bovenaan**, maar pas in "Waar te koop";
   - "Waarom deze stick past" en "Waar je op inlevert" (de afweging en voor wie hij minder past) staan vanaf `sm` naast elkaar;
   - zonder actuele winkelprijs volgt de richtprijs, gemarkeerd, vlak boven "Waar te koop".
2. **Profielkaart:** op een telefoon drie vakken naast elkaar in plaats van onder elkaar; de route heet kort Start, Ontwikkel of Prestatie, omdat het vak al "Route" heet. Gemeten op 390×844, op een gedeeld advies met melding: de naam van de beste match staat op 1,16 schermhoogte, de eerste koopknop op 2,3.
3. **Stickwijzer:** antwoorden zijn 48 px hoge tikvlakken met een duidelijke gekozen staat (blauwe rand, krijt, ring, vet) en een korte overgang, die stopt bij `prefers-reduced-motion`.
4. **Homepage:** de getelde feiten staan direct onder de hero (`ProofStrip`). Het vierde feit zegt nu "prijzen wekelijks bijgewerkt, laatst op …". "Waarom jouwhockeystick.nl" opent met de volgorde: "Eerst kiezen we de stick die bij de speler past. Pas daarna zie je waar hij te koop is …" (`ORDER_PROMISE`).
5. **Randgevallen van "Waar te koop"** hebben nu tests: geen partnerwinkel, één winkel, en nooit een korting, doorgestreepte prijs of "goedkoopst". Verouderde prijzen (> 14 dagen) en een maat die niet op voorraad is, handelde het blok al af.

**Bewust niet:**
- **Concurrenten bij naam:** HockeyDirect, HockeyHouse en HockeyOranje noemen we niet. Een vergelijking met een genoemde winkel moet per winkel objectief en controleerbaar zijn, en een winkel kan partner worden.
- **Reviews, sterren of gebruikersaantallen:** we hebben geen bron die we kunnen tonen.
- **Levertijden:** de feeds hebben er geen, dus we tonen ook geen schatting.
- **Winkellogo's:** pas na toestemming via het partnerprogramma van elke winkel.
- **Emoji als markering van de rollen:** iconen in de huisstijl, met de rol in woorden ernaast.

**Betrokken bestanden:** `src/components/stickwijzer/{RecommendationCard,QuizResult,QuestionField}.tsx`, `src/components/ui/icons.tsx` (ShieldIcon), `src/content/stickwijzer/questions.ts` (ROUTE_SHORT_LABELS), `src/components/home/{ProofStrip,WhyUs,HomePage}.tsx`, `src/components/trust/ProofFacts.tsx`, `src/content/trust.ts` (+ test), `src/components/offers/WhereToBuy.test.ts`, `docs/designsysteem.md`.

## 2026-11-04 — Portret alleen op Over ons

**Opdracht eigenaar (2026-11-04):** de foto en de tekst over hockeyvader van de homepage halen.

De link "Gemaakt door Hans Buursink, hockeyvader" met portret is uit de homepage-hero verwijderd, en dezelfde tekst uit de footer (die staat ook op de homepage). De foto, naam en "Hockeyvader" blijven op Over ons. Het analytics-commentaar bij `home_block_click` noemt de link niet meer.

**Betrokken bestanden:** `src/components/home/Hero.tsx`, `src/components/layout/Footer.tsx`, `src/lib/analytics/events.ts` (commentaar), `docs/designsysteem.md`.

## 2026-11-04 — Redesign fase 7: visuele uitvoering

**Opdracht eigenaar (2026-11-04):** alleen de visuele uitvoering verbeteren (hiërarchie, witruimte, typografie, kleur, ritme, consistentie, iconen, beeld en interactie), niet de inhoud, structuur of adviesregels.

1. **Kleur:** stappen `veld-donker`, `bal-donker` en `mist` naast de merkkleuren. Hover maakt donkerder in plaats van lichter.
2. **Typografie:** strakkere en zwaardere H1 en H2, de optische maat van Bricolage, `text-wrap: pretty` voor alinea's en een selectiekleur in veldblauw. De fonts en gewichten blijven die van de merkinstructie (§2.2).
3. **Knoppen:** één hoogte en vorm, een iets groter label, een binnenrand, donkerder bij hover en een korte druk.
4. **Hero:** zonder patroon, een grotere titel met een korte lead en een aparte regel over de winkels, een staande foto met één bijschrift (in plaats van drie zwevende pillen) en meer witruimte. **Afwijking van het designsysteem uit fase 3:** het zeshoekpatroon staat nu alleen nog in de footer.
5. **Ritme:** homepage-secties en paginakoppen met meer lucht, één kopmaat voor de homepage-secties, ruimere footer.
6. **Kaarten:** product- en schoenkaarten zijn als geheel klikbaar (de kooprij blijft een eigen link erboven), met een grotere foto die bij hover licht vergroot, een rustigere tekst en compacte sterke punten. De focusring blijft voor toetsenbordgebruik.
7. **Navigatie:** stillere links, de huidige pagina in veldblauw op een mist-vlak.

Geen wijziging aan inhoud, routes, adviesregels of analytics-events.

**Betrokken bestanden:** `src/app/globals.css`, `src/components/ui/{Button,PageHeader}.tsx`, `src/components/home/{Hero,HeroPhotos,StickwijzerExplainer,WhyUs,FeaturedProducts}.tsx`, `src/components/catalog/{ProductCard,ProductProsAndCons}.tsx`, `src/components/shoes/ShoeCard.tsx`, `src/components/layout/{Header,MainNav,Footer}.tsx`, `docs/designsysteem.md`.

## 2026-11-04 — Redesign fase 8: zeggen wat we weten, en wat niet

**Opdracht eigenaar (2026-11-04):** vertrouwen, gezag, bewijs, geloofwaardigheid en de uitleg van het advies verbeteren, zonder het visuele ontwerp te veranderen. Alleen tekst in bestaande stijlen.

1. **"Kort gezegd" per geadviseerde stick:** één concrete regel uit de eigen gegevens van de stick ("Kort gezegd: een low bow met 40% carbon, in 34 inch."). Zonder kromming en carbon vervalt de regel, want dan is er niets concreets te zeggen (`verdictLine`).
2. **"Wat we niet weten" per geadviseerde stick:** wat ontbreekt (kromming, carbon, gewicht, modeljaar), wanneer kromming of carbon van een winkel komt in plaats van het merk, en altijd dat we de stick niet zelf in de hand hadden of gemeten (`evidenceGaps`). Dit volgt de bestaande bronregel "Eigen meting: niet gemeten. Praktijktest: nog niet getest."
3. **Stickpagina:** onder de specificaties staat één zin over de herkomst ("Van de 6 gegevens over deze stick komen er 5 van JDH zelf en 1 is onze inschatting."), met wat er ontbreekt (`sourceMixText`). De volledige bronnenlijst blijft onder "Bronnen en methode".
4. **"Waarom dit advies?"** begint met drie genummerde stappen met de aantallen van dít advies: wat afviel, hoe we wegen (zonder vergoeding, marge of winkel), en wat je ziet (`adviceSteps`).

Alles komt uit de bronvelden van de stick en uit het advies zelf; er komt geen bewering bij die de gegevens niet dragen. Adviesregels, scores en analytics zijn ongewijzigd.

**Betrokken bestanden:** `src/content/evidence.ts` (+ test), `src/content/stickwijzer/resultCopy.ts` (`adviceSteps`), `src/components/stickwijzer/{RecommendationCard,QuizResult}.tsx`, `src/components/catalog/ProductDetail.tsx`.

## 2026-11-04 — Redesign fase 9: meer afgeronde adviezen en doorkliks

**Opdracht eigenaar (2026-11-04):** de afronding van de stickwijzer, de doorkliks en de betrokkenheid bij het advies verhogen, zonder het designsysteem te veranderen. Alleen bestaande knoppen, kaarten en tekststijlen.

1. **Stickwijzer:** op een telefoon blijven "Vorige" en "Volgende" sticky onderaan het scherm, zodat de volgende stap altijd één tik weg is. Vanaf `md` staan ze onder de vragen, zoals voorheen. Gemeten op 390×844: de balk staat op 775–844 px van een pagina van 4218 px.
2. **Advies:** onder de sticks staat "Twijfel je tussen de twee? Zet de [beste match] en de [tweede keuze] naast elkaar", met een link naar /vergelijk met beide sticks. Nieuw event `advice_compare_click` met de rollen van het paar (bijv. `best_match+safe_choice`).
3. **Homepage:** een slotblok na de laatste sectie ("Weet in 5 tot 7 stappen welke stick past", geen account, de stickwijzer-knop). Gemeten als `home_block_click`, block `slot`.
4. **Stickpagina (veldsticks):** onder "Stel een vraag" de zin "Twijfel je of deze stick bij je past? Doe de stickwijzer", gemeten als `catalog_block_click`, page `stickpagina`, block `stickwijzer`. Zaalsticks krijgen hem niet, omdat de stickwijzer alleen veldsticks adviseert.

**Meten:** na twee weken vergelijken met de twee weken ervoor: quiz_complete ten opzichte van quiz_start (afronding), retailer_click per quiz_complete (doorklik), en het aantal advice_compare_click en de klikken op het slotblok.

**Bewust niet:** nep-urgentie, aftellers, "nog X op voorraad" zonder voorraaddata, of een vooraf aangevinkte route. Adviesregels en volgorde blijven gelijk.

**Betrokken bestanden:** `src/components/stickwijzer/{QuizForm,QuizResult}.tsx`, `src/components/home/{ClosingCta,HomePage,HomeBlockLink}.tsx` (+ test), `src/components/catalog/{ProductDetail,TrackedBlock}.tsx`, `src/lib/analytics/events.ts`.

## 2026-11-04 — Wekelijkse sync hersteld (workflowbestand ongeldig sinds 2026-11-03)

**Wat:** bij de aanpassing van `.github/workflows/passa-sync.yml` voor HockeyCity fase 2 (2026-11-03) ging er in de stap "Pull request openen" iets mis:

- één regel brak af: de `grep -v` miste `' -e '^src/catalog/shoes/importedHockeyCity.ts' || true)`;
- er bleven twee kopieën van het slot van die stap staan, met te weinig inspringing.

GitHub keurde het bestand daardoor af. Elke run sinds de merge van #141 faalde meteen, en de geplande run van woensdag 2026-11-04 04:41 UTC is niet gestart.

**Herstel:** de regel staat er weer heel en de kopieën zijn weg (#152, en hetzelfde in deze PR). Na de merge start de eigenaar de sync één keer met de hand.

**Les:** workflowbestanden pas ik niet meer aan met tekstvervanging in PowerShell; die maakte de regel kapot. Nieuw: `src/lib/workflows.test.ts` leest elk workflowbestand in als YAML. De kapotte versie van main keurt die test af ("bad indentation", regel 110).

## 2026-11-04 — Daka als vijfde partnerwinkel (Daisycon)

**Opdracht eigenaar (2026-11-04):** Daka koppelen via Daisycon. Het programma is goedgekeurd (eigenaar, 2026-11-04). Ook in de privacyverklaring.

1. **Links:** het Daisycon-deeplinkformaat uit de feed, `partner.daka.nl/c/?si=7290&li=1765148&wi=441384&ws=<plek>&dl=<pad>`, zonder de `pid` per product van de feed. Alleen productpagina's (`/p/…`, zonder query). Geen geheim: de feed-URL en de ID's staan in elke link.
2. **Feed ("Daka.nl: Fashion", standaard 7):**
   - ongeveer 48.700 regels, één per maat of lengte, met prijs, voorraad en verzendkosten;
   - de categorie is overal "Sporten";
   - bijna nooit een EAN (2 van de 970 stickregels, 1 van de 1545 schoenregels);
   - zelden een modeljaar.

   We tonen nooit `price_old`.
3. **Herkennen** (`src/catalog/dakaFeed.ts`, geijkt op de feed van 2026-11-04):
   - **Een stick:** een hockeymerk, geen kleding of accessoire, het woord "stick" op de pagina of in de omschrijving, en minstens één lengte in inches.
   - **Een hockeyschoen:** een schoenwoord en "hockey" op de pagina, geen stick in naam of pad, en EU-maten. Veld of zaal alleen uit de naam ("indoor", "zaal"), anders onbekend. Een algemene winkelcategorie is geen bron.
4. **Koppelen:**
   - **Sticks:** op naam via `matchStick`. Alleen 'zeker' of met de hand bevestigd (`dakaConfirmed.ts`) geeft een knop. In de eerste run: 0 zeker, 182 twijfel; de afvinklijst staat bij de eigenaar.
   - **Schoenen:** alleen op EAN, in de eerste run 1 model.
5. **Alleen bij Daka** (`noindex`):
   - 80 sticks en 28 schoenen;
   - dezelfde import als HockeyCity en Plutosport;
   - een schoen met de naam van een model dat we al tonen, maar zonder gedeelde EAN, importeren we niet (17 namen).
6. **Verzendkosten:** daka.nl weigerde automatisch lezen (HTTP 429). Bron is daarom de campagnepagina van Daisycon ("gratis verzending vanaf €50"), en de feed bevestigt die:
   - alle regels vanaf €50 zijn gratis;
   - onder €50 is het meestal €4,95, maar 7.187 regels zijn ook daaronder gratis.

   We rekenen €4,95 onder €50, zodat een totaal nooit te laag is. **De eigenaar bevestigt dit op daka.nl.**
7. **Wekelijkse sync:** de stap `daka:feed` draait na HockeyCity, en `src/catalog/shoes/importedDaka.ts` mag in de sync-PR.
8. **Teksten:**
   - partnervermelding, footer, Over ons, methodiek, clubs, catalogus, ProductNotice en de `nofollow`-lijst;
   - het artikel "Waar koop je een hockeystick?" krijgt een vijfde kolom; retourvoorwaarden "nog niet nagekeken", omdat daka.nl niet te lezen was;
   - **privacyverklaring 1.7**, met een alinea over Daisycon en `partner.daka.nl` (opdracht eigenaar).
9. **Verkooprapport:** nog niet. Daisycon heeft een eigen login of API-sleutel nodig, en die zet de eigenaar als geheim in GitHub.

**Bewust niet:** twijfelgevallen automatisch koppelen, schoenen op naam koppelen, de oude prijs uit de feed tonen, levertijden tonen.

**Betrokken bestanden:**
- `src/lib/retailers.ts`, `src/catalog/dakaFeed.ts` (+ test), `scripts/daka-feed.ts`, `package.json`;
- `src/catalog/{index,types,feedDates,plutosportImport,shoeFeed}.ts`, `src/catalog/offers/{index,daka,dakaConfirmed}.ts`, `src/catalog/imported/daka.ts`;
- `src/catalog/shoes/{feedImport,index,types,importedDaka}.ts`;
- de teksten en tests hierboven, `.github/workflows/passa-sync.yml`, `CLAUDE.md` en de docs.

## 2026-11-04 — Homepage: bijschrift onder de foto, datumtegel en naam alleen op Over ons

**Opdracht eigenaar (2026-11-04):**
- **Bijschrift:** "Juiste stick · Past bij het niveau · Binnen budget" stond op de foto en bedekte de stick en de bal. Het staat nu onder de foto.
- **Datumtegel:** heeft dezelfde vorm als de andere: groot "Wekelijks", klein "prijzen bijgewerkt, laatst 3 nov".
- **Naam:** Hans Buursink en "Hockeyvader" staan alleen op Over ons. Een test bewaakt dat ze niet in de homepage-blokken, de header of de footer staan.

## 2026-11-04 — Twee schoenentests hingen aan de data van 31 oktober

**Wat:** de eerste sync na het herstel (PR #154) liet twee tests falen. De nieuwe feed en de code waren in orde; de tests leunden op oude data.

- **Adviestest op de echte catalogus:** rekende met de vaste datum 2026-11-01. De prijzen van 4 november lagen daardoor "in de toekomst", telden als onbekend, en het advies zakte van "goede onderbouwing" naar "voorwaardelijk". De test rekent nu met de dag van de laatste feedlezing.
- **Test op verborgen feedmodellen:** verwachtte dat het importbestand nog feedmodellen met de EAN van een nagekeken model bevat. Sinds fase 1b slaat de import die over en geeft hun winkelregels aan het nagekeken model; alleen het oude bestand van 31 oktober had ze nog. De test controleert nu alleen dat zo'n model nooit los zichtbaar is, en dat elk nagekeken model winkelregels heeft.

Adviesregels en `ruleSetVersion` zijn niet veranderd.

## 2026-11-04 — Daka: dezelfde naam zonder modeljaar telt als koppeling

**Besluit eigenaar (2026-11-04):** bij Daka telt een stick als gekoppeld als de naam na het gelijkmaken hetzelfde is, er maar één kandidaat is en alleen het modeljaar onbekend is. Dat wijkt af van de regel "zelfde model én modeljaar" (Commerce, Prijsvergelijking) en geldt alleen voor Daka.

**Waarom:** Daka zet bijna nooit een modeljaar in de feed, en bij 139 van onze sticks staat ook geen modeljaar. Alle 182 twijfelgevallen hadden daardoor een modeljaarprobleem. Verschillen als PB/Probow, LB/Lowbow en Kids/Junior telden al als gelijk; die waren niet de reden.

**Voorwaarden** (`matchStick`, `yearOnly`; `dakaStickMatches`, methode `naam-zonder-jaar`):
- dezelfde naam: merk, modelwoorden en bow; geen extra woord bij Daka (zoals "Limited", "Forged" of "SG9") en de bow niet weggelaten;
- precies één kandidaat bij Daka en geen andere jaargang van dat model;
- een bekend modeljaar dat aan beide kanten verschilt, blijft altijd een uitsluiting;
- op voorraad, zoals elke Daka-knop.

**Resultaat eerste run:** 44 sticks krijgen een Daka-knop. Ze staan niet meer op de afvinklijst. Wat overblijft, beslist de eigenaar nog steeds met de hand. Een voorbeeld is de Grays Dynabow 10: Daka heeft twee pagina's met die naam en verschillende prijzen.

**Risico:** Daka verkoopt soms een oudere jaargang onder dezelfde naam. Dan klopt de prijsvergelijking voor die stick niet. De eigenaar aanvaardt dat risico.

**Betrokken bestanden:** `src/catalog/plutosportFeed.ts`, `src/catalog/dakaFeed.ts` (+ test), `src/catalog/offers/{index,daka}.ts`, `scripts/daka-feed.ts`, `CLAUDE.md`.

**Aanvulling (2026-11-04, zelfde avond):** de eigenaar heeft de afvinklijst nagelopen. Uitkomst: 181 keer "klopt", 1 keer "klopt niet" (`osaka-midbow-10-stk00262-retroblue-s`).
- **Klopt:** staat in `DAKA_CONFIRMED`. De Grays Dynabow 10 is gekoppeld aan de pagina van €244,99.
- **Klopt niet:** staat in `DAKA_REJECTED`. Die stick krijgt nooit een Daka-knop, ook niet via de regel "dezelfde naam".
- **Resultaat:** 171 sticks met een Daka-knop. Tien bevestigde sticks staan nu niet op voorraad bij Daka; zij krijgen de knop zodra de feed ze weer op voorraad heeft. Tien nieuwe twijfelgevallen gaan naar de volgende sync-PR.

## 2026-11-04 — Homepage: zoeken op merk of model, rustigere header en geen scheidingslijnen

**Opdracht eigenaar (2026-11-04):** een zoekblok op de homepage, en de bijbehorende verbeteringen die de eigenaar lokaal heeft bekeken en goedgekeurd.

1. **Zoeken:**
   - **Pagina `/zoeken`:** een GET-formulier, dat op de server wordt gelezen en zonder JavaScript werkt. De pagina krijgt `noindex`, want elke zoekopdracht zou een dunne pagina zijn.
   - **Wat het zoekt:** alleen op merk en modelnaam, in veld- en zaalsticks en in schoenen, ook in de feedimport. De met de hand nagekeken modellen komen eerst; prijs, winkel of vergoeding tellen niet mee voor de volgorde.
   - **Afkortingen:** PB, LB, MB, DB, JB en UB tellen als de bow; jr en kids tellen als junior. Een getal moet helemaal kloppen, dus "dynabow 5" vindt geen Grays 500.
2. **Homepage:**
   - **Zoekblok:** "Weet je al welk model?" staat direct onder de hero, met snelkoppelingen naar Veldsticks, Zaalsticks en Hockeyschoenen. Geen "Tassen", want die verkopen we niet. Geen slogans als "snel" of "slim", want niets onderbouwt ze.
   - **Cijferstrook:** die staat weer los onder het zoekblok. De vier waarden staan nu op één lijn.
   - **Vinkjesregel in de hero:** "606 veldsticks van 20 merken" is weg, omdat de cijferstrook hetzelfde getal toont.
3. **Geen scheidingslijnen tussen de blokken:** de achtergronden wisselen af tussen wit en krijt, zodat er nooit twee krijtblokken na elkaar staan. De volgorde: hero (krijt naar wit), zoeken, cijfers en seizoen op wit; "Zo werkt het" krijt; het voorbeeldadvies wit; "Waarom" krijt; catalogus en Instagram wit; slotblok krijt.
4. **Header:**
   - **Pay-off:** "Eerlijk stickadvies op maat" staat niet meer als woordmerk met pay-off in de hero. Het is nu een korte blauwe regel boven de H1. Dat wijkt af van merkinstructie §4 ("Met pay-off: homepage hero"); het woordmerk staat al in de header.
   - **Menu:** "Sticks" heet nu "Veldsticks", naast "Zaalsticks". Ook de kruimel op de stickpagina is aangepast. De URL blijft `/sticks`.
   - **Donkere balk:** de balk boven de header staat alleen nog op mobiel. Op bredere schermen staan dezelfde punten al in de hero.
5. **Meten:**
   - `search_results` met de lengte van de zoekopdracht en het aantal gevonden sticks en schoenen. De getypte tekst gaat niet naar analytics, omdat in een vrij tekstveld van alles kan staan.
   - Klikken op de snelkoppelingen komen in `home_block_click` met `block: 'zoeken'`.

**Betrokken bestanden:**
- `src/catalog/search.ts` (+ test);
- `src/app/zoeken/page.tsx`, `src/components/search/`;
- `src/components/home/{QuickFind,Hero,HomePage,ProofStrip,SeasonBand,BuyingIntro,StickwijzerExplainer,WhyUs,FeaturedProducts,InstagramFeed,ClosingCta,HomeBlockLink}.tsx`;
- `src/components/trust/ProofFacts.tsx`, `src/components/layout/Header.tsx`, `src/components/catalog/ProductDetail.tsx`;
- `src/lib/analytics/events.ts`.

## 2026-11-05 — Productkaarten: de vergelijking is de held, niet de winkel

**Opdracht eigenaar (2026-11-05):** de kaarten moesten minder als webwinkel ogen en meer als onafhankelijke vergelijker.

1. **Productkaart** (veldsticks, zaalsticks, vergelijkpagina, zaalkeuze en schoenen; `OfferCardSummary`):
   - **Bovenaan:** "Laagste prijs" met rechts het aantal winkels. Daaronder groot de laagste actuele totaalprijs van de winkels die op voorraad hebben, en daaronder de verzending en de winkel ("gratis verzending · bij Daka", "incl. €4,95 verzending · bij Daka").
   - **Verzendkosten onbekend:** dan staat er "verzendkosten onbekend", nooit "incl. verzending".
   - **Woordkeuze:** "Laagste prijs" is de laagste prijs bij onze partners, in dezelfde volgorde als "Waar te koop". Nooit "goedkoopst" of "beste prijs".
   - **Acties:** "Vergelijk prijzen bij N winkels" is de knop. "Direct naar [winkel]" is een rustige link naar de winkel van die prijs. Bij één winkel is "Bekijk bij [winkel]" de knop, met "Alleen bij [winkel] gevonden".
   - **Geen actuele prijs:** de richtprijs, gemarkeerd als richtprijs.
   - **Partnerlink:** "Partnerlink bij doorklikken naar winkels" staat onderaan.
2. **Stick- en schoenpagina:** alle winkels staan direct open, zonder "Toon nog N winkels"; het zijn er hooguit vijf. Bij betaalde verzending toont een rij "prijs + verzending", met het totaal rechts.
3. **Bronvermeldingen:** de regel "Grays vermeldt het carbonpercentage zelf niet; het komt van PassaHockey" en vergelijkbare regels zijn uit de aandachtspunten van 16 sticks gehaald. Op de kaart stonden ze als waarschuwing vlak boven de koopknop. De bron staat al volledig bij de specificatie zelf.
   - **Specificatietabel:** een gegeven van een winkel krijgt daar een rustig info-icoon en "Van de winkel.", geen waarschuwingsicoon.
   - **Uitzondering:** bij 3 sticks (Grays AC500, AC600 en MB7) is die regel het enige aandachtspunt. Er moet er minstens één zijn, en we verzinnen er geen, dus daar staat hij nog. Open punt voor de redactie.
4. **Meten:**
   - `offer_compare_click` (placement, offerCount) bij "Vergelijk prijzen";
   - `retailer_click` met de plek van de kaart (bijvoorbeeld `catalogus`) is direct doorklikken;
   - `retailer_click` met `productpagina` of `schoenpagina` is doorklikken vanuit de vergelijking.

   Zo zijn de drie routes in PostHog te onderscheiden. Er is geen nieuwe tracking op winkelklikken.

**Niet veranderd:** de sortering, de prijsregels (14 dagen), de partnerlinks en hun parameters, `rel="sponsored"`, de structured data, de URL's en de stickwijzer. De kaarten blijven server-side gerenderd.

**Betrokken bestanden:**
- `src/components/offers/{OfferCardSummary,CompareLink,WhereToBuy,OfferRows}.tsx` (+ test);
- `src/components/shoes/ShoeWhereToBuy.tsx`, `src/components/ui/SourceBadge.tsx`;
- `src/content/offers.ts`, `src/lib/analytics/events.ts`;
- 16 stickbestanden in `src/catalog/products/`;
- `docs/designsysteem.md`.

**Aanvulling (2026-11-05):** "Vergelijk prijzen" op een kaart en "Vergelijk alle winkels" in het stick- en schoenadvies gaan naar de bovenkant van de productpagina, niet meer naar `#waar-te-koop`. Op een laptop staat dat blok in de meescrollende rechterkolom; de sprong naar het anker scrolde de pagina tot halverwege de specificaties, zonder foto (eigenaar). Bovenaan staan op elk scherm de foto, de naam, de prijs en de winkels. Het anker blijft voor de link "vanaf €…" op de pagina zelf.

## 2026-11-05 — Badge "Laagste prijs" in "Waar te koop"

**Besluit eigenaar (2026-11-05):** het advies "geef de scherpste prijs of de snelste levering een opvallende badge" gedeeltelijk overnemen.

- **Wel:** de bovenste rij krijgt een blauwe badge "Laagste prijs" op de rand (`hasLowestBadge`). Dat gebeurt alleen als aan alle voorwaarden is voldaan:
  - de prijs is actueel;
  - de stick is op voorraad, in de gekozen maat;
  - de verzendkosten zijn bekend;
  - de prijs is echt lager dan bij minstens één andere winkel met een actuele prijs op voorraad.

  Bij één winkel of een gelijke prijs komt er geen badge. De badge volgt alleen de prijs, nooit de vergoeding. Hij staat op de stickpagina, de schoenpagina en in het stick- en schoenadvies.
- **Niet:**
  - "scherpste prijs", "goedkoopst", "beste prijs" of "winnaar": dat zijn claims over de hele markt, terwijl we vijf partners vergelijken;
  - een badge voor de snelste levering: de feeds geven geen betrouwbare levertijden, en CLAUDE.md verbiedt een leverbelofte zonder bevestigde maat en voorraad.

Dit wijzigt de regel "alle winkelrijen zien er hetzelfde uit, op een dikkere rand na" in CLAUDE.md en in `docs/spec/prijsvergelijking.md`.

**Betrokken bestanden:** `src/catalog/offers/sort.ts` (+ `badge.test.ts`), `src/components/offers/OfferRows.tsx`, `src/content/offers.ts`, `CLAUDE.md`, `docs/spec/prijsvergelijking.md`.

## 2026-11-07: schrijfstijl zonder AI-patronen

**Wat:** De sitetekst is getoetst met de skill vermijd-ai-schrijfstijl van de eigenaar. Op basis daarvan:
1. Over ons herschreven: de lijst met vier waarden (vet, gedachtestreepje) is één alinea met concrete afspraken geworden (we testen niet zelf, bij elke reden staat de bron, geen prestatiebeloften).
2. Blog "Met welke stick speelt Oranje": "Zijn exacte wedstrijdmodel? Dat houdt hij voor zich." vervangen door "is niet bekend" (dat was een bewering zonder bron), plus "Superleuk!" en "leuk!" eruit.
3. Blog "Hockeystick kopen" herschreven: van zo'n acht "niet X, maar Y"-zinnen naar één, geen tussenkreten ("Goed nieuws:", "Je zult zien:", "Tip:"), minder "fijn" en "lekker". Koppen, links, tabel, lijsten en bronnen zijn gelijk gebleven.
4. Gedachtestreepjes in bronlabels ("Grays — Over Grays") vervangen door een dubbele punt, en in lopende tekst door komma, punt of haakjes.
5. Nieuw: `docs/schrijfstijl.md` met de harde regels. `CLAUDE.md`, `docs/content-agent.md` en `docs/review-agent.md` verwijzen ernaar. De toonregel in `content-agent.md` vroeg om uitroepen ("Op naar de zaal!") en een "sprankelende" toon; die is nu "vriendelijk, persoonlijk en concreet", zonder uitroeptekens.

**Reden:** De teksten moeten betrouwbaar lezen. Herkenbare AI-tics kosten vertrouwen bij lezers. De oude toonregel was de bron van een deel van die tics.

**Na review-agent (zelfde PR):** ook de uitroeptekens en "Goed om te weten:" uit de intro's van drie kennisartikelen gehaald, en het streepje in de lijstregels van `stickListItem` (`src/content/catalogLinks.ts`) vervangen door een dubbele punt.

**Bewust niet:** `src/content/privacy.ts` (privacytekst alleen op expliciete opdracht van de eigenaar) en de streepjes in UI-onderdelen (bronvermelding in het stickadvies, citaattoeschrijving), waar het een interfaceconventie is. Artikelen die alleen licht gekleurd zijn, zijn niet herschreven.

**Betrokken bestanden:** `src/app/over-ons/page.tsx`, `src/content/blogPosts/hockeystick-kopen.ts`, `src/content/blogPosts/met-welke-stick-speelt-oranje.ts`, `src/content/brands.ts`, `src/app/merken/page.tsx`, diverse bestanden in `src/content/articles/` en `src/content/stickwijzer/`, `docs/schrijfstijl.md`, `docs/content-agent.md`, `docs/review-agent.md`, `docs/README.md`, `CLAUDE.md`.
## 2026-11-08 — Stickwijzer v13: vier regels eerlijker, en een vergelijkbank

**Opdracht eigenaar (2026-11-08):** stap 1 uit de vergelijking met de bouwopdracht van Perplexity. Vier regels gingen in tegen eerlijk advies. `ruleSetVersion` gaat van `v12-2026-10-19` naar `v13-2026-11-08`.

1. **Budget is een maximum, geen bestedingsdoel.** Elke stick binnen het budget krijgt dezelfde budgetpunten. Eerder scoorde een stick ver onder de ondergrens van de gekozen budgetklasse lager. Daardoor kreeg een volwassen beginner bij een hoger budget een duurdere stick als beste match.
2. **Een merkvoorkeur gaat niet boven een harde voorwaarde.** Budget en niveau werden voor het voorkeursmerk versoepeld; dat gebeurt niet meer. Past er geen stick van het merk, dan volgt het gewone advies, met de reden waarom het merk ontbreekt (`brandPreference.missReason`). Voorbeeld: "alleen Ritual, budget onder €75" gaf een Ritual van €298.
3. **De gekozen route en het teamniveau verhogen het niveau niet.** Alleen 4+ seizoenen met een zekere aanname geeft een niveau hoger, zoals voorheen behalve als de basis nog geleerd wordt. De prestatieroute stelt nog wel meer vragen.
4. **Het niveau van een feedstick komt nooit uit de prijs** (`adviceLevel`).
   - **Met carbonpercentage:** het niveau wordt alleen daaruit geschat (`levelFromCarbon`; besluit eigenaar: alleen schatten uit carbon, zichtbaar als schatting).
   - **Zonder carbonpercentage:** het niveau is onbekend en de stick telt niet mee in het advies (`unknown_level`).
   - **Catalogus:** daar staat bij zo'n stick nog een niveau uit de prijs, met de bron "omdat het carbonpercentage onbekend is; de stickwijzer gebruikt deze schatting niet".
   - **Bestanden:** de import schrijft deze schatting vanaf de volgende wekelijkse sync. Tot dan rekent de advieskern de oude bestanden opnieuw door.

**Vergelijkbank:** `npm run stickwijzer:bench` rekent 13 vaste, fictieve profielen door, waaronder paren die op één antwoord verschillen. Hij legt de uitkomst vast als JSON en zet twee regelversies naast elkaar. De vergelijking van v12 en v13 staat in `docs/stickwijzer/vergelijking-v12-v13.md`. Invarianttests (`invariants.test.ts`) bewaken de vier regels en de herhaalbaarheid.

**Gevolgen in de vergelijking:**
- De competitiespeler krijgt als beste match de Brabo Traditional Carbon 70 (€133) in plaats van de Elite X One (€249); de Elite X One wordt de ambitieuze keuze.
- De "veilige keuze" voor een volwassen beginner kan nu een goedkope houten stick zijn: die is eenvoudiger en past binnen het budget. **Open punt voor de eigenaar:** is dat gewenst, of moet de veilige keuze een ondergrens krijgen in opbouw (niet in prijs)?

**Niet veranderd:** de vragenlijst, de maatregels, de veiligheidsfilters, het gevoel uit carbon (open beslissing) en het budget op de richtprijs in plaats van de winkelprijs.

**Betrokken bestanden:**
- `src/advice-engine/{scoring,engine,hardFilters,playerContext,productRules,ruleSetVersion,benchProfiles}.ts`, `invariants.test.ts` en bijgewerkte tests;
- `src/catalog/{feedImport,plutosportImport}.ts`, `src/content/stickwijzer/{questions,resultCopy}.ts`, `src/components/stickwijzer/RecommendationCard.tsx`;
- `src/content/methodiek.ts` (uitleg aangepast aan de nieuwe regels, bijgewerkt 2026-11-08);
- `scripts/stickwijzer-bench.ts`, `package.json`, `docs/stickwijzer/`.

## 2026-11-08 — Stickwijzer stap 2: eerste vraag veld, zaal of keeper, en "Weet ik nog niet"

**Opdracht eigenaar (2026-11-08):** stap 2 uit het plan voor de stickwijzer.

1. **Eerste vraag "Waarvoor zoek je een stick?"** met de keuzes Veldhockey, Zaalhockey en Keeper. Veldhockey staat vooraan geselecteerd.
   - **Zaalhockey:** gaat naar de zaalkeuze op `/zaalsticks`. De stickwijzer adviseert alleen veldsticks.
   - **Keeper:** krijgt persoonlijk advies via `/interesse?source=stickwijzer-keeper`, met de uitleg dat er nog geen gecontroleerde adviesregels voor keepersticks zijn. Zo loopt een keeper nooit ongemerkt door de regels voor veldspelers.
   - **Opslag:** de keuze is geen antwoord in het advies en wordt niet bewaard.
   - **Meten:** `stickwijzer_exit` met `target` `zaal` of `keeper`.
   - **Nieuwe bron:** `stickwijzer-keeper` in `interestSourceSchema`.
2. **"Weet ik nog niet" als vierde keuze bij de route** (`route_self_select: 'unsure'`). De route volgt dan uit leeftijd en ervaring, via dezelfde `suggestRoute` als de bestaande routesuggestie; tot die bekend zijn is het de startroute, waarvan de eerste schermen gelijk zijn. Er komt dan geen wisselbanner.
   - **Meten:** `route_selected` wordt niet gemeten voor "Weet ik nog niet", omdat er dan nog geen route is.
   - **Weergave:** de vier kaarten staan op laptop in een raster van 2×2. De uitleg "Drie routes in de stickwijzer" toont alleen de drie routes.
3. **Minder dan drie resultaten:** dat kon de stickwijzer al. Een ambitieuze keuze komt er alleen als die verantwoord is (`noAmbitiousReason`), en bij nul passende sticks volgt een eerlijke melding. Er is niets veranderd.

**Advies ongewijzigd:** de vergelijkbank geeft voor alle 13 profielen dezelfde uitkomst als `v13-2026-11-08`, dus `ruleSetVersion` blijft gelijk.

**Bewust niet:** lengte meten tot de heup. Daarvoor is een lengtetabel op heuphoogte met een eigen bron nodig; de huidige tabel gaat uit van de lichaamslengte zonder schoenen (decision log 2026-10-29). Dit is een open punt.

**Betrokken bestanden:**
- `src/components/stickwijzer/{StickUseChoice,QuizForm,QuestionField}.tsx`, `src/components/stickwijzer/stickwijzerIcons.ts`;
- `src/content/stickwijzer/{stickUse,questions}.ts`, `src/app/stickwijzer/page.tsx`;
- `src/advice-engine/{answers,playerContext}.ts` (+ test);
- `src/lib/analytics/events.ts`, `src/interest/types.ts`.

## 2026-11-08 — Stickpagina op mobiel: omschrijving onder foto en naam

**Opdracht eigenaar (2026-11-08):** op een telefoon stond de korte omschrijving in een smalle kolom naast de foto. Daardoor begon "Waar te koop" pas onderaan het eerste scherm. De omschrijving staat nu onder de foto en de naam, over de volle breedte, en de naam is op mobiel iets kleiner (`text-2xl`). Zo staan op 390 px de "vanaf"-prijs en de bovenste winkel in het eerste scherm. Vanaf `sm` staat de omschrijving weer naast de foto; op laptop blijft "Waar te koop" rechts en blijft het meescrollen. De tekst staat er één keer, in dezelfde HTML-volgorde.

**Betrokken bestand:** `src/components/catalog/ProductDetail.tsx`.

## 2026-11-08 — SEO en GEO stap A: structured data en interne links

**Opdracht eigenaar (2026-11-08):** stap A uit het SEO/GEO-plan. Alle markup beschrijft alleen wat zichtbaar op de pagina staat (CLAUDE.md).

1. **`FaqSection`** (`src/components/article/FaqSection.tsx`) en **`faqJsonLd`** (`src/lib/faqJsonLd.ts`): één bron voor de zichtbare vragen en de FAQPage-markup, server-side gerenderd. `/sticks` gebruikt het; de vijf vragen en hun tekst zijn gelijk gebleven.
2. **ItemList** (`itemListJsonLd`):
   - op `/sticks`: de met de hand nagekeken sticks die de pagina toont, als links naar hun stickpagina, alleen op de ongefilterde pagina;
   - op `/merken`: alle merken als `Brand`, elk met het anker van zijn kaart.

   Een overzicht krijgt geen Product-markup, omdat Google die alleen wil op de pagina van één product.
3. **HowTo** (`howToJsonLd`) op de homepage, met de drie stappen die daar al zichtbaar staan ("Jij vertelt over de speler", "Wat niet past, valt af", "Maximaal drie sticks"), in dezelfde woorden. `/methodiek` toont geen stappen en krijgt daarom geen HowTo.
4. **Organization en WebSite** krijgen een `description`: dezelfde tekst als de meta description van de homepage.
5. **Interne links:** alle 15 kennisartikelen en blogs linken al naar de stickwijzer. Twee artikelen noemen Grays zonder merklink; die linken nu bij de eerste vermelding naar `/merken#merk-grays`.
   - **Anker:** `brandAnchor` in `src/content/brands.ts` is nu de enige plek waar het anker van een merkkaart wordt bepaald.
   - **Linktest:** de linktest in `articles.test.ts` controleert ook zulke ankers.
6. **Technische check op de live site** (`npm run seo:technical`, alleen lezen):
   - alle 144 pagina's geven 200;
   - alle AI-crawlers mogen lezen en krijgen dezelfde HTML;
   - 8 dubbele meta descriptions (vier paren sticks met dezelfde specificaties);
   - 15 titels langer dan 60 tekens;
   - 2 trage pagina's.

   Die volgen in stap C.

**Kanttekening:** Google toont geen HowTo-resultaten meer, en FAQ-resultaten alleen nog voor overheid en zorg. De markup helpt vooral machines, ook AI-zoekmachines, de pagina te begrijpen; een rich result is niet te verwachten.

**Betrokken bestanden:**
- `src/components/article/FaqSection.tsx`, `src/lib/{faqJsonLd,jsonLd}.ts`;
- `src/app/{layout,sticks/page,merken/page}.tsx`, `src/components/home/StickwijzerExplainer.tsx`;
- `src/content/brands.ts`, `src/content/articles/{low-bow-vs-mid-bow,veldstick-zaalhockey}.ts`;
- tests: `src/seo/structuredData.test.ts`, `src/content/{articles,sticksSeo}.test.ts`.

## 2026-11-08 — SEO stap C: unieke meta descriptions en kortere titels voor stickpagina's

**Opdracht eigenaar (2026-11-08):** de punten uit de technische check van stap A.

- **Meta descriptions:** die noemen nu de modelnaam ("Veldstick Grays JB 10 Composite met low bow ..."). Vier paren sticks met dezelfde specificaties hadden dezelfde tekst. Past het niet, dan valt eerst de vaste slotzin weg en pas daarna de lengtes. Een test eist dat elke geïndexeerde stick een eigen omschrijving heeft.
- **Titels van stickpagina's:** een titel die met ": specs en advies" boven de 60 tekens komt, wordt alleen de naam. Een test bewaakt dat elke titel uniek is en hooguit 60 tekens telt.
- **Bewust niet:** de titels van drie artikelen ("Hockeystick lengte tabel: ...", "Hockeystick-begrippen uitgelegd: ...", "Met welke stick speelt Oranje? ...") zijn 62 tot 64 tekens. Dat zijn rankende pagina's; inkorten is een redactionele keuze, en Google kort zelf af. Ook de trage pagina's /stickwijzer en /zaalsticks (ruim 4 s HTML) blijven nog open: daarvoor is eerst meten nodig.

**Betrokken bestanden:** `src/catalog/metaDescription.ts` (+ test), `src/components/catalog/ProductDetail.tsx`, `src/catalog/productTitle.test.ts`.

## 2026-11-08 — SEO en GEO stap B: vragen en antwoorden op de landingspagina's

**Akkoord eigenaar (2026-11-08):** vragen zoals mensen ze aan een zoekmachine of AI-assistent stellen, op drie landingspagina's, met `FaqSection` (zichtbare tekst en FAQPage-markup uit dezelfde bron, `src/content/landingFaqs.ts`).

- **/stickwijzer** (5): stick voor een kind van 12, of positie uitmaakt, hoe lang de stickwijzer duurt, of het advies onafhankelijk is, wat er gebeurt als er niets past.
- **/kennis** (4): 30% of 70% carbon, low bow of mid bow, de juiste lengte, een veldstick in de zaal.
- **/merken** (3): het beste merk, merken met sticks voor beginners, waar je ze koopt.

**Regels:**
- **Antwoorden:** elk antwoord herhaalt wat een nagekeken artikel, de methodiek of de catalogus al zegt, en linkt naar de volledige uitleg.
- **Getallen:** komen uit de catalogus. Het aantal merken met een beginnersstick telt alleen de met de hand nagekeken sticks, en dat staat er zo bij.
- **Positie:** de vraag over positie zegt dat positie nooit de enige reden is (CLAUDE.md).
- **Tests:** bewaken dat elke link bestaat en dat de teksten de schrijfstijl volgen: geen gedachtestreepje, geen uitroepteken, hooguit één contrastzin.

**Betrokken bestanden:** `src/content/landingFaqs.ts` (+ test), `src/app/{stickwijzer,kennis,merken}/page.tsx`.

## 2026-11-08 — UX fase 1: snel advies voor ouders, uitleg bij vaktermen en "Bekijk prijs bij"

**Opdracht eigenaar (2026-11-08):** fase 1 van de UX-opdracht, met de afwijkingen die de eigenaar goedkeurde.

1. **Twee ingangen.** Bovenaan de stickwijzer staat de keuze "Snel advies · 2 stappen" of "Uitgebreid advies · 5 tot 7 stappen".
   - **Link vanaf de homepage:** onder de hoofdknop staat "Of kies snel advies in 2 stappen" (`/stickwijzer?snel`), gemeten als `home_block_click`, block `hero`.
   - **Snel advies** (`route_self_select: 'quick'`) vraagt voor wie, leeftijd, lichaamslengte, hoeveel seizoenen en budget.
   - **Afwijking van de opdracht:** lichaamslengte is toegevoegd. Zonder lengte is er geen maatadvies, en de maat is een harde voorwaarde.
   - **Geen aannames:** de route volgt uit leeftijd en ervaring (zoals bij "Weet ik nog niet"). Alle andere antwoorden blijven leeg en worden niet aangenomen. `has_current_stick` is daarom alleen bij snel advies optioneel.
   - **Niveau:** iemand met 4+ seizoenen gaat met snel advies geen niveau omhoog, omdat de aanname niet gevraagd is. Boven het resultaat staat waarop het snelle advies is gebaseerd, met een knop naar de uitgebreide stickwijzer.
2. **Budget als bovengrens in de vraag.** "Wat wil je maximaal uitgeven aan alleen de stick?" met de keuzes Tot €75, Tot €125, Tot €175, Tot €250, Geen bovengrens en Eerst vergelijken. Dat past bij v13, waar het budget een maximum werd.
   - **Afwijking van de opdracht:** €50, €100 en €150 zijn niet overgenomen, omdat de budgetklassen van de advieskern gelijk blijven.
3. **Uitleg bij vaktermen** (`src/content/terms.ts`, `TermHelp`): bij bow-profiel, carbon en ervaringsniveau in de specificatietabel, en onder de vakjes in elk advies.
   - **Vorm:** een `<details>`, dus het werkt zonder JavaScript en met het toetsenbord, en staat in de HTML.
   - **Formulering:** genuanceerd ("meestal stijver en directer; minder carbon vergeeft meer"), met een link naar het artikel.
   - **Afwijking van de opdracht:** de voorgestelde tekst over trillen bij koud weer is niet overgenomen; daarvoor is geen bron.
4. **Knoptekst "Bekijk prijs bij [winkel]"** in plaats van "Koop bij [winkel]" (besluit eigenaar), ook in CLAUDE.md.

**Betrokken bestanden:**
- `src/advice-engine/answers.ts` (+ test);
- `src/content/stickwijzer/{questions,quick}.ts`, `src/content/terms.ts`;
- `src/components/stickwijzer/{QuizForm,QuizResult,AdviceModeChoice,RecommendationCard}.tsx`;
- `src/components/ui/TermHelp.tsx`, `src/components/catalog/ProductSpecTable.tsx`, `src/components/home/Hero.tsx`;
- `src/components/offers/OfferRows.tsx` en tests, `CLAUDE.md`.

## 2026-11-08 — UX fase 2: live teller, vergelijken met drie sticks en badges op eigenschappen

**Opdracht eigenaar (2026-11-08):** fase 2 van de UX-opdracht, met de afwijkingen die de eigenaar goedkeurde.

1. **Live teller in de stickwijzer:** "Nog X veldsticks passen bij je antwoorden tot nu toe", onder de voortgang (`countFittingSticks`, server action `countFittingAction`).
   - **Wat hij telt:** de veldsticks die de controles doorstaan die de antwoorden tot dan toe toelaten: de adviesgegevens, de maat uit de lengte, het budgetmaximum en een niveau dat niet te hoog is. Dat gebeurt met de regels van de advieskern.
   - **Grenzen:** het eindadvies kan minder tonen, omdat het ook veiligheid en de route controleert, maar nooit meer. Een test bewaakt dat op alle profielen van de vergelijkbank.
   - **Privacy:** de teller leest alleen de antwoorden die hij nodig heeft, en slaat niets op.
2. **Vergelijken met drie sticks:** `/vergelijk` neemt `a`, `b` en een optionele `c`. De tabel (`buildCompareTable`) heeft per stick ook het eerste sterke punt en het eerste aandachtspunt, uit de eigen gegevens van de stick.
   - **Vinkje:** op elke stickkaart staat een vinkje "Vergelijk". Een balk onderin opent de vergelijking zodra er twee of drie zijn gekozen.
   - **Opslag en meten:** de keuze staat alleen in `localStorage` van de bezoeker. Meting: `compare_open` (count).
   - **Afwijking van de opdracht:** een pagina in plaats van een pop-up, zodat de vergelijking deelbaar en vindbaar is.
3. **Badges op eigenschappen** (`ProductFacts`): "Voor beginners", "Voor gevorderden" of "Voor ervaren spelers" (alleen met een bron, niet bij onze inschatting), "Juniormaat" en het carbonpercentage.
   - **Afwijking van de opdracht:** geen "Meest gekozen door ouders", "Populairst onder aanvallers" of "Beste prijs/kwaliteit". Daarvoor hebben we geen gegevens; het zou nep sociaal bewijs zijn, en "beste prijs" verbiedt CLAUDE.md. Een test bewaakt dat.

**Advies ongewijzigd:** de advieskern zelf is niet aangepast.

**Betrokken bestanden:**
- `src/advice-engine/liveCount.ts` (+ test), `src/app/stickwijzer/actions.ts`, `src/components/stickwijzer/QuizForm.tsx`;
- `src/catalog/compare.ts`, `src/app/vergelijk/page.tsx`, `src/components/compare/`;
- `src/components/catalog/{ProductCard,ProductFacts}.tsx`, `src/app/layout.tsx`, `src/lib/analytics/events.ts`.

## 2026-11-08 — UX fase 3: bow-illustratie, carbonbalk en rustige overgangen

**Opdracht eigenaar (2026-11-08):** fase 3 van de UX-opdracht.

1. **Bow-illustratie** (`BowMiniFigure`): op de stickpagina, in de rij Bow-profiel van de specificaties, en in elk advies onder "Wat betekenen kromming en carbon?".
   - **Weergave:** de kromming van de stick in blauw, met de andere profielen in grijs.
   - **Hergebruik:** dezelfde schematische tekening als de interactieve figuur in het artikel over bow-profielen. De tekencode staat nu in `bowGeometry.ts`; de figuur in het artikel kan met `initial` op een profiel openen.
   - **Dynabow:** valt in de figuur onder "Pro bow / dynabow", zoals in het artikel.
   - **Status:** het blijft een redactionele weergave, geen meting.
2. **Carbonbalk** (`CarbonBar`): het percentage op een schaal van 0 tot 100%, in de specificaties en in elk advies. Bewust neutraal: een grijze balk met een donkere stip, zonder kleur die zegt dat meer beter is (carbon is geen maat voor stijfheid, besluit 2026-11-08).
3. **Overgangen:**
   - **Nieuw scherm:** schuift in de stickwijzer kort in (220 ms).
   - **Keuzes:** geven een kleine druk-reactie.
   - **Bewegingsgevoeligheid:** met `prefers-reduced-motion` staat beides uit.
   - **Afwijking van de opdracht:** gemaakt met CSS, zonder Framer Motion. Een extra pakket is niet nodig (CLAUDE.md: geen dependency zonder noodzaak).

**Betrokken bestanden:**
- `src/components/article/{bowGeometry.ts,BowProfileFigure.tsx}`, `src/components/catalog/{BowMiniFigure,CarbonBar,ProductSpecTable}.tsx`;
- `src/components/ui/TermHelp.tsx`, `src/components/stickwijzer/{RecommendationCard,QuestionField,QuizForm}.tsx`;
- `src/app/globals.css`.

## 2026-11-08 — UX fase 4: voorraad in de geadviseerde lengte

**Opdracht eigenaar (2026-11-08):** fase 4 van de UX-opdracht (conversie).

1. **Al gebouwd:** de knoppen heten "Bekijk prijs bij [winkel]" (besluit 2026-11-08) en elke stick heeft een prijsvergelijking ("Waar te koop").
2. **Nieuw: één regel boven de winkels in elk advies**, bijvoorbeeld "36,5" op voorraad bij 2 van 4 winkels volgens hun feeds, gelezen op 6 nov".
   - **Bron:** alleen feeds die hooguit 14 dagen oud zijn, net als de prijzen. Een oudere feed zegt niets over vandaag.
   - **Geen lengtes in de feed:** geen regel; de winkelrij zegt al "maat kiezen bij de winkel".
   - **Lengte nergens op voorraad:** "36,5" is volgens de feeds nu nergens op voorraad, andere lengtes wel". De rijen eronder tonen welke.
   - **Geen winkel met een actuele prijs op voorraad:** geen regel.
3. **Analytics:** `offer_block_view` krijgt in een advies `inSizeCount`, het aantal winkels met de geadviseerde lengte op voorraad. Zo is te meten of voorraad in de maat samenhangt met doorkliks.
4. **Afwijking van de opdracht:** geen "Morgen in huis" of andere leverbelofte. De feeds geven geen betrouwbare levertijd (CLAUDE.md: geen badge voor levertijd; zonder bevestigde voorraad geen belofte van levering). Een test bewaakt dat de regel geen levering, "goedkoopst" of "beste prijs" noemt.

**Advies ongewijzigd:** de volgorde van de winkels en de adviesscore zijn niet aangepast.

**Betrokken bestanden:**
- `src/catalog/offers/{sort.ts,index.ts,sizeStock.test.ts}`, `src/content/offers.ts`;
- `src/components/offers/{WhereToBuy,OfferBlockView}.tsx`, `src/lib/analytics/events.ts`.

## 2026-11-08 — Node 22 overal (code-review)

**Wat:** Netlify bouwt met Node 22 (was 20); `package.json` krijgt `engines.node` `>=22.12` en er is een `.nvmrc` met 22.

**Waarom:** Node 20 is end-of-life, CI en alle workflows draaien al op 22, en vitest 5 vraagt `^22.12`. Zo bouwt Netlify met dezelfde versie als de tests.

**Bewust niet:** de workflows zijn niet aangepast; alle 23 gebruiken al `node-version: 22`.

## 2026-11-08 — Catalogus-agents niet tegelijk (code-review)

**Wat:**
- De catalogus-hercontrole draait op vrijdag 05:23 UTC (was donderdag); de verrijker blijft op donderdag.
- Beide workflows slaan hun week over zolang er een open PR van een van beide staat (branches `hercontrole/` en `catalogus/`). De log noemt welke PR de oorzaak is.

**Waarom:** beide startten donderdag 05:23 UTC en bewerken allebei `src/catalog/products/`. Twee PR's tegelijk op dezelfde bestanden geven conflicten.

**Bewust niet:** de catalogus-aanvuller (dinsdag) wacht nog alleen op `catalogus/`-PR's. Het open-PR-overslaan van de aanvuller viel buiten deze opdracht.

## 2026-11-08 — Review-agent alleen op PR's uit deze repo (code-review)

**Wat:** `review.yml` controleert vóór de checkout met de GitHub-API of de head-repo van de PR deze repo is. Zo niet, dan stopt de job met een foutmelding.

**Waarom:** bij een handmatige start (`workflow_dispatch`) gold de fork-controle op jobniveau niet. Een PR uit een fork zou dan `npm ci` met install-scripts draaien in dezelfde job als het secret `CLAUDE_CODE_OAUTH_TOKEN`.

**Bewust niet:** de controle bij `pull_request` blijft zoals hij was; die gold al.

## 2026-11-08 — Geen Netlify-build voor alleen docs (code-review)

**Wat:** `netlify.toml` krijgt `ignore = "bash scripts/netlify-ignore.sh"`. Het script slaat een build over als tussen de vorige build (`CACHED_COMMIT_REF`) en deze commit (`COMMIT_REF`) alleen deze paden veranderd zijn:
- `docs/`, `.github/`, `video/` en `assets/video/`;
- `README.md`, `AGENTS.md` en `CLAUDE.md`;
- `*.test.ts(x)`.

**Altijd bouwen bij:**
- een build via de build hook (`INCOMING_HOOK_TITLE` of `INCOMING_HOOK_URL` gezet). Netlify past het ignore-commando daar volgens de documentatie al niet op toe; dit is een tweede slot;
- geen of dezelfde vorige commit;
- een mislukte `git diff`;
- elk ander gewijzigd pad. Een verplaatst bestand telt met zijn oude pad mee.

**Waarom:** elke productie-deploy kost 15 Netlify-credits, ook als alleen documentatie of een workflow verandert.

**Bewust niet:** geen lijst van paden die wél bouwen. Bij een onbekend pad bouwt het script, dus bij twijfel wordt er gebouwd.

## 2026-11-08 — Dagelijkse live-zetting voorbereid (code-review)

**Wat:** de workflow "Geplande publicatie" (`publicatie.yml`) bouwt elke ochtend via de build hook als minstens één van deze redenen geldt (de log noemt welke, of waarom niet):
- **a.** er staat geplande content klaar;
- **b.** main heeft commits die nog niet live staan en die de site raken. Dat beslist `scripts/netlify-ignore.sh`, met dezelfde padregels als bij Netlify;
- **c.** de live build is meer dan 10 dagen oud.

Ook bouwt hij als hij handmatig met "forceer" gestart is.

**Overige wijzigingen:**
- **`version.txt`:** heeft een tweede regel met de builddatum. De workflow leest daar de live commit en datum uit.
- **IndexNow:** leest alleen de eerste regel en kan na de build met de vorige en nieuwe live commit gestart worden.
- **Schakelaar:** het ignore-script slaat een productiebuild na een push over als in Netlify `DAILY_BUILD_ONLY=1` staat. Previews en build hooks bouwen dan gewoon.

**Waarom:** ongeveer 186 productie-deploys per maand (ongeveer 2.800 credits) worden er hooguit 30 (ongeveer 450). Reden c houdt de prijzen op de statische pagina's binnen de grens van 14 dagen (`MAX_PRICE_AGE_DAYS`).

**Bewust niet:**
- **Geen "Stop builds" in Netlify:** volgens de Netlify-documentatie stopt dat ook deploy previews en builds via de build hook. Daarom de schakelaar `DAILY_BUILD_ONLY` (besluit eigenaar 2026-11-08).
- **Geen Netlify-API-sleutel en geen nieuwe secrets.**
- **`scripts/indexnow.ts` is niet aangepast:** het leest `version.txt` niet; alleen de workflow doet dat.

**Gevolg:** met de schakelaar aan staat een merge pas de volgende ochtend rond 05:03 live. Een spoedfix gaat met "Run workflow" en "forceer".

## 2026-11-08 — Prijsversheid in de browser bewaakt (code-review)

**Wat:**
- `OfferRows` rekent na het laden de versheid opnieuw uit met de datum van de browser (`freshnessNow` in `src/catalog/offers/sort.ts`).
- Is een prijs inmiddels ouder dan 14 dagen, dan verdwijnen het bedrag en de badge "Laagste prijs", en zakt de rij naar de groep zonder actuele prijs.
- De eerste render is gelijk aan die van de server, dus er ontstaat geen hydration-mismatch.

**Waarom:** stickpagina's zijn statisch. `isPriceFresh` rekende alleen met de builddatum, dus tussen twee builds kon een bedrag ouder dan 14 dagen blijven staan. De dagelijkse live-zetting herbouwt binnen 10 dagen; dit is het tweede slot.

**Bewust niet:**
- **Browserklok die achterloopt op de builddatum:** wordt genegeerd. Die zou alleen meer prijzen laten zien.
- **Server-rendering:** de kaarten (`OfferCardSummary`), de leesdatum onder het blok en de structured data blijven bij de build berekend. Daarvoor zorgt de herbouw binnen 10 dagen.
- **Geen DOM-testpakket toegevoegd:** de tests dekken `freshnessNow` en de weergave via server-rendering met de datum die de browser zou kiezen.

## 2026-11-08 — Kleine opschoning na code-review

**Wat:**
- **a. PostHog meet alleen op productie:** op `jouwhockeystick.nl` en `www.jouwhockeystick.nl`, met de host uit `SITE_URL`. Netlify-previews en lokaal tellen niet meer mee.
- **b. Artikel "Kun je met een veldstick zaalhockeyen?":** zegt "Een zaalstick met een lage richtprijs uit onze catalogus" in plaats van "De goedkoopste zaalstick". Een test in `articles.test.ts` weert "goedkoopst", "beste prijs" en "scherpste prijs" in artikelen en blogs.
- **c. Zeven sticks zonder `bolProductUrl` of `bolNotSold`:** niets gewijzigd. bol.com weigert automatisch lezen (HTTP 403), en een botcheck omzeilen we niet. De eigenaar controleert ze met de hand.

**Waarom:** previewbezoeken vervuilden de statistiek, en "goedkoopst" is volgens CLAUDE.md niet toegestaan.

**Bewust niet:** de sterke punten van drie sticks in `src/catalog/products/` noemen "een van de goedkoopste juniorsticks in onze catalogus" of iets vergelijkbaars. Dat valt buiten deze opdracht en staat als open punt in de PR.

## 2026-11-09 — /zaalsticks als begeleide keuze (UX, SEO en GEO)

**Opdracht eigenaar (2026-11-09):** maak van `/zaalsticks` een keuze-ervaring in plaats van een catalogus, met behoud van SEO, en met een aanvulling voor AI-zoekmachines.

**Wat er mis was:**
1. De keuzehulp zag 25 van de 196 zaalsticks; de 171 uit de winkelfeeds deden niet mee.
2. Drie lijsten met dezelfde sticks: resultaten van de keuzehulp, "Zaalsticks per budget" en "Alle zaalsticks". De keuzehulp filterde de grote lijst niet en werkte pas na een knop.
3. Budget overlapte en klopte niet. "Meer dan €200" toonde alles, en "€50–100" ook sticks onder €50. De filter rekende met de richtprijs, de kaart met de winkelprijs; bij 10 sticks gaf dat een andere prijsklasse.
4. Een volwassene kon geen maat kiezen (alleen 36,5" en 37,5"; 37 sticks zijn er ook in 38,5"), en "Ik weet mijn maat niet" ontbrak.
5. Op de kaart:
   - stond "Laagste prijs" ook bij één winkel;
   - stonden twee acties met "Vergelijk" (prijzen en sticks naast elkaar).

**Wat er veranderd is:**
- **Eén lijst met een keuzehulp erboven** (`IndoorFinder`, `src/catalog/indoorFinder.ts`).
  - **Drie vragen:** voor wie, sticklengte (of de lichaamslengte zonder schoenen, met dezelfde lengtetabel als de stickwijzer) en budget.
  - **Live filter:** elk antwoord filtert meteen, met het aantal per prijsklasse op de knop. De keuze staat in de URL (`?voor=&maat=&budget=`, nooit de lichaamslengte), zodat terug-navigeren hem bewaart. De canonical blijft `/zaalsticks`.
  - **Zonder antwoord:** de met de hand nagekeken sticks staan server-side in de HTML, zoals voorheen.
  - **Na een antwoord:** de sticks uit de winkelfeeds laden erbij, in een eigen groep met de melding dat ze niet met de hand zijn gecontroleerd. Hun lichte lijst (slug, kaartprijs, lengtes) komt uit het statische `/data/zaal-index.json` (noindex), samen met `aanbod-zaal.json`. De eerste lading bevat dus geen feedgegevens (besluit 2026-10-24); de aantallen op de budgetknoppen verschijnen pas als de lijst compleet is (opmerking review-agent).
- **Budget:** niet-overlappende klassen (onder €50, €50 tot €100, €100 tot €200, €200 of meer, geen voorkeur), met dezelfde grenzen als de prijsgroepen van het budgetartikel.
  - **Grondslag:** de prijs op de kaart (`cardPrice`): de laagste winkelprijs uit de feeds inclusief verzending, anders de richtprijs.
  - **Zonder prijs:** een stick zonder prijs valt buiten elk budget.
- **Geen resultaat:** de melding is eerlijk en biedt een knop "Toon alle prijsklassen". Voor kinderen staat er de bestaande regel bij: één maat korter, nooit langer.
- **Kaarten** (op de hele site):
  - "Laagste prijs" alleen als de prijs echt lager is: bekende verzendkosten, en een strikt hoger totaal bij een andere winkel met een actuele prijs op voorraad en bekende verzendkosten. Anders "Prijs" (regel uit CLAUDE.md, aangescherpt na de review-agent);
  - de hoofdactie heet "Bekijk maten en prijzen" (was "Vergelijk prijzen bij N winkels");
  - het vinkje heet "Vergelijk deze stick".
- **Kaarten** (op `/zaalsticks`): compact, met de maten erop en zonder sterke punten en let op (die staan op de stickpagina). Placement `zaalkeuze`.
- **"Zaalsticks per budget" is weg.** De budgetkeuze doet hetzelfde, en dezelfde kaarten stonden dubbel op de pagina.
- **GEO:**
  - **Nieuw blok "Welke zaalstick past bij wie?":** kind, beginner, carbon en wanneer een duurdere stick zinvol is. Elk antwoord is kort, gelabeld als redactioneel en linkt naar het artikel dat dieper gaat.
  - **Nieuw blok "Zo maken we deze pagina":** wie, welke bronnen, hoe de prijzen werken en de vergoeding.
  - **Structured data:** de FAQ krijgt FAQPage-markup via `FaqSection`, zoals `/sticks`. De nagekeken sticks staan als ItemList. Article en BreadcrumbList blijven.
  - **Ongewijzigd:** H1, SEO-titel, meta-beschrijving, URL, canonical en de ankers `#zaal-selector-heading` en `#alle-zaalsticks`. `updatedAt` 2026-11-09.
- **Analytics:**
  - `indoor_finder_start` (eerste antwoord);
  - `indoor_selection` (alle drie beantwoord, plus `sizeSource`);
  - `product_card_click` (positie, nagekeken of feed, gefilterd);
  - `compare_select`;
  - `retailer_click` met placement `zaalkeuze`.

**Bewust niet:**
- **Geen "aanbevolen" of "beste keuze":** de lijst staat op prijs.
- **Geen nieuwe dependency.**
- **Geen Product/Offer-markup op een overzicht.** Die staat op de stickpagina's.
- **Geen sticks uit de winkelfeeds in de eerste HTML** (besluit 2026-10-24): ook hun lichte lijst laadt pas na een antwoord.
- **De FAQ over lengte** noemt geen vaste maten meer ("meestal 36,5 en 37,5 inch"); hij verwijst naar de lengtetabel en de keuzehulp (opmerking review-agent).
- **Drie sticks noemen nog "goedkoopste" of "laagste prijs" in hun sterke punten.** Die staan niet meer op de compacte kaarten; aanpassen is een aparte catalogusklus.

## 2026-11-09 — Dagelijkse live-zetting: herbouwen als een prijs verloopt

**Opdracht eigenaar (2026-11-09):** vervang reden c van "Geplande publicatie" ("live build ouder dan 10 dagen") door een regel die naar de prijzen zelf kijkt.

**Wat:**
- **Script:** `scripts/price-expiry.ts` (`npm run price:expiry -- <builddatum>`) verzamelt de leesdatum van elke prijs die de site toont: sticks (ook uit de feeds) via `getOffers`, schoenen via `getShoeOffers`. De logica staat in `src/catalog/offers/expiry.ts`.
- **Wanneer bouwen:**
  - als een prijs op de live builddatum (regel 2 van `version.txt`) nog vers was en vandaag niet meer. Daarvoor is `isReadDateFresh` toegevoegd: dezelfde regel als `isPriceFresh`, in hele kalenderdagen;
  - **vangnet:** de live build is ouder dan 14 dagen, of de datum is onbekend of ongeldig.
- **In de log:** de reden noemt de verlopen leesdatums, bijvoorbeeld "prijzen gelezen op 2026-11-05 zijn sinds de live build ouder dan 14 dagen".

**Waarom:**
- **Minder builds:** de oude regel bouwde elke 10 dagen, ook als er niets verliep.
- **Sneller herbouwen bij een verlopen prijs:** de nieuwe regel bouwt precies op de dag dat een getoond bedrag de grens van 14 dagen passeert. Zo valt het weg op de statische pagina's.

**Bewust niet:** reden a (geplande content) en b (main nieuwer dan live) zijn ongewijzigd.

## 2026-11-09 — Hercontrole wacht alleen op hercontrole en verrijker; signaal bij twee keer overslaan

**Opdracht eigenaar (2026-11-09).**

**Wat:**
- **Hercontrole:** `catalogus-hercontrole.yml` wacht nog alleen op open PR's met een branch `hercontrole/` of `catalogus/verrijkt-` (de verrijker).
- **Aanvuller:** een open PR van de catalogus-aanvuller (`catalogus/<datum>`, nieuwe sticks in eigen bestanden) houdt de hercontrole niet meer tegen.
- **Verrijker:** `catalogus-verrijker.yml` wacht ongewijzigd op `catalogus/` en `hercontrole/`.
- **Orchestrator:** de workflow heeft een stap "Hercontrole bewaken". Zijn de laatste twee geplande runs van de hercontrole overgeslagen door een open PR (de stap "Sticks van deze week kiezen" is dan `skipped`) en zijn er sticks aan de beurt (`npm run catalog:recheck`), dan schrijft hij `hercontrole-signaal.md`. De orchestrator zet dat als eerste punt onder **Voor jou** (`docs/orchestrator.md` §1).

**Waarom:** de aanvuller en de hercontrole raken andere bestanden. Wachten op elkaar kon de kwartaalcontrole van bronbeleid §3 weken stilleggen zonder dat iemand het zag.

**Bewust niet:** de aanvuller wacht nog alleen op zijn eigen `catalogus/`-PR's (ongewijzigd).

## 2026-11-09 — Eén regel voor "Laagste prijs"

**Opdracht eigenaar (2026-11-09):** de badge in "Waar te koop" en het label op een productkaart volgen dezelfde, strengste regel.

**Wat:**
- **Eén functie:** `isStrictlyLowest` in `src/catalog/offers/sort.ts`, gebruikt door `hasLowestBadge` en `cardPrice`.
- **De regel:** "Laagste prijs" alleen als de bovenste prijs bekende verzendkosten heeft en strikt lager is dan bij alle andere winkels met een actuele prijs op voorraad. Eén winkel, onbekende verzendkosten bovenaan, of gelijke prijzen geven geen label.
- **CLAUDE.md** (Prijsvergelijking) zegt dit nu ook ("alle andere" in plaats van "minstens één").

**Gevolgen:**
- **Badge:** ongewijzigd; die gebruikte al "alle andere".
- **Kaartlabel:**
  - **strenger:** met twee winkels op gelijke laagste prijs en een derde duurder staat er nu "Prijs";
  - **iets ruimer:** een andere winkel met onbekende verzendkosten telt mee met haar prijs zonder verzending. Is de bovenste prijs al lager dan dat bedrag, dan is hij echt lager.

**Tests:**
- het geval gelijk-gelijk-hoger;
- strikt lager;
- onbekende verzendkosten en één winkel;
- 200 willekeurige lijsten waarin badge en kaart hetzelfde zeggen.

## 2026-11-09 — Geen prijsclaims in de productteksten

**Opdracht eigenaar (2026-11-09):** herschrijf de sterke punten met "goedkoopste" zonder prijsclaim, en breid de test uit naar de catalogus.

**Wat:**
- **Acht productbestanden** hadden een vaste prijsclaim; die zijn herschreven tot "Lage richtprijs voor …" of "Lage adviesprijs volgens de website van Grays":
  - "goedkoopste" in de vier genoemde: Grays PB9i (sterk punt en samenvatting), Grays DB2Xi, Osaka Stick 1 Series Junior en Scoop WDN Junior veld;
  - "Laagste prijs van … in onze catalogus" in vier andere: Grays 4i Dynabow, Scoop Indoor Mid Bow 20, Scoop WDN Junior zaal en Stag Magic Jr.
- **Grays DB2Xi** zegt nu "Een stap tussen de houten zaalsticks en de modellen met meer carbon".
- **Test:** `src/catalog/productClaims.test.ts` scant elk bestand in `src/catalog/products/` op "goedkoopst", "beste prijs", "scherpste prijs" en "laagste (advies)prijs". Met de oude teksten faalt hij op precies deze acht.

**Waarom:**
- CLAUDE.md verbiedt "goedkoopst"-claims.
- Een vaste zin als "laagste prijs in onze catalogus" klopt niet meer zodra de prijzen of de catalogus veranderen. "Laagste prijs" hoort alleen bij de berekende badge en het kaartlabel.

**Bewust niet:** de bronnen en `lastVerifiedAt` zijn ongewijzigd, want alleen de formulering verandert, niet de gegevens.

## 2026-11-09 — Marketingmachine, fase 1: fundament zonder publicatie

**Opdracht eigenaar (2026-11-09):** een grotendeels autonome marketingmachine (PLAN, PULSE, PUSH, PEAK) op de bestaande infrastructuur, met de Social-studio als planner en Metricool via de MCP. Eerst de inventarisatie en een cloudtest, daarna één veilige fase.

**Vastgesteld:**
- **Social-studio** is bereikbaar en betrouwbaar (database met versienummers).
- **Social-planner, Video-publicatie en community-agent** staan sinds begin november uit. Sinds 24 oktober is niets geplaatst; het handmatig inplannen is de flessenhals.
- **Metricool-MCP** werkt lokaal en vanuit de cloud (claude.ai-connector).
- **Een via de API aangemaakte routine** heeft geen databasetool voor de studio; de Social-planner had die wel.

**Wat:**
- **Documentatie** in `docs/marketing/`: README (inventaris, taakverdeling, cloudtest, statussen, meten, GEO-meting, weekrapport, fasen), `merkstem.md` en `pilot-zaalhockey.md`.
- **`src/marketing/`**:
  - het contentschema met statussen en Metricool-ID per kanaal;
  - de UTM-standaard (`utm_medium` blijft `social`; `utm_content` = content-ID);
  - de redactiecontrole (`npm run marketing:check`);
  - de beslisregel voor de overdracht naar Metricool, die nooit dubbel aanmaakt en bij twijfel stopt;
  - de pilot met tien zaalhockey-items, met tests.

**Bewust niet:**
- **Niets naar buiten:** geen schrijfacties in de studio of in Metricool, niets gepubliceerd.
- **Social-planner blijft uit:** hij is niet aangezet of gewijzigd.
- **Geen nieuwe database, geen betaald plan en geen e-mail.**
- **Geen wijziging aan live content.**
- **Proefroutine:** de eenmalige proefroutine (alleen lezen) staat uitgeschakeld in claude.ai.

## 2026-11-09 — Opdracht van de Social-planner in de repo; status uit Metricool

**Wat:**
- **Opdracht in de repo:** de opdracht van de geplande taak Social-planner staat nu in `docs/marketing/social-planner.md`. De routine leest het bestand van `main`, zodat een wijziging via een PR en de review-agent gaat.
- **Inhoudelijk ongewijzigd** ten opzichte van de laatste versie in de routine, plus twee aanvullingen:
  - **Redactiecontrole** op elk voorstel, volgens `docs/marketing/merkstem.md` en `src/marketing/editorCheck.ts`;
  - **STAP 4:** de planner leest de geplande posts in Metricool en zet de kanalen in de studio op "ingepland" of "geplaatst". De eigenaar hoeft dat niet meer zelf te klikken. In Metricool leest hij alleen.
- **Routine:** de Metricool-connector is toegevoegd. De routine draait met de tags `cowork-remote` en `product:cowork-remote`; daarmee is de databasetool van de studio beschikbaar (tweede proefrun, 2026-11-09).

**Bewust niet:**
- **Geen concepten automatisch naar Metricool.** Daarvoor ontbreken nog twee dingen:
  - **beelden op een openbare URL:** Metricool eist een beeld of video voor Instagram, Reels en Shorts, en de studio tekent de slides alleen in de browser;
  - **een goedkeurknop in de studio.**
- Dat wordt een volgende stap.

## 2026-11-09 — Social: goedkeuren is online gaan, via Google Drive en Metricool

**Besluit eigenaar:** "goedkeuren = live". Een klik op Goedkeuren in de Social-studio betekent dat het item op de geplande dag en tijd vanzelf online gaat via Metricool. Intrekken moet kunnen tot het moment van plaatsen. Dit vervangt "alleen concepten naar Metricool" uit de vorige stap.

**Gebouwd:**
- **Social-studio (versie 20):** Goedkeuren maakt in de browser de slides (PNG) of de video's (MP4, H.264) met covers en zet ze in de Drive-map `jouwhockeystick-social`. Die map is gedeeld als "iedereen met de link kan lezen", zodat Metricool de bestanden kan ophalen. De pagina bewaart de links in `metricoolAkkoord.media` en start de Social-planner. Een video maken duurt ongeveer zo lang als de video. Intrekken zet `metricoolAkkoord` op null. Een goedgekeurd item kan niet worden herschreven of verzet; eerst intrekken.
- **Social-planner, STAP 5** ([social-planner.md](marketing/social-planner.md)): per kanaal een Metricool-post met `autoPublish: true` en `draft: false`, eerst controleren of hij al bestaat, en id en uuid terug in `metricoolPosts`. Bij intrekken zet de planner de post op concept (`draft: true`); de MCP kan niets verwijderen. Een onduidelijke eerdere poging geeft "onzeker" en nooit een tweede post.

**Waarom Drive via de pagina:** een cloudrun kan bestanden alleen als tekst in de aanroep meesturen, wat voor echte beelden en video's niet werkt. De pagina stuurt de bestanden zelf met de Drive-koppeling van de eigenaar. De Drive-koppeling binnen Metricool is betaald; een openbare downloadlink werkt ook in het gratis plan (getest met een concept op 2026-11-09).

**Grenzen:** het gratis plan van Metricool staat 20 ingeplande posts per maand toe. Een video die groter is dan 15 MB gaat niet mee. Video's maken lukt alleen in Chrome of Edge op de computer.

## 2026-11-09 — Extra domeinen: 301 naar jouwhockeystick.nl

**Opdracht eigenaar (2026-11-09):** de extra domeinen jouwhockeystick.info, .be, .com, .store en jouwhockeyschoenen.nl sturen bezoekers met een permanente redirect (301) naar `https://jouwhockeystick.nl`. SSL gratis via Netlify; STRATO blijft registrar en DNS-beheerder. Dit vervangt "een doorverwijzing volgt alleen op expliciete opdracht" uit het hockeyschoenen-besluit.

**Wat:**
- **24 domeinregels in `netlify.toml`** (`[[redirects]]`, `status = 301`, `force = true`): per domein met en zonder www, elk voor HTTP en HTTPS, `/*` naar `https://jouwhockeystick.nl/:splat`. Het pad gaat mee; de querystring geeft Netlify bij een 301 zelf door.
- **jouwhockeyschoenen.nl:** de homepage (`/`) gaat naar `/hockeyschoenen`, de live en geïndexeerde schoenensectie. Andere paden gaan, zoals bij de andere domeinen, naar hetzelfde pad op jouwhockeystick.nl. Het domein heeft nooit een eigen site gehad, dus er bestaan geen oude paden om te behouden.
- **Test** `src/seo/domainRedirects.test.ts`: leest de regels uit `netlify.toml` en speelt ze na (alle domeinen, beide hostnamen, HTTP en HTTPS, bestaande pagina's, querystring). Controleert ook dat het primaire domein, www.jouwhockeystick.nl en jouwhockeystick.netlify.app nooit worden doorgestuurd en dat elke bestemming https://jouwhockeystick.nl is (geen lus, geen tweede stap).
- **Livecontrole** `scripts/check-domain-redirects.sh` (curl, geen `-k`): na deployment en certificaatuitgifte per variant de status, de bestemming en het certificaat.

**Waarom netlify.toml en niet `redirects()` in next.config.ts of de proxy:** de redirects van Next.js draait de Next-server, en die wordt bij een cachetreffer op Netlify niet aangeroepen (zie 2026-10-24). Domeinregels in `netlify.toml` draait Netlify zelf, op het CDN. De proxy (`src/proxy.ts`) reageert alleen op paden met `//` en botst hier niet mee.

**Stand DNS op 2026-11-09 (gelezen via dns.google):** alle vijf extra domeinen hebben al een A-record naar 75.2.60.5 (Netlify) en `www` een CNAME naar `jouwhockeystick.netlify.app`; nameservers bij STRATO (`*.rzone.de`). `https://jouwhockeystick.info` gaf een certificaatfout (certificaat voor een ander adres): het domein staat nog niet als alias in Netlify of het certificaat is nog niet uitgegeven. Welke domeinen in Netlify staan, is zonder Netlify-toegang niet te controleren.

**Voorwaarde in Netlify (eigenaar):** elk domein, met www, als domeinalias aan de site toevoegen; pas dan geeft Netlify een Let's Encrypt-certificaat uit en werken de regels. Deploy previews tonen deze regels niet, want die draaien op een netlify.app-adres.

**Bewust niet:** geen wijziging aan DNS, nameservers, e-mailrecords, canonical-tags, sitemap, robots.txt of structured data. Die wijzen al naar jouwhockeystick.nl (`SITE_URL` in `src/lib/site.ts`).

## 2026-11-10 — Black Friday-pagina /black-friday-hockey (jaarlijks)

**Opdracht eigenaar:** een herbruikbare Black Friday-landingspagina voor hockeysticks en hockeyschoenen op een vaste URL, zonder verzonnen kortingen.

**Gebouwd:**
- **Pagina `/black-friday-hockey`**, met server-rendered HTML en een dagelijkse herbouw (`revalidate` 1 dag). De opbouw:
  - een intro die per fase verandert (voor, tijdens en na het weekend van 27 tot en met 30 november);
  - vier keuzeroutes;
  - de acties per winkel;
  - sticks (veld, junior, zaal) en schoenen met een actuele prijs;
  - koopadvies met links naar de kennisartikelen;
  - een FAQ en een blok over hoe de pagina werkt.
- **Structured data:** `CollectionPage`, `ItemList` (links, geen `Product`), `BreadcrumbList` en `FAQPage`, alleen van zichtbare tekst.
- **Configuratie** in `src/content/blackFriday.ts`: de datums van de editie en per winkel het soort actie, de status, de datums, de controledatum, een samenvatting, de voorwaarden, de bron en de link. De logica staat in `src/lib/campaign.ts` (tijdzone Europe/Amsterdam) en is getest.
  - Een actie na haar einddatum, of zonder einddatum na het campagneweekend, staat er nooit als lopend.
  - Een controle ouder dan 14 dagen telt als "nog niet nagekeken", net als bij prijzen.
- **Winkelknoppen** naar actiepagina's via `shopPageTrackingUrl` in `src/lib/retailers.ts`. Die gebruikt dezelfde netwerkformaten en ID's als de productlinks, alleen gecontroleerd op het domein van de winkel. Er is een nieuwe plek `blackfriday` en een nieuw linktype `actie` in `retailer_click`.
- **Meten:**
  - `catalog_block_click` met `page: 'black-friday'` en blokken `routes`, `advies` en `faq`;
  - `retailer_click` met plek `blackfriday`;
  - bezoek via de gewone pageview;
  - de seizoensregel op /sticks, /zaalsticks en /hockeyschoenen als blok `seizoen`.
- **Interne links:** één rustige regel op /sticks, /zaalsticks en /hockeyschoenen, alleen van 10 tot en met 30 november. Verder sitemap en llms.txt.

**Besluiten:**
- **Geen kortingspercentages, ook niet als een winkel ze zelf noemt.** We hebben geen verifieerbare eerdere prijs (CLAUDE.md, Commerce). De pagina noemt het soort actie, de datums die de winkel vermeldt en de voorwaarden, en verwijst voor het bedrag naar de winkel.
- **De sticks zijn een prijsvergelijking, geen kortingslijst.** Alleen met de hand nagekeken sticks met een actuele prijs bij minstens twee winkels, en per groep drie merken via `pickVaried`.
- **Schoenen:** curated modellen met minstens één actuele winkelprijs, één per merk.
- **Alle vijf partnerwinkels** staan erin, ook HockeyCity, die in de opdracht niet werd genoemd. Zo lijkt de pagina niet op een advertentie voor één winkel. De volgorde: eerst lopende acties, daarbinnen op naam; nooit op vergoeding.
- **PassaSports:** de eigenaar las de actiepagina op 2026-11-10 in de browser: Black Friday-aanbiedingen vanaf vrijdag 20 november, zonder einddatum en zonder genoemde producten. Die staat nu als aangekondigd, met knop. Een jaartal staat niet op de pagina; voor 27 november opnieuw nakijken.
- **Plutosport:** de eigenaar las www.plutosport.nl/black-friday op 2026-11-10: Black Friday Early Access met een persoonlijke code na aanmelding voor de nieuwsbrief, tot en met 15 november (nieuwsbriefleden kregen hem op 6 november). Het percentage nemen we niet over. Na 15 november staat de actie vanzelf op afgelopen.
- **Niet nagekeken is geen claim.** PassaSports en Plutosport gaven op 2026-11-10 een 403, Daka een 429. We hebben de blokkade niet omzeild. Daka: de eigenaar keek op 2026-11-10 in de browser; er is nog geen Black Friday-aankondiging. Daka staat op "geen actie gevonden". De eigenaar controleert dagelijks.
- **Wat wel is nagekeken (2026-11-10):**
  - bol.com: de Black Friday-pagina staat online, zonder datums, en hockey wordt niet apart genoemd;
  - HockeyCity: een sale-pagina, geen Black Friday-actie en geen einddatum.
- **Homepage (zelfde PR, op verzoek van de eigenaar):**
  - Van 10 tot en met 30 november staat er een band direct onder de hero (`CampaignBand`). Die vervangt in die periode de zaalseizoen-band, zodat er één band tegelijk staat. De band toont alleen feiten uit dezelfde config: hoeveel partnerwinkels een actie hebben, de bevestigde begin- of einddatums (hooguit twee) en de datum van controle. Als elke controle ouder is dan 14 dagen, noemt de band geen aantallen. Blauw, want oranje blijft van de stickwijzer. Geen percentage en geen aftelklok.
  - Het zoekblok krijgt in dezelfde periode een snelkoppeling "Black Friday". In de bovenbalk op telefoons wijst de link rechts dan naar de actiepagina in plaats van naar /methodiek; de methodiek blijft bereikbaar via de hero en de footer.
  - Meten: `home_block_click` met block `blackfriday` (band) of `zoeken` (snelkoppeling, target /black-friday-hockey), en `campaign_link_click` met source `bovenbalk`.
  - Pagina's die niet dagelijks opnieuw worden gebouwd, kunnen de link in de bovenbalk tot de volgende build houden. Die link leidt dan naar de melding dat de editie is afgelopen.
- **Attributie via actiepagina's** (deeplinks naar een categorie- of actiepagina) controleren we na de eerste klikken in de dashboards van de netwerken.

## 2026-11-10 — Black Friday-kaart op de homepage: voordeel en urgentie voor de bezoeker

**Opdracht eigenaar:** de kaart onder de hero vertelt wat de bezoeker eraan heeft en waarom nu, in plaats van wat wij deden.

**Besluit:**
- **Wat de kaart telt.** De kaart telt alleen Black Friday-acties die lopen of zijn aangekondigd (`kind: 'black-friday'`). Een gewone sale (HockeyCity) en "geen actie" (Daka) tellen niet mee en worden niet genoemd. Het woord "partnerwinkels" staat niet in de kaart.
- **Eigen actienamen.** Elke actie krijgt de naam die de winkel zelf gebruikt (nieuw veld `name`, bijvoorbeeld "Black Friday Early Access"). De voorwaarde staat erbij zoals de winkel die noemt (nieuw veld `audience`, bijvoorbeeld "met een code via de nieuwsbrief"). Ontbreken die in de data, dan blijven ze weg. Een actie die "op alles" geldt heet nu categorie `alles`; bol.com noemt geen productgroep en heeft er dus geen meer.
- **Urgentie, berekend per dag in Europe/Amsterdam (`campaignCard`, `promoTiming`).**
  - Eerst een einddatum binnen 7 dagen: "stopt over X dagen (t/m 15 nov)", "stopt morgen" of "laatste dag".
  - Daarna een start: "begint 20 nov".
  - Een verlopen actie verdwijnt uit de kaart.
  - Het label is "Black Friday · nu al bezig" als er een actie loopt, anders "Black Friday · 27 november".
  - Na Cyber Monday (30 november) is de kaart weg.
  - Is elke controle ouder dan 14 dagen, dan noemt de kaart geen aantallen.
- **Vorm.** Donkere kaart (inkt) met lichte tekst en een witte knop "Bekijk de acties". Daaronder een tekstlink naar de stickwijzer en klein onderaan "Nagekeken op … bij de winkels zelf". De contrasten liggen boven WCAG AA. Op mobiel staan alleen de kop, één urgentieregel en de knop; de extra regels verschijnen vanaf tabletbreedte.
- **/black-friday-hockey** toont per winkel dezelfde naam, voorwaarde en status ("Nu bezig, stopt over 5 dagen (t/m 15 november)", "Begint op 20 november", "Afgelopen").
- **Geen kortingsclaims.** Er staan geen percentages, geen aftelklok en geen "beste".

## 2026-11-10 — Social-machine 2.0, fase 0: renderen in GitHub Actions in plaats van de browser

**Aanleiding:** goedkeuren in de Social-studio werkt niet. Renderen in de browser en opslaan via Google Drive faalt op de browser, de koppeling en de toestemmingen. Sinds 24 oktober is er niets geplaatst. Het plan staat in [bouwplan-2.0.md](marketing/bouwplan-2.0.md).

**Besluiten:**
- **De slide-renderer verhuist naar de repo** (`video/studio/slideart.js`), ongewijzigd uit de studio. De studio, en straks GitHub Actions, gebruiken dezelfde code. Zoals bij `videoart.js` gebruikt de headless render de lettertypes uit `assets/fonts`. Instrument Sans bestaat daar alleen als Regular, dus gewicht 500 en 600 wordt in de headless render nagebootst, net als bij de video's.
- **Opslag in een GitHub Release** (`social-media`) in plaats van Google Drive. De repo is openbaar, dus de url's zijn openbaar, en kosten zijn er niet. De namen liggen vast (`<id>-<n>.png`, `<id>-reel.mp4`, enzovoort), zodat de Publiceerder de url kent zonder de run uit te lezen. Een testrun zet `test-` voor de naam.
- **Idempotent.** De workflow vergelijkt de sha256 met de digest die GitHub per bestand geeft. Bij dezelfde inhoud doet hij niets, bij andere inhoud vervangt hij het bestand. Twee runs leveren nooit een tweede bestand op. `concurrency` zorgt dat er één upload tegelijk draait.
- **Controle met Zod.** Een item komt binnen als base64 via de omgeving, nooit via de shell. Toegestaan zijn een post met 1 tot 10 slides van de bekende soorten, of een video met 1 tot 20 scènes. Een id bevat alleen a-z, 0-9 en -. Is het item groter dan 60.000 tekens, dan weigert de workflow het.
- **Proef al vóór de merge.** Bij een pull request die de renderer raakt, rendert de workflow één testpost (`video/studio/fixtures/test-post.json`). Dat gebeurt alleen voor branches van deze repo, niet voor forks.
- **`render.mjs`:** een Reel heet nu `<id>-reel.mp4` (die viel eerder onder de naam "youtube"), en de Reel-cover komt erbij. De namen van Short en YouTube-video blijven gelijk.
- **Zod staat nu ook in de installatiestap van `video-publiceren.yml`**, omdat de tests in `video/studio` het nodig hebben.

## 2026-11-10 — Social-machine 2.0, fase 1: Publiceerder, tegoedteller, merkplatform en redactiecontrole

**Gebouwd:**
- **[publiceerder.md](marketing/publiceerder.md):** de opdracht van de nieuwe geplande taak Publiceerder (`trig_01WshnXeQ89cRtc5Xks53xge`, elk uur en na een tik).
  - De taak zoekt goedgekeurde items en start `social-render.yml` via `gh api`. Daarna wacht hij tot de url's antwoorden, schrijft `metricoolAkkoord.media` en plant per kanaal in volgens de regels die eerder STAP 5 van de Social-planner waren: bezig, uuid, nooit dubbel, onzeker bij twijfel.
  - Hij verwerkt ook intrekken, zet fouten in `metricoolFout` en schrijft de stand in `state/publiceerder`.
  - `social-planner.md` plant zelf niets meer in en verwijst naar de Publiceerder.
- **`video/studio/social-plan.mjs` en `social-names.mjs`:** maken van een studio-document het render-item en de vaste url's, zonder dependencies. De volledige Zod-controle blijft in de workflow (`social-items.mjs`).
- **Teller voor het Metricool-tegoed** (`src/marketing/metricoolBudget.ts`, `npm run marketing:budget`). Per maand telt elke Metricool-post één keer per uuid, uit getScheduledPosts en de studio. Instagram met Facebook samen is één post. Bij de grens plant de Publiceerder niets meer in, met een duidelijke melding. De grens is `METRICOOL_MONTHLY_LIMIT` (20, het gratis plan).
- **[merkplatform.md](marketing/merkplatform.md):** het merkplatform uit bijlage A. De Social-planner en de content-agent lezen het.
- **Redactiecontrole** (`editorCheck.ts`). Nieuw zijn de regels die een patroon kan vaststellen: geen live pagina (P0, met een lijst live pagina's), verkooppraat, een eerste beeld van meer dan 6 woorden, geen feit met getal of bron, en een te lange vervolgstap (P1). `MANUAL_CHECKS` noemt wat een mens of de planner zelf nagaat: helpt het de lezer, herkenning en belofte. De pilot-items zijn van vóór het merkplatform; sommige moeten op de nieuwe regels worden herschreven voor ze worden goedgekeurd.
- **Studio (versie 23):** Goedkeuren schrijft alleen nog `metricoolAkkoord: {op, v: 2}` en start de Publiceerder. Er wordt niets meer in de browser gerenderd en Google Drive is niet meer nodig. Goedkeuren werkt daardoor op elke telefoon en in elke browser.

**Besluiten:**
- **Alleen goedkeuringen met `v: 2` tellen.** De oude goedkeuringen kwamen van de studio van vóór 10 november; toen betekende goedkeuren "concept in Metricool". Die items staan in de studio als "opnieuw goedkeuren". Zo gaat er niets online zonder een akkoord met de nieuwe betekenis.
- **Een proefitem (`test: true`)** gaat met testbestanden en alleen als concept naar Metricool (`draft: true`, `autoPublish: false`, "PROEF: " voor de tekst). Het verandert de kanalen in de studio niet.
- **In de cloud is npm niet bereikbaar.** Wat de Publiceerder draait, gebruikt daarom alleen Node. `gh api` werkt met de toegang van de sessie, ook zonder `add_repo`.
- **Toestemming vooraf.** Een geplande taak kan geen toestemmingsvraag beantwoorden. De Publiceerder heeft daarom vooraf toestemming voor ArtifactData en voor getScheduledPosts, createScheduledPost en updateScheduledPost van Metricool. Verwijderen kan de Metricool-connector niet.
- **Proefrun (2026-11-10).** De Publiceerder las de studio, maakte het plan voor het proefitem en startte `social-render.yml` via `gh api` (HTTP 204). De workflow maakte de drie beelden. Achter de proxy van de cloudsessie geeft GitHub op HEAD een 401; een kleine GET (`-r 0-0`) werkt, en de opdracht gebruikt nu die.
- **Schrijven in de studio vraagt per run toestemming; besluit eigenaar: optie 2.** Elke cloudrun vraagt bij de eerste schrijfactie in een artifact-database om toestemming. Dat gold ook voor de Social-planner op 9 november, die met de hand werd goedgekeurd. ArtifactData in de toegestane tools helpt niet, en een vaste auto mode-regel omzeilt de toestemmingscontrole. Daarom schrijft de Publiceerder niet meer in de studio. Zijn stand (render, beelden, Metricool-id's, fouten, tegoed) staat in `video/studio/state/publiceerder.json` op de branch `social-state`. Lezen gaat via de contents-API. Schrijven via die API weigert de proxy van een cloudsessie (HTTP 403, gezien in de proefrun), het starten van een workflow mag wel. Daarom stuurt de Publiceerder elke wijziging als patch naar de workflow `social-state.yml`. Die schrijft hem met de GITHUB_TOKEN, één tegelijk (`concurrency`), met een nieuwe poging als er net iemand anders pushte. `social-state.mjs patch --wait` wacht tot de stand de wijziging toont. Een patch vervangt per item het hele record, dus twee runs die verschillende items bijwerken, zitten elkaar niet in de weg. Alleen pushes naar `main` starten CI, en Netlify slaat `video/` over. Een nieuwe fout komt als pushmelding. De studio leest de stand nog niet; in fase 2 toont de studio de status uit Metricool en uit de stand.
- **Bewezen na de merge (2026-11-10, 14:30).** Een run vanaf `main` schreef de stand twee keer via `social-state.yml` en koppelde de bestaande proefpost in Metricool (uuid 3225526408490271173), zonder een tweede te maken en zonder toestemmingsvraag. Het tegoed staat op 1 van 20. De Publiceerder staat aan, elk uur op minuut 7.

## 2026-11-10 — Social-machine 2.0, fase 2: nieuwe Social-studio

**Gebouwd:**
- **`social/studio/index.html`** (versie 25 van de studio), met dezelfde database en collecties. De publiceerinstructie staat in `social/studio/README.md`.
- **Statusregel.** Oranje bij: een goedgekeurd item dat ruim een uur na goedkeuring nog niet in Metricool staat, items om te keuren, of minder dan het ritme van 2 posts en 2 video's volgende week. Steeds met de knop die het oplost. Anders groen.
- **Kaarten.** De komende 14 dagen, met voorbeeld, Goedkeuren (baloranje, de enige oranje knop) en Aanpassen; na goedkeuren Intrekken. Tabs Te keuren (Alles goedkeuren met een tweede tik), Kalender (een lege dag kan iets laten maken) en Cijfers. Knoppen van minstens 44 px, licht en donker thema, geen vakjargon.
- **Vaste series in `slideart.js`.** Maatje, Kromming, Eerste stick, Zaal en Indoor, Wist je dat FIH en Nieuw in de catalogus krijgen een eigen openingsslide, met achtergrond en motief in de bestaande kleuren. Het render-item en de workflow geven de serie door; de planner vult het veld `serie`.

**Besluiten:**
- **Voorbeelden in de pagina zelf getekend.** Een artifact mag alleen eigen bestanden en `data:`-beelden laden, geen beelden van GitHub. De pagina tekent de voorbeelden met dezelfde `slideart.js` en `videoart.js` als `social-render.yml`, dus het beeld is hetzelfde.
- **Status uit Metricool.** Een artifact kan de stand van de Publiceerder op GitHub niet lezen. De studio leest daarom zelf getScheduledPosts via de Metricool-koppeling van de eigenaar (alleen lezen). Een item telt als ingepland als elk kanaal een post heeft met dezelfde datum, hetzelfde netwerk en hetzelfde tekstbegin; dat is dezelfde regel als in de Publiceerder.
- **Niet meer in de studio:** downloads, de oude YouTube-route via een GitHub-label, community, markt en kwartaalplan. De gegevens blijven in de database voor het Weekrapport en de Onderzoeker.

## 2026-11-10 — Social-machine 2.0, fase 3: Onderzoeker, leren en gepaarde tests

**Besluit eigenaar:** voorstellen en lessen via GitHub, niet in de studio. Een geplande taak die in de studio-database schrijft, vraagt per run om toestemming; dat geldt ook voor de Social-planner.
- **Voorstellen.** De Onderzoeker (donderdag) zet tien voorstellen en hooguit drie lessen in een issue met het label `social-voorstellen`, als vinkjes met een verborgen markering. De eigenaar vinkt aan in de GitHub-app. De planner leest vrijdag de vinkjes (`marketing:research vinkjes`) en maakt die voorstellen eerst.
- **Lessen.** Een aangevinkte les maakt de workflow `lessen.yml` (bij een bewerking van zo'n issue door de eigenaar) tot een PR naar `docs/marketing/merkplatform.md`, onder "Lessen uit de resultaten". Er zit geen taalmodel tussen; de tekst is die van het issue. Mergen is goedkeuren.

**Gebouwd:**
- **Pure functies met tests:**
  - de seizoenskalender (`calendar.ts`): zaal en indoor van oktober t/m februari, de start van het veldseizoen, Black Friday, Sinterklaas (NL 5 december 's avonds, BE 6 december 's ochtends), kerst en de Push-blokken;
  - het scoren (`research.ts`): vraag, past nu, pagina, vorm werkte eerder (vanaf 5 posts), en de pagina zes weken zonder post;
  - het leren (`learning.ts`): na 7 dagen, een index tegenover de mediaan van 8 weken per kanaal, en een les vanaf 5 posts per variant en 20% verschil;
  - de gepaarde tests (`abtest.ts`): zelfde onderwerp, weekdag en tijd, 7 tot 14 dagen uit elkaar, één ding anders, één vraag tegelijk, eerst het hooktype.
- **Resultaten** worden bewaard in de stand op `social-state`, omdat het gratis plan van Metricool maar 30 dagen statistieken houdt. `social-state.mjs` kent daarvoor `resultaten` en `onderzoek`.
- **Social-planner:**
  - fase per week (pulse of push; peak alleen als de eigenaar het vastlegt) en één vervolgstap per Push-week;
  - de aangevinkte voorstellen gaan eerst;
  - een testvoorstel wordt twee items met `abtest: {vraag, paar, rol}`;
  - het ritme van 2 posts (dinsdag en donderdag) en 2 video's (woensdag en vrijdag) per week, zoals de eigenaar op 10 november besloot.
- **Routine Onderzoeker** (`trig_015NRQE52JXPQdFLV4WutNVE`, donderdag 08:30): alleen de Metricool- en vidIQ-koppeling. Hij staat uit tot de proefrun na de merge.
- **Studio versie 26:** "Test A" of "Test B" op de kaart.

**Let op:** met 2 posts en 2 video's per week, en video's op drie kanalen, komen er ongeveer 8 Metricool-posts per week. Dat is meer dan de 20 per maand van het gratis plan. De teller stopt bij 20, met een melding. Upgraden doet de eigenaar vlak voor de livegang.

## 2026-11-10 — Social-machine 2.0, fase 4: motor met site-configuratie, Vlaanderen en Weekrapport

**Gebouwd:**
- **Configuratie per site** in `marketing/sites/jouwhockeystick.json`, met het Zod-schema in `src/marketing/siteConfigSchema.ts`. `marketing/sites/standaard.txt` (of `MARKETING_SITE`) kiest de site.
  - De loader in `siteConfig.ts` gebruikt geen Zod, omdat de scripts ook in een cloudsessie draaien, waar npm niet bereikbaar is. De tests en CI controleren elke configuratie met het schema.
- **Site-neutrale motor.** Kalender, scoren, leren, testen, tegoed, het voorstellen-issue, de KPI's en de redactiecontrole lezen alles over de site uit de configuratie. De verboden claims staan nu daar, niet meer in `editorCheck.ts`.
  - `motor.test.ts` faalt als een van die bestanden stick, zaal, bow of hockey bevat.
- **Woordenlijst BE:** zaal wordt indoor, contributie lidgeld, JO en MO worden U8 tot en met U19, en Sinterklaas valt op 6 december 's ochtends.
  - `localize` vervangt hele woorden, de langste eerst, en houdt de hoofdletter. `foreignWords` vindt NL-woorden in een Vlaamse tekst.
  - BE staat op `actief: false` tot de eigenaar bevestigt dat bol.com/be vergoedt.
- **KPI's** (`src/marketing/kpi.ts`) en het Weekrapport ([weekrapport.md](marketing/weekrapport.md)):
  - de noordster: stickwijzer-starts uit social;
  - de trechter: bereik, bewaard en gedeeld per 1.000 bereik, sitebezoek via social, winkelkliks, en bestellingen als aantal;
  - leren: kijkers die blijven per hooktype;
  - gezondheid: gepland tegenover ritme, tegoed, fouten en tijd tot goedkeuring.
  - NL en BE apart, vergeleken met het gemiddelde van 4 weken, zonder doelen vooraf.
- **Conversie-rapport:** een nieuwe sectie "Stickwijzer-starts uit social", met `quiz_start` per bron uit de UTM van het bezoek (`session.$entry_utm_medium = 'social'`). Kan PostHog dat niet beantwoorden, dan zegt het rapport dat en loopt de rest door.

**Besluiten:**
- **Het Weekrapport is een GitHub-issue** met het label `marketing`, om dezelfde reden als de voorstellen: een geplande taak die in een claude.ai-pagina schrijft, vraagt per run om toestemming. De cijfers van elke week staan onderaan het issue als verborgen JSON. Het Weekrapport leest daarmee de vorige 4 weken, en het dashboard (Dashboard-type, gemaakt in een claude.ai-sessie) leest dezelfde issues.
- **Onderzoeker:** vooraf toegestaan zijn alleen de leestools van Metricool (getAnalyticsAvailableMetrics, getAnalyticsDataByMetrics, getScheduledPosts) en van vidIQ (keyword_research). vidIQ kan tegoed bij vidIQ kosten; dat houdt de eigenaar in de gaten.

## 2026-11-10 — TikTok-posts krijgen een titel

2026-11-10: TikTok-posts krijgen een titel (tiktok.titel, anders de Short-titel), omdat Metricool die verplicht stelt.

- **Publiceerder** (`publiceerder.md`, STAP 3d): `tiktokData.title` is `tiktok.titel`, of anders `short.titel` zonder " #shorts". Hooguit 90 tekens, afgebroken op een heel woord, en bij een proef met "PROEF: " ervoor. Zonder titel maakt hij geen TikTok-post en zet hij een fout.
- **Social-planner** (`social-planner.md`): het tiktok-object krijgt `titel`, de hook in één korte zin van hooguit 90 tekens. Ook bij `video_herschrijven`.
- **Geen codewijziging nodig:** `video/studio/social-names.mjs` geeft het hele tiktok-object door (`VIDEO_FIELDS`), en de studio toont geen TikTok-velden.
- **Aanleiding:** TikTok voor `videos/20261106-zaal-is-geen-veld` (11 november, 19:30) stond niet in Metricool. Die video heeft een Short-titel, dus de eerste run van de Publiceerder na de merge plant TikTok vanzelf in.

## 2026-11-10 — Bing-rapport

- **Wat:** een wekelijks rapport uit de Bing Webmaster API (`bing-webmaster.yml`, maandag 05:47 UTC, en met de hand). Eén issue per ISO-week, "Bing-rapport <week>" met label `bing`; een tweede run in dezelfde week werkt het bij. Alleen lezen; de sleutel komt uit het secret `BING_WEBMASTER_API_KEY` en komt in geen melding terecht.
- **Weken:** kliks en vertoningen per dag (GetRankAndTrafficStats) over maandag tot en met zondag. Zoekvragen, pagina's en de positie komen per Bing-week (GetQueryStats, GetPageStats), en Bing telt die week anders; het issue noemt de einddatum.
- **Groeien:** minstens 3 vertoningen en 50% meer dan de Bing-week ervoor; nieuw is zonder vertoningen de week ervoor. Ontbrekende data heet "ontbreekt", nooit nul.
- **Citaties in Copilot:** het AI Performance-rapport is niet via de API te lezen. De methodenlijst van de API (IWebmasterApi, Microsoft Learn) heeft er geen methode voor. Dat staat in het issue, met de bron; geen verzonnen endpoint.
- **Gebruik:** de Onderzoeker telt een groeiende Bing-zoekvraag als "er is vraag"; het Weekrapport noemt Bing als context. `kpi.ts` blijft ongewijzigd.

## 2026-11-11 — Onze keuze in plaats van Beste match

- **Reden:** "Beste match" botst met onze regel geen beste-stick-claims, en "persoonlijk advies" wekte de schijn van een mens die meekijkt. De stickwijzer is een regelgebaseerde keuzehulp.
- **Besluiten:** de rol `best_match` heet in de tekst "Onze keuze" (`ROLE_LABELS`, de rollenlijst in `methodiek.ts`, het voorbeeld op de homepage). Boven die kaart staat één zin: "Op basis van jouw antwoorden zouden wij kiezen voor deze stick." (`roleLead` in `resultCopy.ts`). Alleen een stick met minstens 70 punten krijgt het label; `closest_option` blijft "Dichtstbijzijnde optie". "Persoonlijk advies" is nog alleen voor menselijk contact via /interesse. /over-ons, drie artikelkoppen of zinnen en `METHODIEK.updatedAt` zijn aangepast.
- **Bewust niet aangepast:** de rol-sleutels (`best_match` blijft in de code en in analytics), adviesregels, scoring, `RULE_SET_VERSION`, `ADVICE_VERSION`, /zaalsticks en `zaal.ts`, `BRAND_PAYOFF` ("Eerlijk stickadvies op maat"), en de knop "Vraag persoonlijk advies".
- **Keuze snel of uitgebreid:** de beschrijving van "Uitgebreid advies" in `quick.ts` is "Met speelwensen, techniek en stickgevoel: meer vragen, meer kenmerken in het advies." Meer vragen betekent meer kenmerken in de weging, niet bewezen een nauwkeuriger uitkomst. De labels en `resultNote` zijn ongewijzigd. De kop "Advies nog preciezer maken?" in `QuizForm.tsx` is "Wil je nog meer meegeven?" (constante `EXTRA_QUESTIONS_HEADING` in `quick.ts`). Een test houdt "preciezer" en "nauwkeuriger" uit de stickwijzer-teksten.
- **Open:** het label "Beste start" op de route START en de woorden "beste match" in lopende tekst staan nog; zie de PR.

## 2026-11-11 — De Jouwhockeystick-methode

- **Besluit eigenaar:** onze werkwijze krijgt een naam: "Jouwhockeystick-methode" (hoofdletter J, koppelteken), met als bijschrift "speler, stick, maat". Zonder ™ tot een merkencheck bij het BOIP.
- **Aanleiding:** de AI-nulmeting van 2026-11-11 (12 vragen, 4 AI-zoekmachines). AI kent jouwhockeystick.nl als tool en beschrijft /methodiek juist, maar gebruikt de kennispagina's nog nauwelijks als bron. Een naam met een vaste volgorde geeft die pagina's een gemeenschappelijk anker.
- **Wat:** `src/content/methode.ts` (`METHODE`, één bron voor de kernzin en de kortere versies), /methodiek (H1, kader met kernzin en versieregel, "In 1 minuut", drie onderdelen met de herkomst van de regels, "Wat de methode niet doet", JSON-LD met WebPage, DefinedTerm en HowTo), de band `MethodBand` op de homepage, één zin en één FAQ-vraag op /stickwijzer, de regel in llms.txt en de IndexNow-koppeling. De bestaande tekst blijft onder de H2 "Hoe komt ons stickadvies tot stand?", dus die vraag blijft beantwoord.
- **Eerlijkheid:** de methode is een redactionele werkwijze, niet wetenschappelijk getoetst en niet extern beoordeeld, zonder eigen metingen. Dat staat op de pagina. De nieuwe tekst bevat geen "bewezen", "gecertificeerd", "objectief", "onafhankelijk", "beste" of een aangekondigde beoordeling. `methodiek.test.ts` bewaakt dat, en bewaakt dat de tekst bij de engine blijft passen: zes gewichten in `ROUTE_WEIGHTS`, positie alleen een verfijning, de maat als laatste, en vergoedingen die niet meetellen. Wijzigt de engine, dan faalt de test en moet de tekst opnieuw worden gelezen.
- **Bewust niet:** ™; "protocol" en "score" als naam (ze suggereren een getest proces of een ranglijst); "drie stappen" (de site kent al drie routes en drie homepage-stappen, dus "een volgorde"); /zaalsticks en andere beschermde pagina's; adviesregels, `RULE_SET_VERSION` en `ADVICE_VERSION`. De veld-pillar, een zin per kennisartikel, /over-ons en de Person-markup horen bij een volgende PR.
- **Afwijking van het plan:** de constante staat in een eigen bestand (`methode.ts`, zonder imports) en niet in `methodiek.ts`, zodat de tekst gewone content blijft en los te testen is. `methodiek.ts` levert alleen de versieregel.
- **Herhaling:** de naam komt hooguit drie keer per pagina voor buiten /methodiek, niet in koppen van kennisartikelen, altijd als "Jouwhockeystick-methode".
- **Open:** merkencheck bij het BOIP (eigenaar). Na de merge /methodiek laten indexeren in Search Console. De nulmeting na 2, 4 en 8 weken herhalen met dezelfde vragen, in een schone tijdelijke chat.

## 2026-11-11 — "Onafhankelijk" en "objectief" van de site gehaald als claim

**Aanleiding:** de AI-nulmeting van 11-11-2026: alle vier de platforms herhaalden "onafhankelijk" over de site. De site verdient aan partnerlinks, dus het woord is niet te onderbouwen en kan als misleidend worden gelezen. Dit draait de keuze van 2026-10-19 terug (eigenaar akkoord).

**Wat:** vervangen door wat wel controleerbaar is: de winkelvergoeding telt niet mee in het advies.
- Standaard-metabeschrijving (`src/lib/site.ts`, 154 tekens): "Advies voor een hockeystick die past bij lengte, ervaring, speelwensen en budget. Winkelvergoedingen tellen niet mee. Per stick zie je redenen en bronnen." Let op de klikratio in Search Console op pagina's met de standaardbeschrijving.
- Homepage: vertrouwensregel "Winkelvergoedingen tellen niet mee" en kop "Advies waarin winkelvergoedingen niet meetellen, met alles om het te controleren".
- Header (telefoon): "Stickvergelijker met bronvermelding".
- FAQ: "Telt de winkelvergoeding mee in het advies?" (antwoord ongewijzigd).
- Clubteksten (`clubs.ts`, `docs/club-outreach.md`): "onafhankelijk" geschrapt; de eigenaar verstuurt clubmails zelf.

**Bewust gelaten:** "Onafhankelijke bron" als bronlabel (FIH, scripties) in `sources/` en op /zaalsticks (beschermd); "onafhankelijk bevestigd via hockey.nl" in `brands.ts`; de twee bronzinnen in `methodiek.ts`; de regex tegen "objectief beter" in `validation.ts`.

**Test:** `src/content/claims.test.ts` bewaakt dat de zes bestanden het woord niet terugkrijgen.

## 2026-11-11 — Carbonartikel herschreven op dezelfde URL (issue #216)

**Wat:** `/kennis/meer-carbon-hockeystick-beter` herschreven tot "Hoeveel carbon heeft je hockeystick nodig?". Zelfde URL, geen redirect. De vuistregel uit de adviesengine (`SOFT_MAX_CARBON`, `DIRECT_MIN_CARBON`, `HIGH_CARBON`) vervangt "geen vaste percentages per niveau". Nieuw zijn een sectie voor ouders, een testrondje en een FAQ. De catalogustabel en de notitie "Wij testen sticks niet zelf" bleven. "Is meer carbon altijd beter?" staat als H2.

**Waarom:** pillar-plan en SEO/GEO-diagnose van 10 november: de hoofdvraag van de zoeker is het percentage.

**Ook:** de FAQ op `/sticks` geeft nu de getallen (uit dezelfde constanten); linkteksten naar het artikel aangepast in `veld.ts`, `landingFaqs.ts`, `FamilyTable` en Black Friday.

**Bewust niet:** `/zaalsticks`, de adviesregels zelf, prijzen of productnamen in vaste tekst, eigen testclaims.

## 2026-11-11 — Meetinfrastructuur: eigen verkeer, rol en plek bij winkelkliks

- **Aanleiding:** de Buyer Intelligence-analyses hebben schone en vergelijkbare data nodig. Eigen bezoeken tellen mee, en een klik naar een winkel zegt niet welke adviesstick het was.
- **Eigen verkeer:** `?intern=aan` op een eigen apparaat zet één sleutel (`jhs-intern`) in de lokale opslag; die browser stuurt dan geen PostHog- en funnel-events meer (`src/lib/analytics/internal.ts`). `?intern=uit` zet het terug. Gewone bezoekers merken niets. De privacyverklaring is niet aangepast; de gevolgen en een voorstel voor een zin staan in `docs/analytics.md`.
- **Winkelkliks uit de stickwijzer:** `retailer_click` krijgt binnen een advies `adviceRole` (de rol-sleutel van het systeem), `adviceRank`, `adviceRoute`, `budgetBand` en `replacementReason`. `quiz_complete` krijgt dezelfde route, budgetband en reden. Alles optioneel, dus bestaande rapporten blijven werken; `position` blijft de plek van de winkel.
- **Rapport:** het conversie-rapport toont "Per plek in het stickadvies" zodra klikken een rol hebben.
- **Bewust niet:** lengte, leeftijd of vrije tekst in events; wijzigingen aan partnerlinks of sub-ID's; het verkooprapport (voorstel in `docs/analytics.md`: Plutosport en Daka toevoegen, en pas later de rol in de tracking-link); wijzigingen aan de privacyverklaring.

## 2026-11-11 — Zaalsprint: /zaalsticks krijgt een vergelijkingstabel, meer FAQ en een link naar de stickwijzer

- **Aanleiding:** Search Console (2026-10-10 t/m 2026-11-06) toont zaalzoekwoorden op positie 10 tot 14 zonder klik (zaalhockeystick 106 vertoningen, zaalsticks, zaalstick hockey), en de zaalkeuze heeft in de week van 2 tot 8 november 2 kliks en 1 verkoop bij PassaHockey. De aantallen zijn klein: richting, geen conclusie.
- **Wat:**
  - **Tabel "Zaalsticks naast elkaar"** (`IndoorCompareTable`): de met de hand nagekeken zaalsticks met lengtes, carbon, bow-profiel en richtprijs, server-rendered, van laag naar hoog. Een ontbrekend gegeven staat als "niet vermeld". De titel belooft "vergeleken"; die vergelijking stond er nog niet in tabelvorm.
  - **FAQ:** twee vragen erbij ("Welke zaalhockeystick past bij een kind of beginner?" en "Hoeveel carbon heeft een zaalstick nodig?"), met de FAQPage-markup uit dezelfde bron.
  - **Stickwijzer:** de noot onder de keuzehulp verwijst naar de stickwijzer voor wie ook veldhockey speelt, gemeten als `catalog_block_click` (page `zaalsticks`, block `stickwijzer`). De noot zegt nog steeds dat de stickwijzer geen zaalsticks adviseert.
  - **Meta-beschrijving:** noemt kind of volwassene en "vergelijk"; 158 tekens. `updatedAt` 2026-11-11.
- **Bewust niet:** de SEO-titel, de H1, de intro en de ankers (de pagina staat net onder pagina 1; een test bewaakt ze), de visuele opmaak, de adviesregels en de artikelen. Het zoekwoord "verschil veldhockey zaalhockey stick" rankt op het budgetartikel (positie 12) en niet op de pagina die erover gaat; dat laten we voor nu zo, want de artikelen zijn al aan elkaar gelinkt.

## 2026-11-11 — Maatsprint: van de lengtetabel naar de sticks in jouw maat

- **Aanleiding:** de lengtetabel (`/kennis/hockeystick-lengte-tabel`) is de plek waar de maatvraag wordt beantwoord, maar wie zijn maat kent, had geen directe weg naar sticks in die maat; alleen naar de stickwijzer. Op `/sticks` bestaat al een lengtefilter (`?lengte=`).
- **Wat:**
  - **Lengtetabel-artikel:** in "Liever sticks in jouw maat zien?" staat nu een link naar alle veldsticks (filter op lengte) en naar 36,5 inch, de meest gekozen maat voor volwassenen. De link naar de stickwijzer blijft.
  - **Kinderen en beginners:** de kop "De juiste lengte voor je kind" is "Welke maat hockeystick heeft je kind nodig?" (zoekwoord "hockeystick junior maat", positie 41,9) en de sectie linkt naar de filters. `updatedAt` 2026-11-11.
  - **Test:** de titel, intro, tabel en alle koppen van het lengtetabel-artikel zijn vastgezet, evenals de nieuwe links.
- **Bewust niet:** de titel, intro, tabel en koppen van het lengtetabel-artikel (rankingsignalen); een leeftijdstabel (ouders zoeken op leeftijd, maar er is geen betrouwbare bron voor de gemiddelde lengte per leeftijd in de repo; de TNO-groeidiagrammen staan alleen als pdf en een tabel per leeftijd is niet gevonden, dus geen getallen verzonnen); FAQ-markup op artikelen (artikelen kennen die nog niet, en de winst is klein); wijzigingen aan de adviesregels.

## 2026-11-11 — Beginnerssprint: welke merken, en de snelle route voor ouders

- **Aanleiding:** Search Console (2026-10-10 t/m 2026-11-06) toont "hockey strick beginnen kind welke merken" op positie 5,2 met 45 vertoningen en 0 kliks, en het artikel over kinderen en beginners noemde nergens welke merken sticks voor beginners hebben. De snelle route (`/stickwijzer?snel`: leeftijd, lengte, ervaring en budget) bestond alleen als link op de homepage; de artikelen voor ouders linkten naar de keuze tussen snel en uitgebreid.
- **Wat:**
  - **Kinderen en beginners:** een sectie "Welke merken hebben sticks voor beginners?", gebouwd uit de catalogus (nu 13 merken), zonder rangorde en met een pointer naar `/merken`; een richtprijs voor beginnerssticks voor volwassenen; links naar het snelle advies in de maatsectie en onderaan, naast de gewone stickwijzer-link; meta-beschrijving met "merken".
  - **Kinderzaalartikel en kinderschoenenartikel:** een link naar het snelle advies. In het kinderzaalartikel is "persoonlijk advies" voor de stickwijzer vervangen ("Snel een selectie of een advies voor het veld"), zoals besloten voor de uitslag (2026-11-11, "Onze keuze").
  - **Fouten-blog:** een link naar het artikel voor kinderen en beginners bij "een kinderstick op de groei".
  - `updatedAt` 2026-11-11 in de vier artikelen en de blog. Tests in `src/content/beginners.test.ts`.
- **Bewust niet:** de titel, intro en bestaande koppen van het artikel (de pagina staat op positie 5,2); een merkenrangorde of "beste merk" (geen beste-claims); FAQ-markup op artikelen; een leeftijdstabel (geen bron, zie maatsprint); wijzigingen aan de stickwijzer zelf.

## 2026-11-11 — Leeftijdsindicatie in de lengtetabel (alleen als indicatie, lengte blijft leidend)

- **Besluit eigenaar:** een leeftijdsindicatie is toegestaan als er brondata is. De lengtetabel van 2026-10-29 zonder leeftijdstabel gold omdat die bron er toen niet was; de bewaking in `lengthTable.test.ts` laat nu alleen de nieuwe, gebronde sectie toe.
- **Bron:** JGZ-richtlijn Lengtegroei, Bijlage 1, tabel 3 (gemiddelde lengte en SD van Nederlandse meisjes en jongens per leeftijd), op basis van Schönbeck e.a. 2013 (Vijfde landelijke groeistudie, metingen 2008 en 2009). Gemiddelden, geen mediaan. De TNO-groeidiagrammen op tno.nl zijn lege diagrammen zonder cijfers en zijn niet gebruikt. Een KNHB-richtlijn is niet gevonden; de merkrichtlijnen (Grays, Osaka, Princess) werken alleen met lichaamslengte.
- **Controle van de cijfers:** alle 44 waarden (gemiddelde en SD voor 11 leeftijden en 2 geslachten) zijn op coördinaten uit de pdf gelezen en vergeleken met `childHeight.ts`: 0 afwijkingen. De leeftijd 6,0 (jongens) en de eindlengtes (183,8 en 170,7 cm) komen ook voor in de rekenvoorbeelden en tabel 2 van hetzelfde document.
- **Wat:**
  - `src/content/childHeight.ts`: de brondata (leeftijd 5 tot en met 15), de bronvermelding en de berekening. De maat komt uit `LENGTH_GUIDE`, dus er is geen tweede maattabel: bij de gemiddelde lengte, en een bandbreedte van de kortste maat bij gemiddelde min 1 SD tot de langste maat bij gemiddelde plus 1 SD (ongeveer twee op de drie kinderen). Lengtes worden naar hele cm afgerond voor de band.
  - Lengtetabel-artikel: sectie "En op leeftijd? Een indicatie" (anker `#leeftijd`) na "Koop een kinderstick niet op de groei" en voor "Volwassenen", met een waarschuwingskader, de tabel ("Op de verjaardag van": de cijfers gelden op de verjaardag zelf) en twee bronnen in de bronnenlijst. Titel, intro, hoofdtabel en bestaande koppen zijn ongewijzigd.
  - Artikelschema: een optioneel `id` per sectie en een blok `callout` (alleen toevoegingen).
  - Links naar `#leeftijd`: artikel voor kinderen en beginners, kinderzaalartikel en de stickwijzer-FAQ ("kind van 12").
- **Bewust niet:** interpoleren tussen leeftijden, medianen, leeftijden onder 5 of boven 15, cijfers voor kinderen van een andere herkomst (de tekst verwijst naar de richtlijn), en wijzigingen aan de adviesregels of de stickwijzer.

## 2026-11-11 — Verkooprapport: Plutosport (Awin) en Daka (Daisycon)

- **Aanleiding:** het verkooprapport toonde bol.com, PassaHockey en HockeyCity, maar niet Plutosport en Daka, terwijl beide een knop hebben. Zonder die twee is niet te zien welke content, route of winkel omzet oplevert.
- **Wat:**
  - **Plutosport:** de verkopen per `clickref` uit de Awin-transacties (`GET /publishers/{id}/transactions/`, zonder afgewezen en verwijderde) en de kliks in totaal uit het Awin-rapport per adverteerder (regio NL). Awin geeft geen kliks per `clickref`, dus de kolom per plek is een streepje.
  - **Daka:** kliks en verkopen per sub-ID (`ws`) uit `GET /publishers/{id}/statistics/subid` van Daisycon, gefilterd op programma 7290 en media 441384. Verkopen zijn open plus goedgekeurde transacties.
  - **Zelfde conventies:** alleen aantallen (nooit bedragen), elke bron valt apart uit met de reden, geen pakketten (de workflow draait zonder `npm ci`), geheimen alleen uit GitHub-secrets en nooit in een melding.
  - **Nieuwe secrets:** `AWIN_API_TOKEN`, `DAISYCON_CLIENT_ID`, `DAISYCON_REFRESH_TOKEN` en optioneel `DAISYCON_CLIENT_SECRET`. De stappen om ze te maken staan in `docs/analytics.md`.
- **Gevonden:** de workflow leest `BOL_AFFILIATE_CLIENT_ID` en `BOL_AFFILIATE_CLIENT_SECRET`, maar de repo heeft die secrets niet (wel `BOL_CLIENT_ID`, `BOL_CLIENT_SECRET` en `BOL_CLIENT_ID_RAPPORT`). Daarom stond bol.com in het rapport van 9 november als "sleutels ontbreken". Niet aangepast: welke sleutel bij het Partnerprogramma hoort, bepaalt de eigenaar.
- **Onzeker tot de eerste run met echte sleutels:** de Awin-documentatie beschrijft het antwoord van de transacties niet (de code leest `clickRefs.clickRef` en `clickRef`), en de Daisycon-documentatie zegt niets leesbaars over het vervallen van een refresh-token (OAuth 2.1 met PKCE). Het rapport meldt een nieuw refresh-token.
- **Bewust niet:** bedragen, Jumbo Sports, wijzigingen aan partnerlinks of sub-ID's, en een koppeling van klikken aan personen. Het voorstel voor analyse van content, routes, winkels en stickadviezen staat in `docs/analytics.md` ("Van klik naar omzet").

## 2026-11-11 — Verkooprapport na de eerste run: klikken en Daisycon

- **Eerste run (week 4 t/m 10 november):** bol.com (11 kliks, 1 bestelling), PassaHockey (127 kliks, 2 verkopen) en HockeyCity werken. De Awin-token werkt; Plutosport had geen rij in het rapport per adverteerder, waarschijnlijk omdat er geen klik was.
- **Klikken van de netwerken zijn opgeblazen** tegenover PostHog (PassaHockey 127 tegen 5, bol.com 11 tegen 1, in vergelijkbare weken), waarschijnlijk door bots en crawlers. Besluit: verkopen komen uit de netwerken, de conversie rekenen we met de kliks van PostHog.
- **Daisycon:** de API heeft een refresh-token dat maar één keer bruikbaar is. De code die in PR #224 staat (een vast refresh-token in een secret) werkt daardoor niet voor een wekelijkse workflow. Voorstel: de export-URL met een vast token (verkopen per sub-ID, geen kliks) en de kliks uit PostHog. De code wordt omgezet zodra de eigenaar het export-token en de veldnamen heeft aangeleverd. Het hoofdstuk "Daisycon (Daka)" in `docs/analytics.md` legt het vast.
