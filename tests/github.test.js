import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchMerged, mergedQuery, toContributions } from "../src/github.js";

const item = (repo, number, mergedAt) => ({
  repository_url: `https://api.github.com/repos/${repo}`,
  number,
  title: `Fix ${number}`,
  html_url: `https://github.com/${repo}/pull/${number}`,
  closed_at: `${mergedAt}T10:00:00Z`,
  pull_request: { merged_at: `${mergedAt}T09:00:00Z` },
});

function memoryStorage() {
  const map = new Map();
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => map.set(k, String(v)) };
}

test("mergedQuery asks for merged PRs to other people's repositories", () => {
  assert.equal(mergedQuery("Jeevan2410"), "is:pr is:merged author:Jeevan2410 -user:Jeevan2410");
});

test("toContributions shapes search results, newest first", () => {
  const result = toContributions([item("libredb/libredb-studio", 1522, "2026-10-05"), item("lingui/js-lingui", 2703, "2026-10-06")]);
  assert.deepEqual(result[0], {
    repo: "lingui/js-lingui",
    number: 2703,
    title: "Fix 2703",
    url: "https://github.com/lingui/js-lingui/pull/2703",
    mergedAt: "2026-10-06",
  });
  assert.equal(result[1].repo, "libredb/libredb-studio");
});

test("fetchMerged returns live data and caches it", async () => {
  let calls = 0;
  const fetchImpl = async (url) => {
    calls++;
    assert.match(url, /search\/issues\?q=is%3Apr%20is%3Amerged/);
    return { ok: true, json: async () => ({ total_count: 1, items: [item("a/b", 1, "2026-10-01")] }) };
  };
  const storage = memoryStorage();
  const first = await fetchMerged("me", { fetchImpl, storage, now: 1000 });
  assert.equal(first.total, 1);
  assert.equal(first.items[0].repo, "a/b");
  const second = await fetchMerged("me", { fetchImpl, storage, now: 2000 });
  assert.equal(second.total, 1);
  assert.equal(calls, 1, "the second call is served from the cache");
});

test("fetchMerged gives null when GitHub is unreachable or rate limited", async () => {
  assert.equal(await fetchMerged("me", { fetchImpl: async () => ({ ok: false }), storage: memoryStorage() }), null);
  const offline = async () => {
    throw new TypeError("Failed to fetch");
  };
  assert.equal(await fetchMerged("me", { fetchImpl: offline, storage: memoryStorage() }), null);
});
