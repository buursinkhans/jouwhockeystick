import { CONTACT_EMAIL, SITE_NAME } from '@/lib/site';

export type PrivacySection = {
  heading: string;
  paragraphs?: string[];
  items?: string[];
};

/**
 * Public privacy statement. Every statement here must match what the site
 * actually does — update this file together with any change to analytics,
 * forms, hosting or embedded third-party content.
 */
export const PRIVACY = {
  title: 'Privacyverklaring',
  metaDescription:
    'Welke gegevens jouwhockeystick.nl verwerkt, waarom, hoe lang en met wie: de stickwijzer, het interesseformulier, cookieloze statistieken, hosting en partnerlinks.',
  version: '1.4',
  updatedAt: '2026-10-29',
  intro: [
    `${SITE_NAME} gebruikt zo weinig persoonsgegevens als mogelijk. Voor de stickwijzer hoef je geen naam, e-mailadres of geboortedatum op te geven, we plaatsen geen cookies en we gebruiken statistieken zonder cookies of bezoekersprofielen. Alleen als je zelf het interesseformulier invult, ontvangen we contactgegevens.`,
  ],
  sections: [
    {
      heading: 'Wie is verantwoordelijk?',
      paragraphs: [
        `${SITE_NAME} is verantwoordelijk voor de verwerking van persoonsgegevens zoals beschreven in deze verklaring. Voor vragen over privacy of om je rechten uit te oefenen, mail je naar ${CONTACT_EMAIL}.`,
      ],
    },
    {
      heading: 'De stickwijzer',
      paragraphs: [
        'Je antwoorden in de stickwijzer (zoals leeftijdsgroep, lichaamslengte, ervaring en budget) worden tijdelijk in je eigen browser bewaard, zodat je kunt teruggaan zonder opnieuw te beginnen. Ze verdwijnen zodra je het tabblad sluit.',
        'Om het advies te berekenen, worden de antwoorden naar onze server gestuurd. We slaan ze daar niet op en koppelen ze niet aan jou. We vragen bewust geen naam, e-mailadres of geboortedatum.',
      ],
    },
    {
      heading: 'Het interesseformulier',
      paragraphs: [
        'Als je het interesseformulier invult, verwerken we de gegevens die je zelf opgeeft: je naam (optioneel), e-mailadres en/of telefoonnummer, je bericht, de stick waarover je een vraag hebt en de pagina waarvandaan je het formulier opende.',
        'We gebruiken deze gegevens alleen om contact met je op te nemen over je vraag. De grondslag is je toestemming, die je geeft met het vinkje in het formulier. Je kunt die toestemming altijd intrekken door ons te mailen.',
        'Het formulier wordt verwerkt via Netlify Forms; we ontvangen je aanvraag daarna per e-mail. We bewaren aanvragen niet langer dan 12 maanden na het laatste contact en verwijderen ze eerder als je daarom vraagt.',
      ],
    },
    {
      heading: 'Statistieken (Simple Analytics en PostHog)',
      paragraphs: [
        'We meten het gebruik van de site met Simple Analytics, een privacyvriendelijke dienst die geen cookies plaatst en geen bezoekersprofielen of IP-adressen opslaat. We zien daardoor alleen geanonimiseerde totalen, zoals het aantal bezoeken per pagina.',
        'Daarnaast tellen we anoniem welke stappen in de stickwijzer worden gezet, welke antwoorden vaak worden gekozen en op welke winkellinks wordt geklikt. Die gebeurtenissen bevatten geen naam, e-mailadres of ander kenmerk waarmee je te herkennen bent. We doen dit op basis van ons gerechtvaardigd belang om de stickwijzer te verbeteren.',
        'Om te zien waar de site onduidelijk is, gebruiken we ook PostHog, met opslag in de Europese Unie (Frankfurt). PostHog registreert anoniem op welke knoppen en links wordt geklikt, hoe ver pagina’s worden gelezen en waar bezoekers in de stickwijzer afhaken, en maakt daar heatmaps van. We gebruiken PostHog zonder cookies en zonder lokale opslag in je browser, we maken geen opnames van bezoeken, en we koppelen niets aan jou als persoon. Wat je in formulieren typt, wordt niet vastgelegd.',
        'De metingen voor PostHog gaan via ons eigen domein naar PostHog in de Europese Unie.',
      ],
    },
    {
      heading: 'Hosting',
      paragraphs: [
        'De site wordt gehost door Netlify. Om de site te kunnen tonen en te beveiligen, verwerkt Netlify technische gegevens zoals je IP-adres en browsertype in serverlogbestanden. Dat is noodzakelijk voor de werking van de site (gerechtvaardigd belang).',
      ],
    },
    {
      heading: 'Afbeeldingen en links van derden',
      paragraphs: [
        'Productfoto’s en logo’s laden we rechtstreeks van de websites van de merken en van de winkels waar de gegevens vandaan komen (bol.com, PassaSports en Plutosport), of van de beeldservers die zij daarvoor gebruiken. Daardoor ontvangt die website, zoals bij elke afbeelding op internet, technische gegevens zoals je IP-adres en browser. Wij krijgen daar niets van te zien.',
        'Als je doorklikt naar bol.com, PassaHockey of Plutosport, verlaat je onze site. Op die websites gelden hun eigen privacy- en cookiebeleid. Onze links bevatten geen persoonlijke kenmerken: alleen de plek op onze site waar je klikte (bijvoorbeeld de stickwijzer of een stickpagina) en, bij bol.com, de naam van de stick.',
        'Op onze eigen site plaatsen we geen cookies, ook niet voor partnerlinks. Cookies van de winkels en de affiliatenetwerken komen pas na een klik, op hun eigen websites.',
        'De links naar bol.com lopen via het bol.com Partnerprogramma. Na een klik registreert bol.com dat je via onze site kwam, zodat een eventuele aankoop aan ons kan worden toegeschreven; bol.com kan daarvoor op zijn eigen website cookies plaatsen. Wij ontvangen daarbij geen gegevens over wie je bent of wat je koopt, alleen geanonimiseerde totalen.',
        'De links naar PassaHockey, de hockeywinkel van PassaSports, lopen via het affiliatenetwerk TradeTracker. Na een klik registreren PassaSports en TradeTracker dat je via onze site kwam, zodat een eventuele aankoop aan ons kan worden toegeschreven; zij kunnen daarvoor cookies plaatsen. Ook hier ontvangen wij geen gegevens over wie je bent.',
        'De links naar Plutosport lopen via het affiliatenetwerk Awin. Na een klik ga je eerst langs de website van Awin (awin1.com). Awin registreert dan technische gegevens zoals je IP-adres, je browser, het tijdstip en de pagina waar je vandaan kwam, en geeft een kenmerk van de klik mee aan Plutosport. Awin en Plutosport kunnen daarvoor cookies plaatsen, zodat een eventuele aankoop aan ons kan worden toegeschreven. Koop je iets, dan verwerkt Plutosport je bestelling volgens zijn eigen privacybeleid. Wij zien alleen kliks en aankopen, zonder naam, adres of andere gegevens over wie je bent.',
      ],
    },
    {
      heading: 'Met wie delen we gegevens?',
      paragraphs: [
        'We verkopen je gegevens niet en delen ze niet voor marketing. We werken alleen met dienstverleners die nodig zijn om de site te laten werken:',
      ],
      items: [
        'Netlify — hosting en verwerking van het interesseformulier. Netlify is gevestigd in de Verenigde Staten; voor doorgifte buiten de Europese Economische Ruimte gelden de waarborgen uit de verwerkersvoorwaarden van Netlify.',
        'Simple Analytics — cookieloze statistieken zonder persoonsgegevens.',
        'PostHog — cookieloze analyse van klikgedrag en heatmaps, met opslag in de Europese Unie.',
        'Onze e-mailprovider — voor het ontvangen van je aanvraag.',
      ],
    },
    {
      heading: 'Kinderen',
      paragraphs: [
        'De stickwijzer kan ook voor kinderen worden ingevuld; daarvoor zijn geen persoonsgegevens nodig. Het interesseformulier is bedoeld voor volwassenen. Ben je jonger dan 16 jaar, vraag dan een ouder of verzorger om het formulier in te vullen.',
      ],
    },
    {
      heading: 'Jouw rechten',
      paragraphs: [
        `Je hebt het recht om je gegevens in te zien, te laten corrigeren of te laten verwijderen, om de verwerking te laten beperken, om bezwaar te maken en om je gegevens over te laten dragen. Stuur je verzoek naar ${CONTACT_EMAIL}; we reageren binnen een maand.`,
        'Ben je het niet eens met hoe we met je gegevens omgaan, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.',
      ],
    },
    {
      heading: 'Beveiliging',
      paragraphs: [
        'De site is alleen via een beveiligde verbinding (https) te bereiken. Toegang tot aanvragen uit het interesseformulier is beperkt tot de beheerders van de site.',
      ],
    },
    {
      heading: 'Wijzigingen',
      paragraphs: [
        'Als we de manier waarop we gegevens verwerken veranderen, passen we deze verklaring aan. Bovenaan staat altijd de datum van de laatste wijziging.',
      ],
    },
  ] satisfies PrivacySection[],
};
