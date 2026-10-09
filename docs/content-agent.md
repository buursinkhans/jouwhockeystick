# Content-agent — handboek

Dit handboek geldt voor iedereen die content schrijft voor jouwhockeystick.nl: de content-agent in GitHub (`@claude`), Claude in een sessie en de redactie zelf. Het komt bovenop `CLAUDE.md` en `source-policy.md`; bij twijfel gaan die voor.

## 1. Hoe een opdracht binnenkomt

Een opdracht is een GitHub-issue met het label `content-brief` (sjabloon: *Content-brief*). Daarin staan:

- **Onderwerp en hoofdvraag**: de vraag die de lezer stelt, in zijn eigen woorden.
- **Soort**: `kennis` (blijvende uitleg, `/kennis/…`) of `blog` (actueel of verhalend, `/blog/…`).
- **Doelgroep**: bijvoorbeeld ouders van een jeugdspeler, of een volwassen beginner.
- **Eventueel**: bronnen, zoekwoorden uit het Search Console-rapport, wat er zeker niet in moet.

De agent werkt de brief uit in één pull request en reageert in het issue met een samenvatting. Feedback komt als `@claude …` in de PR; de agent past de PR daarop aan. **De agent merget nooit zelf.**

## 2. Eerst controleren, dan schrijven

1. **Botst het onderwerp met een bestaande pagina?** Lees de titels en intro's van alle pagina's in `src/content/articles/`, `src/content/blogPosts/`, `src/content/zaal.ts` en de rolverdeling in `docs/decision-log.md` (2026-10-08, SEO-verbeteringen). Beantwoordt een bestaande pagina dezelfde hoofdvraag, schrijf dan geen nieuwe pagina, maar stel in het issue een uitbreiding van die pagina voor.
2. **Welke feiten zijn nodig, en waar komen ze vandaan?** Alleen uit bronnen die `source-policy.md` §2 toestaat. Productgegevens komen altijd uit de catalogus (`src/catalog`), nooit uit eigen tekst.
3. **Kun je de hoofdvraag eerlijk beantwoorden met wat we hebben?** Zo niet: zeg dat in het issue en stop.

## 3. Regels voor de tekst

- **Hoofdvraag beantwoord in de intro, binnen 80 woorden**, in eigen bewoordingen.
- **Eén H1 (de titel), daaronder H2/H3.** Kopjes zijn vragen of duidelijke onderwerpen.
- **Toon:** helder, persoonlijk, eerlijk, deskundig. Je spreekt de lezer aan met "je". Korte zinnen, geen jargon zonder uitleg.
- **Genuanceerd:** "kan passen bij", "is een logische richting voor". Nooit "de beste", "gegarandeerd", "bewezen". Geen eigen testresultaten; wij testen niet zelf.
- **Elke feitelijke claim heeft een bron.** Spelregels: FIH-regelboeken (zie `ZAAL_SOURCES` in `src/content/zaal.ts`). Merkclaims: de merksite. Is het onze eigen vertaling naar advies, zeg dat dan ("onze redactionele inschatting").
- **Geen prijzen, lengtes, carbonpercentages of beschikbaarheid in vaste tekst.** Genereer ze uit de catalogus, zoals `src/content/articles/hockeystick-kinderen-en-beginners.ts` doet (`getFieldProducts`, `getIndoorProducts`, `stickListItem`, `formatEuro`). Zo blijven artikelen kloppen als de catalogus verandert.
- **Geen kortingsclaims** (EU Omnibus) en geen "review" in titels.
- **bol.com is de enige winkel.** Andere winkels alleen als bron, en dan staan ze op de `nofollow`-lijst in `src/content/linkPolicy.ts`.
- **Interne links:** minimaal één naar de stickwijzer (verplicht, test), en naar de verwante pagina's. Alleen naar pagina's die bestaan (test).

## 4. Technisch

- Een artikel is een `Article` (`src/content/types.ts`) in een eigen bestand: `src/content/articles/<slug>.ts` of `src/content/blogPosts/<slug>.ts`.
- Voeg het toe aan de lijst in `src/content/index.ts` (kennis) of `src/content/blog.ts` (blog). De sitemap en de overzichtspagina's volgen vanzelf.
- `author`: `Redactie jouwhockeystick.nl`. `publishedAt` en `updatedAt`: de datum van vandaag.
- Elke externe link in de tekst staat ook in `sources` (test).
- `metaDescription`: uniek, inhoudelijk, maximaal 158 tekens.
- Raakt het artikel een bestaande pagina (bijv. een link of correctie), houd die wijziging klein.
- Voeg een korte regel toe aan `docs/decision-log.md`: wat, waarom dit onderwerp, en wat bewust niet.

## 5. Controle vóór de PR

Draai `npm run lint`, `npx next typegen`, `npm run typecheck` en `npm test`. Lees de tekst daarna nog één keer als ouder of speler: is de hoofdvraag beantwoord, staat er niets in wat we niet kunnen onderbouwen?

In de PR-beschrijving staan: de hoofdvraag, welke pagina's je op botsing hebt gecontroleerd, de bronnen, en wat je bewust hebt weggelaten.
