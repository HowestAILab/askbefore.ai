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

/**
 * Links to an anchor on the same page (e.g. "Onze trajecten") scroll there slowly.
 * The browser's own smooth scroll has a fixed speed, so this animates it by hand.
 */
const SCROLL_MS = 1400;
let scrollFrame = 0;
function scrollToAnchor(target: HTMLElement) {
  const root = document.documentElement;
  const offset = parseFloat(getComputedStyle(target).scrollMarginTop) || parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
  const maxTop = root.scrollHeight - window.innerHeight;
  const to = Math.min(Math.max(target.getBoundingClientRect().top + window.scrollY - offset, 0), maxTop);
  const from = window.scrollY;
  const start = performance.now();
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // easeInOutCubic
  cancelAnimationFrame(scrollFrame);
  const step = (now: number) => {
    const t = Math.min((now - start) / SCROLL_MS, 1);
    window.scrollTo({ top: from + (to - from) * ease(t), behavior: "instant" });
    if (t < 1) scrollFrame = requestAnimationFrame(step);
  };
  scrollFrame = requestAnimationFrame(step);
}
document.addEventListener(
  "click",
  (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href*='#']");
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.pathname !== location.pathname || !url.hash || url.hash === "#") return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    e.stopPropagation();
    history.pushState(null, "", url.hash);
    scrollToAnchor(target);
  },
  true,
);
// Any manual scroll input stops the animation.
["wheel", "touchstart", "keydown"].forEach((ev) =>
  window.addEventListener(ev, () => cancelAnimationFrame(scrollFrame), { passive: true }),
);

window.addEventListener("scroll", updateHeaderState, { passive: true });

// `astro:page-load` fires on the first load and after every client-side navigation.
document.addEventListener("astro:page-load", () => {
  markActiveNav();
  updateHeaderState();
  trackHeaderHeight();
  initCarousel();
});
document.addEventListener("astro:before-swap", destroyCarousel);
