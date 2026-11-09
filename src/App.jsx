import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { content, IMAGES } from './content.js';
import Stage, { imgSrc, MotifHeart } from './Stage.jsx';
import { createState, makeApplier, setInitial, buildMaster, LABELS, GIFT, CHEF_POS, BADGE_AT, stickToInner } from './timeline.js';
import { GiftBag, SharedDefs, SPARKLE, bagPhoto } from './props.jsx';
import { Garland, BerryBranch, Scarf, BgDefs } from './bg.jsx';
import { SignCard, ToppingPrompt, EndingFlow, LetterModal, ReceiptCard, CompletePanel, SoundToggle } from './parts.jsx';
import { sfx } from './sfx.js';

const params = new URLSearchParams(location.search);
const DEBUG = params.get('debug') === '1';
const tod = ['day', 'sunset', 'night'].includes(params.get('tod')) ? params.get('tod') : 'night'; // 22시 배송 → 밤 고정

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* 저장 불가해도 진행 */ } },
};
const VISITS_KEY = 'pepero1111.visits';
const visits = () => parseInt(store.get(VISITS_KEY) || '0', 10) || 0;
const bumpVisits = () => store.set(VISITS_KEY, String(visits() + 1));
const Chars = ({ text }) => [...text].map((ch, i) => <span key={i} className="ch">{ch}</span>);
const DEMO_SIG = [[[0.08, 0.62], [0.14, 0.3], [0.2, 0.7], [0.27, 0.32], [0.33, 0.66]], [[0.4, 0.5], [0.5, 0.36], [0.56, 0.6], [0.63, 0.4], [0.7, 0.62], [0.8, 0.44], [0.9, 0.56]]];

// ?og=1 : 링크 미리보기 이미지용
export function OgCard() {
  return (
    <svg viewBox="0 0 1200 630" width="1200" height="630" style={{ display: 'block' }}>
      <SharedDefs /><BgDefs />
      <rect width="1200" height="630" fill="url(#gingham)" />
      <ellipse cx="600" cy="588" rx="230" ry="20" fill="rgba(87,59,50,.13)" />
      <image href={imgSrc('chef-a04')} x="96" y="356" width="232" height="230" />
      <g transform="translate(600 62) scale(2.5)"><GiftBag idPrefix="og" /></g>
      <path d="M640 210 C700 220 760 250 812 292" fill="none" stroke="#C9A99A" strokeWidth="3" strokeLinecap="round" />
      <g transform="translate(880 330) rotate(-7)">
        <rect x="-96" y="-38" width="192" height="76" rx="12" fill="#FFF9F2" stroke="#E2CDBD" strokeWidth="3" />
        <circle cx="-74" cy="-18" r="6" fill="none" stroke="#E2CDBD" strokeWidth="3" />
        <text x="8" y="14" textAnchor="middle" fontFamily="Jua, sans-serif" fontSize="42" fill="#573B32">To. 현지</text>
      </g>
      <path d={SPARKLE} transform="translate(260 150) scale(2.6)" fill="#F6DE86" />
      <path d={SPARKLE} transform="translate(1010 140) scale(2)" fill="#F2B7C5" />
      <path d={SPARKLE} transform="translate(1040 500) scale(1.6)" fill="#F6DE86" />
    </svg>
  );
}

const CAPS_A11Y = {
  ...content.captions,
  sign: content.workshopSign,
  tagBack: `선물 태그 뒷면: ${content.tag.back}`,
  silence: content.a11y.silence,
};

export default function App() {
  const [run, setRun] = useState(0);
  return <Experience key={run} onReplay={() => setRun((r) => r + 1)} first={run === 0} />;
}

function Experience({ onReplay, first }) {
  const root = useRef(null);
  const areaRef = useRef(null);
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const S = useRef(null);
  const tlRef = useRef(null);
  const idleRef = useRef([]);
  const endLoops = useRef([]);
  const busy = useRef({});
  const praiseN = useRef(0);
  const liveRef = useRef(null);
  const geo = useRef({ H: 700 });
  const strokes = useRef(null);
  const [phase, setPhase] = useState('LOADING');
  const [letterOpen, setLetterOpen] = useState(false);
  const [bonusOpen, setBonusOpen] = useState(false);
  const endSeen = useRef(false);
  const [receiptAgain, setReceiptAgain] = useState(false);
  const [praiseText, setPraiseText] = useState(content.ending.praise[0]);
  const [dbg, setDbg] = useState({ t: 0, label: '' });
  const [hint, setHint] = useState(false);
  const [short, setShort] = useState(false);
  const [revisit] = useState(() => visits() >= 1 || parseInt(params.get('visits') || '0', 10) >= 2);
  const reduced = useRef(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const announce = useCallback((text) => { if (liveRef.current && text) liveRef.current.textContent = text; }, []);

  // 화면 맞춤: k = min(w/390, h/700), 무대 높이 H = h/k (최소 700)
  useLayoutEffect(() => {
    const area = areaRef.current;
    const fit = () => {
      const w = area.clientWidth, h = area.clientHeight;
      const k = Math.min(w / 390, h / 700);
      const H = Math.max(700, h / k);
      geo.current = { H, k };
      const c = canvasRef.current;
      c.style.height = `${H}px`;
      c.style.setProperty('--H', `${H}px`);
      c.style.transform = `translate(${(w - 390 * k) / 2}px, ${(h - H * k) / 2}px) scale(${k})`;
      root.current.style.setProperty('--k', k);
      root.current.dataset.short = H < 740 ? '1' : '0';
      setShort(H < 740);
      root.current.dataset.wide = (w - 390 * k > 40 || h - H * k > 40) ? '1' : '0';
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      setHint(coarse && w > h && h < 500);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(area);
    window.addEventListener('orientationchange', fit);
    return () => { ro.disconnect(); window.removeEventListener('orientationchange', fit); };
  }, []);

  // 무대 좌표(.inner) → 캔버스 좌표
  const innerToCanvas = useCallback((x, y) => {
    const c = S.current.cam;
    const off = (geo.current.H - 700) / 2;
    return { x: 195 - c.s * (c.px + 15) + c.s * (15 + x), y: off + 350 - c.s * (c.py + 140) + c.s * (140 + y) };
  }, []);
  const toCanvas = useCallback((cx, cy) => {
    const r = canvasRef.current.getBoundingClientRect();
    const k = r.width / 390;
    return { x: (cx - r.left) / k, y: (cy - r.top) / k };
  }, []);
  const stickPoint = useCallback((tx, ty) => {
    const p = stickToInner(S.current.sticks[2], tx, ty);
    return innerToCanvas(p.x, p.y);
  }, [innerToCanvas]);

  const toLove = useCallback(() => {
    const q = gsap.utils.selector(root.current);
    gsap.set(q('.cap, .bubble, .progress, .badge, .sfx, .chef'), { autoAlpha: 0 });
    setPhase('ENDING');
  }, []);

  // 타임라인
  useLayoutEffect(() => {
    const el = root.current;
    S.current = createState();
    if (geo.current.H < 740) S.current.cam.py = 224; // 짧은 화면: 서명 카드에 가방이 덜 가리도록 장면을 살짝 위로
    const apply = makeApplier(el, S.current);
    const ctx = gsap.context(() => {
      setInitial(el);
      tlRef.current = buildMaster(el, S.current, {
        typing: content.features.typingBubbles,
        reduced: reduced.current,
        announce,
        lines: content.lines,
        caps: CAPS_A11Y,
        progA11y: content.progressA11y,
        sfx,
        onToppingPause: () => setPhase('TOPPING'),
      });
      tlRef.current.eventCallback('onComplete', toLove);
      if (!reduced.current) {
        idleRef.current = [
          gsap.to(S.current.gift, { y: GIFT.intro.y - 6, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
          gsap.to(S.current.chef, { s: CHEF_POS.open.s * 1.012, duration: 1.3, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
          gsap.to(S.current.chef, { keyframes: { r: [0, 2.5, 0, 0, -2, 0, 0] }, duration: 6, repeat: -1, ease: 'none' }),
        ];
      }
    }, el);
    apply();
    gsap.ticker.add(apply);
    window.__tl = tlRef.current;
    window.__S = S.current;
    return () => {
      gsap.ticker.remove(apply);
      endLoops.current.forEach((l) => l.kill());
      ctx.revert();
    };
  }, [announce, toLove]);

  const killIdle = () => { idleRef.current.forEach((t) => t.kill()); idleRef.current = []; };

  const playFrom = useCallback((at) => {
    const tl = tlRef.current;
    killIdle();
    if (visits() >= 1 && content.features.revisitLines) root.current.dataset.revisit = '1';
    bumpVisits();
    setPhase('STORY');
    if (typeof at === 'string' && at in LABELS) {
      const t = LABELS[at] + parseFloat(params.get('t') || '0');
      if (params.get('pause') === '1') tl.pause(t); else tl.play(t);
    } else tl.play(0);
  }, []);

  const jumpTo = useCallback((state) => {
    killIdle();
    bumpVisits();
    tlRef.current.progress(1).pause();
    const q = gsap.utils.selector(root.current);
    gsap.set(q('.cap, .bubble, .progress, .badge, .sfx'), { autoAlpha: 0 });
    gsap.set(q('.chef'), { autoAlpha: 0 });
    if (state === 'LETTER_OPEN') { setPhase('ENDING'); setLetterOpen(true); return; }
    setPhase(state);
  }, []);

  // 서명 → 수령 확인서가 접혀 작은 영수증이 되어 날아감 → 본편 시작
  const openGift = useCallback((sig) => {
    strokes.current = sig;
    setPhase('OPENING');
    announce(sig ? content.sign.done : content.receipt.noSign);
    const card = cardRef.current;
    const r = reduced.current;
    // 카드가 접히고 → 작은 하트 하나가 나와 가방 리본으로 → (본편 첫 장면에서 리본이 움직이고 따뜻한 빛)
    const cv = canvasRef.current.getBoundingClientRect();
    const kk = cv.width / 390 || 1;
    const cr = card.getBoundingClientRect();
    const br = root.current.querySelector('#bagBow')?.getBoundingClientRect();
    const from = { x: (cr.left + cr.width / 2 - cv.left) / kk, y: (cr.top + cr.height * 0.35 - cv.top) / kk };
    const to = br ? { x: (br.left + br.width / 2 - cv.left) / kk, y: (br.top + br.height / 2 - cv.top) / kk } : { x: 195, y: 200 };
    const fh = root.current.querySelector('.flyHeart');
    gsap.timeline({ onComplete: () => playFrom() })
      .to(card.querySelectorAll('.sgRow, .sgPlaceholder, .sgClear, .sgDone'), { autoAlpha: 0, duration: 0.2 }, 0)
      .to(card, { scaleY: 0.3, scaleX: 0.55, y: 40, duration: r ? 0.01 : 0.35, ease: 'power2.in', transformOrigin: '50% 100%' }, 0.1)
      .to(card, { y: 120, autoAlpha: 0, duration: r ? 0.01 : 0.35, ease: 'power2.in' }, 0.48)
      .set(fh, { x: from.x, y: from.y + 40, autoAlpha: 1, scale: 0 }, 0.4)
      .to(fh, { scale: 1, duration: r ? 0.01 : 0.3, ease: 'back.out(2.4)' }, 0.42)
      .to(fh, { x: to.x, duration: r ? 0.01 : 0.7, ease: 'power1.inOut' }, 0.72)
      .to(fh, { keyframes: { y: [from.y - 30, to.y] }, duration: r ? 0.01 : 0.7, ease: 'power1.inOut' }, 0.72)
      .to(fh, { scale: 0.4, autoAlpha: 0, duration: 0.2 }, r ? 0.75 : 1.38);
  }, [announce, playFrom]);

  // 준비되면 서명 화면
  useEffect(() => {
    let alive = true;
    const srcs = [...IMAGES.map(imgSrc), bagPhoto()];
    const imgs = srcs.map((src) => { const im = new Image(); im.src = src; return (im.decode ? im.decode() : Promise.resolve()).catch(() => {}); });
    const fonts = document.fonts
      ? Promise.all([document.fonts.load('400 24px Jua'), document.fonts.load('700 16px Pretendard'), document.fonts.load('700 24px Gaegu')]).catch(() => {})
      : Promise.resolve();
    Promise.race([Promise.all([...imgs, fonts]), new Promise((r) => setTimeout(r, 5000))]).then(() => {
      if (!alive) return;
      window.__appReady = true;
      setPhase('INTRO');
      if (!first) return;
      const at = params.get('at');
      if (!at) return;
      const map = { ending: 'ENDING', love: 'ENDING', letter: 'ENDING', letteropen: 'LETTER_OPEN', receipt: 'RECEIPT', complete: 'COMPLETE', delivered: 'COMPLETE' };
      if (params.get('sig') === 'demo') strokes.current = DEMO_SIG;
      if (map[at]) jumpTo(map[at]);
      else if (at in LABELS) playFrom(at);
    });
    return () => { alive = false; };
  }, [playFrom, jumpTo, first]);

  // 화면이 가려지면 멈추고 돌아오면 이어서 (참여 대기 중에는 자동 재생하지 않음)
  useEffect(() => {
    let paused = false;
    const check = () => {
      const tl = tlRef.current;
      if (!tl) return;
      if (document.hidden && tl.isActive()) { tl.pause(); paused = true; }
      else if (!document.hidden && paused) { paused = false; if (phaseRef.current === 'STORY') tl.resume(); }
    };
    document.addEventListener('visibilitychange', check);
    return () => document.removeEventListener('visibilitychange', check);
  }, []);

  // 단계별 화면 상태
  useLayoutEffect(() => {
    const el = root.current;
    const q = gsap.utils.selector(el);
    if (phase === 'RECEIPT') el.style.setProperty('--lp', '0.3');
    if (phase === 'COMPLETE') {
      endSeen.current = true;
      el.style.setProperty('--lp', '0.3');
      gsap.set(q('.loveDim'), { autoAlpha: 0 });
      endLoops.current.forEach((l) => l.kill());
      gsap.fromTo(q('.p06'), { autoAlpha: 0, y: -10, rotation: -12 }, { autoAlpha: 1, y: 0, rotation: -4, duration: 0.5, ease: 'back.out(1.6)' });
      gsap.fromTo(q('.peekChef'), { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'back.out(1.6)', delay: 0.2 });
      // 배경 반복은 아주 느리고 작게 (현관 불빛이 숨 쉬듯, 모몽가는 가끔 갸웃)
      endLoops.current = [gsap.fromTo(q('#doorGlow'), { opacity: 0.45 }, { opacity: 0.8, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' })];
      if (!reduced.current) {
        endLoops.current.push(
          gsap.to(q('.peekChef img'), { keyframes: { rotation: [0, 4, 0, 0, 0] }, duration: 5, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 100%' }),
        );
      }
    }
  }, [phase]);

  // 편지·영수증을 읽는 동안은 배경 반복을 멈추고 현관을 살짝 어둡게
  const reading = letterOpen || receiptAgain || phase === 'RECEIPT';
  useEffect(() => {
    endLoops.current.forEach((l) => (reading ? l.pause() : l.resume()));
  }, [reading]);

  const skip = () => {
    if (['INTRO', 'OPENING', 'STORY', 'TOPPING'].includes(phaseRef.current)) {
      killIdle();
      if (phaseRef.current === 'INTRO') bumpVisits();
      tlRef.current.progress(1).pause();
      toLove();
    }
  };

  // ── 하트 뿌리기 끝 → 이야기 이어서 ──
  const toppingDone = useCallback(() => {
    if (phaseRef.current !== 'TOPPING') return;
    setPhase('STORY');
    tlRef.current.play();
  }, []);
  const onTapFx = useCallback((n) => {
    const ch = S.current.chef;
    if (n === 1) {
      const b = gsap.utils.selector(root.current)('[data-badge="a07c"]');
      gsap.set(b, { x: BADGE_AT.work.x, y: BADGE_AT.work.y });
      gsap.fromTo(b, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2.2)' });
      gsap.to(b, { autoAlpha: 0, duration: 0.3, delay: 1.6 });
    }
    if (busy.current.hop || reduced.current) return;
    busy.current.hop = true;
    gsap.to(ch, { keyframes: { y: [CHEF_POS.work.y - 10, CHEF_POS.work.y] }, duration: 0.32, ease: 'power1.out', onComplete: () => { busy.current.hop = false; } });
  }, []);

  // ── 엔딩 인터랙션 ──
  const q = (s) => gsap.utils.selector(root.current)(s);
  const once = (key, fn) => { if (busy.current[key]) return; busy.current[key] = true; fn(() => { busy.current[key] = false; }); };
  const W = reduced.current ? 0 : 1;

  const pokeGift = useCallback(() => {
    if (!content.features.pokeGift) return;
    once('poke', (done) => {
      const b = q('[data-badge="a07d"]');
      gsap.timeline({ onComplete: done })
        .to(S.current.gift, { keyframes: { r: [-6, 6, -4, 3, 0].map((v) => v * W) }, duration: 0.45, ease: 'none' }, 0)
        .to(S.current.chef, { keyframes: { y: [CHEF_POS.open.y - 16 * W, CHEF_POS.open.y] }, duration: 0.4, ease: 'power1.out' }, 0.05)
        .set(b, { x: BADGE_AT.open.x, y: BADGE_AT.open.y }, 0)
        .fromTo(b, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2.2)' }, 0.1)
        .to(b, { autoAlpha: 0, scale: 0.6, duration: 0.25 }, 1.3);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tapDoor = useCallback(() => {
    once('door', (done) => {
      gsap.timeline({ onComplete: done })
        .to(q('#doorPanel'), { scaleX: 0.93, transformOrigin: '0% 50%', duration: 0.35, ease: 'power2.out' }, 0)
        .to(q('#doorSpill'), { opacity: 0.85, duration: 0.35 }, 0)
        .fromTo(q('.ob-door'), { autoAlpha: 0, y: 8, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(2)' }, 0.15)
        .call(() => announce(content.ending.doorTap), null, 0.2)
        .to(q('.ob-door'), { autoAlpha: 0, duration: 0.3 }, 2.8)
        .to(q('#doorPanel'), { scaleX: 1, duration: 0.4, ease: 'power2.inOut' }, 2.8)
        .to(q('#doorSpill'), { opacity: 0, duration: 0.4 }, 2.8);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announce]);

  // 칭찬: 누를수록 볼이 빨개지고, 10번째에 특별 반응
  const praiseTl = useRef(null);
  const praise = () => {
    // 누를 때마다 센다. 이전 반응은 끊고 새로 시작해서 연타해도 쌓이지 않는다.
    const E = content.ending;
    praiseN.current += 1;
    const n = praiseN.current;
    const special = n === E.praiseGoal;
    const text = special ? E.praiseSpecial : E.praise[(n - 1) % E.praise.length];
    setPraiseText(text);
    announce(`모몽가: ${text}`);
    root.current.style.setProperty('--blush', String(Math.min(1, n / E.praiseGoal)));
    praiseTl.current?.progress(1).kill();
    gsap.set(q('[data-badge="a07b"], [data-badge="a07c"]'), { autoAlpha: 0 });
    const b = q(`[data-badge="${special ? 'a07c' : 'a07b'}"]`);
    const hold = special ? 3.2 : 2.4;
    const tl = gsap.timeline();
    praiseTl.current = tl;
    tl.to(q('.peekChef'), { keyframes: { y: [-18 * W, 0, -8 * W, 0] }, duration: 0.6, ease: 'none' }, 0)
      .set(b, { x: BADGE_AT.door.x, y: BADGE_AT.door.y - 30 }, 0)
      .fromTo(b, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2.2)' }, 0.1)
      .fromTo(q('.ob-praise'), { autoAlpha: 0, y: 6, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(2)' }, 0.1)
      .to(q('.ob-praise'), { autoAlpha: 0, duration: 0.3 }, hold)
      .to(b, { autoAlpha: 0, duration: 0.3 }, hold);
    if (special) {
      sfx('chime');
      const layer = root.current.querySelector('.heartRain');
      const c = innerToCanvas(300, 300);
      for (let i = 0; i < 6; i++) {
        const h = document.createElement('i');
        h.className = 'rainHeart'; h.textContent = '✦';
        h.style.left = `${c.x}px`; h.style.top = `${c.y}px`; h.style.color = ['#F6DE86', '#FFF3C4'][i % 2];
        layer.appendChild(h);
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        gsap.timeline({ onComplete: () => h.remove() })
          .fromTo(h, { scale: 0, opacity: 1 }, { x: Math.cos(a) * 46 * (W || 0.3), y: Math.sin(a) * 40 * (W || 0.3) - 30, scale: 0.8, duration: 0.6, ease: 'power3.out' }, 0.15)
          .to(h, { opacity: 0, duration: 0.4 }, 1.1);
      }
    } else sfx('pop');
  };


  useEffect(() => {
    if (!DEBUG) return undefined;
    const id = setInterval(() => { const tl = tlRef.current; if (tl) setDbg({ t: tl.time(), label: tl.currentLabel() }); }, 120);
    return () => clearInterval(id);
  }, []);

  const closeLetter = () => {
    setLetterOpen(false);
    if (phaseRef.current === 'ENDING') setPhase('RECEIPT');
  };

  const showSign = phase === 'INTRO' || phase === 'OPENING' || phase === 'LOADING';
  const inStory = phase === 'STORY' || phase === 'TOPPING' || phase === 'OPENING';
  return (
    <div className="app" ref={root} data-phase={phase} data-tod={tod} data-reading={reading ? '1' : '0'}>
      <div className="backdrop" aria-hidden="true">
        <div className="sideDecor l"><svg viewBox="-20 -20 40 40"><path d={SPARKLE} transform="scale(2.6)" fill="#F2B7C5" /></svg></div>
        <div className="sideDecor l2"><svg viewBox="-12 -12 24 24"><path d={SPARKLE} transform="scale(1.6)" fill="#F6DE86" /></svg></div>
        <div className="sideDecor r"><svg viewBox="0 0 120 120"><rect x="14" y="46" width="92" height="66" rx="8" fill="#FFF6F2" stroke="#D88CA2" strokeWidth="3" /><rect x="8" y="34" width="104" height="20" rx="6" fill="#F4C1CE" stroke="#D88CA2" strokeWidth="3" /><rect x="52" y="34" width="16" height="78" fill="#E7A2B5" /><path d="M60 34C44 10 24 16 34 30C40 38 52 36 60 34ZM60 34C76 10 96 16 86 30C80 38 68 36 60 34Z" fill="#F4C1CE" stroke="#D88CA2" strokeWidth="3" /></svg></div>
        <div className="sideDecor r2"><svg viewBox="-12 -12 24 24"><path d={SPARKLE} transform="scale(1.6)" fill="#F2B7C5" /></svg></div>
      </div>

      {inStory && <button type="button" className="skip" onClick={skip}>{content.skip}</button>}
      <div className="sr-only" aria-live="polite" ref={liveRef} />

      <div className="stageArea" ref={areaRef} tabIndex={-1}>
        <div className="canvas" ref={canvasRef} role="region" aria-label={content.a11y.stage}>
          <div className="worldBox">
            <Stage tod={tod} praiseText={praiseText} onGift={pokeGift} onDoor={tapDoor} phase={phase} />
            <div className="tintWarm" aria-hidden="true" />
            <div className="tintCool" aria-hidden="true" />
            <div className="tintNight" aria-hidden="true" />
            <div className="loveDim" aria-hidden="true" />
            <div className="loveWash" aria-hidden="true" />
            <div className="readDim" aria-hidden="true" />
          </div>
          <div className="paperGrain" aria-hidden="true" />

          <div className="frameDecor" aria-hidden="true">
            <Garland />
            <BerryBranch />
            <Scarf />
          </div>

          <div className="signCard" aria-hidden="true"><span>{content.workshopSign}</span></div>

          <div className="topUI">
            <div className="progress" role="progressbar" aria-label="배송 진행" aria-valuemin={0} aria-valuemax={5} aria-valuenow={0}>
              <div className="pStick"><i className="pChoco" /><i className="pShine" /></div>
              <div className="plabs">
                {content.progress.map((p, i) => <span key={i} className="plab" data-i={i}><i />{p}</span>)}
              </div>
            </div>
            <div className="caps" aria-hidden="true">
              {Object.entries(content.captions).map(([k, v]) => (
                <p key={k} className={`cap${k === 'showGift' || k === 'deliverGift' ? ' capBig' : ''}`} data-k={k}><span>{v}</span></p>
              ))}
            </div>
          </div>

          <div className="bottomUI">
            <div className="bubbles" aria-hidden="true">
              {Object.entries(content.lines).filter(([k]) => k !== 'enterWorkshopRevisit').map(([k, v]) => (
                k === 'enterWorkshop' ? (
                  <div key={k}>
                    <p className="bubble v-normal" data-k={k}><Chars text={v} /></p>
                    <p className="bubble v-revisit" data-k={k}><Chars text={content.lines.enterWorkshopRevisit} /></p>
                  </div>
                ) : <p key={k} className="bubble" data-k={k}><Chars text={v} /></p>
              ))}
            </div>
            {showSign && (
              <div className="signArea">
                {phase === 'LOADING'
                  ? <p className="loadingPill">{content.intro.loading}</p>
                  : <SignCard cardRef={cardRef} onOpen={openGift} revisit={revisit} onJumpEnd={() => jumpTo('COMPLETE')} preset={params.get('sig') === 'demo' ? DEMO_SIG : null} short={short} />}
              </div>
            )}
          </div>

          <div className="heartRain" aria-hidden="true" />
          <span className="flyHeart" aria-hidden="true"><MotifHeart size={18} /></span>

          {phase === 'TOPPING' && (
            <ToppingPrompt root={root.current} toCanvas={toCanvas} stickPoint={stickPoint} onDone={toppingDone} onTapFx={onTapFx} />
          )}
          {phase === 'ENDING' && (
            <EndingFlow root={root.current} phase={phase} letterOpen={letterOpen} onOpenLetter={() => setLetterOpen(true)} announce={announce} />
          )}
          {phase === 'RECEIPT' && <ReceiptCard strokes={strokes.current} firstTime onOk={() => setPhase('COMPLETE')} />}
          {phase === 'COMPLETE' && !receiptAgain && !letterOpen && (
            <CompletePanel onPraise={praise} onLetter={() => setLetterOpen(true)} onReceipt={() => setReceiptAgain(true)} onReplay={onReplay}
              bonusOpen={bonusOpen} setBonusOpen={setBonusOpen} again={endSeen.current} />
          )}
          {phase === 'COMPLETE' && receiptAgain && <ReceiptCard strokes={strokes.current} okLabel="닫기" onOk={() => setReceiptAgain(false)} />}
          {letterOpen && <LetterModal onClose={closeLetter} firstTime={phase === 'ENDING'} />}

          <SoundToggle />
          <div className="flash" aria-hidden="true" />
        </div>
      </div>

      {hint && (
        <div className="rotateToast" role="status">
          <span>{content.rotateHint}</span>
          <button type="button" onClick={() => setHint(false)}>{content.rotateClose}</button>
        </div>
      )}

      {DEBUG && (
        <div className="debug">
          <input type="range" min="0" max={tlRef.current?.duration() || 35} step="0.05" value={dbg.t}
            onChange={(e) => { const tl = tlRef.current; killIdle(); setPhase('STORY'); tl.pause(parseFloat(e.target.value)); setDbg({ t: tl.time(), label: tl.currentLabel() }); }} />
          <span>{dbg.t.toFixed(2)}s · {dbg.label}</span>
          {[0.25, 0.5, 1].map((s) => <button key={s} type="button" onClick={() => tlRef.current.timeScale(s)}>{s}x</button>)}
          <button type="button" onClick={() => { setPhase('STORY'); tlRef.current.play(); }}>▶</button>
        </div>
      )}
    </div>
  );
}

