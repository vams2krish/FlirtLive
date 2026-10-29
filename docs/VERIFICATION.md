# Demo verification — October 29, 2026

## Scope

Story: browse sample hosts → open a room → chat/follow/send a gift → persist browser-local data → reload and render it again.

This is a static, browser-local product demo. There is no API, database, streaming transport, authentication, or payment processor to test. Production deployment of the demo does not make those services operational.

## Executed checks

| Check | Result | Evidence |
| --- | --- | --- |
| JavaScript syntax | Pass | `node --check dist/app.js` |
| Route rendering and discovery | Pass | Simulated DOM renders all eight routes; search/category matches and empty results checked |
| Wallet and gifts | Pass | 1,250 → 1,240 after a Rose; gift stat +10; both displayed balances update; reload retains balance; insufficient funds rejected |
| Local chat | Pass | Message retained through follow and reload; whitespace-only input ignored |
| Profile | Pass | Named form fields save trimmed name/bio; blank name rejected |
| Storage recovery | Pass | Invalid JSON and invalid wallet state fall back to defaults; persisted message markup is rendered as text |
| Local HTTP server | Pass | Home page returned HTTP 200 |
| Fresh live browser walkthrough | Blocked | Browser tool returned “Local browser use is disabled in Work settings” |
| Fresh multi-page screenshots | Blocked | Same browser restriction; existing home screenshot is from the earlier build |

Run regression checks with:

```sh
node --check dist/app.js
node --test tests/demo.test.cjs
```

The five regression tests use Node's VM and a minimal simulated DOM. They validate application behavior, not browser layout, CSS, media loading, or actual browser event handling.

## Fixes in this revision

- Room gift balance updates alongside the header balance.
- Follow action in a room preserves the visible chat.
- Room messages and gift notifications persist locally, capped at 100 entries per room.
- Profile form uses named controls reliably and rejects blank names.
- Invalid saved state no longer crashes initial loading.
- Storage write errors show a notice instead of throwing.
- Profile upload rejects unsupported image MIME types.
- Share confirmation occurs only after clipboard success.
- Persisted chat is restored as text, not executable HTML.

## Remaining live acceptance checklist

When browser access is available, test desktop and mobile layouts; search/category/country combinations; room chat and follow; each gift and insufficient-balance behavior; coin top-up; profile photo/name/bio; reload persistence; leaderboard links; message invitations; hosting interest; clipboard failure; keyboard navigation; console errors; external images/fonts. Capture home, discovery, room, leaderboard, wallet, profile, and mobile screenshots from that tested build.

Real video, shared messages, accounts, real money, moderation, identity checks, and payouts remain unimplemented integrations. No production readiness claim is made.
