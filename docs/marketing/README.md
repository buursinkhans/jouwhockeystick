# Marketingmachine

De marketingmachine van jouwhockeystick.nl: wat er al is, wat getest is, hoe de onderdelen samenwerken en wat nog moet gebeuren. Doel: groei in organisch verkeer, zichtbaarheid in AI-zoekmachines en relevant bereik op social media, met hooguit 15 tot 20 minuten regie van de eigenaar per week. Dat laatste is een ontwerpdoel, geen belofte.

Uitgangspunten: bestaande systemen eerst, geen tweede planner of database, niets publiceren zonder goedkeuring, en alleen bouwen op toegang die bewezen is. De merkstem en de redactiecontrole staan in [merkstem.md](merkstem.md), de eerste pilot in [pilot-zaalhockey.md](pilot-zaalhockey.md).

## 1. Inventarisatie (stand 2026-11-09)

| Onderdeel | Status | Toelichting |
|---|---|---|
| Social-studio (claude.ai-artifact met database) | Bewezen werkend | Collecties `posts`, `videos`, `plan`, `state`, `community`, `markt`. Lezen en schrijven met de ArtifactData-tool, met versienummers die gelijktijdig overschrijven voorkomen. 16 posts en 16 video's. |
| Social-planner (geplande taak, vrijdag 08:57) | Aanwezig, uitgeschakeld | Draaide 12 tot 30 oktober en vulde de planning. Staat sinds begin november uit, net als de Video-publicatie en de community-agent. |
| Plaatsen | Knelpunt | Sinds 24 oktober is niets meer geplaatst: 11 posts en 14 video's staan op "concept". Maken loopt; inplannen met de hand is de flessenhals. |
| Metricool-MCP lokaal (Claude Code) | Bewezen werkend | Inloggen, kanalen, geplande posts, concept aanmaken (`draft: true`, `autoPublish: false`), statistiekvelden. |
| Metricool vanuit de cloud (claude.ai-connector) | Bewezen werkend | Proefroutine van 2026-11-09 las `getBrandSettings` zonder laptop. |
| Kanalen in Metricool | Bewezen | Instagram, Facebook, YouTube en TikTok. |
| Metricool-statistieken | Aanwezig, nog leeg | Verzamelen begon op 2026-11-09; gratis plan bewaart 30 dagen. |
| Social-studio vanuit een cloudroutine | Bewezen werkend | Met de routinetags `cowork-remote` en `product:cowork-remote` is de ArtifactData-tool er (tweede proefrun, 2026-11-09). Zonder die tags niet. Zie §3. |
| GitHub vanuit de cloud | Technisch beperkt | `gh api` geeft 403 zonder gekoppelde repo; `git clone` werkt, want de repo is openbaar. |
| PostHog | Bewezen werkend | Cookieloos. Wekelijks Conversie-rapport (issue met label `conversie`) met bron per bezoek, ook AI-assistenten (`AI_REFERRER_DOMAINS`). |
| Google Search Console | Bewezen werkend | Wekelijks rapport (issue met label `search-console`, workflow `search-console.yml`). |
| Videopijplijn (Remotion, YouTube na label `publiceren`) | Aanwezig | Blijft voor de 16:9-video's; Shorts kunnen via Metricool. |
| E-mail | Ontbreekt | Geen nieuwsbrief en geen opt-in. Latere fase (§8). |
| Schrijfregels | Bewezen | `docs/schrijfstijl.md`, `docs/instagram.md`, `docs/video.md`. |

## 2. Taakverdeling

| Onderdeel | Verantwoordelijk voor |
|---|---|
| Social-studio | Planning, concepten, beelden in huisstijl, goedkeuring door de eigenaar |
| Social-planner (cloud) | Planning vullen, redactiecontrole, goedgekeurde items als concept naar Metricool, status en cijfers terug |
| Metricool | Inplannen, publiceren, statistieken per kanaal en per post |
| PostHog | Websitebezoek per bron, campagne en post; gebruik van keuzehulpen; kliks naar winkels |
| Search Console | Organische zoekprestaties |
| GitHub | Code, regels (`src/marketing/`), rapporten als issues |

Er komt geen nieuwe database. In de studio staat per item alleen wat de koppeling nodig heeft: status en per kanaal het Metricool-ID. Cijfers blijven in Metricool, PostHog en Search Console; het weekrapport haalt ze daar op.

## 3. Cloudvalidatie

Getest op 2026-11-09 met een eenmalige routine die alleen leest (`Cloudvalidatie marketingmachine`):

| Test | Uitkomst |
|---|---|
| Metricool lezen vanuit de cloud | OK: alle vier de kanalen |
| Social-studio lezen vanuit een nieuwe routine | FOUT: ArtifactData-tool niet beschikbaar |
| Repo lezen met `gh api` | FOUT: 403; `git clone` werkt wel |

Tweede proefrun (2026-11-09, alleen lezen), met de tags van de Social-planner (`cowork-remote`, `product:cowork-remote`): de studio lezen met ArtifactData, de repo klonen en Metricool lezen werkten in één run. De hele kring kan dus zonder laptop draaien.

De opdracht van de Social-planner staat sinds 2026-11-09 in de repo: [social-planner.md](social-planner.md). De routine leest dat bestand van `main`.

## 4. Van studio naar Metricool

**Goedkeuren is online gaan** (besluit eigenaar 2026-11-09). Klikt de eigenaar in de studio op Goedkeuren, dan maakt de pagina de beelden (PNG) en video's (MP4) in de browser en zet ze in de gedeelde Drive-map `jouwhockeystick-social` (iedereen met de link kan lezen). De links komen in het item (`metricoolAkkoord.media`) en de pagina start de Social-planner. Die zet het item per kanaal in Metricool op de geplande dag en tijd, met automatisch publiceren aan (`autoPublish: true`, `draft: false`). Intrekken kan tot het moment van plaatsen: de planner zet de post in Metricool dan terug op concept. Een goedgekeurd item kun je in de studio niet herschrijven of verzetten; eerst intrekken. De precieze stappen staan in [social-planner.md](social-planner.md), STAP 5.

**Statussen** (`src/marketing/content.ts`): concept → goedgekeurd → naar-metricool → ingepland → geplaatst, plus afgewezen en onzeker. `concept-in-metricool` is een ingetrokken post.

- **concept:** door de planner gemaakt en door de redactiecontrole gekomen (`npm run marketing:check`).
- **goedgekeurd:** alleen de eigenaar zet dit, in de studio.
- **naar-metricool:** de planner zet dit vóórdat hij Metricool aanroept.
- **ingepland:** Metricool gaf een ID; dat staat per kanaal in het item (`metricoolPosts`). De post gaat op het moment zelf online.
- **concept-in-metricool:** de eigenaar trok de goedkeuring in; de post staat in Metricool als concept en publiceert niets.
- **geplaatst:** de planner ziet de post in de statistieken van Metricool.
- **onzeker:** een overdracht is gestart maar er is geen ID en geen bericht gevonden. Een mens kijkt in Metricool; er wordt niets opnieuw aangemaakt.

**Nooit dubbel** (`src/marketing/metricoolSync.ts`, getest):
1. Een opgeslagen Metricool-ID betekent klaar.
2. Vóór elke aanmaak leest de planner de geplande posts rond de datum. Een post op dezelfde dag, hetzelfde netwerk en met hetzelfde begin van de tekst is dit item: koppelen, niet aanmaken. Zo vangt hij een aanroep op die wel lukte maar waarvan het antwoord niet aankwam.
3. Een item op "naar-metricool" zonder ID en zonder gevonden post wordt "onzeker". Een ontbrekend ID leidt nooit vanzelf tot een tweede post.
4. De Metricool-MCP kan niets verwijderen en een wijziging overschrijft direct. De planner wijzigt alleen posts die hij zelf voor een studio-item aanmaakte, en alleen om ze bij intrekken op concept te zetten of na opnieuw goedkeuren terug te zetten.

**Beperkingen van het gratis plan:** hooguit 20 ingeplande posts per maand en 30 dagen statistieken. Goedkeuren met reviewers (`createScheduledPostForReview`) vraagt een plan met teambeheer; de route hierboven werkt zonder. Of één post op Instagram en Facebook als één of twee telt, meten we bij de eerste maand. Een betaald plan alleen na overleg.

## 5. Meten

**UTM-standaard** (`src/marketing/utm.ts`): `utm_source` = kanaal (instagram, facebook, youtube, tiktok), `utm_medium` = `social` (zoals de studio al doet en het Conversie-rapport leest), `utm_campaign` = campagne (`zaalhockey-2026`, `pulse-2026`), `utm_content` = content-ID (`20261121-zaalstick-kiezen`).

Bereik, volgers, opgeslagen, gedeeld en kijkduur komen uit Metricool; bezoek en gedrag op de site uit PostHog. We kopiëren geen Metricool-data naar PostHog. Let op: links in onderschriften zijn niet klikbaar en in-app browsers geven niet altijd een referrer mee, dus een deel van het social verkeer telt als direct.

## 6. GEO-meting

Een vaste set van tien vragen, eens per maand met de hand in ChatGPT, Perplexity en Google (AI Overviews), vastgelegd als issue met label `geo`. Per controle: vraag, platform, datum, of jouwhockeystick.nl genoemd wordt, de geciteerde URL, de andere bronnen en of de weergave klopt. Het is een steekproef, geen marktaandeel. AI-verkeer zelf meet het Conversie-rapport al.

1. Welke lengte hockeystick heeft mijn kind nodig?
2. Wat is het verschil tussen een zaalstick en een veldstick?
3. Kun je met een veldstick zaalhockeyen?
4. Hoeveel carbon moet een hockeystick hebben?
5. Low bow of mid bow, wat is het verschil?
6. Welke hockeystick past bij een beginner?
7. Welke zaalhockeystick voor een kind?
8. Wat kost een goede zaalhockeystick?
9. Waar koop je een hockeystick?
10. Welke hockeyschoenen voor de zaal?

## 7. Weekrapport

Eén issue per week (label `marketing`), maandag, na de bestaande rapporten. De orchestrator leest ze al; het weekrapport wordt een extra sectie in zijn weekplanning, geen vijfde rapport. Inhoud: SEO (uit het Search Console-rapport), GEO (AI-verkeer en de laatste maandmeting), social (Metricool: bereik, nieuwe volgers, beste post per kanaal), website (PostHog: bezoek, keuzehulpen, vergelijker, winkelkliks) en een samenvatting met drie inzichten, drie acties en hooguit één beslissing. Ontbrekende data staat er als ontbrekend in. Bouwen in fase 2, na de proef in §3.

## 8. Fasen en kosten

| Prioriteit | Onderdeel | Status |
|---|---|---|
| P0 | Planner = Social-studio, statussen en dubbel-preventie | Ontwerp en logica klaar (deze PR) |
| P0 | Redactiecontrole en merkstem | Klaar (deze PR) |
| P0 | UTM-standaard | Klaar (deze PR) |
| P0 | Cloud: planner met Metricool-connector | Proefrun nodig (§3) |
| P1 | Social-planner: redactiecontrole en status uit Metricool terug in de studio | Klaar ([social-planner.md](social-planner.md)) |
| P1 | Goedgekeurde items automatisch online via Metricool | Gebouwd: goedkeurknop in de studio, beelden via Google Drive, STAP 5 in de planner. Eerste echte post bewijst de keten |
| P1 | Weekrapport en GEO-meting | Fase 2 |
| P2 | E-mail met expliciete opt-in, video op schaal, campagne-orkestratie | Later; geen leverancier gekozen |

Kosten nu: geen nieuwe. Metricool gratis plan, PostHog en Search Console zoals nu, routines binnen het bestaande Claude-abonnement.

## 9. Wat nodig is om de eerste cyclus te starten

1. De eigenaar keurt de pilot goed of wijzigt hem (`pilot-zaalhockey.md`).
2. Een run van de Social-planner die alleen leest, met de Metricool-connector, bewijst dat studio en Metricool in één cloudrun werken.
3. De prompt van de Social-planner krijgt de stappen uit §4 en `npm run marketing:check`.
4. De eigenaar zet de Social-planner weer aan.
5. Elke week: in de studio goedkeuren (ongeveer 10 minuten, plus de tijd dat de pagina de video's maakt). Daarna gaat alles vanzelf online.
