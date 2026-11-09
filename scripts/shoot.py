"""대표 화면 스크린샷. 빌드 후: npx vite preview --port 4173 & python3 scripts/shoot.py
usage: python3 scripts/shoot.py [base_url] [out_dir] [shots...]"""
import sys, asyncio
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:4173/'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'shots'
SHOTS = {
    '01_intro': '?tod=night',
    '02_melt': '?at=meltChocolate&t=3.0&pause=1&tod=night',
    '03_show': '?at=showGift&t=1.5&pause=1&tod=night',
    '04_doorhandle': '?at=delivered&tod=night',
}
only = sys.argv[3:]

async def main():
    import os; os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        for name, qs in SHOTS.items():
            if only and name not in only: continue
            pg = await b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=3)
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            await pg.goto(BASE + qs)
            await pg.wait_for_timeout(3500 if name == '04_doorhandle' else 2200)
            await pg.screenshot(path=f'{OUT}/{name}.png')
            print(name, 'errors:', errs)
            await pg.close()
        await b.close()
asyncio.run(main())
