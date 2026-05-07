const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, 'data.json');

const DEFAULT = { users: [], movies: [], nextUserId: 1, nextMovieId: 1 };

function load() {
  try {
    if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (e) { console.error('DB read error:', e.message); }
  return { ...DEFAULT };
}

function save(db) {
  try { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }
  catch (e) { console.error('DB write error:', e.message); }
}

module.exports = {
  findUserByUsername(u) { return load().users.find(x => x.username === u) || null; },
  findUserByUsernameOrEmail(u, e) { return load().users.find(x => x.username === u || x.email === e) || null; },
  createUser(username, email, password) {
    const db = load();
    const user = { id: db.nextUserId++, username, email, password, created_at: new Date().toISOString() };
    db.users.push(user); save(db); return user;
  },
  getMovies(userId, f = {}) {
    let m = load().movies.filter(x => x.user_id === userId);
    if (f.status && f.status !== 'all') m = m.filter(x => x.status === f.status);
    if (f.media_type && f.media_type !== 'all') m = m.filter(x => x.media_type === f.media_type);
    if (f.search) { const s = f.search.toLowerCase(); m = m.filter(x => x.title.toLowerCase().includes(s)); }
    return m.sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
  },
  getMovieById(id, userId) { return load().movies.find(x => x.id === id && x.user_id === userId) || null; },
  addMovie(userId, d) {
    const db = load();
    const movie = {
      id: db.nextMovieId++, user_id: userId, tmdb_id: d.tmdb_id || null,
      media_type: d.media_type || 'movie', title: d.title, year: d.year || '',
      genre: d.genre || '', poster: d.poster || '', backdrop: d.backdrop || '',
      overview: d.overview || '', rating: d.rating || 0, status: d.status || 'watchlist',
      notes: d.notes || '', added_at: new Date().toISOString()
    };
    db.movies.push(movie); save(db); return movie;
  },
  updateMovie(id, userId, d) {
    const db = load();
    const i = db.movies.findIndex(x => x.id === id && x.user_id === userId);
    if (i === -1) return null;
    Object.keys(d).forEach(k => { if (d[k] !== undefined) db.movies[i][k] = d[k]; });
    save(db); return db.movies[i];
  },
  deleteMovie(id, userId) {
    const db = load();
    const i = db.movies.findIndex(x => x.id === id && x.user_id === userId);
    if (i === -1) return false;
    db.movies.splice(i, 1); save(db); return true;
  },
  getStats(userId) {
    const m = load().movies.filter(x => x.user_id === userId);
    const r = m.filter(x => x.rating > 0);
    return {
      total: m.length, watched: m.filter(x => x.status === 'watched').length,
      watching: m.filter(x => x.status === 'watching').length,
      watchlist: m.filter(x => x.status === 'watchlist').length,
      avgRating: r.length ? (r.reduce((s, x) => s + x.rating, 0) / r.length).toFixed(1) : '0'
    };
  }
};