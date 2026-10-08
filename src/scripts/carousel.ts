import Swiper from "swiper";
import { A11y, Autoplay, EffectCoverflow, Keyboard, Mousewheel, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";

let current: Swiper | undefined;

/** Tear down the current instance (called before a page swap and before re-initialising). */
export function destroyCarousel() {
  current?.destroy(true, true);
  current = undefined;
}

export function initCarousel() {
  destroyCarousel();

  const root = document.querySelector<HTMLElement>(".testimonial-carousel");
  const el = root?.querySelector<HTMLElement>(".testimonial-swiper");
  if (!root || !el) return;

  const unique = Number(root.dataset.unique) || 1;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const swiper = new Swiper(el, {
    modules: [A11y, Autoplay, EffectCoverflow, Keyboard, Mousewheel, Navigation],
    effect: "coverflow",
    coverflowEffect: { rotate: 45, stretch: 5, depth: 100, scale: 1, modifier: 1, slideShadows: false },
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    spaceBetween: 4,
    loop: true,
    speed: reduceMotion ? 0 : 700,
    watchSlidesProgress: true,
    // Scrollable: drag/swipe, trackpad (horizontal), keyboard arrows and the side buttons.
    allowTouchMove: true,
    mousewheel: { forceToAxis: true },
    keyboard: { enabled: true, onlyInViewport: true },
    navigation: {
      prevEl: root.querySelector<HTMLElement>(".carousel-prev"),
      nextEl: root.querySelector<HTMLElement>(".carousel-next"),
    },
    a11y: {
      prevSlideMessage: "Vorige testimonial",
      nextSlideMessage: "Volgende testimonial",
    },
    // Stops for good as soon as the visitor interacts, and pauses while hovering.
    autoplay: reduceMotion ? false : { delay: 5000, pauseOnMouseEnter: true, disableOnInteraction: true },
  });
  current = swiper;

  // Only auto-advance while the carousel is on screen.
  if (!reduceMotion && "IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        if (!swiper.autoplay) return;
        entry.isIntersecting ? swiper.autoplay.start() : swiper.autoplay.stop();
      },
      { threshold: 0.35 }
    ).observe(root);
  }

  const dotsEl = root.querySelector<HTMLElement>(".carousel-dots");
  if (dotsEl && unique > 1) {
    dotsEl.replaceChildren();
    const dots = Array.from({ length: unique }, (_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `Ga naar testimonial ${i + 1}`);
      dot.addEventListener("click", () => {
        swiper.autoplay?.stop();
        swiper.slideToLoop(i);
      });
      dotsEl.appendChild(dot);
      return dot;
    });
    const sync = () => {
      const active = swiper.realIndex % unique;
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === active);
        dot.toggleAttribute("aria-current", i === active);
      });
    };
    swiper.on("slideChange", sync);
    sync();
  }
}
