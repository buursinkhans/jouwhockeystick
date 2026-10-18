# Logo & merkinstructie — jouwhockeystick.nl

> **Doelgroep:** Claude Code / ontwikkelaar in VS Code
> **Status:** merkinstructie v1.0 (oktober 2026)
> **Hoort bij:** `docs/keuzehulp-spec.md` (implementatiespecificatie hockeystick-keuzehulp v1.1)
> **Bronontwerp:** Design-canvas "Logo jouwhockeystick.nl" (woordmerk, negatief/lockup, icoon/favicon, kleuren/typografie)
> **Doel:** het logo en de basishuisstijl exact en consistent in de site en assets verwerken.

---

## 0. Werkwijze voor Claude Code

1. Lees dit document volledig voordat je assets of componenten maakt.
2. Gebruik de SVG-bronnen uit §3 letterlijk als uitgangspunt. Wijzig geen verhoudingen, kleuren of vormen zonder expliciete opdracht.
3. Lever de bestanden uit §5 op en bouw de component uit §6.
4. Controleer aan het eind de acceptatiecriteria in §9.

---

## 1. Concept

Een hockeystick die je omdraait (handvat boven, kop onder) heeft de vorm van een kleine letter **j**. In het woordmerk is de **j** van "jouw" daarom een stick, en de punt op de j is de **hockeybal**.

- De stick staat voor het product, de bal voor het spel.
- Het beeld spelt het domein letterlijk, dus het werkt ook zonder uitleg.
- De toon is vriendelijk, helder en betrouwbaar. Het merk adviseert eerlijk en schreeuwt niet. Geen "pro"-, merkstatus- of agressieve sportesthetiek.

**Pay-off:** *Eerlijk stickadvies op maat*

---

## 2. Design tokens

### 2.1 Kleuren

| Token | Hex | Naam | Gebruik |
|---|---|---|---|
| `--jhs-veldblauw` | `#1846A3` | Veldblauw (waterveld) | Primair: stick in woordmerk, icoonvlak, knoppen, links |
| `--jhs-inkt` | `#0D1B2E` | Inkt | Tekst, woordmerk-letters, donker icoonvlak |
| `--jhs-bal` | `#FF8A1F` | Balcoranje | **Alleen** de bal en hooguit één klein accent per scherm |
| `--jhs-krijt` | `#EEF3FA` | Krijt | Lichte vlakken, achtergrond van secties |
| `--jhs-lijngrijs` | `#5B6B7F` | Lijngrijs | Secundaire tekst, ".nl", pay-off |
| `--jhs-nl-negatief` | `#C9D6F0` | Lichtblauw | ".nl" en secundaire tekst op veldblauw |
| `--jhs-rand` | `#D5DEEA` | Randgrijs | Scheidingslijnen, swatch-randen |

```css
:root {
  --jhs-veldblauw: #1846A3;
  --jhs-inkt: #0D1B2E;
  --jhs-bal: #FF8A1F;
  --jhs-krijt: #EEF3FA;
  --jhs-lijngrijs: #5B6B7F;
  --jhs-nl-negatief: #C9D6F0;
  --jhs-rand: #D5DEEA;
}
```

**Contrastregels (WCAG AA):**

- Wit op `--jhs-veldblauw` is ok voor alle tekst.
- `--jhs-lijngrijs` op wit is ok voor normale tekst.
- `--jhs-bal` **nooit** als tekstkleur op wit (te weinig contrast). Alleen als vlak of bal.
- Witte bal op witte achtergrond is niet toegestaan. Op wit is de bal altijd oranje (alternatief: `#F4B400` of `--jhs-inkt`).

### 2.2 Typografie

| Rol | Font | Gewichten | Bron |
|---|---|---|---|
| Logo, koppen | **Bricolage Grotesque** | 800 (woordmerk), 500 (".nl") | Google Fonts, `opsz` 12–96 |
| Tekst, interface | **Instrument Sans** | 400, 600 | Google Fonts |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800&family=Instrument+Sans:wght@400;600&display=swap" rel="stylesheet">
```

Voor productie bij voorkeur zelf hosten in `/public/fonts` (privacy, snelheid). Fallback: `system-ui, sans-serif`.

Woordmerk-instellingen: `font-weight: 800; letter-spacing: -0.035em; line-height: 1.1; white-space: nowrap;` en kleine letters.

---

## 3. SVG-bronnen

Alle iconen gebruiken `viewBox="0 0 100 100"`. Neem de coördinaten exact over.

### 3.1 De j-stick (voor in het woordmerk)

Staat inline vóór de tekst "ouwhockeystick". De `viewBox` is 44 × 100. De baseline van de tekst ligt op y ≈ 76, de bovenkant van de schacht op de x-hoogte van het font.

```html
<svg viewBox="0 0 44 100" aria-hidden="true"
     style="height:0.95em;width:0.418em;vertical-align:-0.228em;margin-right:0.01em;overflow:visible">
  <path d="M30 27 L30 70 C30 90 18 97 8 89"
        fill="none" stroke="#1846A3" stroke-width="14"
        stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="30" cy="8" r="7.5" fill="#FF8A1F"/>
</svg>
```

- Stick op wit: `stroke="#1846A3"`. Stick in negatief (op veldblauw): `stroke="#FFFFFF"`.
- De afmetingen in `em` zorgen dat de stick meeschaalt met de lettergrootte.
- `vertical-align: -0.228em` zet de schacht op de baseline en laat de kop als "descender" eronder vallen. Als de uitlijning na het laden van het font zichtbaar afwijkt, stel je **alleen** `vertical-align` bij, in stappen van 0.01em.

### 3.2 Icoon (groot, ≥ 128 px)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="jouwhockeystick.nl">
  <rect width="100" height="100" rx="22" fill="#1846A3"/>
  <circle cx="50" cy="122" r="48" fill="none" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="2.5"/>
  <path d="M58 32 L58 64 C58 84 44 90 32 82" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M51 40 L65 38 M51 46 L65 44 M51 52 L65 50" stroke="#1846A3" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="58" cy="15" r="7.5" fill="#FF8A1F"/>
</svg>
```

Opbouw:

- Vlak in veldblauw met `rx="22"`.
- Boog van de slagcirkel onderaan, wit op 35%.
- Witte j-stick.
- Drie gripstreepjes op de schacht. Die alleen gebruiken vanaf 256 px.
- Oranje bal.

### 3.3 Icoon (medium, 64–128 px)

Zonder gripstreepjes. De boog alleen vanaf 128 px.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#1846A3"/>
  <path d="M58 32 L58 64 C58 84 44 90 32 82" fill="none" stroke="#FFFFFF" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="58" cy="15" r="8.5" fill="#FF8A1F"/>
</svg>
```

### 3.4 Favicon 32 px

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="18" fill="#1846A3"/>
  <path d="M58 34 L58 62 C58 82 44 88 32 80" fill="none" stroke="#FFFFFF" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="58" cy="15" r="10" fill="#FF8A1F"/>
</svg>
```

### 3.5 Favicon 16 px

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="14" fill="#1846A3"/>
  <path d="M58 36 L58 60 C58 80 44 86 30 78" fill="none" stroke="#FFFFFF" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="58" cy="15" r="11" fill="#FF8A1F"/>
</svg>
```

**Regel:** hoe kleiner, hoe dikker de stick en hoe groter de bal. Details (grip, boog) verdwijnen onder 128 px.

### 3.6 Icoon in donkere variant (voor de lockup op veldblauw)

Gelijk aan §3.2 maar met `rect fill="#0D1B2E"`, de boog op `stroke-opacity="0.28"` en zonder gripstreepjes.

---

## 4. Logovarianten

| Variant | Opbouw | Achtergrond | Gebruik |
|---|---|---|---|
| **Primair woordmerk** | j-stick + "ouwhockeystick" + ".nl" | Wit / krijt | Hero, documenten, e-mail |
| **Woordmerk negatief** | Witte j-stick, witte letters, ".nl" in `#C9D6F0`, oranje bal | Veldblauw | Donkere secties, footer |
| **Horizontale lockup** | Icoon (§3.6) + woordmerk "jouwhockeystick.nl" in gewone letters, gap ≈ 0.4 × icoonhoogte | Veldblauw of wit | Siteheader, social profielen |
| **Icoon** | §3.2–3.5 | Eigen vlak | Favicon, app-icoon, avatar |
| **Met pay-off** | Primair woordmerk + "Eerlijk stickadvies op maat" eronder | Wit | Homepage hero, presentaties |

Specificaties primair woordmerk (referentie-artboard 1200 × 640):

- Woordmerk 104 px, Bricolage Grotesque 800, kleur `--jhs-inkt`.
- ".nl" in gewicht 500, kleur `--jhs-lijngrijs`.
- Pay-off 26 px, Instrument Sans 400, kleur `--jhs-lijngrijs`, 28 px onder het woordmerk.

**Let op:** in de lockup met icoon staat de j-stick al in het icoon. Gebruik daar daarom een gewone letter "j" in het woordmerk, zodat er geen dubbele stick ontstaat.

### 4.1 Vrije ruimte en minimale maat

- **Vrije ruimte** rondom: minimaal de hoogte van de bal × 2 (≈ 0.15 × woordmerkhoogte). Voor het icoon: 12,5% van de icoonbreedte.
- **Minimale breedte:** woordmerk 140 px (digitaal) of 35 mm (print). Daaronder gebruik je het icoon.

### 4.2 Niet doen

- De stick niet spiegelen, draaien of "rechtop" zetten als normale hockeystick. Het concept werkt alleen als j.
- De bal niet in een andere kleur dan oranje, geel (`#F4B400`) of inkt.
- Geen schaduwen, gradients, outlines of 3D-effecten.
- Het woordmerk niet in hoofdletters of met een ander font.
- Het woordmerk niet afbreken over twee regels.
- De bal niet laten aansluiten op de schacht. Er blijft altijd een spleet.
- Rood niet als merkkleur gebruiken.

---

## 5. Op te leveren bestanden

```text
public/brand/
├─ jhs-icon.svg                 # §3.2
├─ jhs-icon-dark.svg            # §3.6
├─ jhs-icon-medium.svg          # §3.3
├─ jhs-wordmark.svg             # primair, tekst omgezet naar paden (zie §5.1)
├─ jhs-wordmark-negative.svg    # negatief, tekst als paden
├─ jhs-lockup.svg               # icoon + woordmerk, tekst als paden
public/
├─ favicon.svg                  # §3.4 (moderne browsers)
├─ favicon.ico                  # 16 + 32 + 48 px, gerenderd uit §3.5 / §3.4
├─ apple-touch-icon.png         # 180×180, uit §3.3, zonder transparantie
├─ icon-192.png                 # PWA, uit §3.3
├─ icon-512.png                 # PWA, uit §3.2
├─ og-image.png                 # 1200×630, krijt-achtergrond + woordmerk met pay-off
└─ site.webmanifest
```

### 5.1 Tekst omzetten naar paden

Het woordmerk mag in de **site** als HTML + inline SVG (§6), maar losse logobestanden moeten **zonder fontafhankelijkheid** werken:

- Zet de tekst om naar paden met een script, bijvoorbeeld `opentype.js` (Node) of `fonttools` (Python), op basis van de lokaal gedownloade fontbestanden van Bricolage Grotesque.
- Houd daarbij exact aan: gewicht 800, `letter-spacing -0.035em`, en ".nl" in 500.
- Bewaar het script als `scripts/build-brand-assets.(mjs|py)` zodat de assets reproduceerbaar zijn.
- PNG/ICO-renders genereren met `sharp` of `resvg`. Geen handwerk.

### 5.2 Head-tags

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#1846A3">
<meta property="og:image" content="/og-image.png">
```

`site.webmanifest`: `name` "jouwhockeystick.nl", `short_name` "Stickadvies", `theme_color` `#1846A3`, `background_color` `#EEF3FA`, iconen 192 en 512.

---

## 6. Logo-component voor de site

Maak één herbruikbare component (bijv. `src/components/Logo.astro` of `Logo.tsx`) met de props hieronder.

| Prop | Waarden | Default |
|---|---|---|
| `variant` | `'wordmark' \| 'wordmark-negative' \| 'lockup' \| 'icon'` | `'wordmark'` |
| `size` | font-size in px (woordmerk) of breedte (icoon) | `32` |
| `tagline` | `boolean`, toont "Eerlijk stickadvies op maat" | `false` |
| `href` | link naar home | `'/'` |

Vereisten:

- **Toegankelijkheid.** De SVG van de stick krijgt `aria-hidden="true"`. De link krijgt `aria-label="jouwhockeystick.nl – naar home"`. Schermlezers moeten de naam lezen als "jouwhockeystick.nl" en niet als "ouwhockeystick".
- **Font laden.** Voorkom dat de j-stick verschuift door `font-display: swap`: preload Bricolage Grotesque 800, of gebruik in de header de lockup-SVG met paden.
- **Header.** De lockup komt op 40 px icoonhoogte (mobiel 32 px). Woordmerk naast het icoon in 24 px (mobiel 20 px). Onder 360 px viewport alleen het icoon plus de tekst "Stickadvies".

Voorbeeld (woordmerk, HTML):

```html
<a href="/" class="jhs-logo" aria-label="jouwhockeystick.nl – naar home">
  <span class="jhs-wordmark" aria-hidden="true"><svg viewBox="0 0 44 100" style="height:0.95em;width:0.418em;vertical-align:-0.228em;margin-right:0.01em;overflow:visible"><path d="M30 27 L30 70 C30 90 18 97 8 89" fill="none" stroke="currentColor" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><circle cx="30" cy="8" r="7.5" fill="var(--jhs-bal)"/></svg>ouwhockeystick<span class="jhs-tld">.nl</span></span>
</a>
```

```css
.jhs-wordmark {
  font-family: 'Bricolage Grotesque', system-ui, sans-serif;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.1;
  white-space: nowrap;
  color: var(--jhs-inkt);
}
.jhs-wordmark svg { color: var(--jhs-veldblauw); }
.jhs-tld { font-weight: 500; color: var(--jhs-lijngrijs); }

.jhs-logo--negative .jhs-wordmark,
.jhs-logo--negative .jhs-wordmark svg { color: #FFFFFF; }
.jhs-logo--negative .jhs-tld { color: var(--jhs-nl-negatief); }
```

---

## 7. Aansluiting op de keuzehulp

Het merk moet de principes uit `docs/keuzehulp-spec.md` uitstralen.

- **Rustig en uitlegbaar.** Veldblauw voor structuur en navigatie, oranje alleen voor de één belangrijkste actie of de voortgangs-"bal".
- **Voortgangsindicator in de wizard.** Een dunne lijn in `--jhs-rand` met een oranje bal die meeschuift, plus de tekst `Stap 3 van 8`. Dat herhaalt het logo-idee zonder het logo zelf.
- **Resultaatrollen** (beste match / veilige keuze / ambitieuze keuze) onderscheiden met labels en tekst, niet alleen met kleur.
- **Geen merk- of sponsorlogo's** groter of prominenter dan het eigen logo in adviesresultaten. Dat sluit aan op "marge en sponsoring zijn geen scorefactor".

---

## 8. Open punten

- `TODO(eigenaar):` merkcheck uitvoeren. Is "jouwhockeystick" vrij als handelsnaam en merk, en is het beeldmerk niet te dicht bij bestaande hockeymerken? Dat laten toetsen door een merkenadviseur.
- `TODO(eigenaar):` zijn de social handles (Instagram, TikTok, LinkedIn) beschikbaar?
- `TODO(dev):` de uitlijning van de j-stick controleren in Chrome, Safari en Firefox na het laden van het font. Alleen `vertical-align` bijstellen.

---

## 9. Acceptatiecriteria

- Alle bestanden uit §5 bestaan en worden gegenereerd door één script.
- Losse logobestanden bevatten geen `<text>`-elementen; alle tekst is omgezet naar paden.
- De favicon is herkenbaar op 16 px (j-stick en bal zichtbaar, geen dichtgelopen vorm).
- Schermlezers lezen "jouwhockeystick.nl".
- Het woordmerk breekt nergens af; onder 360 px valt de header terug op icoon + "Stickadvies".
- Er is geen rood als merkkleur, geen oranje tekst op wit, en geen witte bal op wit.
- Kleuren in code komen uitsluitend uit de tokens in §2.1.
