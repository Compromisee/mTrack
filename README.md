# mTrack 🎬

> **A self-hosted streaming & rating site — run it locally, own your watchlist.**

[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org/)
[![HTML](https://img.shields.io/badge/HTML-46.9%25-e34f26?logo=html5&logoColor=white)]()
[![CSS](https://img.shields.io/badge/CSS-31.5%25-1572b6?logo=css3&logoColor=white)]()
[![JavaScript](https://img.shields.io/badge/JavaScript-21.6%25-f7df1e?logo=javascript&logoColor=black)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

---

## ✨ What is mTrack?

mTrack is a **locally-hosted** movie & show tracker. No subscriptions. No ads. No accounts. Just clone, run, and start rating.

- 🎥 Browse and track what you've watched
- ⭐ Rate and review your movies & shows
- 🖥️ Runs entirely on your machine via Node.js
- 🔒 Your data stays yours — 100% local

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/Compromisee/mTrack.git
cd mTrack/movie-tracker

# 2. Install dependencies
npm install

# 3. Start the server
node server.js

# 4. Open your browser
# → http://localhost:3000
```

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| ![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white) | `>=18.0.0` | Runtime |
| ![npm](https://img.shields.io/badge/npm-%3E%3D8-cb3837?logo=npm&logoColor=white) | `>=8.0.0` | Package manager |
| ![Express](https://img.shields.io/badge/express-4.x-000000?logo=express&logoColor=white) | `^4.x` | Local web server |

> **No cloud. No API keys. No nonsense.**

---

## 🛠️ Tech Stack

```
mTrack/
├── movie-tracker/
│   ├── public/         # Frontend (HTML + CSS + JS)
│   ├── server.js       # Node.js local server
│   └── package.json    # Dependencies
└── README.md
```

![Stack](https://skillicons.dev/icons?i=html,css,js,nodejs)

---

## 📋 Requirements

> [!IMPORTANT]
> You must have **Node.js ≥ 18** installed before running mTrack.

> [!NOTE]
> No database setup required. mTrack uses local storage to keep things simple.

> [!TIP]
> Run `node --version` to check your Node.js version before installing.

---

## ⚙️ Installation Details

> [!WARNING]
> Do **not** expose this server to the public internet — it is designed for local use only.

```bash
# Check prerequisites
node --version   # should be v18+
npm --version    # should be v8+

# Install and run
cd movie-tracker
npm install
node server.js
```

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/cool-thing`
3. Commit your changes: `git commit -m 'Add cool thing'`
4. Push to the branch: `git push origin feature/cool-thing`
5. Open a Pull Request

> [!NOTE]
> All contributions are welcome — bug fixes, features, UI improvements, or docs!

---

## 📄 License

MIT © [Compromisee](https://github.com/Compromisee)

---

<div align="center">
  <strong>Made with ❤️ for people who love movies and hate subscriptions.</strong><br/>
  <a href="https://github.com/Compromisee/mTrack">⭐ Star this repo if you like it!</a>
</div>
