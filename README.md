# Fyrtal

Ett dagligt svenskt grupperingspussel: 16 ord ska sorteras i 4 grupper om 4.
Expo / React Native, iOS + Android.

Hela upplägget – UX, pusselleverans, pipelines, design – ligger i [plan.md](plan.md).

## Läge

**Fas 1 (skelett) är byggd:** tre vyer, hårdkodat pussel och hela spel-logiken.
Fas 2–6 återstår, se [plan.md §11](plan.md).

## Kom igång

```sh
npm install
npm start          # Expo dev server – skanna QR-koden med Expo Go
npm test           # spel-logikens tester
npm run typecheck
```

## Struktur

| Sökväg | Vad |
| --- | --- |
| `src/types/puzzle.ts` | Pusselschemat. Delas med generator och validering i fas 2–3 (§3, §10). |
| `src/game/engine.ts` | Spel-logiken. Ren och serialiserbar, inga React-beroenden (§2). |
| `src/game/share.ts` | Delnings-strängen, byggd ur gissnings-historiken (§2). |
| `src/game/shuffle.ts` | Fisher–Yates med injicerbar RNG. |
| `src/theme/tokens.ts` | Design-tokens: palett, nivåfärger, radier, typografi (§9). |
| `src/data/samplePuzzle.ts` | Det hårdkodade pusslet. Byts mot hämtning + dekryptering i fas 2 (§4). |
| `src/screens/` | Start-, spel- och resultatvyn (§1). |
| `App.tsx` | Håller spel-tillståndet i minnet och växlar vy. |

Spel-tillståndet i `engine.ts` innehåller redan gissnings-historiken, så fas 2
kan spara det rakt av till lokal lagring för återupptagning och streak (§6, §7).

## Vad som medvetet saknas i fas 1

- Ingen lagring – tillståndet lever i minnet och nollställs när appen startas om.
  Streaken visas därför alltid som 0.
- Pusslet är hårdkodat; ingen hämtning, ingen dekryptering.
- Typsnitten är systemets. `typography` i `tokens.ts` har platshållare tills
  fas 5 väljer grotesk + serif.
- Nedräkningen till nästa pussel använder enhetens lokala midnatt, inte
  Europe/Stockholm (§7).
