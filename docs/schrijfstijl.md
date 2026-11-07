# Schrijfstijl: geen AI-patronen

Dit document geldt voor alle Nederlandse tekst op jouwhockeystick.nl: artikelen, blogs, paginateksten, stickwijzer-uitslagen, metadata en bronlabels. Het geldt voor de content-agent in GitHub, Claude in een sessie en de redactie zelf. Het komt bovenop `docs/content-agent.md` en `docs/merkinstructie.md` ("vriendelijk, helder en betrouwbaar; het merk schreeuwt niet").

De regels komen uit de skill **vermijd-ai-schrijfstijl** van de eigenaar. Werk je in een Claude-sessie waarin die skill beschikbaar is, draai hem dan over elke nieuwe of herschreven tekst (modus "check" voor een review, standaardmodus om te herschrijven). Agents in GitHub Actions hebben de skill niet; voor hen is dit document de bron.

Waarom: lezers en Google herkennen gegenereerde tekst aan vaste tics. Die tics kosten vertrouwen, en vertrouwen is waar deze site op draait.

## Harde regels

Deze regels gelden voor elke tekst. De review-agent meldt een overtreding als punt.

1. **Hooguit één "niet X, maar Y" per tekst.** Ook varianten tellen mee: "geen X, maar Y", "het gaat niet om X, maar om Y", "X, niet Y", "niet alleen X, maar ook Y". Zeg wat het wél is.
2. **Geen gedachtestreepje (— of –) in lopende tekst.** Gebruik een komma, dubbele punt, haakjes of een nieuwe zin. Bronlabels schrijf je als `Merk: Titel van de pagina`, niet `Merk — Titel`.
3. **Geen uitroeptekens** in artikelen, blogs en paginateksten. Enthousiasme laat je zien met een concreet voorbeeld.
4. **Geen tussenkreten en labels** zoals "Goed nieuws:", "Je zult zien:", "Tip:", "Let op:", "Spoiler:", "Het resultaat?", "Zo onthoud je het:". Schrijf de zin gewoon uit. "Onze tip" mag als het redactioneel advies markeert (zie `content-agent.md`), hooguit één keer per tekst.
5. **Geen vraag-en-antwoord-cliffhangers** ("Zijn exacte wedstrijdmodel? Dat houdt hij voor zich."). Zeg wat er bekend is, en wat niet.
6. **Niets beweren wat geen bron heeft**, ook niet als stijlmiddel. "Dat houdt hij voor zich" is een bewering; "is niet bekend" is de feitelijke stand.

## Vermijden

- **AI-woorden:** cruciaal, essentieel, naadloos, robuust, baanbrekend, gamechanger, bovendien/daarnaast/tevens als zinsopener, kortom, al met al, het is belangrijk om op te merken, in de kern, een scala aan, beschikken over, fungeren als.
- **Opgeblazen woorden:** superleuk, ontzettend, perfect, ideaal, geweldig.
- **Een woord te vaak:** "fijn", "lekker" en "prettig" hooguit een paar keer per tekst. Zeg liever wat er beter gaat (de bal blijft dichterbij, de pass komt aan).
- **Drieslag-dwang:** niet alles in groepjes van drie. Noem het aantal dat klopt.
- **Vetgedrukte kop plus dubbele punt in een lijst** waar een gewone zin of alinea volstaat. Bij definities (zoals bow-profielen) mag het.
- **Dezelfde slotzin onder elk artikel.** Varieer de verwijzing naar de stickwijzer en laat hem aansluiten op het onderwerp van het artikel.
- **Een slotalinea die alleen herhaalt** wat er al stond.
- **Lege woorden:** "passend" als vaag etiket, "een groot verschil maken", "een paar gerichte vragen". Noem wat er bedoeld wordt.

## Wel doen

- Begin bij de zaak; de hoofdvraag staat binnen 80 woorden beantwoord (CLAUDE.md).
- Concreet boven abstract: lengtes, spelacties, wat je in de winkel test.
- Wissel korte en langere zinnen af.
- Spreek de lezer aan met "je".
- Kies een standpunt. "Toch raden we het af" is beter dan drie keer "mogelijk".

## Voorbeeld

Niet:

> Een nieuwe stick! Leuk, tot je ziet hoeveel keus er is. Goed nieuws: je hoeft geen materiaalexpert te worden. Begin niet bij de duurste stick, maar bij jezelf.

Wel:

> Bij een nieuwe stick kies je uit veel merken, carbonpercentages, krommingen en prijzen. Die techniek hoef je niet te kennen om goed te kiezen. Begin bij je ervaring, de juiste maat en wat je op het veld vaak doet.

## Controle vóór de PR

Lees de tekst één keer alleen op de harde regels hierboven. Tel de contrastzinnen en zoek op `—`, `–` en `!`. Met de skill beschikbaar: draai hem in de check-modus en verwerk alles met prioriteit P0 en P1.
