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
  booking: {
    title: string;
    intro: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    date: string;
    timeslot: string;
    slots: { morning: string; afternoon: string };
    message: string;
    submit: string;
    sending: string;
    successTitle: string;
    successBody: string;
    error: string;
    close: string;
  };
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
    founderName: string;
    founderRole: string;
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
        title: "Virtus Nordic · Mobilapplikationer og redskaber der får din forretning til at vokse",
        description:
          "Boutique-udviklingsstudie i Aalborg. Skræddersyede apps, systemintegration og AI-agenter til danske virksomheder.",
      },
      about: {
        title: "Om mig · Virtus Nordic",
        description: "Et studie, ikke et bureau-maskineri. Direkte adgang til den person, der bygger din app.",
      },
      services: {
        title: "Ydelser · Virtus Nordic",
        description: "Skræddersyede apps, systemintegration, AI-agenter og løbende optimering.",
      },
      contact: {
        title: "Kontakt · Virtus Nordic",
        description: "Book et møde med Virtus Nordic i Aalborg. Ingen forpligtelser, bare en snak.",
      },
    },
    nav: { home: "Forside", about: "Om mig", services: "Ydelser", contact: "Kontakt", cta: "Book et møde" },
    hero: {
      tagline: "Mobilapplikationer og redskaber der får din forretning til at vokse",
      ctaPrimary: "Book et møde",
      ctaSecondary: "Se mine ydelser",
      scroll: "Scroll",
    },
    intro: {
      quote: "“Jeg bygger de applikationer, din forretning fortjener. Præcise, gennemtænkte og bygget til at holde.”",
      p1: "Virtus Nordic er et udviklingsstudie baseret i Aalborg. Jeg arbejder med lokale virksomheder, der forstår, at en gennemført app ikke er en luksus. Det er infrastruktur.",
      p2: "Ethvert samarbejde starter med at forstå din forretning dybt og omfattende, og nøjagtigt hvad der gør den unik. Teknologien kommer bagefter.",
    },
    craft: {
      label: "Virkeligheden",
      headline: "Din kunde er der allerede. På skærmen.",
      body: "På cafeen, i toget, ved skrivebordet, sent om aftenen. Scroll for at følge med.",
      captions: [
        "Danskerne bruger 4,4 timer om dagen foran en skærm. Og det er kun i fritiden.",
        "Det svarer til over 1.600 timer om året. Næsten et helt arbejdsår.",
        "Hver tredje dansker føler sig afhængig af sin telefon. Blandt de unge: fire ud af ti.",
        "En dansker bruger 8,6 år af sit liv foran skærmen.",
        "Dine kunder er der allerede. Er du?",
      ],
    },
    servicesTeaser: {
      label: "Det jeg laver",
      headline: "Fire måder, jeg hjælper din forretning på",
      sub: "Jeg er specialist i mobilapplikationer og AI-systemer, der løser reelle udfordringer. Ingen trends, ingen skabeloner.",
    },
    services: {
      label: "Det jeg laver",
      headline: "Fire måder, jeg hjælper din forretning med at vokse",
      items: [
        {
          title: "Skræddersyede apps",
          teaser: "Kode bygget helt fra bunden efter, hvordan din forretning rent faktisk fungerer. Ingen overflødige funktioner, ingen kompromiser.",
          paras: [
            "iOS- og Android-applikationer bygget helt fra bunden efter din faktiske arbejdsgang. Ingen overflødige skabeloner, ingen unødvendige funktioner. Bare den app, din forretning har brug for, for at fungere bedre.",
          ],
        },
        {
          title: "Integration med dine systemer",
          teaser: "Din app taler naturligt sammen med de systemer, du allerede bruger: bookingsystemer, lager og CRM. Ingen dobbeltarbejde.",
          paras: [
            "Din app skal tale sammen med de værktøjer, du allerede bruger: bookingsystemer, lager, CRM og betaling. Jeg bygger forbindelserne, så informationen flyder automatisk, uden manuel indtastning og uden huller mellem systemerne.",
          ],
        },
        {
          title: "Agentic Automations",
          teaser: "Software, der fungerer som ekstra medarbejdere: de læser, vurderer og handler selv, også mens du sover.",
          paras: [
            "De fleste programmer venter på, at du fortæller dem, hvad de skal gøre. Det gør en agent ikke. Den læser, hvad der kommer ind, vurderer, hvad der skal ske, og handler selv, ligesom en god medarbejder ville gøre.",
            "Forestil dig: en kunde skriver en mail klokken 23:47 og spørger, om du har tid næste tirsdag. Normalt ville den mail ligge, til du tjekker den næste morgen, og til da har kunden måske allerede booket et andet sted. Med en agent, der overvåger din indbakke, bliver beskeden læst på sekunder, tjekket op mod din faktiske kalender, besvaret på kundens eget sprog, og booket ind, inden du overhovedet er vågnet. Intet mistet kundeemne, ingen morgenstress.",
            "Det er det tætteste, du kommer på at ansætte ekstra personale, der arbejder hele døgnet, aldrig melder sig syge, og koster prisen på softwaren, ikke endnu en lønseddel.",
          ],
        },
        {
          title: "Vækst & optimering",
          teaser: "Efter lancering fortsætter jeg med at finpudse: performance, brugsmønstre og de funktioner, der rent faktisk gør en forskel.",
          paras: [
            "Lancering er begyndelsen, ikke slutningen. Jeg følger den faktiske brug, finder friktionspunkter, og fortsætter med at forbedre appen, så den vokser i takt med din forretning.",
          ],
        },
      ],
      closing: "Er du i tvivl om, hvilken af disse der passer til din forretning?",
      closingCta: "Book et møde, så finder vi ud af det sammen",
    },
    process: {
      label: "Sådan arbejder jeg",
      headline: "Fra første møde til lancering, og videre",
      steps: [
        {
          title: "Afdækning",
          body: "Jeg lærer din forretning, dine kunder og den problemstilling, der er værd at løse, at kende, før et eneste skærmbillede designes.",
        },
        {
          title: "Design",
          body: "Hver side designes med fokus på klarhed, skønhed og hastighed, og finpudses sammen med dig, indtil det er rigtigt.",
        },
        {
          title: "Udvikling",
          body: "Ren, testet og vedligeholdelsesvenlig kode, bygget til at holde. Ikke bare til at se godt ud til en demo.",
        },
        {
          title: "Lancering & vækst",
          body: "Jeg følger med efter lancering, holder øje med den faktiske brug, og udvikler appen i takt med din forretning.",
        },
      ],
    },
    ctaBand: {
      headline: "Lad os tale om, hvad din forretning har brug for.",
      sub: "Ingen forpligtelser, ingen standardsalgstale. Bare en snak om det, du står med.",
      book: "Book et møde",
      call: `Ring på ${PHONE}`,
    },
    booking: {
      title: "Book et møde",
      intro: "Fortæl mig lidt om dig, så vender jeg tilbage og bekræfter tidspunktet.",
      name: "Navn",
      email: "E-mail",
      phone: "Telefon",
      company: "Virksomhed",
      date: "Ønsket dato",
      timeslot: "Tidsrum",
      slots: { morning: "Formiddag (9–12)", afternoon: "Eftermiddag (12–16)" },
      message: "Hvad vil du gerne tale om?",
      submit: "Send booking",
      sending: "Sender…",
      successTitle: "Tak, din booking er modtaget",
      successBody: "Jeg vender tilbage til dig hurtigst muligt og bekræfter tidspunktet.",
      error: "Noget gik galt. Prøv igen, eller ring til mig direkte.",
      close: "Luk",
    },
    about: {
      label: "Hvem jeg er",
      headline: "Et studie, ikke et bureau-maskineri",
      p1: "Virtus Nordic drives af mig, Alexander Estrada Magnussen. Selvstændig udvikler baseret i Aalborg, som løser hver eneste opgave personligt frem for at sende den gennem kontoansvarlige og juniorer.",
      p2: "Det er et bevidst valg. Det betyder færre kunder, men det betyder også, at enhver virksomhed, jeg arbejder med, har direkte adgang til den person, der skriver koden, og den person, de taler med. Ingen mellemled.",
      philosophyLabel: "Filosofi",
      quote: "“Jeg bygger de applikationer, din forretning fortjener. Præcise, gennemtænkte og bygget til at holde.”",
      p3: "De fleste virksomheder har ikke brug for mere software. De har brug for den rigtige software, bygget efter hvordan de faktisk arbejder, ikke efter hvad der er hurtigst at sætte op fra en skabelon. Det er den standard, ethvert Virtus Nordic-projekt måles på.",
      localLabel: "Hvorfor lokalt",
      p4: "Danske lokale virksomheder bliver ofte overset af en branche bygget til volumen. Virtus Nordic findes for de virksomheder, der ønsker en samarbejdspartner, som forstår det danske marked og deres specifikke forretning, mødes fysisk, og stadig er der et år efter lancering.",
    },
    contact: {
      headline: "Lad os tale sammen",
      sub: "Fortæl mig om din forretning, og hvad du gerne vil løse. Jeg vender personligt tilbage, ikke med et standardsvar.",
      founderName: "Alexander Estrada Magnussen",
      founderRole: "Stifter",
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
      tagline: "Mobilapplikationer og redskaber der får din forretning til at vokse",
    },
  },
  en: {
    meta: {
      home: {
        title: "Virtus Nordic · Mobile Applications for Business Growth",
        description:
          "Boutique development studio in Aalborg, Denmark. Custom apps, system integration and AI agents for Danish businesses.",
      },
      about: {
        title: "About · Virtus Nordic",
        description: "A studio, not an agency machine. Direct access to the person actually building your app.",
      },
      services: {
        title: "Services · Virtus Nordic",
        description: "Custom mobile applications, system integration, agentic automations and ongoing optimisation.",
      },
      contact: {
        title: "Contact · Virtus Nordic",
        description: "Book a meeting with Virtus Nordic in Aalborg. No obligation, just a conversation.",
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
      quote: "“I build the applications your business deserves. Precise, purposeful, and built to last.”",
      p1: "Virtus Nordic is a boutique mobile development studio based in Aalborg, Denmark. I work with local businesses who understand that a well-crafted application is not an expense. It is infrastructure.",
      p2: "Every engagement begins with understanding your business first. Technology follows from there.",
    },
    craft: {
      label: "The reality",
      headline: "Your customer is already there. On the screen.",
      body: "At the café, on the train, at the desk, late at night. Scroll to follow along.",
      captions: [
        "Danes spend 4.4 hours a day in front of a screen. And that's leisure time alone.",
        "That adds up to over 1,600 hours a year. Nearly a full working year.",
        "One in three Danes feels addicted to their phone. Among young adults: four in ten.",
        "A Dane spends 8.6 years of their life looking at a screen.",
        "Your customers are already there. Are you?",
      ],
    },
    servicesTeaser: {
      label: "What I do",
      headline: "Four ways I help your business work better",
      sub: "I specialise in mobile applications and AI systems that solve real operational problems. No trend-chasing, no templates.",
    },
    services: {
      label: "What I do",
      headline: "Four ways I help your business grow",
      items: [
        {
          title: "Custom Mobile Applications",
          teaser: "Purpose-built apps designed around how your business actually operates, not a generic feature list.",
          paras: [
            "Purpose-built iOS and Android applications, designed from the ground up around your actual workflow. No bloated templates, no unnecessary features. Just the app your business needs to run better.",
          ],
        },
        {
          title: "Business System Integration",
          teaser: "Your app connects cleanly to the systems you already run on: no duplicate data entry, no workarounds.",
          paras: [
            "Your app should talk to the tools you already use: booking systems, inventory, CRM and payment processing. I build the connections so information flows automatically, with no manual re-entry and no gaps between systems.",
          ],
        },
        {
          title: "Agentic Automations",
          teaser: "Software that acts like extra staff: it reads, decides, and handles things on its own, even while you sleep.",
          paras: [
            "Most software waits for you to tell it what to do. An agent doesn't. It reads what comes in, decides what needs to happen, and takes the action itself, the same way a good employee would.",
            "Picture this: a customer emails at midnight asking about availability next week. With an agent watching your inbox, that message is read in seconds, checked against your real calendar, replied to in the customer's own language, and booked, all before you've even woken up. No missed lead, no 9am scramble.",
            "It's the closest thing to hiring extra staff who work every hour of the day, never call in sick, and cost the price of the software, not another salary.",
          ],
        },
        {
          title: "Growth & Optimisation",
          teaser: "Once live, I keep refining: performance, usage patterns, and the features that actually move the needle.",
          paras: [
            "Launch is the beginning, not the finish line. I monitor real usage, identify friction points, and continue improving the app, so it keeps getting better as your business grows.",
          ],
        },
      ],
      closing: "Not sure which of these fits your business?",
      closingCta: "Book a meeting and we'll figure it out together",
    },
    process: {
      label: "How I work",
      headline: "From first meeting to launch, and beyond",
      steps: [
        {
          title: "Discovery",
          body: "I learn your business, your customers, and the problem worth solving before a single screen is designed.",
        },
        {
          title: "Design",
          body: "Every screen is drafted around clarity and speed of use, then refined with you until it's right.",
        },
        {
          title: "Build",
          body: "Clean, tested, maintainable code, built to run reliably. Not just to demo well.",
        },
        {
          title: "Launch & Grow",
          body: "I stay involved after launch, tracking real usage and improving the app as your business grows.",
        },
      ],
    },
    ctaBand: {
      headline: "Let's talk about what your business needs.",
      sub: "No obligation, no generic pitch. Just a conversation about the problem you're trying to solve.",
      book: "Book a Meeting",
      call: `Call ${PHONE}`,
    },
    booking: {
      title: "Book a meeting",
      intro: "Tell me a little about you, and I'll get back to you to confirm the time.",
      name: "Name",
      email: "Email",
      phone: "Phone",
      company: "Company",
      date: "Preferred date",
      timeslot: "Time window",
      slots: { morning: "Morning (9–12)", afternoon: "Afternoon (12–16)" },
      message: "What would you like to talk about?",
      submit: "Send booking",
      sending: "Sending…",
      successTitle: "Thank you, your booking is in",
      successBody: "I'll get back to you as soon as possible to confirm the time.",
      error: "Something went wrong. Try again, or call me directly.",
      close: "Close",
    },
    about: {
      label: "Who I am",
      headline: "A studio, not an agency machine",
      p1: "Virtus Nordic is run by me, Alexander Estrada Magnussen. A solo developer based in Aalborg who builds every project personally rather than routing it through account managers and junior staff.",
      p2: "That's a deliberate choice. It means fewer clients, but it means every business I work with gets direct access to the person actually writing the code, and the person they're actually talking to. No layers in between.",
      philosophyLabel: "Philosophy",
      quote: "“I build the applications your business deserves. Precise, purposeful, and built to last.”",
      p3: "Most businesses don't need more software. They need the right software, built around how they actually work, not around what's fastest to template. That's the standard every Virtus Nordic project is held to.",
      localLabel: "Why local",
      p4: "Denmark's local businesses are underserved by an industry built for volume. Virtus Nordic exists for the businesses that want a partner who understands the Danish market and their specific business, meets in person, and is still there a year after launch.",
    },
    contact: {
      headline: "Let's talk",
      sub: "Tell me about your business and what you're trying to solve. I'll get back to you personally, not a form-letter reply.",
      founderName: "Alexander Estrada Magnussen",
      founderRole: "Founder",
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
