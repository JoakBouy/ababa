# Adding a real story

Each story is one record in `src/data/content/stories.json`. A story belongs to one **place** and one or more **programmes**, so it appears on the map, in that place's "People from…" list, and links back to the work that supported it.

## Before you start

1. **Consent.** Record the person's informed consent before anything is published: to their name, photo, video and story being shown publicly. Note the date and what they agreed to.
2. **Safety.** For people affected by conflict, displacement or violence, consider whether a full name, face or exact village could put them at risk. A first name, a role, or a photo that doesn't show the face are all fine choices.
3. **Evidence.** Every outcome in "What changed" needs a source: facility records, survey data, the person's own testimony, or an external report.

## 1. Add media

Put the portrait in `public/media/people/`, named after the story id, e.g. `public/media/people/leer-nyabol.jpg`. A 4:5 portrait of at least 1000px tall works best.

For video, either upload to YouTube or Vimeo and use the id, or add an `.mp4` to `public/media/people/`.

## 2. Add the record

Copy this into `stories.json` and fill it in:

```json
{
  "id": "leer-nyabol",
  "status": "draft",
  "name": "Nyabol",
  "role": "Midwife, Leer Community Midwifery Training School graduate",
  "locationId": "leer",
  "programmeIds": ["leer-midwifery"],
  "sectors": ["health"],
  "headline": "One sentence that says what changed, in plain words.",
  "portrait": { "src": "media/people/leer-nyabol.jpg", "alt": "Nyabol outside the health centre in Leer", "credit": "Photo: PRDA" },
  "video": { "kind": "youtube", "id": "VIDEO_ID", "caption": "Nyabol on her first year as a midwife" },
  "quote": "Their own words, one or two sentences.",
  "chapters": {
    "before": "Their life before PRDA's support.",
    "supported": "What PRDA provided, and when.",
    "changed": "What is different now."
  },
  "support": [
    { "label": "Midwifery training", "detail": "Two-year course, graduated 2019" }
  ],
  "impact": [
    {
      "label": "Births attended since qualifying",
      "value": 120,
      "unit": "births",
      "evidence": { "type": "record", "note": "Leer health centre register, 2019–2024", "sourceId": null }
    }
  ],
  "consent": { "obtained": true, "date": "2026-10-01", "scope": "Name, photo, video and story, public" },
  "recordedBy": "PRDA communications team",
  "recordedOn": "2026-10-01",
  "relatedStoryIds": []
}
```

- `status`: `draft` while being reviewed, `published` once approved. Published stories must have consent recorded.
- `locationId` must be an id from `locations.json`; `programmeIds` must be ids from `programmes.json`.
- `sectors`: `health`, `education`, `food`, `water`, `relief`, `protection`.
- `impact.value`: leave `null` until you have the evidence. Never estimate.
- `evidence.type`: `record`, `survey`, `testimony`, `observation` or `external`. If the evidence is a published report, add it to `sources.json` and put its id in `sourceId`.

## Test personas

While real stories are being collected, the map runs on **fictional test personas** (`src/data/content/test-personas.json`), each with an illustrated portrait in `public/media/test-personas/`. They are labelled "Test" everywhere. The portraits are drawn with the open-source Personas set by Draftbit (CC BY 4.0) and can be regenerated with `scripts/generate-test-portraits.cjs`.

`CONTENT_MODE` in `src/data/index.ts` chooses what appears:

- `'test'`: the fictional test personas (current setting)
- `'demo'`: empty story templates showing where content goes
- `'live'`: only PRDA's real stories. Use this before launch.

## 3. Check and publish

```bash
npm run validate
```

This catches broken links between records and published stories without consent. When the real stories are in, delete the demo records (`"status": "demo"`) or set `SHOW_DEMO_STORIES = false` in `src/data/index.ts`.

## Adding a place

Add a record to `locations.json`. `county` must match a county name in `src/data/geo/counties.json` (South Sudan's 78 counties, from geoBoundaries). Use the town's coordinates if you know them (`"coordsPrecision": "town"`); otherwise the county centre (`"county"`). `labelSide` controls where the name sits next to the marker. Then list the place's id in the relevant programme's `locationIds`.
