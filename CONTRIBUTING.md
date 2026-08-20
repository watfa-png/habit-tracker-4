# Contributing to Watfa Habit Tracker

Thanks for helping improve the project.

## Before you start

1. Search existing issues before opening a duplicate.
2. Keep changes focused and avoid unrelated formatting churn.
3. Never commit secrets, personal exports, generated office documents, or user data.
4. Preserve Arabic RTL and English LTR behavior.
5. Treat all habit/event/profile text as untrusted user input.

## Local checks

Run before submitting a pull request:

```bash
node tests/smoke.test.js
for f in js/*.js; do node --check "$f"; done
```

Then manually check the affected pages in a browser at desktop and mobile widths.

## Pull requests

Describe what changed, why it changed, how it was tested, and any migration or compatibility impact. Security fixes should avoid publishing exploit details before maintainers have had a reasonable chance to release a patch.
