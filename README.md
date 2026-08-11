# Fyrtal

Ett dagligt svenskt grupperingspussel: 16 ord ska sorteras i 4 grupper om 4.
Expo / React Native, iOS + Android.

Hela upplägget – UX, pusselleverans, pipelines, design – ligger i [plan.md](plan.md).

## Läge

Spelet fungerar: tre vyer, hela spel-logiken, lokal lagring med
återupptagning och streak. Pusslet är fortfarande hårdkodat – hämtningen och
dekrypteringen (§4) är nästa steg, liksom pipelines (§8) och designpasset (§5, §9).

## Kom igång

```sh
npm install
npm start          # Expo dev server – skanna QR-koden med Expo Go
npm test           # 45 tester för logiken
npm run typecheck
```

## Struktur

| Sökväg | Vad |
| --- | --- |
| `src/types/puzzle.ts` | Pusselschemat. Delas med generator och validering (§3, §10). |
| `src/game/engine.ts` | Spel-logiken. Ren och serialiserbar, inga React-beroenden (§2). |
| `src/game/streak.ts` | Streak-regeln. Ren logik, ingen lagring (§7). |
| `src/game/share.ts` | Delnings-strängen, byggd ur gissnings-historiken (§2). |
| `src/game/shuffle.ts` | Fisher–Yates med injicerbar RNG. |
| `src/storage/storage.ts` | AsyncStorage: pågående spel per pussel-id + streak (§6). |
| `src/lib/date.ts` | Europe/Stockholm utan Intl – dygnsbyte, nedräkning, datumdiff (§7). |
| `src/theme/tokens.ts` | Design-tokens: palett, nivåfärger, radier, typografi (§9). |
| `src/data/samplePuzzle.ts` | Det hårdkodade pusslet. Byts mot hämtning + dekryptering (§4). |
| `src/screens/` | Start-, spel- och resultatvyn (§1). |
| `App.tsx` | Binder ihop lagring, streak och vy-växling. |

Logiken är avsiktligt fri från React och React Native, så den testas med
Nodes inbyggda testkörare i stället för en RN-testrigg.

### Tidszon utan Intl

Hermes ICU-stöd skiljer sig mellan Android och iOS, så `date.ts` räknar ut
Sveriges UTC-offset själv ur EU:s sommartidsregel (sista söndagen i mars
01:00 UTC → sista söndagen i oktober 01:00 UTC). Dygnsbytet följer därmed
svensk midnatt även om enheten står i en annan tidszon.

## Vad som saknas

- Pusslet är hårdkodat och daterat till dagens datum, så samma 16 ord dyker
  upp varje dag tills hämtningen finns (§4).
- Inga typsnitt valda; `typography` i `tokens.ts` har platshållare (§9).
- Ingen animation när en grupp låses (§9).
- Nedräkningen på resultatvyn kan visa fel med en timme under det dygn
  klockan ställs om. Datumlogiken påverkas inte.
