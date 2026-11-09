// 무대 소품 SVG. 모몽가는 여기서 그리지 않는다 (받은 이미지만 사용).
import { content } from './content.js';

const C = content.gift.colors;
export const bagPhoto = () => `${import.meta.env.BASE_URL}${content.gift.photo}`;

export const starPath = (r, inner = 0.45) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * inner : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    d += (i ? 'L' : 'M') + (rr * Math.cos(a)).toFixed(2) + ' ' + (rr * Math.sin(a)).toFixed(2);
  }
  return d + 'Z';
};
export const HEART = 'M0 7C-9 1-10-6-5-8C-2.5-9-.8-7.6 0-5.6C.8-7.6 2.5-9 5-8C10-6 9 1 0 7Z';
export const SPARKLE = 'M0-6Q1-1 6 0Q1 1 0 6Q-1 1-6 0Q-1-1 0-6Z';

// ── 빼빼로 4종: 데이터로 구분 ─────────────────────────────
// 로컬 원점 = 손잡이 끝. 아래(+y)로 길이 118, 코팅은 끝(y=118)에서 위로 COAT_MAX 만큼
export const STICK_LEN = 118;
export const COAT_MAX = 54;
export const GRIP = 26; // 손이 잡는 지점(손잡이 끝에서의 거리)
export const PEPEROS = {
  original: {
    id: 'original', name: '오리지널', label: 'ORIGINAL', coatingType: 'outer', coatingLength: COAT_MAX,
    coatingColor: '#5A3626', coatShadow: '#3B2217', coatHighlight: '#8E604A',
    toppingType: null, crossSectionType: null, packagingBandColor: '#7A4A35', bandText: '#F7E9DD',
  },
  almond: {
    id: 'almond', name: '아몬드', label: 'ALMOND', coatingType: 'outer', coatingLength: COAT_MAX,
    coatingColor: '#5A3626', coatShadow: '#3B2217', coatHighlight: '#8E604A',
    toppingType: 'almond', crossSectionType: null, packagingBandColor: '#D9B77E', bandText: '#6B4A2A',
  },
  strawberry: {
    id: 'strawberry', name: '딸기', label: 'STRAWBERRY', coatingType: 'outer', coatingLength: COAT_MAX,
    coatingColor: '#F1AFC1', coatShadow: '#D98DA4', coatHighlight: '#FBE6EC',
    toppingType: 'berry', crossSectionType: null, packagingBandColor: '#C98597', bandText: '#FFF4F6',
  },
  nude: {
    id: 'nude', name: '누드', label: 'NUDE', coatingType: 'inner', coatingLength: 0,
    coatingColor: '#4A2A1C', toppingType: null, crossSectionType: 'chocoCore', packagingBandColor: '#F1E4C8', bandText: '#7A5A3A',
  },
};
// 표시 순서: 오리지널 → 아몬드 → 딸기 → 누드
export const ORDER = ['original', 'almond', 'strawberry', 'nude'];

// 아몬드 조각: [x, y, 크기, 회전, 초콜릿에 살짝 잠김]
export const ALMONDS = [
  [-3.9, 72, 1.0, 20, 1], [3.6, 77, 0.8, -35, 0], [-2.6, 84, 0.7, 70, 1], [3.9, 90, 1.05, 12, 1],
  [-4.1, 96, 0.85, -50, 0], [2.6, 102, 0.75, 40, 1], [-3.2, 108, 0.95, -15, 1], [3.4, 113, 0.7, 60, 0],
];
// 딸기: 작은 하트 4개(현지가 뿌리는 자리)와 딸기 알갱이
export const BERRY_HEARTS = [
  { x: -1.6, y: 76, r: -14, c: '#FFF7F3' }, { x: 1.8, y: 88, r: 16, c: '#D9798E' },
  { x: -1.2, y: 99, r: 8, c: '#FFF7F3' }, { x: 1.4, y: 109, r: -10, c: '#D9798E' },
];
const BERRY_DOTS = [[-2.2, 70], [2.4, 81], [-2.6, 93], [2.6, 96], [-0.4, 104], [2.2, 115], [-2.4, 114]];

function Almond({ a, coat }) {
  const [x, y, k, r, embed] = a;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="alm">
        <g transform={`rotate(${r}) scale(${k})`}>
          <ellipse cx=".7" cy="1.2" rx="2.4" ry="1.3" fill="rgba(30,14,8,.38)" />
          <path d="M-2.3-.5L-.7-1.8L2-1.2L2.4.6L.5 1.7L-1.9 1.2Z" fill="#E9C58E" stroke="#A97B47" strokeWidth=".35" strokeLinejoin="round" />
          <path d="M.5 1.7L2.4.6L2-1.2L1.1.3Z" fill="#C29358" />
          <path d="M-1.5-.7L.2-1.3" stroke="#FFF3DA" strokeWidth=".45" strokeLinecap="round" />
          {embed ? <ellipse cx="-.2" cy="1.5" rx="2.1" ry=".75" fill={coat} /> : null}
        </g>
      </g>
    </g>
  );
}

export function Pepero({ id, variant = 'original', coat, interactive = false, wrapped = false, cls }) {
  const P = PEPEROS[variant];
  const nude = P.coatingType === 'inner';
  const c = coat === undefined ? P.coatingLength : coat;
  const T = STICK_LEN - COAT_MAX; // 코팅이 끝나는 위치(물결 경계)
  const coatPath = `M-4.4 ${T + 1.6}Q-3.3 ${T - 0.6} -2.2 ${T + 1.1}T0 ${T + 0.9}T2.2 ${T + 1.3}T4.4 ${T + 1.1}V${STICK_LEN - 1.5}Q4.4 ${STICK_LEN + 3.4} 0 ${STICK_LEN + 3.5}Q-4.4 ${STICK_LEN + 3.4} -4.4 ${STICK_LEN - 1.5}Z`;
  return (
    <g id={id} className={cls} data-variant={variant}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect id={`${id}-coat`} x="-8" y={STICK_LEN + 4 - c * 1.12} width="16" height={c > 0 ? c * 1.12 + 6 : 0} />
        </clipPath>
      </defs>
      {/* 바닥 접촉 그림자 (트레이 위에서만 보임) */}
      <rect className="cshadow" x="-7" y="6" width="3.4" height={STICK_LEN - 8} rx="1.7" fill="rgba(90,55,30,.22)" />
      {/* 투명 포장 (뒤쪽 면) */}
      <rect className="wrap wrapBack" x="-7.2" y="-7" width="14.4" height={STICK_LEN + 16} rx="2.5" fill="rgba(255,255,255,.16)" opacity={wrapped ? 1 : 0} />
      {nude ? (
        <g>
          <path d={`M-4 3.5Q-4 0 0 0Q4 0 4 3.5V${STICK_LEN}H-4Z`} fill="url(#nudeGrad)" stroke="#B07F48" strokeWidth=".7" />
          <rect x="-2.1" y="5" width=".9" height="96" rx=".45" fill="#FFF6E6" opacity=".45" />
          <g fill="#C99456" opacity=".7"><circle cx="1.6" cy="18" r=".35" /><circle cx="-1" cy="42" r=".3" /><circle cx="1.2" cy="70" r=".35" /><circle cx="-.6" cy="96" r=".3" /></g>
          {/* 끝 단면: 과자 외벽 + 가운데 초콜릿 */}
          <g className="nudeCore" transform={`translate(0 ${STICK_LEN})`}>
            <ellipse rx="4" ry="2" fill="#F2CF9C" stroke="#B07F48" strokeWidth=".6" />
            <ellipse cy=".1" rx="2.35" ry="1.15" fill={P.coatingColor} />
            <ellipse cx="-.7" cy="-.3" rx=".7" ry=".3" fill="#fff" opacity=".35" />
          </g>
        </g>
      ) : (
        <g>
          <rect x="-3.5" y="0" width="7" height={STICK_LEN} rx="3.5" fill="url(#biscGrad)" stroke="#B07F48" strokeWidth=".7" />
          <rect x="-1.9" y="4" width=".9" height="48" rx=".45" fill="#FFF6E6" opacity=".4" />
          <g fill="#C99456" opacity=".75"><circle cx="1.5" cy="12" r=".35" /><circle cx="-.8" cy="27" r=".3" /><circle cx="1.1" cy="44" r=".35" /></g>
          <g clipPath={`url(#${id}-clip)`}>
            <path d={coatPath} fill={P.coatingColor} />
            <rect x="1.7" y={T + 2} width="2.7" height={COAT_MAX} fill={P.coatShadow} opacity=".55" />
            <rect className="shine" x="-3" y={T + 6} width="1.3" height={COAT_MAX - 12} rx=".65" fill={P.coatHighlight} opacity=".7" />
            <ellipse cx="-.6" cy={T + 18} rx="1.6" ry=".8" fill={P.coatHighlight} opacity=".28" />
            <ellipse cx=".8" cy={T + 36} rx="1.3" ry=".7" fill={P.coatHighlight} opacity=".22" />
            {P.toppingType === 'berry' && BERRY_DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r=".55" fill="#E07892" />)}
          </g>
          {P.toppingType === 'almond' && <g className="almonds">{ALMONDS.map((a, i) => <Almond key={i} a={a} coat={P.coatingColor} />)}</g>}
          {P.toppingType === 'berry' && (
            <g className={interactive ? 'toppings live' : 'toppings'}>
              {BERRY_HEARTS.map((t, i) => (
                <g key={i} transform={`translate(${t.x} ${t.y})`}>
                  <g className="tp" data-ty={t.y} data-tx={t.x}><path d={HEART} transform={`rotate(${t.r}) scale(.28)`} fill={t.c} stroke="#C46A80" strokeWidth="1.6" /></g>
                </g>
              ))}
            </g>
          )}
        </g>
      )}
      {/* 투명 포장 (앞면) + 종이 밴드 */}
      <g className="wrap wrapFront" opacity={wrapped ? 1 : 0}>
        <rect x="-7.2" y="-7" width="14.4" height={STICK_LEN + 16} rx="2.5" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.85)" strokeWidth=".7" />
        <path d="M-7.2-5l1.8-2 1.8 2 1.8-2 1.8 2 1.8-2 1.8 2 1.8-2 1.8 2" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth=".6" />
        <path d={`M-7.2 ${STICK_LEN + 7}l1.8 2 1.8-2 1.8 2 1.8-2 1.8 2 1.8-2 1.8 2 1.8-2`} fill="none" stroke="rgba(255,255,255,.9)" strokeWidth=".6" />
        <path d="M4.6 8V58" stroke="#fff" strokeWidth=".9" strokeLinecap="round" opacity=".7" />
        <path d="M4.6 64V70" stroke="#fff" strokeWidth=".9" strokeLinecap="round" opacity=".5" />
      </g>
      <g className="band" opacity={wrapped ? 1 : 0}>
        <rect x="-7.6" y="22" width="15.2" height="9" rx="1" fill={P.packagingBandColor} stroke="rgba(80,50,30,.35)" strokeWidth=".4" />
        <path d="M-6 26.5H6" stroke={P.bandText} strokeWidth=".5" strokeDasharray="1.2 .8" opacity=".8" />
      </g>
    </g>
  );
}

// ── 선물 가방: 앞면은 실물 사진 ─────────────────────────
// 로컬 원점 = 손잡이 꼭짓점(문고리에 걸리는 점). 몸통 y 56~206, 폭 124
export const BAG = { top: 56, h: 150, w: 124 };
export const SLOTS = [
  { x: -30, tilt: -6, v: 'original' },
  { x: -10, tilt: -2, v: 'almond' },
  { x: 10, tilt: 3, v: 'strawberry' },
  { x: 30, tilt: 7, v: 'nude' },
];
export const SLOT_Y = 128;
export const SLOT_SCALE = 0.8;

export function GiftBag({ idPrefix = '' }) {
  const p = idPrefix;
  return (
    <g id={p ? undefined : 'gift'}>
      <path d="M-26 54C-28 24-12 6-1 5M26 54C28 24 12 6 1 5" fill="none" stroke="#33271F" strokeWidth="3.6" strokeLinecap="round" />
      <rect x="-57" y="61" width="124" height="150" rx="4" fill="rgba(60,40,40,.16)" />
      <path d="M-62 56L-56 50H56L62 56Z" fill="#D4BCC9" stroke={C.line} strokeWidth="1.2" strokeLinejoin="round" />
      {!p && (
        <g id="innerSticks">
          {SLOTS.map((s, i) => (
            <g key={i} className="inStick" id={`in${i}`}>
              <g transform={`translate(${s.x} ${SLOT_Y}) rotate(${180 + s.tilt}) scale(${SLOT_SCALE})`}>
                <Pepero id={`inp${i}`} variant={s.v} wrapped />
              </g>
            </g>
          ))}
        </g>
      )}
      <g id={p ? undefined : 'giftFront'}>
        <image href={bagPhoto()} x="-62" y="56" width="124" height="150" preserveAspectRatio="xMidYMid slice" />
        <rect x="-62" y="56" width="124" height="150" fill={`url(#${p || ''}bagLight)`} />
        <rect x="-62" y="56" width="124" height="150" rx="1.5" fill="none" stroke={C.line} strokeWidth="1.3" />
        <ellipse cx="-30" cy="63" rx="2.4" ry="2" fill="#3A2C25" />
        <ellipse cx="30" cy="63" rx="2.4" ry="2" fill="#3A2C25" />
      </g>
      <g fill="none" strokeLinecap="round">
        <path d="M-30 62C-34 28-14 2-2 2" stroke={C.handle} strokeWidth="4.4" />
        <path d="M30 62C34 28 14 2 2 2" stroke={C.handle} strokeWidth="4.4" />
        <path d="M-30 60C-33 30-15 5-3 4" stroke="#6E5A4E" strokeWidth="1" opacity=".7" />
        <path d="M30 60C33 30 15 5 3 4" stroke="#6E5A4E" strokeWidth="1" opacity=".7" />
      </g>
      {/* 손잡이에 묶은 핑크 리본 */}
      <g transform="translate(-27 40)">
        <g id={p ? undefined : 'bagBow'}>
          <path d="M0 0C-9-8-15-2-10 3C-7 6-3 3 0 0ZM0 0C9-8 15-2 10 3C7 6 3 3 0 0Z" fill="#DDA3B1" stroke="#B57585" strokeWidth=".9" />
          <path d="M-1 1L-4 11M1 1L4 10" stroke="#CF8C9C" strokeWidth="2" strokeLinecap="round" />
          <circle r="2.4" fill="#CF8C9C" stroke="#B57585" strokeWidth=".8" />
        </g>
      </g>
      {!p && (
        <g id="giftGlow" opacity="0">
          <path d="M-50 54L-90-90H90L50 54Z" fill="url(#rayGrad)" />
          <ellipse cx="0" cy="54" rx="58" ry="12" fill="url(#glowGrad)" />
        </g>
      )}
    </g>
  );
}

export function SharedDefs({ prefix = '' }) {
  return (
    <defs>
      <linearGradient id={`${prefix}bagLight`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity=".22" />
        <stop offset=".45" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#5a3a3a" stopOpacity=".06" />
      </linearGradient>
      <linearGradient id="biscGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#CF9C5C" />
        <stop offset=".3" stopColor="#F0CF97" />
        <stop offset=".5" stopColor="#F5DAA9" />
        <stop offset=".78" stopColor="#E3B678" />
        <stop offset="1" stopColor="#C38E50" />
      </linearGradient>
      <linearGradient id="nudeGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#C99050" />
        <stop offset=".3" stopColor="#EAC48A" />
        <stop offset=".5" stopColor="#F0D09C" />
        <stop offset=".78" stopColor="#DDAE6E" />
        <stop offset="1" stopColor="#BC8547" />
      </linearGradient>
      <radialGradient id="glowGrad">
        <stop offset="0" stopColor="#FFF7E2" stopOpacity="1" />
        <stop offset="1" stopColor="#FFF7E2" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="rayGrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#FFF4D6" stopOpacity=".9" />
        <stop offset="1" stopColor="#FFF4D6" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="trayWood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#E3BE8F" />
        <stop offset="1" stopColor="#CB9D68" />
      </linearGradient>
      <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity=".55" />
        <stop offset=".25" stopColor="#fff" stopOpacity=".12" />
        <stop offset=".8" stopColor="#fff" stopOpacity=".08" />
        <stop offset="1" stopColor="#fff" stopOpacity=".4" />
      </linearGradient>
      <radialGradient id="balloonGrad" cx=".35" cy=".3" r=".8">
        <stop offset="0" stopColor="#FFDCE4" />
        <stop offset="1" stopColor="#EE9AB0" />
      </radialGradient>
    </defs>
  );
}

// ── 볼 ──────────────────────────────────────────────────
export const BOWL = { cx: 214, rimY: 290, surf: 292 };
const BX = 34; // 볼 그림을 오른쪽으로 옮긴 양 (모몽가 얼굴을 피해 손이 몸 가장자리에 오도록)

export function BowlBack({ id = 'bowlBack', inner = '#EADBCC' }) {
  return (
    <g id={id}><g transform={`translate(${BX} 0)`}>
      <ellipse cx="180" cy="362" rx="74" ry="7" fill="rgba(87,59,50,.13)" />
      <ellipse cx="180" cy="290" rx="82" ry="16" fill="#FFFDF8" stroke="#CDB8A3" strokeWidth="1.5" />
      <ellipse cx="180" cy="291" rx="74" ry="12" fill={inner} />
    </g></g>
  );
}
export function LiquidBack({ id = 'liqBack', color = '#6B4434', swirl = true }) {
  return (
    <g id={id}>
      <ellipse rx="70" ry="11" fill={color} />
      {swirl && <path id="swirl" d="M0 0c4-1 6 2 3 4s-9 1-9-4 6-8 12-6 10 7 6 11-14 5-18 0" transform="scale(1.6 .55)" fill="none" stroke="#4A2D22" strokeWidth="2" strokeLinecap="round" strokeDasharray="150" strokeDashoffset="150" opacity="0" />}
      {swirl && <ellipse id="gloss" cx="-22" cy="-4" rx="16" ry="2.6" fill="#fff" opacity="0" />}
    </g>
  );
}
export function LiquidFront({ id = 'liqFront', color = '#6B4434' }) {
  return <g id={id}><path d="M-70 0A70 11 0 0 0 70 0Z" fill={color} /></g>;
}
export function BowlFront({ id = 'bowlFront', stripe = '#F2B7C5' }) {
  return (
    <g id={id}><g transform={`translate(${BX} 0)`}>
      <path d="M98 290A82 16 0 0 0 262 290L254 340Q180 376 106 340Z" fill="#FFFDF8" stroke="#CDB8A3" strokeWidth="1.5" />
      <path d="M104 314Q180 338 256 314" fill="none" stroke={stripe} strokeWidth="5" strokeLinecap="round" />
    </g></g>
  );
}
export function Chunks() {
  const pos = [[160, 293, 10], [174, 289, -14], [188, 295, 8], [201, 290, 20], [172, 298, -6]];
  return (
    <g id="chunks" transform={`translate(${BX} 0)`}>
      {pos.map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect className="chunk" x="-5" y="-4" width="10" height="8" rx="2" fill="#6B4434" stroke="#4E3024" strokeWidth=".8" transform={`rotate(${r})`} />
        </g>
      ))}
    </g>
  );
}
export function Steam() {
  return (
    <g id="steam" transform={`translate(${BX} 0)`} fill="none" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" opacity="0">
      <path className="steamA" d="M156 276c-7-8 7-12 0-21s6-12 0-20" />
      <path className="steamB" d="M182 272c-7-8 7-12 0-21s6-12 0-20" />
      <path className="steamA s2" d="M206 276c-7-8 7-12 0-21s6-12 0-20" />
    </g>
  );
}
// 주걱: 원점 = 날 끝, 손잡이는 위(-y)로
export function Spatula() {
  return (
    <g id="spatula">
      <rect x="-2.6" y="-104" width="5.2" height="92" rx="2.6" fill="#D9B48A" stroke="#BF9466" />
      <rect x="-7.5" y="-18" width="15" height="24" rx="6.5" fill="#F2B7C5" stroke="#D891A6" />
    </g>
  );
}
// 토핑통: kind = almond | heart. 원점 = 손이 잡는 몸통 가운데
export function Shaker({ id, kind }) {
  return (
    <g id={id}>
      <rect x="-13" y="-18" width="26" height="36" rx="7" fill="#FFF9F2" stroke="#CDB8A3" strokeWidth="1.5" />
      <rect x="-14" y="-26" width="28" height="10" rx="3" fill={kind === 'almond' ? '#E3C48F' : '#F2B7C5'} stroke={kind === 'almond' ? '#B98F5A' : '#D891A6'} />
      <g fill="#8A5A44"><circle cx="-5" cy="-21" r="1.1" /><circle cx="0" cy="-21" r="1.1" /><circle cx="5" cy="-21" r="1.1" /></g>
      {kind === 'almond' ? (
        <g fill="#E9C58E" stroke="#A97B47" strokeWidth=".4">
          <path d="M-7 4l3-2 3 1-1 3-4 0Z" /><path d="M1 8l3-2 3 1-1 3-4 0Z" /><path d="M-3 11l3-2 3 1-1 3-4 0Z" />
        </g>
      ) : (
        <g>
          <path d={HEART} transform="translate(-4 7) scale(.32)" fill="#E0798F" />
          <path d={HEART} transform="translate(5 10) scale(.28)" fill="#FFF7F3" stroke="#E0A0B0" strokeWidth="1.5" />
        </g>
      )}
    </g>
  );
}
// 손 겹침 레이어: 원본 손을 다시 그리지 않고, 도구를 쥔 자리에 작은 흰 손을 얹는다
export function Paw() {
  return (
    <g id="paw">
      <ellipse rx="8.4" ry="7.2" fill="#FFFFFF" stroke="#3A2620" strokeWidth="2.1" />
      <path d="M-2.6 -3.4Q-1 -1 -2.2 1.4M1.6 -3.6Q3 -1 1.8 1.6" fill="none" stroke="#3A2620" strokeWidth="1.3" strokeLinecap="round" />
    </g>
  );
}
// 굳히는 유리컵 (빼빼로를 거꾸로 세워 둔다)
export const CUP = { x: 318, rim: 262, bottom: 328 };
export const CUP_SLOTS = [
  { x: 307, tilt: -7 }, { x: 314, tilt: -2 }, { x: 321, tilt: 3 }, { x: 328, tilt: 8 },
];
export function CupBack() {
  return (
    <g id="cupBack">
      <ellipse cx={CUP.x} cy="332" rx="26" ry="4" fill="rgba(87,59,50,.14)" />
      <path d={`M${CUP.x - 24} ${CUP.rim}L${CUP.x - 20} ${CUP.bottom}H${CUP.x + 20}L${CUP.x + 24} ${CUP.rim}Z`} fill="rgba(220,236,240,.35)" />
      <ellipse cx={CUP.x} cy={CUP.rim} rx="24" ry="4.5" fill="rgba(255,255,255,.35)" stroke="rgba(160,180,190,.8)" strokeWidth="1" />
    </g>
  );
}
export function CupFront() {
  return (
    <g id="cupFront">
      <path d={`M${CUP.x - 24} ${CUP.rim}L${CUP.x - 20} ${CUP.bottom}H${CUP.x + 20}L${CUP.x + 24} ${CUP.rim}`} fill="url(#glassG)" stroke="rgba(150,172,184,.9)" strokeWidth="1.2" strokeLinejoin="round" />
      <path d={`M${CUP.x - 24} ${CUP.rim}A24 4.5 0 0 0 ${CUP.x + 24} ${CUP.rim}`} fill="none" stroke="rgba(150,172,184,.9)" strokeWidth="1.2" />
      <path d={`M${CUP.x - 17} ${CUP.rim + 10}L${CUP.x - 15} ${CUP.bottom - 8}`} stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".7" />
    </g>
  );
}
// 누드 단면 확대 (상징 애니메이션)
export function NudeZoom() {
  return (
    <g id="nudeZoomAnchor" transform="translate(86 160) scale(.86)"><g id="nudeZoom">
      <circle r="62" fill="#FFF9F2" stroke="#E7B8A8" strokeWidth="3" strokeDasharray="6 5" />
      <g id="nzRing">
        <circle r="38" fill="#EAC48A" stroke="#B07F48" strokeWidth="2" />
        <circle r="38" fill="none" stroke="#F5DAA9" strokeWidth="6" opacity=".6" />
        <circle r="22" fill="#F7E7CB" stroke="#C99456" strokeWidth="1.5" />
        <circle id="nzFill" r="21" fill="#4A2A1C" />
        <ellipse id="nzShine" cx="-7" cy="-8" rx="6" ry="3" fill="#fff" opacity="0" />
      </g>
    </g></g>
  );
}
// 나무 트레이 (4줄)
export const TRAY_ROWS = [304, 320, 336, 352];
export const TRAY_X = 108;
export function Tray() {
  return (
    <g id="tray">
      <rect x="40" y="288" width="280" height="84" rx="12" fill="url(#trayWood)" stroke="#AE8055" strokeWidth="1.6" />
      <rect x="50" y="295" width="260" height="70" rx="8" fill="#EFD6B2" stroke="#D2AE84" strokeWidth="1" />
      <path d="M58 302Q140 299 300 304M58 330Q170 327 300 333M58 356Q190 353 300 358" fill="none" stroke="#E3C49B" strokeWidth=".9" />
      <rect x="40" y="320" width="8" height="20" rx="4" fill="#AE8055" />
      <rect x="312" y="320" width="8" height="20" rx="4" fill="#AE8055" />
    </g>
  );
}
// 동그란 풍선 (문고리에 묶임). 원점 = 묶인 점
export function Balloon() {
  return (
    <g id="balloonAnchor" transform="translate(241 207)">
      <g id="balloon">
        <path d="M0 0C6-20-8-40 22-80" fill="none" stroke="#B9A48E" strokeWidth="1.2" />
        <g transform="translate(22 -100)">
          <ellipse rx="17" ry="20" fill="url(#balloonGrad)" stroke="#D88EA2" strokeWidth=".6" />
          <ellipse cx="-6" cy="-8" rx="3" ry="5.5" fill="#fff" opacity=".55" transform="rotate(-25)" />
          <path d="M-2.5 22L2.5 22L0 19Z" fill="#D88EA2" />
        </g>
      </g>
    </g>
  );
}

// 토핑통에서 떨어지는 조각 (흔들 때만 나옴)
export function FallBits() {
  return (
    <g id="fallBits">
      {Array.from({ length: 9 }, (_, i) => (
        <g key={`a${i}`} className="bit bitA"><path d="M-2.3-.5L-.7-1.8L2-1.2L2.4.6L.5 1.7L-1.9 1.2Z" transform={`scale(${0.8 + (i % 3) * 0.12})`} fill="#E9C58E" stroke="#A97B47" strokeWidth=".35" /></g>
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <g key={`h${i}`} className="bit bitH"><path d={HEART} transform="scale(.3)" fill={i % 2 ? '#E0798F' : '#FFF7F3'} stroke="#C46A80" strokeWidth="1.6" /></g>
      ))}
    </g>
  );
}
