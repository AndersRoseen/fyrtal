# Plan – Fyrtal (svenskt Connections-spel)

En native, cross-platform app (iOS + Android) där man löser ett dagligt
grupperingspussel: 16 ord ska sorteras i 4 grupper om 4. Ren, redaktionell
design i NYT-anda men med egen identitet. Inget backend, inga löpande
kostnader – pusslen ligger som statiska filer och bundlas **inte** in i appen.

---

## 1. Kärn-UX – tre vyer

1. **Start / Dagens spel** – landningsvy. Visar dagens datum, aktuell streak, och
   en stor "Spela dagens"-knapp. Om dagens redan är spelat → knappen blir "Se
   dagens resultat".
2. **Spel** – 4×4-rutnät med de 16 orden. Markera upp till fyra, tryck "Gissa".
   Rätt grupp låser sig med sin färg och tema-etikett. Fel gissning = tappat
   försök (4 försök, som NYT). "En bort"-feedback när tre av fyra är rätt.
   Blanda-knapp och avmarkera-knapp.
3. **Resultat** – de fyra lösta grupperna i svårighetsordning, antal försök,
   din streak, och delnings-sträng (emoji-rutnät à la NYT). Nedräkning till
   nästa pussel.

Ett spel per dag. Spelat resultat sparas lokalt (se §6) så man alltid kan gå
tillbaka och se det.

---

## 2. Spel-logik – specifikation

Logiken är deterministisk och rakt fram att implementera – inga tekniska
oklarheter. Regler:

- **Urval:** markera upp till 4 brickor. "Gissa" aktiveras vid exakt 4.
- **Gissning:** stämmer de 4 exakt mot en grupp → lås gruppen (färg + tema),
  ta bort brickorna, resten flödar om. Annars → dra av ett försök.
- **Försök:** 4 totalt. Slut på försök → förlust, avslöja resterande grupper.
  Alla 4 lösta → vinst.
- **"En bort":** visa feedback när exakt 3 av de 4 markerade tillhör samma grupp.
- **Blanda:** shufflar bara olösta brickor. **Avmarkera:** rensar urvalet.
- **Delnings-sträng:** rutnät av färgrutor, en rad per gissning i den ordning de
  gjordes (som NYT). Kräver att vi sparar **gissnings-historiken**, inte bara
  slutresultatet – designa tillståndet för det från början.

Beslutat (följer NYT):

- Markeringen **behålls** efter en felgissning, så man kan byta ut ett enskilt ord.
- Exakt samma gissning igen **blockeras** och kostar inget försök.
- **Återuppta mitt i spelet:** pågående tillstånd sparas, så man kan stänga appen
  och fortsätta där man var (se §6).

---

## 3. Pusseldatamodell

Ett pussel = en JSON-fil, en per datum. `level` 1–4 = svårighet (1 lättast,
4 klurigast), motsvarar NYT:s gul → lila.

```json
{
  "id": "2026-08-12",
  "date": "2026-08-12",
  "author": "anders",
  "groups": [
    { "level": 1, "theme": "Frukter",        "words": ["Äpple", "Päron", "Banan", "Plommon"] },
    { "level": 2, "theme": "___stjärna",     "words": ["Sjö", "Film", "Nord", "Stjärn"] },
    { "level": 3, "theme": "Betyder 'snabb'","words": ["Kvick", "Rapp", "Rask", "Flink"] },
    { "level": 4, "theme": "Dolt tema",      "words": ["...", "...", "...", "..."] }
  ]
}
```

Ordningen på orden i filen ska **inte** vara spelordningen – appen shufflar vid
laddning (annars läcker grupperna).

Detta är den **författade klartexten** (i `puzzles-src/`). Det som publiceras är
den krypterade envelopen – se §4.

---

## 4. Pusselleverans – det viktigaste problemet

Krav: pusslen får inte bundlas in (då tar de slut), måste kunna fyllas på i
efterhand, och det ska inte kosta något löpande eller kräva ett backend.

**Lösning: statiska, krypterade filer på GitHub Pages.**

Filerna är datumnamngivna (`puzzles/2026-08-12.json`) och URL:en är alltså
gissningsbar – men **innehållet är krypterat**, så att kunna URL:en hjälper inte.

- Nyckeln härleds som `sha256(app-hemlighet + ":" + datum)`. Appen räknar ut
  dagens nyckel själv från enhetens datum + den inbakade hemligheten, hämtar
  filen och dekrypterar. Morgondagens fil kan ligga publicerad men går inte att
  läsa idag. Löser "nytt varje dag" utan schemaläggare och utan pekare.
- **Obfuskering, inte äkta säkerhet** (medvetet val – färre rörliga delar): en
  beslutsam angripare som plockar ut hemligheten ur app-binären och skruvar fram
  enhetsklockan kan läsa framtida pussel. För ett ordspel räcker det – det stänger
  all URL-gissning och casual-tjuvkik.
- **Repo-layout (håll privat):** författaren skriver läsbar klartext i
  `puzzles-src/2026-08-12.json`. Pipelinen validerar, krypterar och skriver till
  `dist/puzzles/2026-08-12.json`. **Endast `dist/` deployas till Pages** – Pages-
  sajten är publik men serverar bara krypterade filer; klartexten lämnar aldrig
  det privata repot.
- Krypteringen delas i en modul (`puzzleCrypto.ts`, AES-GCM via `@noble/ciphers`):
  `encryptPuzzle` i generator + pipeline, `decryptPuzzle` i appen. Ren TypeScript,
  identisk i Node och React Native, inga native-moduler. Bara appen dekrypterar,
  så app-sidan behöver ingen RNG-polyfill – bara `TextDecoder` (finns i Expo).
- Publicerat filformat (envelope): `{ v, id, date, nonce, ct }` med `date`/`id` i
  klartext för routing, resten krypterat.
- Valfri `manifest.json` (`firstDate`/`latestDate`) för snygga fel ("inget pussel
  idag ännu" / "du är i framtiden"). Appen cachar hämtat pussel lokalt → funkar
  offline och överlever att filen ändras.

Alternativ övervägt: token i filnamnet + dagligt cron-jobb som pekar ut dagens
pussel (mer robust mot en beslutsam angripare, men fler rörliga delar + ett
schemalagt jobb) – valde obfuskering för enkelheten. Bundla in (nej – tar slut),
Firebase/Supabase (overkill + konto), egen server (löpande kostnad). Pages vinner
på "gratis, inget backend, filägande" – i linje med Fikon.

Utkast finns redan: `puzzleCrypto.ts`, `build-puzzles.ts`, `publish-puzzles.yml`.

---

## 5. Test vs. produktion – automatgenererat vs. människoskapat

- **Testläge:** en dev-only generator (`scripts/generate-puzzle.ts`) spottar ut
  ett giltigt pussel så man kan bygga och klicka runt direkt. Markeras
  `"author": "generated"` (eller `"generated": true`).
- **Produktion:** pussel måste vara människoskapade. Publiceringspipelinen (§8)
  **avvisar** varje fil som är genererad eller saknar en riktig `author` innan
  den når produktions-Pages. Alltså kan ett testpussel aldrig råka gå live.
- Praktiskt: appen har en `PUZZLE_BASE_URL` per miljö. Dev-bygget kan peka på en
  dev-branch/mapp som tillåter genererade pussel; prod-bygget pekar på den
  validerade produktionskällan.

---

## 6. Lagring i appen

- Pågående tillstånd sparas lokalt (AsyncStorage / MMKV), nycklat på pusslets
  `id`: lösta grupper, kvarvarande försök, aktuell markering och gissnings-
  historik → man kan stänga appen mitt i och återuppta. Ingen inloggning, ingen
  molnsync (som Fikon).
- Det ger både "se ditt spelade spel" och att man inte kan spela om dagens.
- Gissnings-historiken (inte bara slutresultatet) behövs för att återskapa
  delnings-strängen – se §2.

---

## 7. Streak

Antal dagar i rad man löst dagens pussel – en enkel morot att komma tillbaka.

- Lagras lokalt som `{ current, longest, lastResultDate }`, samma lagring som §6,
  ingen molnsync.
- **Regel (följer NYT, vinst-streak):** en vinst dag N ökar `current` om man vann
  dag N−1, annars börjar den om på 1. En förlust eller en missad dag nollställer
  `current`. `longest` uppdateras löpande.
- Beräknas när dagens spel avslutas (vinst/förlust), utifrån `lastResultDate` vs.
  dagens datum (Europe/Stockholm).
- Visas på start- och resultatvyn (§1).

---

## 8. GitHub Actions – två pipelines

**A. Pusselpipeline (publicerar nya spel)** – `publish-puzzles.yml` + `build-puzzles.ts`
Trigger: push till `puzzles-src/**` (deploy) och pull request (bara validering).
1. Validera varje fil (`build-puzzles.ts`):
   - exakt 4 grupper, varje med exakt 4 ord → 16 unika ord (skiftlägesokänsligt)
   - `level` 1–4 förekommer exakt en gång var
   - `theme` ej tomt, `date` matchar filnamnet
   - **prod-grind:** `author` satt och ≠ `generated`
2. Kryptera giltiga pussel (`PUZZLE_SECRET` som repo-secret) → skriv till `dist/`.
3. På push till main: deploya `dist/` till Pages. På PR: bara steg 1–2, ingen
   deploy → trasiga eller genererade pussel kan aldrig mergas eller gå live.

**B. App-pipeline (trycker ut appen så du kan testa)**
Trigger: push av tagg `v*` eller manuell `workflow_dispatch`.
1. `eas build --platform android --profile preview` (installerbar APK).
2. Publicera install-länk/QR som artifact eller i job-summary → du laddar ner
   och testar på din Android direkt.
3. Valfritt: `eas update` för OTA-uppdatering av JS mellan builds, så små
   ändringar syns utan ny APK.

Kräver `EXPO_TOKEN` som repo-secret. iOS-build kan läggas till senare (kräver
Apple-konto); Android räcker för din egen testning till att börja med.

---

## 9. Designriktning

Redaktionellt och lugnt som NYT, men egen palett och typografi så det inte är en
klon:

- **Typografi:** en karaktärsfull grotesk för orden (tydlig på små brickor) +
  en serif för rubriker/tema → editorial känsla utan att härma NYT rakt av.
- **Färger:** fyra dova skandinaviska toner istället för NYT:s pasteller, t.ex.
  sand (level 1), salvia (2), dammig blå (3), plommon (4). Måste vara särskiljbara
  även för färgblinda → testa kontrast + lägg ev. en liten ikon/mönster per nivå.
- **Layout:** generöst med luft, mjukt rundade brickor, tydlig men diskret
  animation när en grupp låses. Delningsvyn ska kännas "screenshot-bar".
- Bygg design-tokens (färg, radie, typsnitt) centralt så temat är lätt att
  finslipa – se frontend-design-principerna.

---

## 10. Teknikval (förslag)

- **Expo / React Native**, cross-platform från start – samma stack som Fikon.
- Inget backend. Pussel via Pages (§4), lokal lagring (§6).
- EAS Build/Update för distribution (§8B).
- TypeScript, delad puzzle-schema-typ mellan app, generator och validering.

---

## 11. Faser

1. **Skelett:** Expo-app, tre vyer, hårdkodat pussel, spel-logik (markera/gissa/
   4 försök/lås grupp).
2. **Data:** JSON-schema + generator + lokal lagring (inkl. återuppta + streak) +
   shuffle. Byt hårdkodat mot hämtning från en URL.
3. **Leverans:** puzzle-repo + Pages + pusselpipeline (validering + kryptering) live.
4. **Distribution:** app-pipeline (EAS) → APK-länk i Actions.
5. **Design:** tokens, palett, typografi, delningsvy, animation.
6. **Innehåll:** börja författa riktiga pussel (prod-grind på).
