const express = require('express');
const router = express.Router();
const { collections, topics, hadiths, topicKeywords } = require('../data/curated');
const { getCollection, getAllCollections } = require('../services/hadithApi');

/* ---------- Static/curated metadata ---------- */

router.get('/collections', (req, res) => {
  const withCounts = Object.fromEntries(
    Object.entries(collections).map(([key, c]) => [
      key,
      { ...c, curatedCount: hadiths.filter((h) => h.collection === key).length },
    ])
  );
  res.json(withCounts);
});

router.get('/topics', (req, res) => {
  const withCounts = topics.map((t) => ({
    name: t,
    count: hadiths.filter((h) => h.topic === t).length,
  }));
  res.json(withCounts);
});

/* ---------- Curated hadith (fast, hand-checked sample) ---------- */

router.get('/curated', (req, res) => {
  const { collection, topic, authenticity, q } = req.query;
  let list = hadiths;
  if (collection) list = list.filter((h) => h.collection === collection);
  if (topic) list = list.filter((h) => h.topic === topic);
  if (authenticity) list = list.filter((h) => h.authenticity === authenticity);
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter((h) =>
      [h.english, h.arabic, h.urdu, h.topic, h.book, h.chapter, h.number, h.narrator]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
  }
  res.json({ count: list.length, results: list });
});

router.get('/curated/:id', (req, res) => {
  const h = hadiths.find((x) => x.id === req.params.id);
  if (!h) return res.status(404).json({ error: 'Not found' });
  res.json(h);
});

router.get('/daily', (req, res) => {
  const dayIndex = new Date().getDate() % hadiths.length;
  res.json(hadiths[dayIndex]);
});

/* ---------- Search across ALL FOUR full collections at once ----------
   Powers "Browse by topic" (every matching Hadith in every book, not
   just the curated sample) and free keyword search (e.g. "love" ->
   every Hadith across all books that mentions it). */

router.get('/search', async (req, res) => {
  try {
    const { q, topic, collection, authenticity } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 40));

    const { loaded, failed } = await getAllCollections();
    const wanted = collection ? loaded.filter((c) => c.key === collection) : loaded;

    const needle = q ? String(q).toLowerCase().trim() : '';
    const topicWords = topic && topicKeywords[topic] ? topicKeywords[topic].map((w) => w.toLowerCase()) : null;
    const wantedGrade = authenticity ? String(authenticity).toLowerCase().trim() : '';

    function authenticityMatches(collKey, grades) {
      if (!wantedGrade) return true;
      // Bukhari and Muslim are, by scholarly consensus, entirely Sahih.
      // This dataset doesn't attach a per-hadith grade for them (grades
      // is always []), so treat "Sahih" as matching every narration in
      // those two collections rather than excluding them for lack of data.
      if (collKey === 'bukhari' || collKey === 'muslim') return wantedGrade === 'sahih';
      if (!grades || grades.length === 0) return false;
      return grades.some((g) => (g.grade || '').toLowerCase().includes(wantedGrade));
    }

    let combined = [];
    wanted.forEach((coll) => {
      coll.hadiths.forEach((h) => {
        const haystack = `${h.english} ${h.arabic} ${h.urdu} ${h.narrator}`.toLowerCase();
        if (topicWords && !topicWords.some((w) => haystack.includes(w))) return;
        if (needle && !haystack.includes(needle)) return;
        if (!authenticityMatches(coll.key, h.grades)) return;
        combined.push({
          collectionKey: coll.key,
          collectionName: coll.collectionName,
          bookName: coll.sections[h.bookNum] || `Book ${h.bookNum}`,
          num: h.num,
          bookNum: h.bookNum,
          narrator: h.narrator,
          english: h.english,
          arabic: h.arabic,
          urdu: h.urdu,
          grades: h.grades,
        });
      });
    });

    const total = combined.length;
    const start = (page - 1) * pageSize;
    const results = combined.slice(start, start + pageSize);

    res.json({
      query: { q: q || '', topic: topic || '', collection: collection || '', authenticity: authenticity || '' },
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
      results,
      partial: failed.length > 0 ? failed : undefined,
    });
  } catch (err) {
    res.status(502).json({ error: 'Could not search the verified source', detail: err.message });
  }
});

/* ---------- Full live collections (fetched + cached from verified dataset) ---------- */

// GET /api/library/:key/status  -> quick check without triggering a full load
router.get('/library/:key/status', (req, res) => {
  const key = req.params.key;
  if (!collections[key]) return res.status(404).json({ error: 'Unknown collection' });
  res.json({ key, name: collections[key].name });
});

// GET /api/library/:key/books
router.get('/library/:key/books', async (req, res) => {
  try {
    const data = await getCollection(req.params.key);
    res.json({ sections: data.sections, total: data.hadiths.length, collectionName: data.collectionName });
  } catch (err) {
    res.status(502).json({ error: 'Could not load collection from the verified source', detail: err.message });
  }
});

// GET /api/library/:key/hadith?book=&search=&page=&pageSize=
router.get('/library/:key/hadith', async (req, res) => {
  try {
    const data = await getCollection(req.params.key);
    const { book, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 40));

    let list = data.hadiths;
    if (book) list = list.filter((h) => String(h.bookNum) === String(book));
    if (search) {
      const needle = String(search).toLowerCase();
      list = list.filter((h) =>
        (h.english + ' ' + h.arabic + ' ' + h.urdu + ' ' + h.narrator).toLowerCase().includes(needle)
      );
    }

    const start = (page - 1) * pageSize;
    const pageItems = list.slice(start, start + pageSize).map((h) => ({
      ...h,
      bookName: data.sections[h.bookNum] || `Book ${h.bookNum}`,
    }));

    res.json({
      collectionName: data.collectionName,
      total: list.length,
      page,
      pageSize,
      totalPages: Math.ceil(list.length / pageSize),
      results: pageItems,
    });
  } catch (err) {
    res.status(502).json({ error: 'Could not load collection from the verified source', detail: err.message });
  }
});

// GET /api/library/:key/hadith/:number
router.get('/library/:key/hadith/:number', async (req, res) => {
  try {
    const data = await getCollection(req.params.key);
    const num = parseInt(req.params.number, 10);
    const h = data.hadiths.find((x) => x.num === num);
    if (!h) return res.status(404).json({ error: 'Hadith number not found in this collection' });
    res.json({
      ...h,
      bookName: data.sections[h.bookNum] || `Book ${h.bookNum}`,
      collectionName: data.collectionName,
    });
  } catch (err) {
    res.status(502).json({ error: 'Could not load collection from the verified source', detail: err.message });
  }
});

module.exports = router;
