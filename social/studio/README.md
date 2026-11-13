# Marketingstudio (was Social-studio)

De bron van de Marketingstudio, het ene dashboard van de eigenaar: https://claude.ai/artifact/WWvotNj8EKx9GCbapJtUe2. Ontwerp en fasen: [docs/marketing/bouwplan-2.0.md](../../docs/marketing/bouwplan-2.0.md), fase 2.

## Wat de pagina doet

Tabbladen bovenaan (sinds 2026-11-12, samengevoegd met Agent-orkest): **Vandaag** (dagcijfers, dagbericht en Vraag Noor, zie [dagbericht.md](../../docs/marketing/dagbericht.md)), **Verkoop** (per partner, versleuteld; zelfde document), **Social** (goedkeuren, hieronder), en **Stack**, **Eén post**, **Week** en **Ritme** (de agentstructuur, met Presenteer voor demo's). De CSS van Social staat met CSS nesting onder `#view-social`, zodat de weergaven elkaar niet raken.

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
- `files`: `{"slideart.js": "video/studio/slideart.js", "videoart.js": "video/studio/videoart.js"}` (alleen als die bestanden veranderd zijn; weglaten houdt de gepubliceerde versie);
- de bestaande capabilities. Laat je `capabilities` weg, dan blijven ze staan. Geef je ze opnieuw, dan in deze vorm: de `db`-regels van de collecties (`commands`, `posts`, `videos`, `plan`, `markt`, `state`, `community` en `accounts`: lezen view, schrijven owner; `feedback`: alleen owner; `dagbericht`, `ideeen` en `verkoop`: lezen admin, schrijven owner; `reacties`: lezen en schrijven owner), `user`, `sample` (Vraag Noor), en `mcp` met `Claude Code Remote` (`fire_trigger`) en `Metricool Social Media Management` (`getScheduledPosts`, `getAnalyticsDataByMetrics`).
