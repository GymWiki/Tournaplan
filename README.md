# Toernooi-generator

Genereert een compleet speelschema (wedstrijden, veld, tijd) voor toernooien —
inclusief toernooien waarin dezelfde deelnemers aan meerdere sporten
tegelijk meedoen. Zie `CLAUDE.md` voor de architectuurregels.

Geen backend: de app draait volledig in de browser, met `localStorage` en
JSON-import/export als persistentie.

## Commando's

```
npm run dev         # dev-server
npm run test        # eenmalige testrun (Vitest)
npm run test:watch  # Vitest in watch-mode
npm run typecheck   # tsc --noEmit, strict mode
npm run build       # productiebuild
```

## Structuur

- `src/tournament/` — pure TypeScript domeinlogica (geen React, geen browser-API's)
  - `types.ts` — domeinmodel (Tournament, Discipline, Entry, Participant, Resource, Match)
  - `formats/` — bracketgeneratie per toernooivorm
  - `scheduler/` — plaatsing van wedstrijden op veld + tijd
- `src/` (overig) — React-UI
