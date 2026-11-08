# Uploadteksten: Low bow of mid bow? (AI-trainer Daan, Short)

Bronpagina: `/kennis/low-bow-vs-mid-bow`. De plek van de kromming en de maximale diepte komen uit `src/content/bowProfiles.ts`, dezelfde bron als de figuur op de site. De trainer *Daan* is een verzonnen AI-presentator uit Synthesia (`docs/video.md` §9a). **Zolang zijn clip er niet in zit** (`TRAINER_CLIP_READY = false` in `video/src/kromming-trainer/data.ts`), opent de video met een tekst en zit er geen AI in: haal dan de AI-regels hieronder weg en zet de AI-labels uit.

Bestanden (uit de run *Video renderen*, download *video-renders*):

| Bestand | Waar |
|---|---|
| `hockeystick-kromming-trainer-short.mp4` (9:16, ±36 s met Daan, ±26 s zonder; met muziek) | YouTube Shorts, en Reels/TikTok als je onze eigen muziek houdt |
| `hockeystick-kromming-trainer-short-zonder-muziek.mp4` | Reels/TikTok als je in de app zelf muziek kiest |

## Script voor Synthesia (één clip, twee takes)

Maak één video met Daan en je eigen stem. Laat tussen de takes een korte pauze, dan is de knip makkelijk te meten. Achtergrond: effen, in de kleur krijt (#EEF3FA) of veldblauw (#1846A3). Daan in het midden van het beeld, 9:16.

**Take 1 (opening, ±7 s)**
> Low bow of mid bow? Ik ben Daan, AI-trainer van jouwhockeystick.nl. Ik laat je zien waar het verschil zit.

**Take 2 (afsluiting, ±6 s)**
> Twijfel je nog? De stickwijzer kijkt naar wat jij op het veld doet. Je vindt hem op jouwhockeystick.nl.

Daarna: MP4 downloaden → `assets/video/trainer/kromming-trainer.mp4`, in `data.ts` `TRAINER_CLIP_READY = true` en de tijden in `TAKES` aanpassen. Verander je een zin in Synthesia, pas dan ook `CAPTIONS` aan.

---

## YouTube Shorts

**Titel**
Low bow of mid bow? Zo zie je het verschil #hockey #shorts

**Beschrijving**
```
Elke hockeystick mag hooguit 25 mm krom zijn. Het verschil tussen sticks zit in de plek van die kromming. Bij een mid bow ligt het diepste punt ongeveer halverwege; bij een low bow dichter bij de krul, zodat je makkelijker onder de bal komt. Welke kromming past bij jouw spel? Doe de gratis stickwijzer → jouwhockeystick.nl/youtube

Meer uitleg: jouwhockeystick.nl/kennis/low-bow-vs-mid-bow?utm_source=youtube&utm_medium=video&utm_campaign=kromming-trainer

Volg voor 3 stick-tips per week.

De presentator is gemaakt met AI. De stick in de video is schematisch, niet op schaal. Bron voor de maximale kromming: de spelregels van de FIH.

Op de site staan partnerlinks naar partnerwinkels; daarvoor krijgen we een kleine vergoeding. Die speelt geen rol in ons advies.
```

Koppel bij *Gerelateerde video* de nieuwste YouTube-video.

---

## Instagram/Facebook Reel en TikTok

Onderschrift volgens `docs/instagram.md` §4 en §9:

```
Low bow of mid bow?
Elke stick mag hooguit 25 mm krom zijn. Het verschil zit in de plek: bij een mid bow ongeveer halverwege, bij een low bow dichter bij de krul. Begin je of werk je aan je basis, dan is een mid bow een logisch startpunt.
Welke kromming bij jouw spel past, zie je in de stickwijzer. Link in bio.

Presentator gemaakt met AI.
Op de site staan partnerlinks naar partnerwinkels; daarvoor krijgen we een kleine vergoeding. Die speelt geen rol in ons advies.
#hockey #hockeystick #lowbow #jeugdhockey #hockeyouders #partnerlink
```

---

## Instellingen bij het uploaden

- **YouTube → Publiek:** "Nee, het is niet gemaakt voor kinderen" (de video is voor ouders en spelers).
- **YouTube → Gewijzigde of synthetische content:** "Ja" met Daan (realistische AI-presentator), "Nee" zonder.
- **Instagram, Facebook en TikTok:** AI-label aan met Daan, uit zonder.
- **Betaalde promotie:** uit.
- Link naar de site met `utm_source=youtube&utm_medium=video&utm_campaign=kromming-trainer` (of via `jouwhockeystick.nl/youtube`).
