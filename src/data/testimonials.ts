import type { ImageMetadata } from "astro";
import barco from "../assets/images/barco.png";
import grandeco from "../assets/images/grandeco.png";
import howest from "../assets/images/howest.png";

export interface Testimonial {
  company: string;
  logo: ImageMetadata;
  /** One entry per line; rendered with <br> between lines. */
  quote: string[];
  author: string;
}

export const testimonials: Testimonial[] = [
  {
    company: "Barco",
    logo: barco,
    quote: [
      "AI inzetten begint niet bij de technologie, maar bij het kritisch bekijken van je processen. Door onze communicatieworkflows stap voor stap te ontleden, zie je veel duidelijker waar AI echt waarde toevoegt en waar een eenvoudige automatisatie volstaat. Daar heeft HOWEST ons sterk mee geholpen. Het traject was heel verhelderend, maar nu begint het echte werk: onze learnings implementeren.",
    ],
    author: "Eva Careel, Head of Corporate Brand and Communications bij Barco",
  },
  {
    company: "Grandeco",
    logo: grandeco,
    quote: [
      "Een vlotte en professionele samenwerking, met duidelijke communicatie en sterke resultaten. Een partner die echt luistert en oplossingen op maat biedt.",
    ],
    author: "Matthieu Devriendt, Grandeco",
  },
  {
    company: "Howest",
    logo: howest,
    quote: [
      "Kort op de bal, helder in communicatie en gewoon goed werk geleverd.",
    ],
    author: "Annelies Geneyn, Diensthoofd Werving, PR en Communicatie Howest",
  },
];
