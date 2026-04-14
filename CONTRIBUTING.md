# Contributing to metbarista

Thanks for wanting to contribute! metbarista is built for the Meticulous community, by the community.

## Ways to contribute

### 🐛 Report a bug
Use the **feedback button** in the app (bottom-right corner when your machine is connected) — it files a GitHub issue automatically with your machine serial attached.

Or open an issue manually: [github.com/nakashon/metbarista/issues](https://github.com/nakashon/metbarista/issues)

### ✨ Suggest a feature
Same as above — use the feedback button or open an issue.

### 🔧 Submit a PR

1. **Fork** the repo
2. **Clone** your fork and install dependencies:
   ```bash
   git clone https://github.com/YOUR_USERNAME/metbarista.git
   cd metbarista
   npm install
   ```
3. **Create a branch:**
   ```bash
   git checkout -b fix/my-bug-description
   ```
4. **Run locally:**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```
5. **Make your changes** — keep them focused and small
6. **Build to check for errors:**
   ```bash
   npm run build
   ```
7. **Push and open a PR** against `main`

## What we're looking for

- Bug fixes ✅
- UX improvements ✅
- New machine API integrations ✅
- Performance improvements ✅
- Accessibility improvements ✅

## Please don't

- Change the live site's GitHub Actions secrets (you don't have access anyway)
- Add new external API dependencies without discussion
- Break the mobile-first layout
- Add login/accounts — machine = identity is a core principle

## Keys & secrets

You **do not need** any API keys to run the app locally. See `.env.example` for optional features.

The keys in the live site (Cloudflare analytics token, GitHub feedback token) are owned by the maintainer and injected via GitHub Actions secrets — they are never in source code.

## Code style

- TypeScript everywhere
- Tailwind v4 for styling (no CSS modules)
- Keep components small and focused
- No `!important`, no inline styles (except dynamic values like `accentColor`)

## Questions?

Open an issue or reach out on the [Meticulous Discord](https://discord.gg/w48ha2h3).
