// 🧠 청춘 두뇌 건강 테스트 - 게임 로직 (Vanilla JS)

// Kakao SDK 초기화 (안전장치 포함)
const KAKAO_APP_KEY = '5b6f385c9a7d32c589d38096f2a89c44'; // 임시 기본 키 설정 (배포 시 교체 가능)
try {
  if (typeof Kakao !== 'undefined') {
    Kakao.init(KAKAO_APP_KEY);
    console.log("Kakao SDK Initialized successfully.");
  }
} catch (e) {
  console.warn("Kakao SDK initialization failed, fallback to Clipboard sharing:", e);
}

// 게임 상태 및 데이터 정의
const gameConfig = {
  maxStage: 3,
  baseIq: 150,
  baseBrainAge: 20,
  // 스테이지별 점진적 난이도 상세 설정
  stages: {
    1: {
      timeLimit: 60,       // 제한 시간 60초 (넉넉함)
      agingInterval: 2.0,  // 2.0초마다 뇌 연령 +1세 노화 (느림)
      hitRadius: 10.0      // 정답 클릭 허용 반경 10% (대충 클릭해도 정답)
    },
    2: {
      timeLimit: 50,       // 제한 시간 50초 (보통)
      agingInterval: 1.2,  // 1.2초마다 뇌 연령 +1세 노화 (보통)
      hitRadius: 8.0       // 정답 클릭 허용 반경 8% (표준)
    },
    3: {
      timeLimit: 40,       // 제한 시간 40초 (긴박함)
      agingInterval: 0.8,  // 0.8초마다 뇌 연령 +1세 노화 (빠름)
      hitRadius: 6.0       // 정답 클릭 허용 반경 6% (정교한 터치 필요)
    }
  }
};

let gameState = 'START'; // START, PLAYING, GAME_OVER
let currentStage = 1;
let brainAge = gameConfig.baseBrainAge;
let iq = gameConfig.baseIq;
let stageElapsedTime = 0; // 현재 스테이지에서 흘러간 시간 (초)
let foundCount = 0;
let activeDifferences = []; // 현재 스테이지의 틀린 부분 목록
let shuffledBackgrounds = []; // 게임마다 셔플될 배경 이미지 순서 ([1, 2, 3]이 섞임)
let agingTimerAccumulator = 0; // 스테이지 내 소수점 시간 연령 가중 축적기

// 9가지 고대비 컬러풀 SVG 아이콘 세트 (로딩 제로, 모바일 최적화)
const SVG_ICONS = {
  flower: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="18" fill="#FFD166"/><circle cx="50" cy="20" r="15" fill="#FF6B6B"/><circle cx="50" cy="80" r="15" fill="#FF6B6B"/><circle cx="20" cy="50" r="15" fill="#FF6B6B"/><circle cx="80" cy="50" r="15" fill="#FF6B6B"/></svg>`,
  bird: `<svg viewBox="0 0 100 100"><path d="M20,60 Q35,30 65,30 Q80,30 85,45 Q70,55 55,55 Q40,55 20,60" fill="#4EA8DE"/><path d="M65,30 Q75,20 85,25 Q80,35 75,40" fill="#FFD166"/><circle cx="68" cy="38" r="4" fill="#000"/></svg>`,
  butterfly: `<svg viewBox="0 0 100 100"><path d="M50,50 Q30,20 20,40 Q20,60 50,50 Q30,80 25,70 Q30,60 50,50" fill="#FF70A6"/><path d="M50,50 Q70,20 80,40 Q80,60 50,50 Q70,80 75,70 Q70,60 50,50" fill="#FF70A6"/><rect x="48" y="25" width="4" height="50" rx="2" fill="#3D348B"/></svg>`,
  cloud: `<svg viewBox="0 0 100 100"><path d="M30,65 A15,15 0 0,1 35,35 A20,20 0 0,1 70,35 A15,15 0 0,1 75,65 Z" fill="#48CAE4"/></svg>`,
  star: `<svg viewBox="0 0 100 100"><polygon points="50,10 63,38 93,38 70,57 78,87 50,70 22,87 30,57 7,38 37,38" fill="#FFD166" stroke="#FFB703" stroke-width="3"/></svg>`,
  heart: `<svg viewBox="0 0 100 100"><path d="M50,30 C50,10 10,10 10,40 C10,70 50,90 50,90 C50,90 90,70 90,40 C90,10 50,10 50,30 Z" fill="#EF476F"/></svg>`,
  ladybug: `<svg viewBox="0 0 100 100"><circle cx="50" cy="55" r="30" fill="#FF3F3F"/><path d="M50,25 L50,85" stroke="#000" stroke-width="4"/><circle cx="50" cy="22" r="10" fill="#000"/><circle cx="38" cy="45" r="5" fill="#000"/><circle cx="62" cy="45" r="5" fill="#000"/><circle cx="34" cy="65" r="5" fill="#000"/><circle cx="66" cy="65" r="5" fill="#000"/></svg>`,
  sun: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="22" fill="#FF7A00"/><path d="M50,10 L50,22 M50,78 L50,90 M10,50 L22,50 M78,50 L90,50 M22,22 L31,31 M69,69 L78,78 M22,78 L31,69 M69,31 L78,22" stroke="#FF7A00" stroke-width="8" stroke-linecap="round"/></svg>`,
  apple: `<svg viewBox="0 0 100 100"><path d="M50,80 C30,80 20,65 20,45 C20,25 35,20 50,25 C65,20 80,25 80,45 C80,65 70,80 50,80 Z" fill="#E63946"/><path d="M50,25 Q55,10 65,8" stroke="#4A3C31" stroke-width="5" fill="none"/></svg>`
};

// 각 배경 일러스트별 고유의 5가지 어울리는 배치 슬롯 좌표
const STAGE_SLOTS = {
  1: [
    { x: 28, y: 18, name: "한옥마루 위 별" },
    { x: 45, y: 48, name: "마당 바닥 꽃" },
    { x: 78, y: 22, name: "감나무 사이 나비" },
    { x: 14, y: 74, name: "왼쪽 하단 돌담 새" },
    { x: 88, y: 76, name: "우측 마당 장독대 사과" }
  ],
  2: [
    { x: 18, y: 32, name: "시골 하늘 위 구름" },
    { x: 55, y: 82, name: "논밭 사이 곤충" },
    { x: 76, y: 45, name: "기와 지붕 위 별" },
    { x: 48, y: 18, name: "지붕 너머 하늘 해" },
    { x: 86, y: 78, name: "오른쪽 돌담 옆 꽃" }
  ],
  3: [
    { x: 22, y: 24, name: "밥상 주변 숟가락" },
    { x: 82, y: 62, name: "따뜻한 아랫목 장식" },
    { x: 50, y: 80, name: "김치 그릇 옆 꽃" },
    { x: 62, y: 40, name: "밥그릇 옆 나비" },
    { x: 88, y: 20, name: "창틀 너머 새" }
  ]
};

// DOM 요소 취득 변수 선언
let screens = {};
let buttons = {};
let ui = {};

// 1. 초기 이벤트 리스너 등록 및 DOM 취득
function initGameListeners() {
  screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    end: document.getElementById('end-screen')
  };

  buttons = {
    start: document.getElementById('btn-start-game'),
    shareKakao: document.getElementById('btn-share-kakao'),
    copyLink: document.getElementById('btn-copy-link'),
    restart: document.getElementById('btn-restart')
  };

  ui = {
    stageDisplay: document.getElementById('current-stage-display'),
    brainAge: document.getElementById('brain-age-value'),
    iq: document.getElementById('iq-value'),
    timerProgress: document.getElementById('timer-progress'),
    imgTop: document.getElementById('img-top'),
    imgBottom: document.getElementById('img-bottom'),
    overlayTop: document.getElementById('overlay-top'),
    overlayBottom: document.getElementById('overlay-bottom'),
    foundCount: document.getElementById('found-count-value'),
    finalBrainAge: document.getElementById('final-brain-age'),
    finalIq: document.getElementById('final-iq'),
    diagnosisTitle: document.getElementById('diagnosis-title'),
    diagnosisDesc: document.getElementById('diagnosis-description'),
    frameTop: document.getElementById('frame-top'),
    frameBottom: document.getElementById('frame-bottom'),
    toast: document.getElementById('toast')
  };

  console.log("initGameListeners: DOM elements bound and events registered.");
  buttons.start.addEventListener('click', startGame);
  buttons.restart.addEventListener('click', () => {
    resetGame();
    startGame();
  });
  buttons.shareKakao.addEventListener('click', shareKakaoTalk);
  buttons.copyLink.addEventListener('click', copyResultsToClipboard);

  // 클릭 이벤트 핸들러 (상단/하단 프레임 둘 다 연결)
  ui.frameTop.addEventListener('click', (e) => handleImageClick(e, ui.frameTop));
  ui.frameBottom.addEventListener('click', (e) => handleImageClick(e, ui.frameBottom));
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initGameListeners);
} else {
  initGameListeners();
}

// 타이머 변수
let gameTimerId = null;

// 2. 게임 시작
function startGame() {
  console.log("startGame: initiating gameplay.");
  gameState = 'PLAYING';
  showScreen('game');
  
  // 첫 게임 시 배경 셔플이 안되어있으면 셔플 처리
  if (shuffledBackgrounds.length === 0) {
    shuffledBackgrounds = [1, 2, 3].sort(() => 0.5 - Math.random());
  }
  
  loadStage(1);

  // 1초 단위로 경과 시간 및 두뇌 나이/IQ 갱신하는 타이머 가동 (0.5초 주기로 정밀 제어)
  gameTimerId = setInterval(() => {
    if (gameState !== 'PLAYING') return;

    stageElapsedTime += 0.5;
    
    // 현재 스테이지 난이도 환경 설정 추출
    const stageDifficulty = gameConfig.stages[currentStage];
    
    // UI 타이머 게이지바 업데이트 (스테이지별 감소 속도 차등)
    const percent = (stageElapsedTime / stageDifficulty.timeLimit) * 100;
    ui.timerProgress.style.width = `${percent}%`;

    // 뇌 연령 노화 가산
    agingTimerAccumulator += 0.5;
    if (agingTimerAccumulator >= stageDifficulty.agingInterval) {
      brainAge = Math.min(100, brainAge + 1);
      agingTimerAccumulator = 0;
      updateScoreUI();
    }
    
    // IQ는 1초마다 공통으로 2씩 하락
    if (stageElapsedTime % 1 === 0) {
      iq = Math.max(50, iq - 2);
      updateScoreUI();
    }

    // 시간 초과 처리
    if (stageElapsedTime >= stageDifficulty.timeLimit) {
      showToast("⏳ 시간 초과! 뇌 나이 +20세 패널티 부여!");
      brainAge = Math.min(100, brainAge + 20);
      iq = Math.max(50, iq - 30);
      
      if (currentStage < gameConfig.maxStage) {
        loadStage(currentStage + 1);
      } else {
        endGame();
      }
    }
  }, 500);
}

// 3. 스테이지 데이터 로드 및 렌더링
function loadStage(stageNum) {
  currentStage = stageNum;
  stageElapsedTime = 0;
  foundCount = 0;
  agingTimerAccumulator = 0;
  ui.timerProgress.style.width = '0%';
  
  ui.stageDisplay.textContent = `STAGE ${currentStage}/${gameConfig.maxStage}`;
  ui.foundCount.innerHTML = `<strong>0 / 3</strong>`;

  // 셔플된 인덱스를 참조하여 한국적인 랜덤 이미지 로드
  const bgId = shuffledBackgrounds[currentStage - 1];
  const bgPath = `images/bg${bgId}.png`;
  ui.imgTop.src = bgPath;
  ui.imgBottom.src = bgPath;

  // 기존 정답 서클 및 오버레이 클리어
  ui.overlayTop.innerHTML = '';
  ui.overlayBottom.innerHTML = '';

  // 랜덤 오버레이 생성 (배경 이미지에 종속된 전용 슬롯을 넘겨줌)
  generateRandomDifferences(bgId);
}

// 4. 랜덤 오버레이 생성 알고리즘
function generateRandomDifferences(bgId) {
  const allSlots = STAGE_SLOTS[bgId];
  
  // 1) 해당 배경의 5개 후보 슬롯 중 3개 랜덤 추출
  const shuffledSlots = [...allSlots].sort(() => 0.5 - Math.random());
  const selectedSlots = shuffledSlots.slice(0, 3);

  // 2) 사용할 SVG 아이콘들을 섞기
  const iconKeys = Object.keys(SVG_ICONS);
  const shuffledIcons = iconKeys.sort(() => 0.5 - Math.random());

  activeDifferences = selectedSlots.map((slot, index) => {
    const iconName = shuffledIcons[index % shuffledIcons.length];
    return {
      id: index,
      x: slot.x,
      y: slot.y,
      iconMarkup: SVG_ICONS[iconName],
      found: false
    };
  });

  // 3) 상단 프레임 오버레이에만 3개의 다른 그림 렌더링 (하단은 비워둠)
  activeDifferences.forEach(diff => {
    const itemEl = document.createElement('div');
    itemEl.className = 'diff-item';
    itemEl.style.left = `${diff.x}%`;
    itemEl.style.top = `${diff.y}%`;
    itemEl.innerHTML = diff.iconMarkup;
    ui.overlayTop.appendChild(itemEl);
  });
}

// 5. 이미지 클릭 처리
function handleImageClick(e, frameElement) {
  if (gameState !== 'PLAYING') return;

  const rect = frameElement.getBoundingClientRect();
  
  // 클릭된 절대좌표를 프레임 크기 기준 백분율(%)로 환산
  const clickX = ((e.clientX - rect.left) / rect.width) * 100;
  const clickY = ((e.clientY - rect.top) / rect.height) * 100;

  const stageDifficulty = gameConfig.stages[currentStage];
  const hitRadius = stageDifficulty.hitRadius; // 스테이지별 다이내믹 정답 판정 반경

  let hitDetected = false;

  // 1) 아직 안 찾은 활성 틀린 그림들과 거리 계산
  for (let diff of activeDifferences) {
    if (diff.found) continue;

    const distance = Math.sqrt(Math.pow(clickX - diff.x, 2) + Math.pow(clickY - diff.y, 2));

    if (distance < hitRadius) {
      // 🎯 정답 히트!
      diff.found = true;
      hitDetected = true;
      foundCount++;

      // 보너스 부여
      brainAge = Math.max(20, brainAge - 3); // 뇌 나이 3세 젊어짐
      iq = Math.min(150, iq + 5);            // IQ 5 지능 상승

      // 양쪽 이미지 오버레이 모두에 성공 동그라미 표식 생성
      showSuccessMarker(diff.x, diff.y);
      updateScoreUI();
      ui.foundCount.innerHTML = `<strong>${foundCount} / 3</strong>`;

      showToast("🎉 정답입니다! 뇌 나이 -3세, IQ +5!");

      // 햅틱 진동 피드백 (모바일 지원 기기 대상 짧은 터치 진동)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      // 3개 모두 찾았는지 여부 확인
      if (foundCount === 3) {
        setTimeout(() => {
          if (currentStage < gameConfig.maxStage) {
            loadStage(currentStage + 1);
          } else {
            endGame();
          }
        }, 800);
      }
      break;
    }
  }

  // 2) 빗나갔을 때 (오답 페널티)
  if (!hitDetected) {
    // 뇌 나이 노화 촉진 및 지능 급격 하락
    brainAge = Math.min(100, brainAge + 5);
    iq = Math.max(50, iq - 10);
    
    updateScoreUI();
    showToast("❌ 오답! 뇌 나이 +5세, IQ -10!");

    // 화면 진동(Shake) 효과 및 적색 경고 테두리 적용
    ui.frameTop.classList.add('penalty');
    ui.frameBottom.classList.add('penalty');

    // 디바이스 오답 진동 피드백 (강함)
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    setTimeout(() => {
      ui.frameTop.classList.remove('penalty');
      ui.frameBottom.classList.remove('penalty');
    }, 300);
  }
}

// 6. 성공 마커 그리기
function showSuccessMarker(x, y) {
  // 상단 프레임 정답 서클 추가
  const markerTop = document.createElement('div');
  markerTop.className = 'correct-marker';
  markerTop.style.left = `${x}%`;
  markerTop.style.top = `${y}%`;
  ui.overlayTop.appendChild(markerTop);

  // 하단 프레임 정답 서클 추가
  const markerBottom = document.createElement('div');
  markerBottom.className = 'correct-marker';
  markerBottom.style.left = `${x}%`;
  markerBottom.style.top = `${y}%`;
  ui.overlayBottom.appendChild(markerBottom);
}

// 7. 실시간 UI 스코어 텍스트 업데이트
function updateScoreUI() {
  ui.brainAge.textContent = `${brainAge}세`;
  ui.iq.textContent = String(iq);
}

// 8. 게임 종료 및 결과 레포트 작성
function endGame() {
  gameState = 'GAME_OVER';
  clearInterval(gameTimerId);
  
  showScreen('end');

  // 최종 성적 표기
  ui.finalBrainAge.textContent = `${brainAge}세`;
  ui.finalIq.textContent = String(iq);

  // 시니어 대상의 유쾌하고 긍정적인 두뇌 상태 진단 텍스트 생성
  let diagnosisTitle = "";
  let diagnosisDesc = "";

  if (brainAge <= 30) {
    diagnosisTitle = "💎 백만 불짜리 초특급 울트라 건강 뇌";
    diagnosisDesc = `당신의 실제 두뇌 지능은 상위 1% 수준입니다! 번개 같은 반응 속도와 놀라운 관찰력으로 20대 청년의 생생함을 그대로 유지하고 계시네요. 동년배 최고의 영웅이십니다!`;
  } else if (brainAge <= 45) {
    diagnosisTitle = "✨ 쌩쌩한 청춘 현역 뇌";
    diagnosisDesc = `가끔 돋보기를 찾거나 열쇠를 깜빡하시는 정도일 뿐, 두뇌 관찰력과 노화 상태는 매우 건강한 수준입니다. 지금처럼 책을 읽거나 이런 두뇌 활성화 게임을 자주 하시면 젊음을 평생 유지하실 수 있습니다!`;
  } else if (brainAge <= 65) {
    diagnosisTitle = "🔋 영양 공급이 시급한 주의 요망 뇌";
    diagnosisDesc = `시간 경과와 오답 클릭 페널티로 인해 뇌가 일시적인 피로감을 느끼고 있습니다. 아직 늦지 않았습니다! 매일 물을 충분히 드시고 유산소 운동과 함께 틀린 그림 찾기를 꾸준히 연습해 두뇌 근육을 키워보세요.`;
  } else {
    diagnosisTitle = "🛌 깊은 휴식이 필요한 온화한 실버 뇌";
    diagnosisDesc = `오늘은 집중하기가 다소 힘드셨나요? 뇌도 신체 근육과 같아 피로하면 쉽게 굳어집니다. 푹 주무신 후 맑은 정신으로 한 번만 더 정밀 집중해 보세요. 몇 번 더 도전하시면 뇌 연령이 수십 년 젊어질 것입니다!`;
  }

  ui.diagnosisTitle.textContent = diagnosisTitle;
  ui.diagnosisDesc.textContent = diagnosisDesc;
}

// 9. 게임 리셋
function resetGame() {
  currentStage = 1;
  brainAge = gameConfig.baseBrainAge;
  iq = gameConfig.baseIq;
  stageElapsedTime = 0;
  foundCount = 0;
  activeDifferences = [];
  clearInterval(gameTimerId);
  
  // 매 플레이 시 배경 이미지(1, 2, 3)의 노출 순서를 랜덤 셔플
  shuffledBackgrounds = [1, 2, 3].sort(() => 0.5 - Math.random());
  
  updateScoreUI();
}

// 10. 스크린 전환 유틸리티
function showScreen(screenKey) {
  Object.keys(screens).forEach(key => {
    if (key === screenKey) {
      screens[key].classList.add('active');
    } else {
      screens[key].classList.remove('active');
    }
  });
}

// 11. 토스트 알림창 유틸리티
let toastTimeoutId = null;
function showToast(message) {
  clearTimeout(toastTimeoutId);
  ui.toast.textContent = message;
  ui.toast.classList.add('show');
  
  toastTimeoutId = setTimeout(() => {
    ui.toast.classList.remove('show');
  }, 2000);
}

// 12. 공유 문구 생성 유틸리티
function getShareText() {
  return `🧠 [청춘 두뇌 건강 테스트 결과]
제 최종 뇌 연령은 [${brainAge}세], IQ는 [${iq}]가 나왔습니다!

아직 제 뇌는 쌩쌩하고 젊네요! 
당신의 두뇌 나이와 치매 예방 지수는 몇인가요? 
지금 바로 설치 없이 터치 몇 번으로 진단해 보세요! 👇
${window.location.href}`;
}

// 13. 카카오톡 공유 로직 (카카오 SDK 연계 및 Fallback)
function shareKakaoTalk() {
  try {
    if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '🧠 청춘 두뇌 건강 테스트 결과',
          description: `제 최종 뇌 연령은 ${brainAge}세 (IQ ${iq})! 당신의 두뇌 나이도 테스트해보세요!`,
          imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=300', // 임시 대표 이미지
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: '나도 측정해보기 ⚡',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
        ],
      });
      showToast("💬 카카오톡 공유 창이 열렸습니다!");
    } else {
      // SDK 미작동 시 자동으로 클립보드 복사 Fallback 실행
      copyResultsToClipboard();
    }
  } catch (err) {
    console.error("Kakao share error, using fallback clipboard:", err);
    copyResultsToClipboard();
  }
}

// 14. 클립보드 복사 로직
function copyResultsToClipboard() {
  const text = getShareText();
  
  // 모바일/PC 대응 클립보드 API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast("📋 결과 텍스트가 복사되었습니다! 카톡 등에 붙여넣어 공유하세요.");
      })
      .catch(err => {
        fallbackCopyTextToClipboard(text);
      });
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

// 레거시 브라우저용 Clipboard Fallback
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // 화면 밖으로 이동
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showToast("📋 결과가 복사되었습니다!");
    } else {
      showToast("❌ 복사에 실패했습니다. 직접 복사해주세요.");
    }
  } catch (err) {
    showToast("❌ 복사에 실패했습니다.");
  }

  document.body.removeChild(textArea);
}
