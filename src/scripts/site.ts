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

window.addEventListener("scroll", updateHeaderState, { passive: true });

// `astro:page-load` fires on the first load and after every client-side navigation.
document.addEventListener("astro:page-load", () => {
  markActiveNav();
  updateHeaderState();
  initCarousel();
});
document.addEventListener("astro:before-swap", destroyCarousel);
