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

/** Keep --header-h in sync with the real header height (the home hero slides up underneath it). */
let headerObserver: ResizeObserver | undefined;
function trackHeaderHeight() {
  const header = document.querySelector<HTMLElement>(".site-header");
  if (!header || headerObserver) return;
  const set = () => document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`);
  set();
  headerObserver = new ResizeObserver(set);
  headerObserver.observe(header);
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
