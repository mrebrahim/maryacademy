"""
Downloads the web fonts into src/fonts.

    python3 scripts/fetch-fonts.py src/fonts

Run it when a weight is added or a family changes — not on every build.
The files are committed precisely so that a deploy never has to reach
Google: see the note at the top of src/lib/fonts.ts for the build failure
that prompted this.

Only the subsets the site uses are taken (arabic for the two Arabic
faces, latin for Cinzel), which is what next/font/google was fetching
before.
"""
import re, subprocess, sys, pathlib
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
OUT = pathlib.Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)

# family, weights, wanted subset, output basename
JOBS = [
    ("Amiri",   ["400", "700"],               "arabic", "amiri"),
    ("Tajawal", ["300", "400", "500", "700"], "arabic", "tajawal"),
    ("Cinzel",  ["400", "600"],               "latin",  "cinzel"),
]

def fetch(url, binary=False):
    r = subprocess.run(["curl", "-sS", "-A", UA, url], capture_output=True, timeout=60)
    if r.returncode != 0:
        raise SystemExit(f"curl failed for {url}: {r.stderr.decode()[:200]}")
    return r.stdout if binary else r.stdout.decode()

for family, weights, subset, base in JOBS:
    css = fetch(f"https://fonts.googleapis.com/css2?family={family}:wght@{';'.join(weights)}&display=swap")
    # Each @font-face is preceded by a /* subset */ comment.
    blocks = re.findall(r"/\*\s*([a-z0-9-]+)\s*\*/\s*@font-face\s*\{(.*?)\}", css, re.S)
    for name, body in blocks:
        if name != subset:
            continue
        weight = re.search(r"font-weight:\s*(\d+)", body).group(1)
        url = re.search(r"url\((https://[^)]+\.woff2)\)", body).group(1)
        path = OUT / f"{base}-{weight}.woff2"
        path.write_bytes(fetch(url, binary=True))
        print(f"{path.name}  {path.stat().st_size // 1024} KB")
