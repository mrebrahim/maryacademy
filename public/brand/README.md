# Brand assets — drop the real files here

The site currently draws placeholders so nothing renders as an empty box.
Put the real files in this folder using the exact filenames below, then flip
the matching flag in `src/config/assets.ts`. Nothing else needs to change.

## Files

| Filename | What it is | Format | Size |
|---|---|---|---|
| `logo.png` | Full lockup — crest + "Marie Ragaie" + "BEAUTY ACADEMY" | **SVG preferred**, else PNG with a transparent background | ≥ 1200px wide |
| `logo-mark.png` | The MR crest on its own, square, for the header and favicon | SVG or PNG, transparent | ≥ 512×512 |
| `hero.jpg` | The hero photograph (the styled model) | JPG or WebP | ≥ 1600×1200, portrait or square crops best |
| `instructor.jpg` | Photo of Marie | JPG or WebP | ≥ 1000×1250 (4:5 portrait) |

**Transparent background matters.** The logo sits on navy in the header and
on cream elsewhere. A logo exported with its own navy background will show as
a visible rectangle on the cream sections.

## Course thumbnails

Put these in `public/courses/` and uncomment the matching lines in
`src/config/assets.ts`:

```
hair-styling.jpg   hair-color.jpg   hair-cutting.jpg
makeup.jpg         skin-care.jpg
```

All five must be **16:9**, at least 1280×720. They are cropped to that ratio
either way, so framing anything important dead-centre is safest.

## Testimonial screenshots

These do **not** go here — they belong in Supabase Storage, bucket
`testimonials`, named to match `testimonials.asset_path` in the database
(`img-0000.jpg` … `img-0012.jpg`).

Before uploading, crop out: phone status bars, story thumbnail strips,
message input bars, "Add to your story" overlays, and any visible phone
numbers. Faces of third parties — brides and the trainees' own clients — must
be cropped or blurred unless permission covers them too. The back-of-head
result photos are already safe as-is.
