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
