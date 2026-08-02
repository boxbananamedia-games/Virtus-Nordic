# Virtus Nordic — every word on the site

Written for rewriting. Every piece of real copy, Danish and English, grouped by where a visitor actually sees it.

## Where to edit

| What | File |
| --- | --- |
| All page copy, both languages | `app/src/lib/content.ts` |
| The five application concepts | `app/src/lib/applications.ts` |
| A handful of hardcoded strings | see **Not in the content files**, at the end |

`content.ts` holds one object per language with identical shapes: `content.da` and `content.en`. Every key path below (e.g. `hero.tagline`) exists under both, so each one is two edits. The build fails if a key exists in one language and not the other — but it will happily let you leave old English next to new Danish, and nothing will warn you.

---

## Shared across every page

### Header navigation

*`content.ts` > `nav`*

**`nav.home`**

- DA — Forside
- EN — Home

**`nav.about`**

- DA — Om mig
- EN — About

**`nav.services`**

- DA — Ydelser
- EN — Services

**`nav.apps`**

- DA — Applikationer
- EN — Applications

**`nav.contact`**

- DA — Kontakt
- EN — Contact

**`nav.cta`**

- DA — Book et møde
- EN — Book a Meeting

The logo itself reads **VN** and is hardcoded — see the end.

### Footer

*`content.ts` > `footer`*

**`footer.tagline`**

- DA — Mobilapplikationer og redskaber der får din forretning til at vokse
- EN — Mobile Applications for Business Growth

**`footer.rights`**

- DA — Alle rettigheder forbeholdes
- EN — All rights reserved

**`footer.modelCredit`**

- DA — 3D-model af enheden fra
- EN — Device 3D model by

> `modelCredit` is a **licence obligation** for the 3D phone models. The wording is yours; the credit itself is not optional.

### Booking modal

*Opens from any Book-a-meeting button — `content.ts` > `booking`*

**`booking.title`**

- DA — Book et møde
- EN — Book a meeting

**`booking.intro`**

- DA — Fortæl mig lidt om dig, så vender jeg tilbage og bekræfter tidspunktet.
- EN — Tell me a little about you, and I'll get back to you to confirm the time.

**`booking.name`**

- DA — Navn
- EN — Name

**`booking.email`**

- DA — E-mail
- EN — Email

**`booking.phone`**

- DA — Telefon
- EN — Phone

**`booking.company`**

- DA — Virksomhed
- EN — Company

**`booking.date`**

- DA — Ønsket dato
- EN — Preferred date

**`booking.timeslot`**

- DA — Tidsrum
- EN — Time window

**`booking.slots.morning`**

- DA — Formiddag (9–12)
- EN — Morning (9–12)

**`booking.slots.afternoon`**

- DA — Eftermiddag (12–16)
- EN — Afternoon (12–16)

**`booking.message`**

- DA — Hvad vil du gerne tale om?
- EN — What would you like to talk about?

**`booking.submit`**

- DA — Send booking
- EN — Send booking

**`booking.sending`**

- DA — Sender…
- EN — Sending…

**`booking.successTitle`**

- DA — Tak, din booking er modtaget
- EN — Thank you, your booking is in

**`booking.successBody`**

- DA — Jeg vender tilbage til dig hurtigst muligt og bekræfter tidspunktet.
- EN — I'll get back to you as soon as possible to confirm the time.

**`booking.error`**

- DA — Noget gik galt. Prøv igen, eller ring til mig direkte.
- EN — Something went wrong. Try again, or call me directly.

**`booking.close`**

- DA — Luk
- EN — Close

---

## Homepage `/`

In the order a visitor scrolls them.

### 1. Hero

*`content.ts` > `hero`*

The big wordmark **Virtus Nordic** is hardcoded, not in `content.ts` — see the end.

**`hero.tagline`**

- DA — Mobilapplikationer og redskaber der får din forretning til at vokse
- EN — Mobile Applications for Business Growth

**`hero.ctaPrimary`**

- DA — Book et møde
- EN — Book a Meeting

**`hero.ctaSecondary`**

- DA — Se mine ydelser
- EN — View Services

### 2. Intro

*`content.ts` > `intro`*

**`intro.quote`**

- DA — “Jeg bygger de applikationer, din forretning fortjener. Præcise, gennemtænkte og bygget til at holde.”
- EN — “I build the applications your business deserves. Precise, purposeful, and built to last.”

**`intro.p1`**

- DA — Virtus Nordic er et udviklingsstudie baseret i Aalborg. Jeg arbejder med lokale virksomheder, der forstår, at en gennemført app ikke er en luksus. Det er infrastruktur.
- EN — Virtus Nordic is a boutique mobile development studio based in Aalborg, Denmark. I work with local businesses who understand that a well-crafted application is not an expense. It is infrastructure.

**`intro.p2`**

- DA — Ethvert samarbejde starter med at forstå din forretning dybt og omfattende, og nøjagtigt hvad der gør den unik. Teknologien kommer bagefter.
- EN — Every engagement begins with understanding your business first. Technology follows from there.

### 3. Services teaser

*`content.ts` > `servicesTeaser` for the heading. The four cards below it reuse `services.items` — full text under Services.*

**`servicesTeaser.label`**

- DA — Det jeg laver
- EN — What I do

**`servicesTeaser.headline`**

- DA — Fire måder, jeg hjælper din forretning på
- EN — Four ways I help your business work better

**`servicesTeaser.sub`**

- DA — Jeg er specialist i mobilapplikationer og AI-systemer, der løser reelle udfordringer. Ingen trends, ingen skabeloner.
- EN — I specialise in mobile applications and AI systems that solve real operational problems. No trend-chasing, no templates.

### 4. Process

*`content.ts` > `process`*

**`process.label`**

- DA — Sådan arbejder jeg
- EN — How I work

**`process.headline`**

- DA — Fra første møde til lancering, og videre
- EN — From first meeting to launch, and beyond

**`process.steps[0]`** — step 01

- DA — **Afdækning** · Jeg lærer din forretning, dine kunder og den problemstilling, der er værd at løse, at kende, før et eneste skærmbillede designes.
- EN — **Discovery** · I learn your business, your customers, and the problem worth solving before a single screen is designed.

**`process.steps[1]`** — step 02

- DA — **Design** · Hver side designes med fokus på klarhed, skønhed og hastighed, og finpudses sammen med dig, indtil det er rigtigt.
- EN — **Design** · Every screen is drafted around clarity and speed of use, then refined with you until it's right.

**`process.steps[2]`** — step 03

- DA — **Udvikling** · Ren, testet og vedligeholdelsesvenlig kode, bygget til at holde. Ikke bare til at se godt ud til en demo.
- EN — **Build** · Clean, tested, maintainable code, built to run reliably. Not just to demo well.

**`process.steps[3]`** — step 04

- DA — **Lancering & vækst** · Jeg følger med efter lancering, holder øje med den faktiske brug, og udvikler appen i takt med din forretning.
- EN — **Launch & Grow** · I stay involved after launch, tracking real usage and improving the app as your business grows.

### 5. The scroll film

*`content.ts` > `craft` — the full-screen film that plays as you scroll, now sitting just above the closing CTA*

**`craft.label`**

- DA — Virkeligheden
- EN — The reality

**`craft.headline`**

- DA — Din kunde er der allerede. På skærmen.
- EN — Your customer is already there. On the screen.

**`craft.body`**

- DA — På cafeen, i toget, ved skrivebordet, sent om aftenen. Scroll for at følge med.
- EN — At the café, on the train, at the desk, late at night. Scroll to follow along.

**`craft.captions`** — 5 captions, shown one at a time over the film

1. DA — Danskerne bruger 4,4 timer om dagen foran en skærm. Og det er kun i fritiden.
   EN — Danes spend 4.4 hours a day in front of a screen. And that's leisure time alone.
2. DA — Det svarer til over 1.600 timer om året. Næsten et helt arbejdsår.
   EN — That adds up to over 1,600 hours a year. Nearly a full working year.
3. DA — Hver tredje dansker føler sig afhængig af sin telefon. Blandt de unge: fire ud af ti.
   EN — One in three Danes feels addicted to their phone. Among young adults: four in ten.
4. DA — En dansker bruger 8,6 år af sit liv foran skærmen.
   EN — A Dane spends 8.6 years of their life looking at a screen.
5. DA — Dine kunder er der allerede. Er du?
   EN — Your customers are already there. Are you?

> Keep these short. They are set large and sit over moving footage.

### 6. Closing CTA

*`content.ts` > `ctaBand`*

**`ctaBand.headline`**

- DA — Lad os tale om, hvad din forretning har brug for.
- EN — Let's talk about what your business needs.

**`ctaBand.sub`**

- DA — Ingen forpligtelser, ingen standardsalgstale. Bare en snak om det, du står med.
- EN — No obligation, no generic pitch. Just a conversation about the problem you're trying to solve.

**`ctaBand.book`**

- DA — Book et møde
- EN — Book a Meeting

**`ctaBand.call`**

- DA — Ring på +45 41 36 90 00
- EN — Call +45 41 36 90 00

---

## About `/om`

*`content.ts` > `about`*

**`about.label`**

- DA — Hvem jeg er
- EN — Who I am

**`about.headline`**

- DA — Et studie, ikke et bureau-maskineri
- EN — A studio, not an agency machine

**`about.p1`**

- DA — Virtus Nordic drives af mig, Alexander Estrada Magnussen. Selvstændig udvikler baseret i Aalborg, som løser hver eneste opgave personligt frem for at sende den gennem kontoansvarlige og juniorer.
- EN — Virtus Nordic is run by me, Alexander Estrada Magnussen. A solo developer based in Aalborg who builds every project personally rather than routing it through account managers and junior staff.

**`about.p2`**

- DA — Det er et bevidst valg. Det betyder færre kunder, men det betyder også, at enhver virksomhed, jeg arbejder med, har direkte adgang til den person, der skriver koden, og den person, de taler med. Ingen mellemled.
- EN — That's a deliberate choice. It means fewer clients, but it means every business I work with gets direct access to the person actually writing the code, and the person they're actually talking to. No layers in between.

**`about.philosophyLabel`**

- DA — Filosofi
- EN — Philosophy

**`about.quote`**

- DA — “Jeg bygger de applikationer, din forretning fortjener. Præcise, gennemtænkte og bygget til at holde.”
- EN — “I build the applications your business deserves. Precise, purposeful, and built to last.”

**`about.p3`**

- DA — De fleste virksomheder har ikke brug for mere software. De har brug for den rigtige software, bygget efter hvordan de faktisk arbejder, ikke efter hvad der er hurtigst at sætte op fra en skabelon. Det er den standard, ethvert Virtus Nordic-projekt måles på.
- EN — Most businesses don't need more software. They need the right software, built around how they actually work, not around what's fastest to template. That's the standard every Virtus Nordic project is held to.

**`about.localLabel`**

- DA — Hvorfor lokalt
- EN — Why local

**`about.p4`**

- DA — Danske lokale virksomheder bliver ofte overset af en branche bygget til volumen. Virtus Nordic findes for de virksomheder, der ønsker en samarbejdspartner, som forstår det danske marked og deres specifikke forretning, mødes fysisk, og stadig er der et år efter lancering.
- EN — Denmark's local businesses are underserved by an industry built for volume. Virtus Nordic exists for the businesses that want a partner who understands the Danish market and their specific business, meets in person, and is still there a year after launch.

---

## Services `/ydelser`

*`content.ts` > `services`*

**`services.label`**

- DA — Det jeg laver
- EN — What I do

**`services.headline`**

- DA — Fire måder, jeg hjælper din forretning med at vokse
- EN — Four ways I help your business grow

### Service 1

**`services.items[0].title`**

- DA — Skræddersyede apps
- EN — Custom Mobile Applications

**`services.items[0].teaser`** — the short line on the homepage card

- DA — Kode bygget helt fra bunden efter, hvordan din forretning rent faktisk fungerer. Ingen overflødige funktioner, ingen kompromiser.
- EN — Purpose-built apps designed around how your business actually operates, not a generic feature list.

**`services.items[0].paras`** — the long copy on this page

1. DA — iOS- og Android-applikationer bygget helt fra bunden efter din faktiske arbejdsgang. Ingen overflødige skabeloner, ingen unødvendige funktioner. Bare den app, din forretning har brug for, for at fungere bedre.
   EN — Purpose-built iOS and Android applications, designed from the ground up around your actual workflow. No bloated templates, no unnecessary features. Just the app your business needs to run better.

### Service 2

**`services.items[1].title`**

- DA — Integration med dine systemer
- EN — Business System Integration

**`services.items[1].teaser`** — the short line on the homepage card

- DA — Din app taler naturligt sammen med de systemer, du allerede bruger: bookingsystemer, lager og CRM. Ingen dobbeltarbejde.
- EN — Your app connects cleanly to the systems you already run on: no duplicate data entry, no workarounds.

**`services.items[1].paras`** — the long copy on this page

1. DA — Din app skal tale sammen med de værktøjer, du allerede bruger: bookingsystemer, lager, CRM og betaling. Jeg bygger forbindelserne, så informationen flyder automatisk, uden manuel indtastning og uden huller mellem systemerne.
   EN — Your app should talk to the tools you already use: booking systems, inventory, CRM and payment processing. I build the connections so information flows automatically, with no manual re-entry and no gaps between systems.

### Service 3

**`services.items[2].title`**

- DA — Agentic Automations
- EN — Agentic Automations

**`services.items[2].teaser`** — the short line on the homepage card

- DA — Software, der fungerer som ekstra medarbejdere: de læser, vurderer og handler selv, også mens du sover.
- EN — Software that acts like extra staff: it reads, decides, and handles things on its own, even while you sleep.

**`services.items[2].paras`** — the long copy on this page

1. DA — De fleste programmer venter på, at du fortæller dem, hvad de skal gøre. Det gør en agent ikke. Den læser, hvad der kommer ind, vurderer, hvad der skal ske, og handler selv, ligesom en god medarbejder ville gøre.
   EN — Most software waits for you to tell it what to do. An agent doesn't. It reads what comes in, decides what needs to happen, and takes the action itself, the same way a good employee would.
2. DA — Forestil dig: en kunde skriver en mail klokken 23:47 og spørger, om du har tid næste tirsdag. Normalt ville den mail ligge, til du tjekker den næste morgen, og til da har kunden måske allerede booket et andet sted. Med en agent, der overvåger din indbakke, bliver beskeden læst på sekunder, tjekket op mod din faktiske kalender, besvaret på kundens eget sprog, og booket ind, inden du overhovedet er vågnet. Intet mistet kundeemne, ingen morgenstress.
   EN — Picture this: a customer emails at midnight asking about availability next week. With an agent watching your inbox, that message is read in seconds, checked against your real calendar, replied to in the customer's own language, and booked, all before you've even woken up. No missed lead, no 9am scramble.
3. DA — Det er det tætteste, du kommer på at ansætte ekstra personale, der arbejder hele døgnet, aldrig melder sig syge, og koster prisen på softwaren, ikke endnu en lønseddel.
   EN — It's the closest thing to hiring extra staff who work every hour of the day, never call in sick, and cost the price of the software, not another salary.

### Service 4

**`services.items[3].title`**

- DA — Vækst & optimering
- EN — Growth & Optimisation

**`services.items[3].teaser`** — the short line on the homepage card

- DA — Efter lancering fortsætter jeg med at finpudse: performance, brugsmønstre og de funktioner, der rent faktisk gør en forskel.
- EN — Once live, I keep refining: performance, usage patterns, and the features that actually move the needle.

**`services.items[3].paras`** — the long copy on this page

1. DA — Lancering er begyndelsen, ikke slutningen. Jeg følger den faktiske brug, finder friktionspunkter, og fortsætter med at forbedre appen, så den vokser i takt med din forretning.
   EN — Launch is the beginning, not the finish line. I monitor real usage, identify friction points, and continue improving the app, so it keeps getting better as your business grows.

**`services.closing`**

- DA — Er du i tvivl om, hvilken af disse der passer til din forretning?
- EN — Not sure which of these fits your business?

**`services.closingCta`**

- DA — Book et møde, så finder vi ud af det sammen
- EN — Book a meeting and we'll figure it out together

---

## Applications `/applikationer`

### Page chrome

*`content.ts` > `apps`*

**`apps.label`**

- DA — Applikationer
- EN — Applications

**`apps.headline`**

- DA — Fem virksomheder. Fem applikationer der intet har til fælles.
- EN — Five businesses. Five applications with nothing in common.

**`apps.sub`**

- DA — Virtus Nordic har én identitet. Produkterne har ikke. Hver applikation her er tegnet omkring kundens forretning, kundens brugere og kundens marked, ikke omkring min egen smag. Det er derfor de fem skærme ser ud som om de kommer fra fem forskellige studier.
- EN — Virtus Nordic has one identity. The products do not. Every application here is drawn around the client's business, the client's users and the client's market, not around my own taste. That is why these five screens look like they came from five different studios.

**`apps.disclaimer`**

- DA — Alle fem virksomheder er virkelige og har givet tilladelse til, at deres forretning bruges som udgangspunkt for disse konceptstudier. Der er ikke et igangværende samarbejde mellem Virtus Nordic og virksomhederne.
- EN — All five businesses are real and have given permission for their business to be used as the basis for these concept studies. There is no ongoing engagement between Virtus Nordic and the businesses.

**`apps.selectLabel`**

- DA — Vælg et koncept
- EN — Choose a concept

**`apps.heroHint`**

- DA — Peg på en telefon, eller klik for hele konceptet
- EN — Hover a phone, or click for the full concept

**`apps.openConcept`**

- DA — Åbn konceptet.
- EN — Open the concept.

**`apps.detailsOpen`**

- DA — Se teknik og forretningsværdi
- EN — Show technology and business value

**`apps.detailsClose`**

- DA — Skjul teknik og forretningsværdi
- EN — Hide technology and business value

**`apps.valueNote`**

- DA — Effektmål for konceptet, ikke målte resultater fra et kundeforløb.
- EN — Intended effects of the concept, not measured results from a client engagement.

**`apps.cta`**

- DA — Lad os finde applikationen i din virksomhed
- EN — Let's find the application inside your business

**`apps.ctaSub`**

- DA — Din forretning har sit eget flow, sine egne kunder og sine egne spidsbelastninger. Lad os finde det sted, hvor en applikation flytter mest.
- EN — Your business has its own flow, its own customers and its own peak hours. Let's find the place where an application moves the most.

**`apps.ctaButton`**

- DA — Book et møde
- EN — Book a Meeting

> **`apps.disclaimer` is a legal statement, not marketing copy.** All five businesses are real and gave permission for their business to be used as the basis for a concept study, and there is no ongoing engagement. Reword it however you like, but it has to keep saying both of those things, in both languages.

> `apps.heroHint` only appears in the flat fallback hero — phones and any browser without WebGL. You will not see it on a normal desktop.

Field headings used inside each concept:

**`apps.fields.problem`**

- DA — Forretningsproblemet
- EN — The business problem

**`apps.fields.journey`**

- DA — Brugerrejsen
- EN — The user journey

**`apps.fields.features`**

- DA — Nøglefunktioner
- EN — Key features

**`apps.fields.technical`**

- DA — Tekniske kapabiliteter
- EN — Technical capabilities

**`apps.fields.value`**

- DA — Forretningsværdi
- EN — Business value

### The five concepts

*A different file: `app/src/lib/applications.ts`. Each concept is one object in the `APPLICATIONS` array.*

#### 1. Guf & Kugler — `id: "guf-kugler"`

**`name`** — Guf & Kugler  *(one string, not translated)*

**`category`**

- DA — Mad og takeaway-handel
- EN — Food and takeaway commerce

**`valueLine`**

- DA — Dagens kugler, forudbestilling og en klub der får kunden tilbage i næste uge.
- EN — Today's scoops, pre-orders and a club that brings the customer back next week.

**`problem`**

- DA — Om sommeren står køen ud af døren, mens telefonen ringer med spørgsmål om åbningstid og dagens smage. Smagene skifter hver dag, tavlen på væggen er det eneste sted de står, og der findes ingen måde at belønne de gæster der kommer hver uge.
- EN — In summer the queue runs out the door while the phone rings with questions about opening hours and today's flavours. The flavours change daily, the board on the wall is the only place they exist, and there is no way to reward the guests who come every week.

**`journey`** — the user journey, numbered on the page

1. DA — Gæsten ser dagens kugler hjemme fra sofaen
   EN — The guest sees today's scoops from the sofa at home
2. DA — Bygger sin egen is, kugle for kugle, med tilvalg
   EN — Builds their own cone, scoop by scoop, with extras
3. DA — Betaler og vælger et afhentningsvindue
   EN — Pays and picks a collection window
4. DA — Henter uden kø og får point i klubben
   EN — Collects without queueing and earns club points

**`features`** — key features

1. DA — Dagens smage, opdateret fra disken
   EN — Daily flavours, updated from behind the counter
2. DA — Ordre-bygger til egne kombinationer
   EN — Order builder for custom combinations
3. DA — Click and collect med tidsvindue
   EN — Click and collect with a time window
4. DA — Loyalitetsklub med point og niveauer
   EN — Loyalty club with points and tiers
5. DA — Gavekort til køb og indløsning i appen
   EN — Gift cards, bought and redeemed in the app
6. DA — Booking af events og Mini-Isbar
   EN — Event and Mini-Isbar bookings

**`technical`** — technical capabilities, behind the see-more toggle

1. DA — Menustyring i realtid, så en smag kan lukkes på ti sekunder midt i rushet
   EN — Real-time menu control, so a flavour can be closed in ten seconds mid-rush
2. DA — Kort, MobilePay og gavekort i samme betalingsflow
   EN — Card, MobilePay and gift cards in one payment flow
3. DA — Kapacitetsstyrede afhentningsvinduer pr. femten minutter
   EN — Capacity-managed collection windows in fifteen-minute slots
4. DA — Push-besked når dagens smage lægges op
   EN — Push notification when the day's flavours go live
5. DA — Point og medlemsniveauer beregnet på serveren, ikke i appen
   EN — Points and tiers calculated on the server, not in the app
6. DA — Kassesystem og lager holdes synkront, så udsolgt betyder udsolgt
   EN — Till and stock stay in sync, so sold out means sold out

**`value`** — business value, behind the see-more toggle

1. DA — **Kortere kø i spidsbelastningen** · Forudbetalte ordrer flyttes ud af kassekøen og ind i et afhentningsvindue.
   EN — **Shorter queues at peak** · Pre-paid orders move out of the till queue and into a collection window.
2. DA — **Højere gennemsnitsordre** · Tilvalg og topping foreslås i bygge-flowet i stedet for at blive glemt ved disken.
   EN — **Higher average order** · Extras and toppings are offered in the build flow instead of being forgotten at the counter.
3. DA — **Genkøb der kan måles** · Klubben viser hvem der kommer igen, hvor ofte, og hvad der får dem tilbage.
   EN — **Repeat business you can measure** · The club shows who returns, how often, and what brings them back.

#### 2. Barber Club — `id: "barber-club"`

**`name`** — Barber Club  *(one string, not translated)*

**`category`**

- DA — Booking og medlemskaber
- EN — Appointments and memberships

**`valueLine`**

- DA — Medlemskabet i lommen, klip tilbage på kortet og næste tid der bekræfter sig selv.
- EN — The membership in your pocket, treatments left on the card, and a next booking that confirms itself.

**`problem`**

- DA — Bookinger kommer ind på fire kanaler, og udeblivelser koster en hel stol en hel time. De faste kunder er butikkens fundament, men der findes ingen medlemsordning der binder dem, og ingen fortæller dem hvornår deres barber har en ledig tid.
- EN — Bookings arrive through four channels, and a no-show costs a full chair for a full hour. Regulars are the shop's foundation, but there is no membership tying them in, and nobody tells them when their barber has an opening.

**`journey`** — the user journey, numbered on the page

1. DA — Kunden vælger barber ud fra portfolio og stil
   EN — The client picks a barber from portfolio and style
2. DA — Booker eller bruger et klip fra medlemskabet
   EN — Books, or spends a treatment from the membership
3. DA — Checker ind digitalt ved ankomst
   EN — Checks in digitally on arrival
4. DA — Bliver mindet om genbooking og anbefalede produkter
   EN — Gets a rebooking nudge and product recommendations

**`features`** — key features

1. DA — Booking med valg af barber og behandling
   EN — Booking with barber and treatment selection
2. DA — Portfolio pr. barber, egne billeder
   EN — Portfolio per barber, own photography
3. DA — Medlemskaber med månedligt træk
   EN — Memberships with monthly billing
4. DA — Digitalt check-in i stolen
   EN — Digital check-in at the chair
5. DA — Behandlingssaldo og historik
   EN — Treatment balance and history
6. DA — Genbooking og produktanbefalinger
   EN — Rebooking and product recommendations

**`technical`** — technical capabilities, behind the see-more toggle

1. DA — Kalender pr. stol med behandlingslængder og pauser
   EN — Per-chair calendar with treatment durations and breaks
2. DA — Abonnementsbetaling med automatisk fornyelse og pause
   EN — Subscription billing with automatic renewal and pausing
3. DA — Saldostyring, så et klip trækkes ved check-in og ikke ved booking
   EN — Balance handling, so a treatment is spent at check-in, not at booking
4. DA — Påmindelser der reelt reducerer udeblivelser, med afbudsliste
   EN — Reminders that actually cut no-shows, with a waiting list
5. DA — Apple Wallet-kort til medlemskabet
   EN — Apple Wallet pass for the membership
6. DA — Rapport pr. barber på belægning og genbooking
   EN — Per-barber reporting on utilisation and rebooking

**`value`** — business value, behind the see-more toggle

1. DA — **Færre tomme stole** · Afbud tilbydes automatisk til afbudslisten i stedet for at stå ubesat.
   EN — **Fewer empty chairs** · Cancellations go to the waiting list automatically instead of sitting empty.
2. DA — **Forudsigelig omsætning** · Medlemskaber flytter en del af omsætningen fra tilfældig trafik til faste træk.
   EN — **Predictable revenue** · Memberships shift part of revenue from walk-in chance to recurring billing.
3. DA — **Højere frekvens hos de faste** · Genbooking foreslås mens kunden stadig sidder i stolen.
   EN — **Higher frequency among regulars** · Rebooking is offered while the client is still in the chair.

#### 3. AalborgBox — `id: "aalborgbox"`

**`name`** — AalborgBox  *(one string, not translated)*

**`category`**

- DA — Bookbar kapacitet og logistik
- EN — Bookable capacity and logistics

**`valueLine`**

- DA — Ledig plads, anbefalet størrelse og adgang på telefonen, uden et kontor i midten.
- EN — Available space, a recommended size and access on the phone, with no office in the middle.

**`problem`**

- DA — Kunden ved ikke hvor mange kvadratmeter et hjem på 80 kvadratmeter fylder, og gætter derfor for stort eller for småt. Kontrakter skrives i hånden, nøgler udleveres i åbningstiden, og ledig kapacitet står tom fordi ingen udefra kan se den.
- EN — Customers have no idea how many square metres an 80 m² home takes up, so they guess too big or too small. Contracts are written by hand, keys are handed over during office hours, and free capacity sits empty because nobody outside can see it.

**`journey`** — the user journey, numbered on the page

1. DA — Kunden svarer på fire spørgsmål om hvad der skal opmagasineres
   EN — The customer answers four questions about what needs storing
2. DA — Får en anbefalet størrelse og ser den på plantegningen
   EN — Gets a recommended size and sees it on the floor plan
3. DA — Lejer og betaler, kontrakten signeres digitalt
   EN — Rents and pays, signing the contract digitally
4. DA — Lukker sig ind med adgangsbeviset på telefonen
   EN — Lets themselves in with the access pass on their phone

**`features`** — key features

1. DA — Størrelsesanbefaling ud fra kundens egne svar
   EN — Size recommendation from the customer's own answers
2. DA — Kort og plantegning med ledige bokse
   EN — Map and floor plan of available units
3. DA — Leje og betaling i appen
   EN — Rental and payment in the app
4. DA — Digital adgang til port og dør
   EN — Digital access to gate and door
5. DA — Kontrakter og fakturaer samlet ét sted
   EN — Contracts and invoices in one place
6. DA — Indholdsfortegnelse og erhvervskonti
   EN — Inventory catalogue and business accounts

**`technical`** — technical capabilities, behind the see-more toggle

1. DA — Kapacitetsmodel pr. lokation, størrelse og periode
   EN — Capacity model per location, size and period
2. DA — Anbefaling ud fra et regelsæt på kundens svar, aldrig et gæt der ikke kan forklares
   EN — Recommendation from a rule set over the customer's answers, never an unexplainable guess
3. DA — Adgangsbevis med tidsbegrænsede nøgler og fuld log
   EN — Access pass with time-limited keys and a full audit log
4. DA — Digital signatur på lejekontrakt
   EN — Digital signature on the rental agreement
5. DA — Abonnementsfakturering med automatisk rykkerflow
   EN — Subscription invoicing with an automatic dunning flow
6. DA — Erhvervskonti med flere brugere pr. virksomhed
   EN — Business accounts with several users per company

**`value`** — business value, behind the see-more toggle

1. DA — **Højere belægning** · Ledig kapacitet er synlig og bookbar døgnet rundt, ikke kun i åbningstiden.
   EN — **Higher occupancy** · Free capacity is visible and bookable around the clock, not just during office hours.
2. DA — **Færre forkerte størrelser** · Anbefalingen reducerer flytninger, kreditnotaer og utilfredse opsigelser.
   EN — **Fewer wrong sizes** · The recommendation cuts internal moves, credit notes and unhappy cancellations.
3. DA — **Administration uden fremmøde** · Kontrakt, betaling og adgang klares uden at nogen skal møde nogen.
   EN — **Admin without a front desk** · Contract, payment and access are handled without anyone meeting anyone.

#### 4. Aalborg El-service — `id: "el-service"`

**`name`** — Aalborg El-service  *(one string, not translated)*

**`category`**

- DA — Serviceopgaver i marken
- EN — Field service operations

**`valueLine`**

- DA — Fra opkald til udført sag, med kundens billeder og elektrikerens tid samlet ét sted.
- EN — From first call to finished job, with the customer's photos and the electrician's time in one place.

**`problem`**

- DA — En fejlmelding over telefonen bliver til en gul seddel, og elektrikeren kører ud uden at vide hvad han møder. Kunden ved ikke hvornår nogen kommer, tilbud ligger i en mailtråd, og dokumentationen findes kun i hovedet på den der var der.
- EN — A fault reported over the phone becomes a sticky note, and the electrician drives out without knowing what he is walking into. The customer has no idea when someone is coming, quotes live in an email thread, and the documentation exists only in the head of whoever was there.

**`journey`** — the user journey, numbered on the page

1. DA — Kunden beskriver fejlen med billede, video eller indtalt besked
   EN — The customer describes the fault with a photo, video or voice note
2. DA — Systemet foreslår kategori, sted og hastegrad til godkendelse
   EN — The system suggests category, location and urgency for approval
3. DA — Tilbud godkendes digitalt, og et tidsrum lægges fast
   EN — The quote is approved digitally and a time slot is booked
4. DA — Kunden følger elektrikeren frem og får rapporten bagefter
   EN — The customer follows the electrician's ETA and gets the report afterwards

**`features`** — key features

1. DA — Fejlmelding på under et minut
   EN — Fault reporting in under a minute
2. DA — Billede, video og indtalt besked på sagen
   EN — Photo, video and voice notes attached to the case
3. DA — Tilbud til digital godkendelse
   EN — Quotes for digital approval
4. DA — Planlægning og live ETA på elektrikeren
   EN — Scheduling and live technician ETA
5. DA — Ejendomsoverblik med historik pr. adresse
   EN — Property overview with history per address
6. DA — Dokumentation, servicerapport og elektrikerens arbejdsflade
   EN — Documentation, service report and the technician's workspace

**`technical`** — technical capabilities, behind the see-more toggle

1. DA — Struktureret indtagning: fritekst, billede og lyd bliver felter, ikke en mailtråd
   EN — Structured intake: free text, image and audio become fields, not an email thread
2. DA — Kategoriforslag som elektrikeren godkender eller retter. Appen stiller ingen diagnose og vurderer ikke elsikkerhed
   EN — Category suggestions the electrician approves or corrects. The app makes no diagnosis and does not assess electrical safety
3. DA — Ruteplanlægning med opdateret ankomstvindue til kunden
   EN — Route planning with a live arrival window for the customer
4. DA — Tilbud med versionering og digital godkendelse
   EN — Quotes with versioning and digital approval
5. DA — Offline-tilstand i arbejdsfladen, for kældre uden dækning
   EN — Offline mode in the workspace, for basements without coverage
6. DA — Servicerapport med tid, materialer og billeder, arkiveret pr. adresse
   EN — Service report with hours, materials and photos, archived per address

**`value`** — business value, behind the see-more toggle

1. DA — **Flere sager pr. dag** · Elektrikeren kører ud forberedt, med de rigtige materialer på bilen.
   EN — **More jobs per day** · The electrician drives out prepared, with the right materials on the van.
2. DA — **Mindre administration pr. sag** · Rapport og timer registreres på stedet i stedet for på kontoret om aftenen.
   EN — **Less admin per job** · Report and hours are logged on site instead of at the office in the evening.
3. DA — **Hurtigere godkendte tilbud** · Kunden kan godkende fra telefonen, samme dag som tilbuddet sendes.
   EN — **Faster quote approvals** · The customer can approve from their phone, the same day the quote goes out.

#### 5. Aalborg Fysioterapi — `id: "fysioterapi"`

**`name`** — Aalborg Fysioterapi  *(one string, not translated)*

**`category`**

- DA — Behandling og klientforløb
- EN — Treatment and client progress

**`valueLine`**

- DA — Dagens øvelser, klientens egne registreringer og et forløb der er let at følge med i.
- EN — Today's exercises, the client's own check-ins, and a course of treatment that is easy to follow.

**`problem`**

- DA — Øvelserne bliver givet med i klinikken på et stykke papir, og halvdelen er glemt inden torsdag. Behandleren ved ikke hvad der er lavet mellem to konsultationer, og klienten kan ikke se om det går fremad.
- EN — Exercises are handed out on a sheet of paper at the clinic, and half of them are forgotten by Thursday. The therapist has no idea what was done between two sessions, and the client cannot see whether things are improving.

**`journey`** — the user journey, numbered on the page

1. DA — Behandleren sætter planen efter konsultationen
   EN — The therapist sets the plan after the session
2. DA — Klienten åbner dagens program og ser øvelsen udført
   EN — The client opens today's programme and sees the exercise performed
3. DA — Registrerer selv hvad der er lavet, og hvordan det føltes
   EN — Logs what was done, and how it felt
4. DA — Følger sin egen kurve og booker næste tid
   EN — Follows their own curve and books the next appointment

**`features`** — key features

1. DA — Behandlingsplan lagt af behandleren
   EN — Treatment plan set by the therapist
2. DA — Videoøvelser med tempo og gentagelser
   EN — Video exercises with tempo and repetitions
3. DA — Daglige check-ins, klientens egne ord
   EN — Daily check-ins, in the client's own words
4. DA — Fremgang over tid, selvregistreret
   EN — Progress over time, self-reported
5. DA — Tider og holdtræning
   EN — Appointments and group classes
6. DA — Sikker kanal til praktiske spørgsmål
   EN — Secure channel for practical questions

**`technical`** — technical capabilities, behind the see-more toggle

1. DA — Planer bygget af behandleren ud fra et øvelsesbibliotek, aldrig genereret automatisk
   EN — Plans built by the therapist from an exercise library, never generated automatically
2. DA — Klientens registreringer er selvrapporterede data, ikke en måling eller en diagnose
   EN — Client check-ins are self-reported data, not a measurement or a diagnosis
3. DA — Videoafspilning der virker offline i træningscenteret
   EN — Video playback that works offline at the gym
4. DA — Booking af tider og hold med venteliste
   EN — Appointment and class booking with a waiting list
5. DA — Beskedkanal til praktiske spørgsmål, med tydelig henvisning til klinikken og lægevagten ved akutte gener
   EN — Messaging for practical questions, pointing clearly to the clinic or emergency care for acute symptoms
6. DA — Samtykke, dataminimering og sletning efter aftale med klinikken
   EN — Consent, data minimisation and deletion per the clinic's policy

**`value`** — business value, behind the see-more toggle

1. DA — **Højere gennemførsel** · Programmet ligger i lommen, med påmindelser på de dage der plejer at glide.
   EN — **Better adherence** · The programme lives in the client's pocket, with reminders on the days that usually slip.
2. DA — **Bedre forberedte konsultationer** · Behandleren kan se hvad der er registreret siden sidst, før klienten sætter sig.
   EN — **Better prepared sessions** · The therapist can see what has been logged since last time, before the client sits down.
3. DA — **Færre aflyste tider** · Tider, hold og venteliste ligger samme sted som programmet.
   EN — **Fewer cancelled appointments** · Appointments, classes and the waiting list live in the same place as the programme.

---

## Contact `/kontakt`

*`content.ts` > `contact`*

**`contact.headline`**

- DA — Lad os tale sammen
- EN — Let's talk

**`contact.sub`**

- DA — Fortæl mig om din forretning, og hvad du gerne vil løse. Jeg vender personligt tilbage, ikke med et standardsvar.
- EN — Tell me about your business and what you're trying to solve. I'll get back to you personally, not a form-letter reply.

**`contact.founderName`**

- DA — Alexander Estrada Magnussen
- EN — Alexander Estrada Magnussen

**`contact.founderRole`**

- DA — Stifter
- EN — Founder

**`contact.emailLabel`**

- DA — Email
- EN — Email

**`contact.phoneLabel`**

- DA — Telefon
- EN — Phone

**`contact.basedLabel`**

- DA — Baseret i
- EN — Based in

**`contact.based`**

- DA — Aalborg, Danmark
- EN — Aalborg, Denmark

**`contact.mailSubject`**

- DA — Henvendelse via virtusnordic.com
- EN — Enquiry via virtusnordic.com

Form field labels:

**`contact.form.name`**

- DA — Navn
- EN — Name

**`contact.form.company`**

- DA — Virksomhed
- EN — Company

**`contact.form.email`**

- DA — Email
- EN — Email

**`contact.form.phone`**

- DA — Telefon
- EN — Phone

**`contact.form.message`**

- DA — Besked
- EN — Message

**`contact.form.send`**

- DA — Send besked
- EN — Send message

**`contact.form.note`**

- DA — Knappen åbner dit mailprogram med beskeden klar til afsendelse.
- EN — The button opens your mail client with the message ready to send.

---

## Browser tab titles and search descriptions

*`content.ts` > `meta`. These show in Google results and the browser tab, never on the page.*

### /

**`meta.home.title`**

- DA — Virtus Nordic · Mobilapplikationer og redskaber der får din forretning til at vokse
- EN — Virtus Nordic · Mobile Applications for Business Growth

**`meta.home.description`**

- DA — Boutique-udviklingsstudie i Aalborg. Skræddersyede apps, systemintegration og AI-agenter til danske virksomheder.
- EN — Boutique development studio in Aalborg, Denmark. Custom apps, system integration and AI agents for Danish businesses.

### /om

**`meta.about.title`**

- DA — Om mig · Virtus Nordic
- EN — About · Virtus Nordic

**`meta.about.description`**

- DA — Et studie, ikke et bureau-maskineri. Direkte adgang til den person, der bygger din app.
- EN — A studio, not an agency machine. Direct access to the person actually building your app.

### /ydelser

**`meta.services.title`**

- DA — Ydelser · Virtus Nordic
- EN — Services · Virtus Nordic

**`meta.services.description`**

- DA — Skræddersyede apps, systemintegration, AI-agenter og løbende optimering.
- EN — Custom mobile applications, system integration, agentic automations and ongoing optimisation.

### /applikationer

**`meta.apps.title`**

- DA — Applikationer · Virtus Nordic
- EN — Applications · Virtus Nordic

**`meta.apps.description`**

- DA — Fem konceptstudier for fem rigtige nordjyske virksomheder. Fem applikationer der intet har til fælles.
- EN — Five concept studies for five real North Jutland businesses. Five applications with nothing in common.

### /kontakt

**`meta.contact.title`**

- DA — Kontakt · Virtus Nordic
- EN — Contact · Virtus Nordic

**`meta.contact.description`**

- DA — Book et møde med Virtus Nordic i Aalborg. Ingen forpligtelser, bare en snak.
- EN — Book a meeting with Virtus Nordic in Aalborg. No obligation, just a conversation.

> Only the Danish versions are wired up as the actual page metadata. The English ones exist but are not used yet.

---

## Contact details

*Top of `content.ts`. Used in links across the site.*

| Constant | Value |
| --- | --- |
| `EMAIL` | alex@virtusnordic.com |
| `PHONE` | +45 41 36 90 00 |
| `PHONE_HREF` | tel:+4541369000 |

> Change `PHONE` and `PHONE_HREF` together — the second is the dialable form of the first.

---

## Not in the content files

Written directly into components, and **not translated** — each shows the same in both languages.

| Text | Where it shows | File |
| --- | --- | --- |
| `Virtus Nordic` | the big hero wordmark | `app/src/routes/index.tsx` (~line 124) |
| `VN` | logo in the header | `app/src/components/vn/chrome.tsx` |
| `Aalborg, Danmark` | footer address line | `app/src/components/vn/chrome.tsx` (~165) |
| `(c) <year> Virtus Nordic` | footer copyright | `app/src/components/vn/chrome.tsx` (~170) |
| `Meshy` | footer credit link text | `app/src/components/vn/chrome.tsx` (~181) |
| `404`, `Siden findes ikke — eller er flyttet. / This page doesn't exist or has moved.`, `Forside · Home` | the 404 page | `app/src/routes/__root.tsx` |
| `Noget gik galt`, `Siden kunne ikke indlæses. Prøv igen, eller gå tilbage til forsiden.`, `Prøv igen`, `Forside` | the error page | `app/src/routes/__root.tsx` |
| `Virtus Nordic` and `Boutique-udviklingsstudie i Aalborg — mobilapplikationer og AI-agenter til danske virksomheder.` | fallback tab title and social preview | `app/src/routes/__root.tsx` (`DEFAULT_TITLE`, `DEFAULT_DESCRIPTION`) |

> The 404 and error pages carry both languages inside one string, because they can render before the language is known.

---

## Two things to keep in mind

**Every string exists twice.** Change `content.da.hero.tagline` and you must change `content.en.hero.tagline` too.

**Some copy is load-bearing.** `apps.disclaimer` is a legal statement and `footer.modelCredit` is a licence obligation. Both can be reworded; neither can be removed.
