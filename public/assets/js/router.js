// Minimal hash router.
// Routes are "#/path". Page content lives in /pages/<file>.html,
// shared chrome in /partials/*.html.

const DEFAULT_ROUTE = "/over-ons/wat-we-doen";

// route -> page file (in /pages) and the nav link to highlight (null = none)
const ROUTES = {
  "/over-ons/wat-we-doen": { file: "over-ons", nav: "#/over-ons/wat-we-doen" },
  "/aanbod":               { file: "aanbod",  nav: "#/aanbod" },
  "/contact":              { file: "contact", nav: "#/contact" },
  "/privacy":              { file: "privacy", nav: null },
  "/terms":                { file: "terms",   nav: null },
};

const app = document.getElementById("app");
const cache = new Map();

function load(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url).then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
        return res.text();
      })
    );
  }
  return cache.get(url);
}

function normalizeHash(h) {
  h = (h || "").replace(/^#/, "");
  // empty hash (bare link, or logo link to "/") is the home page: Over ons
  if (!h || h === "/") return DEFAULT_ROUTE;
  if (ROUTES[h]) return h;
  // prefix matches for sub-paths/anchors we don't have separate routes for
  for (const route of ["/aanbod", "/over-ons", "/contact", "/privacy", "/terms"]) {
    if (h.indexOf(route) === 0) {
      return route === "/over-ons" ? DEFAULT_ROUTE : route;
    }
  }
  return DEFAULT_ROUTE;
}

function withActiveNav(headerHtml, navHref) {
  if (!navHref) return headerHtml;
  const tpl = document.createElement("template");
  tpl.innerHTML = headerHtml;
  tpl.content.querySelectorAll(".nav-pills a").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === navHref);
  });
  return tpl.innerHTML;
}

let renderId = 0;

async function render() {
  const id = ++renderId;
  const route = normalizeHash(window.location.hash);
  const { file, nav } = ROUTES[route];

  let header, main, footer, legal;
  try {
    [header, main, footer, legal] = await Promise.all([
      load("/partials/header.html"),
      load(`/pages/${file}.html`),
      load("/partials/footer.html"),
      load("/partials/footer-legal.html"),
    ]);
  } catch (err) {
    console.error(err);
    if (id === renderId) app.textContent = "Pagina kon niet geladen worden.";
    return;
  }
  if (id !== renderId) return; // a newer navigation superseded this one

  app.innerHTML =
    '<div class="page-frame">' +
    withActiveNav(header, nav) +
    "<main>" + main + "</main>" +
    footer +
    "</div>" +
    legal;

  window.scrollTo(0, 0);
  if (route === "/over-ons/wat-we-doen" && window.location.hash.indexOf("wat-we-doen") > -1) {
    setTimeout(() => {
      const el = document.getElementById("wat-we-doen");
      if (el) el.scrollIntoView({ behavior: "instant" });
    }, 30);
  }
  if (window.initSiteScripts) window.initSiteScripts();
  if (window.__headerScrollCheck) window.__headerScrollCheck();
}

window.addEventListener("hashchange", render);
render();

// Warm the cache so navigating between pages is instant.
Object.values(ROUTES).forEach(({ file }) => load(`/pages/${file}.html`).catch(() => {}));
