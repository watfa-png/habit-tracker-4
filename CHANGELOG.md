# Changelog

## 2.1.1 - 2026-08-20

### Fixed
- Replaced the reload-based language cycle with direct العربية, Türkçe, and English selectors on every page.
- Applied the persisted locale before first paint and refresh dynamic habits, events, dates, statistics, charts, dialogs, and accessible labels immediately when the language changes.
- Localized CSV values, heatmap tooltips, calendar-day summaries, default-profile display text, and icon/action labels.
- Added runtime locale, direction, persistence, selector, and required-key coverage to the smoke tests.

## 2.1.0 - 2026-08-20

### Added
- Added complete Turkish (`tr-TR`) interface localization alongside Arabic and English.
- Added Turkish motivational quotes, date/month formatting, event labels, settings, exports, empty states, and runtime notifications.
- Added translation parity checks to the smoke test so Arabic, Turkish, and English keep the same key set.

### Changed
- Language switching now cycles Arabic → Turkish → English and preserves the selected language locally.
- Document titles, form placeholders, calendar dates, chart dates, CSV headers, and PDF report labels now follow the selected language.
- Settings language selector now includes العربية, Türkçe, and English.

## 2.0.0 - 2026-08-20

### Changed
- Rebranded the project as Watfa Habit Tracker.
- Converted the product model to local-first static usage.
- Removed misleading browser-only login/admin authorization.
- Added migration from the original per-user localStorage schema.
- Switched date keys and streak calculations to local calendar dates.
- Pinned Chart.js to an explicit version.
- Reworded/removes UI that claimed unimplemented browser notifications.

### Security
- Removed the default `admin / admin123` credential.
- Removed reversible Base64 password handling.
- Escaped user-controlled habit/event/chart text before HTML rendering.
- Added CSV formula-injection protection.
- Added safer color/icon validation and stronger generated IDs.
- Removed unrelated office-document content from the release tree.

### Project health
- Added smoke tests, security policy, contributing guide, code of conduct, MIT license, and issue templates.
