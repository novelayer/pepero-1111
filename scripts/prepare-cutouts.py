"""모몽가 다이컷 스티커: 배경 제거 + 흰 테두리 (원본 그림은 그대로, 새로 그리지 않음)
usage: python3 scripts/prepare-cutouts.py <originals_dir> <out_dir>
방식: 외곽선·색 영역 마스크 → 팽창으로 털 표현 사이 틈 닫기 → 구멍 채우기 → 되돌리기 → 흰 테두리"""
import sys, os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

SRC, OUT = sys.argv[1], sys.argv[2]
UP = 2  # 2배로 키운 뒤 처리 (큰 화면에서 선이 덜 거칠게)
JOBS = {  # key: (file, gap-closing px at original scale, border px at original scale)
    'chef-a04': ('IMG_0793.jpeg', 24, 9),
    'chef-a02': ('IMG_0795.jpeg', 18, 9),
}

def cutout(path, close, border):
    im = Image.open(path).convert('RGB')
    im = im.resize((im.width * UP, im.height * UP), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 60, 2))
    a = np.asarray(im).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    greenish = (g > r + 12) & (g > b + 4)
    ink = (lum < 110) & ~greenish
    color = (np.abs(r - g) + np.abs(g - b) > 40) & ~greenish & (lum > 110)
    closed = ndimage.binary_dilation(ink | color, iterations=close * UP)
    char = ndimage.binary_fill_holes(closed)
    char = ndimage.binary_erosion(char, iterations=(close - 3) * UP)
    sticker = ndimage.binary_closing(ndimage.binary_dilation(char, iterations=border * UP), iterations=6 * UP)
    rgb = a.copy()
    rgb[greenish] = [255, 255, 255]
    alpha = (ndimage.gaussian_filter(sticker.astype(float), 1.2) * 255).clip(0, 255)
    o = Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), 'RGBA')
    return o.crop(o.getbbox())

os.makedirs(OUT, exist_ok=True)
for key, (fn, close, border) in JOBS.items():
    o = cutout(os.path.join(SRC, fn), close, border)
    p = os.path.join(OUT, f'{key}.webp')
    o.save(p, 'WEBP', quality=88, method=6)
    print(key, o.size, os.path.getsize(p) // 1024, 'KB')
