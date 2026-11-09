"""3개 엔진(Chromium·WebKit·Firefox) × 여러 화면에서 오프닝과 엔딩을 찍고 오류를 모은다.

사용: python3 scripts/check-browsers.py http://localhost:4173/ shots
WebKit은 iPhone·iPad Safari와 같은 엔진이라 아이폰 확인 대용으로 쓴다(카톡 인앱 브라우저도 WebKit 기반).
"""
import sys, asyncio
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:4173/'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'shots'
SIZES = [
    ('iphone-se', 375, 667, 2, True), ('iphone-15', 390, 844, 3, True), ('iphone-max', 430, 932, 3, True),
    ('phone-landscape', 844, 390, 3, True), ('ipad', 820, 1180, 2, True), ('ipad-landscape', 1180, 820, 2, True),
    ('pc', 1440, 900, 1, False),
]
SCENES = [('1sign', 'sig=demo'), ('2original', 'at=dipBiscuit&t=3.6&pause=1'), ('3almond', 'at=almond&t=3.3&pause=1'),
          ('4tray', 'at=tray&t=2.6&pause=1'), ('5bag', 'at=wrapGift&t=3.4&pause=1'), ('6door', 'at=deliverGift&t=4.2&pause=1'),
          ('7envelope', 'at=ending'), ('8letter', 'at=letteropen'), ('9receipt', 'at=receipt&sig=demo'), ('10end', 'at=complete')]


async def main():
    import os
    os.makedirs(OUT, exist_ok=True)
    bad = []
    async with async_playwright() as p:
        for eng in ('chromium', 'webkit', 'firefox'):
            b = await getattr(p, eng).launch()
            for name, w, h, dpr, touch in SIZES:
                opts = dict(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
                if eng != 'firefox':
                    opts.update(has_touch=touch, is_mobile=touch and eng == 'chromium')
                ctx = await b.new_context(**opts)
                for scene, q in SCENES:
                    pg = await ctx.new_page()
                    errs = []
                    pg.on('pageerror', lambda e: errs.append(str(e)))
                    await pg.goto(BASE + ('?' + q if q else ''))
                    await pg.wait_for_timeout(5000)
                    fb = await pg.evaluate("getComputedStyle(document.getElementById('fallback')).display")
                    if fb != 'none':
                        errs.append('fallback shown')
                    await pg.screenshot(path=f'{OUT}/{eng}_{name}_{scene}.png')
                    print(eng, name, scene, errs or 'ok', flush=True)
                    if errs:
                        bad.append((eng, name, scene, errs))
                    await pg.close()
                await ctx.close()
            await b.close()
    if bad:
        print('\nFAILED:', *bad, sep='\n')
        sys.exit(1)


asyncio.run(main())
