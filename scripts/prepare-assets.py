"""originals/ -> public/momonga/*.webp  (crop, resize to <= display width x3, never upscale)
usage: python3 scripts/prepare-assets.py <originals_dir> <out_dir>"""
import sys, os
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
# id: (file, crop box or None, max display width in CSS px)
JOBS = {
    "a01":   ("IMG_0796.jpeg", None,                    130),
    "a02":   ("IMG_0795.jpeg", None,                    170),
    "a03":   ("IMG_0794.jpeg", (98, 228, 418, 570),     160),
    "a04":   ("IMG_0793.jpeg", None,                    200),
    "a05":   ("IMG_0410.jpeg", None,                    260),
    "a06":   ("IMG_0411.jpeg", None,                    110),
    "a07-a": ("IMG_0797.jpeg", (170, 45, 615, 402),     150),
    "a07-b": ("IMG_0797.jpeg", (632, 38, 1040, 388),    150),
    "a07-c": ("IMG_0797.jpeg", (150, 408, 618, 722),    150),
    "a07-d": ("IMG_0797.jpeg", (620, 392, 1040, 722),   150),
    "a08":   ("IMG_0798.jpeg", (172, 10, 1200, 1010),   200),
}
os.makedirs(OUT, exist_ok=True)
for key, (fn, box, disp) in JOBS.items():
    im = Image.open(os.path.join(SRC, fn)).convert("RGB")
    if box: im = im.crop(box)
    w = min(im.width, disp * 3)
    if w < im.width:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    p = os.path.join(OUT, f"{key}.webp")
    im.save(p, "WEBP", quality=90, method=6)
    print(f"{key}: {im.size} {os.path.getsize(p)//1024}KB")
