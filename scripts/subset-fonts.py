"""문구(src/*, index.html)에 쓰인 글자만 남겨 폰트를 작게 만든다.
usage: python3 scripts/subset-fonts.py   (pip install fonttools brotli 필요)"""
import glob, os
from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
text = ''
for p in glob.glob(os.path.join(ROOT, 'src', '**', '*.js*'), recursive=True) + [os.path.join(ROOT, 'index.html')]:
    text += open(p, encoding='utf-8').read()
chars = set(c for c in text if ord(c) > 0x7F) | set(chr(i) for i in range(0x20, 0x7F)) | set('♡…·~↺#:./0123456789')
unicodes = sorted(ord(c) for c in chars)
print(len(unicodes), 'glyphs')
for src, out in [('PretendardVariable.woff2', 'pretendard-subset.woff2'), ('Jua-Regular.ttf', 'jua-subset.woff2'), ('Gaegu-Bold.ttf', 'gaegu-subset.woff2')]:
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['*']
    opts.name_IDs = ['*']
    f = subset.load_font(os.path.join(ROOT, 'fontsrc', src), opts)
    s = subset.Subsetter(opts)
    s.populate(unicodes=unicodes)
    s.subset(f)
    dst = os.path.join(ROOT, 'src', 'fonts', out)
    subset.save_font(f, dst, opts)
    print(out, os.path.getsize(dst) // 1024, 'KB')
