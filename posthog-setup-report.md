<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into your DevEvent Next.js App Router project.

## Summary of changes

- **`instrumentation-client.ts`** (new) — Initializes PostHog client-side using the `instrumentation-client` pattern for Next.js 15.3+. Includes error tracking (`capture_exceptions: true`) and debug mode in development.
- **`next.config.ts`** (updated) — Added reverse proxy rewrites so PostHog requests route through `/ingest/*`, reducing the chance of being blocked by ad blockers. Also set `skipTrailingSlashRedirect: true`.
- **`.env.local`** (new) — Stores `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` as environment variables.
- **`components/ExploreBtn.tsx`** (updated) — Added `posthog.capture('explore_events_clicked')` to the existing button onClick handler.
- **`components/EventCard.tsx`** (updated) — Added `'use client'` directive and `posthog.capture('event_card_clicked', { title, slug, location, date })` on link click, capturing key event metadata.

## Events instrumented

| Event Name | Description | File |
|---|---|---|
| `explore_events_clicked` | User clicked the "Explore Events" button on the homepage to scroll to featured events | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicked on an event card to view event details; includes title, slug, location, and date properties | `components/EventCard.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1628692)
- [Explore Events Button Clicks](/insights/ehSfgkO8) — Daily trend of homepage CTA clicks
- [Event Card Clicks](/insights/HObh0x00) — Daily trend of event card clicks
- [Unique Users Engaging with Events](/insights/sRfS5O77) — Compares daily active users across both events
- [Most Popular Events by Click](/insights/ShsG20Uh) — Event card clicks broken down by event title
- [Homepage to Event Detail Funnel](/insights/DnF75OPX) — Weekly comparison of Explore clicks vs Event Card clicks

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
