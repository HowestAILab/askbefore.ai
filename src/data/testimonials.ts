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
      "We zoeken het uit op drie niveaus.",
      "Je mensen: waar worden ze nog beter in wat ze al goed doen?",
      "Je processen: wat kan vlotter, en wat pak je fundamenteel anders aan?",
      "Je toekomst: welk nieuw product of dienst wordt plots haalbaar?",
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
    // TODO(content): this entry still carries the Barco quote from the original site.
    // Replace it with a real Howest testimonial.
    company: "Howest",
    logo: howest,
    quote: [
      "We zoeken het uit op drie niveaus.",
      "Je mensen: waar worden ze nog beter in wat ze al goed doen?",
      "Je processen: wat kan vlotter, en wat pak je fundamenteel anders aan?",
      "Je toekomst: welk nieuw product of dienst wordt plots haalbaar?",
    ],
    author: "Eva Careel, Head of Corporate Brand and Communications bij Barco",
  },
];
