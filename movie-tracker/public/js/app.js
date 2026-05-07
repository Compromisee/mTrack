const $ = id => document.getElementById(id);
const TMDB_IMG = 'https://image.tmdb.org/t/p/';
let TMDB_KEY = localStorage.getItem('tmdb_api_key') || '';
let currentTab = 'home', currentFilter = 'all', selectedRating = 0;
let detailData = null, detailDbId = null;
let popupSeason = 1, popupEpisode = 1, popupSeasonData = null;

const SOURCES = {
    spencerdevs: { name: 'SpencerDevs', movie: id => `https://spencerdevs.xyz/movie/${id}`, tv: (id,s,e) => `https://spencerdevs.xyz/tv/${id}/${s}/${e}` },
    vidfast: { name: 'VidFast', movie: id => `https://vidfast.net/movie/${id}`, tv: (id,s,e) => `https://vidfast.net/tv/${id}/${s}/${e}` },
    mapple: { name: 'Mapple', movie: id => `https://mapple.uk/movie/${id}`, tv: (id,s,e) => `https://mapple.uk/tv/${id}/${s}/${e}` },
    vidking: { name: 'VidKing', movie: id => `https://www.vidking.net/movie/${id}`, tv: (id,s,e) => `https://www.vidking.net/tv/${id}/${s}/${e}` }
};

// ================================================================
// INIT
// ================================================================
async function init() {
    applyCustomCSS();
    const user = await checkAuth();
    if (!user) return;
    const displayName = localStorage.getItem('mtrack-display-name');
    $('userName').textContent = displayName || user.username;
    $('detailSource').value = localStorage.getItem('mtrack-default-source') || 'spencerdevs';
    if (!TMDB_KEY) $('apiModal').classList.add('active');
    else loadAllRows();
    setupNav();
    setupEvents();
    loadStats();
    loadMyList();
    loadWatching();
}

function applyCustomCSS() {
    const theme = localStorage.getItem('mtrack-theme') || 'mtrack';
    if (theme === 'custom') {
        let el = document.getElementById('custom-css-style');
        if (!el) { el = document.createElement('style'); el.id = 'custom-css-style'; document.head.appendChild(el); }
        el.textContent = localStorage.getItem('mtrack-custom-css') || '';
    }
}

async function checkAuth() {
    try {
        const r = await fetch('/api/me');
        if (r.status === 401) { window.location.href = '/pages/login.html'; return null; }
        return await r.json();
    } catch { window.location.href = '/pages/login.html'; return null; }
}

// ================================================================
// NAV
// ================================================================
function setupNav() {
    window.addEventListener('scroll', () => document.querySelector('.nav').classList.toggle('scrolled', window.scrollY > 40));
    $('searchToggle').addEventListener('click', () => {
        const s = $('navSearch'); s.classList.toggle('open');
        if (s.classList.contains('open')) $('searchInput').focus();
    });
    let t;
    $('searchInput').addEventListener('input', e => {
        clearTimeout(t);
        t = setTimeout(() => {
            const q = e.target.value.trim();
            if (q.length > 1) doSearch(q); else $('searchSection').style.display = 'none';
        }, 400);
    });
    document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', e => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(x => x.classList.remove('active'));
        l.classList.add('active');
        currentTab = l.dataset.tab;
        handleTab();
    }));
    $('logoutBtn').addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/pages/login.html';
    });
}

function handleTab() {
    const bb = document.querySelector('.billboard');
    const st = document.querySelector('.stats-bar');
    const ws = $('watchingSection');
    const ml = $('myListSection');
    const tmr = $('rowTrendingMovies');
    const ttv = $('rowTrendingTV');
    const tr = $('rowTopRated');
    const np = $('rowNowPlaying');
    const up = $('rowUpcoming');
    const ss = $('searchSection');

    [ws, ml, tmr, ttv, tr, np, up, ss].forEach(el => { if (el) el.style.display = 'none'; });

    switch (currentTab) {
        case 'home':
            bb.style.display = ''; st.style.display = '';
            [ws, tmr, ttv, tr, np, up, ml].forEach(el => { if (el) el.style.display = ''; });
            break;
        case 'movies':
            bb.style.display = ''; st.style.display = 'none';
            [tmr, tr, np, up].forEach(el => { if (el) el.style.display = ''; });
            if (ml) ml.style.display = '';
            break;
        case 'tv':
            bb.style.display = ''; st.style.display = 'none';
            if (ttv) ttv.style.display = '';
            if (ml) ml.style.display = '';
            break;
        case 'watching':
            bb.style.display = 'none'; st.style.display = '';
            if (ws) ws.style.display = '';
            loadWatching();
            break;
        case 'mylist':
            bb.style.display = 'none'; st.style.display = '';
            if (ml) ml.style.display = '';
            break;
    }
}

// ================================================================
// EVENTS
// ================================================================
function setupEvents() {
    $('saveApiKey').addEventListener('click', () => {
        const k = $('apiKeyInput').value.trim();
        if (!k) return;
        TMDB_KEY = k; localStorage.setItem('tmdb_api_key', k);
        $('apiModal').classList.remove('active');
        loadAllRows(); showToast('API key saved');
    });

    document.querySelectorAll('.row-arrow').forEach(b => b.addEventListener('click', () => {
        const t = $(b.dataset.target);
        t.scrollBy({ left: (b.classList.contains('row-arrow-left') ? -1 : 1) * 600, behavior: 'smooth' });
    }));

    document.querySelectorAll('.filter-chip').forEach(c => c.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        currentFilter = c.dataset.status;
        loadMyList();
    }));

    $('detailClose').addEventListener('click', closeDetail);
    $('detailModal').addEventListener('click', e => { if (e.target === $('detailModal')) closeDetail(); });

    $('detailStars').querySelectorAll('.star-btn').forEach(s => {
        s.addEventListener('click', () => { selectedRating = parseInt(s.dataset.v); updateStars(); });
        s.addEventListener('mouseenter', () => {
            const v = parseInt(s.dataset.v);
            $('detailStars').querySelectorAll('.star-btn').forEach((x,i) => x.classList.toggle('active', i < v));
        });
    });
    $('detailStars').addEventListener('mouseleave', updateStars);

    $('detailSave').addEventListener('click', saveFromDetail);
    $('detailDelete').addEventListener('click', deleteFromDetail);

    $('detailWatch').addEventListener('click', () => {
        if (!detailData) return;
        const src = $('detailSource').value;
        const mt = detailData._mediaType || 'movie';
        let url;
        if (mt === 'tv') {
            url = SOURCES[src].tv(detailData.id, popupSeason, popupEpisode);
        } else {
            url = SOURCES[src].movie(detailData.id);
        }
        window.open(url, '_blank');
    });

    $('billboardWatch').addEventListener('click', () => {
        if (detailData && detailData.id) {
            const src = localStorage.getItem('mtrack-default-source') || 'spencerdevs';
            const mt = detailData._mediaType || 'movie';
            window.open(mt === 'tv' ? SOURCES[src].tv(detailData.id,1,1) : SOURCES[src].movie(detailData.id), '_blank');
        }
    });

    $('billboardInfo').addEventListener('click', () => {
        if (detailData) openDetailById(detailData.id, detailData._mediaType || 'movie');
    });

    // Popup season change
    $('popupSeasonSelect').addEventListener('change', e => {
        popupSeason = parseInt(e.target.value) || 1;
        popupEpisode = 1;
        loadPopupEpisodes(detailData.id, popupSeason);
    });

    // Popup episode change
    $('popupEpisodeSelect').addEventListener('change', e => {
        popupEpisode = parseInt(e.target.value) || 1;
        updatePopupEpPreview();
        updatePopupEpListActive();
        updateWatchButtonText();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeDetail(); $('apiModal').classList.remove('active'); }
    });
}

// ================================================================
// TMDB
// ================================================================
async function tmdbFetch(endpoint, containerId, mediaType = 'movie') {
    if (!TMDB_KEY) return [];
    try {
        const d = await (await fetch(`https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_KEY}&language=en-US&page=1`)).json();
        renderRow(d.results || [], containerId, mediaType);
        return d.results || [];
    } catch { return []; }
}

async function loadAllRows() {
    const t = await tmdbFetch('trending/movie/week', 'trendingMovies');
    tmdbFetch('trending/tv/week', 'trendingTV', 'tv');
    tmdbFetch('movie/top_rated', 'topRated');
    tmdbFetch('movie/now_playing', 'nowPlaying');
    tmdbFetch('movie/upcoming', 'upcoming');
    if (t && t.length) setBillboard(t[Math.floor(Math.random() * Math.min(5, t.length))]);
}

function setBillboard(item) {
    detailData = item;
    detailData._mediaType = item.media_type === 'tv' ? 'tv' : 'movie';
    if (item.backdrop_path) $('billboardBg').style.backgroundImage = `url(${TMDB_IMG}original${item.backdrop_path})`;
    $('billboardTitle').textContent = item.title || item.name || '';
    $('billboardDesc').textContent = (item.overview || '').substring(0, 180) + ((item.overview || '').length > 180 ? '...' : '');
    $('billboardBadge').textContent = item.media_type === 'tv' ? 'Trending TV' : 'Trending';
}

// ================================================================
// RENDER ROW
// ================================================================
function renderRow(items, containerId, mediaType = 'movie') {
    const c = $(containerId); if (!c) return;
    c.innerHTML = items.slice(0, 20).map(item => {
        const title = item.title || item.name || '';
        const year = (item.release_date || item.first_air_date || '').substring(0, 4);
        const vote = item.vote_average ? (item.vote_average * 10).toFixed(0) : '--';
        const poster = item.poster_path ? `${TMDB_IMG}w300${item.poster_path}` : '';
        return `<div class="nf-card" onclick="openDetailById(${item.id},'${item.media_type||mediaType}')"><div class="nf-card-inner">${poster?`<img src="${poster}" alt="${title}" loading="lazy">`:'<div class="nf-card-no-img"><span class="material-icons-round">movie</span></div>'}<div class="nf-card-info"><h4>${title}</h4><div class="nf-card-mini"><span class="match">${vote}%</span><span>${year}</span></div><div class="nf-card-btns"><button onclick="event.stopPropagation();quickAdd(${item.id},'${item.media_type||mediaType}')" title="Add"><span class="material-icons-round">add</span></button><button onclick="event.stopPropagation();openWatch(${item.id},'${item.media_type||mediaType}')" title="Watch"><span class="material-icons-round">play_arrow</span></button><button onclick="event.stopPropagation();openDetailById(${item.id},'${item.media_type||mediaType}')" title="Info"><span class="material-icons-round">expand_more</span></button></div></div></div></div>`;
    }).join('');
}

// ================================================================
// CURRENTLY WATCHING
// ================================================================
async function loadWatching() {
    try {
        const movies = await (await fetch('/api/movies?status=watching')).json();
        const grid = $('watchingGrid');
        if (!movies.length) {
            grid.innerHTML = `<div class="watching-empty"><span class="material-icons-round">tv_off</span>Nothing currently watching<br><small>Mark something as "Watching" to see it here</small></div>`;
            return;
        }
        grid.innerHTML = movies.map(m => {
            const isTV = m.media_type === 'tv';
            return `<div class="w-card"><div class="w-card-main" onclick="openDetailFromDb(${m.id})">${m.poster?`<div class="w-card-poster"><img src="${m.poster}" alt="${m.title}" loading="lazy"><div class="w-play-overlay"><span class="material-icons-round">play_arrow</span></div></div>`:`<div class="w-card-no-poster"><span class="material-icons-round">movie</span></div>`}<div class="w-card-body"><h3>${m.title}</h3><div class="w-card-meta">${m.year?`<span class="material-icons-round">calendar_today</span>${m.year}`:''} ${m.genre?`<span class="material-icons-round">category</span>${m.genre}`:''}<span class="w-card-type">${m.media_type||'movie'}</span></div><div class="w-card-stars">${[1,2,3,4,5].map(s=>`<span class="material-icons-round ${s<=m.rating?'filled':''}">star</span>`).join('')}</div>${m.notes?`<div class="w-card-notes">"${m.notes}"</div>`:''}<div class="w-card-actions"><button onclick="event.stopPropagation();watchNow(${m.tmdb_id},'${m.media_type||'movie'}')" title="Watch"><span class="material-icons-round">play_arrow</span> Watch</button><button class="w-btn-done" onclick="event.stopPropagation();markWatched(${m.id})" title="Done"><span class="material-icons-round">done</span> Done</button><button onclick="event.stopPropagation();openDetailFromDb(${m.id})" title="Info"><span class="material-icons-round">info</span></button></div></div></div>${isTV&&m.tmdb_id?`<div class="w-card-tv-controls" id="tvCtrl-${m.id}"><div class="w-tv-selectors"><div class="w-tv-select-group"><label><span class="material-icons-round">folder</span> Season</label><select class="w-tv-select" id="wSeason-${m.id}" onchange="loadWatchEpisodes(${m.id},${m.tmdb_id},this.value)"><option>Loading...</option></select></div><div class="w-tv-select-group"><label><span class="material-icons-round">movie</span> Episode</label><select class="w-tv-select" id="wEpisode-${m.id}"><option>Select season</option></select></div><button class="w-tv-play-btn" onclick="playFromSelector(${m.tmdb_id},${m.id})"><span class="material-icons-round">play_arrow</span> Play</button></div><div class="w-ep-preview" id="wEpPreview-${m.id}"></div></div>`:''}</div>`;
        }).join('');
        movies.filter(m => m.media_type === 'tv' && m.tmdb_id).forEach(m => loadWatchSeasons(m.id, m.tmdb_id));
    } catch { $('watchingGrid').innerHTML = '<div class="watching-empty">Failed to load</div>'; }
}

async function loadWatchSeasons(dbId, tmdbId) {
    if (!TMDB_KEY) return;
    try {
        const d = await (await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_KEY}`)).json();
        const sel = $(`wSeason-${dbId}`);
        if (!sel || !d.number_of_seasons) return;
        let h = '';
        for (let i = 1; i <= d.number_of_seasons; i++) h += `<option value="${i}">Season ${i}</option>`;
        sel.innerHTML = h;
        loadWatchEpisodes(dbId, tmdbId, 1);
    } catch {}
}

async function loadWatchEpisodes(dbId, tmdbId, seasonNum) {
    if (!TMDB_KEY) return;
    const epSel = $(`wEpisode-${dbId}`);
    const preview = $(`wEpPreview-${dbId}`);
    if (!epSel) return;
    epSel.innerHTML = '<option>Loading...</option>';
    if (preview) preview.innerHTML = '';
    try {
        const d = await (await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNum}?api_key=${TMDB_KEY}`)).json();
        if (!d.episodes || !d.episodes.length) { epSel.innerHTML = '<option>No episodes</option>'; return; }
        epSel.innerHTML = d.episodes.map(ep => `<option value="${ep.episode_number}" data-name="${ep.name||''}" data-still="${ep.still_path||''}" data-overview="${(ep.overview||'').replace(/"/g,'&quot;')}" data-runtime="${ep.runtime||''}" data-rating="${ep.vote_average||''}">E${ep.episode_number} — ${ep.name||'Episode '+ep.episode_number}</option>`).join('');
        epSel.onchange = () => showWatchEpPreview(dbId);
        showWatchEpPreview(dbId);
    } catch { epSel.innerHTML = '<option>Failed</option>'; }
}

function showWatchEpPreview(dbId) {
    const sel = $(`wEpisode-${dbId}`);
    const preview = $(`wEpPreview-${dbId}`);
    if (!sel || !preview) return;
    const opt = sel.selectedOptions[0];
    if (!opt || !opt.value) { preview.innerHTML = ''; return; }
    const still = opt.dataset.still;
    const name = opt.dataset.name || `Episode ${opt.value}`;
    const overview = opt.dataset.overview || '';
    const runtime = opt.dataset.runtime;
    const rating = opt.dataset.rating;
    preview.innerHTML = `<div class="w-ep-preview-card">${still?`<img src="${TMDB_IMG}w300${still}" alt="${name}">`:''}
    <div class="w-ep-preview-info"><h4>${name}</h4><p>${overview}</p><div class="w-ep-preview-meta">${runtime?`<span><span class="material-icons-round">schedule</span> ${runtime} min</span>`:''}${rating&&rating!=='0'?`<span><span class="material-icons-round">star</span> ${parseFloat(rating).toFixed(1)}</span>`:''}</div></div></div>`;
}

function playFromSelector(tmdbId, dbId) {
    const s = $(`wSeason-${dbId}`)?.value || 1;
    const e = $(`wEpisode-${dbId}`)?.value || 1;
    const src = localStorage.getItem('mtrack-default-source') || 'spencerdevs';
    window.open(SOURCES[src].tv(tmdbId, s, e), '_blank');
}

async function markWatched(dbId) {
    try {
        await fetch(`/api/movies/${dbId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'watched' }) });
        loadWatching(); loadMyList(); loadStats();
        showToast('Marked as watched!');
    } catch { showToast('Failed', 'error'); }
}

function watchNow(tmdbId, mediaType) {
    if (!tmdbId) return;
    const src = localStorage.getItem('mtrack-default-source') || 'spencerdevs';
    window.open(mediaType === 'tv' ? SOURCES[src].tv(tmdbId, 1, 1) : SOURCES[src].movie(tmdbId), '_blank');
}

// ================================================================
// SEARCH
// ================================================================
async function doSearch(query) {
    if (!TMDB_KEY) return;
    try {
        const d = await (await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`)).json();
        const results = (d.results || []).filter(r => r.media_type === 'movie' || r.media_type === 'tv');
        $('searchSection').style.display = '';
        $('searchTitle').textContent = `Results for "${query}"`;
        if (!results.length) { $('searchResults').innerHTML = '<div class="ml-empty"><span class="material-icons-round">search_off</span>No results</div>'; return; }
        $('searchResults').innerHTML = results.slice(0, 20).map(item => {
            const title = item.title || item.name;
            const poster = item.poster_path ? `${TMDB_IMG}w300${item.poster_path}` : '';
            const year = (item.release_date || item.first_air_date || '').substring(0, 4);
            return `<div class="ml-card" onclick="openDetailById(${item.id},'${item.media_type}')">${poster?`<img src="${poster}" alt="${title}" loading="lazy">`:'<div class="nf-card-no-img" style="height:250px"><span class="material-icons-round">movie</span></div>'}<div class="ml-card-body"><h4>${title}</h4><span>${year} · ${item.media_type}</span></div></div>`;
        }).join('');
    } catch { showToast('Search failed', 'error'); }
}

// ================================================================
// MY LIST
// ================================================================
async function loadMyList() {
    try {
        const movies = await (await fetch(`/api/movies?status=${currentFilter}`)).json();
        if (!movies.length) { $('myListGrid').innerHTML = '<div class="ml-empty"><span class="material-icons-round">video_library</span>Your list is empty</div>'; return; }
        $('myListGrid').innerHTML = movies.map(m => `<div class="ml-card" onclick="openDetailFromDb(${m.id})">${m.poster?`<img src="${m.poster}" alt="${m.title}" loading="lazy">`:'<div class="nf-card-no-img" style="height:250px"><span class="material-icons-round">movie</span></div>'}<span class="ml-card-status s-${m.status}">${m.status}</span><div class="ml-card-body"><h4>${m.title}</h4><span>${m.year||''} ${m.genre?'· '+m.genre:''}</span><div class="ml-card-stars">${[1,2,3,4,5].map(s=>`<span class="material-icons-round ${s<=m.rating?'filled':''}">star</span>`).join('')}</div></div></div>`).join('');
    } catch { $('myListGrid').innerHTML = '<div class="ml-empty">Failed to load</div>'; }
}

async function loadStats() {
    try {
        const s = await (await fetch('/api/stats')).json();
        $('sTotal').textContent = s.total; $('sWatching').textContent = s.watching;
        $('sWatched').textContent = s.watched; $('sWatchlist').textContent = s.watchlist;
        $('sAvg').textContent = s.avgRating;
    } catch {}
}

// ================================================================
// DETAIL MODAL
// ================================================================
async function openDetailById(tmdbId, mediaType = 'movie') {
    if (!TMDB_KEY) return;
    try {
        const d = await (await fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${TMDB_KEY}`)).json();
        d._mediaType = mediaType;
        openDetail(d, mediaType);
    } catch { showToast('Failed to load', 'error'); }
}

async function openDetail(item, mediaType = 'movie') {
    detailData = item;
    detailData._mediaType = mediaType;
    detailDbId = null;
    selectedRating = 0;
    popupSeason = 1;
    popupEpisode = 1;
    popupSeasonData = null;

    const title = item.title || item.name || '';
    const year = (item.release_date || item.first_air_date || '').substring(0, 4);
    const genres = (item.genres || []).map(g => g.name).join(', ');
    const runtime = item.runtime ? `${item.runtime} min` : item.number_of_seasons ? `${item.number_of_seasons} Season${item.number_of_seasons > 1 ? 's' : ''}` : '';

    try {
        const my = await (await fetch('/api/movies')).json();
        const f = my.find(m => m.tmdb_id == item.id);
        if (f) {
            detailDbId = f.id; selectedRating = f.rating || 0;
            $('detailStatus').value = f.status;
            $('detailNotes').value = f.notes || '';
            $('detailSave').innerHTML = '<span class="material-icons-round">save</span> Update';
            $('detailDelete').style.display = '';
        } else {
            $('detailStatus').value = 'watchlist';
            $('detailNotes').value = '';
            $('detailSave').innerHTML = '<span class="material-icons-round">add</span> Add to My List';
            $('detailDelete').style.display = 'none';
        }
    } catch {}

    $('detailHero').style.backgroundImage = item.backdrop_path ? `url(${TMDB_IMG}w1280${item.backdrop_path})` : '';
    $('detailTitle').textContent = title;
    $('detailMeta').innerHTML = `<span>${year}</span>${genres?`<span>${genres}</span>`:''}${runtime?`<span>${runtime}</span>`:''}<span class="tmdb-badge">★ ${item.vote_average ? item.vote_average.toFixed(1) : '—'}</span>`;
    $('detailOverview').textContent = item.overview || '';
    $('detailTmdbScore').textContent = item.vote_average ? item.vote_average.toFixed(1) + '/10' : '—';
    detailData._genre = genres;

    // TV season/episode selector
    const tvSection = $('popupTvSection');
    if (mediaType === 'tv' && item.number_of_seasons) {
        tvSection.style.display = '';
        loadPopupSeasons(item.id, item.number_of_seasons);
        $('detailWatchText').textContent = 'Watch S1 E1';
    } else {
        tvSection.style.display = 'none';
        $('detailWatchText').textContent = 'Watch Now';
    }

    updateStars();
    $('detailModal').classList.add('active');
}

// ================================================================
// POPUP TV SEASON/EPISODE
// ================================================================
function loadPopupSeasons(tmdbId, count) {
    const sel = $('popupSeasonSelect');
    let h = '';
    for (let i = 1; i <= count; i++) h += `<option value="${i}">Season ${i}</option>`;
    sel.innerHTML = h;
    sel.value = 1;
    loadPopupEpisodes(tmdbId, 1);
}

async function loadPopupEpisodes(tmdbId, seasonNum) {
    if (!TMDB_KEY) return;
    const epSel = $('popupEpisodeSelect');
    const epList = $('popupEpList');
    const preview = $('popupEpPreview');

    epSel.innerHTML = '<option>Loading...</option>';
    if (epList) epList.innerHTML = '';
    if (preview) preview.innerHTML = '';

    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNum}?api_key=${TMDB_KEY}`);
        popupSeasonData = await res.json();

        if (!popupSeasonData.episodes || !popupSeasonData.episodes.length) {
            epSel.innerHTML = '<option>No episodes</option>';
            return;
        }

        // Fill dropdown
        epSel.innerHTML = popupSeasonData.episodes.map(ep =>
            `<option value="${ep.episode_number}">E${ep.episode_number} — ${ep.name || 'Episode ' + ep.episode_number}</option>`
        ).join('');

        popupEpisode = 1;
        epSel.value = 1;

        // Fill episode list
        renderPopupEpList();
        updatePopupEpPreview();
        updateWatchButtonText();

    } catch {
        epSel.innerHTML = '<option>Failed</option>';
    }
}

function renderPopupEpList() {
    const epList = $('popupEpList');
    if (!epList || !popupSeasonData || !popupSeasonData.episodes) return;

    epList.innerHTML = popupSeasonData.episodes.map(ep => `
    <div class="popup-ep-item ${ep.episode_number === popupEpisode ? 'active' : ''}"
         onclick="selectPopupEpisode(${ep.episode_number})">
      <div class="popup-ep-item-thumb">
        ${ep.still_path
        ? `<img src="${TMDB_IMG}w185${ep.still_path}" alt="E${ep.episode_number}" loading="lazy">`
        : `<div class="popup-ep-item-thumb-empty"><span class="material-icons-round">movie</span></div>`
    }
      </div>
      <div class="popup-ep-item-info">
        <span class="ep-item-num">E${ep.episode_number}</span>
        <h5>${ep.name || 'Episode ' + ep.episode_number}</h5>
      </div>
      ${ep.runtime ? `<span class="popup-ep-item-runtime">${ep.runtime}m</span>` : ''}
      ${ep.episode_number === popupEpisode ? '<span class="ep-item-playing"><span class="material-icons-round">play_arrow</span>Selected</span>' : ''}
    </div>
  `).join('');
}

function selectPopupEpisode(epNum) {
    popupEpisode = epNum;
    $('popupEpisodeSelect').value = epNum;
    updatePopupEpPreview();
    renderPopupEpList();
    updateWatchButtonText();
}

function updatePopupEpPreview() {
    const preview = $('popupEpPreview');
    if (!preview || !popupSeasonData || !popupSeasonData.episodes) return;

    const ep = popupSeasonData.episodes.find(e => e.episode_number === popupEpisode);
    if (!ep) { preview.innerHTML = ''; return; }

    preview.innerHTML = `
    <div class="popup-ep-preview-card">
      ${ep.still_path
        ? `<img src="${TMDB_IMG}w300${ep.still_path}" alt="${ep.name}" loading="lazy">`
        : `<div class="ep-preview-no-img"><span class="material-icons-round">movie</span></div>`
    }
      <div class="popup-ep-preview-info">
        <div class="ep-preview-number">Season ${popupSeason} · Episode ${ep.episode_number}</div>
        <h4>${ep.name || 'Episode ' + ep.episode_number}</h4>
        <p>${ep.overview || 'No description available.'}</p>
        <div class="popup-ep-preview-meta">
          ${ep.air_date ? `<span><span class="material-icons-round">calendar_today</span> ${ep.air_date}</span>` : ''}
          ${ep.vote_average ? `<span><span class="material-icons-round">star</span> ${ep.vote_average.toFixed(1)}</span>` : ''}
          ${ep.runtime ? `<span><span class="material-icons-round">schedule</span> ${ep.runtime} min</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function updatePopupEpListActive() {
    document.querySelectorAll('.popup-ep-item').forEach(item => {
        item.classList.remove('active');
        const badge = item.querySelector('.ep-item-playing');
        if (badge) badge.remove();
    });
    // Re-render to update badges
    renderPopupEpList();
}

function updateWatchButtonText() {
    const btn = $('detailWatchText');
    if (!btn) return;
    if (detailData && detailData._mediaType === 'tv') {
        btn.textContent = `Watch S${popupSeason} E${popupEpisode}`;
    } else {
        btn.textContent = 'Watch Now';
    }
}

// ================================================================
// DETAIL FROM DB
// ================================================================
async function openDetailFromDb(dbId) {
    try {
        const my = await (await fetch('/api/movies')).json();
        const m = my.find(x => x.id === dbId);
        if (!m) return;
        if (m.tmdb_id && TMDB_KEY) {
            openDetailById(m.tmdb_id, m.media_type || 'movie');
        } else {
            detailData = { id: m.tmdb_id, title: m.title, overview: m.overview, _mediaType: m.media_type || 'movie' };
            detailDbId = m.id; selectedRating = m.rating || 0;
            $('detailHero').style.backgroundImage = m.backdrop ? `url(${m.backdrop})` : '';
            $('detailTitle').textContent = m.title;
            $('detailMeta').innerHTML = `<span>${m.year||''}</span>${m.genre?`<span>${m.genre}</span>`:''}`;
            $('detailOverview').textContent = m.overview || '';
            $('detailTmdbScore').textContent = '—';
            $('detailStatus').value = m.status;
            $('detailNotes').value = m.notes || '';
            $('detailSave').innerHTML = '<span class="material-icons-round">save</span> Update';
            $('detailDelete').style.display = '';
            $('popupTvSection').style.display = 'none';
            $('detailWatchText').textContent = 'Watch Now';
            updateStars();
            $('detailModal').classList.add('active');
        }
    } catch {}
}

function closeDetail() {
    $('detailModal').classList.remove('active');
    popupSeasonData = null;
}

function updateStars() {
    $('detailStars').querySelectorAll('.star-btn').forEach((s, i) => s.classList.toggle('active', i < selectedRating));
}

// ================================================================
// SAVE / DELETE / QUICK ADD
// ================================================================
async function saveFromDetail() {
    if (!detailData) return;
    const payload = {
        title: detailData.title || detailData.name || '',
        year: (detailData.release_date || detailData.first_air_date || '').substring(0, 4),
        genre: detailData._genre || '',
        poster: detailData.poster_path ? `${TMDB_IMG}w500${detailData.poster_path}` : '',
        backdrop: detailData.backdrop_path ? `${TMDB_IMG}w1280${detailData.backdrop_path}` : '',
        overview: detailData.overview || '',
        tmdb_id: detailData.id || null,
        media_type: detailData._mediaType || 'movie',
        rating: selectedRating,
        status: $('detailStatus').value,
        notes: $('detailNotes').value
    };
    try {
        const url = detailDbId ? `/api/movies/${detailDbId}` : '/api/movies';
        await fetch(url, { method: detailDbId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        closeDetail(); loadMyList(); loadWatching(); loadStats();
        showToast(detailDbId ? 'Updated!' : 'Added!');
    } catch { showToast('Failed', 'error'); }
}

async function quickAdd(tmdbId, mediaType = 'movie') {
    if (!TMDB_KEY) return;
    try {
        const d = await (await fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${TMDB_KEY}`)).json();
        await fetch('/api/movies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                title: d.title || d.name || '', year: (d.release_date || d.first_air_date || '').substring(0, 4),
                genre: d.genres && d.genres.length ? d.genres[0].name : '',
                poster: d.poster_path ? `${TMDB_IMG}w500${d.poster_path}` : '',
                backdrop: d.backdrop_path ? `${TMDB_IMG}w1280${d.backdrop_path}` : '',
                overview: d.overview || '', tmdb_id: d.id, media_type: mediaType,
                rating: 0, status: 'watchlist', notes: ''
            })});
        loadMyList(); loadWatching(); loadStats();
        showToast(`${d.title||d.name} added!`);
    } catch { showToast('Failed', 'error'); }
}

async function deleteFromDetail() {
    if (!detailDbId || !confirm('Remove?')) return;
    try {
        await fetch(`/api/movies/${detailDbId}`, { method: 'DELETE' });
        closeDetail(); loadMyList(); loadWatching(); loadStats();
        showToast('Removed');
    } catch { showToast('Failed', 'error'); }
}

function openWatch(tmdbId, mediaType) {
    const src = localStorage.getItem('mtrack-default-source') || 'spencerdevs';
    window.open(mediaType === 'tv' ? SOURCES[src].tv(tmdbId, 1, 1) : SOURCES[src].movie(tmdbId), '_blank');
}

// ================================================================
// TOAST
// ================================================================
function showToast(msg, type = 'success') {
    $('toastMsg').textContent = msg;
    const i = $('toastIcon');
    i.textContent = type === 'error' ? 'error' : 'check_circle';
    i.style.color = type === 'error' ? 'var(--red)' : 'var(--green)';
    $('toast').classList.add('show');
    setTimeout(() => $('toast').classList.remove('show'), 3000);
}

// ================================================================
init();