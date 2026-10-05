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
    'Welke gegevens jouwhockeystick.nl verwerkt, waarom, hoe lang en met wie: de stickwijzer, het interesseformulier, cookieloze statistieken en hosting.',
  version: '1.0',
  updatedAt: '2026-10-05',
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
      heading: 'Statistieken (Simple Analytics)',
      paragraphs: [
        'We meten het gebruik van de site met Simple Analytics, een privacyvriendelijke dienst die geen cookies plaatst en geen bezoekersprofielen of IP-adressen opslaat. We zien daardoor alleen geanonimiseerde totalen, zoals het aantal bezoeken per pagina.',
        'Daarnaast tellen we anoniem welke stappen in de stickwijzer worden gezet, welke antwoorden vaak worden gekozen en op welke winkellinks wordt geklikt. Die gebeurtenissen bevatten geen naam, e-mailadres of ander kenmerk waarmee je te herkennen bent. We doen dit op basis van ons gerechtvaardigd belang om de stickwijzer te verbeteren.',
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
        'Productfoto’s en logo’s laden we rechtstreeks van de websites van de merken en van bol.com. Daardoor ontvangt die website, zoals bij elke afbeelding op internet, technische gegevens zoals je IP-adres. Wij krijgen daar niets van te zien.',
        'Als je doorklikt naar een winkel zoals bol.com of PassaSports, verlaat je onze site. Op die websites gelden hun eigen privacy- en cookiebeleid. Onze links bevatten geen persoonlijke kenmerken.',
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
