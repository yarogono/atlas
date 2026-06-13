// 🛠️ 틀린 그림 찾기 게임 관리자 대시보드 스크립트

// 전역 상태 객체
let fullConfig = null;
let selectedStage = "1"; // "1", "2", "3" (백그라운드 ID 매칭)
let activeSlot = 1; // 1, 2, 3

// DOM 요소 캐시
const stageSelector = document.getElementById('stage-selector');
const timeLimitInput = document.getElementById('time-limit');
const agingIntervalInput = document.getElementById('aging-interval');
const hitRadiusInput = document.getElementById('hit-radius');

const diffInputs = {
  1: { name: document.getElementById('diff-name-1'), x: document.getElementById('diff-x-1'), y: document.getElementById('diff-y-1') },
  2: { name: document.getElementById('diff-name-2'), x: document.getElementById('diff-x-2'), y: document.getElementById('diff-y-2') },
  3: { name: document.getElementById('diff-name-3'), x: document.getElementById('diff-x-3'), y: document.getElementById('diff-y-3') }
};

const fileAInput = document.getElementById('file-a-input');
const fileBInput = document.getElementById('file-b-input');
const statusA = document.getElementById('status-a');
const statusB = document.getElementById('status-b');

const previewImgLeft = document.getElementById('preview-img-left');
const previewImgRight = document.getElementById('preview-img-right');

const workbenchLeft = document.getElementById('workbench-left');
const workbenchRight = document.getElementById('workbench-right');
const pingsLeft = document.getElementById('pings-left');
const pingsRight = document.getElementById('pings-right');

const btnSaveConfig = document.getElementById('btn-save-config');
const slotBtns = document.querySelectorAll('.slot-btn');

// 1. 초기 로드: 기존 설정 가져오기
async function loadConfig() {
  try {
    const response = await fetch('/api/game/config');
    if (!response.ok) throw new Error('설정 정보를 가져오는데 실패했습니다.');
    
    fullConfig = await response.ok ? await response.json() : null;
    console.log("Loaded configuration:", fullConfig);
    
    // UI 채우기
    bindStageData();
  } catch (error) {
    showToast(`❌ 에러: ${error.message}`);
  }
}

// 2. 선택된 스테이지 데이터를 화면 입력 필드 및 이미지 프레임에 바인딩
function bindStageData() {
  if (!fullConfig) return;

  // 스테이지 전용 설정 로드 (난이도)
  const stageDiff = fullConfig.stages[selectedStage];
  timeLimitInput.value = stageDiff.timeLimit;
  agingIntervalInput.value = stageDiff.agingInterval;
  hitRadiusInput.value = stageDiff.hitRadius;

  // 백그라운드 이미지 및 좌표 목록 로드
  const bgData = fullConfig.backgrounds[selectedStage];
  
  // 이미지 소스 갱신 (S3 URL 또는 기본 경로)
  previewImgLeft.src = bgData.imgTop || '/game/images/stage1_a.png';
  previewImgRight.src = bgData.imgBottom || '/game/images/stage1_b.png';

  // 파일 업로드 상태 텍스트 초기화
  statusA.textContent = bgData.imgTop && bgData.imgTop.includes('amazonaws') ? 'S3 업로드됨 (교체 가능)' : '로컬 파일 로드됨 (교체 가능)';
  statusB.textContent = bgData.imgBottom && bgData.imgBottom.includes('amazonaws') ? 'S3 업로드됨 (교체 가능)' : '로컬 파일 로드됨 (교체 가능)';

  // 3개 정답 오브젝트 좌표 폼 로드
  for (let i = 1; i <= 3; i++) {
    const diff = bgData.differences[i - 1] || { x: 0, y: 0, name: '' };
    diffInputs[i].name.value = diff.name || '';
    diffInputs[i].x.value = diff.x !== undefined ? diff.x.toFixed(1) : '';
    diffInputs[i].y.value = diff.y !== undefined ? diff.y.toFixed(1) : '';
  }

  // 화면 마커 리렌더링
  renderPingMarkers();
}

// 3. 이미지 클릭 이벤트 리스너 (좌표 핑 획득 및 마커 그리기)
function handleWorkbenchClick(e, element) {
  const rect = element.getBoundingClientRect();
  const clickX = ((e.clientX - rect.left) / rect.width) * 100;
  const clickY = ((e.clientY - rect.top) / rect.height) * 100;

  // 소수점 1자리 포맷
  const finalX = parseFloat(clickX.toFixed(1));
  const finalY = parseFloat(clickY.toFixed(1));

  // 활성화된 입력 폼 업데이트
  diffInputs[activeSlot].x.value = finalX;
  diffInputs[activeSlot].y.value = finalY;

  // 전역 데이터 객체 업데이트
  const bgData = fullConfig.backgrounds[selectedStage];
  if (!bgData.differences[activeSlot - 1]) {
    bgData.differences[activeSlot - 1] = { x: 0, y: 0, name: '' };
  }
  bgData.differences[activeSlot - 1].x = finalX;
  bgData.differences[activeSlot - 1].y = finalY;

  // 마커 동그라미 다시 그리기
  renderPingMarkers();
  showToast(`🎯 ${activeSlot}번 정답 위치 지정: X: ${finalX}%, Y: ${finalY}%`);
}

// 4. 화면의 핑 마커 서클 그리기 함수
function renderPingMarkers() {
  pingsLeft.innerHTML = '';
  pingsRight.innerHTML = '';

  const bgData = fullConfig.backgrounds[selectedStage];
  bgData.differences.forEach((diff, index) => {
    if (diff.x === undefined || diff.y === undefined || isNaN(diff.x) || isNaN(diff.y)) return;

    const slotNum = index + 1;

    // 양쪽 이미지 영역에 동일 좌표 마커 핑 찍기
    const markerLeft = createMarkerElement(diff.x, diff.y, slotNum);
    const markerRight = createMarkerElement(diff.x, diff.y, slotNum);

    pingsLeft.appendChild(markerLeft);
    pingsRight.appendChild(markerRight);
  });
}

function createMarkerElement(x, y, slotNum) {
  const marker = document.createElement('div');
  marker.className = `ping-marker slot-${slotNum}`;
  marker.style.left = `${x}%`;
  marker.style.top = `${y}%`;
  marker.textContent = slotNum;
  return marker;
}

// 5. 이미지 AWS S3 업로드 처리 함수
async function uploadImageFile(file, imageType, statusEl, imgEl) {
  try {
    statusEl.textContent = '⏳ S3로 전송 중...';
    statusEl.style.color = 'var(--primary-color)';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('stageId', selectedStage);
    formData.append('imageType', imageType);

    const response = await fetch('/api/game/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'S3 업로드에 실패했습니다.');
    }

    const data = await response.json();
    console.log(`Uploaded ${imageType} S3 URL:`, data.url);

    // 전역 상태에 S3 URL 동기화
    if (imageType === 'a') {
      fullConfig.backgrounds[selectedStage].imgTop = data.url;
    } else {
      fullConfig.backgrounds[selectedStage].imgBottom = data.url;
    }

    // 프리뷰 갱신
    imgEl.src = data.url;
    statusEl.textContent = '✅ S3 업로드 완료!';
    statusEl.style.color = 'var(--secondary-color)';
    showToast(`📸 이미지 ${imageType.toUpperCase()} S3 업로드 성공!`);
  } catch (error) {
    statusEl.textContent = '❌ 업로드 실패!';
    statusEl.style.color = 'var(--error-color)';
    showToast(`❌ S3 전송 에러: ${error.message}`);
  }
}

// 6. 설정 POST 저장 요청 처리
async function saveAllConfig() {
  try {
    // 폼 입력 값을 전역 설정 객체로 취합
    const stageDiff = fullConfig.stages[selectedStage];
    stageDiff.timeLimit = parseInt(timeLimitInput.value, 10);
    stageDiff.agingInterval = parseFloat(agingIntervalInput.value);
    stageDiff.hitRadius = parseFloat(hitRadiusInput.value);

    // 정답 이름 필드 취합
    const bgData = fullConfig.backgrounds[selectedStage];
    for (let i = 1; i <= 3; i++) {
      if (!bgData.differences[i - 1]) {
        bgData.differences[i - 1] = { x: 0, y: 0, name: '' };
      }
      bgData.differences[i - 1].name = diffInputs[i].name.value.trim() || `${i}번 오브젝트`;
      
      // 검증
      if (bgData.differences[i - 1].x === undefined || isNaN(bgData.differences[i - 1].x)) {
        throw new Error(`${i}번 틀린 부분의 위치를 마우스로 핑 찍어주세요.`);
      }
    }

    // 서버의 API를 통해 파일 쓰기 요청
    const response = await fetch('/api/game/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullConfig),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || '설정 저장에 실패했습니다.');
    }

    showToast('💾 S3 이미지 및 모든 좌표 설정 저장 완료! 즉시 게임에 반영됩니다.');
  } catch (error) {
    showToast(`❌ 저장 오류: ${error.message}`);
  }
}

// 7. 토스트 알림 표시
function showToast(message) {
  const toast = document.getElementById('admin-toast');
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 4000);
}

// 8. 이벤트 바인딩
stageSelector.addEventListener('change', (e) => {
  selectedStage = e.target.value;
  bindStageData();
});

slotBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    slotBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    activeSlot = parseInt(e.target.dataset.slot, 10);
  });
});

workbenchLeft.addEventListener('click', (e) => handleWorkbenchClick(e, workbenchLeft));
workbenchRight.addEventListener('click', (e) => handleWorkbenchClick(e, workbenchRight));

fileAInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    uploadImageFile(e.target.files[0], 'a', statusA, previewImgLeft);
  }
});

fileBInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    uploadImageFile(e.target.files[0], 'b', statusB, previewImgRight);
  }
});

btnSaveConfig.addEventListener('click', saveAllConfig);

// 로그아웃 버튼 이벤트
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
  btnLogout.addEventListener('click', async () => {
    await fetch('/api/game/admin/logout', { method: 'POST' });
    window.location.href = '/game/admin-login.html';
  });
}

// API 인증 오류(401) 시 자동으로 로그인 페이지로 이동
async function fetchWithAuth(url, options = {}) {
  const response = await fetch(url, options);
  if (response.status === 401) {
    window.location.href = `/game/admin-login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
    return null;
  }
  return response;
}

// 도큐먼트 로드 시 실행
window.addEventListener('DOMContentLoaded', loadConfig);
