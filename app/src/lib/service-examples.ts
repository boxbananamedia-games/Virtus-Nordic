import type { L10n } from "./applications";

/**
 * One worked example per service, for the three that are not the app build.
 *
 * The apps have five concept studies to point at. Integration, automation and
 * the ongoing engagement had nothing — they were described in the abstract,
 * which is the hardest kind of work to sell, because the buyer cannot picture
 * what they would be paying for.
 *
 * ── Why these are archetypes, not named businesses ───────────────────────
 * The five app concepts name real companies, each of which gave permission.
 * Nobody has given permission for these, so naming anyone — or inventing a
 * name plausible enough to be mistaken for a real local firm — would be
 * dishonest in exactly the way the apps section is careful not to be. Each
 * example is a sector and a size instead.
 *
 * ── Why the numbers are ranges, and labelled ─────────────────────────────
 * The figures come from published 2026 Danish market analysis of SMEs on
 * Business Central / e-conomic with Outlook and a CRM — the same source
 * pattern for order handling, support load and reporting time. They are what
 * this kind of work typically returns, NOT results Virtus Nordic has measured
 * for a client. `effectNote` says so on the page, in both languages, and must
 * stay: the apps section carries the same discipline about its own value
 * claims, and one unlabelled number would undermine both.
 */

export type ServiceExample = {
  /** Which service this belongs to — index into content.services.items. */
  serviceIndex: number;
  /** The example's own title. A situation, not a product name. */
  title: L10n;
  /** The business, as a sector and a size. Never a name. */
  who: L10n;
  /** What the working day looks like before. */
  problem: L10n;
  /** The flow, in order. Short enough to scan. */
  steps: L10n[];
  /** Headline effect — the number a buyer cares about. */
  effect: L10n;
  /** The qualifier that keeps `effect` honest. */
  effectNote: L10n;
};

export const SERVICE_EXAMPLES: ServiceExample[] = [
  // ── 1 · Integration ────────────────────────────────────────────────────
  {
    serviceIndex: 1,
    title: {
      da: "Ordren der aldrig blev tastet",
      en: "The order nobody typed",
    },
    who: {
      da: "B2B-grossist i Nordjylland, ca. 40 ansatte, omkring 600 ordrer om måneden.",
      en: "A B2B wholesaler in North Jutland, around 40 staff, roughly 600 orders a month.",
    },
    problem: {
      da: "Fire ud af fem ordrer kommer ind som almindelig mail. En medarbejder slår kunden op, opretter ordren, taster varelinjerne, tjekker prisen og skriver en bekræftelse. Fem til ti minutter pr. ordre — og en tastefejl i ny og næ, som først opdages ved fakturaen.",
      en: "Four in five orders arrive as plain email. Someone looks up the customer, creates the order, types the lines, checks the price and writes a confirmation. Five to ten minutes an order — and the occasional typo that only surfaces on the invoice.",
    },
    steps: [
      { da: "Mailen lander i den fælles indbakke", en: "The email lands in the shared inbox" },
      { da: "Kunde og varenumre genkendes og matches mod stamdata", en: "Customer and item numbers are recognised and matched against master data" },
      { da: "Ordren oprettes som udkast i økonomisystemet", en: "The order is created as a draft in the finance system" },
      { da: "Sælgeren ser udkastet igennem og godkender", en: "The salesperson reviews the draft and approves it" },
      { da: "Bekræftelsen sendes, og lageret er allerede tjekket", en: "The confirmation goes out, with stock already checked" },
    ],
    effect: {
      da: "3–5 minutter sparet pr. ordre. Ved 600 ordrer: 30–50 timer om måneden.",
      en: "3–5 minutes saved per order. At 600 orders: 30–50 hours a month.",
    },
    effectNote: {
      da: "Typiske tal for denne type integration i danske SMV'er. Ikke målte resultater fra et kundeforløb.",
      en: "Typical figures for this kind of integration in Danish SMEs. Not measured results from a client engagement.",
    },
  },

  // ── 2 · Agentic Automations ────────────────────────────────────────────
  {
    serviceIndex: 2,
    title: {
      da: "Kollegaen der har svaret klar",
      en: "The colleague who has the answer ready",
    },
    who: {
      da: "Servicevirksomhed med fælles supportindbakke, ca. 30 ansatte.",
      en: "A service business with a shared support inbox, around 30 staff.",
    },
    problem: {
      da: "De samme spørgsmål hver dag: hvor er min ordre, hvornår leverer I, kan jeg få fakturaen igen. Hver gang skal en medarbejder logge ind, slå op, kopiere og formulere næsten det samme svar som sidst.",
      en: "The same questions every day: where is my order, when do you deliver, can I get the invoice again. Each time someone logs in, looks it up, copies it out and writes almost the same reply as last time.",
    },
    steps: [
      { da: "Henvendelsen læses, og sagen slås op på ordrenummer, mail eller telefon", en: "The message is read and matched to an order by number, email or phone" },
      { da: "Status hentes direkte fra systemet — afsendt, i produktion, restordre", en: "Status is pulled straight from the system — shipped, in production, back-ordered" },
      { da: "Et konkret svarudkast lægges klar, med forventet leveringsdato", en: "A concrete draft reply is prepared, with the expected delivery date" },
      { da: "Medarbejderen godkender — eller retter, hvis sagen er speciel", en: "The employee approves — or edits, if the case is unusual" },
      { da: "Kun de helt enkle svar sendes automatisk, efter regler I selv sætter", en: "Only the simplest replies send automatically, on rules you set yourselves" },
    ],
    effect: {
      da: "30–60 sekunder sparet pr. henvendelse, og halveret svartid på standardspørgsmål.",
      en: "30–60 seconds saved per message, and half the response time on standard questions.",
    },
    effectNote: {
      da: "Agenten foreslår — mennesket godkender. Tal er typiske for danske SMV'er, ikke målte resultater fra et kundeforløb.",
      en: "The agent proposes — a person approves. Figures are typical for Danish SMEs, not measured results from a client engagement.",
    },
  },

  // ── 3 · Vækst & optimering ─────────────────────────────────────────────
  {
    serviceIndex: 3,
    title: {
      da: "Et halvt år efter lancering",
      en: "Six months after launch",
    },
    who: {
      da: "Virksomhed med en app i drift, og ingen der ved hvilke dele der bruges.",
      en: "A business with an app in production, and nobody sure which parts get used.",
    },
    problem: {
      da: "Appen er live og virker. Men ingen ved hvilke skærme kunderne faktisk åbner, hvor de giver op undervejs, eller hvilke funktioner der blev bygget og aldrig rørt. Beslutninger om hvad der skal bygges næste gang bliver gæt.",
      en: "The app is live and works. But nobody knows which screens customers actually open, where they give up, or which features were built and never touched. Decisions about what to build next are guesswork.",
    },
    steps: [
      { da: "Den faktiske brug måles — hvilke skærme, hvor længe, hvor de stopper", en: "Real use is measured — which screens, how long, where people stop" },
      { da: "Det dyreste frafald findes: ét sted, ikke en liste på tyve", en: "The costliest drop-off is found: one place, not a list of twenty" },
      { da: "Det rettes, og der lægges ikke andet oveni samtidig", en: "It gets fixed, with nothing else piled on at the same time" },
      { da: "Der måles igen, så det er til at se om det virkede", en: "It is measured again, so you can see whether it worked" },
      { da: "En kort opsummering hver måned: hvad blev ændret, og hvad flyttede sig", en: "A short monthly summary: what changed, and what moved" },
    ],
    effect: {
      da: "3–10 timer sparet om måneden på manuel rapportering — og en klar begrundelse for hver ændring.",
      en: "3–10 hours a month saved on manual reporting — and a stated reason behind every change.",
    },
    effectNote: {
      da: "Typiske tal for løbende optimering i danske SMV'er. Ikke målte resultater fra et kundeforløb.",
      en: "Typical figures for ongoing optimisation in Danish SMEs. Not measured results from a client engagement.",
    },
  },
];

/** The example for a service, if it has one. The app build does not — it has
 *  five full concept studies at /applikationer instead. */
export function exampleFor(serviceIndex: number): ServiceExample | undefined {
  return SERVICE_EXAMPLES.find((e) => e.serviceIndex === serviceIndex);
}
