# mTrack 🎬

> **A self-hosted movie & show streaming/rating site — run it locally, own everything.**

[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-database-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![TMDB](https://img.shields.io/badge/TMDB-API%20Required-01b4e4?logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/settings/api)
[![HTML](https://img.shields.io/badge/HTML-46.9%25-e34f26?logo=html5&logoColor=white)]()
[![CSS](https://img.shields.io/badge/CSS-31.5%25-1572b6?logo=css3&logoColor=white)]()
[![JavaScript](https://img.shields.io/badge/JS-21.6%25-f7df1e?logo=javascript&logoColor=black)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

---

## ✨ What is mTrack?

mTrack is a **locally-hosted** streaming & rating site. Browse movies and shows pulled from TMDB, rate them, track your watch history, and manage your account — all from your own machine. No subscriptions. No ads. No cloud.

---

## 🗂️ Project Structure

```
mTrack/
└── movie-tracker/
    ├── public/
    │   ├── css/
    │   │   ├── style.css        # Core styles
    │   │   └── themes.css       # Theme definitions (light/dark/etc.)
    │   ├── js/
    │   │   ├── app.js           # Main frontend logic
    │   │   └── settings.js      # Theme & preferences handler
    │   └── pages/
    │       ├── dashboard.html   # Main watchlist/browse view
    │       ├── login.html       # User login
    │       ├── register.html    # Account creation
    │       ├── settings.html    # Theme selector & user prefs
    │       └── watch.html       # Movie/show detail & watch page
    ├── data.json                # Local config / seed data
    ├── database.js              # SQL DB interface (SQLite)
    ├── package.json
    └── server.js                # Express server entry point
```

---

## 🚀 Quick Start

> [!IMPORTANT]
> You need a free **TMDB API key** before running mTrack. Get one at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).

> [!IMPORTANT]
> **Node.js ≥ 18** is required. Run `node --version` to check.

```bash
# 1. Clone the repo
git clone https://github.com/Compromisee/mTrack.git
cd mTrack/movie-tracker

# 2. Install dependencies
npm install

# 3. Add your TMDB API key
#    Open data.json and set your key:
#    { "tmdb_api_key": "YOUR_KEY_HERE" }

# 4. Start the server
node server.js

# 5. Open your browser
# → http://localhost:3000
```

---

## 📦 Dependencies

| Package | Badge | Purpose |
|---------|-------|---------|
| Node.js | ![node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white) | Runtime |
| Express | ![express](https://img.shields.io/badge/express-4.x-000000?logo=express&logoColor=white) | HTTP server & routing |
| SQLite / better-sqlite3 | ![sqlite](https://img.shields.io/badge/SQLite-DB-003B57?logo=sqlite&logoColor=white) | Local SQL database via `database.js` |
| TMDB API | ![tmdb](https://img.shields.io/badge/TMDB-API-01b4e4?logo=themoviedatabase&logoColor=white) | Movie/show metadata & posters |

---

## 🔑 TMDB API Setup

1. Create a free account at [themoviedb.org](https://www.themoviedb.org)
2. Go to **Settings → API → Create → Developer**
3. Copy your **API Key (v3 auth)**
4. Paste it into `data.json`:

```json
{
  "tmdb_api_key": "paste_your_key_here"
}
```

> [!WARNING]
> Never commit your API key to a public repository. Add `data.json` to `.gitignore` if you fork this.

---

## 🎨 Theme Select

mTrack ships with multiple themes defined in `themes.css`, switchable from the **Settings page** via `settings.js` — no code edits needed. Pick light, dark, or any variant right from the UI.

---

## 🖥️ Pages

| Page | File | Description |
|------|------|-------------|
| Dashboard | `dashboard.html` | Browse, search & manage your watchlist |
| Watch | `watch.html` | Movie/show detail view |
| Login | `login.html` | User authentication |
| Register | `register.html` | Create a local account |
| Settings | `settings.html` | Theme selector & user preferences |

---

## 🗄️ Database

mTrack uses a **local SQL database** (`database.js`) to store user accounts, watch history, ratings, and preferences.

> [!NOTE]
> No external database server required. Everything runs locally via SQLite — zero setup beyond `npm install`.

---

## 📋 Requirements

> [!TIP]
> Verify before installing:
> ```bash
> node --version   # v18+
> npm --version    # v8+
> ```

---

## 🤝 Contributing

1. Fork the repo
2. `git checkout -b feature/your-feature`
3. `git commit -m 'Add your feature'`
4. `git push origin feature/your-feature`
5. Open a Pull Request

> [!NOTE]
> Bug reports, feature requests, and UI improvements are welcome via Issues!

---

## 📄 License

MIT © [Compromisee](https://github.com/Compromisee)

---

<div align="center">
  <strong>Your movies. Your data. Your server.</strong><br/>
  <a href="https://github.com/Compromisee/mTrack">⭐ Star mTrack on GitHub</a>
</div>
