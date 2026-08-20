# Changelog

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
