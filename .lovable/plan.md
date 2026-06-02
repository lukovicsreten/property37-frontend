# Property37 Frontend — Plan

Kompletan frontend za Spring Boot backend na `http://localhost:8080` (configurable preko `VITE_API_BASE_URL`). Sve na srpskom (latinica), tema "Plavi trust" (navy `#0f1b3d` + accent `#3b6fa0`).

## Stack i osnove

- TanStack Start + TanStack Router (file-based) + TanStack Query
- Tailwind v4 + shadcn/ui komponente
- Zod za validaciju formi, react-hook-form
- JWT u `localStorage`, axios klijent sa interceptor-om koji dodaje `Authorization: Bearer <token>` i na 401 šalje na `/login`
- Auth state u router context-u; `_authenticated` layout sa `beforeLoad` redirect-om

## Design tokens (src/styles.css)

Override-uje postojeće tokene u `oklch`:
- `--background`: skoro bela sa hladnim tonom (`#fafbfc`)
- `--foreground` / `--primary`: navy `#0f1b3d`
- `--accent` / link-blue: `#3b6fa0`
- `--secondary` / `--muted`: `#e8edf3`
- Tipografija: Inter (sans), tighter heading tracking
- Suptilne senke, radius 0.5rem — profesionalan, real-estate feel

## Strukturа ruta

```
src/routes/
  __root.tsx               — shell, header (logo + nav + auth dugme), footer, QueryClientProvider, Toaster
  index.tsx                — homepage: hero + brzi filteri + featured listing
  properties.tsx           — pretraga sa filterima + paginacija + sort (Page<PropertyResponse>)
  properties.$id.tsx       — detalji + galerija + komentari + "Pošalji poruku vlasniku"
  login.tsx                — login (POST /api/auth/login)
  register.tsx             — registracija (POST /api/auth/register)
  _authenticated.tsx       — guard (redirect na /login)
  _authenticated/
    properties/new.tsx     — izbor tipa (stan/apartman/kuca/vila/zemljiste) + forma
    properties/$id/edit.tsx — edit (refused ako nije vlasnik)
    my-listings.tsx        — moje nekretnine (lista + edit/delete)
    messages.tsx           — inbox layout sa tabovima (Primljene / Poslate)
    messages.$userId.tsx   — konverzacija sa odgovorom
```

## API sloj (src/lib/api/)

- `client.ts` — axios instance, base URL iz env, auth interceptor
- `auth.ts` — `register`, `login`, `logout`, `getCurrentUser` (iz JWT payload-a)
- `properties.ts` — `searchProperties(filters)`, `getProperty(id)`, `createStan/Apartman/Kuca/Vila/Zemljiste`, `update*`, `deleteProperty`
- `comments.ts` — `getByProperty`, `create`, `update`, `delete`, `reply`
- `messages.ts` — `sendToOwner`, `getReceived`, `getSent`, `getConversation`, `reply`, `markAsRead`, `unreadCount`
- `locations.ts` — `getAllLocations` (za dropdown filter)
- `types.ts` — TypeScript tipovi za sve DTO-ove (`PropertyResponse`, `CommentResponse`, `MessageResponse`, `LocationDistrict` enum, `PropertyStatus` enum, request DTOs)

## Ključni ekrani

**Homepage** — hero ("Pronađite svoj dom u Beogradu"), polje za brzu pretragu (lokacija + cena), grid od 6 najnovijih nekretnina (CTA na `/properties`).

**Pretraga (`/properties`)**:
- Sidebar filteri: cena min/max, površina min/max, lokacija (dropdown iz `/api/locations`), broj soba, status (NA_PRODAJU/IZNAJMLJIVANJE), datum opseg
- Sort: cena/površina/datum, asc/desc
- Grid kartica + paginacija
- URL search params drže stanje (shareable)

**Detalji (`/properties/:id`)**:
- Glavne info, galerija, opis, badge tipa, status
- Sekcija "Komentari": lista sa replies (nested), forma za novi komentar (auth), edit/delete za sopstvene, "Odgovori"
- Dugme "Pošalji poruku vlasniku" → modal sa formom (auth)

**Kreiranje nekretnine (`/properties/new`)**:
- Step 1: izbor tipa (5 kartica)
- Step 2: dinamička forma sa zajedničkim poljima + specifičnim po tipu (StanRequest ima spratnost, KucaRequest ima placDim, itd.)
- Submituje na odgovarajući endpoint

**Moje nekretnine** — lista sa edit i delete dugmićima.

**Poruke** — split view: leva lista konverzacija (grupisano po userId iz `/my-messages`), desno trenutna konverzacija sa formom za odgovor; badge sa `unreadCount` u header-u; `markAsRead` na otvaranje.

## Validacija

Sve forme koriste zod scheme (min/max dužine, regex za telefon/email, broj > 0 itd.), prikazuju greške inline, disable submit dok je nevalidna ili pending.

## Tehnicke napomene

- DTO interface-i pretpostavljaju ono što controller-i sugerišu — ako ti specifični DTO field-ovi imaju drugačija imena, lako se podese u `src/lib/api/types.ts` posle prvog testa
- Backend mora dozvoliti CORS sa frontend origin-om (`http://localhost:5173` u dev-u)
- `LocationDistrict` i `PropertyStatus` enum-ovi: dok ne vidim tačne vrednosti iz backend-a, koristim placeholder enume i `/api/locations` za stvarne opcije; ako mi proslediš enum vrednosti biće 1:1

## Šta NIJE u obimu

- Upload slika za nekretnine (controller-i ne pokazuju multipart endpoint) — koristiće se URL field ako postoji u DTO-u, inače placeholder slike
- Admin panel
- Lozinka reset (controller-i nemaju endpoint)

Posle approve-a, build se radi rutu-po-rutu i završava se kompletnim, funkcionalnim frontend-om spremnim za konektovanje na tvoj Spring Boot backend.