// Generated from Marketing/privacy-policy.md and Marketing/terms-of-service.md
// in the Unruled repo (github.com/.../Freedom 2.0), by a one-off Python script.
// To update: edit those Markdown files, regenerate, and paste the result back in.
// Do not hand-edit the arrays below — edit the source Markdown instead.

export type LegalSection =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "updated"; text: string };

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    "type": "h1",
    "text": "Privacy Policy — Unruled"
  },
  {
    "type": "updated",
    "text": "Last updated: 2 August 2026"
  },
  {
    "type": "p",
    "text": "Unruled is made by Virtus Nordic, Denmark. This policy explains exactly what the app does with your information. It is written to be accurate rather than broad: everything below was checked against what the app actually does, not what it might do one day."
  },
  {
    "type": "p",
    "text": "The short version: **Unruled works without an account, and your blocklists, schedules and focus history never leave your iPhone.** There is no analytics, no advertising, no tracking, and nothing is sold."
  },
  {
    "type": "h2",
    "text": "What stays on your device"
  },
  {
    "type": "p",
    "text": "All of the following is stored only on your iPhone, in a private container shared between Unruled and its own extensions. None of it is transmitted anywhere:"
  },
  {
    "type": "ul",
    "items": [
      "Your blocklists — the apps and websites you choose to block",
      "Your schedules and day templates",
      "Your focus session history, streaks and totals",
      "Your app settings"
    ]
  },
  {
    "type": "p",
    "text": "Deleting Unruled removes all of it. It is not backed up to us, because we never receive it."
  },
  {
    "type": "h2",
    "text": "Screen Time and your apps"
  },
  {
    "type": "p",
    "text": "Unruled uses Apple's Screen Time (Family Controls) framework to shield apps. This matters for your privacy in a specific way:"
  },
  {
    "type": "p",
    "text": "**Unruled cannot see which apps you chose.** When you pick apps in the system picker, iOS hands the app an opaque token rather than a name or bundle identifier. The tokens are meaningless outside your device. Screen Time also gives Unruled no access to your usage history, and the app does not request it."
  },
  {
    "type": "p",
    "text": "The shields themselves are applied by iOS, not by us."
  },
  {
    "type": "h2",
    "text": "Website blocking and the VPN configuration"
  },
  {
    "type": "p",
    "text": "To block websites, Unruled adds a **local VPN configuration**. This is a standard iOS mechanism and it is worth being precise about what it does:"
  },
  {
    "type": "ul",
    "items": [
      "It runs entirely on your device. Your browsing is **not** routed through our servers. We operate no proxy and no VPN server.",
      "It inspects DNS lookups — the step where a domain name is turned into an address — and answers blocked domains with a \"not found\" reply.",
      "Lookups that are **not** blocked are forwarded to **Cloudflare's public DNS resolver at 1.1.1.1** so that ordinary browsing works. Those queries are subject to [Cloudflare's privacy commitments](https://developers.cloudflare.com/1.1.1.1/privacy/). This is the same kind of lookup your device already performs; Unruled does not log, store or transmit it."
    ]
  },
  {
    "type": "p",
    "text": "Website blocking is active only while a session or a scheduled block is running."
  },
  {
    "type": "h2",
    "text": "If you choose to create an account"
  },
  {
    "type": "p",
    "text": "An account is **optional**. Unruled is fully functional without one. You only need one for referral codes, and (in future) for syncing between devices."
  },
  {
    "type": "p",
    "text": "If you sign in, we receive and store:"
  },
  {
    "type": "ul",
    "items": [
      "**Your email address**",
      "**A user identifier** created for you"
    ]
  },
  {
    "type": "p",
    "text": "Sign-in is handled by [Supabase](https://supabase.com), which hosts our authentication on our behalf as a data processor. If you use **Sign in with Apple**, Apple can hide your real address behind a private relay — we then only ever see the relay address."
  },
  {
    "type": "p",
    "text": "If you use a referral code, we store the code, which account created it, and which account redeemed it, so the reward can be granted once and not repeatedly."
  },
  {
    "type": "p",
    "text": "We do not store your blocklists, schedules or history on our servers."
  },
  {
    "type": "h2",
    "text": "Purchases"
  },
  {
    "type": "p",
    "text": "Purchases and subscriptions are handled entirely by **Apple**. We never see your card details, billing address or Apple ID password. We receive only whether an entitlement is active."
  },
  {
    "type": "p",
    "text": "At the time of writing, Unruled is free and offers no in-app purchases."
  },
  {
    "type": "h2",
    "text": "Notifications"
  },
  {
    "type": "p",
    "text": "Notifications are scheduled **locally on your device** — a session start, an ending-soon reminder, and a sound when a session ends. There are no push notifications, so no notification token is sent to us or to anyone else."
  },
  {
    "type": "h2",
    "text": "What we do not do"
  },
  {
    "type": "ul",
    "items": [
      "We do **not** use analytics, crash reporting, advertising or attribution SDKs. There are none in the app.",
      "We do **not** track you across apps or websites, and do not request Apple's tracking permission.",
      "We do **not** sell or share your personal information.",
      "We do **not** profile you or make automated decisions about you."
    ]
  },
  {
    "type": "h2",
    "text": "Your rights"
  },
  {
    "type": "p",
    "text": "If you have an account, you can ask us to give you a copy of the data associated with it, correct it, or delete it. Because almost everything Unruled knows about your use of it lives on your own device, deletion is usually as simple as deleting the app."
  },
  {
    "type": "p",
    "text": "If you are in the EU or UK, you have rights under the GDPR including access, rectification, erasure, restriction, objection and portability, and the right to complain to your local supervisory authority. In Denmark that is Datatilsynet."
  },
  {
    "type": "p",
    "text": "Our lawful basis for processing account data is performance of a contract (providing the account features you asked for). We keep account data for as long as the account exists."
  },
  {
    "type": "h2",
    "text": "Children"
  },
  {
    "type": "p",
    "text": "Unruled is not directed at children under 13 and we do not knowingly collect their personal information."
  },
  {
    "type": "h2",
    "text": "Changes"
  },
  {
    "type": "p",
    "text": "If this policy changes materially we will update the date at the top and, where appropriate, tell you in the app."
  },
  {
    "type": "h2",
    "text": "Contact"
  },
  {
    "type": "p",
    "text": "Questions, or a request about your data:"
  },
  {
    "type": "p",
    "text": "**[YOUR SUPPORT EMAIL]** Virtus Nordic, Denmark"
  }
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    "type": "h1",
    "text": "Terms of Service — Unruled"
  },
  {
    "type": "updated",
    "text": "Last updated: 2 August 2026"
  },
  {
    "type": "p",
    "text": "These terms are an agreement between you and **Virtus Nordic**, Denmark (\"we\", \"us\"), covering your use of the Unruled iOS app. By installing or using Unruled, you accept them. If you do not accept them, do not use the app."
  },
  {
    "type": "h2",
    "text": "1. What Unruled is"
  },
  {
    "type": "p",
    "text": "Unruled is a focus tool. It uses Apple's Screen Time framework to shield apps you choose, and a local on-device filter to block websites you choose, for periods you set."
  },
  {
    "type": "p",
    "text": "It is a **self-discipline aid, not a security product**. It is not parental-control software, not a content filter for someone else's device, and not a guarantee that any particular app or website will be unreachable. Determined circumvention is possible — iOS settings can be changed and the app can be deleted."
  },
  {
    "type": "h2",
    "text": "2. Please read this before you block anything"
  },
  {
    "type": "p",
    "text": "**Do not block apps or services you might need urgently.** You choose what Unruled blocks. If you add your phone, messages, maps, banking or health apps to a blocklist, they will be shielded while a session runs. The \"The Whole Internet\" blocklist blocks all network access."
  },
  {
    "type": "p",
    "text": "**Locked Mode cannot be cancelled.** That is its entire purpose. If you start a locked session, you agree that you will not be able to end it early — the shields lift when the timer expires. Choose the length and the blocklists deliberately before you start one."
  },
  {
    "type": "p",
    "text": "You are responsible for what you choose to block and for how long. We are not responsible for anything you miss while a block you configured is running."
  },
  {
    "type": "h2",
    "text": "3. Your licence"
  },
  {
    "type": "p",
    "text": "We grant you a personal, non-transferable, revocable licence to use Unruled on Apple devices you own or control, as permitted by the App Store Terms of Service. You may not copy, redistribute, sell, reverse-engineer or attempt to derive the source code of the app, except where that restriction is prohibited by law."
  },
  {
    "type": "h2",
    "text": "4. Accounts"
  },
  {
    "type": "p",
    "text": "An account is optional; Unruled works fully without one. If you create one, you agree to provide an email address you control, and to keep your credentials secure. You are responsible for activity under your account. We may suspend or remove accounts used abusively — for example, to farm referral rewards."
  },
  {
    "type": "p",
    "text": "How we handle account data is described in our [Privacy Policy](privacy.html)."
  },
  {
    "type": "h2",
    "text": "5. Referrals"
  },
  {
    "type": "p",
    "text": "If we offer referral rewards, they are a courtesy, not an entitlement. Codes are for personal sharing between real people. We may withhold or reverse rewards obtained through self-referral, automation, bulk distribution or misrepresentation, and we may change or end the programme at any time."
  },
  {
    "type": "h2",
    "text": "6. Purchases"
  },
  {
    "type": "p",
    "text": "At the time of writing, Unruled is free and offers no in-app purchases."
  },
  {
    "type": "p",
    "text": "If we later offer paid features or subscriptions, they are sold and billed by **Apple** under the App Store Terms of Service. Prices, currencies and taxes are as shown at the point of purchase. Subscriptions renew automatically until cancelled in your Apple account settings, and cancellation takes effect at the end of the current period. **Refunds are handled by Apple**, not by us."
  },
  {
    "type": "h2",
    "text": "7. Availability and changes"
  },
  {
    "type": "p",
    "text": "We may add, change, or remove features, and may stop offering the app. We aim not to break things you rely on, but we do not promise that any specific feature will remain available or that the app will be uninterrupted or error-free."
  },
  {
    "type": "h2",
    "text": "8. No warranty"
  },
  {
    "type": "p",
    "text": "Unruled is provided **\"as is\" and \"as available\"**, without warranties of any kind, express or implied, including fitness for a particular purpose and non-infringement, to the fullest extent permitted by law."
  },
  {
    "type": "p",
    "text": "**Nothing in these terms limits your statutory rights as a consumer.** If you are a consumer in the EU, EEA or UK, you keep all rights you have under mandatory local law, including remedies for goods or digital content that are not as described."
  },
  {
    "type": "h2",
    "text": "9. Limitation of liability"
  },
  {
    "type": "p",
    "text": "To the fullest extent permitted by law, we are not liable for indirect, incidental, special or consequential loss, or for lost profits, revenue, data, or missed opportunities, arising from your use of Unruled — including anything you missed while a block you configured was active."
  },
  {
    "type": "p",
    "text": "Where liability cannot lawfully be excluded, it is limited to the greater of the amount you paid us for the app in the twelve months before the claim, or EUR 50."
  },
  {
    "type": "p",
    "text": "Nothing here excludes liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot be excluded by law."
  },
  {
    "type": "h2",
    "text": "10. Termination"
  },
  {
    "type": "p",
    "text": "You may stop using Unruled at any time by deleting it. We may end your licence if you materially breach these terms. Sections 8, 9 and 12 survive termination."
  },
  {
    "type": "h2",
    "text": "11. Apple"
  },
  {
    "type": "p",
    "text": "You acknowledge that:"
  },
  {
    "type": "ul",
    "items": [
      "These terms are between **you and us only — not with Apple**. Apple is not responsible for Unruled or its contents.",
      "Apple has **no obligation to provide maintenance or support** for Unruled.",
      "If Unruled fails to conform to any applicable warranty, you may notify Apple, and Apple may refund the purchase price (if any). To the maximum extent permitted by law, Apple has **no other warranty obligation** in respect of Unruled.",
      "**We, not Apple**, are responsible for addressing any claim relating to Unruled, including product liability, legal or regulatory non-compliance, and consumer protection claims.",
      "**We, not Apple**, are responsible for investigating and resolving any third-party claim that Unruled infringes intellectual property rights.",
      "You represent that you are not located in a country subject to a U.S. Government embargo or designated as terrorist-supporting, and that you are not on any U.S. Government prohibited-party list.",
      "Apple and its subsidiaries are **third-party beneficiaries of these terms** and may enforce them against you."
    ]
  },
  {
    "type": "h2",
    "text": "12. Governing law"
  },
  {
    "type": "p",
    "text": "These terms are governed by the laws of **Denmark**, and disputes fall to the Danish courts — except that, if you are a consumer, you may also bring proceedings in the courts of your country of residence and rely on its mandatory consumer-protection law."
  },
  {
    "type": "h2",
    "text": "13. Changes to these terms"
  },
  {
    "type": "p",
    "text": "If we change these terms materially, we will update the date above and, where appropriate, notify you in the app. Continuing to use Unruled after a change means you accept it."
  },
  {
    "type": "h2",
    "text": "14. Contact"
  },
  {
    "type": "p",
    "text": "**[YOUR SUPPORT EMAIL]** Virtus Nordic, Denmark"
  }
];
