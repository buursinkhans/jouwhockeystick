# jouwhockeystick.nl

Een Nederlandse website die hockeyers en ouders helpt een passende hockeystick te kiezen: een stickwijzer met uitlegbaar advies, een catalogus met bronnen per gegeven, een kennisbank en een blog. Kopen gaat via partnerwinkels (bol.com en PassaHockey); de site verkoopt zelf niets.

## Snel starten

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm test
npm run build
```

## Waar staat wat?

| Map | Inhoud |
|---|---|
| `src/app/` | Pagina's (Next.js App Router) |
| `src/advice-engine/` | De adviesregels van de stickwijzer: filters, scores, redenen, lengteadvies |
| `src/catalog/` | De productcatalogus: één bestand per stick in `products/`, met bron en controledatum per gegeven |
| `src/content/` | Teksten: kennisartikelen, blogs, vragen van de stickwijzer, methodiek, privacy |
| `src/components/` | Interface-onderdelen |
| `src/lib/` | Winkellinks (`retailers.ts`), analytics, site-instellingen |
| `video/` | Uitlegvideo's in code (Remotion) |
| `docs/` | Alle afspraken en handboeken; begin bij [`docs/README.md`](docs/README.md) |

## Regels

De regels voor iedereen die aan de site werkt, mens of agent, staan in [`CLAUDE.md`](CLAUDE.md). De specificatie van de stickwijzer staat in [`docs/spec/keuzehulp-instructie-v1.1.md`](docs/spec/keuzehulp-instructie-v1.1.md).
