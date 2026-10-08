// Central place for links and contact details used across the site.

export const SITE = {
  name: "Askbefore.AI",
  url: "https://askbefore.ai",
  description:
    "Onafhankelijk AI-advies, workshops en proofs of concept van een academische partner.",
  email: "hello@askbefore.ai",
  bookingUrl:
    "https://bookings.cloud.microsoft/book/askbeforeai@hogeschool-wvl.be/?ismsaljsauthenabled",
  // Set this to the company LinkedIn page URL to show the "Blijf op de hoogte" column in the footer.
  linkedin: "",
  address: {
    place: "The Penta, Howest",
    street: "Sint-Martens-Latemlaan 1B, 8500 Kortrijk",
  },
} as const;

export const NAV = [
  { href: "/", label: "Over ons" },
  { href: "/aanbod", label: "Aanbod" },
  { href: "/contact", label: "Contact" },
] as const;
