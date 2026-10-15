import { destroyCarousel, initCarousel } from "./carousel";

/** Highlight the nav pill that matches the current page. */
function markActiveNav() {
  const path = location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll<HTMLAnchorElement>(".nav-pills a").forEach((a) => {
    const href = new URL(a.href).pathname.replace(/\/$/, "") || "/";
    const active = href === path;
    a.classList.toggle("active", active);
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

/** Shrink the logo once the page has been scrolled a little. */
function updateHeaderState() {
  document.querySelector(".site-header")?.classList.toggle("is-scrolled", window.scrollY > 8);
}

/**
 * Keep --header-h in sync with the header's height at the top of the page (the home hero slides up underneath it).
 * The header gets lower once scrolled; that must not change the value, or the page jumps when you scroll back up.
 */
let headerObserver: ResizeObserver | undefined;
function trackHeaderHeight() {
  const header = document.querySelector<HTMLElement>(".site-header");
  if (!header || headerObserver) return;
  const setVar = (h: number) => document.documentElement.style.setProperty("--header-h", `${h}px`);
  /** Height of the header in its top-of-page state, even if the page is currently scrolled. */
  const measure = () => {
    const scrolled = header.classList.contains("is-scrolled");
    if (!scrolled) return header.offsetHeight;
    const keep = header.style.transition;
    header.style.transition = "none";
    header.classList.remove("is-scrolled");
    const h = header.offsetHeight;
    header.classList.add("is-scrolled");
    void header.offsetHeight; // apply the restored state before transitions come back
    header.style.transition = keep;
    return h;
  };
  setVar(measure());
  // Only react while the header is in its top state (padding changes while scrolling must not count).
  // The content box ignores padding, so watch the border box.
  headerObserver = new ResizeObserver(() => {
    if (!header.classList.contains("is-scrolled")) setVar(header.offsetHeight);
  });
  headerObserver.observe(header, { box: "border-box" });
  let timer: number | undefined;
  window.addEventListener("resize", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => setVar(measure()), 150);
  });
}

window.addEventListener("scroll", updateHeaderState, { passive: true });

// `astro:page-load` fires on the first load and after every client-side navigation.
document.addEventListener("astro:page-load", () => {
  markActiveNav();
  updateHeaderState();
  trackHeaderHeight();
  initCarousel();
});
document.addEventListener("astro:before-swap", destroyCarousel);
