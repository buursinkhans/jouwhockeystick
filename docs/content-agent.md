# Content-agent — handboek

Dit handboek geldt voor iedereen die content schrijft voor jouwhockeystick.nl: de content-agent in GitHub (`@claude`), Claude in een sessie en de redactie zelf. Het komt bovenop `CLAUDE.md` en `docs/source-policy.md`; bij twijfel gaan die voor.

## 1. Hoe een opdracht binnenkomt

Een opdracht is een GitHub-issue met het label `content-brief` (sjabloon: _Content-brief_). Daarin staan:

- **Onderwerp en hoofdvraag**: de vraag die de lezer stelt, in zijn eigen woorden.
- **Soort**: `kennis` (blijvende uitleg, `/kennis/…`) of `blog` (actueel of verhalend, `/blog/…`).
- **Doelgroep**: bijvoorbeeld ouders van een jeugdspeler, of een volwassen beginner.
- **Publicatiedatum** (optioneel): de dag waarop de pagina live moet. Leeg = direct na de merge.
- **Eventueel**: bronnen, zoekwoorden uit het Search Console-rapport, wat er zeker niet in moet.

De agent werkt de brief uit in één pull request en reageert in het issue met een samenvatting. Feedback komt als `@claude …` in de PR; de agent past de PR daarop aan. **De agent merget nooit zelf.**

## 2. Eerst controleren, dan schrijven

1. **Botst het onderwerp met een bestaande pagina?** Lees de titels en intro's van alle pagina's in `src/content/articles/`, `src/content/blogPosts/`, `src/content/zaal.ts` en de rolverdeling in `docs/decision-log.md` (2026-10-08, SEO-verbeteringen). Beantwoordt een bestaande pagina dezelfde hoofdvraag, schrijf dan geen nieuwe pagina, maar stel in het issue een uitbreiding van die pagina voor.
2. **Welke feiten zijn nodig, en waar komen ze vandaan?** Alleen uit bronnen die `docs/source-policy.md` §2 toestaat. Productgegevens komen altijd uit de catalogus (`src/catalog`), nooit uit eigen tekst.
3. **Kun je de hoofdvraag eerlijk beantwoorden met wat we hebben?** Zo niet: zeg dat in het issue en stop.

## 3. Regels voor de tekst

- **Hoofdvraag beantwoord in de intro, binnen 80 woorden**, in eigen bewoordingen.
- **Eén H1 (de titel), daaronder H2/H3.** Kopjes zijn vragen of duidelijke onderwerpen.
- **Toon: vriendelijk, persoonlijk en sprankelend.** Schrijf zoals een enthousiaste hockeyvriend die er verstand van heeft, niet als een rapport. Spreek de lezer aan met "je". Korte zinnen, af en toe een vraag of een uitroep ("Op naar de zaal!"), gewone hockeytaal (sleeppush, aanname) en geen jargon zonder uitleg. Warm en enthousiast, maar niet overdreven: geen superlatieven over producten.
  - Wel: "Een stick die nu te lang is, maakt oefenen juist moeilijker, en daar gaat het plezier van af."
  - Niet: "Ons advies is om de huidige hanteerbaarheid zwaarder te laten wegen."
  - Vermijd zakelijke formuleringen als "redactionele inschatting", "doorgaans", "de geraadpleegde passages". Zeg het gewoon: "onze tip", "meestal", "voor zover bekend".
- **Genuanceerd, ook als het luchtig is:** "kan mooi passen bij", "een fijn startpunt", "een logische keuze". Nooit "de beste", "gegarandeerd", "bewezen". Geen eigen testresultaten; wij testen niet zelf (zeg dat gewoon, bijvoorbeeld in een korte notitie onderaan).
- **Elke feitelijke claim is onderbouwd, maar de bron staat onderaan, niet in de tekst.** Zet bronnen alleen in `sources`; die verschijnen als lijst onder het artikel.
  - Niet in de tekst: "[Bron: …]"-links, "volgens Intersport …", "in openbare bronnen staat …", "een hockeywinkel noemt …".
  - Verwerk de onderbouwing subtiel. Spelregels stel je gewoon vast ("de kromming mag maximaal 25 mm zijn"); de FIH-regelboeken staan in `sources` (zie `ZAAL_SOURCES` in `src/content/zaal.ts`). Een merk mag je noemen als het over zijn eigen product gaat ("Grays maakt de GX1000 om de basis van hockey mee te leren").
  - Is het onze eigen vertaling naar advies, maak dat dan vriendelijk duidelijk ("onze tip", "wij zouden …"), en noem het in `sources` als redactioneel uitgangspunt.
  - Is iets onzeker, zeg dat eerlijk en kort ("zeker weten doen we het niet") in plaats van de bron te citeren.
- **Geen prijzen, lengtes, carbonpercentages of beschikbaarheid in vaste tekst.** Genereer ze uit de catalogus, zoals `src/content/articles/hockeystick-kinderen-en-beginners.ts` doet (`getFieldProducts`, `getIndoorProducts`, `stickListItem`, `formatEuro`). Zo blijven artikelen kloppen als de catalogus verandert.
- **Schrijf "aerial/scoopen"**, niet alleen "aerial": veel spelers kennen de techniek als scoopen.
- **Schrijf "sleeppush"**, niet "dragflick" (behalve in een letterlijk citaat van een merk of winkel).
- **Geen kortingsclaims** (EU Omnibus) en geen "review" in titels.
- **Onze partnerwinkels zijn bol.com en PassaHockey** (de hockeywinkel van PassaSports). Hun koopknoppen komen uit de catalogus, niet uit de tekst. Andere winkels alleen als bron, en dan staan ze op de `nofollow`-lijst in `src/content/linkPolicy.ts`.
- **Interne links:** minimaal één naar de stickwijzer (verplicht, test), en naar de verwante pagina's. Alleen naar pagina's die bestaan (test).

## 4. Technisch

- Een artikel is een `Article` (`src/content/types.ts`) in een eigen bestand: `src/content/articles/<slug>.ts` of `src/content/blogPosts/<slug>.ts`.
- Voeg het toe aan de lijst in `src/content/index.ts` (kennis) of `src/content/blog.ts` (blog). De sitemap en de overzichtspagina's volgen vanzelf.
- `author`: `Redactie jouwhockeystick.nl`.
- `publishedAt`: de **publicatiedatum** uit de brief (`YYYY-MM-DD`); staat er geen, dan de datum van vandaag. `updatedAt`: gelijk aan `publishedAt`. Ligt de datum in de toekomst, dan is de pagina tot die dag onzichtbaar op de live site (niet in overzichten, sitemap of `llms.txt`) en alleen in de Netlify-preview te zien, met een melding "Gepland voor …". Op de publicatiedatum bouwt de workflow _Geplande publicatie_ de site 's ochtends opnieuw (`src/content/schedule.ts`). Noem de datum in de PR-titel: `Content: <onderwerp> (#<issue>, live <datum>)`.
- Link alleen naar pagina's die uiterlijk op jouw publicatiedatum live staan (test). Een geplande pagina mag dus naar live pagina's linken, maar een live pagina niet naar een geplande (zet die link pas na de publicatiedatum).
- Vraagt de eigenaar in de PR om een andere datum (`@claude zet de publicatiedatum op …`), pas dan alleen `publishedAt` en `updatedAt` aan.
- Er staan geen externe links in de tekst (geen `[…](https://…)`, geen "[Bron:"); bronnen staan alleen in `sources`, en elk artikel heeft er minstens één (test). Interne links naar eigen pagina's mogen en moeten wel.
- `metaDescription`: uniek, inhoudelijk, maximaal 158 tekens.
- Raakt het artikel een bestaande pagina (bijv. een link of correctie), houd die wijziging klein.
- Voeg een korte regel toe aan `docs/decision-log.md`: wat, waarom dit onderwerp, en wat bewust niet.

## 5. Controle vóór de PR

Draai `npm run lint`, `npx next typegen`, `npm run typecheck` en `npm test`. Lees de tekst daarna nog één keer als ouder of speler: is de hoofdvraag beantwoord, staat er niets in wat we niet kunnen onderbouwen?

Open de PR zelf met `gh pr create --base main` (titel `Content: <onderwerp> (#<issue>)`, met `Closes #<issue>` in de beschrijving). In de PR-beschrijving staan: de hoofdvraag, welke pagina's je op botsing hebt gecontroleerd, de bronnen, en wat je bewust hebt weggelaten.
