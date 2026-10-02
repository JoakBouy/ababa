# PRDA Impact Map

An interactive map of the Presbyterian Relief and Development Agency's work across South Sudan.

The journey is **South Sudan → Place → Person → Story → Impact**. Choose a place on the map to see what PRDA does there and the people connected to it. Open a person to read their story: their portrait and video, what life was like before, what PRDA supported, and what changed, with the evidence behind each claim.

This project grew out of the Ababa Group Starlink fleet command centre. It keeps that app's night-map command view, the camera that flies to a selected location, the floating context card and map controls, and the drill-down from map to detail. The fleet telemetry, login and Starlink backend have been removed.

## What is real and what is a placeholder

| Content | Status |
|---|---|
| Places (16 counties) | From PRDA's published materials and partner reports, each with sources |
| Programmes (12) | Same; dates, partners and facts only where a source states them |
| People and stories (7) | **Demo profiles.** Not real people. Marked "Demo" everywhere they appear |
| Boundaries and rivers | geoBoundaries (CC BY 4.0) and Natural Earth |

Points PRDA should confirm are flagged on the map with a "To confirm with PRDA" note (for example, how the Leer midwifery school relates to PHSI in Juba).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run validate   # check the content files
npm run build      # validates, then builds to dist/
```

The build is a static site with relative paths and hash-based links (`#/place/leer/leer-midwife`), so it can be hosted anywhere, including Vercel, without rewrite rules.

## Where things live

```
src/data/content/
  locations.json    places on the map (one per county)
  programmes.json   PRDA programmes, linked to places
  stories.json      people and their stories
  sources.json      every source cited, referenced by id
src/data/geo/       county, state, border and river shapes
src/data/types.ts   the data model, documented
src/map/            the map
src/ui/             the national, place and story panels
public/media/people/  portraits and video files
scripts/validate-data.mjs   content checks (runs before every build)
```

To add PRDA's real stories, follow [docs/ADDING-STORIES.md](docs/ADDING-STORIES.md).
