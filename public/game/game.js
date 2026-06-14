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
let fullConfigData = null; // 동적 stages.json 설정을 담을 전역 변수

// 각 배경 일러스트별 고정된 3개 네이티브 다른 그림의 중심 백분율(%) 좌표
const STAGE_DIFFERENCES = {
  1: [ // 한옥 마당 배경 (stage1_a.png vs stage1_b.png)
    { x: 11.7, y: 8.8, name: "구름" },
    { x: 87.6, y: 42.2, name: "감 열매" },
    { x: 22.4, y: 63.5, name: "찻잔" }
  ],
  2: [ // 시골 풍경 배경 (stage2_a.png vs stage2_b.png)
    { x: 33.4, y: 11.2, name: "구름" },
    { x: 61.0, y: 40.8, name: "전신주" },
    { x: 89.8, y: 64.2, name: "농부" }
  ],
  3: [ // 전통 밥상 배경 (stage3_a.png vs stage3_b.png)
    { x: 35.2, y: 31.7, name: "족자 그림" },
    { x: 55.2, y: 27.8, name: "바구니" },
    { x: 50.3, y: 10.5, name: "천장 등" }
  ]
};


// DOM 요소 취득 변수 선언
let screens = {};
let buttons = {};
let ui = {};

// 1. 초기 이벤트 리스너 등록 및 DOM 취득
function initGameListeners() {
  screens = {
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

  // 동적 설정 불러오기 실행
  loadDynamicConfig().then(() => {
    console.log("initGameListeners: Setup complete with dynamic configs.");
  });
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initGameListeners);
} else {
  initGameListeners();
}

// 동적 설정 파일 stages.json 불러오기 및 매핑
async function loadDynamicConfig() {
  try {
    const response = await fetch('/api/game/config');
    if (!response.ok) throw new Error("게임 설정을 가져올 수 없습니다.");
    
    const config = await response.json();
    
    // S3 이미지 URL(http/https로 시작)을 포함하는 배경만 필터링하여 순차 넘버링
    const validBackgrounds = {};
    const validStages = {};
    let validCount = 0;
    
    if (config.backgrounds) {
      // 배경 데이터 순차 정렬 (1, 2, 3...)
      const bgKeys = Object.keys(config.backgrounds).map(Number).sort((a, b) => a - b);
      
      for (const bgId of bgKeys) {
        const bg = config.backgrounds[String(bgId)];
        if (bg && bg.imgTop && bg.imgBottom) {
          const isS3ImgTop = bg.imgTop.startsWith('http://') || bg.imgTop.startsWith('https://');
          const isS3ImgBottom = bg.imgBottom.startsWith('http://') || bg.imgBottom.startsWith('https://');
          
          if (isS3ImgTop && isS3ImgBottom) {
            validCount++;
            const newKey = String(validCount);
            
            // 새 키(1, 2, 3...)에 필터링된 배경 매핑
            validBackgrounds[newKey] = bg;
            
            // 기존 stage 난이도 정보 매핑 (없으면 기본값 생성)
            validStages[newKey] = (config.stages && config.stages[String(bgId)]) || {
              timeLimit: 60 - (validCount - 1) * 10,
              agingInterval: Math.max(0.5, 2.0 - (validCount - 1) * 0.6),
              hitRadius: Math.max(5.0, 10.0 - (validCount - 1) * 2.0)
            };
          }
        }
      }
    }
    
    if (validCount > 0) {
      config.backgrounds = validBackgrounds;
      config.stages = validStages;
      config.maxStage = validCount;
      console.log(`loadDynamicConfig: Found ${validCount} valid S3 stages.`);
    } else {
      console.warn("loadDynamicConfig: No valid S3 stages found. Falling back to local/default stages.");
    }
    
    fullConfigData = config;
    
    // gameConfig 기본 파라미터 병합
    gameConfig.maxStage = config.maxStage || 3;
    gameConfig.baseIq = config.baseIq || 150;
    gameConfig.baseBrainAge = config.baseBrainAge || 20;
    
    // stages 병합
    if (config.stages) {
      gameConfig.stages = config.stages;
    }
    
    // STAGE_DIFFERENCES 매핑
    if (config.backgrounds) {
      for (let bgId in config.backgrounds) {
        STAGE_DIFFERENCES[bgId] = config.backgrounds[bgId].differences;
      }
    }
    
    console.log("loadDynamicConfig: Dynamic configs merged successfully.");

    // 배경 이미지 노출 순서 셔플을 미리 해두어 배경 이미지가 즉시 로딩되도록 지원
    const stageCount = gameConfig.maxStage || 3;
    shuffledBackgrounds = Array.from({ length: stageCount }, (_, i) => i + 1)
      .sort(() => 0.5 - Math.random());

    loadStage(1);
  } catch (error) {
    console.warn("loadDynamicConfig: Failed to load dynamic config, using local fallback:", error);
  } finally {
    // 로딩 완료 후 시작 버튼 활성화
    if (buttons.start) {
      buttons.start.disabled = false;
      buttons.start.textContent = "지금 시작하기 ⚡";
    }
    // 시작 화면 광고 초기화 (레이아웃 렌더링 완료 후 0.2초 대기하여 availableWidth=0 에러 예방)
    setTimeout(() => {
      try {
        const startAdIns = document.querySelector('.ads-game-screen .adsbygoogle');
        if (startAdIns && !startAdIns.hasAttribute('data-adsbygoogle-status')) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          console.log("Start screen AdSense initialized dynamically.");
        }
      } catch (adError) {
        console.warn("Failed to dynamically initialize start screen AdSense:", adError);
      }
    }, 200);
  }
}

// 타이머 변수
let gameTimerId = null;

// 2. 게임 시작
function startGame() {
  console.log("startGame: initiating gameplay.");
  gameState = 'PLAYING';
  
  // 게임 화면 활성화
  showScreen('game');
  
  // 시작 오버레이 페이드 아웃
  const startOverlay = document.getElementById('start-overlay');
  if (startOverlay) {
    startOverlay.classList.add('fade-out');
  }
  
  // 첫 게임 시 배경 셔플이 안되어있으면 셔플 처리 (maxStage 기반 동적 생성)
  if (shuffledBackgrounds.length === 0) {
    const stageCount = gameConfig.maxStage || 3;
    shuffledBackgrounds = Array.from({ length: stageCount }, (_, i) => i + 1)
      .sort(() => 0.5 - Math.random());
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
  // 이 시점에는 아직 differences 로드 전이므로 "0 / ?"로 초기 표시 (loadDifferences에서 갱신)
  ui.foundCount.innerHTML = `<strong>0 / ?</strong>`;

  // 셔플된 인덱스를 참조하여 한국적인 랜덤 이미지 로드
  const bgId = shuffledBackgrounds[currentStage - 1];
  
  // 상단에는 원본(_a), 하단에는 다른 부분이 들어간 수정본(_b)을 로드하여 네이티브 틀린그림찾기 구현
  const bgInfo = fullConfigData && fullConfigData.backgrounds && fullConfigData.backgrounds[bgId];
  if (bgInfo && bgInfo.imgTop && bgInfo.imgBottom) {
    ui.imgTop.src = bgInfo.imgTop;
    ui.imgBottom.src = bgInfo.imgBottom;
  } else {
    ui.imgTop.src = `/game/images/stage${bgId}_a.png`;
    ui.imgBottom.src = `/game/images/stage${bgId}_b.png`;
  }

  // 기존 정답 서클 및 오버레이 클리어
  ui.overlayTop.innerHTML = '';
  ui.overlayBottom.innerHTML = '';

  // 해당 배경에 맞는 3개의 고정 틀린 그림 데이터 바인딩
  loadDifferences(bgId);
}

// 4. 틀린 그림 데이터 로딩 알고리즘
function loadDifferences(bgId) {
  const diffs = STAGE_DIFFERENCES[bgId] || [];
  
  activeDifferences = diffs.map((diff, index) => {
    return {
      id: index,
      x: diff.x,
      y: diff.y,
      name: diff.name,
      found: false
    };
  });

  // 정답 개수 확정 후 카운터 UI 갱신 (동적 개수 반영)
  ui.foundCount.innerHTML = `<strong>0 / ${activeDifferences.length}</strong>`;

  // 틀린 그림 데이터가 비어있으면 경고 (아직 설정 안된 스테이지)
  if (activeDifferences.length === 0) {
    console.warn(`loadDifferences: Stage bgId=${bgId}의 틀린 그림 좌표가 설정되지 않았습니다.`);
  }
}


// 5. 이미지 클릭 처리
function handleImageClick(e, frameElement) {
  if (gameState !== 'PLAYING') return;

  const rect = frameElement.getBoundingClientRect();
  
  // 클릭된 절대좌표를 프레임 크기 기준 백분율(%)로 환산
  const clickX = ((e.clientX - rect.left) / rect.width) * 100;
  const clickY = ((e.clientY - rect.top) / rect.height) * 100;

  // 개발 및 코디네이트 지정 편의를 위한 로그 출력 (콘솔에서 복사 가능)
  console.log(`[클릭 좌표 정보] { x: ${clickX.toFixed(1)}, y: ${clickY.toFixed(1)} }`);

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
      ui.foundCount.innerHTML = `<strong>${foundCount} / ${activeDifferences.length}</strong>`;

      showToast("🎉 정답입니다! 뇌 나이 -3세, IQ +5!");

      // 햅틱 진동 피드백 (모바일 지원 기기 대상 짧은 터치 진동)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      // 모든 틀린 그림을 찾았는지 여부 확인 (동적 개수 지원)
      if (foundCount === activeDifferences.length) {
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

  // 결과 화면이 보인 후에 애드센스 광고 초기화 실행 (hidden 상태에서 호출 시 크기 계산 오류 방지)
  // 레이아웃이 렌더링되고 가로폭 계산이 가능할 때까지 0.2초 대기 후 push 실행
  setTimeout(() => {
    try {
      const endAdIns = document.querySelector('#end-screen .adsbygoogle');
      if (endAdIns && !endAdIns.hasAttribute('data-adsbygoogle-status')) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log("Result screen AdSense initialized dynamically.");
      }
    } catch (adError) {
      console.warn("Failed to dynamically initialize result screen AdSense:", adError);
    }
  }, 200);
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
  
  // 매 플레이 시 설정된 최대 스테이지 수만큼 동적으로 셔플 순서 배열 생성
  const stageCount = gameConfig.maxStage || 3;
  shuffledBackgrounds = Array.from({ length: stageCount }, (_, i) => i + 1)
    .sort(() => 0.5 - Math.random());
  
  updateScoreUI();
}

// 10. 스크린 전환 유틸리티
function showScreen(screenKey) {
  Object.keys(screens).forEach(key => {
    if (screens[key]) {
      if (key === screenKey) {
        screens[key].classList.add('active');
      } else {
        screens[key].classList.remove('active');
      }
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
