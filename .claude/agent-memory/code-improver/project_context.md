---
name: Project Context
description: human-ledger-v1 is a Next.js 14 dark-humor/art project that theatrically collects device metadata and GPS to display a satirical "organ price" result page
type: project
---

Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Kakao Local API (REST key in env).

Key files:
- app/page.tsx — multi-step form (CreepyMultiStepForm), collects personal data as satire
- app/result/page.tsx — displays fictional "organ prices" using submitted form data and collected device metadata
- app/api/trace/route.ts — POST route that reverse-geocodes to nearest Kakao place
- hooks/useMetadataCollector.ts — collects browser fingerprint, battery, screen, GPS, reverse-geocode, and nearest place
- lib/organPricing.ts — pure calculation functions for fictional organ pricing and buyer profile

Recurring patterns to watch:
- Repeated inline style objects (fontFamily, imageRendering) duplicated across dozens of elements — should be extracted
- Unsafe JSON.parse from sessionStorage without try/catch in the main data path (result page line 38)
- Type-safety gaps: heavy use of Record<string, unknown> with repeated inline casts throughout result/page.tsx
- No rate limiting or input validation on the API route beyond null-checks
- useEffect dependency array in useMetadataCollector omits onLog callback (line 133), which could cause stale closure bugs
