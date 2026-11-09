import { gsap } from 'gsap';
import { SLOTS, SLOT_Y, SLOT_SCALE, COAT_MAX, BOWL, STICK_LEN, GRIP, CUP_SLOTS, ALMONDS, BERRY_HEARTS, TRAY_ROWS, TRAY_X } from './props.jsx';

// 장면 시작 시각(초)
export const LABELS = {
  openGift: 0, enterWorkshop: 2.0, meltChocolate: 4.6, dipBiscuit: 8.2, almond: 13.8, strawberry: 18.3,
  nude: 23.6, coolChocolate: 26.5, daydream: 27.9, tray: 29.7, wrapGift: 33.0, showGift: 36.9,
  revealSender: 38.9, deliverGift: 40.9, silence: 46.1,
};
const L = LABELS;
export const HANDLE = { x: 216, y: 205 };
export const GIFT = {
  intro: { x: 180, y: 182, r: 0, s: 1.2 },
  wrap: { x: 262, y: 146, r: 0, s: 0.9 },
  show: { x: 262, y: 140, r: 0, s: 0.95 },
  hang: { x: HANDLE.x, y: HANDLE.y, r: 0, s: 0.8 },
};
export const CHEF_POS = {
  open: { x: 30, y: 52, s: 1.154, r: 0 },
  work: { x: 50, y: 70, s: 1, r: 0 },
};
// 모몽가 오른손 위치 (chef-a04 이미지 안, 260×258 기준)
export const HAND_LOCAL = { x: 190, y: 187 };
const HAND_REST = { x: CHEF_POS.work.x + HAND_LOCAL.x, y: CHEF_POS.work.y + HAND_LOCAL.y }; // (240, 257)
const TAG_ATTACH = { x: 26, y: 28 };
const INNER_DROP = 66;
export const STICK_IDS = ['p0', 'p1', 'p2', 'p3']; // 오리지널, 아몬드, 딸기, 누드
const STICK_SLOT = [0, 1, 2, 3];
const RUN = { floor: 428, s: 0.56, x0: 26, x1: 236, giftS: 0.42 };
const RETREAT_X = 690; // 현관 화면 오른쪽 가장자리 (몸이 반쯤 걸쳐 보이는 위치)
export const BADGE_AT = {
  open: { x: 266, y: 40 }, work: { x: 268, y: 64 }, show: { x: 12, y: 96 }, door: { x: 272, y: 214 }, left: { x: 8, y: 150 },
};
const PROG = [0.12, 0.38, 0.62, 0.84, 1];
const rad = (d) => (d * Math.PI) / 180;
// 과자 로컬 좌표 → 무대 좌표
export const stickToInner = (t, lx, ly) => {
  const r = rad(t.r);
  return { x: t.x + t.s * (lx * Math.cos(r) - ly * Math.sin(r)), y: t.y + t.s * (lx * Math.sin(r) + ly * Math.cos(r)) };
};
// 손이 GRIP 지점을 잡고 있을 때 과자 원점
const originFromHand = (h, r) => ({ x: h.x + GRIP * Math.sin(rad(r)), y: h.y - GRIP * Math.cos(rad(r)) });
const handFromOrigin = (o, r) => ({ x: o.x - GRIP * Math.sin(rad(r)), y: o.y + GRIP * Math.cos(rad(r)) });
const arm = (h, shift = 0) => ({ dx: h.x - HAND_REST.x - shift, dy: h.y - HAND_REST.y });
const STEP = 16; // 컵·토핑통 쪽으로 다가가는 걸음
const CUP_BASE = 326;
const cupPose = (k) => ({ x: CUP_SLOTS[k].x, y: CUP_BASE, r: 180 + CUP_SLOTS[k].tilt, s: 1 });
const DIP_X = 262;

export function createState() {
  return {
    cam: { s: 1, px: 180, py: 210 },
    strip: { x: 0 },
    gift: { ...GIFT.intro },
    chef: { ...CHEF_POS.open, stir: 0, sq: 1, floor: 0, shadow: 0, flip: 1 },
    arm: { dx: 0, dy: 0, o: 0, follow: 0 },
    held: { i: -1, r: 0 },
    liq: { y: 298, s: 0 },
    spat: { a: 0, lift: 40, on: 0 },
    sticks: STICK_IDS.map(() => ({ x: 180, y: -200, r: 0, s: 1 })),
    coat: { i: -1, live: 0, max: [0, 0, 0, 0] },
    str: { o: 0, w: 2.6, i: 0 },
    shkA: { x: 430, y: 120, r: 0, held: 0 },
    shkH: { x: 430, y: 120, r: 0, held: 0 },
    run: { on: 0, p: 0 },
  };
}

const ease = gsap.parseEase('power2.inOut');
const ease1 = gsap.parseEase('power1.inOut');

// 모몽가(스티커) 안의 한 점 → 띠(strip) 좌표
function chefPoint(ch, lx, ly, sway) {
  const sx = ch.s * (1 + (1 - ch.sq) * 0.6);
  const sy = ch.s * ch.sq;
  const ox = ch.x + 130, oy = ch.y + 247.7;
  const dx = (lx - 130) * sx, dy = (ly - 247.7) * sy;
  const r = rad(ch.r + sway);
  return { x: ox + dx * Math.cos(r) - dy * Math.sin(r), y: oy + dx * Math.sin(r) + dy * Math.cos(r) };
}

// 상태 → DOM (gsap.ticker에서 매 프레임)
export function makeApplier(root, S) {
  const $ = (s) => root.querySelector(s);
  const el = {
    cam: $('.cam'), strip: $('.strip'), gift: $('#gift'), tag: $('.tagAnchor'), lb: $('#liqBack'), lf: $('#liqFront'),
    sp: $('#spatula'), chef: $('.chef'), shadow: $('.chefShadow'), str: $('#chocoStr'), paw: $('#paw'),
    shkA: $('#shakerA'), shkH: $('#shakerH'),
    sticks: STICK_IDS.map((id) => $(`#${id}`)),
    coats: STICK_IDS.map((id) => $(`#${id}-coat`)),
  };
  const hand = { x: 0, y: 0 };
  return () => {
    const c = S.cam;
    el.cam.style.transform = `translate(${195 - c.s * (c.px + 15)}px, ${350 - c.s * (c.py + 140)}px) scale(${c.s})`;
    const ch = S.chef;
    const g = S.gift;
    if (S.run.on) {
      // 배송 달리기: 화면이 현관으로 넘어가는 동안 모몽가가 가방을 들고 통통 뛴다
      const p = S.run.p;
      S.strip.x = -390 * ease(p);
      const sx = RUN.x0 + (RUN.x1 - RUN.x0) * ease1(p);
      const hopA = Math.abs(Math.sin(p * Math.PI * 3));
      const land = 1 - Math.min(1, hopA * 5);
      ch.s = RUN.s; ch.r = 4 * Math.sin(p * Math.PI * 6);
      ch.x = sx - S.strip.x;
      ch.y = RUN.floor - 248 - hopA * 22;
      ch.sq = 1 - 0.08 * land;
      ch.floor = RUN.floor; ch.shadow = 1;
      const top = ch.y + 248 - 248 * ch.s;
      g.x = sx + (130 + 58) * ch.s; g.y = top + 96 * ch.s; g.s = RUN.giftS; g.r = -10 * Math.cos(p * Math.PI * 6);
    }
    el.strip.style.transform = `translateX(${S.strip.x}px)`;
    el.gift.setAttribute('transform', `translate(${g.x} ${g.y}) rotate(${g.r}) scale(${g.s})`);
    el.tag.style.transform = `translate(${g.x}px, ${g.y}px) rotate(${g.r}deg) scale(${g.s}) translate(${TAG_ATTACH.x}px, ${TAG_ATTACH.y}px)`;

    // 주걱 날 끝 위치 (볼 안에서 원을 그림)
    const a = S.spat.a;
    const bx = BOWL.cx + 38 * Math.cos(a);
    const by = BOWL.surf + 6 * Math.sin(a) - S.spat.lift;
    const sway = ch.stir ? 3 * Math.sin(a) * ch.stir : 0;
    // 손: 모몽가 몸의 이동·회전을 따라가고, 팔 이동량(arm)과 주걱 원운동(follow)을 더한다
    const hp = chefPoint(ch, HAND_LOCAL.x, HAND_LOCAL.y, sway);
    hand.x = hp.x + S.strip.x + S.arm.dx + S.arm.follow * 0.32 * (bx - BOWL.cx);
    hand.y = hp.y + S.arm.dy + S.arm.follow * 0.32 * (by - BOWL.surf);
    S.hand = hand;

    const sxs = ch.s * (1 + (1 - ch.sq) * 0.6);
    el.chef.style.transform = `translate(${ch.x}px, ${ch.y}px) rotate(${ch.r + sway}deg) scale(${sxs * ch.flip}, ${ch.s * ch.sq})`;
    if (ch.shadow > 0) {
      const lift = Math.max(0, ch.floor - (ch.y + 248));
      const k = ch.s * (1 - Math.min(0.45, lift / 70));
      el.shadow.style.opacity = String(ch.shadow * (1 - Math.min(0.5, lift / 60)));
      el.shadow.style.transform = `translate(${ch.x + 130}px, ${ch.floor}px) scale(${k * (1 + (1 - ch.sq) * 2)}, ${k})`;
    } else el.shadow.style.opacity = '0';

    const l = `translate(${BOWL.cx} ${S.liq.y}) scale(${S.liq.s})`;
    el.lb.setAttribute('transform', l);
    el.lf.setAttribute('transform', l);
    const ang = (Math.atan2(hand.x - bx, by - hand.y) * 180) / Math.PI;
    el.sp.setAttribute('transform', `translate(${bx} ${by}) rotate(${ang})`);

    // 손에 쥔 과자: 손이 GRIP 지점을 잡고, 손을 따라 움직인다
    if (S.held.i >= 0) {
      const t = S.sticks[S.held.i];
      const o = originFromHand(hand, S.held.r);
      t.x = o.x; t.y = o.y; t.r = S.held.r; t.s = 1;
    }
    // 손에 쥔 토핑통
    for (const [k, node] of [['shkA', el.shkA], ['shkH', el.shkH]]) {
      const z = S[k];
      if (z.held) { z.x = hand.x - 2; z.y = hand.y - 14; }
      node.setAttribute('transform', `translate(${z.x} ${z.y}) rotate(${z.r})`);
    }
    S.sticks.forEach((t, i) => el.sticks[i].setAttribute('transform', `translate(${t.x} ${t.y}) rotate(${t.r}) scale(${t.s})`));
    el.paw.setAttribute('transform', `translate(${hand.x} ${hand.y}) rotate(${ch.r * 0.6})`);
    el.paw.setAttribute('opacity', S.arm.o);

    // 초콜릿에 닿은 만큼만 코팅
    if (S.coat.live && S.coat.i >= 0) {
      const t = S.sticks[S.coat.i];
      const tip = stickToInner(t, 0, STICK_LEN);
      const depth = tip.y - BOWL.surf;
      S.coat.max[S.coat.i] = Math.min(COAT_MAX, Math.max(S.coat.max[S.coat.i], depth));
    }
    S.coat.max.forEach((h, i) => {
      const n = el.coats[i];
      if (!n) return;
      n.setAttribute('y', STICK_LEN + 4 - h * 1.12);
      n.setAttribute('height', h > 0 ? h * 1.12 + 6 : 0);
    });
    // 초콜릿 실: 과자 끝에서 볼 표면까지
    if (S.str.o > 0) {
      const tip = stickToInner(S.sticks[S.str.i], 0, STICK_LEN + 2);
      el.str.setAttribute('x1', tip.x); el.str.setAttribute('x2', tip.x + 1);
      el.str.setAttribute('y1', tip.y);
      el.str.setAttribute('y2', BOWL.surf);
      el.str.setAttribute('stroke-width', S.str.w);
      el.str.setAttribute('opacity', S.str.o);
    } else el.str.setAttribute('opacity', 0);
  };
}

export function setInitial(root) {
  const q = gsap.utils.selector(root);
  gsap.set(q('.cap, .bubble, .progress, .flash, .signCard, .tintWarm, .tintCool, .tintNight'), { autoAlpha: 0 });
  gsap.set(q('.badge, .obubble, .ovHeart, .slip .from, .p06, .slip, .tagAnchor, .peekChef, .chef .a02, .sfx, .chip, .dreamHeart, .coolSnow, .perfect'), { autoAlpha: 0 });
  gsap.set(q('#bowlBack, #liqBack, #chunks, #liqFront, #bowlFront, #pinkBack, #pinkFront, #spatula, #shakerA, #shakerH, #tray, #cupBack, #cupFront, .stick, .inStick, #steam, #nudeZoom, .bit'), { autoAlpha: 0 });
  gsap.set(q('#p2 .tp'), { opacity: 0 });
  gsap.set(q('#p1 .alm'), { opacity: 0 });
  gsap.set(q('.stick .wrap, .stick .band, .stick .cshadow'), { opacity: 0 });
  gsap.set(q('#nzFill'), { scale: 0, transformOrigin: '50% 50%' });
  gsap.set(q('.pChoco'), { scaleX: 0, transformOrigin: '0% 50%' });
  gsap.set(q('.spk'), { scale: 0, transformOrigin: '50% 50%' });
}

const badgeAt = (tl, q, k, pos, t) => {
  tl.set(q(`[data-badge="${k}"]`), { x: pos.x, y: pos.y }, t);
  tl.fromTo(q(`[data-badge="${k}"]`), { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2.2)', immediateRender: false }, t);
};
const badgeOut = (tl, q, k, t) => tl.to(q(`[data-badge="${k}"]`), { autoAlpha: 0, scale: 0.6, duration: 0.25 }, t);

export function buildMaster(root, S, opts = {}) {
  const { typing = true, reduced = false, announce = () => {}, lines = {}, caps = {}, progA11y = [], sfx = () => {}, onToppingPause = null } = opts;
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ paused: true });
  const dur = (d) => (reduced ? 0.01 : d);
  const wob = (d) => (reduced ? 0 : d);
  for (const [k, t] of Object.entries(LABELS)) tl.addLabel(k, t);

  let curCap = null;
  let curBub = null;
  const cap = (k, at) => {
    if (curCap) tl.to(q(`.cap[data-k="${curCap}"]`), { autoAlpha: 0, y: -6, duration: 0.25 }, at);
    if (k) {
      tl.fromTo(q(`.cap[data-k="${k}"]`), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35 }, at + 0.12);
      tl.call(() => announce(caps[k]), null, at + 0.12);
    }
    curCap = k;
  };
  const bub = (k, at) => {
    if (curBub) tl.to(q(`.bubble[data-k="${curBub}"]`), { autoAlpha: 0, scale: 0.96, duration: 0.2 }, at);
    if (k) {
      tl.fromTo(q(`.bubble[data-k="${k}"]`), { autoAlpha: 0, scale: 0.9, y: 6 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(2)' }, at + 0.1);
      if (typing) q(`.bubble[data-k="${k}"]`).forEach((b) => tl.fromTo(b.querySelectorAll('.ch'), { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: 0.03 }, at + 0.18));
      tl.call(() => announce(`모몽가: ${lines[k]}`), null, at + 0.4);
    }
    curBub = k;
  };
  const stamp = (i, at) => {
    tl.to(q('.pChoco'), { scaleX: PROG[i], duration: 0.5, ease: 'power2.out' }, at);
    tl.to(q(`.plab[data-i="${i}"]`), { color: '#A86A5A', duration: 0.3 }, at + 0.2);
    tl.fromTo(q(`.plab[data-i="${i}"] i`), { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(3)', immediateRender: false }, at + 0.2);
    tl.call(() => {
      const p = root.querySelector('.progress');
      if (p) { p.setAttribute('aria-valuenow', String(i + 1)); p.setAttribute('aria-valuetext', progA11y[i] || ''); }
    }, null, at);
  };
  const sfxText = (k, at, life = 1.1) => {
    tl.fromTo(q(`.sfx[data-k="${k}"]`), { autoAlpha: 0, scale: 0.4, rotation: -14 }, { autoAlpha: 1, scale: 1, rotation: -6, duration: 0.3, ease: 'back.out(3)', immediateRender: false }, at);
    tl.to(q(`.sfx[data-k="${k}"]`), { autoAlpha: 0, y: -10, duration: 0.3 }, at + life);
    tl.set(q(`.sfx[data-k="${k}"]`), { y: 0 }, at + life + 0.31);
  };
  const sound = (name, at) => tl.call(() => sfx(name), null, at);
  const chef = S.chef;
  const W = CHEF_POS.work;
  const hop = (at, h = 14, base = W.y) => {
    tl.to(chef, { keyframes: { y: [base - wob(h), base], sq: [1.02, reduced ? 1 : 0.93] }, duration: 0.42, ease: 'power1.out' }, at);
    tl.to(chef, { sq: 1, duration: 0.22, ease: 'back.out(3)' }, at + 0.42);
  };
  const sticks = S.sticks;
  const stickEl = (i) => q(`#${STICK_IDS[i]}`);

  // ── 손 동작 도우미 ──
  const armTo = (h, at, d = 0.45, e = 'power2.inOut', shift = 0) => tl.to(S.arm, { ...arm(h, shift), duration: d, ease: e }, at);
  const step = (at, on, d = 0.5) => tl.to(chef, { x: W.x + (on ? wob(STEP) : 0), duration: d, ease: 'power2.inOut' }, at);
  const pawOn = (at) => tl.to(S.arm, { o: 1, duration: 0.15 }, at);
  const pawOff = (at) => tl.to(S.arm, { o: 0, duration: 0.15 }, at);
  // 새 과자를 손에 쥐기 (준비 → 쥠)
  const take = (i, at, h) => {
    const o = originFromHand(h, 0);
    armTo(h, at, 0.4);
    tl.set(stickEl(i), { autoAlpha: 1 }, at);
    tl.fromTo(sticks[i], { x: o.x - 140, y: o.y - 180, r: -40, s: 1 }, { x: o.x, y: o.y, r: 0, duration: 0.45, ease: 'power3.out', immediateRender: false }, at);
    pawOn(at + 0.35);
    tl.set(S.held, { i, r: 0 }, at + 0.45);
  };
  // 담그기: 내려갈 땐 빠르게 → 잠깐 멈춤 → 들어 올릴 땐 천천히
  const dip = (i, at, { down = 0.8, hold = 0.3, up = 1.1, lean = true } = {}) => {
    const low = handFromOrigin({ x: DIP_X, y: BOWL.surf + COAT_MAX - STICK_LEN + 2 }, 0);
    const high = handFromOrigin({ x: DIP_X, y: BOWL.surf - STICK_LEN - 14 }, 0);
    tl.set(S.coat, { i, live: 1 }, at);
    const leanY = lean ? wob(8) : 0;
    tl.to(S.arm, { ...arm({ x: low.x, y: low.y - leanY }), duration: down, ease: 'power2.in' }, at);
    if (lean) tl.to(chef, { y: W.y + leanY, r: wob(-2.5), duration: down, ease: 'power2.inOut' }, at);
    tl.fromTo(q('#ripple'), { attr: { cx: DIP_X, cy: 292 }, opacity: 0.9, scale: 0.2, transformOrigin: '50% 50%' }, { opacity: 0, scale: 1.6, duration: 0.6, immediateRender: false }, at + down * 0.75);
    tl.set(S.coat, { live: 0 }, at + down + hold);
    tl.set(S.coat.max, { [i]: COAT_MAX }, at + down + hold + 0.01);
    tl.to(S.arm, { ...arm(high), duration: up, ease: 'power2.inOut' }, at + down + hold);
    if (lean) tl.to(chef, { y: W.y, r: 0, duration: up, ease: 'power2.inOut' }, at + down + hold);
    return at + down + hold; // 들어 올리기 시작 시각
  };
  // 거꾸로 세워 유리컵에 꽂기 (뒤집기 → 내려놓기 → 손 놓기)
  const toCup = (i, at, k) => {
    const pose = cupPose(k);
    const above = handFromOrigin({ x: pose.x, y: pose.y - 40 }, pose.r);
    const inCup = handFromOrigin(pose, pose.r);
    const sh = reduced ? 0 : STEP;
    tl.to(S.held, { r: pose.r, duration: 0.55, ease: 'power2.inOut' }, at);
    step(at, true, 0.55);
    armTo(above, at, 0.55, 'power2.inOut', sh);
    tl.to(chef, { keyframes: { r: [wob(3), 0] }, duration: 0.9, ease: 'none' }, at);
    armTo(inCup, at + 0.55, 0.3, 'power2.in', sh);
    tl.set(S.held, { i: -1 }, at + 0.86);
    tl.set(sticks[i], { ...pose }, at + 0.86);
    pawOff(at + 0.86);
    step(at + 0.9, false, 0.4);
    armTo(HAND_REST, at + 0.9, 0.4);
    tl.to(chef, { keyframes: { y: [W.y + wob(4), W.y] }, duration: 0.3, ease: 'none' }, at + 0.86);
  };
  // 토핑통 흔들기: 흔든 순간에만 조각이 나와 표면에 붙는다
  const SHAKE_HAND = { x: 318, y: 162 };
  const shSh = reduced ? 0 : STEP;
  const spout = { x: SHAKE_HAND.x - 2 + 13, y: SHAKE_HAND.y - 14 + 22.5 };
  const shakerIn = (key, id, at) => {
    tl.set(q(id), { autoAlpha: 1 }, at);
    tl.fromTo(S[key], { x: 430, y: 110, r: 0 }, { x: SHAKE_HAND.x - 2, y: SHAKE_HAND.y - 14, r: 150, duration: 0.45, ease: 'power3.out', immediateRender: false }, at);
    step(at, true, 0.45);
    armTo(SHAKE_HAND, at, 0.45, 'power2.inOut', shSh);
    pawOn(at + 0.35);
    tl.set(S[key], { held: 1 }, at + 0.45);
  };
  const shakerOut = (key, id, at) => {
    tl.set(S[key], { held: 0 }, at);
    pawOff(at);
    tl.to(S[key], { x: 430, y: 90, r: 0, duration: 0.45, ease: 'power2.in' }, at);
    tl.set(q(id), { autoAlpha: 0 }, at + 0.45);
    step(at, false, 0.4);
    armTo(HAND_REST, at, 0.4);
  };
  const shake = (key, at) => {
    tl.to(S[key], { keyframes: { r: [128, 156, 150] }, duration: 0.28, ease: 'none' }, at);
    tl.to(S.arm, { keyframes: { dy: [arm(SHAKE_HAND).dy - wob(8), arm(SHAKE_HAND).dy] }, duration: 0.28, ease: 'none' }, at);
    tl.to(chef, { keyframes: { r: [wob(-1.5), 0] }, duration: 0.28, ease: 'none' }, at);
  };
  const fall = (bit, target, at, onLand) => {
    tl.set(bit, { autoAlpha: 1, x: spout.x, y: spout.y, rotation: 0 }, at);
    tl.to(bit, { x: target.x, y: target.y, rotation: 120, duration: reduced ? 0.05 : 0.32, ease: 'power2.in' }, at);
    tl.set(bit, { autoAlpha: 0 }, at + (reduced ? 0.06 : 0.33));
    onLand(at + (reduced ? 0.06 : 0.33));
  };
  const dropAndRipple = (i, at) => {
    // 실이 가늘어지며 끊기고 → 한 방울이 떨어져 → 작은 파문
    tl.set(S.str, { i, o: reduced ? 0 : 1, w: 3 }, at);
    tl.to(S.str, { w: 0.7, duration: 0.65, ease: 'power1.in' }, at);
    tl.set(S.str, { o: 0 }, at + 0.65);
    tl.fromTo(q('#drip1'), { attr: { cx: DIP_X, cy: 268 }, opacity: 1 }, { attr: { cy: 291 }, duration: 0.26, ease: 'power2.in', immediateRender: false }, at + 0.62);
    tl.set(q('#drip1'), { opacity: 0 }, at + 0.9);
    tl.fromTo(q('#ripple'), { attr: { cx: DIP_X + 1, cy: 292 }, opacity: 0.8, scale: 0.15, transformOrigin: '50% 50%' }, { opacity: 0, scale: 1.2, duration: 0.5, immediateRender: false }, at + 0.88);
  };

  // ── openGift 0–2 : 선물 열림 → 빛 속으로 ──
  tl.to(q('.introLabel, .frameDecor'), { autoAlpha: 0, y: -10, duration: 0.35 }, 0);
  tl.to(chef, { keyframes: { y: [CHEF_POS.open.y - wob(18), CHEF_POS.open.y] }, duration: 0.45, ease: 'power1.out' }, 0);
  badgeAt(tl, q, 'a07c', BADGE_AT.open, 0.05);
  badgeOut(tl, q, 'a07c', 0.95);
  tl.to(S.gift, { y: GIFT.intro.y, duration: 0.2 }, 0);
  tl.to(S.gift, { keyframes: { r: [-4, 4, -2, 0].map(wob) }, duration: 0.45, ease: 'none' }, 0.05);
  // 리본이 살짝 움직이고 → 가방에서 따뜻한 빛
  tl.fromTo(q('#bagBow'), { rotation: 0, transformOrigin: '50% 50%' }, { keyframes: { rotation: [-16, 12, -6, 0].map(wob) }, duration: 0.6, ease: 'none', immediateRender: false }, 0.02);
  tl.fromTo(q('#giftGlow'), { opacity: 0, scale: 0.5, transformOrigin: '50% 100%' }, { opacity: 1, scale: 1.15, duration: 0.8, ease: 'power2.out' }, 0.35);
  tl.to(S.cam, { s: 2.6, px: 180, py: GIFT.intro.y + 54 * GIFT.intro.s, duration: dur(0.9), ease: 'power2.in' }, 0.55);
  tl.to(q('.flash'), { autoAlpha: 1, duration: 0.42, ease: 'power1.in' }, 1.0);
  tl.set(q('#openingPlate, .introLabel, #gift, .giftHit'), { autoAlpha: 0 }, 1.42);
  tl.set(q('#giftGlow'), { opacity: 0 }, 1.42);
  tl.set(q('#bowlBack, #bowlFront, #cupBack, #cupFront'), { autoAlpha: 1 }, 1.42);
  tl.set(q('.chef'), { autoAlpha: 0 }, 1.42);
  tl.set(chef, { ...W, y: W.y + 70 }, 1.42);
  tl.set(S.cam, { s: 1.15, px: 180, py: 210 }, 1.42);
  tl.to(S.cam, { s: 1, duration: dur(0.8), ease: 'power2.out' }, 1.45);
  tl.to(q('.flash'), { autoAlpha: 0, duration: 0.55 }, 1.45);
  tl.to(q('.tintWarm'), { autoAlpha: 1, duration: 1.2 }, 1.45);
  tl.fromTo(q('.signCard'), { autoAlpha: 0, scale: 0.86, y: 10 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.8)' }, 1.5);
  tl.call(() => announce(caps.sign), null, 1.5);

  // ── enterWorkshop 2.0–4.6 : 자신만만 ──
  tl.to(q('.signCard'), { autoAlpha: 0, y: -14, scale: 0.92, duration: 0.4, ease: 'power1.in' }, 2.6);
  tl.fromTo(q('.progress'), { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 2.8);
  tl.to(q('.chef'), { autoAlpha: 1, duration: 0.3 }, 2.2);
  tl.to(chef, { y: W.y, duration: 0.7, ease: 'back.out(1.6)' }, 2.2);
  hop(2.95, 12);
  hop(3.45, 8);
  tl.fromTo(q('.slip'), { autoAlpha: 0, x: -130, rotation: -16 }, { autoAlpha: 1, x: 0, rotation: -4, duration: 0.6, ease: 'back.out(1.4)' }, 2.6);
  cap('enterWorkshop', 2.85);
  stamp(0, 3.0);
  badgeAt(tl, q, 'a02', BADGE_AT.work, 3.1);
  bub('enterWorkshop', 3.15);
  badgeOut(tl, q, 'a02', 4.5);

  // ── meltChocolate 4.6–8.2 : 손이 주걱을 쥐고 원을 그리며 젓는다 ──
  const M = L.meltChocolate;
  cap('meltChocolate', M);
  bub('meltChocolate', M + 0.25);
  badgeAt(tl, q, 'a07a', BADGE_AT.work, M + 0.15);
  stamp(1, M + 0.45);
  tl.set(q('#chunks'), { autoAlpha: 1 }, M + 0.1);
  tl.fromTo(q('.chunk'), { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.in', stagger: 0.07 }, M + 0.2);
  tl.set(S.spat, { a: 0, lift: 44 }, M + 0.1);
  tl.set(q('#liqBack, #liqFront'), { autoAlpha: 1 }, M + 0.7);
  // 준비: 손이 주걱을 잡고 → 수행: 볼 안에서 원운동 → 마무리: 들어 올려 확인
  tl.fromTo(q('#spatula'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, M + 0.5);
  tl.to(S.arm, { follow: 1, dx: 12, dy: -14, duration: 0.4 }, M + 0.5);
  pawOn(M + 0.55);
  tl.to(S.spat, { lift: 0, duration: 0.3, ease: 'power2.out' }, M + 0.6);
  tl.to(chef, { stir: reduced ? 0 : 1, duration: 0.3 }, M + 0.8);
  tl.to(S.spat, { a: Math.PI * 5, duration: 2.3, ease: 'sine.inOut' }, M + 0.85);
  tl.to(q('.chunk'), { scale: 0, transformOrigin: '50% 50%', duration: 0.9, stagger: 0.22, ease: 'power1.in' }, M + 0.95);
  tl.fromTo(S.liq, { y: 298, s: 0.22 }, { y: BOWL.surf, s: 1, duration: 2.0, ease: 'power1.inOut' }, M + 0.85);
  tl.to(q('#steam'), { autoAlpha: 0.85, duration: 0.6 }, M + 1.3);
  sfxText('stir', M + 1.0, 1.0);
  sound('stir', M + 1.0);
  // 작은 실수: 주걱에서 초콜릿 한 방울이 튐 → 깜짝 → 다시 자신만만
  tl.fromTo(q('#drip0'), { attr: { cx: 190, cy: 284 }, opacity: 0 }, { opacity: 1, duration: 0.05, immediateRender: false }, M + 2.0);
  tl.to(q('#drip0'), { keyframes: { attr: [{ cx: 170, cy: 244 }, { cx: 150, cy: 232 }, { cx: 128, cy: 262 }] }, duration: 0.45, ease: 'none' }, M + 2.0);
  tl.to(q('#drip0'), { opacity: 0, duration: 0.1 }, M + 2.45);
  tl.to(chef, { keyframes: { y: [W.y - wob(10), W.y], r: [wob(-4), 0] }, duration: 0.35, ease: 'power1.out' }, M + 2.1);
  sfxText('oops', M + 2.05, 0.55);
  badgeOut(tl, q, 'a07a', M + 2.05);
  badgeAt(tl, q, 'a07d', BADGE_AT.work, M + 2.1);
  badgeOut(tl, q, 'a07d', M + 2.75);
  badgeAt(tl, q, 'a02', BADGE_AT.work, M + 2.8);
  tl.to(q('#swirl'), { opacity: 0.75, duration: 0.3 }, M + 1.5);
  tl.to(q('#swirl'), { attr: { 'stroke-dashoffset': 0 }, duration: 1.2, ease: 'power1.inOut' }, M + 1.5);
  tl.to(q('#swirl'), { opacity: 0, duration: 0.4 }, M + 2.7);
  tl.to(chef, { stir: 0, duration: 0.3 }, M + 3.0);
  tl.to(S.spat, { lift: 46, duration: 0.35, ease: 'power2.out' }, M + 3.1);
  tl.fromTo(q('#gloss'), { opacity: 0, x: -8 }, { opacity: 0.55, x: 14, duration: 0.7, ease: 'power1.out', immediateRender: false }, M + 3.0);
  tl.to(q('#spatula'), { autoAlpha: 0, duration: 0.25 }, M + 3.35);
  pawOff(M + 3.35);
  tl.to(S.arm, { follow: 0, dx: 0, dy: 0, duration: 0.3 }, M + 3.35);
  badgeOut(tl, q, 'a02', M + 3.4);

  // ── dipBiscuit (오리지널) 8.2–13.2 : 가장 자세하게 ──
  const D = L.dipBiscuit;
  cap('dipBiscuit', D);
  bub(null, D);
  tl.to(q('#steam'), { autoAlpha: 0.4, duration: 0.4 }, D);
  take(0, D + 0.1, handFromOrigin({ x: DIP_X, y: BOWL.surf - STICK_LEN - 14 }, 0));
  const up0 = dip(0, D + 0.75, { down: 0.9, hold: 0.4, up: 1.3 });
  sfxText('plop', D + 1.45);
  sound('plop', D + 1.5);
  dropAndRipple(0, up0 + 0.15);
  // 코팅 마무리: 광택이 천천히 자리잡음 → 모몽가가 바라봄
  tl.fromTo(q('#p0 .shine'), { opacity: 1 }, { opacity: 0.7, duration: 0.8, immediateRender: false }, up0 + 1.1);
  tl.to(chef, { r: wob(3), duration: 0.4 }, up0 + 1.3);
  badgeAt(tl, q, 'a07b', BADGE_AT.work, up0 + 1.35);
  bub('dipBiscuit', up0 + 1.35);
  tl.to(chef, { r: 0, duration: 0.4 }, up0 + 2.1);
  badgeOut(tl, q, 'a07b', up0 + 2.3);
  toCup(0, up0 + 2.2, 0);

  // ── almond 13.2–16.6 : 코팅 → 컵에 세움 → 아몬드를 솔솔 ──
  const A = L.almond;
  cap('almond', A);
  bub(null, A);
  take(1, A + 0.05, handFromOrigin({ x: DIP_X, y: BOWL.surf - STICK_LEN - 14 }, 0));
  const upA = dip(1, A + 0.5, { down: 0.45, hold: 0.15, up: 0.55, lean: false });
  toCup(1, upA + 0.45, 1);
  const sA = upA + 1.45;
  shakerIn('shkA', '#shakerA', sA);
  const almPose = cupPose(1);
  const alms = q('#p1 .alm');
  const bitsA = q('.bitA');
  [0, 1, 2].forEach((n) => {
    const t = sA + 0.5 + n * 0.32;
    shake('shkA', t);
    const idx = n === 0 ? [0, 3, 6] : n === 1 ? [1, 4, 7] : [2, 5];
    idx.forEach((ai, m) => {
      const [x, y] = ALMONDS[ai];
      fall(bitsA[(n * 3 + m) % bitsA.length], stickToInner(almPose, x, y), t + 0.05 + m * 0.04, (land) => {
        tl.fromTo(alms[ai], { opacity: 0, scale: 1.4, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.18, immediateRender: false }, land);
      });
    });
  });
  sfxText('sprinkle', sA + 0.5, 1.0);
  sound('sprinkle', sA + 0.5);
  shakerOut('shkA', '#shakerA', sA + 1.55);

  // ── strawberry 16.6–19.8 : 딸기 볼로 바꿔서 분홍 코팅 → (현지가 하트) ──
  const SB = L.strawberry;
  cap('strawberry', SB);
  tl.to(q('#liqBack, #liqFront, #steam'), { autoAlpha: 0, duration: 0.3 }, SB);
  tl.to(q('#bowlBack, #bowlFront'), { x: -60, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, SB);
  tl.fromTo(q('#pinkBack, #pinkFront'), { x: 80, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.45, ease: 'power2.out', immediateRender: false }, SB + 0.3);
  take(2, SB + 0.35, handFromOrigin({ x: DIP_X, y: BOWL.surf - STICK_LEN - 14 }, 0));
  const upS = dip(2, SB + 0.85, { down: 0.5, hold: 0.2, up: 0.6, lean: false });
  toCup(2, upS + 0.65, 2);
  const sS = upS + 1.7;
  shakerIn('shkH', '#shakerH', sS);
  badgeAt(tl, q, 'a07c', BADGE_AT.left, sS + 0.2);
  bub('strawberry', sS + 0.2);
  const TOPPING_AT = sS + 0.55;
  if (onToppingPause) tl.addPause(TOPPING_AT, onToppingPause);
  // 이어서: 남은 하트를 흔들어 붙임 (이미 붙은 것은 그대로)
  const sbPose = cupPose(2);
  const bitsH = q('.bitH');
  [0, 1].forEach((n) => {
    const t = TOPPING_AT + 0.1 + n * 0.34;
    shake('shkH', t);
    [0, 1].forEach((m) => {
      const hi = n * 2 + m;
      const h = BERRY_HEARTS[hi];
      fall(bitsH[hi], stickToInner(sbPose, h.x, h.y), t + 0.05 + m * 0.05, (land) => {
        tl.to(q('#p2 .tp')[hi], { opacity: 1, duration: 0.15 }, land);
      });
    });
  });
  sound('sprinkle', TOPPING_AT + 0.1);
  hop(TOPPING_AT + 0.9, 10);
  shakerOut('shkH', '#shakerH', TOPPING_AT + 0.95);
  badgeOut(tl, q, 'a07c', TOPPING_AT + 1.0);

  // ── nude 19.8–22.2 : 단면 확대 → 속에 초코가 채워짐 → 회전 → 컵으로 ──
  const N = L.nude;
  cap('nude', N);
  bub(null, N);
  take(3, N + 0.05, handFromOrigin({ x: 250, y: 150 }, 0));
  tl.fromTo(q('#nudeZoom'), { autoAlpha: 0, scale: 0.3, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(1.8)', immediateRender: false }, N + 0.35);
  tl.to(q('#nzFill'), { scale: 1, duration: reduced ? 0.01 : 0.7, ease: 'power2.inOut' }, N + 0.75);
  tl.to(q('#nzShine'), { opacity: 0.5, duration: 0.3 }, N + 1.4);
  tl.fromTo(q('#nzRing'), { rotation: 0, transformOrigin: '50% 50%' }, { rotation: wob(40), duration: 0.6, ease: 'power1.inOut', immediateRender: false }, N + 1.2);
  tl.fromTo(q('.chip[data-k="nudeZoom"]'), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.25, immediateRender: false }, N + 1.2);
  tl.to(S.held, { keyframes: { r: [-14, 10, 0].map(wob) }, duration: 0.6, ease: 'none' }, N + 1.2);
  tl.to(q('#nudeZoom, .chip[data-k="nudeZoom"]'), { autoAlpha: 0, scale: 0.4, duration: 0.3, ease: 'power2.in' }, N + 1.85);
  toCup(3, N + 1.4, 3);

  // ── coolChocolate 22.2–23.6 : 컵 속에서 굳는 동안 (푸른빛, 눈송이) ──
  const C = L.coolChocolate;
  cap('coolChocolate', C);
  tl.to(q('#pinkBack, #pinkFront'), { autoAlpha: 0, x: -40, duration: 0.4 }, C);
  badgeAt(tl, q, 'a07d', BADGE_AT.work, C + 0.2);
  tl.to(q('.tintWarm'), { autoAlpha: 0.3, duration: 0.5 }, C);
  tl.to(q('.tintCool'), { autoAlpha: 1, duration: 0.5 }, C);
  tl.to(q('.coolSnow'), { autoAlpha: 1, duration: 0.4 }, C + 0.1);
  tl.to(chef, { keyframes: { r: [-1.5, 1.5, -1, 0].map(wob) }, duration: 1.2, ease: 'none' }, C + 0.2);

  // ── daydream 23.6–25.4 : 모몽가의 멍한 1초 (대사 없음) ──
  const DD = L.daydream;
  cap(null, DD);
  badgeOut(tl, q, 'a07d', DD);
  tl.to(q('.coolSnow'), { autoAlpha: 0, duration: 0.4 }, DD);
  tl.to(q('.tintCool'), { autoAlpha: 0, duration: 0.6 }, DD);
  tl.to(q('.tintWarm'), { autoAlpha: 0.7, duration: 0.6 }, DD);
  tl.to(S.cam, { s: 1.2, px: 236, py: 168, duration: dur(0.6), ease: 'power2.inOut' }, DD);
  tl.to(chef, { r: wob(5), duration: 0.6, ease: 'power2.inOut' }, DD + 0.05);
  tl.fromTo(q('.dreamHeart'), { autoAlpha: 0, y: 0, scale: 0.4 }, { autoAlpha: 1, y: -12, scale: 1, duration: 0.45, ease: 'back.out(2)', immediateRender: false }, DD + 0.6);
  tl.to(q('.dreamHeart'), { y: -40, autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, DD + 1.25);
  tl.to(S.cam, { s: 1, px: 180, py: 210, duration: dur(0.55), ease: 'power2.inOut' }, DD + 1.25);
  tl.to(chef, { r: 0, duration: 0.4 }, DD + 1.3);

  // ── tray 25.4–28.4 : 나무 트레이에 한 줄씩 → 품질 검사 → 완벽! ──
  const TR = L.tray;
  cap('tray', TR);
  tl.fromTo(q('#tray'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out', immediateRender: false }, TR);
  [0, 1, 2, 3].forEach((i) => {
    const t = TR + 0.35 + i * 0.28;
    tl.to(sticks[i], { x: TRAY_X, y: TRAY_ROWS[i], r: -90, s: 1, duration: 0.5, ease: 'power2.inOut' }, t);
    tl.to(q(`#${STICK_IDS[i]} .cshadow`), { opacity: 1, duration: 0.2 }, t + 0.45);
    tl.fromTo(q(`.chip[data-k="${STICK_IDS[i]}"]`), { autoAlpha: 0, x: -6 }, { autoAlpha: 1, x: 0, duration: 0.25, immediateRender: false }, t + 0.45);
  });
  tl.to(q('#cupBack, #cupFront'), { autoAlpha: 0, x: 40, duration: 0.4 }, TR + 1.5);
  tl.to(S.cam, { s: 1.06, px: 180, py: 236, duration: dur(0.6), ease: 'power2.inOut' }, TR + 1.4);
  // 품질 검사: 하나씩 바라보기
  [0, 1, 2, 3].forEach((i) => {
    const t = TR + 1.75 + i * 0.16;
    tl.fromTo(q(`.chip[data-k="${STICK_IDS[i]}"]`), { scale: 1 }, { scale: 1.12, duration: 0.08, yoyo: true, repeat: 1, immediateRender: false }, t);
  });
  tl.to(chef, { keyframes: { r: [wob(-3), wob(3), 0] }, duration: 0.7, ease: 'none' }, TR + 1.75);
  tl.fromTo(q('.perfect'), { autoAlpha: 0, scale: 0.4, rotation: -12 }, { autoAlpha: 1, scale: 1, rotation: -6, duration: 0.3, ease: 'back.out(3)', immediateRender: false }, TR + 2.45);
  tl.to(q('.perfect'), { autoAlpha: 0, duration: 0.3 }, TR + 3.0);
  tl.fromTo(q('.spk')[3], { scale: 0, rotation: 0 }, { scale: 1.2, rotation: 90, duration: 0.3, yoyo: true, repeat: 1, immediateRender: false }, TR + 2.45);
  bub('tray', TR + 2.2);
  hop(TR + 2.5, 10);
  tl.to(S.cam, { s: 1, px: 180, py: 210, duration: dur(0.5) }, TR + 2.75);

  // ── wrapGift 28.4–32.4 : 개별 포장 + 종이 밴드 → 가방 안으로 ──
  const WG = L.wrapGift;
  cap('wrapGift', WG);
  bub(null, WG);
  [0, 1, 2, 3].forEach((i) => {
    const t = WG + 0.05 + i * 0.14;
    tl.fromTo(q(`#${STICK_IDS[i]} .wrap`), { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, t);
    tl.fromTo(q(`#${STICK_IDS[i]} .band`), { opacity: 0, scale: 1.6, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(3)', immediateRender: false }, t + 0.25);
  });
  tl.to(q('.chip'), { autoAlpha: 0, duration: 0.25 }, WG + 0.7);
  badgeAt(tl, q, 'a08', BADGE_AT.work, WG + 0.4);
  bub('wrapGift', WG + 0.5);
  tl.set(q('.inStick'), { autoAlpha: 0, y: -INNER_DROP }, WG);
  tl.set(S.gift, { x: 440, y: GIFT.wrap.y, r: 0, s: GIFT.wrap.s }, WG);
  tl.set(q('#gift'), { autoAlpha: 1 }, WG + 0.5);
  tl.to(S.gift, { x: GIFT.wrap.x, duration: 0.55, ease: 'power3.out' }, WG + 0.55);
  tl.to(q('#tray'), { x: -44, duration: 0.5, ease: 'power2.inOut' }, WG + 0.6);
  tl.to(sticks, { x: '-=44', duration: 0.5, ease: 'power2.inOut' }, WG + 0.6);
  tl.to(q('.stick .cshadow'), { opacity: 0, duration: 0.2 }, WG + 1.0);
  sfxText('rustle', WG + 1.3, 1.2);
  sound('rustle', WG + 1.35);
  sound('rustle', WG + 2.0);
  [0, 1, 2, 3].forEach((si, n) => {
    const t = WG + 1.1 + n * 0.3;
    const slot = SLOTS[STICK_SLOT[si]];
    const g = GIFT.wrap;
    tl.to(sticks[si], { x: g.x + g.s * slot.x, y: g.y + g.s * (SLOT_Y - INNER_DROP), r: 180 + slot.tilt, s: SLOT_SCALE * g.s, duration: 0.5, ease: 'power2.inOut' }, t);
    tl.set(stickEl(si), { autoAlpha: 0 }, t + 0.5);
    tl.set(q(`#in${STICK_SLOT[si]}`), { autoAlpha: 1 }, t + 0.5);
    tl.to(q(`#in${STICK_SLOT[si]}`), { y: 0, duration: 0.28, ease: 'power2.in' }, t + 0.5);
    tl.to(chef, { keyframes: { y: [W.y + wob(6), W.y], r: [wob(-2), 0] }, duration: 0.3, ease: 'none' }, t + 0.5);
  });
  tl.to(q('#tray'), { y: 130, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, WG + 2.6);
  // 마무리: 입구 정리 → 리본 흔들 → 이름표 → 바라보고 뿌듯
  tl.to(S.gift, { keyframes: { y: [GIFT.wrap.y - wob(6), GIFT.wrap.y] }, duration: 0.35, ease: 'none' }, WG + 2.65);
  tl.fromTo(q('#bagBow'), { rotation: 0, transformOrigin: '50% 50%' }, { keyframes: { rotation: [-14, 10, -6, 0].map(wob) }, duration: 0.9, ease: 'none', immediateRender: false }, WG + 2.75);
  stamp(2, WG + 2.8);
  tl.fromTo(q('.tagAnchor'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, WG + 2.95);
  tl.fromTo(q('.tagSwing'), { rotation: wob(-55) }, { rotation: 0, duration: 1.0, ease: 'elastic.out(1, 0.4)', immediateRender: false }, WG + 2.95);
  tl.fromTo(q('.spk')[1], { scale: 0, rotation: 0 }, { scale: 1.3, rotation: 90, duration: 0.3, yoyo: true, repeat: 1, immediateRender: false }, WG + 3.0);
  tl.to(chef, { r: wob(4), duration: 0.35 }, WG + 3.2);
  hop(WG + 3.5, 12);
  tl.to(chef, { r: 0, duration: 0.3 }, WG + 3.6);

  // ── showGift 32.4–34.4 : 가장 뿌듯한 표정 ──
  const SH = L.showGift;
  cap('showGift', SH);
  bub(null, SH);
  badgeOut(tl, q, 'a08', SH);
  tl.to(S.gift, { x: GIFT.show.x, y: GIFT.show.y, s: GIFT.show.s, duration: 0.6, ease: 'power2.inOut' }, SH + 0.05);
  tl.to(S.cam, { s: 1.1, px: 184, py: 214, duration: dur(0.8), ease: 'power2.inOut' }, SH + 0.05);
  tl.to(q('.chef .a04'), { autoAlpha: 0, duration: 0.25 }, SH + 0.35);
  tl.to(q('.chef .a02'), { autoAlpha: 1, duration: 0.25 }, SH + 0.35);
  tl.to(chef, { keyframes: { s: [1.06, 1.02] }, duration: 0.5, ease: 'back.out(2)' }, SH + 0.35);
  bub('showGift', SH + 0.5);
  tl.fromTo(q('.spk'), { scale: 0, rotation: 0 }, { scale: 1, rotation: 90, duration: 0.35, yoyo: true, repeat: 1, stagger: 0.16, immediateRender: false }, SH + 0.7);

  // ── revealSender 34.4–36.4 : 태그 클로즈업, 모몽가는 아래에서 빼꼼 ──
  const R = L.revealSender;
  bub(null, R);
  const tagX = GIFT.show.x + GIFT.show.s * TAG_ATTACH.x;
  const tagY = GIFT.show.y + GIFT.show.s * TAG_ATTACH.y + 30;
  tl.to(S.cam, { s: 1.75, px: tagX - 24, py: tagY + 6, duration: dur(0.8), ease: 'power2.inOut' }, R);
  tl.to(chef, { x: 136, y: 176, s: 0.8, r: -8, duration: 0.8, ease: 'power2.inOut' }, R);
  tl.to(q('.tagSwing'), { keyframes: { rotation: [-10, 8, -4, 0].map(wob) }, duration: 0.6, ease: 'none' }, R + 0.5);
  tl.to(q('.tagInner'), { rotationY: 180, duration: 0.7, ease: 'power2.inOut' }, R + 0.85);
  tl.call(() => announce(caps.tagBack), null, R + 1.3);
  tl.set(q('.slip .secret'), { autoAlpha: 0 }, R + 1.0);
  tl.set(q('.slip .from'), { autoAlpha: 1 }, R + 1.0);
  cap('revealSender', R + 1.3);
  stamp(3, R + 1.3);
  tl.to(chef, { keyframes: { y: [166, 176] }, duration: 0.4, ease: 'none' }, R + 1.4);
  bub('revealSender', R + 1.45);

  // ── deliverGift 36.4–40.8 : 모몽가 배송 출발 → 문고리 → 띵동 ──
  const DL = L.deliverGift;
  bub(null, DL);
  cap('deliverGift', DL + 0.1);
  tl.to(S.cam, { s: 1, px: 180, py: 226, duration: dur(0.7), ease: 'power2.inOut' }, DL);
  tl.to(q('.slip'), { autoAlpha: 0, duration: 0.3 }, DL);
  tl.to(q('.chef .a02'), { autoAlpha: 0, duration: 0.25 }, DL + 0.1);
  tl.to(q('.chef .a04'), { autoAlpha: 1, duration: 0.25 }, DL + 0.1);
  if (reduced) {
    tl.to(q('.flash'), { autoAlpha: 1, duration: 0.35 }, DL + 0.4);
    tl.set(S.strip, { x: -390 }, DL + 0.75);
    tl.set(q('.chef'), { autoAlpha: 0 }, DL + 0.75);
    tl.set(S.gift, { ...GIFT.hang }, DL + 0.75);
    tl.set(q('.tintWarm'), { autoAlpha: 0 }, DL + 0.75);
    tl.set(q('.tintNight'), { autoAlpha: 1 }, DL + 0.75);
    tl.to(q('.flash'), { autoAlpha: 0, duration: 0.35 }, DL + 0.8);
  } else {
    tl.to(chef, { x: RUN.x0, y: RUN.floor - 248, s: RUN.s, r: 0, duration: 0.6, ease: 'power2.inOut' }, DL + 0.1);
    tl.to(S.gift, { x: RUN.x0 + 188 * RUN.s, y: RUN.floor - 248 * RUN.s + 96 * RUN.s, s: RUN.giftS, r: 0, duration: 0.6, ease: 'power2.inOut' }, DL + 0.1);
    tl.set(chef, { floor: RUN.floor }, DL + 0.1);
    tl.to(chef, { shadow: 1, duration: 0.3 }, DL + 0.4);
    tl.set(S.run, { on: 1, p: 0 }, DL + 0.72);
    tl.to(S.run, { p: 1, duration: 1.8, ease: 'none' }, DL + 0.72);
    tl.to(q('.tintWarm'), { autoAlpha: 0, duration: 1.2 }, DL + 0.9);
    tl.to(q('.tintNight'), { autoAlpha: 1, duration: 1.4 }, DL + 1.1);
    tl.set(S.run, { on: 0 }, DL + 2.53);
    tl.set(chef, { x: RUN.x1 + 390, r: 0 }, DL + 2.53);
    tl.set(S.strip, { x: -390 }, DL + 2.53);
    tl.to(S.gift, { x: GIFT.hang.x, s: GIFT.hang.s, r: 0, duration: 0.6, ease: 'power2.out' }, DL + 2.55);
    tl.to(S.gift, { keyframes: { y: [GIFT.hang.y - 30, GIFT.hang.y] }, duration: 0.6, ease: 'power1.inOut' }, DL + 2.55);
    tl.to(chef, { keyframes: { y: [RUN.floor - 248 - 26, RUN.floor - 248], sq: [1.03, 0.92] }, duration: 0.5, ease: 'power1.out' }, DL + 2.55);
    tl.to(chef, { sq: 1, duration: 0.2, ease: 'back.out(3)' }, DL + 3.05);
  }
  stamp(4, DL + 3.1);
  // 가방 → 리본·이름표가 한 박자 늦게 흔들림
  tl.to(S.gift, { keyframes: { r: [10, -7, 4, -2, 0].map(wob) }, duration: 1.5, ease: 'none' }, DL + 3.15);
  tl.to(q('.tagSwing'), { keyframes: { rotation: [-14, 10, -5, 0].map(wob) }, duration: 1.7, ease: 'none' }, DL + 3.3);
  tl.to(q('#bagBow'), { keyframes: { rotation: [-12, 9, -4, 0].map(wob) }, duration: 1.6, ease: 'none' }, DL + 3.28);
  // 모몽가: 가방을 한 번 뒤돌아보고 → 화면 가장자리로 조용히 물러남 → 초인종
  if (!reduced) {
    // 걸고 나서 반 발짝 가방 쪽으로 → 돌아서서 떠나려다 → 한 번 뒤돌아보고 → 화면 가장자리로 물러남
    tl.to(chef, { x: 608, duration: 0.35, ease: 'power1.inOut' }, DL + 3.15);
    tl.to(chef, { keyframes: { y: [RUN.floor - 248 - 8, RUN.floor - 248] }, duration: 0.28, ease: 'none' }, DL + 3.6);
    tl.set(chef, { flip: -1 }, DL + 3.66);
    tl.to(chef, { x: 636, duration: 0.4, ease: 'power1.inOut' }, DL + 3.7);
    tl.to(chef, { keyframes: { y: [RUN.floor - 248 - 8, RUN.floor - 248] }, duration: 0.26, ease: 'none' }, DL + 4.15);
    tl.set(chef, { flip: 1 }, DL + 4.2);
    tl.to(chef, { r: -5, duration: 0.25, ease: 'sine.inOut' }, DL + 4.25);
    tl.to(chef, { r: 0, duration: 0.2, ease: 'sine.inOut' }, DL + 4.6);
    tl.to(chef, { x: RETREAT_X, duration: 0.5, ease: 'power1.in' }, DL + 4.6);
    tl.to(chef, { keyframes: { y: [RUN.floor - 248 - 10, RUN.floor - 248, RUN.floor - 248 - 6, RUN.floor - 248] }, duration: 0.5, ease: 'none' }, DL + 4.6);
  }
  const BELL = DL + 5.0;
  sfxText('bell', BELL, 0.9);
  sound('bell', BELL);
  tl.call(() => { try { navigator.vibrate?.([30, 60, 30]); } catch { /* 진동 미지원 */ } }, null, BELL);
  tl.fromTo(q('.ring'), { scale: 0.6, opacity: 0.9, transformOrigin: '50% 50%' }, { scale: 2.3, opacity: 0, duration: 0.7, stagger: 0.25, immediateRender: false }, BELL + 0.05);
  cap(null, BELL - 0.1);
  tl.to(q('.progress'), { autoAlpha: 0, y: -6, duration: 0.4 }, BELL - 0.1);

  // ── silence : 2초 정적 (현관 조명과 가방만) ──
  const SI = L.silence;
  tl.to(q('.chef'), { autoAlpha: 0, duration: 0.5 }, SI);
  tl.to(chef, { shadow: 0, duration: 0.5 }, SI);
  tl.call(() => announce(caps.silence), null, SI);
  tl.to(S.gift, { keyframes: { r: [1.4, -1.2, 0.8, 0].map(wob) }, duration: 2.0, ease: 'sine.inOut' }, SI);
  tl.to(q('#doorGlow'), { opacity: 0.8, duration: 1.2, ease: 'sine.inOut' }, SI);
  tl.set({}, {}, SI + 2.0);
  return tl;
}

