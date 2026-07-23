# Toernooi-generator

Doel: speelschema's genereren. Geen uitslagen, geen standen, geen backend.

## Architectuurregels — niet schenden
1. `src/tournament/` bevat pure TypeScript. Geen React, geen browser-API's,
   geen async, geen Date.now().
2. Bracketgeneratie en scheduling zijn gescheiden modules. De bracket kent geen
   tijd of velden; de scheduler kent geen sportregels.
3. Elk nieuw format implementeert de `TournamentFormat` interface volledig.
4. Geïmporteerde JSON valideren met Zod aan de rand, daarna vertrouwen op types.
5. Geen uitslagen-, standen- of puntenlogica toevoegen. Dat is buiten scope.

## Werkwijze
- Schrijf de test voor de engine-logica vóór de implementatie.
- Geen nieuwe dependency zonder te vragen.
- Bij twijfel over een toernooiregel: vragen, niet gokken. Sportbonden hanteren
  afwijkende regels.
- Commit per afgeronde subtaak, niet per fase.

## Beslissingen
- Zwitsers systeem wordt niet geïmplementeerd: zonder uitslagen kan de paring
  vanaf ronde 2 niet worden bepaald.
- Individuen en teams worden beide gemodelleerd als `Entry` (1..n participants).

## Commando's
npm run dev / npm run test / npm run test:watch / npm run typecheck
