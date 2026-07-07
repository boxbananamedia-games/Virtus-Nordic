export type Lang = "da" | "en";

const EMAIL = "alex@virtusnordic.com";
const PHONE = "+45 41 36 90 00";
const PHONE_HREF = "tel:+4541369000";

export const CONTACT = { EMAIL, PHONE, PHONE_HREF };

export type ServiceItem = { title: string; teaser: string; paras: string[] };

type PageMeta = { title: string; description: string };

export type Content = {
  meta: { home: PageMeta; about: PageMeta; services: PageMeta; contact: PageMeta };
  nav: { home: string; about: string; services: string; contact: string; cta: string };
  hero: { tagline: string; ctaPrimary: string; ctaSecondary: string; scroll: string };
  intro: { quote: string; p1: string; p2: string };
  craft: { label: string; headline: string; body: string; captions: string[] };
  servicesTeaser: { label: string; headline: string; sub: string };
  services: {
    label: string;
    headline: string;
    items: ServiceItem[];
    closing: string;
    closingCta: string;
  };
  process: {
    label: string;
    headline: string;
    steps: { title: string; body: string }[];
  };
  ctaBand: { headline: string; sub: string; book: string; call: string };
  about: {
    label: string;
    headline: string;
    p1: string;
    p2: string;
    philosophyLabel: string;
    quote: string;
    p3: string;
    localLabel: string;
    p4: string;
  };
  contact: {
    headline: string;
    sub: string;
    emailLabel: string;
    phoneLabel: string;
    basedLabel: string;
    based: string;
    form: { name: string; company: string; email: string; phone: string; message: string; send: string; note: string };
    mailSubject: string;
  };
  footer: { rights: string; tagline: string };
};

export const content: Record<Lang, Content> = {
  da: {
    meta: {
      home: {
        title: "Virtus Nordic — Mobilapplikationer der får din forretning til at vokse",
        description:
          "Boutique-udviklingsstudie i Aalborg. Skræddersyede apps, systemintegration og AI-agenter til danske virksomheder.",
      },
      about: {
        title: "Om os — Virtus Nordic",
        description: "Et studie, ikke et bureau-maskineri. Direkte adgang til den person, der bygger din app.",
      },
      services: {
        title: "Ydelser — Virtus Nordic",
        description: "Skræddersyede apps, systemintegration, AI-agenter og løbende optimering.",
      },
      contact: {
        title: "Kontakt — Virtus Nordic",
        description: "Book et møde med Virtus Nordic i Aalborg. Ingen forpligtelser — bare en snak.",
      },
    },
    nav: { home: "Forside", about: "Om os", services: "Ydelser", contact: "Kontakt", cta: "Book et møde" },
    hero: {
      tagline: "Mobilapplikationer der får din forretning til at vokse",
      ctaPrimary: "Book et møde",
      ctaSecondary: "Se vores ydelser",
      scroll: "Scroll",
    },
    intro: {
      quote: "\u201cVi bygger de applikationer, din forretning fortjener — præcise, gennemtænkte og bygget til at holde.\u201d",
      p1: "Virtus Nordic er et udviklingsstudie baseret i Aalborg. Vi arbejder med lokale virksomheder, der forstår, at en gennemført app ikke er en luksus — det er infrastruktur.",
      p2: "Ethvert samarbejde starter med at forstå din forretning dybt og omfattende, og nøjagtigt hvad der gør den unik. Teknologien kommer bagefter.",
    },
    craft: {
      label: "Virkeligheden",
      headline: "Din kunde er altid lige der — på skærmen",
      body: "På cafeen, i toget, ved skrivebordet, sent om aftenen. Scroll for at følge med.",
      captions: [
        "Den gennemsnitlige person tjekker sin telefon over 90 gange om dagen.",
        "Vi bruger næsten 4 timer om dagen med blikket på en skærm.",
        "Næsten hver anden føler sig utryg uden sin telefon inden for rækkevidde.",
        "Næsten halvdelen af os sover med telefonen inden for armslængde.",
        "Dine kunder er allerede der. Er du?",
      ],
    },
    servicesTeaser: {
      label: "Det vi laver",
      headline: "Fire måder, vi hjælper din forretning på",
      sub: "Vi er specialister i mobilapplikationer og AI-systemer, der løser reelle udfordringer — ingen trends, ingen skabeloner.",
    },
    services: {
      label: "Det vi laver",
      headline: "Fire måder, vi hjælper din forretning med at vokse",
      items: [
        {
          title: "Skræddersyede apps",
          teaser: "Kode bygget helt fra bunden efter, hvordan din forretning rent faktisk fungerer. Ingen overflødige funktioner, ingen kompromiser.",
          paras: [
            "iOS- og Android-applikationer bygget helt fra bunden efter din faktiske arbejdsgang. Ingen overflødige skabeloner, ingen unødvendige funktioner — bare den app, din forretning har brug for, for at fungere bedre.",
          ],
        },
        {
          title: "Integration med dine systemer",
          teaser: "Din app taler naturligt sammen med de systemer, du allerede bruger — bookingsystemer, lager, CRM. Ingen dobbeltarbejde.",
          paras: [
            "Din app skal tale sammen med de værktøjer, du allerede bruger — bookingsystemer, lager, CRM, betaling. Vi bygger forbindelserne, så informationen flyder automatisk, uden manuel indtastning og uden huller mellem systemerne.",
          ],
        },
        {
          title: "Agentic Automations",
          teaser: "Software, der fungerer som ekstra medarbejdere: de læser, vurderer og handler selv — også mens du sover.",
          paras: [
            "De fleste programmer venter på, at du fortæller dem, hvad de skal gøre. Det gør en agent ikke — den læser, hvad der kommer ind, vurderer, hvad der skal ske, og handler selv, ligesom en god medarbejder ville gøre.",
            "Forestil dig: en kunde skriver en mail klokken 23:47 og spørger, om du har tid næste tirsdag. Normalt ville den mail ligge, til du tjekker den næste morgen — og kunden har måske allerede booket et andet sted. Med en agent, der overvåger din indbakke, bliver beskeden læst på sekunder, tjekket op mod din faktiske kalender, besvaret på kundens eget sprog, og bookes ind — inden du overhovedet er vågnet. Intet mistet kundeemne, ingen morgenstress.",
            "Det er det tætteste, du kommer på at ansætte ekstra personale, der arbejder hele døgnet, aldrig melder sig syge, og koster prisen på softwaren — ikke endnu en lønseddel.",
          ],
        },
        {
          title: "Vækst & optimering",
          teaser: "Efter lancering fortsætter vi med at finpudse: performance, brugsmønstre og de funktioner, der rent faktisk gør en forskel.",
          paras: [
            "Lancering er begyndelsen, ikke slutningen. Vi følger den faktiske brug, finder friktionspunkter, og fortsætter med at forbedre appen — så den bliver bedre i takt med, at din forretning vokser.",
          ],
        },
      ],
      closing: "Er du i tvivl om, hvilken af disse der passer til din forretning?",
      closingCta: "Book et møde, så finder vi ud af det sammen",
    },
    process: {
      label: "Sådan arbejder vi",
      headline: "Fra første møde til lancering — og videre",
      steps: [
        {
          title: "Afdækning",
          body: "Vi lærer din forretning, dine kunder og den problemstilling, der er værd at løse, at kende, før et eneste skærmbillede designes.",
        },
        {
          title: "Design",
          body: "Hver side designes med fokus på klarhed, skønhed og hastighed, og finpudses sammen med dig, indtil det er rigtigt.",
        },
        {
          title: "Udvikling",
          body: "Ren, testet og vedligeholdelsesvenlig kode — bygget til at holde, ikke bare til at se godt ud til en demo.",
        },
        {
          title: "Lancering & vækst",
          body: "Vi følger med efter lancering, holder øje med den faktiske brug, og udvikler appen i takt med din forretning.",
        },
      ],
    },
    ctaBand: {
      headline: "Lad os tale om, hvad din forretning har brug for.",
      sub: "Ingen forpligtelser, ingen standardsalgstale — bare en snak om den udfordring, du står med.",
      book: "Book et møde",
      call: `Ring på ${PHONE}`,
    },
    about: {
      label: "Hvem vi er",
      headline: "Et studie, ikke et bureau-maskineri",
      p1: "Virtus Nordic drives af mig — Alexander Estrada Magnussen, selvstændig udvikler baseret i Aalborg, som løser hver eneste opgave personligt frem for at sende den gennem kontoansvarlige og juniorer.",
      p2: "Det er et bevidst valg. Det betyder færre kunder, men det betyder også, at enhver virksomhed, jeg arbejder med, har direkte adgang til den person, der rent faktisk skriver koden — og den person, de faktisk taler med. Ingen mellemled.",
      philosophyLabel: "Filosofi",
      quote: "\u201cVi bygger de applikationer, din forretning fortjener — præcise, gennemtænkte og bygget til at holde.\u201d",
      p3: "De fleste virksomheder har ikke brug for mere software. De har brug for den rigtige software — bygget efter, hvordan de rent faktisk arbejder, ikke efter, hvad der er hurtigst at sætte op fra en skabelon. Det er den standard, ethvert Virtus Nordic-projekt måles på.",
      localLabel: "Hvorfor lokalt",
      p4: "Danske lokale virksomheder bliver ofte overset af en branche bygget til volumen. Virtus Nordic findes for de virksomheder, der ønsker en samarbejdspartner, som forstår det danske marked og deres specifikke forretning, mødes fysisk, og stadig er der et år efter lancering.",
    },
    contact: {
      headline: "Lad os tale sammen",
      sub: "Fortæl os om din forretning, og hvad du gerne vil løse. Vi vender personligt tilbage — ikke med et standardsvar.",
      emailLabel: "Email",
      phoneLabel: "Telefon",
      basedLabel: "Baseret i",
      based: "Aalborg, Danmark",
      form: {
        name: "Navn",
        company: "Virksomhed",
        email: "Email",
        phone: "Telefon",
        message: "Besked",
        send: "Send besked",
        note: "Knappen åbner dit mailprogram med beskeden klar til afsendelse.",
      },
      mailSubject: "Henvendelse via virtusnordic.com",
    },
    footer: {
      rights: "Alle rettigheder forbeholdes",
      tagline: "Mobilapplikationer der får din forretning til at vokse",
    },
  },
  en: {
    meta: {
      home: {
        title: "Virtus Nordic — Mobile Applications for Business Growth",
        description:
          "Boutique development studio in Aalborg, Denmark. Custom apps, system integration and AI agents for Danish businesses.",
      },
      about: {
        title: "About — Virtus Nordic",
        description: "A studio, not an agency machine. Direct access to the person actually building your app.",
      },
      services: {
        title: "Services — Virtus Nordic",
        description: "Custom mobile applications, system integration, agentic automations and ongoing optimisation.",
      },
      contact: {
        title: "Contact — Virtus Nordic",
        description: "Book a meeting with Virtus Nordic in Aalborg. No obligation — just a conversation.",
      },
    },
    nav: { home: "Home", about: "About", services: "Services", contact: "Contact", cta: "Book a Meeting" },
    hero: {
      tagline: "Mobile Applications for Business Growth",
      ctaPrimary: "Book a Meeting",
      ctaSecondary: "View Services",
      scroll: "Scroll",
    },
    intro: {
      quote: "\u201cWe build the applications your business deserves — precise, purposeful, and built to last.\u201d",
      p1: "Virtus Nordic is a boutique mobile development studio based in Aalborg, Denmark. We work with local businesses who understand that a well-crafted application is not an expense — it is infrastructure.",
      p2: "Every engagement begins with understanding your business first. Technology follows from there.",
    },
    craft: {
      label: "The reality",
      headline: "Your customer is always right there — on the screen",
      body: "At the café, on the train, at the desk, late at night. Scroll to follow along.",
      captions: [
        "The average person checks their phone over 90 times a day.",
        "We spend nearly 4 hours a day looking at a screen.",
        "Nearly 1 in 2 people feel uneasy without their phone nearby.",
        "Almost half of us sleep with our phone within arm's reach.",
        "Your customers are already there. Are you?",
      ],
    },
    servicesTeaser: {
      label: "What we do",
      headline: "Four ways we help business work better",
      sub: "We specialise in mobile applications and AI systems that solve real operational problems — not trend-chasing, not templates.",
    },
    services: {
      label: "What we do",
      headline: "Four ways we help your business grow",
      items: [
        {
          title: "Custom Mobile Applications",
          teaser: "Purpose-built apps designed around how your business actually operates, not a generic feature list.",
          paras: [
            "Purpose-built iOS and Android applications, designed from the ground up around your actual workflow. No bloated templates, no unnecessary features — just the app your business needs to run better.",
          ],
        },
        {
          title: "Business System Integration",
          teaser: "Your app connects cleanly to the systems you already run on — no duplicate data entry, no workarounds.",
          paras: [
            "Your app should talk to the tools you already use — booking systems, inventory, CRM, payment processing. We build the connections so information flows automatically, with no manual re-entry and no gaps between systems.",
          ],
        },
        {
          title: "Agentic Automations",
          teaser: "Software that acts like extra staff: it reads, decides, and handles things on its own, even while you sleep.",
          paras: [
            "Most software waits for you to tell it what to do. An agent doesn't — it reads what comes in, decides what needs to happen, and takes the action itself, the same way a good employee would.",
            "Picture this: a customer emails at midnight asking about availability next week. With an agent watching your inbox, that message is read in seconds, checked against your real calendar, replied to in the customer's own language, and booked — before you've even woken up. No missed lead, no 9am scramble.",
            "It's the closest thing to hiring extra staff who work every hour of the day, never call in sick, and cost the price of the software — not another salary.",
          ],
        },
        {
          title: "Growth & Optimisation",
          teaser: "Once live, we keep refining: performance, usage patterns, and the features that actually move the needle.",
          paras: [
            "Launch is the beginning, not the finish line. We monitor real usage, identify friction points, and continue improving the app — so it keeps getting better as your business grows.",
          ],
        },
      ],
      closing: "Not sure which of these fits your business?",
      closingCta: "Book a meeting and we'll figure it out together",
    },
    process: {
      label: "How we work",
      headline: "From first meeting to launch — and beyond",
      steps: [
        {
          title: "Discovery",
          body: "We learn your business, your customers, and the problem worth solving before a single screen is designed.",
        },
        {
          title: "Design",
          body: "Every screen is drafted around clarity and speed of use, then refined with you until it's right.",
        },
        {
          title: "Build",
          body: "Clean, tested, maintainable code — built to run reliably, not just to demo well.",
        },
        {
          title: "Launch & Grow",
          body: "We stay involved after launch, tracking real usage and improving the app as your business grows.",
        },
      ],
    },
    ctaBand: {
      headline: "Let's talk about what your business needs.",
      sub: "No obligation, no generic pitch — just a conversation about the problem you're trying to solve.",
      book: "Book a Meeting",
      call: `Call ${PHONE}`,
    },
    about: {
      label: "Who we are",
      headline: "A studio, not an agency machine",
      p1: "Virtus Nordic is run by me — Alexander Estrada Magnussen, a solo developer based in Aalborg who builds every project personally rather than routing it through account managers and junior staff.",
      p2: "That's a deliberate choice. It means fewer clients, but it means every business I work with gets direct access to the person actually writing the code — and the person they're actually talking to. No layers in between.",
      philosophyLabel: "Philosophy",
      quote: "\u201cWe build the applications your business deserves — precise, purposeful, and built to last.\u201d",
      p3: "Most businesses don't need more software. They need the right software — built around how they actually work, not around what's fastest to template. That's the standard every Virtus Nordic project is held to.",
      localLabel: "Why local",
      p4: "Denmark's local businesses are underserved by an industry built for volume. Virtus Nordic exists for the businesses that want a partner who understands the Danish market and their specific business, meets in person, and is still there a year after launch.",
    },
    contact: {
      headline: "Let's talk",
      sub: "Tell us about your business and what you're trying to solve. We'll get back to you personally — not a form-letter reply.",
      emailLabel: "Email",
      phoneLabel: "Phone",
      basedLabel: "Based in",
      based: "Aalborg, Denmark",
      form: {
        name: "Name",
        company: "Company",
        email: "Email",
        phone: "Phone",
        message: "Message",
        send: "Send message",
        note: "The button opens your mail client with the message ready to send.",
      },
      mailSubject: "Enquiry via virtusnordic.com",
    },
    footer: {
      rights: "All rights reserved",
      tagline: "Mobile Applications for Business Growth",
    },
  },
};
