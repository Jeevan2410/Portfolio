import { GITHUB_USER, LINKS, MERGED_FALLBACK, PROJECTS, REBUILDS, SKILLS, TIMELINE } from "./data.js";
import { fetchMerged } from "./github.js";
import { createGlobe } from "./globe.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const root = document.documentElement;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");

/** Build an element; text goes in with textContent, so data can never inject markup. */
function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "class") node.className = value;
    else if (key === "style") node.style.cssText = value;
    else if (key in node && key !== "role") node[key] = value;
    else node.setAttribute(key, value);
  }
  node.append(...children.flat().filter((child) => child !== null && child !== undefined && child !== false));
  return node;
}

const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';
const CODE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 7-5 5 5 5M16 7l5 5-5 5"/></svg>';

function linkButton(href, label, icon, name) {
  const link = el("a", { class: "chip-link", href, target: "_blank", rel: "noopener", "aria-label": `${label}: ${name}` });
  link.innerHTML = icon;
  link.append(label);
  return link;
}

function visual(project, index) {
  if (project.image) {
    // The first screenshot is near the top of the page, so it loads straight away; the rest wait until needed.
    const loading = index === 0 ? "eager" : "lazy";
    return el(
      "div",
      { class: "shot" },
      el("img", { src: project.image, alt: `${project.name} screenshot`, loading, decoding: "async", width: 1280, height: 800 }),
    );
  }
  // Backend work has no screenshot: show what it does as a little terminal that types itself out.
  return el(
    "div",
    { class: "shot terminal", "aria-hidden": "true" },
    el("div", { class: "terminal-bar" }, el("i"), el("i"), el("i")),
    project.terminal.map(([mark, text], i) =>
      el("p", { style: `--line:${i}` }, el("span", { class: "mark" }, mark), el("span", {}, text)),
    ),
  );
}

function projectCard(project, index) {
  return el(
    "article",
    { class: `card reveal${project.featured ? " featured" : ""}`, style: `--i:${index % 3}` },
    el("div", { class: "glare", "aria-hidden": "true" }),
    visual(project, index),
    el(
      "div",
      { class: "card-body" },
      el("h3", {}, project.name),
      el("p", {}, project.summary),
      el(
        "ul",
        { class: "tags", "aria-label": "Built with" },
        project.stack.map((tag) => el("li", {}, tag)),
      ),
      el(
        "div",
        { class: "card-links" },
        project.live && linkButton(project.live, "Live", ARROW, project.name),
        project.code && linkButton(project.code, "Code", CODE, project.name),
      ),
    ),
  );
}

function rebuildCard(project, index) {
  return el(
    "article",
    { class: "mini reveal", style: `--i:${index}` },
    el("img", { src: project.image, alt: `${project.name} screenshot`, loading: "lazy", decoding: "async", width: 1280, height: 800 }),
    el(
      "div",
      { class: "mini-body" },
      el("h3", {}, project.name),
      el("p", {}, project.summary),
      el(
        "div",
        { class: "card-links" },
        linkButton(project.live, "Live", ARROW, project.name),
        linkButton(project.code, "Code", CODE, project.name),
      ),
    ),
  );
}

function contributionItem(pr, index) {
  const [owner] = pr.repo.split("/");
  return el(
    "li",
    { class: "reveal", style: `--i:${Math.min(index, 4)}` },
    el("img", { class: "avatar", src: `https://github.com/${owner}.png?size=64`, alt: "", width: 32, height: 32, loading: "lazy" }),
    el(
      "a",
      { href: pr.url, target: "_blank", rel: "noopener" },
      el("span", { class: "pr-repo" }, `${pr.repo} #${pr.number}`),
      el("span", { class: "pr-title" }, pr.title),
    ),
    el("time", { dateTime: pr.mergedAt }, formatDate(pr.mergedAt)),
  );
}

const formatDate = (iso) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "";

function renderStatic() {
  $("#projects").replaceChildren(...PROJECTS.map(projectCard));
  $("#rebuilds").replaceChildren(...REBUILDS.map(rebuildCard));
  $("#timeline").replaceChildren(
    ...TIMELINE.map((item, i) =>
      el(
        "li",
        { class: "reveal", style: `--i:${i}` },
        el("span", { class: "when" }, item.when),
        el("div", {}, el("strong", {}, item.what), item.where && el("span", {}, item.where)),
      ),
    ),
  );
  $("#skills").replaceChildren(
    ...SKILLS.map((row, i) =>
      el(
        "div",
        { class: `marquee${i % 2 ? " reverse" : ""}` },
        // Two copies so the loop is seamless; the second is hidden from screen readers.
        el("ul", {}, row.map((skill) => el("li", {}, skill))),
        el("ul", { "aria-hidden": "true" }, row.map((skill) => el("li", {}, skill))),
      ),
    ),
  );
  $("#stat-live").dataset.count = [...PROJECTS, ...REBUILDS].filter((project) => project.live).length;
  for (const link of document.querySelectorAll("[data-link]")) link.href = LINKS[link.dataset.link];
  $("#year").textContent = new Date().getFullYear();
}

async function renderOpenSource() {
  const live = await fetchMerged(GITHUB_USER);
  const items = live?.items?.length ? live.items : MERGED_FALLBACK;
  const total = live?.total ?? MERGED_FALLBACK.length;
  const repos = new Set(items.map((pr) => pr.repo)).size;
  $("#stat-prs").dataset.count = total;
  $("#os-count").textContent = total;
  $("#os-repos").textContent = repos;
  $("#prs").replaceChildren(...items.slice(0, 8).map(contributionItem));
  $("#os-source").textContent = live ? "Live from GitHub" : "Saved list";
  observeReveals($("#prs"));
  countUp($("#stat-prs"));
}

/* ---------- motion ---------- */

let revealObserver;
function observeReveals(scope = document) {
  for (const node of scope.querySelectorAll(".reveal:not(.in)")) {
    if (reduceMotion.matches || !revealObserver) node.classList.add("in");
    else revealObserver.observe(node);
  }
}

function countUp(node) {
  const target = Number(node.dataset.count);
  if (!Number.isFinite(target)) return;
  if (reduceMotion.matches || node.dataset.done) {
    node.textContent = target;
    return;
  }
  const start = performance.now();
  const from = Number(node.textContent) || 0;
  const step = (now) => {
    const t = Math.min((now - start) / 1100, 1);
    node.textContent = Math.round(from + (target - from) * (1 - (1 - t) ** 3));
    if (t < 1) requestAnimationFrame(step);
    else node.dataset.done = "1";
  };
  requestAnimationFrame(step);
}

function setUpMotion() {
  if (!reduceMotion.matches && "IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
  }
  observeReveals();

  // Stats count up the first time they come into view.
  const statObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      countUp(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
  for (const stat of document.querySelectorAll("[data-count]")) statObserver.observe(stat);

  // The header gains a glass background once the hero scrolls away.
  new IntersectionObserver(([entry]) => root.classList.toggle("scrolled", !entry.isIntersecting)).observe($("#top-sentinel"));

  // Highlight the nav link for the section in view.
  const links = new Map([...document.querySelectorAll(".nav a[href^='#']")].map((a) => [a.hash.slice(1), a]));
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const [id, a] of links) {
          if (id === entry.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        }
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  for (const id of links.keys()) {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  }

  // Cards tilt toward the pointer with a moving glare.
  document.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reduceMotion.matches) return;
    const card = event.target.closest?.(".card, .mini");
    if (!card) return;
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    card.style.setProperty("--rx", `${((0.5 - y) * 7).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${((x - 0.5) * 9).toFixed(2)}deg`);
    card.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    card.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
  });
  document.addEventListener(
    "pointerout",
    (event) => {
      const card = event.target.closest?.(".card, .mini");
      if (card && !card.contains(event.relatedTarget)) {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      }
    },
    true,
  );

  // Buttons lean toward the pointer like magnets.
  for (const button of document.querySelectorAll(".magnetic")) {
    button.addEventListener("pointermove", (event) => {
      if (!finePointer.matches || reduceMotion.matches) return;
      const box = button.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      button.style.transform = `translate(${dx * 0.22}px, ${dy * 0.3}px)`;
    });
    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  }

  // A soft spotlight follows the pointer across the page.
  document.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reduceMotion.matches) return;
    root.style.setProperty("--mx", `${event.clientX}px`);
    root.style.setProperty("--my", `${event.clientY}px`);
  });
}

/* ---------- theme ---------- */

let globe;
function paintThemeButton() {
  $("#theme").setAttribute("aria-label", `Switch to ${root.dataset.theme === "light" ? "dark" : "light"} theme`);
}

$("#theme").addEventListener("click", (event) => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  const apply = () => {
    root.dataset.theme = next;
    try {
      localStorage.setItem("portfolio:theme", next);
    } catch {
      // Storage blocked: the theme lasts for this visit.
    }
    paintThemeButton();
    globe?.refresh();
  };
  if (!document.startViewTransition || reduceMotion.matches) return apply();
  const box = event.currentTarget.getBoundingClientRect();
  root.style.setProperty("--reveal-x", `${box.left + box.width / 2}px`);
  root.style.setProperty("--reveal-y", `${box.top + box.height / 2}px`);
  document.startViewTransition(apply);
});

/* ---------- start ---------- */

renderStatic();
paintThemeButton();
setUpMotion();
globe = createGlobe($("#globe"), { reduceMotion });
renderOpenSource();
requestAnimationFrame(() => root.classList.add("ready"));
