# Security Policy

## Supported version

Security fixes target the latest version on the default branch.

## Security model

Watfa Habit Tracker is a local-first static web application. It does not provide server-side authentication or authorization. Anyone with access to the browser profile can inspect or modify that browser's local application data.

Do not use local profile fields as proof of identity and do not add client-side "admin" roles that claim to protect sensitive data.

## Reporting a vulnerability

Please report security-sensitive issues privately to the Watfa maintainers rather than publishing a working exploit in a public issue. Include affected files, impact, reproduction conditions, and a suggested fix when possible.

## Deployment guidance

- Serve the app over HTTPS.
- Keep third-party browser dependencies pinned to explicit versions.
- Prefer vendoring third-party assets for high-assurance or offline deployments.
- Do not inject secrets into static JavaScript or HTML. Anything shipped to the browser is public.
- Configure appropriate security headers at the hosting layer.
