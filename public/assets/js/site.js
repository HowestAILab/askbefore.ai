function setupTestimonialCarousel() {
  const carousel = document.querySelector(".testimonial-carousel");
  if (!carousel || typeof Swiper === "undefined") return;
  const el = carousel.querySelector(".testimonial-swiper");
  const slides = el ? el.querySelectorAll(".swiper-slide") : [];
  if (!el || !slides.length) return;
  if (el.swiper) el.swiper.destroy(true, true);

  const uniqueCount = slides.length / 3;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const swiper = new Swiper(el, {
    effect: "coverflow",
    coverflowEffect: { rotate: 45, stretch: 5, depth: 100, scale: 1, modifier: 1, slideShadows: false },
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    spaceBetween: 4,
    loop: true,
    speed: reduceMotion ? 0 : 800,
    watchSlidesProgress: true,
    allowTouchMove: true,
    autoplay: reduceMotion ? false : { delay: 4000, pauseOnMouseEnter: true, disableOnInteraction: false },
  });

  const dotsEl = carousel.querySelector(".carousel-dots");
  if (dotsEl && Number.isInteger(uniqueCount) && uniqueCount > 1) {
    dotsEl.innerHTML = "";
    const dots = Array.from({ length: uniqueCount }, (_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", "Ga naar testimonial " + (i + 1));
      dot.addEventListener("click", () => swiper.slideToLoop(i));
      dotsEl.appendChild(dot);
      return dot;
    });
    const syncDots = () => {
      const active = swiper.realIndex % uniqueCount;
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === active));
    };
    swiper.on("slideChange", syncDots);
    syncDots();
  }
}

window.initSiteScripts = function () {
  setupTestimonialCarousel();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = document.querySelectorAll("[data-reveal]");
  if (!reduceMotion && "IntersectionObserver" in window && items.length) {
    items.forEach((el) => el.classList.add("reveal-init"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => observer.observe(el));
    window.setTimeout(() => {
      items.forEach((el) => el.classList.add("is-visible"));
    }, 2500);
  }
};

(function () {
  const onScroll = () => {
    const header = document.querySelector(".site-header");
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.__headerScrollCheck = onScroll;
})();
