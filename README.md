# Fyrtal

Ett dagligt svenskt grupperingspussel: 16 ord ska sorteras i 4 grupper om 4.
Expo / React Native, iOS + Android.

Hela upplägget – UX, pusselleverans, pipelines, design – ligger i [plan.md](plan.md).

## Läge

Appen är klar: tre vyer, hela spel-logiken, lokal lagring med
återupptagning och streak, hämtning av dagens pussel med cache och felvyer,
och designpasset med palett, typografi och animationer.

Kvar står det som ligger utanför appen: krypteringen (§4) och
pusselpipelinen (§8A). Skarven för krypteringen finns redan, se nedan.

## Kom igång

```sh
npm install
cp .env.example .env   # valfritt – utan den körs det inbyggda exempelpusslet
npm start              # Expo dev server – skanna QR-koden med Expo Go
npm test               # 81 tester för logiken
npm run typecheck
```

## Konfiguration

| Variabel | Vad |
| --- | --- |
| `EXPO_PUBLIC_PUZZLE_BASE_URL` | Bas-url till de publicerade pusslen. Tom = inbyggt exempelpussel. |
| `EXPO_PUBLIC_ALLOW_PLAINTEXT` | `1` låter dev-källan servera okrypterade pussel (§5). |
| `EXPO_PUBLIC_ALLOW_GENERATED` | `1` tillåter `author: "generated"` (§5). |

De två sista är prod-grinden från §5: utan dem avvisar appen både
okrypterade och genererade pussel, så ett testpussel kan inte råka spelas
i ett prod-bygge.

## Koppla in krypteringen

`src/puzzle/crypto.ts` är skarven mot §4. När `puzzleCrypto.ts` finns:

```ts
import { setPuzzleDecryptor } from './src/puzzle/crypto';
import { decryptPuzzle } from './puzzleCrypto';

setPuzzleDecryptor(decryptPuzzle);   // en gång vid appstart
```

Dekrypteraren får envelopen och datumet, och returnerar pusslet – som
objekt eller som JSON-text, båda fungerar. Nyckelhärledningen
(`sha256(hemlighet + ":" + datum)`) stannar i den modulen; ingen annan fil
behöver känna till hemligheten. Utan inkopplad dekrypterare ger en
krypterad fil ett tydligt fel i stället för en krasch.

## Struktur

| Sökväg | Vad |
| --- | --- |
| `src/types/puzzle.ts` | Pusselschemat. Delas med generator och validering (§3, §10). |
| `src/game/engine.ts` | Spel-logiken. Ren och serialiserbar, inga React-beroenden (§2). |
| `src/game/streak.ts` | Streak-regeln. Ren logik, ingen lagring (§7). |
| `src/game/share.ts` | Delnings-strängen, byggd ur gissnings-historiken (§2). |
| `src/game/shuffle.ts` | Fisher–Yates med injicerbar RNG. |
| `src/storage/storage.ts` | AsyncStorage: pågående spel, cachat pussel, streak (§6). |
| `src/puzzle/source.ts` | Hämtning: cache först, sedan nät. Dekryptering, validering, felskäl (§4). |
| `src/puzzle/crypto.ts` | Skarven där `decryptPuzzle` kopplas in (§4). |
| `src/puzzle/validate.ts` | Pusselvalidering. Delas med pipelinen (§8). |
| `src/config/env.ts` | Miljöflaggor per bygge (§5). |
| `src/lib/date.ts` | Europe/Stockholm utan Intl – dygnsbyte, nedräkning, datumdiff (§7). |
| `src/theme/tokens.ts` | Design-tokens: palett, nivåfärger, radier, typografi, motion (§9). |
| `src/theme/useAppFonts.ts` | Laddar snitten och håller kvar splash tills de är på plats. |
| `scripts/generate-puzzle.ts` | Dev-generator för testpussel (§5). |
| `src/data/samplePuzzle.ts` | Exempelpusslet som används när ingen källa är satt. |
| `src/screens/` | Start-, spel- och resultatvyn (§1). |
| `App.tsx` | Binder ihop lagring, streak och vy-växling. |

Logiken är avsiktligt fri från React och React Native, så den testas med
Nodes inbyggda testkörare i stället för en RN-testrigg.

### Tidszon utan Intl

Hermes ICU-stöd skiljer sig mellan Android och iOS, så `date.ts` räknar ut
Sveriges UTC-offset själv ur EU:s sommartidsregel (sista söndagen i mars
01:00 UTC → sista söndagen i oktober 01:00 UTC). Dygnsbytet följer därmed
svensk midnatt även om enheten står i en annan tidszon.

## Design

Fyra dova toner i stället för NYT:s pasteller – sand, salvia, dimblå,
plommon – med trappad ljushet så ordningen syns även utan färgseende, och
en form per nivå (`levelMarks`) som skiljer grupperna åt utöver färgen.

Typografin är en grotesk mot en serif: Space Grotesk på brickorna, där
orden ska vara läsbara små, och Fraunces på rubriker och teman, som ger
den redaktionella tonen. Importera alltid snitten från vikt-undersökvägen
(`@expo-google-fonts/space-grotesk/700Bold`) – paketets rot drar in
samtliga vikter och sväller bygget med ~1,5 MB.

Animationerna är korta med flit: brickan kvitterar markering, en löst grupp
växer fram, brädet skakar vid felgissning, och försöksprickarna pulsar när
en går förlorad. Längderna ligger i `motion` i `tokens.ts`.

## Bygga en APK att testa på

App-pipelinen (§8B) ligger i `.github/workflows/build-app.yml`. Den kör
tester och typkontroll, och bygger sedan en installerbar APK via EAS.
Install-länken hamnar i körningens job-summary.

Startas från Actions → **Bygg app** → *Run workflow*, eller genom att tagga
en `v*`-release. Kräver `EXPO_TOKEN` under Settings → Secrets → Actions;
saknas den avbryts bygget med ett tydligt meddelande i stället för ett
kryptiskt EAS-fel.

`preview`-profilen bygger en APK med dev-flaggorna påslagna, så den kan
spela okrypterade och genererade pussel. `production` bygger en AAB med
prod-grinden på.

## Testpussel

```sh
npm run generate-puzzle -- --date 2026-08-12            # till stdout
npm run generate-puzzle -- --date 2026-08-12 --out puzzles-src
```

Genererade pussel märks `author: "generated"`. Både appens prod-bygge och
valideringen avvisar den märkningen, så ett testpussel kan inte gå live (§5).

## Vad som saknas

- Själva krypteringen. `setPuzzleDecryptor` är inkopplingspunkten (§4).
- Pusselpipelinen (§8A). Valideringen den behöver ligger redan i
  `src/puzzle/validate.ts` och är fri från app-beroenden.
- Utan konfigurerad källa visas samma exempelpussel varje dag.
- Nedräkningen på resultatvyn kan visa fel med en timme under det dygn
  klockan ställs om. Datumlogiken påverkas inte.
- Ingen har kört appen på en riktig enhet än – bygget och testerna går
  igenom, men layouten är overifierad.
