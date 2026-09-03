/* ==========================================================================
   As-Sahifah frontend
   Talks only to this app's own backend (/api/...). The backend is what
   fetches and caches the verified Hadith data — see services/hadithApi.js
   and routes/api.js on the server.
   ========================================================================== */

const state = {
  theme: 'light',
  favorites: new Set(),
  filters: { search: '', collection: '', topic: '', authenticity: '' },
  modalLangTab: 'ar',
  collectionsMeta: {},
  topicsMeta: [],
  curated: [],
};

// Browse & filter section now searches the FULL text of all four live
// collections (not just the small curated sample), so a topic or a
// keyword like "love" surfaces every matching Hadith from every book.
const browseState = { page: 1, PAGE_SIZE: 20, total: 0 };

const libState = {
  active: 'bukhari',
  status: {},   // key -> { loaded, loading, error, collectionName, sections, total }
  page: {},
  filters: {},
  PAGE_SIZE: 40,
};

/* ---------------- helpers ---------------- */

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function authTagClass(a) { return a === 'Sahih' ? 'auth' : 'auth hasan'; }

async function api(path) {
  const res = await fetch('/api' + path);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

function loadFavoritesFromStorage() {
  try {
    const raw = localStorage.getItem('assahifah_favorites');
    if (raw) JSON.parse(raw).forEach((id) => state.favorites.add(id));
  } catch { /* storage unavailable — favorites will just be session-only */ }
}
function saveFavoritesToStorage() {
  try { localStorage.setItem('assahifah_favorites', JSON.stringify([...state.favorites])); }
  catch { /* ignore */ }
}

/* ---------------- Daily hadith ---------------- */

async function renderDaily() {
  const mount = document.getElementById('dailyHadithMount');
  try {
    const h = await api('/daily');
    const c = state.collectionsMeta[h.collection];
    mount.innerHTML = `
      <div class="daily-side">
        <span class="daily-date">Today's Hadith · ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        <h3>Daily Hadith</h3>
        <p class="daily-ar">${h.arabic}</p>
        <p class="daily-en">"${h.english}"</p>
        <span class="daily-cite">${c ? c.name : h.collection} · ${h.book} · No. ${h.number} · ${h.authenticity}</span>
      </div>
      <div class="daily-body">
        <h4>Understanding this Hadith</h4>
        <p>${h.explanation}</p>
        <div class="daily-actions">
          <button class="btn btn-gold" data-open-curated="${h.id}">Read full explanation</button>
          <button class="btn btn-ghost" data-fav-toggle="${h.id}">Save</button>
        </div>
      </div>`;
    syncFavButtons();
  } catch (e) {
    mount.innerHTML = `<div class="daily-side"><p class="daily-en">Could not load today's Hadith from the server. Is the backend running?</p></div>`;
  }
}

/* ---------------- Collections & topics ---------------- */

async function renderCollections() {
  state.collectionsMeta = await api('/collections');
  const mount = document.getElementById('collectionsMount');
  mount.innerHTML = Object.entries(state.collectionsMeta).map(([key, c]) => `
    <div class="coll-card" data-filter-collection="${key}">
      <div class="coll-ar">${c.ar}</div>
      <h3>${c.name}</h3>
      <p class="coll-meta">${c.desc}</p>
      <div class="coll-count"><span>${c.grading}</span><span>${c.curatedCount} highlighted</span></div>
      <button class="see-all" style="margin-top:10px; background:none; border:none; cursor:pointer; padding:0;" data-open-lib-collection="${key}">Read the complete collection →</button>
    </div>`).join('');
  populateFilterSelects();
  renderLibTabs();
}

async function renderTopics() {
  state.topicsMeta = await api('/topics');
  const mount = document.getElementById('topicsMount');
  // Note: this count is only the small curated highlight set. Tapping a
  // topic below searches the full text of all four books, which will
  // usually turn up many more than this number.
  mount.innerHTML = state.topicsMeta.map((t) => `
    <button class="topic-chip" data-filter-topic="${t.name}">${t.name}<span class="t-count">Browse</span></button>`).join('');
}

function populateFilterSelects() {
  const collSel = document.getElementById('filterCollection');
  collSel.querySelectorAll('option:not(:first-child)').forEach((o) => o.remove());
  Object.entries(state.collectionsMeta).forEach(([key, c]) => {
    const opt = document.createElement('option');
    opt.value = key; opt.textContent = c.name;
    collSel.appendChild(opt);
  });
  const topicSel = document.getElementById('filterTopic');
  topicSel.querySelectorAll('option:not(:first-child)').forEach((o) => o.remove());
  (state.topicsMeta.length ? state.topicsMeta.map((t) => t.name) : []).forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t; opt.textContent = t;
    topicSel.appendChild(opt);
  });
  const authSel = document.getElementById('filterAuth');
  if (authSel.children.length <= 1) {
    ['Sahih', 'Hasan'].forEach((a) => {
      const opt = document.createElement('option');
      opt.value = a; opt.textContent = a;
      authSel.appendChild(opt);
    });
  }
}

/* ---------------- Browse & filter: searches ALL FOUR full collections ---------------- */

async function renderHadithList({ append = false } = {}) {
  const f = state.filters;
  const params = new URLSearchParams();
  if (f.search) params.set('q', f.search);
  if (f.collection) params.set('collection', f.collection);
  if (f.topic) params.set('topic', f.topic);
  if (f.authenticity) params.set('authenticity', f.authenticity);
  params.set('page', browseState.page);
  params.set('pageSize', browseState.PAGE_SIZE);

  const mount = document.getElementById('hadithListMount');
  const moreBtn = document.getElementById('browseLoadMoreBtn');
  if (!append) mount.innerHTML = `<div class="empty-state"><h3>Searching all four books…</h3></div>`;

  try {
    const data = await api('/search?' + params.toString());
    const results = data.results;

    browseState.total = data.total;
    document.getElementById('resultsCount').textContent =
      `${data.total} Hadith found across all four books${f.topic ? ' for "' + f.topic + '"' : ''}`;

    if (data.results.length === 0 && browseState.page === 1) {
      mount.innerHTML = `<div class="empty-state"><h3>No matching Hadith</h3><p>Try a different keyword or topic, or clear filters.</p></div>`;
      moreBtn.style.display = 'none';
      return;
    }

    const rowsHtml = results.map((h) => {
      const c = state.collectionsMeta[h.collectionKey];
      const grades = (h.grades || []).slice(0, 2).map((g) => `<span class="grade-chip">${g.name}: ${g.grade}</span>`).join('');
      return `
        <div class="hadith-row" data-open-search-hit="${h.collectionKey}:${h.num}">
          <div>
            <div class="hr-top">
              <span class="tag coll">${c ? c.name : h.collectionName}</span>
              <span class="tag">${h.bookName}</span>
            </div>
            <p class="hr-en">"${(h.english || '').slice(0, 320)}${(h.english || '').length > 320 ? '…' : ''}"</p>
            <p class="hr-ar-snip">${(h.arabic || '').slice(0, 160)}${(h.arabic || '').length > 160 ? '…' : ''}</p>
            <p class="hr-ref">${h.bookName} · Hadith ${h.num}${h.narrator ? ' · Narrated ' + h.narrator : ''}</p>
            ${grades ? `<div class="grade-list">${grades}</div>` : ''}
          </div>
        </div>`;
    }).join('');

    mount.innerHTML = append ? mount.innerHTML + rowsHtml : rowsHtml;
    moreBtn.style.display = browseState.page * browseState.PAGE_SIZE < data.total ? 'block' : 'none';
  } catch (e) {
    mount.innerHTML = `<div class="empty-state"><h3>Couldn't reach the server</h3><p>${e.message}</p></div>`;
    moreBtn.style.display = 'none';
  }
}

document.getElementById('browseLoadMoreBtn').addEventListener('click', () => {
  browseState.page += 1;
  renderHadithList({ append: true });
});

/* ---------------- Modal (curated hadith) ---------------- */

async function openCuratedModal(id) {
  try {
    const h = await api('/curated/' + id);
    const c = state.collectionsMeta[h.collection];
    state.modalLangTab = 'ar';
    renderModal(h, c);
    openModalShell();
  } catch (e) { toast('Could not load this Hadith'); }
}

function openModalShell() {
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function renderModal(h, c, opts = {}) {
  const isSaved = state.favorites.has(h.id);
  const collName = c ? c.name : h.collection;
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div class="modal-head">
      <div>
        <div class="modal-tags">
          <span class="tag coll">${collName}</span>
          ${h.topic ? `<span class="tag">${h.topic}</span>` : ''}
          <span class="tag ${authTagClass(h.authenticity)}">${h.authenticity}</span>
        </div>
        <h3 style="font-size:22px;">${h.book}</h3>
      </div>
      <button class="modal-close" id="modalCloseBtn" aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <div class="lang-tabs">
        <button class="lang-tab ${state.modalLangTab === 'ar' ? 'active' : ''}" data-lang-tab="ar">Arabic</button>
        <button class="lang-tab ${state.modalLangTab === 'en' ? 'active' : ''}" data-lang-tab="en">English</button>
        <button class="lang-tab ${state.modalLangTab === 'ur' ? 'active' : ''}" data-lang-tab="ur">اردو</button>
      </div>
      <div id="modalLangContent"></div>
      <p class="modal-narrator">Narrated by ${h.narrator}</p>

      <div class="modal-section-label">Explanation &amp; commentary</div>
      <p class="modal-explain">${h.explanation}</p>

      <div class="modal-section-label">Source &amp; reference</div>
      <div class="modal-source-box">
        <div><span class="src-label">Collection</span><span class="src-val">${collName}</span></div>
        <div><span class="src-label">Book</span><span class="src-val">${h.book}</span></div>
        <div><span class="src-label">Chapter</span><span class="src-val">${h.chapter}</span></div>
        <div><span class="src-label">Hadith number</span><span class="src-val">${h.number}</span></div>
        <div><span class="src-label">Authenticity</span><span class="src-val">${h.authenticity}</span></div>
        <div><span class="src-label">Narrator</span><span class="src-val">${h.narrator}</span></div>
      </div>

      <div class="modal-actions">
        <button class="btn-outline ${isSaved ? 'saved' : ''}" data-fav-toggle="${h.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          ${isSaved ? 'Saved to favorites' : 'Save to favorites'}
        </button>
        <button class="btn-outline" data-share="1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
          Copy citation
        </button>
      </div>
      <p class="disclaimer-line">This translation and commentary are shown for study purposes. For rulings, research, or publication, please verify wording and grading directly against a primary reference such as Sunnah.com or a printed critical edition.</p>
    </div>`;

  renderModalLangContent(h);
  document.getElementById('modalCloseBtn').onclick = closeModal;
  content.querySelectorAll('[data-lang-tab]').forEach((btn) => {
    btn.onclick = () => { state.modalLangTab = btn.dataset.langTab; renderModal(h, c); };
  });
  content.querySelector('[data-fav-toggle]').onclick = () => { toggleFavorite(h.id); renderModal(h, c); };
  content.querySelector('[data-share]').onclick = () => {
    const text = `${h.english} — ${collName}, ${h.book}, Hadith ${h.number} (${h.authenticity})`;
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('Citation copied to clipboard'));
    else toast('Copy not supported in this browser');
  };
}

function renderModalLangContent(h) {
  const mount = document.getElementById('modalLangContent');
  if (state.modalLangTab === 'ar') mount.innerHTML = `<p class="modal-ar">${h.arabic}</p>`;
  else if (state.modalLangTab === 'en') mount.innerHTML = `<p class="modal-en">"${h.english}"</p>`;
  else mount.innerHTML = `<p class="modal-ur">${h.urdu}</p>`;
}

/* ---------------- Favorites ---------------- */

function toggleFavorite(id) {
  if (state.favorites.has(id)) { state.favorites.delete(id); toast('Removed from favorites'); }
  else { state.favorites.add(id); toast('Saved to favorites'); }
  saveFavoritesToStorage();
  syncFavButtons();
  renderHadithList();
  renderDrawer();
}
function syncFavButtons() {
  document.querySelectorAll('[data-fav-toggle]').forEach((btn) => {
    const id = btn.dataset.favToggle;
    const saved = state.favorites.has(id);
    btn.classList.toggle('saved', saved);
    const svg = btn.querySelector('svg');
    if (svg) svg.setAttribute('fill', saved ? 'currentColor' : 'none');
  });
}
async function renderDrawer() {
  const mount = document.getElementById('drawerList');
  const ids = [...state.favorites];
  if (ids.length === 0) {
    mount.innerHTML = `<div class="drawer-empty">No favorites yet. Tap the bookmark icon on any Hadith to save it here.</div>`;
    return;
  }
  // Favorites reference curated ids (lib-* ids aren't refetchable individually here, but curated ones are)
  const items = [];
  for (const id of ids) {
    if (id.startsWith('lib-')) { items.push({ id, book: 'From the Full Library', english: '(open the Full Library section to view this saved narration again)' }); continue; }
    try { items.push(await api('/curated/' + id)); } catch { /* skip missing */ }
  }
  mount.innerHTML = items.map((h) => `
    <div class="drawer-item" ${h.collection ? `data-open-curated="${h.id}"` : ''}>
      <p class="di-en">"${h.english}"</p>
      <p class="di-ref">${h.book}${h.number ? ' · No. ' + h.number : ''}</p>
    </div>`).join('');
}

/* ---------------- Theme ---------------- */

function applyTheme() {
  document.body.setAttribute('data-theme', state.theme);
  const icon = document.getElementById('themeIcon');
  icon.innerHTML = state.theme === 'dark'
    ? '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>'
    : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  try { localStorage.setItem('assahifah_theme', state.theme); } catch { /* ignore */ }
}

/* ---------------- Full live library ---------------- */

function renderLibTabs() {
  const mount = document.getElementById('libTabs');
  if (!Object.keys(state.collectionsMeta).length) return;
  mount.innerHTML = Object.entries(state.collectionsMeta).map(([key, c]) =>
    `<button class="lib-tab ${libState.active === key ? 'active' : ''}" data-lib-tab="${key}">${c.name}</button>`).join('');
  mount.querySelectorAll('[data-lib-tab]').forEach((btn) => {
    btn.onclick = () => { switchLibTab(btn.dataset.libTab); };
  });
  renderLibStatus();
}

function switchLibTab(key) {
  libState.active = key;
  renderLibTabs();
  renderLibError(null);
  renderLibControls();
  renderLibList();
}

function renderLibStatus() {
  const key = libState.active;
  const st = libState.status[key];
  const mount = document.getElementById('libStatusBox');
  const name = state.collectionsMeta[key] ? state.collectionsMeta[key].name : key;
  if (!st || (!st.loaded && !st.loading)) {
    mount.innerHTML = `
      <span class="lib-status-text">Not loaded yet — <strong>${name}</strong> contains several thousand narrations. Loading fetches (and caches on the server) the Arabic, English and Urdu text.</span>
      <button class="btn btn-gold" id="libLoadBtn">Load ${name}</button>`;
    document.getElementById('libLoadBtn').onclick = () => loadFullCollection(key);
  } else if (st.loading) {
    mount.innerHTML = `<span class="lib-status-text">Loading <strong>${name}</strong> from the verified dataset — this can take a few seconds on first load…</span>`;
  } else if (st.loaded) {
    mount.innerHTML = `<span class="lib-status-text"><strong>${st.total}</strong> narrations loaded from <strong>${st.collectionName}</strong>.</span>`;
  }
}

function renderLibError(message) {
  const mount = document.getElementById('libErrorMount');
  mount.innerHTML = message
    ? `<div class="lib-error">${message}</div>`
    : '';
}

async function loadFullCollection(key) {
  if (libState.status[key] && (libState.status[key].loaded || libState.status[key].loading)) return;
  libState.status[key] = { loaded: false, loading: true };
  libState.filters[key] = { book: '', search: '' };
  libState.page[key] = 1;
  renderLibStatus();
  renderLibError(null);
  try {
    const booksData = await api(`/library/${key}/books`);
    libState.status[key] = {
      loaded: true, loading: false,
      total: booksData.total, sections: booksData.sections, collectionName: booksData.collectionName,
    };
    toast(`Loaded ${booksData.total} narrations from ${booksData.collectionName}`);
  } catch (e) {
    libState.status[key] = { loaded: false, loading: false };
    renderLibError(`Couldn't load this collection right now (${e.message}). Make sure the backend server has internet access, then try again.`);
  }
  renderLibStatus();
  renderLibControls();
  renderLibList();
}

function renderLibControls() {
  const key = libState.active;
  const st = libState.status[key];
  const mount = document.getElementById('libControlsMount');
  if (!st || !st.loaded) { mount.innerHTML = ''; return; }
  const bookOptions = Object.entries(st.sections || {})
    .filter(([num, name]) => name && name.trim())
    .map(([num, name]) => `<option value="${num}">${name}</option>`).join('');
  mount.innerHTML = `
    <div class="lib-controls">
      <div class="search-mini">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" id="libSearchInput" placeholder="Search within ${st.collectionName}…">
      </div>
      <select id="libBookSelect"><option value="">All books</option>${bookOptions}</select>
    </div>`;
  document.getElementById('libSearchInput').addEventListener('input', (e) => {
    libState.filters[key].search = e.target.value;
    libState.page[key] = 1;
    renderLibList();
  });
  document.getElementById('libBookSelect').addEventListener('change', (e) => {
    libState.filters[key].book = e.target.value;
    libState.page[key] = 1;
    renderLibList();
  });
}

async function renderLibList() {
  const key = libState.active;
  const st = libState.status[key];
  const listMount = document.getElementById('libListMount');
  const moreBtn = document.getElementById('libLoadMoreBtn');
  if (!st || !st.loaded) { listMount.innerHTML = ''; document.getElementById('libResultsCount').textContent = ''; moreBtn.style.display = 'none'; return; }

  const f = libState.filters[key] || { book: '', search: '' };
  const page = libState.page[key] || 1;
  const params = new URLSearchParams({ page: 1, pageSize: page * libState.PAGE_SIZE });
  if (f.book) params.set('book', f.book);
  if (f.search) params.set('search', f.search);

  try {
    const data = await api(`/library/${key}/hadith?` + params.toString());
    document.getElementById('libResultsCount').textContent = `${data.total} narrations match · showing ${data.results.length}`;
    if (data.results.length === 0) {
      listMount.innerHTML = `<div class="empty-state"><h3>No matches</h3><p>Try a different keyword or book.</p></div>`;
      moreBtn.style.display = 'none';
      return;
    }
    listMount.innerHTML = data.results.map((h) => {
      const grades = (h.grades || []).slice(0, 3).map((g) => `<span class="grade-chip">${g.name}: ${g.grade}</span>`).join('');
      return `
        <div class="hadith-row" data-open-lib="${h.num}">
          <div>
            <div class="hr-top"><span class="tag coll">${data.collectionName}</span><span class="tag">${h.bookName}</span></div>
            <p class="hr-en">"${(h.english || '').slice(0, 320)}${(h.english || '').length > 320 ? '…' : ''}"</p>
            ${h.arabic ? `<p class="hr-ar-snip">${h.arabic.slice(0, 160)}${h.arabic.length > 160 ? '…' : ''}</p>` : ''}
            <p class="hr-ref">${h.bookName} · Hadith ${h.num}${h.narrator ? ' · Narrated ' + h.narrator : ''}</p>
            ${grades ? `<div class="grade-list">${grades}</div>` : ''}
          </div>
        </div>`;
    }).join('');
    moreBtn.style.display = data.total > data.results.length ? 'block' : 'none';
    moreBtn.onclick = () => { libState.page[key] = page + 1; renderLibList(); };
    listMount.querySelectorAll('[data-open-lib]').forEach((el) => {
      el.onclick = () => openLibHadithModal(key, parseInt(el.dataset.openLib, 10));
    });
  } catch (e) {
    listMount.innerHTML = `<div class="empty-state"><h3>Couldn't reach the server</h3><p>${e.message}</p></div>`;
  }
}

async function openLibHadithModal(key, num) {
  try {
    const h = await api(`/library/${key}/hadith/${num}`);
    const gradeText = (h.grades || []).map((g) => `${g.name}: ${g.grade}`).join(' · ') || 'Not separately graded in this dataset';
    const pseudo = {
      id: 'lib-' + key + '-' + h.num,
      collection: key,
      book: h.bookName,
      chapter: `Hadith ${h.inBookNum ?? h.num} in this book`,
      number: h.num,
      narrator: h.narrator || 'See full chain in the primary source',
      topic: '',
      arabic: h.arabic || 'Arabic text not matched for this narration in the loaded dataset.',
      english: h.english,
      urdu: h.urdu || 'Urdu translation not available for this narration in the loaded dataset.',
      explanation: `Scholarly grading: ${gradeText}. This preview does not include line-by-line commentary — for detailed explanation (sharh), consult a dedicated commentary such as Fath al-Bari (for Bukhari) or an equivalent work for this collection.`,
      authenticity: (h.grades && h.grades[0]) ? h.grades[0].grade : (key === 'bukhari' || key === 'muslim' ? 'Sahih' : 'See grading below'),
    };
    state.modalLangTab = 'ar';
    renderModal(pseudo, state.collectionsMeta[key]);
    openModalShell();
  } catch (e) { toast('Could not load this Hadith'); }
}

/* ---------------- Global events ---------------- */

document.addEventListener('click', (e) => {
  const openCurated = e.target.closest('[data-open-curated]');
  if (openCurated) { openCuratedModal(openCurated.dataset.openCurated); return; }

  const openLib = e.target.closest('[data-open-lib]');
  if (openLib) { openLibHadithModal(libState.active, parseInt(openLib.dataset.openLib, 10)); return; }

  const openSearchHit = e.target.closest('[data-open-search-hit]');
  if (openSearchHit) {
    const [key, num] = openSearchHit.dataset.openSearchHit.split(':');
    openLibHadithModal(key, parseInt(num, 10));
    return;
  }

  const favId = e.target.closest('[data-fav-toggle]');
  if (favId && !favId.closest('.modal')) { toggleFavorite(favId.dataset.favToggle); return; }

  const openLibColl = e.target.closest('[data-open-lib-collection]');
  if (openLibColl) {
    e.preventDefault();
    switchLibTab(openLibColl.dataset.openLibCollection);
    document.getElementById('library').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const collFilter = e.target.closest('[data-filter-collection]');
  if (collFilter) {
    state.filters.collection = collFilter.dataset.filterCollection;
    document.getElementById('filterCollection').value = state.filters.collection;
    browseState.page = 1;
    renderHadithList();
    document.getElementById('browse').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  const topicFilter = e.target.closest('[data-filter-topic]');
  if (topicFilter) {
    state.filters.topic = topicFilter.dataset.filterTopic;
    document.getElementById('filterTopic').value = state.filters.topic;
    browseState.page = 1;
    renderHadithList();
    document.getElementById('browse').scrollIntoView({ behavior: 'smooth' });
    return;
  }
});

document.getElementById('modalOverlay').addEventListener('click', (e) => { if (e.target.id === 'modalOverlay') closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeDrawer(); } });

document.getElementById('themeToggle').addEventListener('click', () => {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme();
});

function openDrawer() {
  document.getElementById('favDrawer').classList.add('open');
  document.getElementById('drawerOverlay').classList.add('open');
  renderDrawer();
}
function closeDrawer() {
  document.getElementById('favDrawer').classList.remove('open');
  document.getElementById('drawerOverlay').classList.remove('open');
}
document.getElementById('favToggle').addEventListener('click', openDrawer);
document.getElementById('footerFavLink').addEventListener('click', (e) => { e.preventDefault(); openDrawer(); });
document.getElementById('drawerClose').addEventListener('click', closeDrawer);
document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);

document.getElementById('heroSearchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = document.getElementById('heroSearchInput').value;
  state.filters.search = v;
  document.getElementById('browseSearch').value = v;
  browseState.page = 1;
  renderHadithList();
  document.getElementById('browse').scrollIntoView({ behavior: 'smooth' });
});
let browseSearchDebounce;
document.getElementById('browseSearch').addEventListener('input', (e) => {
  state.filters.search = e.target.value;
  browseState.page = 1;
  clearTimeout(browseSearchDebounce);
  browseSearchDebounce = setTimeout(renderHadithList, 300);
});
document.getElementById('filterCollection').addEventListener('change', (e) => { state.filters.collection = e.target.value; browseState.page = 1; renderHadithList(); });
document.getElementById('filterTopic').addEventListener('change', (e) => { state.filters.topic = e.target.value; browseState.page = 1; renderHadithList(); });
document.getElementById('filterAuth').addEventListener('change', (e) => { state.filters.authenticity = e.target.value; browseState.page = 1; renderHadithList(); });
document.getElementById('clearFilters').addEventListener('click', () => {
  state.filters = { search: '', collection: '', topic: '', authenticity: '' };
  document.getElementById('browseSearch').value = '';
  document.getElementById('filterCollection').value = '';
  document.getElementById('filterTopic').value = '';
  document.getElementById('filterAuth').value = '';
  browseState.page = 1;
  renderHadithList();
});

document.getElementById('uiLangSelect').addEventListener('change', (e) => {
  const v = e.target.value;
  if (v === 'ar') { document.documentElement.setAttribute('dir', 'rtl'); document.documentElement.setAttribute('lang', 'ar'); }
  else if (v === 'ur') { document.documentElement.setAttribute('dir', 'rtl'); document.documentElement.setAttribute('lang', 'ur'); }
  else { document.documentElement.setAttribute('dir', 'ltr'); document.documentElement.setAttribute('lang', 'en'); }
  toast(v === 'ar' ? 'واجهة الموقع الآن باتجاه RTL' : v === 'ur' ? 'انٹرفیس اب دائیں سے بائیں ہے' : 'Interface set to left-to-right');
});

/* ---------------- Init ---------------- */

(async function init() {
  loadFavoritesFromStorage();
  try { state.theme = localStorage.getItem('assahifah_theme') || 'light'; } catch { /* ignore */ }
  applyTheme();

  await renderCollections();   // also populates filters + lib tabs
  await Promise.all([renderDaily(), renderTopics()]);
  await renderHadithList();
})();
