import type { ImageMetadata } from "astro";
import barco from "../assets/images/barco.png";
import grandeco from "../assets/images/grandeco.png";
import howest from "../assets/images/howest.png";
import workshop from "../assets/images/workshop-over-ai-workflows.jpg";
import panel from "../assets/images/panelgesprek-over-ai.jpg";
import overleg from "../assets/images/team-van-askbefore-ai-in-overleg.jpg";

export interface Testimonial {
  company: string;
  logo: ImageMetadata;
  /** Decorative photo on the back of the card (shown before it flips). */
  photo: ImageMetadata;
  /** One entry per line; rendered with <br> between lines. */
  quote: string[];
  author: string;
}

export const testimonials: Testimonial[] = [
  {
    company: "Barco",
    logo: barco,
    photo: workshop,
    quote: [
      "AI inzetten begint niet bij de technologie, maar bij het kritisch bekijken van je processen. Door onze communicatieworkflows stap voor stap te ontleden, zie je veel duidelijker waar AI echt waarde toevoegt en waar een eenvoudige automatisatie volstaat. Daar heeft HOWEST ons sterk mee geholpen. Het traject was heel verhelderend, maar nu begint het echte werk: onze learnings implementeren.",
    ],
    author: "Eva Careel, Head of Corporate Brand and Communications bij Barco",
  },
  {
    company: "Grandeco",
    logo: grandeco,
    photo: panel,
    quote: [
      "Een vlotte en professionele samenwerking, met duidelijke communicatie en sterke resultaten. Een partner die echt luistert en oplossingen op maat biedt.",
    ],
    author: "Matthieu Devriendt, Grandeco",
  },
  {
    company: "Howest",
    logo: howest,
    photo: overleg,
    quote: [
      "Kort op de bal, helder in communicatie en gewoon goed werk geleverd.",
    ],
    author: "Annelies Geneyn, Diensthoofd Werving, PR en Communicatie Howest",
  },
];
