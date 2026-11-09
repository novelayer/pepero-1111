import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { content } from './content.js';
import { MotifHeart } from './Stage.jsx';
import { sfx, setSound, soundOn } from './sfx.js';

const reducedMQ = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── 서명 경로 (0~1 정규화 좌표) → SVG path ──
export function strokesToPath(strokes, w, h) {
  return strokes.map((s) => s.map((p, i) => `${i ? 'L' : 'M'}${(p[0] * w).toFixed(1)} ${(p[1] * h).toFixed(1)}`).join('')).join('');
}
const SIG_W = 300;
const SIG_H = 86;

// ── 수령 서명 ────────────────────────────────────────────
export function SignCard({ cardRef, onOpen, revisit, onJumpEnd, preset, short }) {
  const S = content.sign;
  const canvasRef = useRef(null);
  const strokes = useRef(preset || []);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(!!preset?.length);
  const [signed, setSigned] = useState(!!preset?.length);
  const doneRef = useRef(null);
  const sigH = short ? 70 : SIG_H;

  const redraw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const scale = rect.width / SIG_W || 1;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const bw = Math.round(SIG_W * scale * dpr);
    const bh = Math.round(sigH * scale * dpr);
    if (cv.width !== bw || cv.height !== bh) { cv.width = bw; cv.height = bh; }
    const c = cv.getContext('2d');
    c.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    c.clearRect(0, 0, SIG_W, sigH);
    c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#4A2F27';
    for (const s of strokes.current) {
      c.beginPath();
      s.forEach((p, i) => { const x = p[0] * SIG_W, y = p[1] * sigH; if (i) c.lineTo(x, y); else c.moveTo(x, y); });
      if (s.length === 1) c.lineTo(s[0][0] * SIG_W + 0.1, s[0][1] * sigH);
      c.stroke();
    }
  }, [sigH]);

  useLayoutEffect(() => {
    redraw();
    const on = () => requestAnimationFrame(redraw);
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    return () => { window.removeEventListener('resize', on); window.removeEventListener('orientationchange', on); };
  }, [redraw]);

  const toLocal = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))];
  };
  const inkLength = () => {
    let len = 0;
    for (const s of strokes.current) for (let i = 1; i < s.length; i++) len += Math.hypot((s[i][0] - s[i - 1][0]) * SIG_W, (s[i][1] - s[i - 1][1]) * sigH);
    return len;
  };
  const down = (e) => {
    if (signed) return;
    e.preventDefault();
    try { canvasRef.current.setPointerCapture(e.pointerId); } catch { /* 무시 */ }
    drawing.current = true;
    strokes.current.push([toLocal(e)]);
    setHasInk(true);
    redraw();
  };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const evs = e.nativeEvent.getCoalescedEvents ? e.nativeEvent.getCoalescedEvents() : [e];
    const s = strokes.current[strokes.current.length - 1];
    for (const ev of (evs.length ? evs : [e])) s.push(toLocal(ev));
    redraw();
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    // 선 하나 그었다고 바로 넘어가지 않는다: 충분히 쓴 뒤 손을 떼면 완료 표시만
    if (inkLength() >= 70) setSigned(true);
  };
  const clear = () => {
    strokes.current = [];
    setHasInk(false);
    setSigned(false);
    redraw();
  };

  useLayoutEffect(() => {
    if (!signed || !doneRef.current) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo('.sgDone .sgHeart', { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(3)' });
      gsap.fromTo('.sgDone .sgDoneText', { autoAlpha: 0, x: -6 }, { autoAlpha: 1, x: 0, duration: 0.3, delay: 0.1 });
      gsap.fromTo('.sgOpen', { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.35, delay: 0.2, ease: 'back.out(2)' });
    }, cardRef.current);
    sfx('pop');
    return () => ctx.revert();
  }, [signed, cardRef]);

  return (
    <div className="signCardUI" ref={cardRef}>
      <div className="sgHead">
        <b>{S.head}</b>
        <span>{S.recipientLabel} <strong>{S.recipient}</strong></span>
        <span className="sgNo">#{content.orderNo}</span>
      </div>
      <div className="sgPad" style={{ height: sigH }}>
        <canvas
          ref={canvasRef} className="sgCanvas" role="img" aria-label={S.canvasLabel}
          style={{ width: SIG_W, height: sigH }}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up}
        />
        {!hasInk && <span className="sgPlaceholder" aria-hidden="true">{S.placeholder}</span>}
        <i className="sgLine" aria-hidden="true" />
        {hasInk && !signed && <button type="button" className="sgClear" onClick={clear}>{S.clear}</button>}
        {signed && (
          <div className="sgDone" ref={doneRef} role="status">
            <span className="sgHeart"><MotifHeart size={22} /></span>
            <span className="sgDoneText">{S.done}</span>
          </div>
        )}
      </div>
      <div className="sgRow">
        {signed ? (
          <>
            <button type="button" className="sgGhost" onClick={clear}>{S.clear}</button>
            <button type="button" className="sgOpen receiveBtn" onClick={() => onOpen(strokes.current.map((s) => s.map((p) => [p[0], p[1] * (sigH / SIG_H)])))}><span>{S.open}</span></button>
          </>
        ) : (
          <>
            <button type="button" className="sgGhost" onClick={() => onOpen(null)}>{S.skip}</button>
            {revisit && <button type="button" className="sgGhost sgJump" onClick={onJumpEnd}>{S.revisit}</button>}
          </>
        )}
      </div>
    </div>
  );
}

// ── 하트 뿌리기 ──────────────────────────────────────────
// 현지가 누른 곳에서 하트가 떨어지고, 일부는 빼빼로에 붙는다. 3초 동안 입력이 없으면 자동 진행.
export function ToppingPrompt({ root, toCanvas, stickPoint, onDone, onTapFx }) {
  const P = content.topping;
  const ref = useRef(null);
  const st = useRef({ taps: 0, auto: null, fin: null, cap: null, done: false, alive: 0, startedAt: 0 });
  const [tapped, setTapped] = useState(false);
  const reduced = useRef(reducedMQ());

  const finish = useCallback(() => {
    const s = st.current;
    if (s.done) return;
    s.done = true;
    clearTimeout(s.auto); clearTimeout(s.fin); clearTimeout(s.cap);
    if (!s.taps) {
      // 아무도 누르지 않아도 하트 하나는 딸기 빼빼로에 살짝 얹힌다 (이야기의 하트 모티프가 끊기지 않게)
      const t = root.querySelector('#p2 .tp');
      if (t) gsap.fromTo(t, { opacity: 0, scale: 0, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)' });
    }
    gsap.to(ref.current, { autoAlpha: 0, y: -8, duration: 0.3, onComplete: () => setTimeout(onDone, s.taps ? 250 : 0) });
  }, [onDone, root]);

  const arm = useCallback(() => {
    const s = st.current;
    clearTimeout(s.auto); clearTimeout(s.fin);
    if (s.done) return;
    if (!s.taps) {
      s.startedAt = performance.now();
      s.auto = setTimeout(finish, 3000);
      gsap.fromTo(ref.current.querySelector('.tpTimer i'), { scaleX: 1 }, { scaleX: 0, duration: 3, ease: 'none', transformOrigin: '0% 50%' });
    } else {
      s.fin = setTimeout(finish, 1500);
    }
  }, [finish]);

  useLayoutEffect(() => {
    const el = ref.current;
    gsap.fromTo(el, { autoAlpha: 0, y: -10, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(2)', onComplete: () => el.querySelector('.tpBtn')?.focus({ preventScroll: true }) });
    arm();
    const vis = () => {
      const s = st.current;
      if (document.hidden) { clearTimeout(s.auto); clearTimeout(s.fin); gsap.killTweensOf(el.querySelector('.tpTimer i')); }
      else if (!s.done) arm();
    };
    document.addEventListener('visibilitychange', vis);
    const s0 = st.current;
    return () => { document.removeEventListener('visibilitychange', vis); clearTimeout(s0.auto); clearTimeout(s0.fin); clearTimeout(s0.cap); };
  }, [arm]);

  const spawn = useCallback((cx, cy) => {
    const s = st.current;
    if (s.done) return;
    const first = !s.taps;
    s.taps += 1;
    if (first) {
      setTapped(true);
      clearTimeout(s.auto);
      gsap.killTweensOf(ref.current.querySelector('.tpTimer i'));
      gsap.to(ref.current.querySelector('.tpTimer'), { autoAlpha: 0, duration: 0.2 });
      s.cap = setTimeout(finish, 6000);
    }
    arm();
    if (s.alive >= 14) return; // 너무 많이 만들지 않는다
    const layer = root.querySelector('.heartRain');
    const h = document.createElement('i');
    h.className = 'rainHeart';
    const hidden = root.querySelectorAll('#p2 .tp');
    let target = null;
    for (const t of hidden) if (parseFloat(getComputedStyle(t).opacity) < 0.5 && !t.dataset.claimed) { target = t; break; }
    // 하트는 빼빼로에 붙을 자리가 있을 때만. 자리가 다 차면 작은 설탕 알갱이만 톡.
    h.textContent = target ? '♥' : '✦';
    h.style.left = `${cx}px`; h.style.top = `${cy}px`;
    h.style.color = target ? '#D9798E' : '#F6DE86';
    if (!target) h.style.fontSize = '12px';
    layer.appendChild(h);
    s.alive += 1;
    const end = () => { h.remove(); s.alive -= 1; };
    sfx('pop');
    onTapFx?.(s.taps);
    if (target) {
      // 빼빼로에 붙는 하트
      target.dataset.claimed = '1';
      const sp = stickPoint(parseFloat(target.dataset.tx), parseFloat(target.dataset.ty));
      gsap.timeline({ onComplete: end })
        .fromTo(h, { scale: 0.3, opacity: 0 }, { scale: 1.2, opacity: 1, duration: 0.18, ease: 'back.out(3)' })
        .to(h, { left: sp.x, top: sp.y, scale: 0.5, duration: reduced.current ? 0.01 : 0.55, ease: 'power2.in' })
        .call(() => gsap.fromTo(target, { opacity: 1, scale: 1.8, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(3)' }))
        .to(h, { opacity: 0, duration: 0.12 });
    } else {
      gsap.timeline({ onComplete: end })
        .fromTo(h, { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.18, ease: 'back.out(3)' })
        .to(h, { top: `+=${reduced.current ? 20 : 150}`, left: `+=${(Math.random() - 0.5) * 40}`, rotation: (Math.random() - 0.5) * 60, duration: 0.9, ease: 'power1.in' }, 0.12)
        .to(h, { opacity: 0, duration: 0.3 }, 0.75);
    }
  }, [root, finish, arm, stickPoint, onTapFx]);

  const onLayer = (e) => {
    if (e.target.closest('.tpCard')) return;
    const p = toCanvas(e.clientX, e.clientY);
    spawn(p.x, p.y);
  };
  const onBtn = (e) => {
    e.stopPropagation();
    const sp = stickPoint(0, 90);
    spawn(sp.x + (Math.random() - 0.5) * 50, sp.y - 110);
  };

  return (
    <div className="tpLayer" onPointerDown={onLayer} aria-label={content.a11y.toppingLayer}>
      <div className="tpCard" ref={ref} role="dialog" aria-live="polite" aria-label={P.title}>
        <p className="tpTitle">{P.title}</p>
        <p className="tpSub">{tapped ? P.thanks : P.sub}</p>
        <button type="button" className="pill tpBtn" onClick={onBtn}>{P.button}</button>
        <span className="tpTimer" aria-hidden="true"><i /></span>
      </div>
    </div>
  );
}

// ── 띵동 이후: 현관 조명이 따뜻해지고 → 고백 한 줄 → 봉투가 아래에서 올라옴 (여는 건 현지가 직접) ──
export function EndingFlow({ root, phase, letterOpen, onOpenLetter, announce }) {
  const V = content.love;
  const EV = content.envelope;
  const ref = useRef(null);
  const opened = useRef(false);
  const [envReady, setEnvReady] = useState(false);
  const reduced = useRef(reducedMQ());

  const openLetter = useCallback(() => {
    if (opened.current) return;
    opened.current = true;
    sfx('rustle');
    onOpenLetter();
  }, [onOpenLetter]);

  useLayoutEffect(() => {
    if (phase !== 'ENDING') return undefined;
    const r = reduced.current;
    const nChars = V.line.join('').length;
    const typeEnd = 0.7 + (r ? 0 : nChars * 0.06) + 0.3;
    const ctx = gsap.context(() => {
      gsap.timeline()
        // 현관 조명이 천천히 따뜻해짐
        .to(root, { '--lp': 0.3, duration: r ? 0.01 : 1.6, ease: 'sine.inOut' }, 0)
        // 고백 문구가 한 글자씩 (너무 느리지 않게)
        .fromTo('.loveLine', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.7)
        .fromTo('.loveLine .ch', { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: r ? 0.3 : 0.22, stagger: r ? 0 : 0.06, ease: 'power1.out' }, 0.7)
        .call(() => announce(V.line.join(' ')), null, 0.8)
        // 약 2초 머문 뒤, 문구는 살짝 위로 물러나고 봉투가 올라옴
        .to('.loveLine', { y: r ? 0 : -18, autoAlpha: 0.0, duration: 0.6, ease: 'power1.inOut' }, typeEnd + 2.0)
        .call(() => setEnvReady(true), null, typeEnd + 2.3);
    }, ref.current);
    return () => ctx.revert();
  }, [phase, root, announce, V.line]);

  useLayoutEffect(() => {
    if (!envReady || opened.current) return undefined;
    const r = reduced.current;
    const ctx = gsap.context(() => {
      gsap.timeline({ onComplete: () => ref.current?.querySelector('.envOpen')?.focus({ preventScroll: true }) })
        .fromTo('.envCard', { autoAlpha: 0, y: r ? 0 : 200 }, { autoAlpha: 1, y: 0, duration: r ? 0.3 : 0.9, ease: 'power3.out' }, 0)
        .fromTo('.envCard .envFlap', { rotationX: 0 }, { rotationX: r ? 0 : -18, duration: 0.5, ease: 'power2.out' }, r ? 0 : 0.7)
        .fromTo('.envOpen', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35 }, r ? 0.2 : 0.95);
      announce(`${EV.to} 편지가 도착했어요. ${EV.open} 버튼을 눌러 보세요.`);
    }, ref.current);
    return () => ctx.revert();
  }, [envReady, announce, EV.to, EV.open]);

  const showEnv = phase === 'ENDING' && envReady && !letterOpen && !opened.current;
  return (
    <div className="loveScene" ref={ref}>
      <p className="loveLine" aria-hidden="true">
        {V.line.map((ln, li) => (
          <span key={li} className="ln">
            {[...ln].map((c, i) => <span key={i} className={c === '♡' ? 'ch hrt' : 'ch'}>{c}</span>)}
          </span>
        ))}
      </p>
      {showEnv && (
        <div className="envCard">
          <Envelope />
          <button type="button" className="envOpen receiveBtn small" onClick={openLetter}><span>{EV.open}</span></button>
        </div>
      )}
    </div>
  );
}

// 크림 아이보리 봉투: 받는 사람 · 우체국 소인 · 하트 봉인 · 살짝 열린 덮개
function Envelope() {
  const EV = content.envelope;
  return (
    <div className="envelope" aria-hidden="true">
      <div className="envFlap" />
      <div className="envBack" />
      <div className="envLetter"><i /><i /><i /></div>
      <svg className="envPocket" viewBox="0 0 260 150" preserveAspectRatio="none">
        <path d="M1 1 L130 82 L259 1 V149 H1 Z" fill="#FBF2E6" stroke="#E7D7C7" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M1 149 L104 66 M259 149 L156 66" fill="none" stroke="#EFE2D3" strokeWidth="1.2" />
      </svg>
      <span className="envSeal"><MotifHeart size={18} /></span>
      <span className="envTo">{EV.to}</span>
      <span className="envPost">
        <svg viewBox="0 0 92 46" width="92" height="46"><circle cx="24" cy="23" r="20" fill="none" stroke="#C99A88" strokeWidth="1.4" strokeDasharray="2.5 2" /><path d="M48 14q6-4 12 0t12 0t12 0M48 23q6-4 12 0t12 0t12 0M48 32q6-4 12 0t12 0t12 0" fill="none" stroke="#D6B3A3" strokeWidth="1.3" /></svg>
        <span className="envPostT"><b>{EV.postmark[0]}</b><b>{EV.postmark[1]}</b></span>
      </span>
    </div>
  );
}

// ── 편지 ────────────────────────────────────────────────
export function LetterModal({ onClose, firstTime }) {
  const L = content.letter;
  const ref = useRef(null);
  const closing = useRef(false);
  const reduced = useRef(reducedMQ());
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const r = reduced.current;
      gsap.timeline({ onComplete: () => ref.current?.querySelector('.paper')?.focus({ preventScroll: true }) })
        .fromTo('.lmBack', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, 0)
        .fromTo('.paper', { y: r ? 0 : 140, scaleY: r ? 1 : 0.35, autoAlpha: 0, transformOrigin: '50% 100%' }, { y: 0, scaleY: 1, autoAlpha: 1, duration: r ? 0.3 : 0.65, ease: 'power3.out' }, 0.1)
        .fromTo('.paper .pl', { autoAlpha: 0, y: r ? 0 : 5 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: r ? 0 : 0.09 }, r ? 0.2 : 0.55)
        .fromTo('.lmNext', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, '-=0.1');
    }, ref.current);
    return () => ctx.revert();
  }, []);
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    gsap.to(ref.current, { autoAlpha: 0, duration: 0.35, onComplete: onClose });
  }, [onClose]);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [close]);
  return (
    <div className="letterModal" ref={ref} role="dialog" aria-modal="true" aria-labelledby="letterTitle">
      <div className="lmBack" />
      <article className="paper" tabIndex={-1} aria-label={content.a11y.letter}>
        <p className="pl lLabel" aria-hidden="true">{L.label}</p>
        <h2 id="letterTitle" className="pl lTitle">{L.title}</h2>
        <div className="lBody">
          <p className="pl">{L.greeting}</p>
          {L.paragraphs.map((para, i) => (
            <p key={i} className="pl">
              {para.map((ln, j) => <span key={j}>{ln}{j < para.length - 1 ? <br /> : null}</span>)}
            </p>
          ))}
          <p className="pl lclose">{L.closing}</p>
        </div>
        <p className="pl lsign"><span className="ldate">{L.date}</span><span className="lname">{L.sign}</span></p>
      </article>
      <button type="button" className="lmNext receiveBtn small" onClick={close}><span>{firstTime ? L.next : L.close}</span></button>
    </div>
  );
}

// ── 배송 완료 영수증 ────────────────────────────────────
function Barcode({ code }) {
  const bars = [];
  let x = 0;
  const seed = [...code].map((c) => c.charCodeAt(0));
  for (let i = 0; i < 46; i++) {
    const w = 1 + ((seed[i % seed.length] * (i + 3)) % 3);
    if (i % 2 === 0) bars.push(<rect key={i} x={x} y="0" width={w} height="26" fill="#3A2C25" />);
    x += w + 0.6;
  }
  return <svg className="barcode" viewBox={`0 0 ${x} 26`} width="150" height="26" aria-hidden="true" preserveAspectRatio="none">{bars}</svg>;
}

export function ReceiptCard({ strokes, onOk, okLabel, firstTime }) {
  const R = content.receipt;
  const ref = useRef(null);
  const reduced = useRef(reducedMQ());
  const leaving = useRef(false);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const r = reduced.current;
      const tl = gsap.timeline({ onComplete: () => ref.current?.querySelector('.rcOk')?.focus({ preventScroll: true }) });
      tl.fromTo('.rcPaper', { yPercent: r ? 0 : 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: r ? 0.3 : 0.6, ease: 'power3.out' }, 0)
        .fromTo('.rcRow', { autoAlpha: 0, x: r ? 0 : -6 }, { autoAlpha: 1, x: 0, duration: 0.25, stagger: r ? 0 : 0.07 }, 0.4)
        .fromTo('.rcSig', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, '-=0.1');
      if (firstTime) {
        tl.fromTo('.rcStamp', { autoAlpha: 0, scale: r ? 1 : 1.8, rotation: -18 }, { autoAlpha: 1, scale: 1, rotation: -10, duration: r ? 0.2 : 0.26, ease: 'power3.in' }, '+=0.25')
          .call(() => sfx('stamp'));
      } else gsap.set('.rcStamp', { autoAlpha: 1, rotation: -10 });
      tl.fromTo('.rcOk', { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3 }, '+=0.2');
    }, ref.current);
    return () => ctx.revert();
  }, [firstTime]);
  const ok = () => {
    if (leaving.current) return;
    leaving.current = true;
    gsap.to(ref.current.querySelector('.rcPaper'), { yPercent: 110, autoAlpha: 0, duration: 0.4, ease: 'power2.in', onComplete: onOk });
    gsap.to(ref.current.querySelector('.rcOk'), { autoAlpha: 0, duration: 0.2 });
  };
  return (
    <div className="receiptWrap" ref={ref} role="dialog" aria-modal="false" aria-label={content.a11y.receipt}>
      <div className="rcPaper">
        <p className="rcTitle">{R.title}</p>
        <p className="rcNo">주문번호 {content.orderNo}</p>
        <dl className="rcRows">
          {R.rows.map(([k, v]) => (
            <div className="rcRow" key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        <div className="rcSig">
          <span className="rcSigLabel">{R.signLabel}</span>
          {strokes && strokes.length ? (
            <svg viewBox={`0 0 ${SIG_W} ${SIG_H}`} width="150" height="43" role="img" aria-label="현지의 서명">
              <path d={strokesToPath(strokes, SIG_W, SIG_H)} fill="none" stroke="#3A2C25" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : <span className="rcNoSig">{R.noSign}</span>}
        </div>
        <Barcode code={content.orderNo} />
        <span className="rcStamp">{R.stamp}</span>
      </div>
      <button type="button" className="rcOk receiveBtn small" onClick={ok}><span>{okLabel || R.ok}</span></button>
    </div>
  );
}

// ── 마지막 현관 화면 ────────────────────────────────────
const FLAVOR_ICON = {
  original: { coat: '#5C3A2D', dots: ['#F2B7C5', '#F6DE86'] },
  almond: { coat: '#5C3A2D', dots: ['#EBCB9C', '#EBCB9C'] },
  strawberry: { coat: '#F29AB2', dots: ['#D9536F', '#fff'] },
  nude: { coat: null, dots: [] },
};
function MiniPepero({ k }) {
  const f = FLAVOR_ICON[k];
  return (
    <svg viewBox="0 0 60 14" width="54" height="13" aria-hidden="true">
      <rect x="1" y="3" width="56" height="8" rx="4" fill={k === 'nude' ? '#E4B57E' : '#EAC690'} stroke="#C99B66" />
      {f.coat && <rect x="24" y="2" width="34" height="10" rx="5" fill={f.coat} />}
      {f.dots.map((c, i) => <circle key={i} cx={32 + i * 12} cy={i % 2 ? 9 : 5} r="1.6" fill={c} />)}
      {f.dots.map((c, i) => <circle key={`b${i}`} cx={38 + i * 12} cy={i % 2 ? 5 : 9} r="1.4" fill={c} />)}
      {k === 'nude' && <g><ellipse cx="56" cy="7" rx="2.6" ry="4" fill="#F0CB98" stroke="#C08B57" strokeWidth=".6" /><ellipse cx="56" cy="7" rx="1.3" ry="2.2" fill="#5C3A2D" /></g>}
    </svg>
  );
}

export function CompletePanel({ onPraise, onLetter, onReceipt, onReplay, bonusOpen, setBonusOpen, again }) {
  const E = content.ending;
  const ref = useRef(null);
  const [sel, setSel] = useState(null);
  const reduced = useRef(reducedMQ());
  useLayoutEffect(() => {
    const r = reduced.current || again;
    const ctx = gsap.context(() => {
      gsap.timeline()
        .fromTo('.endCard', { autoAlpha: 0, y: r ? 0 : -10 }, { autoAlpha: 1, y: 0, duration: r ? 0.25 : 0.6, ease: 'power2.out' }, 0)
        .fromTo('.endPanel > *', { autoAlpha: 0, y: r ? 0 : 8 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: r ? 0 : 0.12 }, r ? 0 : 0.5);
    }, ref.current);
    return () => ctx.revert();
  }, [again]);
  useLayoutEffect(() => {
    if (!bonusOpen) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo('.bonusMenu', { autoAlpha: 0, y: reduced.current ? 0 : 10 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    }, ref.current);
    return () => ctx.revert();
  }, [bonusOpen]);
  const flavor = content.flavors.find((f) => f.k === sel);
  return (
    <div className="completeUI" ref={ref}>
      <div className="endCard" role="status">
        <p className="endCta">{E.cta}</p>
        <p className="endSub">{E.sub}</p>
      </div>
      <div className="endPanel">
        {bonusOpen && (
          <div className="bonusMenu" id="bonusMenu">
            <div className="flavorBox">
              <p className="flavorTitle">{E.flavorTitle}</p>
              <div className="flavorMsg" aria-live="polite">{flavor ? <span key={flavor.k}><b>{flavor.name}</b> {flavor.msg}</span> : null}</div>
              <div className="flavors" role="group" aria-label={E.flavorTitle}>
                {content.flavors.map((f) => (
                  <button key={f.k} type="button" className={`flavor${sel === f.k ? ' on' : ''}`} aria-pressed={sel === f.k}
                    onClick={() => { setSel(sel === f.k ? null : f.k); sfx('pop'); }}>
                    <MiniPepero k={f.k} />
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="endRow">
              <button type="button" className="pill" onClick={onPraise}>{E.praiseBtn}</button>
            </div>
            <div className="endLinks">
              <button type="button" className="linkBtn" onClick={onLetter}>{content.letter.reread}</button>
              <span aria-hidden="true">·</span>
              <button type="button" className="linkBtn" onClick={onReceipt}>{content.receipt.reopen}</button>
              <span aria-hidden="true">·</span>
              <button type="button" className="linkBtn" onClick={onReplay}>{E.replayBtn}</button>
            </div>
          </div>
        )}
        <button type="button" className="bonusToggle" aria-expanded={bonusOpen} aria-controls="bonusMenu" onClick={() => setBonusOpen(!bonusOpen)}>
          <span>{bonusOpen ? `${E.bonus} 접기` : E.bonusHint}</span>
          <svg viewBox="0 0 12 8" width="12" height="8" aria-hidden="true" className={bonusOpen ? 'up' : ''}><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <footer className="endFoot">
          <span>{E.footer[0]}</span>
          <span>{E.footer[1]}</span>
        </footer>
      </div>
    </div>
  );
}

// ── 소리 버튼 ───────────────────────────────────────────
export function SoundToggle() {
  const [on, setOn] = useState(soundOn());
  const S = content.sound;
  return (
    <button type="button" className={`soundBtn${on ? ' on' : ''}`} aria-pressed={on} aria-label={on ? S.labelOn : S.labelOff}
      onClick={() => { const n = !on; setSound(n); setOn(soundOn()); if (n) sfx('pop'); }}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        {on ? <path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          : <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
      </svg>
    </button>
  );
}
