/**
 * Fetches and caches the complete text of Hadith collections from the
 * open-source "hadith-api" dataset (fawazahmed0/hadith-api on GitHub),
 * which mirrors Sunnah.com's published collections in Arabic, English
 * and Urdu.
 *
 * This module NEVER generates, edits, or paraphrases Hadith text. It only
 * downloads the published dataset and (when possible) caches it to disk
 * so the app doesn't re-download every time.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Never let cache-directory setup crash the app — if the project folder
// isn't writable (e.g. on Vercel's read-only filesystem), fall back to
// /tmp; if even that fails, disable disk caching entirely instead of
// throwing. Everything still works without a disk cache, just a little
// slower on repeat cold starts.
function resolveCacheDir() {
  const candidates = [
    path.join(__dirname, '..', 'cache'),
    path.join(os.tmpdir(), 'as-sahifah-cache'),
  ];
  for (const dir of candidates) {
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      return dir;
    } catch {
      // try the next candidate
    }
  }
  return null;
}
const CACHE_DIR = resolveCacheDir();

const EDITION_CODES = {
  bukhari:  { eng: 'eng-bukhari',  ara: 'ara-bukhari',  urd: 'urd-bukhari' },
  muslim:   { eng: 'eng-muslim',   ara: 'ara-muslim',   urd: 'urd-muslim' },
  abudawud: { eng: 'eng-abudawud', ara: 'ara-abudawud', urd: 'urd-abudawud' },
  tirmidhi: { eng: 'eng-tirmidhi', ara: 'ara-tirmidhi', urd: 'urd-tirmidhi' },
};

function sourcesFor(edition) {
  return [
    `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${edition}.min.json`,
    `https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/${edition}.min.json`,
  ];
}

async function fetchWithFallback(urls) {
  let lastErr;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('All sources failed');
}

function cachePath(edition) {
  return CACHE_DIR ? path.join(CACHE_DIR, `${edition}.json`) : null;
}

async function fetchEdition(edition) {
  const file = cachePath(edition);
  if (file && fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      // fall through and re-fetch if the cache file is corrupt
    }
  }
  const data = await fetchWithFallback(sourcesFor(edition));
  if (file) {
    try { fs.writeFileSync(file, JSON.stringify(data)); }
    catch { /* caching skipped, not fatal */ }
  }
  return data;
}

function extractNarrator(text) {
  const m = /^Narrated ([^:]+):/.exec(text || '');
  return m ? m[1].trim() : '';
}

// In-memory cache of merged collections, built once per warm process.
const merged = {};       // key -> { collectionName, sections, hadiths: [...] }
const loadingPromises = {};

async function getCollection(key) {
  if (merged[key]) return merged[key];
  if (loadingPromises[key]) return loadingPromises[key];

  const codes = EDITION_CODES[key];
  if (!codes) throw new Error(`Unknown collection "${key}"`);

  loadingPromises[key] = (async () => {
    const [engData, araData, urdData] = await Promise.all([
      fetchEdition(codes.eng),
      fetchEdition(codes.ara),
      fetchEdition(codes.urd).catch(() => null),
    ]);

    const araByNum = {};
    (araData.hadiths || []).forEach((h) => { araByNum[h.hadithnumber] = h.text; });
    const urdByNum = {};
    if (urdData) (urdData.hadiths || []).forEach((h) => { urdByNum[h.hadithnumber] = h.text; });

    const hadithList = (engData.hadiths || []).map((h) => ({
      num: h.hadithnumber,
      bookNum: h.reference ? h.reference.book : null,
      inBookNum: h.reference ? h.reference.hadith : null,
      english: h.text,
      arabic: araByNum[h.hadithnumber] || '',
      urdu: urdByNum[h.hadithnumber] || '',
      grades: h.grades || [],
      narrator: extractNarrator(h.text),
    }));

    const result = {
      key,
      collectionName: (engData.metadata && engData.metadata.name) || key,
      sections: (engData.metadata && engData.metadata.sections) || {},
      hadiths: hadithList,
    };
    merged[key] = result;
    delete loadingPromises[key];
    return result;
  })();

  return loadingPromises[key];
}

// Loads every collection (Bukhari, Muslim, Abu Dawood, Tirmidhi) in
// parallel, so features like cross-book topic browsing and keyword
// search can look through all four books at once, not just one.
async function getAllCollections() {
  const keys = Object.keys(EDITION_CODES);
  const results = await Promise.allSettled(keys.map((k) => getCollection(k)));
  const loaded = [];
  const failed = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') loaded.push(r.value);
    else failed.push({ key: keys[i], error: r.reason && r.reason.message });
  });
  return { loaded, failed };
}

module.exports = { getCollection, getAllCollections, EDITION_CODES };