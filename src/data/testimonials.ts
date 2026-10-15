import type { ImageMetadata } from "astro";
import barco from "../assets/images/barco.png";
import grandeco from "../assets/images/grandeco.png";
import howest from "../assets/images/howest.png";
import workshop from "../assets/images/workshop-over-ai-workflows.jpg";
import panel from "../assets/images/panelgesprek-over-ai.jpg";
import gesprek from "../assets/images/gesprek-twee-collegas.jpg";
import overleg from "../assets/images/team-van-askbefore-ai-in-overleg.jpg";
import publiek from "../assets/images/publiek-kijkt-naar-presentatie.jpg";
import penta from "../assets/images/the-penta-howest-gebouw-in-kortrijk.jpg";

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

/**
 * Decorative photos for the back of the cards (visible before a card flips).
 * The carousel repeats the testimonials, so photos are handed out per slide
 * (see TestimonialCarousel.astro); keep at least 6 so the 5 visible cards never share one.
 * `focus` is the CSS object-position: the cards are portrait, the photos landscape.
 */
export const backPhotos: { src: ImageMetadata; focus: string }[] = [
  { src: workshop, focus: "50% 50%" },
  { src: gesprek, focus: "78% 50%" },
  { src: publiek, focus: "45% 50%" },
  { src: panel, focus: "50% 50%" },
  { src: overleg, focus: "38% 50%" },
  { src: penta, focus: "62% 50%" },
];
