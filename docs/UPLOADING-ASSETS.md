# رفع الصور — Uploading assets

The site is fully live without any of these. The testimonial *text* already
renders; the screenshots are extra proof shown in a lightbox, and the brand
images replace drawn placeholders. Nothing here blocks launch except the
logo.

---

## 1. Testimonial screenshots

### The easy way — one command

Put all the screenshots in one folder (any filenames, as long as each keeps
its number), then:

```bash
npm run upload:testimonials -- ~/Downloads/testimonials
```

It reads the database, works out which file each testimonial expects, uploads
them under the right names, and tells you what is missing or unmatched.
Re-run with `--force` to replace files already uploaded.

Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (Supabase → Project
Settings → API). Never commit that key.

### The manual way

Supabase → Storage → `testimonials` → Upload, using these exact filenames:

| File | Who | What the screenshot is |
|---|---|---|
| `img-0008.jpg` | تينا | صورة نتيجة — تسريحة عروسة |
| `img-0011.jpg` | فيرو | رسايل إنستجرام |
| `img-0002.jpg` | نانسي ألفونس | ستوري + شهادة |
| `img-0004.jpg` | هبة العشري | ستوري |
| `img-0006.jpg` | متدربة سابقة | ستوري |
| `img-0001.jpg` | فاتن أيمن | ستوري مع الشهادة |
| `img-0003.jpg` | متدربة — مجموعة الكورس 15 | ستوري مع الشهادة |
| `img-0007.jpg` | تهاني إميل | واتساب |
| `img-0000.jpg` | سوزي طوبار | صورة مع الشهادة |
| `img-0009.jpg` | مارينا سمير | صورة مع الشهادة والهدية |
| `img-0010.jpg` | Ayaat Khalil | ستوري (إنجليزي) |
| `img-0012.jpg` | فيرو | ستوري — السيزون الجاي |

### Crop before uploading

- phone status bars, story thumbnail strips, message input bars
- "Add to your story" overlays
- any visible phone number
- **faces of third parties** — brides and the trainees' own clients did not
  agree to this. Crop or blur them. The back-of-head result photos are
  already fine.

---

## 2. Logo, hero, instructor, course thumbnails

These are static files in the repo, not Storage. See
[`public/brand/README.md`](../public/brand/README.md) for filenames, formats
and sizes, then flip the matching flag in `src/config/assets.ts`.

The logo needs a **transparent background** — it sits on navy in the header
and on ivory further down the page, so a version exported with its own navy
background shows as a visible rectangle.
