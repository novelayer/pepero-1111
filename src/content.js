// 문구·대사·컷 배정·선물 설정·기능 플래그는 전부 여기서만 바꾼다.
export const content = {
  names: { to: '현지', from: '허찌' },
  orderNo: 'HJ-1111',

  intro: {
    title: ['빼빼로 선물이', '도착했어요!'],
    sub: '늦은 밤, 현지 앞으로 달콤한 선물이 도착했대!',
    loading: '선물 포장 중…',
  },

  // 수령 서명
  sign: {
    head: '수령 확인서',
    recipientLabel: '수령인',
    recipient: '현지',
    placeholder: '여기에 현지의 사인을 남겨 주세요.',
    clear: '지우기',
    skip: '서명 없이 받기',
    done: '수령 확인 완료!',
    open: '선물 열어보기',
    revisit: '엔딩 바로 보기',
    canvasLabel: '서명 칸. 손가락, 펜, 마우스로 서명할 수 있어요. 서명이 어려우면 아래 서명 없이 받기 버튼을 누르세요.',
  },

  progress: ['접수', '제작', '포장', '공개', '도착'],
  progressA11y: ['선물 접수 완료', '빼빼로 제작 중', '포장 완료', '보낸 사람 공개', '문 앞 도착'],

  workshopSign: '모몽가의 초코 공방',
  captions: {
    enterWorkshop: '모몽가 셰프 출근!',
    meltChocolate: '초콜릿을 사르르 녹이는 중',
    dipBiscuit: '오리지널: 초콜릿에 퐁당',
    almond: '아몬드: 고소한 조각을 솔솔',
    strawberry: '딸기: 분홍빛 딸기 코팅',
    nude: '누드: 초코는 과자 속에',
    coolChocolate: '컵에 세워서 굳히는 중…',
    tray: '빼빼로 4종 완성!',
    wrapGift: '하나씩 포장해서 가방에 쏙',
    showGift: '짜잔! 선물 완성!',
    revealSender: '허찌가 현지를 위해 준비했대',
    deliverGift: '모몽가 배송 출발!',
  },

  lines: {
    enterWorkshop: '흥, 내가 특별히 만들어주지!',
    enterWorkshopRevisit: '또 보러 왔어? 흥, 마음에 들었구나?',
    meltChocolate: '흐흥~ 잘 봐!',
    dipBiscuit: '오, 꽤 잘됐잖아?',
    strawberry: '이것도 넣어야지!',
    tray: '짜잔! 현지 거 완성!',
    wrapGift: '현지가 좋아하겠지…?',
    showGift: '어때?! 칭찬해!',
    revealSender: '앗, 들켰다…',
  },

  // 만화 의성어 (손글씨 효과음)
  sfxText: { stir: '휘휘~', oops: '앗!', plop: '퐁당!', sprinkle: '솔솔', rustle: '사각사각', bell: '띵동!' },
  perfect: '완벽!',
  nudeZoom: '속까지 초코',

  // 하트 뿌리기 (딸기 빼빼로)
  topping: {
    title: '현지야, 하트도 뿌려 줄래?',
    sub: '화면을 톡톡 눌러 봐!',
    button: '하트 뿌리기',
    thanks: '오! 고마워! 더 뿌려 줘',
  },

  flavors: [
    { k: 'original', name: '오리지널', msg: '처음 그 마음 그대로' },
    { k: 'almond', name: '아몬드', msg: '고소하게, 오래오래' },
    { k: 'strawberry', name: '딸기', msg: '볼 빨개지는 맛' },
    { k: 'nude', name: '누드', msg: '숨김없이 다 보여 주는 마음' },
  ],

  orderSlip: {
    title: 'ORDER #HJ-1111',
    to: '받는 사람: 현지',
    fromLabel: '보내는 사람: ',
    secret: '비밀',
    from: '허찌',
  },

  tag: { front: 'For. 현지', back: 'From. 허찌' }, // 글자 뒤에 같은 작은 하트(상징)가 붙는다

  // 배송 후 엔딩 (대답을 요구하지 않고 자연스럽게 이어짐)
  love: { line: ['현지야,', '나 계속 좋아해주라 ♡'] },

  envelope: { to: '현지에게', postmark: ['11.11', '22:00'], open: '편지 열어보기' },

  // ── 최종 손편지 (보내 준 원고 그대로. 문장·순서·말투 변경 금지) ──
  letter: {
    label: 'A LETTER FOR HYUNJI',
    title: '현지에게',
    greeting: '현지야,',
    // 문단 배열. 문단 안의 배열 항목 = 원고에서 의도해 나눈 줄
    paragraphs: [
      ['오늘은 빼빼로데이라서', '작은 선물을 준비했어.'],
      ['그냥 선물만 건네기에는', '조금 아쉬워서,', '현지가 좋아하는 모몽가랑 함께', '조금 특별하게 전하고 싶었어.'],
      ['이걸 보면서 현지가', '한 번이라도 웃었으면 좋겠다.'],
      ['이 빼빼로 먹으면서 오늘 하루도 기분 좋게 마무리하길 바래.'],
      ['앞으로도 우리 함께 웃을 수 있는 날들이 많았으면 좋겠다.'],
    ],
    closing: '많이 좋아해.',
    date: '11. 11.',
    sign: '허찌가',
    next: '배송 확인하기',
    close: '편지 닫기',
    reread: '편지 다시 보기',
  },

  receipt: {
    title: 'SPECIAL DELIVERY RECEIPT',
    rows: [
      ['수령인', '현지'],
      ['발신인', '허찌'],
      ['배송 기사', '모몽가'],
      ['배송 일시', '2026.11.10 22:00'],
      ['배송 품목', '빼빼로 4종'],
      ['취급 주의', '마음이 녹을 수 있음'],
    ],
    signLabel: '수령인 서명',
    noSign: '현지 수령 확인',
    stamp: '배송 완료',
    ok: '확인했어',
    reopen: '영수증 보기',
  },

  ending: {
    cta: '이제 진짜 문 열어 봐 ♡',
    sub: '현지에게 도착한 허찌의 선물',
    footer: ['Happy Pepero Day · 11.11', 'From. 허찌'],
    bonus: '보너스',
    bonusHint: '작은 보너스가 숨어 있어요',
    flavorTitle: '빼빼로 4종 구경하기',
    praiseBtn: '모몽가 칭찬하기',
    praise: ['흐흥~ 당연하지!', '더 해줘도 돼…', '헤헤, 고마워'],
    praiseSpecial: '흐흥! 역시 내가 귀엽지!',
    praiseGoal: 10,
    replayBtn: '↺ 처음부터 다시 보기',
    doorTap: '진짜 선물은 이 문 바깥 문고리에 걸려 있어',
  },

  sound: { on: '소리 켜짐', off: '소리 꺼짐', labelOn: '효과음 끄기', labelOff: '효과음 켜기' },

  rotateHint: '세로로 보면 더 예뻐요',
  rotateClose: '그냥 볼래요',
  skip: '애니메이션 건너뛰기',
  a11y: {
    gift: '선물 가방 톡 건드려 보기',
    door: '현관문 두드려 보기',
    stage: '모몽가가 현지를 위해 빼빼로를 만드는 애니메이션',
    toppingLayer: '화면을 눌러 하트 뿌리기',
    silence: '현관 앞이 조용해졌어요.',
    letter: '허찌가 쓴 편지',
    receipt: '배송 완료 영수증',
  },
  fallback: {
    title: '띵동! 문고리에 선물이 걸렸어요',
    sub: '허찌가 현지를 위해 준비한 선물이야.',
    cta: '현지야, 문 열고 바깥 문고리를 확인해 봐!',
    closing: '현지야, 나 계속 좋아해주라 ♡',
  },

  // 실물 선물(손잡이 쇼핑백) 색상 — 사진 기준. 앞면은 실제 사진(public/bag/bag-front.webp)을 쓴다.
  gift: {
    photo: 'bag/bag-front.webp',
    colors: {
      top: '#EFE2E9', band: '#D98DA6', strip: '#C98EAC', handle: '#4A3A33', line: '#7A6458',
      starPink: '#E79CB5', starYellow: '#F2E27A',
    },
  },

  features: {
    typingBubbles: true,
    revisitLines: true,
    pokeGift: true,
    soundDefaultOn: false, // 명세: 기본 무음
  },
};

// 모몽가 이미지 (받은 그림만 사용, 새로 그리지 않음)
export const CHEF = { w: 260, h: 258 };
// chef-a04 안의 볼 위치 (이미지 너비·높이 대비 비율) — 칭찬 볼터치 레이어용
export const CHEEKS = [{ x: 0.216, y: 0.547 }, { x: 0.642, y: 0.545 }];

export const BADGES = {
  a07a: { src: 'a07-a', objPos: '45% 60%', alt: '능청스러운 모몽가 표정' },
  a02: { src: 'a02', objPos: '38% 58%', alt: '자신만만한 모몽가 표정' },
  a07c: { src: 'a07-c', objPos: '52% 55%', alt: '신난 모몽가 표정' },
  a07d: { src: 'a07-d', objPos: '50% 60%', alt: '수줍은 모몽가 표정' },
  a08: { src: 'a08', objPos: '48% 50%', alt: '스카프를 쥔 모몽가 표정' },
  a07b: { src: 'a07-b', objPos: '50% 58%', alt: '만족한 모몽가 표정' },
};

export const IMAGES = ['chef-a04', 'chef-a02', 'a02', 'a03', 'a06', 'a07-a', 'a07-b', 'a07-c', 'a07-d', 'a08'];
export const STICK_LABELS = [
  { k: 'p0', label: 'ORIGINAL' }, { k: 'p1', label: 'ALMOND' }, { k: 'p2', label: 'STRAWBERRY' }, { k: 'p3', label: 'NUDE' },
];
