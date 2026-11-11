# Buyer Intelligence fase 1.5: ruwe meetdata (alleen tellingen)

Opgehaald op 2026-11-11T17:17 UTC. Periode vanaf 2026-08-01. Alleen live domein, bots eruit gefilterd. "Bezoekdag" = één bezoeker op één dag (PostHog draait cookieloos). "Winkelklik" bij een wijzersessie = een retailer_click van dezelfde bezoeker op dezelfde dag, na de start van de wijzer.

## Controle op testverkeer: stickwijzer per dag

| dag | bron | apparaat | bezoekdagen | wijzer-starts | afgerond | met winkelklik | voor wie | routes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-06 | utm:setup-test | Desktop | 1 | 1 | 0 | 1 | ["self"] | ["START"] |
| 2026-10-06 | direct | Desktop | 1 | 1 | 1 | 1 | ["self"] | ["START"] |
| 2026-10-08 | direct | Mobile | 1 | 1 | 1 | 0 | ["self"] | ["PRESTATIE"] |
| 2026-10-08 | direct | Desktop | 1 | 1 | 0 | 0 | ["self"] | ["PRESTATIE"] |
| 2026-10-10 | direct | Desktop | 1 | 1 | 0 | 0 | ["self"] | ["ONTWIKKEL"] |
| 2026-10-12 | direct | Mobile | 1 | 1 | 0 | 1 | [""] | [""] |
| 2026-10-12 | jouwhockeystick.nl | Desktop | 1 | 1 | 0 | 0 | [""] | [""] |
| 2026-10-12 | direct | Tablet | 1 | 1 | 0 | 0 | ["child"] | ["ONTWIKKEL"] |
| 2026-10-13 | utm:ig | Mobile | 1 | 1 | 1 | 0 | ["child"] | ["START"] |
| 2026-10-13 | direct | Mobile | 1 | 1 | 1 | 0 | ["self"] | ["PRESTATIE"] |
| 2026-10-13 | direct | Desktop | 1 | 1 | 1 | 0 | ["child"] | ["ONTWIKKEL"] |
| 2026-10-14 | utm:ig | Mobile | 2 | 2 | 2 | 0 | ["self"] | ["PRESTATIE"] |
| 2026-10-14 | direct | Desktop | 1 | 1 | 0 | 0 | ["child"] | ["PRESTATIE"] |
| 2026-10-16 | www.google.com | Desktop | 1 | 1 | 0 | 0 | ["child"] | ["ONTWIKKEL"] |
| 2026-10-19 | www.google.com | Mobile | 1 | 1 | 1 | 0 | ["self"] | ["PRESTATIE"] |
| 2026-10-19 | direct | Mobile | 1 | 1 | 1 | 0 | ["self"] | ["PRESTATIE"] |
| 2026-10-20 | direct | Desktop | 1 | 1 | 1 | 0 | ["child"] | ["START"] |
| 2026-10-23 | www.google.com | Mobile | 2 | 2 | 2 | 0 | ["self","child"] | ["PRESTATIE"] |
| 2026-10-23 | direct | Mobile | 1 | 1 | 1 | 1 | ["child"] | ["START"] |
| 2026-10-24 | direct | Mobile | 1 | 1 | 0 | 0 | ["self"] | ["ONTWIKKEL"] |
| 2026-10-24 | www.google.com | Mobile | 1 | 1 | 1 | 0 | ["self"] | ["ONTWIKKEL"] |
| 2026-10-24 | direct | Desktop | 1 | 1 | 0 | 0 | ["self"] | ["ONTWIKKEL"] |
| 2026-10-25 | www.google.com | Mobile | 1 | 4 | 1 | 0 | ["child"] | ["START"] |
| 2026-10-25 | utm:ig | Mobile | 1 | 1 | 1 | 0 | ["self"] | ["PRESTATIE"] |
| 2026-10-25 | direct | Mobile | 1 | 1 | 1 | 0 | ["child"] | ["START"] |
| 2026-10-26 | direct | Mobile | 1 | 1 | 1 | 1 | ["child"] | ["START"] |
| 2026-10-29 | utm:ig | Mobile | 1 | 1 | 1 | 0 | ["self"] | ["PRESTATIE"] |
| 2026-10-29 | direct | Mobile | 1 | 1 | 1 | 1 | ["self"] | ["START"] |
| 2026-10-30 | direct | Desktop | 1 | 1 | 1 | 0 | ["self"] | ["PRESTATIE"] |
| 2026-10-31 | utm:ig | Mobile | 1 | 1 | 1 | 0 | ["self"] | ["PRESTATIE"] |
| 2026-11-01 | utm:ig | Mobile | 1 | 3 | 1 | 0 | ["self"] | ["PRESTATIE"] |
| 2026-11-01 | direct | Desktop | 1 | 1 | 1 | 0 | ["self"] | ["ONTWIKKEL"] |
| 2026-11-02 | utm:ig | Mobile | 1 | 1 | 1 | 0 | ["self"] | ["PRESTATIE"] |
| 2026-11-03 | direct | Desktop | 1 | 1 | 1 | 0 | ["child"] | ["START"] |
| 2026-11-03 | utm:youtube | Mobile | 1 | 1 | 1 | 0 | ["self"] | ["PRESTATIE"] |
| 2026-11-04 | utm:ig | Mobile | 2 | 2 | 2 | 0 | ["child"] | ["PRESTATIE"] |
| 2026-11-05 | www.google.com | Desktop | 1 | 1 | 1 | 0 | ["self"] | ["ONTWIKKEL"] |
| 2026-11-06 | www.google.com | Mobile | 1 | 1 | 0 | 1 | ["self"] | ["PRESTATIE"] |
| 2026-11-08 | jouwhockeystick.nl | Desktop | 1 | 1 | 1 | 1 | ["child"] | [""] |
| 2026-11-09 | direct | Desktop | 1 | 1 | 1 | 0 | ["child"] | [""] |
| 2026-11-10 | direct | Desktop | 1 | 1 | 1 | 1 | ["child"] | [""] |
| 2026-11-11 | direct | Mobile | 1 | 1 | 1 | 0 | ["self"] | ["START"] |
| 2026-11-11 | direct | Desktop | 1 | 1 | 1 | 1 | ["self"] | [""] |

### Winkelkliks per dag

| dag | apparaat | plek | kliks |
| --- | --- | --- | --- |
| 2026-10-06 | Desktop | catalogus | 1 |
| 2026-10-06 | Desktop | stickwijzer | 1 |
| 2026-10-07 | Desktop | catalogus | 1 |
| 2026-10-08 | Desktop | stickwijzer | 1 |
| 2026-10-12 | Mobile | catalogus | 4 |
| 2026-10-12 | Desktop | stickwijzer | 1 |
| 2026-10-14 | Mobile | catalogus | 1 |
| 2026-10-17 | Desktop | catalogus | 3 |
| 2026-10-18 | Mobile | catalogus | 1 |
| 2026-10-20 | Mobile | zaalkeuze | 1 |
| 2026-10-23 | Mobile | stickwijzer | 1 |
| 2026-10-24 | Mobile | catalogus | 1 |
| 2026-10-25 | Mobile | zaalkeuze | 1 |
| 2026-10-26 | Mobile | stickwijzer | 2 |
| 2026-10-29 | Mobile | catalogus | 1 |
| 2026-10-29 | Mobile | stickwijzer | 1 |
| 2026-11-03 | Desktop | catalogus | 1 |
| 2026-11-04 | Desktop | catalogus | 1 |
| 2026-11-05 | Desktop | zaalkeuze | 1 |
| 2026-11-05 | Desktop | productpagina | 4 |
| 2026-11-06 | Mobile | zaalkeuze | 1 |
| 2026-11-08 | Desktop | productpagina | 1 |
| 2026-11-09 | Mobile | catalogus | 1 |
| 2026-11-09 | Mobile | productpagina | 1 |
| 2026-11-09 | Mobile | zaalkeuze | 4 |
| 2026-11-10 | Desktop | productpagina | 1 |
| 2026-11-11 | Desktop | productpagina | 1 |
| 2026-11-11 | Desktop | stickwijzer | 1 |
| 2026-11-11 | Desktop | zaalkeuze | 1 |

