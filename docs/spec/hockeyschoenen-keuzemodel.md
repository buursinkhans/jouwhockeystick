# Hockeyschoenen-keuzemodel — advies en functionele opzet

> **Leidend document** voor de sectie `/hockeyschoenen` (issue #100): de vragen, de beslisregels, het productmodel, de resultaatpagina en de acceptatietests. Omgezet uit `advies_hockeyschoenen_keuzemodel.docx` van de eigenaar op 2026-10-31; de tekst is letterlijk overgenomen, alleen de tabellen en opsommingen zijn in Markdown opgemaakt. Afwijkingen bij de bouw staan in `docs/decision-log.md`.

## 1. Doel

Ontwikkel een online keuzehulp die spelers op basis van een korte vragenlijst een uitlegbaar pasadvies geeft voor veld- en zaalhockeyschoenen.

De keuzehulp kiest niet automatisch de duurste schoen, maar selecteert modellen op geschiktheid, persoonlijke aansluiting en gebruik. Een online uitkomst is een pasadvies, geen garantie op een perfecte pasvorm en geen medisch advies.

Dit document bevat een ontwerpvoorstel. De vragen, prioriteiten en beslisregels zijn niet wetenschappelijk gevalideerd als schoenentest. Valideer ze met productcontrole, praktijktests en gebruikersfeedback.

## 2. Uitgangspunten

Hanteer deze volgorde:

1. Geschiktheid voor veld of zaal.
2. Geschiktheid voor de daadwerkelijk gebruikte ondergronden.
3. Voetvorm en bekende pasproblemen.
4. Gebruiksbelasting en comfort.
5. Bewegingsstijl.
6. Persoonlijke voorkeuren, budget en uitstraling.

Positie is context, geen zelfstandig voorschrift voor een schoentype. Een aanvaller heeft niet automatisch een lichte schoen nodig en een verdediger niet automatisch een zware, stijve schoen.

Maak onderscheid tussen:

- **Fabrikantinformatie:** wat de fabrikant over een model verklaart.
- **Eigen testervaring:** wat met een vastgelegd protocol is beoordeeld.
- **Redactionele interpretatie:** hoe het platform eigenschappen vertaalt naar advies.
- **Onbekend:** informatie die niet betrouwbaar beschikbaar is.

Onbekend betekent nooit automatisch geschikt of gemiddeld.

## 3. Water- en zandkunstgras

### 3.1 Kernregel

Neem de ondergrond mee, maar maak geen kunstmatige scheiding tussen uitsluitend waterveldschoenen en uitsluitend zandveldschoenen. Fabrikanten bieden ook zolen aan die expliciet voor beide ondergronden zijn bedoeld. [B1][B2]

### 3.2 Selectielogica

| Gebruik | Voorgestelde advieslogica |
|---|---|
| Bijna uitsluitend waterveld | Selecteer modellen met bevestigde geschiktheid voor waterveld. Vergelijk grip op nat kunstgras alleen wanneer daarvoor bruikbare gegevens bestaan. |
| Bijna uitsluitend zandveld | Selecteer modellen met bevestigde geschiktheid voor zandkunstgras. Geef slijtvastheid extra aandacht wanneer daar gegevens over zijn. |
| Regelmatig beide | Geef voorkeur aan bevestigde geschiktheid voor beide ondergronden. |
| Semi-waterveld of hybride | Controleer expliciet wat fabrikant of testbron over deze ondergrond zegt; veronderstel geen universele indeling. |
| Onbekend | Help de gebruiker de ondergrond herkennen of geef uitsluitend een voorwaardelijk advies. |

Vraag naar trainingen én uitwedstrijden, niet alleen naar het thuisveld.

### 3.3 Niet gebruiken als automatische regels

- Waterveld betekent altijd lange, scherpe noppen.
- Zandveld betekent altijd korte, ronde noppen.
- Een duurdere schoen heeft automatisch betere grip.
- Waterafstotend bovenwerk levert betere grip op.
- Een fabrikantclaim over geschiktheid bewijst dat een schoen beter presteert dan een ander model.

Een concrete vergelijking van grip of duurzaamheid vraagt om vergelijkbare testgegevens. Eén zool kan volgens de fabrikant voor zowel water- als zandkunstgras bedoeld zijn. [B1][B2]

## 4. Positie en bewegingsstijl

Onderzoek bij elitehockey laat verschillen in fysieke belasting tussen posities zien. De uitkomsten hangen onder meer af van speelminuten, onderzochte groep en gebruikte meetmaat. Dit onderbouwt vragen over gebruik en beweging, maar geen automatische koppeling aan commerciële schoenmodellen. [B3][B4][B5]

| Positie | Relevante vervolgvraag | Adviesvertaling — ontwerpkeuze |
|---|---|---|
| Aanvaller | Veel korte starts, stops en richtingswisselingen? | Controleer aansluiting en hielvastheid; beoordeel daarna gewichtsvoorkeur. |
| Middenvelder | Veel loopmeters en lange speelperiodes? | Beoordeel comfort gedurende gebruik en dempingsvoorkeur. |
| Verdediger | Vooral zijwaarts verdedigen of veel opkomen? | Beoordeel de daadwerkelijke bewegingen en zijwaartse aansluiting. |
| Wisselende posities | Welke bewegingen komen het meest voor? | Gebruik een allroundprofiel op basis van antwoorden. |
| Keeper | Schoenen voor onder keepersuitrusting? | Aparte adviesroute; niet zonder toetsing behandelen als veldspeler. |

Voorkom dubbeltelling: geef niet eerst extra punten voor ‘aanvaller’ en vervolgens opnieuw voor het daarbij veronderstelde sprintgedrag. Laat zelfgerapporteerde bewegingsstijl zwaarder wegen dan het positielabel.

## 5. Vragenlijst

Gebruik acht hoofdvragen. Toon vervolgvragen alleen wanneer het antwoord de selectie of uitleg verandert.

### Vraag 1 — Waarvoor zoek je schoenen?

- Veldhockey.
- Zaalhockey.
- Voor beide een apart paar.

**Logica:** scheid de productcategorieën. Bij ‘beide’ ontstaan twee adviezen; geen compromisadvies voor één paar. Voor zaal zijn een geschikte indoorzool en non-marking-eigenschap productvoorwaarden.

### Vraag 2 — Voor wie zoek je?

- Kind dat nog groeit.
- Jeugdspeler.
- Volwassene.
- Keeper.

**Logica:** route en uitleg aanpassen. Leeftijd bepaalt niet automatisch de prijsklasse. De keeperoptie leidt naar een aparte route of een duidelijke melding dat specialistisch advies nodig is.

### Vraag 3 — Op welke ondergrond speel je meestal?

Alleen bij veldhockey:

- Bijna alleen waterveld.
- Vooral waterveld, soms zand- of semi-waterveld.
- Ongeveer even vaak op verschillende veldtypen.
- Vooral zand- of semi-waterveld.
- Weet ik niet.

Vervolgvraag indien nodig: welke tweede ondergrond gebruik je regelmatig?

**Logica:** sla hoofd- en tweede ondergrond afzonderlijk op. Voeg zand- en semi-waterveld in de productdatabase niet zonder controle samen. Geschiktheid is modelspecifiek. [B1][B2]

### Vraag 4 — Hoe vaak gebruik je de schoenen?

- Ongeveer één keer per week.
- Twee tot drie keer per week.
- Vier keer per week of vaker.

Optionele vervolgvraag: zijn het meestal korte sessies of vaak trainingen/wedstrijden van een uur of langer?

**Logica:** gebruiksprofiel voor comfort, duurzaamheid en prijs-kwaliteit. De grenzen zijn ontwerpkeuzes, geen bewezen fysiologische omslagpunten.

### Vraag 5 — Hoe sluiten sportschoenen meestal aan?

Meerdere antwoorden mogelijk:

- Meestal goed; geen duidelijke pasproblemen.
- Vaak te krap bij de voorvoet.
- Vaak te ruim bij de hiel.
- Vaak druk boven op de voet/wreef.
- Mijn voeten schuiven regelmatig in de schoen.
- Ik weet het niet.

Vervolgvragen:

- Welk merk en model draag je nu?
- Wat zit daaraan goed en wat niet?
- Waar zit eventuele druk of schuiven?

**Logica:** voorvoet, hiel en wreef onafhankelijk opslaan. Een brede voorvoet en smalle hiel moeten tegelijk kunnen voorkomen. Gebruik geen enkelvoudig voetlabel als volledige beschrijving.

### Vraag 6 — Wat beschrijft jouw spel het beste?

Kies maximaal twee:

- Veel korte sprints en plotseling stoppen.
- Veel zijwaarts bewegen en draaien.
- Veel loopmeters gedurende de wedstrijd.
- Afwisselend/allround.
- Ik ben beginner of weet het nog niet.

Optioneel: positie op het veld.

**Logica:** bewegingsstijl verfijnt de voorkeuren. Positie mag niet zelfstandig modellen uitsluiten en vervangt de bewegingsvraag niet. [B3][B4][B5]

### Vraag 7 — Zijn er bijzonderheden voor het passen?

Meerdere antwoorden mogelijk:

- Ik gebruik eigen inlegzolen of een brace.
- Ik heb terugkerende pijn of een recente blessure.
- Ik heb vooral blaren, drukplekken of schuiven.
- Geen bijzonderheden.

**Logica:**

- **Eigen inlegzool/brace:** voorwaardelijk advies en expliciete pascontrole.
- **Terugkerende pijn of recente blessure:** geen diagnose, geen automatische corrigerende schoenkeuze; verwijs naar individuele beoordeling.
- **Blaren of schuiven:** vraag de locatie, maar claim niet dat de oorzaak daarmee vaststaat.

Maak geen blessurescore en beloof niet dat een model klachten oplost of blessures voorkomt. Verzamel geen onnodige medische details en sla zulke informatie niet standaard op.

### Vraag 8 — Wat is je budget en wat vind je belangrijk?

Leg budget afzonderlijk vast en vraag of een duurder alternatief getoond mag worden.

Kies daarnaast maximaal twee voorkeuren:

- Comfort.
- Stevige aansluiting.
- Licht gevoel.
- Slijtvastheid.
- Bescherming tegen vocht bij buitengebruik.
- Geen voorkeur.

**Logica:** voorkeuren rangschikken uitsluitend modellen die aan de basisvoorwaarden voldoen. Een voorkeurskenmerk compenseert geen ongeschikte ondergrond of duidelijk pasvormconflict.

### Aanvullende noodzakelijke invoer

Vraag vóór concrete productselectie ook naar de gewenste schoenmaat of laat de gebruiker ‘maat nog bepalen’ kiezen. Gebruik modelgebonden maatinformatie waar beschikbaar. Een EU-maat is geen volledige pasvormbeschrijving.

Zonder betrouwbare maat- en voorraadgegevens mag de keuzehulp een profieladvies tonen, maar niet beweren dat een model direct in de juiste maat verkrijgbaar is.

## 6. Beslisarchitectuur

### Laag A — Harde voorwaarden

Controleer:

- Veld of zaal.
- Ondergrondgeschiktheid.
- Maat en actuele beschikbaarheid.
- Budget en toestemming voor alternatieven daarboven.
- Noodzakelijke combinatie met hulpmiddelen, uitsluitend voor zover controleerbaar.

Maak onderscheid tussen:

- **Voldoet:** kenmerk bevestigd.
- **Voldoet niet:** bekend conflict; uitsluiten.
- **Onbekend:** niet als bevestigde match presenteren; eventueel voorwaardelijk tonen met uitleg.

Geef bij nul passende resultaten eerlijk aan waarom geen verantwoorde selectie mogelijk is. Versoepel geen harde voorwaarde om toch een verkoopresultaat te krijgen.

### Laag B — Persoonlijke aansluiting

Prioriteiten:

1. Bekende pasvormproblemen.
2. Gebruik op hoofd- en tweede ondergrond.
3. Gebruiksbelasting en comfortvoorkeur.
4. Bewegingsstijl.
5. Secundaire voorkeuren zoals gewicht.

Begin met uitlegbare regels in plaats van willekeurige percentages. Voeg pas gewichten toe wanneer duidelijk is wat ze betekenen en hoe ze worden getoetst.

### Laag C — Zekerheid

Toon één van de volgende statussen:

- **Goede onderbouwing:** relevante kenmerken gecontroleerd en geen bekend conflict.
- **Voorwaardelijk advies:** bijvoorbeeld ondergrond passend, maar pasvorm of hulpmiddelcombinatie moet worden gecontroleerd.
- **Onvoldoende informatie:** geen betrouwbare productmatch mogelijk.

‘Goede onderbouwing’ is geen garantie op pasvorm.

Gebruik geen ‘97% match’ zolang dergelijke nauwkeurigheid niet met gebruikersuitkomsten is gevalideerd.

## 7. Productdatabase

| Veld | Inhoud / controle |
|---|---|
| product_id | Unieke identifier. |
| merk, model, uitvoering, versie | Exacte identificatie; geen gegevens van andere versies vermengen. |
| categorie | Veld of zaal. |
| ondergrond_water | Bevestigd / ongeschikt / onbekend, met bron. |
| ondergrond_zand | Bevestigd / ongeschikt / onbekend, met bron. |
| ondergrond_semiwater_hybride | Expliciete gegevens; niet afleiden zonder basis. |
| indoor_non_marking | Bevestigd / nee / onbekend. |
| pasvorm_voorvoet | Brongebonden beschrijving of testbevinding. |
| pasvorm_hiel | Brongebonden beschrijving of testbevinding. |
| pasvorm_wreef | Brongebonden beschrijving of testbevinding. |
| gewicht | Waarde, meetmaat, meetmethode en bron. |
| maten_en_breedtes | Beschikbare varianten en modelgebonden maattabel. |
| binnenzool_uitneembaar | Ja / nee / onbekend. |
| demping | Beschrijving met bron; geen ongefundeerd cijfer. |
| ondersteuning | Beschrijving met bron of testprotocol. |
| bescherming | Aanwezige verstevigingen, voor zover geverifieerd. |
| vochtbescherming | Exacte claim, zonder waterafstotend gelijk te stellen aan waterdicht. |
| slijtvastheid | Claim, testervaring of onbekend. |
| prijs_en_voorraad | Actueel per variant. |
| bron_type | Fabrikant / eigen test / overige bron / redactionele interpretatie. |
| bron_url_en_datum | Herleidbaarheid en controledatum. |
| bewijsbeperkingen | Wat niet is vastgesteld. |

Een fabrikantclaim over een allroundzool kan geschiktheid ondersteunen, maar rechtvaardigt niet automatisch een objectieve gripscore van 9/10. [B1][B2]

## 8. Resultaatpagina

Toon maximaal drie modellen, alleen als er daadwerkelijk geschikte kandidaten zijn:

1. Eerste pasadvies.
2. Alternatief met een relevant andere pasvorm of eigenschap.
3. Voordeliger alternatief dat eveneens aan de voorwaarden voldoet.

Forceer geen drie producten en toon geen schijnalternatieven.

### Vaste resultaatstructuur

- **Jouw profiel.** Vat ondergrond, gebruik, pasproblemen en voorkeuren kort samen.
- **Waarom dit model in jouw selectie staat.** Koppel concrete antwoorden aan gecontroleerde eigenschappen. Benoem of een eigenschap uit fabrikantgegevens of eigen test komt.
- **Wat je nog moet controleren.** Noem specifieke pascontroles: hielvastheid, ruimte bij de voorvoet, druk over de wreef of combinatie met eigen inlegzool.
- **Mogelijk minder geschikt wanneer.** Noem beperkingen en potentiële conflicten. Presenteer onbekende eigenschappen niet als sterke punten.
- **Basis en zekerheid van het advies.** Toon bronsoort, controledatum en adviesstatus.

### Voorbeeldcopy

> Je speelt vooral op waterveld en noemt een smalle hiel. Dit model is volgens de fabrikant geschikt voor waterveld. Controleer tijdens het passen of de hiel bij afremmen en op de voorvoet komen goed blijft zitten. De hielaansluiting voor jouw voet is online nog niet bevestigd.

Vermijd ongefundeerde claims zoals ‘de beste schoen voor aanvallers’, ‘voorkomt enkelblessures’ of ‘gegarandeerd perfecte pasvorm’.

## 9. Voorbeeldprofielen

### A — Aanvaller, waterveld, smalle hiel

- Drie keer per week.
- Veel starts en stops.
- Hiel komt in huidige schoenen omhoog.
- Voorkeur voor laag gewicht.

**Adviesprofiel:** bevestigde waterveldgeschiktheid en hielaansluiting eerst; gewicht pas daarna. Een lichte schoen met te ruime hiel is geen goede match.

### B — Verdediger, zandveld, brede voorvoet

- Twee keer per week.
- Veel zijwaarts verdedigen.
- Knelling bij de kleine teen.
- Duurzaamheid belangrijk.

**Adviesprofiel:** zandveldgeschiktheid, voldoende voorvoetruimte en aansluiting tijdens zijwaarts bewegen. Slijtvastheid meewegen wanneer onderbouwd. Niet automatisch een langere maat kiezen om breedte op te lossen.

### C — Middenvelder, wisselende ondergronden

- Vier keer per week.
- Veel loopmeters.
- Geen bekende pasproblemen.
- Langdurig comfort belangrijk.

**Adviesprofiel:** bevestigde geschiktheid voor beide ondergronden en comfort tijdens langer dragen. Een kleine gewichtsbesparing is geen automatisch doorslaggevend voordeel.

### D — Beginnend kind

- Eén training en één wedstrijd per week.
- Wisselende positie.
- Voetvorm en voorkeuren nog onbekend.

**Adviesprofiel:** passend basispaar voor de gebruikte ondergrond. Controleer teenruimte, hielvastheid en zijwaartse aansluiting. Geen onnodige positiespecialisatie of premium-upgrade.

Deze voorbeelden zijn illustraties van ontwerpregels, geen klinische of productgebonden bewijsclaims.

## 10. Pascontrole bij het advies

Laat de gebruiker passen met de daadwerkelijk gebruikte hockeysokken en eventuele eigen inlegzolen of brace.

Praktische checklist:

- Beide schoenen passen.
- Tenen kunnen ontspannen liggen.
- Geen aanhoudende knelling aan zijkanten of wreef.
- Hiel blijft goed aangesloten.
- Geen hinderlijk schuiven bij gecontroleerd afremmen.
- Geen hinderlijk zijwaarts verschuiven.
- Bewegingen alleen uitvoeren waar ruimte en ondergrond dit veilig toelaten.

Geef geen universele millimeterregel voor alle modellen en voeten. Laat voldoende ruimte samengaan met controle; laat de gebruiker bij twijfel deskundig passen.

## 11. Validatie en beheer

### Voor livegang

- Begin met een kleine catalogus met gecontroleerde gegevens.
- Leg vast wie productkenmerken beoordeelt en op welke wijze.
- Maak een vaste testprocedure voor pasvormbeschrijvingen.
- Documenteer de gebruikte schoenmaat bij gewichtsmetingen.
- Controleer dat onbekende waarden niet positief scoren.
- Laat adviesregels inhoudelijk beoordelen en met echte spelers testen.

### Na aanschaf

Vraag vrijwillig naar:

- Gekozen model en maat.
- Gebruikte ondergrond.
- Hielslip.
- Drukplekken.
- Comfort tijdens de gebruikelijke sessie.
- Ruilen of retourneren en reden.

Gebruik feedback om regels te verbeteren, maar behandel losse ervaringen niet als algemeen bewijs. Kijk ook naar spelers die het model niet kochten of terugstuurden om een te positief beeld te vermijden.

### Acceptatietests

1. Een veldspeler krijgt geen zaalschoen als oplossing voor buitengebruik.
2. Een zaalspeler krijgt geen veldschoen met noppen.
3. Een speler op twee ondergronden krijgt geen bevestigde allroundclaim wanneer één ondergrond onbekend is.
4. Een brede voorvoet en smalle hiel kunnen tegelijk worden verwerkt.
5. Alleen de positie veranderen geeft niet automatisch een andere selectie.
6. Een gewichtsvoorkeur compenseert geen duidelijk pasvormconflict.
7. Een kind wordt niet automatisch naar premiumproducten gestuurd.
8. Een blessureantwoord genereert geen diagnose of genezingsclaim.
9. Ontbrekende productgegevens verhogen de match niet.
10. Bij nul geschikte resultaten verschijnt een eerlijke melding in plaats van een ongeschikt verkoopadvies.
11. Zonder bevestigde maat/voorraad wordt geen directe beschikbaarheid beloofd.
12. Een keeper krijgt een aparte route of expliciete begrenzing.

## 12. Aanbevolen eerste versie

- Acht hoofdvragen met conditionele vervolgvragen.
- Ondergrond en pasvorm als belangrijkste inhoudelijke selectiecriteria.
- Positie optioneel; bewegingsstijl expliciet uitvragen.
- Eenvoudige route voor kinderen en beginners.
- Afzonderlijke route of begrenzing voor keepers en medische bijzonderheden.
- Maximaal drie onderbouwde pasadviezen.
- Geen onbewezen grip-, dempings- of matchpercentages.
- Transparante bronvermelding per productclaim.
- Gebruikersfeedback voor stapsgewijze verbetering.

De centrale ontwerpvraag luidt: welke schoeneigenschappen zijn voor deze speler noodzakelijk, welke zijn voorkeuren en welke moeten nog worden gecontroleerd?

## 13. Bronnen en bewijsgrenzen

De bronnen hieronder zijn gebruikt in het voorafgaande advies. Controleer de actuele pagina en exacte productversie voordat gegevens in de productiecatalogus worden overgenomen. Fabrikantbronnen zijn geen onafhankelijke vergelijkende prestatietests.

- **B1 — Grays: AeroCage XW10 Shoe**  
  https://www.grays-hockey.com/products/aerocage-xw10-shoe  
  Relevantie: fabrikant beschrijft een laagprofielzool met multidirectionele tractie voor water- en zandkunstgras. Dit ondersteunt dat één model voor beide ondergronden bedoeld kan zijn; niet dat het objectief beter is dan andere modellen.
- **B2 — Grays: Our Guide To The Best Grays Hockey Shoes**  
  https://www.grays-hockey.com/blogs/news/our-guide-to-the-best-grays-hockey-shoes  
  Relevantie: fabrikantbeschrijvingen van ondergrondgeschiktheid, zooltechnologie en materiaaleigenschappen. Marketingclaims moeten herkenbaar blijven als fabrikantclaims.
- **B3 — International Competition Kinematic Demands in Men’s Field Hockey**  
  https://revista-apunts.com/en/international-competition-kinematic-demands-in-mens-field-hockey/  
  Relevantie: verschillen in bewegingsbelasting tussen posities bij internationaal mannenhockey. Geen directe validatie van schoenadvies.
- **B4 — Positional and between quarter differences in physical demands of elite female field hockey**  
  https://pmc.ncbi.nlm.nih.gov/articles/PMC10771826/  
  Relevantie: positie- en periodegebonden fysieke belasting bij elitevrouwen. Niet zonder meer vertalen naar jeugd, recreanten of commerciële schoenmodellen.
- **B5 — The Physical and Physiological Match-Play Locomotor Activity …**  
  https://www.jssm.org/researchjssm-22-273.xml.xml  
  Relevantie: fysieke en fysiologische wedstrijdbelasting per positie bij elite mannenhockey. Onderbouwt differentiatie in gebruik, niet een specifieke schoenkeuze.

### Niet vastgesteld door deze bronnen

- Universeel beste noppenpatroon voor elk veldtype.
- Een gegarandeerd ideaal model per positie.
- Objectieve vergelijkende scores voor grip, demping of duurzaamheid van de hele markt.
- Blessurepreventie door een specifiek geadviseerd model.
- Validiteit van de voorgestelde vragenlijst of een exacte matchscore.
