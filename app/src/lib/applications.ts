import type { ComponentType, CSSProperties } from "react";
import type { Lang } from "./content";
import { GufKuglerScreen } from "../components/vn/apps/screens/guf-kugler";
import { BarberClubScreen } from "../components/vn/apps/screens/barber-club";
import { AalborgBoxScreen } from "../components/vn/apps/screens/aalborgbox";
import { ElServiceScreen } from "../components/vn/apps/screens/el-service";
import { FysioterapiScreen } from "../components/vn/apps/screens/fysioterapi";

/**
 * The five application concepts shown floating in the hero and expanded in the
 * #applikationer section.
 *
 * One source of truth: every phone in the hero, every tab in the section and
 * every screen is rendered from this array. Nothing about a specific concept is
 * hardcoded in a component.
 *
 * IMPORTANT (legal): these are independent concept studies. No real logo,
 * photograph, website design or other branded asset is reproduced anywhere.
 * Every screen is drawn with original CSS/SVG and typography-led wordmarks.
 */

/** A string in both site languages. Mirrors the shape of src/lib/content.ts. */
export type L10n = Record<Lang, string>;

export const pick = (value: L10n, lang: Lang): string => value[lang];

export type ValueItem = { label: L10n; body: L10n };

/** Hero placement. Percentages are of the hero field box; `w` is the screen
 *  width in px at scale 1 (screens are authored on a 390x844 stage). */
export type FloatSpec = {
  x: number;
  y: number;
  w: number;
  /** Base 2D rotation, degrees. */
  rot: number;
  /** 0 (far back, hazy, small parallax) .. 1 (front, sharp, full parallax). */
  depth: number;
  /** Drift keyframe variant, 1..5 — each phone gets its own path. */
  drift: 1 | 2 | 3 | 4 | 5;
  /** Drift duration in seconds, and its negative start offset (desynchronises). */
  dur: number;
  delay: number;
};

export type AppConcept = {
  id: string;
  /** Typography-led representation of the business name. Not a logo. */
  name: string;
  category: L10n;
  /** One-line value proposition revealed on hover/focus in the hero. */
  valueLine: L10n;
  problem: L10n;
  journey: L10n[];
  features: L10n[];
  technical: L10n[];
  value: ValueItem[];
  /** Screen-scoped custom properties. Never leaks outside the device glass. */
  theme: CSSProperties;
  float: FloatSpec;
  Screen: ComponentType;
};

export const APPLICATIONS: AppConcept[] = [
  /* ─────────────────────────── 1 · Guf & Kugler ─────────────────────────── */
  {
    id: "guf-kugler",
    name: "Guf & Kugler",
    category: {
      da: "Mad og takeaway-handel",
      en: "Food and takeaway commerce",
    },
    valueLine: {
      da: "Dagens kugler, forudbestilling og en klub der får kunden tilbage i næste uge.",
      en: "Today's scoops, pre-orders and a club that brings the customer back next week.",
    },
    problem: {
      da: "Om sommeren står køen ud af døren, mens telefonen ringer med spørgsmål om åbningstid og dagens smage. Smagene skifter hver dag, tavlen på væggen er det eneste sted de står, og der findes ingen måde at belønne de gæster der kommer hver uge.",
      en: "In summer the queue runs out the door while the phone rings with questions about opening hours and today's flavours. The flavours change daily, the board on the wall is the only place they exist, and there is no way to reward the guests who come every week.",
    },
    journey: [
      {
        da: "Gæsten ser dagens kugler hjemme fra sofaen",
        en: "The guest sees today's scoops from the sofa at home",
      },
      {
        da: "Bygger sin egen is, kugle for kugle, med tilvalg",
        en: "Builds their own cone, scoop by scoop, with extras",
      },
      { da: "Betaler og vælger et afhentningsvindue", en: "Pays and picks a collection window" },
      {
        da: "Henter uden kø og får point i klubben",
        en: "Collects without queueing and earns club points",
      },
    ],
    features: [
      {
        da: "Dagens smage, opdateret fra disken",
        en: "Daily flavours, updated from behind the counter",
      },
      { da: "Ordre-bygger til egne kombinationer", en: "Order builder for custom combinations" },
      { da: "Click and collect med tidsvindue", en: "Click and collect with a time window" },
      { da: "Loyalitetsklub med point og niveauer", en: "Loyalty club with points and tiers" },
      {
        da: "Gavekort til køb og indløsning i appen",
        en: "Gift cards, bought and redeemed in the app",
      },
      { da: "Booking af events og Mini-Isbar", en: "Event and Mini-Isbar bookings" },
    ],
    technical: [
      {
        da: "Menustyring i realtid, så en smag kan lukkes på ti sekunder midt i rushet",
        en: "Real-time menu control, so a flavour can be closed in ten seconds mid-rush",
      },
      {
        da: "Kort, MobilePay og gavekort i samme betalingsflow",
        en: "Card, MobilePay and gift cards in one payment flow",
      },
      {
        da: "Kapacitetsstyrede afhentningsvinduer pr. femten minutter",
        en: "Capacity-managed collection windows in fifteen-minute slots",
      },
      {
        da: "Push-besked når dagens smage lægges op",
        en: "Push notification when the day's flavours go live",
      },
      {
        da: "Point og medlemsniveauer beregnet på serveren, ikke i appen",
        en: "Points and tiers calculated on the server, not in the app",
      },
      {
        da: "Kassesystem og lager holdes synkront, så udsolgt betyder udsolgt",
        en: "Till and stock stay in sync, so sold out means sold out",
      },
    ],
    value: [
      {
        label: { da: "Kortere kø i spidsbelastningen", en: "Shorter queues at peak" },
        body: {
          da: "Forudbetalte ordrer flyttes ud af kassekøen og ind i et afhentningsvindue.",
          en: "Pre-paid orders move out of the till queue and into a collection window.",
        },
      },
      {
        label: { da: "Højere gennemsnitsordre", en: "Higher average order" },
        body: {
          da: "Tilvalg og topping foreslås i bygge-flowet i stedet for at blive glemt ved disken.",
          en: "Extras and toppings are offered in the build flow instead of being forgotten at the counter.",
        },
      },
      {
        label: { da: "Genkøb der kan måles", en: "Repeat business you can measure" },
        body: {
          da: "Klubben viser hvem der kommer igen, hvor ofte, og hvad der får dem tilbage.",
          en: "The club shows who returns, how often, and what brings them back.",
        },
      },
    ],
    theme: {
      "--app-bg": "#fdf6ec",
      "--app-surface": "#ffffff",
      "--app-ink": "#3a2118",
      "--app-ink-soft": "#8a6a5b",
      "--app-accent": "#c2185b",
      "--app-accent-2": "#7cb342",
      "--app-accent-3": "#f2b705",
      "--app-radius": "20px",
      "--app-line": "rgba(58, 33, 24, 0.1)",
      "--app-font-display": '"Jost", "Segoe UI", sans-serif',
      "--app-font-ui": '"Jost", "Segoe UI", sans-serif',
    } as CSSProperties,
    float: { x: 14, y: 30, w: 168, rot: -8, depth: 1, drift: 1, dur: 19, delay: -2 },
    Screen: GufKuglerScreen,
  },

  /* ──────────────────────────── 2 · Barber Club ─────────────────────────── */
  {
    id: "barber-club",
    name: "Barber Club",
    category: {
      da: "Booking og medlemskaber",
      en: "Appointments and memberships",
    },
    valueLine: {
      da: "Medlemskabet i lommen, klip tilbage på kortet og næste tid der bekræfter sig selv.",
      en: "The membership in your pocket, treatments left on the card, and a next booking that confirms itself.",
    },
    problem: {
      da: "Bookinger kommer ind på fire kanaler, og udeblivelser koster en hel stol en hel time. De faste kunder er butikkens fundament, men der findes ingen medlemsordning der binder dem, og ingen fortæller dem hvornår deres barber har en ledig tid.",
      en: "Bookings arrive through four channels, and a no-show costs a full chair for a full hour. Regulars are the shop's foundation, but there is no membership tying them in, and nobody tells them when their barber has an opening.",
    },
    journey: [
      {
        da: "Kunden vælger barber ud fra portfolio og stil",
        en: "The client picks a barber from portfolio and style",
      },
      {
        da: "Booker eller bruger et klip fra medlemskabet",
        en: "Books, or spends a treatment from the membership",
      },
      { da: "Checker ind digitalt ved ankomst", en: "Checks in digitally on arrival" },
      {
        da: "Bliver mindet om genbooking og anbefalede produkter",
        en: "Gets a rebooking nudge and product recommendations",
      },
    ],
    features: [
      {
        da: "Booking med valg af barber og behandling",
        en: "Booking with barber and treatment selection",
      },
      { da: "Portfolio pr. barber, egne billeder", en: "Portfolio per barber, own photography" },
      { da: "Medlemskaber med månedligt træk", en: "Memberships with monthly billing" },
      { da: "Digitalt check-in i stolen", en: "Digital check-in at the chair" },
      { da: "Behandlingssaldo og historik", en: "Treatment balance and history" },
      { da: "Genbooking og produktanbefalinger", en: "Rebooking and product recommendations" },
    ],
    technical: [
      {
        da: "Kalender pr. stol med behandlingslængder og pauser",
        en: "Per-chair calendar with treatment durations and breaks",
      },
      {
        da: "Abonnementsbetaling med automatisk fornyelse og pause",
        en: "Subscription billing with automatic renewal and pausing",
      },
      {
        da: "Saldostyring, så et klip trækkes ved check-in og ikke ved booking",
        en: "Balance handling, so a treatment is spent at check-in, not at booking",
      },
      {
        da: "Påmindelser der reelt reducerer udeblivelser, med afbudsliste",
        en: "Reminders that actually cut no-shows, with a waiting list",
      },
      { da: "Apple Wallet-kort til medlemskabet", en: "Apple Wallet pass for the membership" },
      {
        da: "Rapport pr. barber på belægning og genbooking",
        en: "Per-barber reporting on utilisation and rebooking",
      },
    ],
    value: [
      {
        label: { da: "Færre tomme stole", en: "Fewer empty chairs" },
        body: {
          da: "Afbud tilbydes automatisk til afbudslisten i stedet for at stå ubesat.",
          en: "Cancellations go to the waiting list automatically instead of sitting empty.",
        },
      },
      {
        label: { da: "Forudsigelig omsætning", en: "Predictable revenue" },
        body: {
          da: "Medlemskaber flytter en del af omsætningen fra tilfældig trafik til faste træk.",
          en: "Memberships shift part of revenue from walk-in chance to recurring billing.",
        },
      },
      {
        label: { da: "Højere frekvens hos de faste", en: "Higher frequency among regulars" },
        body: {
          da: "Genbooking foreslås mens kunden stadig sidder i stolen.",
          en: "Rebooking is offered while the client is still in the chair.",
        },
      },
    ],
    theme: {
      "--app-bg": "#191512",
      "--app-surface": "#241d18",
      "--app-ink": "#f2e7d8",
      "--app-ink-soft": "#a3907c",
      "--app-accent": "#b87333",
      "--app-accent-2": "#3d2c22",
      "--app-accent-3": "#e8d5bc",
      "--app-radius": "4px",
      "--app-line": "rgba(184, 115, 51, 0.22)",
      "--app-font-display": '"Cormorant Garamond", Georgia, serif',
      "--app-font-ui": '"Jost", "Segoe UI", sans-serif',
    } as CSSProperties,
    float: { x: 24, y: 88, w: 126, rot: 7, depth: 0.5, drift: 2, dur: 26, delay: -11 },
    Screen: BarberClubScreen,
  },

  /* ───────────────────────────── 3 · AalborgBox ─────────────────────────── */
  {
    id: "aalborgbox",
    name: "AalborgBox",
    category: {
      da: "Bookbar kapacitet og logistik",
      en: "Bookable capacity and logistics",
    },
    valueLine: {
      da: "Ledig plads, anbefalet størrelse og adgang på telefonen, uden et kontor i midten.",
      en: "Available space, a recommended size and access on the phone, with no office in the middle.",
    },
    problem: {
      da: "Kunden ved ikke hvor mange kvadratmeter et hjem på 80 kvadratmeter fylder, og gætter derfor for stort eller for småt. Kontrakter skrives i hånden, nøgler udleveres i åbningstiden, og ledig kapacitet står tom fordi ingen udefra kan se den.",
      en: "Customers have no idea how many square metres an 80 m² home takes up, so they guess too big or too small. Contracts are written by hand, keys are handed over during office hours, and free capacity sits empty because nobody outside can see it.",
    },
    journey: [
      {
        da: "Kunden svarer på fire spørgsmål om hvad der skal opmagasineres",
        en: "The customer answers four questions about what needs storing",
      },
      {
        da: "Får en anbefalet størrelse og ser den på plantegningen",
        en: "Gets a recommended size and sees it on the floor plan",
      },
      {
        da: "Lejer og betaler, kontrakten signeres digitalt",
        en: "Rents and pays, signing the contract digitally",
      },
      {
        da: "Lukker sig ind med adgangsbeviset på telefonen",
        en: "Lets themselves in with the access pass on their phone",
      },
    ],
    features: [
      {
        da: "Størrelsesanbefaling ud fra kundens egne svar",
        en: "Size recommendation from the customer's own answers",
      },
      { da: "Kort og plantegning med ledige bokse", en: "Map and floor plan of available units" },
      { da: "Leje og betaling i appen", en: "Rental and payment in the app" },
      { da: "Digital adgang til port og dør", en: "Digital access to gate and door" },
      { da: "Kontrakter og fakturaer samlet ét sted", en: "Contracts and invoices in one place" },
      {
        da: "Indholdsfortegnelse og erhvervskonti",
        en: "Inventory catalogue and business accounts",
      },
    ],
    technical: [
      {
        da: "Kapacitetsmodel pr. lokation, størrelse og periode",
        en: "Capacity model per location, size and period",
      },
      {
        da: "Anbefaling ud fra et regelsæt på kundens svar, aldrig et gæt der ikke kan forklares",
        en: "Recommendation from a rule set over the customer's answers, never an unexplainable guess",
      },
      {
        da: "Adgangsbevis med tidsbegrænsede nøgler og fuld log",
        en: "Access pass with time-limited keys and a full audit log",
      },
      { da: "Digital signatur på lejekontrakt", en: "Digital signature on the rental agreement" },
      {
        da: "Abonnementsfakturering med automatisk rykkerflow",
        en: "Subscription invoicing with an automatic dunning flow",
      },
      {
        da: "Erhvervskonti med flere brugere pr. virksomhed",
        en: "Business accounts with several users per company",
      },
    ],
    value: [
      {
        label: { da: "Højere belægning", en: "Higher occupancy" },
        body: {
          da: "Ledig kapacitet er synlig og bookbar døgnet rundt, ikke kun i åbningstiden.",
          en: "Free capacity is visible and bookable around the clock, not just during office hours.",
        },
      },
      {
        label: { da: "Færre forkerte størrelser", en: "Fewer wrong sizes" },
        body: {
          da: "Anbefalingen reducerer flytninger, kreditnotaer og utilfredse opsigelser.",
          en: "The recommendation cuts internal moves, credit notes and unhappy cancellations.",
        },
      },
      {
        label: { da: "Administration uden fremmøde", en: "Admin without a front desk" },
        body: {
          da: "Kontrakt, betaling og adgang klares uden at nogen skal møde nogen.",
          en: "Contract, payment and access are handled without anyone meeting anyone.",
        },
      },
    ],
    theme: {
      "--app-bg": "#f4f6f9",
      "--app-surface": "#ffffff",
      "--app-ink": "#111827",
      "--app-ink-soft": "#64748b",
      "--app-accent": "#1d4ed8",
      "--app-accent-2": "#0f9d58",
      "--app-accent-3": "#cbd5e1",
      "--app-radius": "8px",
      "--app-line": "#e2e8f0",
      "--app-font-display": '"Jost", "Segoe UI", sans-serif',
      "--app-font-ui": '"Jost", "Segoe UI", sans-serif',
    } as CSSProperties,
    float: { x: 86, y: 31, w: 160, rot: 9, depth: 0.92, drift: 3, dur: 21, delay: -6 },
    Screen: AalborgBoxScreen,
  },

  /* ─────────────────────── 4 · Aalborg El-service ───────────────────────── */
  {
    id: "el-service",
    name: "Aalborg El-service",
    category: {
      da: "Serviceopgaver i marken",
      en: "Field service operations",
    },
    valueLine: {
      da: "Fra opkald til udført sag, med kundens billeder og elektrikerens tid samlet ét sted.",
      en: "From first call to finished job, with the customer's photos and the electrician's time in one place.",
    },
    problem: {
      da: "En fejlmelding over telefonen bliver til en gul seddel, og elektrikeren kører ud uden at vide hvad han møder. Kunden ved ikke hvornår nogen kommer, tilbud ligger i en mailtråd, og dokumentationen findes kun i hovedet på den der var der.",
      en: "A fault reported over the phone becomes a sticky note, and the electrician drives out without knowing what he is walking into. The customer has no idea when someone is coming, quotes live in an email thread, and the documentation exists only in the head of whoever was there.",
    },
    journey: [
      {
        da: "Kunden beskriver fejlen med billede, video eller indtalt besked",
        en: "The customer describes the fault with a photo, video or voice note",
      },
      {
        da: "Systemet foreslår kategori, sted og hastegrad til godkendelse",
        en: "The system suggests category, location and urgency for approval",
      },
      {
        da: "Tilbud godkendes digitalt, og et tidsrum lægges fast",
        en: "The quote is approved digitally and a time slot is booked",
      },
      {
        da: "Kunden følger elektrikeren frem og får rapporten bagefter",
        en: "The customer follows the electrician's ETA and gets the report afterwards",
      },
    ],
    features: [
      { da: "Fejlmelding på under et minut", en: "Fault reporting in under a minute" },
      {
        da: "Billede, video og indtalt besked på sagen",
        en: "Photo, video and voice notes attached to the case",
      },
      { da: "Tilbud til digital godkendelse", en: "Quotes for digital approval" },
      { da: "Planlægning og live ETA på elektrikeren", en: "Scheduling and live technician ETA" },
      {
        da: "Ejendomsoverblik med historik pr. adresse",
        en: "Property overview with history per address",
      },
      {
        da: "Dokumentation, servicerapport og elektrikerens arbejdsflade",
        en: "Documentation, service report and the technician's workspace",
      },
    ],
    technical: [
      {
        da: "Struktureret indtagning: fritekst, billede og lyd bliver felter, ikke en mailtråd",
        en: "Structured intake: free text, image and audio become fields, not an email thread",
      },
      {
        da: "Kategoriforslag som elektrikeren godkender eller retter. Appen stiller ingen diagnose og vurderer ikke elsikkerhed",
        en: "Category suggestions the electrician approves or corrects. The app makes no diagnosis and does not assess electrical safety",
      },
      {
        da: "Ruteplanlægning med opdateret ankomstvindue til kunden",
        en: "Route planning with a live arrival window for the customer",
      },
      {
        da: "Tilbud med versionering og digital godkendelse",
        en: "Quotes with versioning and digital approval",
      },
      {
        da: "Offline-tilstand i arbejdsfladen, for kældre uden dækning",
        en: "Offline mode in the workspace, for basements without coverage",
      },
      {
        da: "Servicerapport med tid, materialer og billeder, arkiveret pr. adresse",
        en: "Service report with hours, materials and photos, archived per address",
      },
    ],
    value: [
      {
        label: { da: "Flere sager pr. dag", en: "More jobs per day" },
        body: {
          da: "Elektrikeren kører ud forberedt, med de rigtige materialer på bilen.",
          en: "The electrician drives out prepared, with the right materials on the van.",
        },
      },
      {
        label: { da: "Mindre administration pr. sag", en: "Less admin per job" },
        body: {
          da: "Rapport og timer registreres på stedet i stedet for på kontoret om aftenen.",
          en: "Report and hours are logged on site instead of at the office in the evening.",
        },
      },
      {
        label: { da: "Hurtigere godkendte tilbud", en: "Faster quote approvals" },
        body: {
          da: "Kunden kan godkende fra telefonen, samme dag som tilbuddet sendes.",
          en: "The customer can approve from their phone, the same day the quote goes out.",
        },
      },
    ],
    theme: {
      "--app-bg": "#ffffff",
      "--app-surface": "#f1f5f9",
      "--app-ink": "#0f172a",
      "--app-ink-soft": "#64748b",
      "--app-accent": "#1554f0",
      // Safety orange, darkened until it clears WCAG AA on white. Restraint is
      // the point: it appears on exactly one thing, the urgency field.
      "--app-accent-2": "#c25406",
      "--app-accent-3": "#dbe3ec",
      "--app-radius": "10px",
      "--app-line": "#e5eaf2",
      "--app-font-display": '"Jost", "Segoe UI", sans-serif',
      "--app-font-ui": "ui-monospace, SFMono-Regular, Menlo, monospace",
    } as CSSProperties,
    float: { x: 77, y: 86, w: 130, rot: -6, depth: 0.62, drift: 4, dur: 24, delay: -15 },
    Screen: ElServiceScreen,
  },

  /* ─────────────────────── 5 · Aalborg Fysioterapi ──────────────────────── */
  {
    id: "fysioterapi",
    name: "Aalborg Fysioterapi",
    category: {
      da: "Behandling og klientforløb",
      en: "Treatment and client progress",
    },
    valueLine: {
      da: "Dagens øvelser, klientens egne registreringer og et forløb der er let at følge med i.",
      en: "Today's exercises, the client's own check-ins, and a course of treatment that is easy to follow.",
    },
    problem: {
      da: "Øvelserne bliver givet med i klinikken på et stykke papir, og halvdelen er glemt inden torsdag. Behandleren ved ikke hvad der er lavet mellem to konsultationer, og klienten kan ikke se om det går fremad.",
      en: "Exercises are handed out on a sheet of paper at the clinic, and half of them are forgotten by Thursday. The therapist has no idea what was done between two sessions, and the client cannot see whether things are improving.",
    },
    journey: [
      {
        da: "Behandleren sætter planen efter konsultationen",
        en: "The therapist sets the plan after the session",
      },
      {
        da: "Klienten åbner dagens program og ser øvelsen udført",
        en: "The client opens today's programme and sees the exercise performed",
      },
      {
        da: "Registrerer selv hvad der er lavet, og hvordan det føltes",
        en: "Logs what was done, and how it felt",
      },
      {
        da: "Følger sin egen kurve og booker næste tid",
        en: "Follows their own curve and books the next appointment",
      },
    ],
    features: [
      { da: "Behandlingsplan lagt af behandleren", en: "Treatment plan set by the therapist" },
      {
        da: "Videoøvelser med tempo og gentagelser",
        en: "Video exercises with tempo and repetitions",
      },
      {
        da: "Daglige check-ins, klientens egne ord",
        en: "Daily check-ins, in the client's own words",
      },
      { da: "Fremgang over tid, selvregistreret", en: "Progress over time, self-reported" },
      { da: "Tider og holdtræning", en: "Appointments and group classes" },
      { da: "Sikker kanal til praktiske spørgsmål", en: "Secure channel for practical questions" },
    ],
    technical: [
      {
        da: "Planer bygget af behandleren ud fra et øvelsesbibliotek, aldrig genereret automatisk",
        en: "Plans built by the therapist from an exercise library, never generated automatically",
      },
      {
        da: "Klientens registreringer er selvrapporterede data, ikke en måling eller en diagnose",
        en: "Client check-ins are self-reported data, not a measurement or a diagnosis",
      },
      {
        da: "Videoafspilning der virker offline i træningscenteret",
        en: "Video playback that works offline at the gym",
      },
      {
        da: "Booking af tider og hold med venteliste",
        en: "Appointment and class booking with a waiting list",
      },
      {
        da: "Beskedkanal til praktiske spørgsmål, med tydelig henvisning til klinikken og lægevagten ved akutte gener",
        en: "Messaging for practical questions, pointing clearly to the clinic or emergency care for acute symptoms",
      },
      {
        da: "Samtykke, dataminimering og sletning efter aftale med klinikken",
        en: "Consent, data minimisation and deletion per the clinic's policy",
      },
    ],
    value: [
      {
        label: { da: "Højere gennemførsel", en: "Better adherence" },
        body: {
          da: "Programmet ligger i lommen, med påmindelser på de dage der plejer at glide.",
          en: "The programme lives in the client's pocket, with reminders on the days that usually slip.",
        },
      },
      {
        label: { da: "Bedre forberedte konsultationer", en: "Better prepared sessions" },
        body: {
          da: "Behandleren kan se hvad der er registreret siden sidst, før klienten sætter sig.",
          en: "The therapist can see what has been logged since last time, before the client sits down.",
        },
      },
      {
        label: { da: "Færre aflyste tider", en: "Fewer cancelled appointments" },
        body: {
          da: "Tider, hold og venteliste ligger samme sted som programmet.",
          en: "Appointments, classes and the waiting list live in the same place as the programme.",
        },
      },
    ],
    theme: {
      "--app-bg": "#fbf8f2",
      "--app-surface": "#ffffff",
      "--app-ink": "#26332f",
      "--app-ink-soft": "#6a7a74",
      "--app-accent": "#2f7d63",
      "--app-accent-2": "#7ea8c4",
      "--app-accent-3": "#e6efe9",
      "--app-radius": "16px",
      "--app-line": "rgba(38, 51, 47, 0.1)",
      "--app-font-display": '"Jost", "Segoe UI", sans-serif',
      "--app-font-ui": '"Jost", "Segoe UI", sans-serif',
    } as CSSProperties,
    float: { x: 6, y: 66, w: 136, rot: 4, depth: 0.74, drift: 5, dur: 23, delay: -18 },
    Screen: FysioterapiScreen,
  },
];

export const findApplication = (id: string): AppConcept =>
  APPLICATIONS.find((a) => a.id === id) ?? APPLICATIONS[0];
