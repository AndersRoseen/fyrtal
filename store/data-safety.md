# Data safety – svar till Play Console

Play kräver att formuläret fylls i även för appar som inte samlar in något.
Svaren nedan följer av hur appen faktiskt fungerar; ändras det, ändra här.

## Datainsamling

| Fråga | Svar | Varför |
| --- | --- | --- |
| Samlar eller delar appen någon av de datatyper som krävs? | **Nej** | Inget lämnar enheten. |
| Krypteras data under överföring? | **Ja** | Pusslen hämtas över HTTPS. |
| Kan användare begära radering av data? | **Ja** | Avinstallation raderar allt; det finns inget serverkonto. |

Eftersom första frågan är "nej" faller resten av formuläret bort.

## Motivering, om Play frågar

Appen sparar spelstatus, svit och en cache av hämtade pussel i enhetens egen
lagring. Play räknar **inte** det som insamling: datan lämnar aldrig enheten
och är inte åtkomlig för utvecklaren.

Det enda nätanropet hämtar en statisk pusselfil. Ingen identifierare, ingen
cookie, ingen inloggning skickas. Serverloggar hos värden (GitHub Pages) kan
innehålla IP-adresser på samma sätt som varje webbförfrågan; det är
värdens infrastruktur, inte insamling som appen gör.

## Innehållsklassificering (IARC)

Frågeformuläret besvaras i konsolen. För det här spelet:

- Våld, sex, svordomar, droger, skräck: **nej** rakt igenom
- Användarinteraktion / delat innehåll: **nej** – ingen chatt, inga profiler
- Delar appen användarens position: **nej**
- Digitala köp: **nej**
- Annonser: **nej**

Väntat utfall: PEGI 3 / ESRB Everyone.

## Annonser

Ingen annonsering. Kryssa i "Nej, min app innehåller inga annonser" – det
styr en egen märkning på butikssidan.
