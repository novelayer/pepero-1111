// 배경 그림 (방식 B: SVG). public/bg/*.webp 가 있으면 App이 그림 배경으로 바꿔 끼운다.
// 좌표: 이전 무대 좌표(공방 0~360, 바닥 330)를 그대로 쓰고, 화면 비율에 상관없이 덮도록 위아래로 넉넉히 그린다.
import { HEART, SPARKLE, starPath } from './props.jsx';

export function BgDefs() {
  return (
    <defs>
      <pattern id="gingham" width="26" height="26" patternUnits="userSpaceOnUse">
        <rect width="26" height="26" fill="#FBF0E8" />
        <rect width="13" height="26" fill="#F3B9C6" opacity=".28" />
        <rect width="26" height="13" fill="#F3B9C6" opacity=".28" />
      </pattern>
      <pattern id="cloth" width="30" height="30" patternUnits="userSpaceOnUse">
        <rect width="30" height="30" fill="#FBE3E8" />
        <rect width="15" height="30" fill="#EE9FB3" opacity=".45" />
        <rect width="30" height="15" fill="#EE9FB3" opacity=".45" />
      </pattern>
      <pattern id="wallStripe" width="18" height="18" patternUnits="userSpaceOnUse">
        <rect width="18" height="18" fill="#FAE7E6" />
        <rect width="3" height="18" x="8" fill="#F2B7C5" opacity=".28" />
      </pattern>
      <pattern id="runner" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#FFF6F2" />
        <rect width="8" height="16" fill="#F2B7C5" opacity=".5" />
        <rect width="16" height="8" fill="#F2B7C5" opacity=".5" />
      </pattern>
      <linearGradient id="woodGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#DDBB95" />
        <stop offset="1" stopColor="#C99D75" />
      </linearGradient>
      <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3B4566" />
        <stop offset="1" stopColor="#6B7396" />
      </linearGradient>
      <linearGradient id="daySky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#BFDDE8" />
        <stop offset="1" stopColor="#E6F2F4" />
      </linearGradient>
      <linearGradient id="duskSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F0B096" />
        <stop offset="1" stopColor="#F8E0C6" />
      </linearGradient>
      <radialGradient id="warm">
        <stop offset="0" stopColor="#FFE6B8" stopOpacity=".95" />
        <stop offset="1" stopColor="#FFE6B8" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFE6B8" stopOpacity=".7" />
        <stop offset="1" stopColor="#FFE6B8" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#E8F3F6" stopOpacity=".75" />
        <stop offset=".5" stopColor="#FFFFFF" stopOpacity=".35" />
        <stop offset="1" stopColor="#D6E8EE" stopOpacity=".7" />
      </linearGradient>
    </defs>
  );
}

const sky = (tod) => (tod === 'night' ? 'url(#nightSky)' : tod === 'sunset' ? 'url(#duskSky)' : 'url(#daySky)');

function Snow({ x0, x1, y0, n = 7 }) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * (i + 0.5)) / n + (i % 2 ? 4 : -3);
    out.push(<circle key={i} className={`flake f${i % 6}`} cx={x} cy={y0} r={i % 3 ? 1.7 : 2.4} fill="#fff" />);
  }
  return <g className="snow">{out}</g>;
}

function WindowPane({ x, y, w, h, tod }) {
  return (
    <g>
      <rect x={x - 9} y={y - 9} width={w + 18} height={h + 18} rx="12" fill="#D2A87E" />
      <rect x={x} y={y} width={w} height={h} rx="7" fill={sky(tod)} />
      <path d={`M${x} ${y + h}q${w * 0.25} -${h * 0.22} ${w * 0.5} -${h * 0.08}t${w * 0.5} -${h * 0.06}V${y + h}Z`} fill="#F4F7FA" />
      <path d={`M${x + w * 0.62} ${y + h * 0.9}l14 -38l14 38z`} fill="#E8EEF2" opacity=".9" />
      {tod === 'night' && <circle cx={x + w * 0.28} cy={y + h * 0.22} r="7" fill="#FFF3C4" />}
      {tod !== 'night' && <circle cx={x + w * 0.28} cy={y + h * 0.24} r="8" fill={tod === 'sunset' ? '#FBE3B8' : '#FFF6D0'} />}
      <Snow x0={x + 4} x1={x + w - 4} y0={y + 6} />
      <rect x={x + w / 2 - 2.5} y={y} width="5" height={h} fill="#D2A87E" />
      <rect x={x} y={y + h / 2 - 2.5} width={w} height="5" fill="#D2A87E" />
      <rect x={x - 14} y={y + h + 6} width={w + 28} height="10" rx="4" fill="#C69A70" />
      <path d={`M${x - 12} ${y + h + 7}q${(w + 24) / 2} -9 ${w + 24} 0z`} fill="#FFFFFF" />
    </g>
  );
}

function Bunting({ x0, y, n, w = 30 }) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + i * w;
    const yy = y + Math.sin((i / (n - 1)) * Math.PI) * 12;
    out.push(<path key={i} d={`M${x} ${yy}L${x + w - 7} ${yy + 1}L${x + (w - 7) / 2} ${yy + 19}Z`} fill={i % 2 ? '#FFF9F2' : '#F2B7C5'} stroke="#E2C2B4" strokeWidth=".8" />);
  }
  return <g><path d={`M${x0 - 4} ${y - 2}Q${x0 + (n * w) / 2} ${y + 26} ${x0 + n * w} ${y - 2}`} fill="none" stroke="#C9A58E" strokeWidth="1.3" />{out}</g>;
}

function PeperoBox({ x, y, c, label }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="15" height="28" rx="2" fill={c} stroke="rgba(87,59,50,.35)" strokeWidth=".8" />
      <rect x="2" y="4" width="11" height="6" rx="1" fill="#FFF9F2" opacity=".9" />
      <path d={HEART} transform="translate(7.5 19) scale(.42)" fill={label} />
    </g>
  );
}

function Utensils() {
  return (
    <g>
      <rect x="-12" y="126" width="62" height="4" rx="2" fill="#C69A70" />
      <g transform="translate(4 130)">
        <path d="M0 0V18" stroke="#B9A48E" strokeWidth="2" />
        <path d="M0 18C-9 30-7 46 0 50C7 46 9 30 0 18Z" fill="none" stroke="#C9B8A6" strokeWidth="1.6" />
        <path d="M0 18C-4 30-3 44 0 50M0 18C4 30 3 44 0 50" fill="none" stroke="#C9B8A6" strokeWidth="1.2" />
      </g>
      <g transform="translate(22 130)">
        <path d="M0 0V30" stroke="#D9B48A" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="0" cy="38" rx="8" ry="7" fill="#F2B7C5" stroke="#D891A6" />
      </g>
      <g transform="translate(38 130)">
        <path d="M0 0V26" stroke="#B9A48E" strokeWidth="2" />
        <circle cx="0" cy="33" r="7" fill="none" stroke="#C9B8A6" strokeWidth="2" />
      </g>
    </g>
  );
}

function Dust() {
  const pts = [[150, 80], [176, 120], [204, 96], [168, 160], [214, 150], [190, 196], [140, 136]];
  return (
    <g className="dust" fill="#FFF3D6">
      {pts.map(([x, y], i) => <circle key={i} className={`mote m${i % 4}`} cx={x} cy={y} r={i % 3 ? 1.4 : 2} />)}
    </g>
  );
}

function Workshop({ tod }) {
  return (
    <g id="workshopBg">
      <rect x="-15" y="-400" width="390" height="740" fill="url(#wallStripe)" />
      <rect x="-15" y="236" width="390" height="100" fill="#F3DAD3" />
      <rect x="-15" y="230" width="390" height="8" rx="2" fill="#E9C4B6" />
      <Bunting x0={-12} y={8} n={13} />
      <WindowPane x={256} y={44} w={74} h={86} tod={tod} />
      <Utensils />
      <g>
        <rect x="-15" y="200" width="70" height="7" rx="2" fill="#D2A87E" />
        <PeperoBox x={-6} y={172} c="#D9485E" label="#FFF3F5" />
        <PeperoBox x={10} y={172} c="#8DB76F" label="#FFF3F5" />
        <PeperoBox x={26} y={172} c="#F29AB2" label="#FFFFFF" />
        <PeperoBox x={42} y={172} c="#E9C9A0" label="#D9485E" />
      </g>
      {/* 천장 전등 + 따뜻한 빛 */}
      <path d="M180 -400V-6" stroke="#B9A48E" strokeWidth="1.6" />
      <path d="M164 4Q180 -14 196 4Z" fill="#F2B7C5" stroke="#D891A6" />
      <circle cx="180" cy="40" r="96" fill="url(#warm)" opacity={tod === 'night' ? 0.6 : 0.3} />
      <path d="M150 6L96 250H264L210 6Z" fill="url(#beam)" opacity=".55" />
      <Dust />
      {/* 작업대 + 아래 서랍장 */}
      <rect x="-15" y="330" width="390" height="570" fill="url(#woodGrad)" />
      <rect x="-15" y="330" width="390" height="14" fill="#EBCDA8" />
      <rect x="-15" y="344" width="390" height="28" fill="url(#runner)" />
      <path d="M-15 372H375" stroke="#E7A8B8" strokeWidth="2" />
      <g>
        {[-6, 124, 254].map((x) => (
          <g key={x}>
            <rect x={x} y="384" width="118" height="54" rx="6" fill="#D9B28A" stroke="#BF9466" />
            <rect x={x + 49} y="406" width="20" height="6" rx="3" fill="#F2B7C5" stroke="#D891A6" strokeWidth=".8" />
            <rect x={x} y="446" width="118" height="140" rx="6" fill="#D9B28A" stroke="#BF9466" />
            <rect x={x + 10} y="456" width="98" height="120" rx="4" fill="none" stroke="#C99E74" />
            <circle cx={x + 100} cy="516" r="4" fill="#F2B7C5" stroke="#D891A6" strokeWidth=".8" />
          </g>
        ))}
        <rect x="-15" y="594" width="390" height="306" fill="#F4E4E8" />
        <path d="M-15 594H375" stroke="#E3C3CC" strokeWidth="2" />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-15 + i * 48} 594V900`} stroke="#E9D2D9" strokeWidth="1.2" />)}
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M-15 ${630 + i * 48}H375`} stroke="#E9D2D9" strokeWidth="1.2" />)}
      </g>
    </g>
  );
}

function Doorway({ tod }) {
  const night = tod === 'night';
  return (
    <g id="doorwayBg" transform="translate(390 0)">
      <rect x="-15" y="-400" width="390" height="784" fill="#F1E6D8" />
      <rect x="-15" y="300" width="390" height="84" fill="#EADBC9" />
      <rect x="-15" y="296" width="390" height="6" fill="#DCC8B2" />
      <rect x="-15" y="382" width="390" height="520" fill="#E3CFB7" />
      <path d="M-15 382H375" stroke="#D2BBA0" strokeWidth="2" />
      <path d="M40 382L10 900M120 382L110 900M240 382L250 900M320 382L350 900" stroke="#D6C0A6" strokeWidth="1" opacity=".7" />
      <g>
        <circle cx="180" cy="26" r={night ? 70 : 44} fill="url(#warm)" opacity={night ? 0.9 : 0.35} />
        <rect x="171" y="12" width="18" height="18" rx="6" fill="#FFF3D6" stroke="#D8C2AE" />
      </g>
      <g>
        <rect x="16" y="70" width="62" height="96" rx="31" fill="#C9AE92" />
        <rect x="22" y="76" width="50" height="84" rx="25" fill="url(#nightSky)" />
        <circle cx="36" cy="98" r="5" fill="#FFF3C4" />
        <g fill="#FFF6D8">
          <path className="tw tw1" d={SPARKLE} transform="translate(56 92) scale(.7)" />
          <path className="tw tw2" d={SPARKLE} transform="translate(48 122) scale(.55)" />
          <path className="tw tw3" d={SPARKLE} transform="translate(32 138) scale(.6)" />
          <circle className="tw tw2" cx="62" cy="112" r="1.2" />
          <circle className="tw tw1" cx="40" cy="116" r="1" />
        </g>
        <rect x="45" y="76" width="4" height="84" fill="#C9AE92" />
        <rect x="10" y="164" width="74" height="8" rx="4" fill="#BFA083" />
      </g>
      <rect x="104" y="54" width="152" height="330" rx="4" fill="#D6C4AF" />
      <rect id="doorPanel" x="112" y="62" width="136" height="320" rx="3" fill="#EFE5D8" stroke="#CDB9A2" strokeWidth="1.5" />
      <path id="doorSpill" d="M248 64L272 52V392L248 380Z" fill="#FFE9C2" opacity="0" />
      <rect x="130" y="90" width="100" height="100" rx="4" fill="none" stroke="#DDCCB8" strokeWidth="1.5" />
      <rect x="130" y="236" width="100" height="120" rx="4" fill="none" stroke="#DDCCB8" strokeWidth="1.5" />
      <circle cx="180" cy="122" r="20" fill="none" stroke="#9DBF9A" strokeWidth="7" />
      <circle cx="168" cy="110" r="2.4" fill="#E58A9C" /><circle cx="194" cy="132" r="2.4" fill="#E58A9C" />
      <path d="M174 140L180 146L186 140L180 136Z" fill="#F2B7C5" />
      <rect x="224" y="140" width="16" height="44" rx="3" fill="#8C7B6B" />
      <g fill="#B8A897">
        <circle cx="229" cy="150" r="1.4" /><circle cx="235" cy="150" r="1.4" />
        <circle cx="229" cy="158" r="1.4" /><circle cx="235" cy="158" r="1.4" />
        <circle cx="229" cy="166" r="1.4" /><circle cx="235" cy="166" r="1.4" />
      </g>
      <rect x="206" y="203" width="36" height="7" rx="3.5" fill="#A88F77" />
      <circle cx="238" cy="206.5" r="7" fill="#B9A48E" stroke="#9A8470" />
      <rect x="278" y="152" width="14" height="20" rx="4" fill="#FFF9F2" stroke="#CDB9A2" />
      <circle cx="285" cy="162" r="3.2" fill="#F2B7C5" />
      <rect x="118" y="384" width="124" height="13" rx="5" fill="#C9A99A" />
      <path d="M124 390.5H236" stroke="#E6CFC4" strokeWidth="1.4" strokeDasharray="3 3" />
      {/* 밤 10시를 가리키는 작은 벽시계 */}
      <g transform="translate(310 92)">
        <circle r="15" fill="#FFF9F2" stroke="#BFA083" strokeWidth="2.4" />
        <g stroke="#CDB9A2" strokeWidth="1.2">
          <path d="M0-12V-10M12 0H10M0 12V10M-12 0H-10" />
        </g>
        <path d="M0 0L-5.6-3.2" stroke="#6E5243" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M0 0V-9.5" stroke="#6E5243" strokeWidth="1.4" strokeLinecap="round" />
        <circle r="1.6" fill="#AD7564" />
      </g>
      <rect id="doorGlow" x="116" y="378" width="128" height="5" rx="2" fill="#FFE3B3" opacity="0" />
    </g>
  );
}

function Jar() {
  const sticks = [[2, -12, '#5C3A2D'], [16, -4, '#E9A0B4'], [30, 6, '#5C3A2D'], [44, 12, '#F6E7D0']];
  return (
    <g transform="translate(-6 0)">
      {sticks.map(([x, r, c], i) => (
        <g key={i} transform={`translate(${x + 4} 300) rotate(${r})`}>
          <rect x="-4" y="-150" width="8" height="150" rx="4" fill="#EAC690" stroke="#C99B66" />
          <rect x="-5" y="-150" width="10" height="70" rx="5" fill={c} />
          <path d={HEART} transform="translate(0 -130) scale(.3)" fill={c === '#5C3A2D' ? '#F2B7C5' : '#B7697F'} />
          <path d={HEART} transform="translate(1 -104) scale(.26)" fill={c === '#5C3A2D' ? '#F6DE86' : '#fff'} />
        </g>
      ))}
      <rect x="-8" y="212" width="68" height="122" rx="14" fill="url(#glassGrad)" stroke="#B5CBD2" strokeWidth="2" />
      <rect x="-4" y="216" width="8" height="100" rx="4" fill="#fff" opacity=".55" />
      <path d="M-8 230H60" stroke="#F2B7C5" strokeWidth="9" />
      <path d="M26 230c-10-12-24-10-20 0s14 4 20 0c6 4 24 10 20 0s-10-12-20 0z" fill="#F2B7C5" stroke="#D88CA2" />
    </g>
  );
}

function Mug() {
  return (
    <g transform="translate(300 262)">
      <path className="steam" d="M22 -36c-8-10 8-14 0-26M40 -40c-8-10 8-14 0-26" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity=".85" />
      <rect x="0" y="0" width="64" height="66" rx="12" fill="#FFF9F2" stroke="#D8C2AE" strokeWidth="2" />
      <path d="M62 16c18 0 18 30 0 30" fill="none" stroke="#D8C2AE" strokeWidth="7" />
      <ellipse cx="32" cy="2" rx="30" ry="7" fill="#7A4E3A" />
      <path d="M6 0c0-14 12-18 16-10 4-10 18-8 18 0 8-6 18 0 16 10z" fill="#FFFFFF" stroke="#EFE3DA" />
      <circle cx="30" cy="-10" r="2" fill="#8A5A44" /><circle cx="40" cy="-6" r="1.6" fill="#8A5A44" />
      <path d={HEART} transform="translate(32 38) scale(.9)" fill="#F2B7C5" />
    </g>
  );
}

function OpeningPlate({ tod }) {
  return (
    <g id="openingPlate">
      <rect x="-15" y="-400" width="390" height="1300" fill="url(#gingham)" />
      <WindowPane x={300} y={-60} w={92} h={150} tod={tod} />
      <rect x="-15" y="330" width="390" height="570" fill="url(#cloth)" />
      <g fill="#FFFFFF">
        {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={-15 + i * 18} cy="331" r="9" />)}
      </g>
      <rect x="-15" y="322" width="390" height="10" fill="#FFFFFF" />
      <Jar />
      <Mug />
      <ellipse cx="180" cy="390" rx="92" ry="10" fill="rgba(122,80,70,.16)" />
      <g fill="#F6DE86">
        <path className="tw tw1" d={SPARKLE} transform="translate(80 120) scale(1.5)" />
        <path className="tw tw2" d={SPARKLE} transform="translate(282 150) scale(1.2)" />
        <path className="tw tw3" d={starPath(5)} transform="translate(60 300)" />
        <path className="tw tw1" d={SPARKLE} transform="translate(300 230) scale(1.1)" fill="#F2B7C5" />
      </g>
    </g>
  );
}

export function SceneBg({ tod }) {
  return (
    <svg className="bg" viewBox="-15 -400 780 1300" width="780" height="1300" aria-hidden="true">
      <BgDefs />
      <Workshop tod={tod} />
      <Doorway tod={tod} />
      <OpeningPlate tod={tod} />
    </svg>
  );
}

// 오프닝 화면 테두리 장식 (화면 위·아래에 붙음)
export function Garland() {
  return (
    <svg className="garland" viewBox="0 0 390 96" width="390" height="96" aria-hidden="true">
      <path d="M-10 4Q195 64 400 4" fill="none" stroke="#E7A2B5" strokeWidth="20" strokeLinecap="round" />
      <path d="M-10 4Q195 64 400 4" fill="none" stroke="#F4C1CE" strokeWidth="13" strokeLinecap="round" />
      <path d="M-10 0Q195 58 400 0" fill="none" stroke="#FBDDE5" strokeWidth="3" opacity=".8" />
      <g className="bowSway" transform="translate(195 34) scale(.82)">
        <path d="M-4 4L-22 40L-12 38L-8 46L2 8Z" fill="#EFA9BB" stroke="#D88CA2" strokeWidth="1.5" />
        <path d="M4 4L22 40L12 38L8 46L-2 8Z" fill="#EFA9BB" stroke="#D88CA2" strokeWidth="1.5" />
        <path d="M-3-2C-18-26-48-26-44-4C-42 10-20 10-3 3Z" fill="#F4C1CE" stroke="#D88CA2" strokeWidth="1.5" />
        <path d="M3-2C18-26 48-26 44-4C42 10 20 10 3 3Z" fill="#F4C1CE" stroke="#D88CA2" strokeWidth="1.5" />
        <rect x="-8" y="-8" width="16" height="16" rx="6" fill="#EFA9BB" stroke="#D88CA2" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
export function BerryBranch() {
  const berries = [[40, 36], [52, 46], [30, 54], [64, 30], [76, 52], [18, 40], [58, 64]];
  return (
    <svg className="berries" viewBox="0 0 110 100" width="110" height="100" aria-hidden="true">
      <path d="M0 20C30 30 60 40 100 70M30 30C40 50 44 62 40 80M60 42C70 30 80 26 92 26" fill="none" stroke="#8C6A55" strokeWidth="4" strokeLinecap="round" />
      <path d="M0 16C30 26 60 36 100 66" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity=".9" />
      {berries.map(([x, y], i) => (
        <g key={i}><circle cx={x} cy={y} r="7" fill="#D9485E" /><circle cx={x - 2} cy={y - 2} r="2" fill="#fff" opacity=".7" /></g>
      ))}
    </svg>
  );
}
export function Scarf() {
  return (
    <svg className="scarf" viewBox="0 0 120 110" width="120" height="110" aria-hidden="true">
      <path d="M-10 40C30 20 70 30 100 60L90 120H-10Z" fill="#FBF3E8" stroke="#E3D3C2" strokeWidth="2" />
      <path d="M0 52C30 36 60 44 86 66M-4 70C30 54 58 62 80 84M-6 88C26 74 52 80 72 100" fill="none" stroke="#EAD9C6" strokeWidth="4" strokeDasharray="6 5" />
      <path d={HEART} transform="translate(46 74) scale(1.3)" fill="#E07F95" />
      <path d="M86 66l10 18M80 74l12 16M74 82l10 18" stroke="#E3D3C2" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
