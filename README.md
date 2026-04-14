# metbarista ☕

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Live](https://img.shields.io/badge/live-metbarista.com-orange)](https://metbarista.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**The open community control plane for Meticulous espresso machines.**

Live at → **[metbarista.com](https://metbarista.com)**

---

## What is this?

metbarista is a free, open-source PWA that connects directly to your [Meticulous](https://meticuloushome.com) espresso machine over your local WiFi. No cloud, no account, no subscription — your machine IP is the only thing you need.

### Features

| Feature | Description |
|---|---|
| 🎛 **Dashboard** | Live machine status, all controls (start, stop, preheat, tare, purge, raise) |
| 📋 **Profiles** | Browse all profiles on your machine with cover images + pressure curve fingerprints |
| 📈 **Shot History** | Every shot with full telemetry charts (pressure, flow, weight, temperature) |
| 📡 **Live Telemetry** | Real-time shot data as it's being pulled |
| 🔬 **Compare** | Side-by-side shot comparison |
| ✏️ **Create** | Build new pressure/flow profiles from scratch |
| 🌐 **Community** | Firmware changelog, company updates, resources |
| 📤 **Share** | Export profiles in OEPF format |

### Philosophy

> **Machine = Identity.** Connecting your Meticulous IS your login. No OAuth, no passwords, no accounts. If you own a machine, you're part of the community.

Everything runs in your browser. metbarista talks directly to `http://{your-machine-ip}/api/v1/` — the same API the official app uses.

---

## Getting Started (contributors)

### Prerequisites

- Node.js 20+
- A Meticulous machine on your local network (or the IP doesn't matter for UI work)

### Setup

```bash
git clone https://github.com/nakashon/metbarista.git
cd metbarista
npm install
cp .env.example .env.local   # add your own keys (optional — app works without them)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

The app works fully without any env vars. They only enable optional features:

| Variable | Purpose | Required |
|---|---|---|
| `NEXT_PUBLIC_FEEDBACK_TOKEN` | GitHub Issues PAT for the feedback button | Optional |
| `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` | Cloudflare Web Analytics beacon token | Optional |

See `.env.example` for setup instructions.

> **Note:** The live site at metbarista.com uses its own keys injected at build time via GitHub Actions secrets. Contributors use their own keys (or none at all).

---

## Architecture

```
Browser (PWA)
    │
    ├── metbarista.com (GitHub Pages, static export)
    │       └── Next.js 15 · Tailwind v4 · Recharts
    │
    ├── http://192.168.x.x/api/v1/  ← your Meticulous, local network only
    │       └── CORS open, direct browser ↔ machine
    │
    └── metbarista-feed-proxy.metbarista.workers.dev  ← Cloudflare Worker
            └── Proxies meticuloushome.com Atom feeds (firmware changelog etc.)
```

**No server. No database. No user data leaves your network.**

---

## Machine API

The Meticulous machine exposes a local HTTP API:

```
GET  /api/v1/machine           → machine info (name, serial, firmware)
GET  /api/v1/profile/list?full=true  → all profiles with stages
GET  /api/v1/history           → shot history
GET  /api/v1/history/{id}      → single shot telemetry
POST /api/v1/action            → { "name": "start"|"stop"|"preheat"|"tare"|"purge"|"raise" }
WS   /ws/shot                  → live telemetry stream
```

`serial` from `/api/v1/machine` is used as the anonymous machine identity for feedback submissions.

---

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

The easiest way to contribute:
- 🐛 Found a bug? Use the **feedback button** in the app (bottom-right when connected)
- ✨ Have an idea? Open a [GitHub Issue](https://github.com/nakashon/metbarista/issues)
- 🔧 Want to code? Fork → branch → PR

---

## License

MIT — see [LICENSE](LICENSE). Free forever, for the community.

Built with ☕ by [@nakashon](https://github.com/nakashon) and the Meticulous community.
