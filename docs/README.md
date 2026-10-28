# Documentatie — jouwhockeystick.nl

Alle afspraken en handboeken op één plek. Begin bij `CLAUDE.md` in de root: daar staan de regels die altijd gelden. Dit overzicht vertelt waar de rest staat.

## Fundament

| Document | Waarvoor |
|---|---|
| [`spec/keuzehulp-instructie-v1.1.md`](spec/keuzehulp-instructie-v1.1.md) | De specificatie van de stickwijzer: routes, vragen, adviesregels en bronnen. **Leidend**; afwijkingen leggen we vast in de decision log. |
| [`spec/prijsvergelijking.md`](spec/prijsvergelijking.md) | Prijsvergelijking per stick: spelregels, gegevensmodel, koppelen tussen winkels en de architectuurkeuze. Besloten 2026-10-26, nog niet gebouwd. |
| [`source-policy.md`](source-policy.md) | Bronbeleid: hoe we claims onderbouwen, bronnen vermelden en de catalogus elk kwartaal controleren. Bindend voor content, productdata en advies. |
| [`merkinstructie.md`](merkinstructie.md) | Logo, kleuren, typografie en tone of voice. `scripts/build-brand-assets.mjs` bouwt de logobestanden hieruit. |
| [`business-model.md`](business-model.md) | Verdienmodel en strategie. De actuele situatie staat in sectie 5; de partnerprogramma's per winkel in sectie 5a; hockeyschoenen in sectie 5b. |
| [`decision-log.md`](decision-log.md) | Elke wijziging aan adviesregels, catalogus of afspraken, met de reden. Nieuwste onderaan. |

## Handboeken per agent of taak

| Handboek | Wie of wat | Wanneer |
|---|---|---|
| [`content-agent.md`](content-agent.md) | Artikelen en blogs schrijven: toon, opbouw, bronnen | Bij elke contentopdracht (issue met label `content-brief`) |
| [`review-agent.md`](review-agent.md) | Tweede paar ogen bij pull requests over content of catalogus | Bij elke PR die `src/content/` of `src/catalog/` raakt |
| [`catalogus-aanvuller.md`](catalogus-aanvuller.md) | Populaire sticks toevoegen die nog niet in de catalogus staan | Wekelijks (dinsdag) |
| [`catalogus-verrijker.md`](catalogus-verrijker.md) | De 20 populairste geïmporteerde PassaHockey-sticks verrijken en vrijgeven voor Google | Wekelijks (donderdag) |
| [`catalogus-hercontroleur.md`](catalogus-hercontroleur.md) | Productdata elk kwartaal opnieuw controleren | Wekelijks, voor de sticks die aan de beurt zijn |
| [`orchestrator.md`](orchestrator.md) | Leest alle rapporten en zet het beste werk uit | Wekelijks (maandag) |
| [`instagram.md`](instagram.md) | Instagram-posts voorstellen in de huisstijl | Via de Instagram-studio |
| [`instagram-community.md`](instagram-community.md) | Volgers en clubs zoeken voor @jouwhockeystick (alleen voorstellen) | Via de Instagram-studio |
| [`club-outreach.md`](club-outreach.md) | Clubs helpen aan stickmateriaal voor nieuwe leden (nu op pauze) | Op verzoek |
| [`video.md`](video.md) | Uitlegvideo's maken in code (Remotion, map `video/`) | Issue met label `video-brief` |

## Rapporten zonder eigen handboek

Deze workflows lezen alleen en maken een rapport, meestal als issue. De orchestrator leest ze mee.

| Workflow | Wat het doet |
|---|---|
| `search-console.yml` | Kansen per zoekopdracht uit Google Search Console |
| `security.yml` | Maandag: beveiliging van de live site, kwetsbaarheden en nieuwere versies van pakketten, sleutels in de code; opent een PR met veilige updates (zie [`beveiliging.md`](beveiliging.md)) |
| `indexnow.yml` | Na elke deploy: meldt nieuwe en gewijzigde pagina's uit de sitemap bij Bing en andere IndexNow-zoekmachines. Met de hand: GitHub → Actions → *IndexNow* → *Run workflow*, kies `all` voor de hele sitemap of `changed` voor de laatste commit |
| `technical-seo.yml` | Crawlt de live sitemap op technische SEO-problemen, en controleert of AI-crawlers (OAI-SearchBot, GPTBot, PerplexityBot, ClaudeBot) en Bingbot de site kunnen lezen |
| `sales-report.yml` | Kliks en bestellingen per plek en per stick bij bol.com en PassaHockey (alleen aantallen, want de repo is openbaar) |
| `conversion-report.yml` | Stickwijzer-trechter, afhaken per vraag, winkelkliks en bezoekers uit AI-assistenten per pagina (PostHog) |
| `marktverkenning.yml` | Nieuwe hockeypagina's bij concurrenten |
| `passa-sync.yml` | Woensdag: importeert de PassaHockey-productfeed opnieuw (prijzen, voorraad, nieuwe en verdwenen sticks) en opent een PR |
| `instagram-token.yml` | Elke maand: ververst het Instagram-token in Netlify en start een nieuwe deploy |
| `catalog-health.yml` | Welke sticks aan hun kwartaalcontrole toe zijn |
| `bol-feed-check.yml` | Testrun: zoekt elke stick op in de bol.com-feed |
| `plutosport-feed.yml` | Met de hand: leest de Plutosport-feed (Awin), koppelt de hockeysticks aan de catalogus en meet de overlap tussen de winkels (fase 0 van `spec/prijsvergelijking.md`) |
| `publicatie.yml` | Bouwt de site opnieuw op de dag dat een gepland artikel live gaat |
| `ci.yml` | Lint, typecheck, tests en build bij elke pull request |

## Overig

- [`archief/`](archief/): documenten die niet meer gelden maar bewaard blijven, zoals de pitch voor een lokale winkelpartner.
- `video/teksten/`: uploadteksten per video.
- `.github/ISSUE_TEMPLATE/`: sjablonen voor content- en videobriefs.
