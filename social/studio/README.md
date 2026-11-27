# Marketingstudio (was Social-studio)

De bron van de Marketingstudio, het ene dashboard van de eigenaar: https://claude.ai/artifact/WWvotNj8EKx9GCbapJtUe2. Ontwerp en fasen: [docs/marketing/bouwplan-2.0.md](../../docs/marketing/bouwplan-2.0.md), fase 2.

## Wat de pagina doet

Tabbladen bovenaan (sinds 2026-11-12, samengevoegd met Agent-orkest): **Vandaag** (dagcijfers, dagbericht en Vraag Noor, zie [dagbericht.md](../../docs/marketing/dagbericht.md); alle dagcijfers komen versleuteld binnen en openen met de sleutel van Verkoop, sinds 2026-11-14; het dagbericht schrijft Noor bij het eerste openen van de dag), **KPI** (sinds 2026-11-27, zie hieronder), **Verkoop** (per partner, versleuteld; zelfde document), **Conversie** (sinds 2026-11-24: de laatste 7 dagen tegen de 7 ervoor voor het zoeken in de header, de merkpagina's en de reekspagina's; het deel `conversie` van dezelfde versleutelde dagcijfers, geopend door het tabblad Vandaag, zie [dagbericht.md](../../docs/marketing/dagbericht.md)), **SEO** (sinds 2026-11-25: het maandelijkse SEO-kansenrapport uit Search Console voor Nederland, het deel `seo` van dezelfde versleutelde dagcijfers, zie [dagbericht.md](../../docs/marketing/dagbericht.md)), **Social** (goedkeuren, hieronder), en **Stack**, **Eén post**, **Week** en **Ritme** (elf tabbladen; de cijfertoetsen 1 tot en met 9 wisselen de eerste negen) (de agentstructuur, met Presenteer voor demo's). De CSS van Social staat met CSS nesting onder `#view-social`, zodat de weergaven elkaar niet raken.

KPI Performance (decision log 2026-11-27) is het managementoverzicht, met vijf onderdelen: Overzicht (vijf kaarten, groei tegen plan, analyse, stand van de data, targets), Traffic, Engagement, Conversie en Omzet.

- `kpi.js` is de ene plek met de definities en rekenregels (formule, bron, aannames, beperkingen); `kpi-tab.js` tekent. Test: `src/kpi/studioKpi.test.ts`.
- De cijfers komen uit het versleutelde deel `kpi` van de dagcijfers (via het tabblad Vandaag) en uit `maanden` van het verkoopbestand (via het tabblad Verkoop). De tab opent zelf niets.
- Targets staan alleen in de database van de studio, collectie `targets` (lezen admin, schrijven owner), nooit in deze openbare repo. Elke wijziging is een nieuw document; de nieuwste `vastgelegd` telt. Alleen de eigenaar wijzigt ze; agents niet.
- Groen vanaf 100% van het target tot nu, oranje 85 tot 99%, rood daaronder. Grijs bij ontbrekende of onvolledige cijfers, zonder target, bij verkoop onder 10 orders en bij een percentage over minder dan 30 gevallen.

Social:

- Bovenaan staat één statusregel: groen als alles loopt, oranje als iets wacht, met de knop die het oplost.
- Daaronder staan de komende 14 dagen als kaarten. Elke kaart heeft een voorbeeld en de knoppen Goedkeuren en Aanpassen; na goedkeuren staat op dezelfde plek Intrekken.
- Drie tabs: Te keuren (met Alles goedkeuren), Kalender (iets laten maken op een lege dag) en Cijfers.
- Goedkeuren schrijft alleen `metricoolAkkoord: {op, v: 2}` en start de Publiceerder ([publiceerder.md](../../docs/marketing/publiceerder.md)).
- Aanpassen wordt een opdracht `herschrijven` of `video_herschrijven` voor de Social-planner.
- De voorbeelden tekent de pagina zelf met `video/studio/slideart.js` en `videoart.js`, dezelfde code als de workflow `social-render.yml`. Een artifact mag geen beelden van GitHub laden.
- Wat al in Metricool staat, leest de pagina zelf via de Metricool-koppeling van de eigenaar, alleen lezen (getScheduledPosts).
- Tab Reacties: likes en reacties per post uit Metricool (getAnalyticsDataByMetrics, alleen lezen), met per post een knop naar de app van het kanaal en een knop Gedaan (`reacties/afgehandeld`). De geplande taak Reactie-wachter stuurt bij nieuwe reacties een pushmelding en houdt `reacties/stand` bij (decision log 2026-11-13).

## Publiceren (een claude.ai- of Claude Code-sessie)

Publiceer met de Artifact-tool naar de bestaande url, met:

- `file_path`: `social/studio/index.html`;
- `url`: `https://claude.ai/artifact/WWvotNj8EKx9GCbapJtUe2`;
- `files`: `{"slideart.js": "video/studio/slideart.js", "videoart.js": "video/studio/videoart.js", "kpi.js": "social/studio/kpi.js", "kpi-tab.js": "social/studio/kpi-tab.js"}` (alleen de bestanden die veranderd zijn; weglaten houdt de gepubliceerde versie);
- de bestaande capabilities. Laat je `capabilities` weg, dan blijven ze staan. Geef je ze opnieuw, dan in deze vorm: de `db`-regels van de collecties (`commands`, `posts`, `videos`, `plan`, `markt`, `state`, `community` en `accounts`: lezen view, schrijven owner; `feedback`: alleen owner; `dagbericht`, `ideeen`, `verkoop` en `targets`: lezen admin, schrijven owner; `reacties`: lezen en schrijven owner), `user`, `sample` (Vraag Noor), en `mcp` met `Claude Code Remote` (`fire_trigger`) en `Metricool Social Media Management` (`getScheduledPosts`, `getAnalyticsDataByMetrics`).
