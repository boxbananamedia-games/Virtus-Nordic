import Icecream from "@material-symbols/svg-400/outlined/icecream.svg?react";
import Loyalty from "@material-symbols/svg-400/outlined/loyalty.svg?react";
import Person from "@material-symbols/svg-400/outlined/person.svg?react";
import Add from "@material-symbols/svg-400/outlined/add.svg?react";
import Schedule from "@material-symbols/svg-400/outlined/schedule.svg?react";
import Storefront from "@material-symbols/svg-400/outlined/storefront.svg?react";
import {
  Button,
  Group,
  HomeIndicator,
  NavBar,
  Pill,
  Row,
  Scroll,
  Segmented,
  StatusBar,
  TabBar,
} from "../ios";

/**
 * Guf & Kugler — food and takeaway commerce. Screen 1 of 3: today's scoops.
 *
 * Rebuilt on the iOS foundation kit. The previous version was a header, three
 * rows and a button on a mostly empty stage, which is what made it read as a
 * concept slide. This one carries what a real ordering app carries at this
 * point in the flow: an open/closed state, a live collection window, a
 * segmented filter, a priced menu with availability, loyalty progress and an
 * order already in progress — with the list deliberately running under the tab
 * bar so it reads as a scroll position rather than a composed picture.
 *
 * Scoops stay drawn rather than photographed for now; the generated imagery
 * from Phase 3 drops into `.gk-scoop` without touching this file's structure.
 */

const FLAVOURS = [
  { name: "Hindbær og lakrids", note: "Nyrørt i dag", price: "28", tone: "berry", left: null },
  { name: "Pistacie", note: "Sicilianske nødder", price: "30", tone: "pistachio", left: null },
  {
    name: "Citron og basilikum",
    note: "Sorbet · vegansk",
    price: "26",
    tone: "lemon",
    left: "4 tilbage",
  },
  { name: "Vanilje fra Madagaskar", note: "Klassiker", price: "26", tone: "vanilla", left: null },
  { name: "Mørk chokolade 70%", note: "Uden tilsat sukker", price: "30", tone: "cocoa", left: null },
];

export function GufKuglerScreen() {
  return (
    <div className="vn-scr gk">
      <StatusBar />

      <NavBar
        eyebrow="Guf & Kugler · Bispensgade"
        title="Dagens kugler"
        trailing={
          <span className="gk-open">
            <i />
            Åbent til 21
          </span>
        }
      />

      <Scroll>
        <Segmented items={["I dag", "Sorbet", "Vegansk"]} active={0} />

        <Group header="Dagens smage" footer="Smagene skiftes ud hver morgen kl. 10.">
          {FLAVOURS.map((f) => (
            <Row
              key={f.name}
              avatar={<span className={`gk-scoop gk-scoop--${f.tone}`} />}
              title={f.name}
              sub={f.note}
              value={
                <span className="gk-price">
                  {f.left && <em>{f.left}</em>}
                  <b>{f.price} kr</b>
                </span>
              }
            />
          ))}
        </Group>

        <Group header="Din ordre">
          <Row icon={Add} title="Byg din is" sub="2 kugler · vaffel · drys" value="42 kr" chevron />
          <Row
            icon={Schedule}
            iconBg="var(--app-accent-2)"
            title="Afhentning"
            sub="I dag · klar 12:15"
            trailing={<Pill>Om 20 min</Pill>}
          />
          <Row
            icon={Storefront}
            iconBg="var(--app-accent-3)"
            title="Bispensgade 14"
            sub="450 m herfra"
            chevron
          />
        </Group>

        <Group header="Guf-klub">
          <div className="gk-loyal">
            <div className="gk-loyal-top">
              <span className="ios-subhead">2 kugler til en gratis is</span>
              <span className="ios-headline ios-num">120</span>
            </div>
            <span className="gk-bar">
              <i />
            </span>
            <p className="ios-caption gk-loyal-note">Niveau 2 · Optjent 8 point denne måned</p>
          </div>
        </Group>

        <div className="gk-cta-wrap">
          <Button trailing={<span className="ios-num">42 kr</span>}>Til kassen</Button>
        </div>

        <Group header="Kommende">
          <Row title="Mini-Isbar til fødselsdag" sub="Book til lør. 23. aug." chevron />
          <Row title="Gavekort" sub="Køb og send i appen" chevron />
        </Group>
      </Scroll>

      <TabBar
        items={[
          { label: "I dag", icon: Icecream },
          { label: "Byg", icon: Add },
          { label: "Klub", icon: Loyalty },
          { label: "Mig", icon: Person },
        ]}
        active={0}
      />
      <HomeIndicator />
    </div>
  );
}
