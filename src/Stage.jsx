import { memo } from 'react';
import { content, BADGES, CHEEKS, STICK_LABELS } from './content.js';
import { SharedDefs, BowlBack, LiquidBack, Chunks, Steam, GiftBag, Pepero, Spatula, LiquidFront, BowlFront, Shaker, Tray, CupBack, CupFront, Paw, NudeZoom, FallBits, SPARKLE, HEART, TRAY_ROWS, TRAY_X, STICK_LEN } from './props.jsx';
import { SceneBg } from './bg.jsx';

export const imgSrc = (k) => `${import.meta.env.BASE_URL}momonga/${k}.webp`;

// 이야기 전체에 이어지는 작은 하트 하나 (서명 → 딸기 토핑 → 태그 → 편지 봉투). 모양·색을 통일한다.
export function MotifHeart({ size = 11 }) {
  return (
    <svg className="motif" viewBox="-11 -10 22 18" width={size} height={size * 0.82} aria-hidden="true">
      <path d={HEART} fill="#D9798E" />
    </svg>
  );
}

// 칭찬할수록 진해지는 볼터치 (원본 그림 위에 얹는 반투명 층. 얼굴을 새로 그리지 않음)
export function Blush() {
  return (
    <span className="blush" aria-hidden="true">
      {CHEEKS.map((c, i) => <i key={i} style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%` }} />)}
    </span>
  );
}

// 무대(world 390×700) 안. .inner 는 공방 좌표계(0~360, 작업대 330)를 (15,140)만큼 옮겨 둔 층
function Stage({ tod, praiseText, onGift, onDoor, phase }) {
  const s = content.orderSlip;
  const A = content.a11y;
  const T = content.sfxText;
  const I = content.intro;
  return (
    <div className="cam">
      <div className="inner">
        <div className="strip">
          <SceneBg tod={tod} />
          <div className="signBoard" aria-hidden="true"><i className="cord l" /><i className="cord r" />{content.workshopSign}</div>
          <div className="slip" aria-hidden="true">
            <i className="tape" />
            <b>{s.title}</b>
            <span>{s.to}</span>
            <span>{s.fromLabel}<span className="who"><span className="secret">{s.secret}</span><span className="from">{s.from}</span></span></span>
          </div>
          <div className="polaroid p03"><i className="tape" /><img src={imgSrc('a03')} alt="" draggable="false" /></div>
          <i className="chefShadow" aria-hidden="true" />
          <div className="chef" aria-hidden="true">
            <img className="pose a04" src={imgSrc('chef-a04')} alt="" draggable="false" />
            <img className="pose a02" src={imgSrc('chef-a02')} alt="" draggable="false" />
          </div>
          <div className="polaroid p06"><i className="tape" /><img src={imgSrc('a06')} alt="" draggable="false" /></div>
          <div className="peekChef" aria-hidden="true"><img src={imgSrc('chef-a04')} alt="" draggable="false" /><Blush /></div>
          <button type="button" className="hit doorHit" aria-label={A.door} tabIndex={phase === 'COMPLETE' ? 0 : -1} onClick={onDoor} />
        </div>

        <div className="introLabel" aria-hidden={phase !== 'INTRO' && phase !== 'LOADING'}>
          <svg className="cloud" viewBox="0 0 330 124" aria-hidden="true">
            <path d="M30 34C24 8 66 0 84 14C98-2 140-2 152 12C166-2 210-2 222 12C238 0 284 4 290 30C320 34 330 66 310 82C324 104 300 124 272 116C258 128 226 126 212 114C196 128 150 128 136 114C120 126 82 126 70 112C42 124 10 108 20 84C0 70 4 40 30 34Z" fill="#FFF9F2" stroke="#E7B8A8" strokeWidth="2.5" strokeDasharray="7 6" />
          </svg>
          <svg className="crossed" viewBox="-30 -36 60 44" aria-hidden="true">
            <g transform="rotate(-28)"><rect x="-4" y="-32" width="8" height="40" rx="4" fill="#EAC690" stroke="#C99B66" /><rect x="-5" y="-32" width="10" height="22" rx="5" fill="#5C3A2D" /></g>
            <g transform="rotate(28)"><rect x="-4" y="-32" width="8" height="40" rx="4" fill="#EAC690" stroke="#C99B66" /><rect x="-5" y="-32" width="10" height="22" rx="5" fill="#E9A0B4" /></g>
          </svg>
          <h1 className="introTitle"><span className="hl">빼빼로</span>{I.title[0].replace('빼빼로', '')}<br />{I.title[1]}</h1>
          <div className="banner"><svg viewBox="0 0 320 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 6H320L306 20L320 34H0L14 20Z" fill="#F6C8D3" stroke="#E7A2B5" strokeWidth="2" /></svg><p className="introSub">{I.sub}</p></div>
        </div>

        <svg className="props" viewBox="0 0 360 440" width="360" height="440" aria-hidden="true">
          <SharedDefs />
          <Tray />
          <BowlBack />
          <g id="pinkBack"><BowlBack id="pinkBackBowl" inner="#F1AFC1" /><ellipse cx="194" cy="288" rx="18" ry="2.4" fill="#FBE6EC" opacity=".7" /></g>
          <LiquidBack />
          <Chunks />
          <Steam />
          <CupBack />
          <GiftBag />
          <Pepero id="p1" cls="stick" variant="almond" coat={0} />
          <Pepero id="p2" cls="stick" variant="strawberry" coat={0} interactive />
          <Pepero id="p3" cls="stick" variant="nude" />
          <Pepero id="p0" cls="stick" variant="original" coat={0} />
          <Spatula />
          <line id="chocoStr" x1="226" x2="227" y1="250" y2="292" stroke="#5A3626" strokeWidth="2.6" strokeLinecap="round" opacity="0" />
          <LiquidFront />
          <BowlFront />
          <g id="pinkFront"><path d="M144 292A70 11 0 0 0 284 292Z" fill="#F1AFC1" /><BowlFront id="pinkFrontBowl" stripe="#F7CDD8" /></g>
          <CupFront />
          <Shaker id="shakerA" kind="almond" />
          <Shaker id="shakerH" kind="heart" />
          <Paw />
          <FallBits />
          <circle id="drip0" cx="135" cy="253" r="3.2" fill="#5A3626" opacity="0" />
          <circle id="drip1" cx="200" cy="232" r="2.8" fill="#5A3626" opacity="0" />
          <ellipse id="ripple" cx="135" cy="291" rx="10" ry="2.4" fill="none" stroke="#8A5A44" strokeWidth="1.2" opacity="0" />
          <NudeZoom />
          <g className="spks" fill="#F6DE86">
            <path className="spk" d={SPARKLE} transform="translate(124 300)" />
            <path className="spk" d={SPARKLE} transform="translate(330 150) scale(1.3)" />
            <path className="spk" d={SPARKLE} transform="translate(196 160) scale(1.1)" />
            <path className="spk" d={SPARKLE} transform="translate(300 300)" />
          </g>
          <g className="rings" fill="none" stroke="#F2B7C5" strokeWidth="2">
            <circle className="ring" cx="285" cy="162" r="12" opacity="0" />
            <circle className="ring" cx="285" cy="162" r="12" opacity="0" />
          </g>
        </svg>

        <div className="tagLayer" aria-hidden="true">
          <div className="tagAnchor">
            <div className="tagSwing">
              <i className="tagString" />
              <div className="tag"><div className="tagInner">
                <div className="tagFace front">{content.tag.front}<MotifHeart /></div>
                <div className="tagFace back">{content.tag.back}</div>
              </div></div>
            </div>
          </div>
        </div>

        <div className="badges" aria-hidden="true">
          {Object.entries(BADGES).map(([k, b]) => (
            <div key={k} className="badge" data-badge={k}>
              <img src={imgSrc(b.src)} alt="" style={{ objectPosition: b.objPos }} draggable="false" />
              <i className="dot d1" /><i className="dot d2" />
            </div>
          ))}
          <p className="sfx" data-k="stir" style={{ left: 250, top: 214 }}>{T.stir}</p>
          <p className="sfx" data-k="plop" style={{ left: 22, top: 236 }}>{T.plop}</p>
          <p className="sfx" data-k="sprinkle" style={{ left: 250, top: 120 }}>{T.sprinkle}</p>
          <p className="sfx" data-k="oops" style={{ left: 252, top: 196 }}>{T.oops}</p>
          <p className="sfx" data-k="rustle" style={{ left: 8, top: 120 }}>{T.rustle}</p>
          <p className="sfx sfxBig" data-k="bell" style={{ left: 266, top: 108 }}>{T.bell}</p>
          {STICK_LABELS.map((f, i) => (
            <p key={f.k} className="chip trayChip" data-k={f.k} style={{ left: TRAY_X + STICK_LEN + 10, top: TRAY_ROWS[i] - 8 }}>{f.label}</p>
          ))}
          <p className="chip" data-k="nudeZoom" style={{ left: 40, top: 222 }}>{content.nudeZoom}</p>
          <p className="perfect" style={{ left: 250, top: 236 }}>{content.perfect}</p>
          <span className="dreamHeart" style={{ left: 186, top: 64 }}>♥</span>
          <div className="coolSnow" style={{ left: 40, top: 230 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <i key={i} className={`fl f${i}`} style={{ left: 18 + i * 34 }}>❄</i>)}
          </div>
          <div className="obubble ob-praise" data-k="praise">{praiseText}</div>
          <div className="obubble ob-door" data-k="door">{content.ending.doorTap}</div>
          {[0, 1].map((i) => (
            <svg key={i} className="ovHeart" viewBox="-11 -10 22 18" width="22" height="18"><path d={HEART} fill="#E992AB" /></svg>
          ))}
        </div>

        <button type="button" className="hit giftHit" aria-label={content.a11y.gift} tabIndex={phase === 'INTRO' ? 0 : -1} onClick={onGift} />
      </div>
    </div>
  );
}

export default memo(Stage);
