# Publicering – vad som krävs

Checklista för Google Play. iOS ligger sist; det kräver ett Apple-konto och
är inte förberett än.

Allt under "Förberett i repot" är gjort. Allt under "Bara du kan göra det"
kräver ett konto, en hemlighet eller en riktig telefon – och kan alltså inte
göras härifrån.

---

## Förberett i repot

| Sak | Var |
| --- | --- |
| Butikstext på svenska | `store/listing-sv.md` |
| Integritetspolicy | `store/privacy-policy.md` |
| Svar till Data safety-formuläret | `store/data-safety.md` |
| Svar till innehållsklassificeringen | `store/data-safety.md` |
| Play-ikon 512×512 | `store/graphics/play-icon-512.png` |
| Feature graphic 1024×500 | `store/graphics/feature-graphic-1024x500.png` |
| Paket-id (`se.fyrtal.app`) | `app.json` |
| `versionCode` som räknas upp automatiskt | `build-app.yml`, sätts till körningsnumret |
| Signerad AAB-build | `build-app.yml`, jobbet *AAB för Play* |
| Onödiga behörigheter borttagna | `app.json` → `blockedPermissions` |

### Behörigheter i den publicerade appen

Bara två, och båda är motiverade:

- `INTERNET` – hämtar dagens pussel.
- `VIBRATE` – den haptiska knuffen vid en gissning.

Expo-mallen lade in `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE` och
`WRITE_EXTERNAL_STORAGE` i release-manifestet. De behövs inte, ser illa ut på
en butikssida, och blockeras nu i `app.json`.

---

## Bara du kan göra det

### 1. Play Console-konto

Engångsavgift på 25 USD. Skapas på <https://play.google.com/console>.

**Räkna med en fördröjning här.** För personliga utvecklarkonton kräver
Google att appen körts i stängd testning med minst **12 testare i minst 14
dagar** innan produktion kan öppnas. Det är alltså inte en eftermiddags
jobb – börja med testningen tidigt om du har ett måldatum. Reglerna ändras
med jämna mellanrum; läs det som står i konsolen när du väl är där.

### 2. Uppladdningsnyckel

Skapa en gång, och **förlora den aldrig** – utan den kan appen inte
uppdateras. Kör lokalt:

```sh
keytool -genkeypair -v \
  -keystore upload.keystore \
  -alias fyrtal-upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

Lägg sedan in fyra secrets under Settings → Secrets → Actions:

| Secret | Värde |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 upload.keystore` |
| `ANDROID_KEYSTORE_PASSWORD` | lösenordet du valde |
| `ANDROID_KEY_ALIAS` | `fyrtal-upload` |
| `ANDROID_KEY_PASSWORD` | nyckelns lösenord |

Spara `upload.keystore` någon annanstans också, utanför repot. Checka aldrig
in den.

Sedan: Actions → **Bygg app** → kryssa i *Bygg en signerad AAB för Play*.
Bygget vägrar om nyckeln saknas, och kontrollerar efteråt att AAB:n inte
råkat bli debug-signerad.

### 3. Integritetspolicy på en publik URL

Play kräver en fungerande länk, även för appar som inte samlar in något.
Texten finns i `store/privacy-policy.md`. Enklast: låt GitHub rendera den och
använd filens URL i repot. Vill du ha en snyggare adress går det att slå på
GitHub Pages – men samordna det med pusselpipelinen (§4), som också vill
använda Pages.

### 4. Skärmbilder

Minst två, tagna på en riktig telefon. Förslag på urval finns i
`store/listing-sv.md`. Det här är den enda butiksresursen som inte går att
generera – appen måste köras.

### 5. Formulären i konsolen

Data safety, innehållsklassificering, målgrupp, annonser. Svaren är
förberedda i `store/data-safety.md`; de ska bara skrivas av.

---

## Att kontrollera innan första riktiga uppladdningen

- **Target API-nivå.** Play kräver att nya appar riktar sig mot en någorlunda
  färsk API-nivå, och kravet skärps varje år. Vilken nivå Expo 57 faktiskt
  sätter går inte att läsa ur källan – den bestäms av Expos gradle-plugin.
  Därför skriver APK-bygget ut den i körningens summary. Jämför den siffran
  med kravet i Play Console; ligger den för lågt behöver `expo-build-properties`
  läggas till för att tvinga upp den.
- **`versionName`.** Följer `version` i `app.json`, just nu `0.1.0`. Höj den
  till något du vill visa för användare innan produktion.
- **Paket-id är permanent.** `se.fyrtal.app` går inte att ändra efter
  publicering. Byt nu om du vill byta.
- **Pusselkällan.** Ett prod-bygge utan `EXPO_PUBLIC_PUZZLE_BASE_URL` visar
  samma inbyggda exempelpussel varje dag. Sätt den innan release, annars
  publicerar du ett spel med ett enda pussel.

---

## iOS

Inte förberett. Kräver Apple Developer Program (99 USD/år) och en Mac eller
EAS för att bygga. Appen är byggd cross-platform från start, så det som
saknas är konto, certifikat och App Store-metadata – inte kod.
