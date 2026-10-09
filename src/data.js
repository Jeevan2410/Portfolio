// Everything the page says about the work lives here, so updating the portfolio means editing data, not markup.

export const GITHUB_USER = "Jeevan2410";

export const LINKS = {
  github: "https://github.com/Jeevan2410",
  linkedin: "https://www.linkedin.com/in/jeevan-kumar001",
};

/** Featured work, in the order it appears. `image` is optional; cards without one get a code-style visual. */
export const PROJECTS = [
  {
    name: "AdikeCast",
    summary:
      "Weekly arecanut price forecasts for Dakshina Kannada markets, turned into a plain Sell / Hold signal for farmers, in English and Kannada, with a free JSON API.",
    stack: ["Next.js 16", "TypeScript", "Zod", "i18n"],
    image: "assets/work/adikecast.webp",
    live: "https://adikecast.vercel.app",
    code: "https://github.com/Jeevan2410/price-forecasting",
    featured: true,
  },
  {
    name: "Tiny Planet: Shrines of the Blight",
    summary: "A 3D action-RPG on a tiny round world, with quests, gear, saves and a synthesised audio engine.",
    stack: ["Three.js", "TypeScript", "Vite", "IndexedDB"],
    image: "assets/work/rpg.webp",
    live: "https://tiny-planet-action-rpg.vercel.app",
    code: "https://github.com/Jeevan2410/Tiny-Planet-Action-RPG",
    featured: true,
  },
  {
    name: "BookNest",
    summary:
      "A bookstore and book-box subscription site: browse by genre, build a box, gifts, membership, accounts and checkout.",
    stack: ["React", "Supabase", "Framer Motion"],
    image: "assets/work/booknest.webp",
    live: "https://book-nest-lemon-eight.vercel.app",
    code: "https://github.com/Jeevan2410/BookNest",
  },
  {
    name: "Tiny Planet Courier",
    summary: "A multiplayer browser delivery game: walk a small planet and hand parcels to other players in real time.",
    stack: ["Three.js", "Supabase Realtime"],
    image: "assets/work/courier.webp",
    live: "https://tiny-planet-courier.vercel.app",
    code: "https://github.com/Jeevan2410/Tiny-Planet-Courier",
  },
  {
    name: "CineGen API",
    summary:
      "Backend for AI video and image generation: JWT auth and roles, credits, async jobs on a queue, signed webhooks and a fallback poller.",
    stack: ["Node.js", "Express", "MongoDB", "Cloudinary"],
    code: "https://github.com/Jeevan2410/CineGen-API",
    terminal: [
      ["$", "curl -X POST /v1/jobs -H 'Authorization: Bearer …'"],
      ["←", "202 Accepted  { id: 'job_8f2c', status: 'queued' }"],
      ["•", "worker picked up job_8f2c (credits −4)"],
      ["→", "POST https://client.app/hook  x-signature: sha256=…"],
      ["✓", "job_8f2c completed in 41s"],
    ],
  },
  {
    name: "QuoteFlow",
    summary: "Quote-to-cash SaaS for small service businesses: enquiries, quotes, jobs and follow-ups in one place.",
    stack: ["Next.js 16", "TypeScript", "Cloudflare Workers"],
    code: "https://github.com/Jeevan2410/projrc",
    terminal: [
      ["$", "new enquiry from Asha · bathroom retile"],
      ["→", "quote Q-1042 drafted · ₹48,500"],
      ["✓", "quote accepted · job scheduled for Mon"],
      ["•", "follow-up reminder set · 3 days"],
    ],
  },
];

/** Early college projects, rebuilt in 2026 with today's code and motion. */
export const REBUILDS = [
  {
    name: "Weather",
    summary: "Animated sky that follows the weather: canvas rain and snow, storms, stars at night. Open-Meteo, no API key.",
    image: "assets/work/weather.webp",
    live: "https://weather-app-lac-iota-59.vercel.app",
    code: "https://github.com/Jeevan2410/WeatherApp",
  },
  {
    name: "Calculator",
    summary: "A safe parser instead of eval(), live answers, history, keyboard support and a 3D tilt.",
    image: "assets/work/calculator.webp",
    live: "https://calculator-six-iota-56.vercel.app",
    code: "https://github.com/Jeevan2410/Calculator",
  },
  {
    name: "Jeevan Travels",
    summary: "Was a template with fake login forms and 52 MB of video; now a trip planner on a 3D dotted globe with live weather and share links.",
    image: "assets/work/travels.webp",
    live: "https://travel-website-ashen-seven.vercel.app",
    code: "https://github.com/Jeevan2410/Travel-Website-",
  },
  {
    name: "JeevanKitchen",
    summary: "Was a restaurant template with fake forms; now recipes with a cook mode, one-tap timers from the method, and a screen that stays awake.",
    image: "assets/work/kitchen.webp",
    live: "https://food-website-lovat-pi.vercel.app",
    code: "https://github.com/Jeevan2410/Food-Website",
  },
  {
    name: "Halcyon One",
    summary: "Was a store demo with brand names and invented reviews; now a concept smartwatch page with a 3D Three.js model that turns as you scroll.",
    image: "assets/work/halcyon.webp",
    live: "https://jeevan2410.github.io/Landing-Page/",
    code: "https://github.com/Jeevan2410/Landing-Page",
  },
  {
    name: "Reelhouse",
    summary: "Was a copied streaming sign-up page; now an original show browser on TVmaze: billboard, rows, details, search, My List.",
    image: "assets/work/reelhouse.webp",
    live: "https://jeevan2410.github.io/Netflix-Clone/",
    code: "https://github.com/Jeevan2410/Netflix-Clone",
  },
  {
    name: "To-do",
    summary: "Drag to reorder, undo, filters, FLIP animations and confetti; safe JSON storage instead of saved HTML.",
    image: "assets/work/todo.webp",
    live: "https://jeevan2410.github.io/TO-DO-LIST/",
    code: "https://github.com/Jeevan2410/TO-DO-LIST",
  },
];

/** Shown when GitHub can't be reached; the page fetches the live list when it can. */
export const MERGED_FALLBACK = [
  {
    repo: "libredb/libredb-studio",
    number: 1609,
    title: "The Explain panel works on Vitess 25, which refuses to explain a statement naming no table",
    url: "https://github.com/libredb/libredb-studio/pull/1609",
    mergedAt: "2026-10-09",
  },
  {
    repo: "libredb/libredb-studio",
    number: 1595,
    title: "CockroachDB routines no longer offer an Edit that every apply refused",
    url: "https://github.com/libredb/libredb-studio/pull/1595",
    mergedAt: "2026-10-08",
  },
  {
    repo: "libredb/libredb-studio",
    number: 1571,
    title: "ClickHouse, Druid, libSQL and Couchbase name the refusal and address instead of fetch failed",
    url: "https://github.com/libredb/libredb-studio/pull/1571",
    mergedAt: "2026-10-08",
  },
  {
    repo: "libredb/libredb-studio",
    number: 1561,
    title: "Editor drops a selected statement's trailing terminator on engines that take none",
    url: "https://github.com/libredb/libredb-studio/pull/1561",
    mergedAt: "2026-10-07",
  },
  {
    repo: "lingui/js-lingui",
    number: 2703,
    title: "Vite plugin's native macro transform no longer fails on module ids with a query string",
    url: "https://github.com/lingui/js-lingui/pull/2703",
    mergedAt: "2026-10-06",
  },
  {
    repo: "libredb/libredb-studio",
    number: 1562,
    title: "LibreDB connections refuse :memory: and name a missing directory clearly",
    url: "https://github.com/libredb/libredb-studio/pull/1562",
    mergedAt: "2026-10-06",
  },
  {
    repo: "libredb/libredb-studio",
    number: 1556,
    title: "Monitoring labels a Percona Server correctly instead of calling it MySQL",
    url: "https://github.com/libredb/libredb-studio/pull/1556",
    mergedAt: "2026-10-05",
  },
  {
    repo: "libredb/libredb-studio",
    number: 1554,
    title: "MongoDB schema inference counts fields missing from some documents as nullable",
    url: "https://github.com/libredb/libredb-studio/pull/1554",
    mergedAt: "2026-10-05",
  },
  {
    repo: "libredb/libredb-studio",
    number: 1522,
    title: "MongoDB whole-database Validate and Compact no longer crash on views",
    url: "https://github.com/libredb/libredb-studio/pull/1522",
    mergedAt: "2026-10-05",
  },
];

export const TIMELINE = [
  { when: "2026", what: "Open-source contributor", where: "libredb, lingui, reticle, corsair" },
  { when: "2024", what: "Web developer intern", where: "AgileMinds IT Solutions · MERN stack" },
  { when: "2022 – 2024", what: "Master of Computer Applications (MCA)", where: "" },
  { when: "2019 – 2022", what: "Bachelor of Computer Applications (BCA)", where: "" },
];

export const SKILLS = [
  ["TypeScript", "JavaScript", "React", "Next.js", "Astro", "Tailwind CSS", "Framer Motion", "Three.js", "Vite"],
  ["Node.js", "Express", "Supabase", "PostgreSQL", "MongoDB", "Cloudflare Workers", "Vercel", "GitHub Actions", "Vitest"],
];
