# Deterministic Astrology -> Perfume System Report

## 1) What changed

The recommendation engine is now strict relational mapping.

Removed:
- fuzzy text scoring
- `includes("nakshatra")`
- heuristic product matching

Added:
- database-driven mapping tables
- deterministic Sun/Moon/Nakshatra/Venus recommendation flow

## 2) Astrology calculation audit

Verified in current code:
- Swiss flags: `SEFLG_SWIEPH | SEFLG_SIDEREAL | SEFLG_SPEED`
- Sidereal mode: `SE_SIDM_LAHIRI`
- Longitude normalization: `((x % 360) + 360) % 360`
- Sun sign index: `floor(sunLongitude / 30)`
- Moon sign index: `floor(moonLongitude / 30)`
- Nakshatra index: `floor(moonLongitude / (360 / 27))`

Files:
- `lib/astrology/calculateAstrology.ts`
- `lib/astrology/swiss.ts`
- `lib/astrology/rashi.ts`
- `lib/astrology/nakshatra.ts`

## 3) New deterministic relational architecture

New migration:
- `supabase/migrations/012_astrology_perfume_mapping.sql`

Schema created:
- `perfumes`
- `planets`
- `zodiac_signs`
- `nakshatras`
- `perfume_planet_mapping`
- `perfume_nakshatra_mapping`
- `perfume_zodiac_mapping`

Seeded stable lookup rows:
- Planets (Sun..Saturn)
- Zodiac signs (Aries..Pisces with degree ranges)
- Nakshatras (Ashwini..Revati with degree ranges and ruler planet)

## 4) New mapping data layer

New file:
- `lib/api/astrologyPerfumeMappings.ts`

Responsibilities:
- query `perfume_zodiac_mapping` for:
  - Sun sign zodiac id
  - Moon sign zodiac id
- query `perfume_planet_mapping` for:
  - Venus = 6
- query `perfume_nakshatra_mapping` for exact `nakshatra_id`
- map DB row to `ProductDisplay`
- return deterministic set:
  - `sunSign`
  - `moonSign`
  - `venus`
  - `nakshatra`

No product text parsing is used.

## 5) Recommendation engine behavior

Updated file:
- `lib/astrology/recommendations.ts`

Current logic:
1. compute chart (already existing)
2. fetch strict mapped perfumes from relational tables
3. return exactly this order:
   - Sun perfume
   - Moon perfume
   - Nakshatra perfume
   - Venus perfume

If a mapping row is missing, response includes available mapped products and sets a user message.

## 6) Error prevention guarantees

The engine now guarantees:
- Nakshatra perfume comes only from exact `nakshatra_id` mapping
- Sun sign perfume only from `perfume_zodiac_mapping` using calculated Sun sign id
- Moon sign perfume only from `perfume_zodiac_mapping` using calculated Moon sign id
- Venus perfume only from `planet_id = 6`
- no wrong Nakshatra perfume due to name matching

## 7) Validation tests

Updated tests:
- `tests/rashi-nakshatra.test.ts`
  - explicit Sun and Moon sign formula checks
  - Nakshatra boundary checks
- `tests/recommendation-priority.test.ts`
  - Dhanishta -> exact Dhanishta perfume in output
  - Rohini -> exact Rohini perfume
  - Magha -> exact Magha perfume
  - deterministic output order includes Sun, Moon, Nakshatra, Venus

## 8) Run status

Passed:
- `npm run test`
- `npm run type-check`

System status:
- deterministic
- relational
- no fuzzy matching in recommendations
