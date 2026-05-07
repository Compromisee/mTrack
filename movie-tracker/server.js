const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'mtrack-2024', resave: false, saveUninitialized: false, cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } }));

const auth = (req, res, next) => req.session.userId ? next() : res.status(401).json({ error: 'Unauthorized' });

app.get('/', (req, res) => res.redirect(req.session.userId ? '/pages/dashboard.html' : '/pages/login.html'));

app.post('/api/register', (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
        if (password.length < 6) return res.status(400).json({ error: 'Password 6+ chars' });
        if (db.findUserByUsernameOrEmail(username, email)) return res.status(400).json({ error: 'Already exists' });
        const user = db.createUser(username, email, bcrypt.hashSync(password, 10));
        req.session.userId = user.id; req.session.username = user.username;
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const user = db.findUserByUsername(username);
        if (!user || !bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Invalid credentials' });
        req.session.userId = user.id; req.session.username = user.username;
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/logout', (req, res) => { req.session.destroy(); res.json({ success: true }); });
app.get('/api/me', auth, (req, res) => res.json({ id: req.session.userId, username: req.session.username }));

app.get('/api/movies', auth, (req, res) => { try { res.json(db.getMovies(req.session.userId, req.query)); } catch { res.status(500).json({ error: 'Server error' }); } });
app.post('/api/movies', auth, (req, res) => { try { if (!req.body.title) return res.status(400).json({ error: 'Title required' }); res.json(db.addMovie(req.session.userId, req.body)); } catch { res.status(500).json({ error: 'Server error' }); } });
app.put('/api/movies/:id', auth, (req, res) => { try { const id = parseInt(req.params.id); if (!db.getMovieById(id, req.session.userId)) return res.status(404).json({ error: 'Not found' }); res.json(db.updateMovie(id, req.session.userId, req.body)); } catch { res.status(500).json({ error: 'Server error' }); } });
app.delete('/api/movies/:id', auth, (req, res) => { try { const id = parseInt(req.params.id); if (!db.deleteMovie(id, req.session.userId)) return res.status(404).json({ error: 'Not found' }); res.json({ success: true }); } catch { res.status(500).json({ error: 'Server error' }); } });
app.get('/api/stats', auth, (req, res) => { try { res.json(db.getStats(req.session.userId)); } catch { res.status(500).json({ error: 'Server error' }); } });

app.listen(PORT, () => { console.log(`\n  🎬 mTrack → http://localhost:${PORT}\n`); });