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

**Reden:** Expliciete opdracht om adidas via bol.com te sourcen nu adidas.nl niet te raadplegen is. bol.com is voor dit project al de aangewezen verkooppartner, en `partner-shop` is een bestaand, toegestaan brontype in het schema (source-policy.md §2) — dit is dus geen nieuwe categorie, alleen de eerste keer dat we hem voor specs gebruiken i.p.v. alleen voor prijs.

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
