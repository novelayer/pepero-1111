// 효과음: 파일 없이 Web Audio로 직접 합성한다. 기본은 꺼짐이고, 사용자가 소리 버튼을 눌러야 켜진다.
let ctx = null;
let on = false;

export function soundOn() { return on; }

// 반드시 사용자 입력(클릭·탭) 안에서 호출
export function setSound(next) {
  on = next;
  if (!on) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { on = false; return; }
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    // iOS 무음 해제용 아주 짧은 빈 소리
    const b = ctx.createBuffer(1, 1, 22050);
    const s = ctx.createBufferSource();
    s.buffer = b; s.connect(ctx.destination); s.start(0);
  } catch { on = false; }
}

function noise(dur) {
  const n = Math.floor(ctx.sampleRate * dur);
  const b = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = b;
  return src;
}

function tone(freq, t0, dur, { type = 'sine', gain = 0.18, to = null } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur * 0.9);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

function burst(t0, dur, { f = 4000, q = 1.2, gain = 0.12, type = 'bandpass' } = {}) {
  const src = noise(dur);
  const fl = ctx.createBiquadFilter();
  fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(fl).connect(g).connect(ctx.destination);
  src.start(t0); src.stop(t0 + dur + 0.02);
}

// 모든 소리는 작고 부드럽게. 갑자기 큰 소리가 나지 않도록 전체 볼륨(MASTER)을 낮게 둔다.
const MASTER = 0.55;
const v = (g) => g * MASTER;
const SOUNDS = {
  // 휘휘: 숟가락으로 젓는 바람 소리
  stir(t) { for (let i = 0; i < 3; i++) burst(t + i * 0.22, 0.2, { f: 900 + i * 120, q: 0.6, gain: v(0.05), type: 'lowpass' }); },
  // 퐁당: 아래로 떨어지는 동그란 소리
  plop(t) { tone(520, t, 0.22, { to: 160, gain: v(0.2) }); tone(880, t + 0.02, 0.08, { gain: v(0.04) }); },
  // 솔솔: 가벼운 반짝이는 알갱이들
  sprinkle(t) { for (let i = 0; i < 6; i++) burst(t + i * 0.08, 0.05, { f: 5000 + (i % 3) * 800, q: 6, gain: v(0.05) }); },
  // 사각사각: 종이 비비는 소리
  rustle(t) { for (let i = 0; i < 4; i++) burst(t + i * 0.11, 0.08, { f: 2600, q: 0.8, gain: v(0.07) }); },
  // 띵동: 두 음 초인종 (부드럽게 퍼지도록 길게)
  bell(t) {
    tone(988, t, 0.8, { type: 'triangle', gain: v(0.17) }); tone(1976, t, 0.3, { gain: v(0.025) });
    tone(784, t + 0.45, 1.1, { type: 'triangle', gain: v(0.17) }); tone(1568, t + 0.45, 0.4, { gain: v(0.025) });
  },
  // 톡
  pop(t) { tone(1200, t, 0.09, { to: 1600, gain: v(0.07) }); },
  // 칭찬 10번째
  chime(t) { [784, 988, 1175].forEach((f, i) => tone(f, t + i * 0.1, 0.55, { type: 'triangle', gain: v(0.08) })); },
  // 도장: 쾅이 아니라 톡
  stamp(t) { tone(150, t, 0.16, { to: 90, gain: v(0.18) }); burst(t, 0.05, { f: 900, q: 0.7, gain: v(0.05) }); },
};

export function sfx(name) {
  if (!on || !ctx || !SOUNDS[name]) return;
  try { SOUNDS[name](ctx.currentTime + 0.01); } catch { /* 무시 */ }
}
