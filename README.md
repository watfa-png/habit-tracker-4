# Watfa Habit Tracker

A lightweight, local-first, trilingual habit tracker maintained by **Watfa**. It runs as a static web application, stores personal data in the browser, and does not require an account, backend, or database.

## Features

- 🌐 Full interface localization: العربية (RTL), Türkçe, English (LTR)

- Daily and weekly habits with streak tracking
- Dashboard and interactive statistics
- Calendar events and activity history
- Light and dark themes
- CSV and PDF export
- XP and level progression
- Local-first privacy: habit data stays in the browser by default
- Migration support from the original `habit_tracker_*` localStorage schema

## Run locally

No build step is required. Serve the project over HTTP so browser storage and external libraries behave consistently:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Data and privacy

Watfa Habit Tracker has no server-side account system. Data is stored in `localStorage` on the current browser/device. Clearing browser site data or using the in-app local-data reset removes it. Export important data before clearing the browser.

The profile name/email in Settings are local labels only. They are not authentication credentials and are not sent to a server.

## Security model

This repository intentionally does **not** pretend that browser-only authentication is a security boundary. The original client-side admin/login mechanism was removed because any localStorage-based role/password gate can be bypassed by a user who controls their browser.

See [SECURITY.md](SECURITY.md) for reporting issues and deployment guidance.

## Testing

```bash
node tests/smoke.test.js
node --check js/*.js
```

For releases, also perform a browser smoke test on the landing page, dashboard, statistics, calendar, and settings in Arabic, Turkish, and English and at mobile and desktop widths.

## Deployment

Because this is a static application, it can be hosted on GitHub Pages, Cloudflare Pages, Netlify, or any static web server. HTTPS is strongly recommended.

External browser dependencies are loaded from pinned CDN URLs. Production maintainers may vendor these assets if a fully self-contained distribution is required.

## Project structure

```text
css/               styles, responsive layout, dark mode
js/                storage, habits, statistics, charts, UI, translations
.github/            contribution and issue templates
tests/              dependency-free smoke tests
*.html              application pages
```

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

MIT. See [LICENSE](LICENSE).
