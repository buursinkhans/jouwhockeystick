# Beveiligingscontrole

Elke maandag om 05:29 UTC (vóór de Orchestrator) controleert de workflow `security.yml` de site en de software eronder. Je kunt hem ook zelf starten: GitHub → Actions → *Beveiliging* → *Run workflow*.

## Wat hij controleert

| Onderdeel | Hoe | Wanneer is het fout |
|---|---|---|
| Live site | Haalt https://jouwhockeystick.nl op | Een beveiligingsheader ontbreekt (HSTS, nosniff, frame-regel, Referrer-Policy, Permissions-Policy), `X-Powered-By` staat aan, http of www stuurt niet door, het certificaat is minder dan 14 dagen geldig |
| Kwetsbaarheden | `npm audit` | Een bekende kwetsbaarheid in een pakket. Het rapport scheidt wat live draait van de ontwikkeltools |
| Nieuwere versies | `npm outdated` | Ingedeeld in patch, minor en major |
| Sleutels in de code | `git grep` op de vorm van echte sleutels (GitHub, Claude, Netlify, PostHog, Meta, Google, AWS, privésleutels) | Elke treffer. Het rapport noemt alleen het bestand, nooit de waarde |

De logica staat in `src/security/securityReport.ts` (met tests), het ophalen in `scripts/security-check.ts`. Lokaal draaien: `npm run security:check`.

## Wat hij doet

1. **Rapport** in het open issue met label `beveiliging` (één issue dat elke week wordt bijgewerkt). De Orchestrator leest het mee en zet echte problemen onder *Voor jou* in de weekplanning.
2. **Pull request** (branch `beveiliging/<datum>`) als er updates zijn binnen de versiegrenzen in `package.json`: `npm update` plus `npm audit fix`, nooit met `--force`. Alleen als lint, typecheck, tests en build slagen. Staat er nog een beveiligings-PR open, dan maakt hij geen nieuwe.

## Wat jij doet

- **PR mergen** als de Kwaliteitscontrole groen is. Daarmee gaan de updates live.
- **Grote versies** (major) gaan nooit automatisch, omdat ze code kunnen breken. Vraag Claude om ze één voor één bij te werken als het rapport ze noemt.
- **Mogelijke sleutel in de code:** vervang de sleutel direct bij de dienst zelf (ook als het een vergissing lijkt) en haal hem uit de code.
- **Accounts** controleert de agent niet: zet tweestapsverificatie aan op e-mail, GitHub, Netlify, PostHog, bol.com, TradeTracker en Claude.
