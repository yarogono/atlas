// 🛠️ 틀린 그림 찾기 게임 관리자 대시보드 스크립트 (v2 - 동적 스테이지 관리)

// ─── 슬롯 컬러 팔레트 ───────────────────────────────────────────
const SLOT_COLORS = [
  '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#F39C12',
  '#1ABC9C', '#E67E22', '#E91E63', '#00BCD4', '#8BC34A'
];

// ─── 전역 상태 ───────────────────────────────────────────────────
let fullConfig = null;
let selectedStage = '1';  // 현재 편집 중인 스테이지 ID (문자열)
let activeSlot = 0;       // 현재 핑 찍기 활성 슬롯 인덱스 (0-based)
let pendingDeleteStageId = null; // 삭제 확인 대기 중인 stageId

// ─── DOM 캐시 ─────────────────────────────────────────────────────
const stageTitleInput    = document.getElementById('stage-title');
const timeLimitInput     = document.getElementById('time-limit');
const agingIntervalInput = document.getElementById('aging-interval');
const hitRadiusInput     = document.getElementById('hit-radius');
const diffSlotsContainer = document.getElementById('diff-slots-container');
const slotSelectorBtns   = document.getElementById('slot-selector-btns');
const stageTabBar        = document.getElementById('stage-tab-bar');
const btnAddStage        = document.getElementById('btn-add-stage');
const btnSaveConfig      = document.getElementById('btn-save-config');

const fileAInput     = document.getElementById('file-a-input');
const fileBInput     = document.getElementById('file-b-input');
const statusA        = document.getElementById('status-a');
const statusB        = document.getElementById('status-b');
const previewImgLeft  = document.getElementById('preview-img-left');
const previewImgRight = document.getElementById('preview-img-right');
const placeholderLeft  = document.getElementById('placeholder-left');
const placeholderRight = document.getElementById('placeholder-right');
const workbenchLeft  = document.getElementById('workbench-left');
const workbenchRight = document.getElementById('workbench-right');
const pingsLeft      = document.getElementById('pings-left');
const pingsRight     = document.getElementById('pings-right');

// 모달
const modalAddStage      = document.getElementById('modal-add-stage');
const modalDeleteStage   = document.getElementById('modal-delete-stage');
const newStageTitleInput = document.getElementById('new-stage-title');
const modalDeleteDesc    = document.getElementById('modal-delete-desc');

// ─── 1. 설정 로드 ─────────────────────────────────────────────────
async function loadConfig() {
  try {
    const response = await fetch('/api/game/config');
    if (!response.ok) throw new Error('설정 정보를 가져오는데 실패했습니다.');
    fullConfig = await response.json();
    console.log('Loaded config:', fullConfig);
    renderStageTabs();
    bindStageData();
  } catch (error) {
    showToast(`❌ 에러: ${error.message}`);
  }
}

// ─── 2. 스테이지 탭 동적 렌더링 ────────────────────────────────────
function renderStageTabs() {
  // 기존 탭 제거 (btn-add-stage 버튼 제외)
  const existingTabs = stageTabBar.querySelectorAll('.stage-tab');
  existingTabs.forEach(t => t.remove());

  const stageIds = Object.keys(fullConfig.backgrounds).sort((a, b) => Number(a) - Number(b));
  const totalStages = stageIds.length;

  stageIds.forEach(id => {
    const bg = fullConfig.backgrounds[id];
    const title = bg.title || `STAGE ${id}`;
    const isActive = id === selectedStage;
    const canDelete = totalStages > 1;

    const tab = document.createElement('button');
    tab.className = 'stage-tab' + (isActive ? ' active' : '');
    tab.dataset.stageId = id;
    tab.innerHTML = `
      STAGE ${id} <span style="opacity:0.75;font-weight:400;">(${title})</span>
      <span class="tab-delete-btn" title="이 스테이지 삭제" ${!canDelete ? 'data-disabled="true"' : ''}>✕</span>
    `;

    // 탭 클릭 (삭제 버튼 제외)
    tab.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-delete-btn')) return;
      selectedStage = id;
      renderStageTabs();
      bindStageData();
    });

    // 삭제 버튼 클릭
    const deleteBtn = tab.querySelector('.tab-delete-btn');
    if (canDelete) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openDeleteModal(id, title);
      });
    } else {
      deleteBtn.style.opacity = '0.3';
      deleteBtn.style.cursor = 'not-allowed';
    }

    // addStage 버튼 앞에 삽입
    stageTabBar.insertBefore(tab, btnAddStage);
  });
}

// ─── 3. 스테이지 데이터를 폼에 바인딩 ──────────────────────────────
function bindStageData() {
  if (!fullConfig) return;

  const stageDiff = fullConfig.stages[selectedStage];
  const bgData = fullConfig.backgrounds[selectedStage];

  // 난이도 폼 채우기
  stageTitleInput.value   = bgData.title || '';
  timeLimitInput.value    = stageDiff.timeLimit;
  agingIntervalInput.value = stageDiff.agingInterval;
  hitRadiusInput.value    = stageDiff.hitRadius;

  // 이미지 프리뷰
  if (bgData.imgTop) {
    previewImgLeft.src = bgData.imgTop;
    previewImgLeft.style.display = 'block';
    placeholderLeft.style.display = 'none';
  } else {
    previewImgLeft.style.display = 'none';
    placeholderLeft.style.display = 'flex';
  }
  if (bgData.imgBottom) {
    previewImgRight.src = bgData.imgBottom;
    previewImgRight.style.display = 'block';
    placeholderRight.style.display = 'none';
  } else {
    previewImgRight.style.display = 'none';
    placeholderRight.style.display = 'flex';
  }

  // 업로드 상태 텍스트
  statusA.textContent = bgData.imgTop && bgData.imgTop.includes('amazonaws')
    ? 'S3 업로드됨 (교체 가능)' : (bgData.imgTop ? '이미지 설정됨' : '파일 선택 대기 중');
  statusB.textContent = bgData.imgBottom && bgData.imgBottom.includes('amazonaws')
    ? 'S3 업로드됨 (교체 가능)' : (bgData.imgBottom ? '이미지 설정됨' : '파일 선택 대기 중');

  // 첫 번째 슬롯을 활성 슬롯으로 초기화
  activeSlot = 0;

  // 틀린 그림 슬롯 렌더링
  renderDiffSlots();
  renderPingMarkers();
}

// ─── 4. 틀린 그림 슬롯 동적 렌더링 ────────────────────────────────
function renderDiffSlots() {
  const bgData = fullConfig.backgrounds[selectedStage];
  const diffs = bgData.differences || [];

  diffSlotsContainer.innerHTML = '';
  slotSelectorBtns.innerHTML = '';

  diffs.forEach((diff, index) => {
    const color = SLOT_COLORS[index % SLOT_COLORS.length];
    const slotNum = index + 1;

    // 폼 슬롯
    const slotEl = document.createElement('div');
    slotEl.className = 'diff-slot';
    slotEl.dataset.index = index;
    slotEl.innerHTML = `
      <div class="diff-slot-header">
        <span class="diff-slot-label">
          <span class="slot-color-dot" style="background:${color};"></span>
          오브젝트 ${slotNum}
        </span>
        <button class="btn-remove-slot" data-index="${index}">✕ 삭제</button>
      </div>
      <input type="text" class="form-control diff-name" placeholder="오브젝트 이름 (예: 구름)" 
             value="${diff.name || ''}" data-index="${index}" style="margin-bottom:8px;">
      <div class="row-grid">
        <input type="number" class="form-control diff-x" placeholder="X (%)" 
               value="${diff.x !== undefined ? diff.x : ''}" data-index="${index}" readonly>
        <input type="number" class="form-control diff-y" placeholder="Y (%)" 
               value="${diff.y !== undefined ? diff.y : ''}" data-index="${index}" readonly>
      </div>
    `;

    // 삭제 버튼
    slotEl.querySelector('.btn-remove-slot').addEventListener('click', () => removeDiffSlot(index));
    diffSlotsContainer.appendChild(slotEl);

    // 워크벤치 슬롯 선택 버튼
    const sBtn = document.createElement('button');
    sBtn.className = 'slot-btn' + (index === activeSlot ? ' active' : '');
    sBtn.textContent = `${slotNum}번`;
    sBtn.style.setProperty('--slot-color', color);
    if (index === activeSlot) {
      sBtn.style.background = color;
      sBtn.style.borderColor = color;
      sBtn.style.color = '#FFF';
    }
    sBtn.addEventListener('click', () => {
      activeSlot = index;
      renderDiffSlots(); // 슬롯 선택 버튼 상태 갱신
    });
    slotSelectorBtns.appendChild(sBtn);
  });

  // 슬롯이 없으면 안내 텍스트
  if (diffs.length === 0) {
    diffSlotsContainer.innerHTML = `
      <p style="font-size:14px; color:var(--text-muted); text-align:center; padding:16px 0;">
        아직 틀린 그림이 없습니다. 아래 버튼으로 추가하세요.
      </p>`;
    slotSelectorBtns.innerHTML = `<span style="font-size:13px; color:rgba(255,255,255,0.5);">슬롯 없음</span>`;
  }
}

// ─── 5. 틀린 그림 슬롯 추가 ──────────────────────────────────────
function addDiffSlot() {
  const bgData = fullConfig.backgrounds[selectedStage];
  if (!bgData.differences) bgData.differences = [];
  bgData.differences.push({ x: undefined, y: undefined, name: '' });
  activeSlot = bgData.differences.length - 1;
  renderDiffSlots();
  renderPingMarkers();
  showToast(`✅ 틀린 그림 슬롯 ${bgData.differences.length}번 추가됨`);
}

// ─── 6. 틀린 그림 슬롯 삭제 ──────────────────────────────────────
function removeDiffSlot(index) {
  const bgData = fullConfig.backgrounds[selectedStage];
  bgData.differences.splice(index, 1);
  activeSlot = Math.max(0, Math.min(activeSlot, bgData.differences.length - 1));
  renderDiffSlots();
  renderPingMarkers();
  showToast(`🗑️ 틀린 그림 슬롯 삭제됨`);
}

// ─── 7. 이미지 클릭 → 좌표 핑 찍기 ────────────────────────────────
function handleWorkbenchClick(e, element) {
  const bgData = fullConfig.backgrounds[selectedStage];
  if (!bgData.differences || bgData.differences.length === 0) {
    showToast('⚠️ 먼저 틀린 그림 슬롯을 추가하세요.');
    return;
  }
  if (activeSlot >= bgData.differences.length) activeSlot = 0;

  const rect = element.getBoundingClientRect();
  const clickX = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(1));
  const clickY = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(1));

  bgData.differences[activeSlot].x = clickX;
  bgData.differences[activeSlot].y = clickY;

  // 폼 값 즉시 갱신
  const xInput = diffSlotsContainer.querySelector(`.diff-x[data-index="${activeSlot}"]`);
  const yInput = diffSlotsContainer.querySelector(`.diff-y[data-index="${activeSlot}"]`);
  if (xInput) xInput.value = clickX;
  if (yInput) yInput.value = clickY;

  renderPingMarkers();
  showToast(`🎯 ${activeSlot + 1}번 정답 위치: X=${clickX}%, Y=${clickY}%`);
}

// ─── 8. 핑 마커 렌더링 ───────────────────────────────────────────
function renderPingMarkers() {
  pingsLeft.innerHTML = '';
  pingsRight.innerHTML = '';

  const bgData = fullConfig.backgrounds[selectedStage];
  const diffs = bgData.differences || [];

  diffs.forEach((diff, index) => {
    if (diff.x === undefined || diff.y === undefined || isNaN(diff.x) || isNaN(diff.y)) return;
    const color = SLOT_COLORS[index % SLOT_COLORS.length];
    pingsLeft.appendChild(createMarker(diff.x, diff.y, index + 1, color));
    pingsRight.appendChild(createMarker(diff.x, diff.y, index + 1, color));
  });
}

function createMarker(x, y, num, color) {
  const el = document.createElement('div');
  el.className = 'ping-marker';
  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
  el.style.background = color + 'B3'; // 70% 투명도
  el.style.border = '4px solid #FFF';
  el.textContent = num;
  return el;
}

// 이미지 파일 가로/세로 비율 확인 헬퍼
function checkImageRatio(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = img.width / img.height;
      URL.revokeObjectURL(img.src);
      resolve({ width: img.width, height: img.height, ratio });
    };
    img.onerror = () => {
      resolve(null);
    };
  });
}

// ─── 9. 이미지 S3 업로드 ──────────────────────────────────────────
async function uploadImageFile(file, imageType, statusEl, imgEl, placeholderEl) {
  try {
    const dimensions = await checkImageRatio(file);
    if (dimensions) {
      const targetRatio = 1.5; // 3:2
      const diff = Math.abs(dimensions.ratio - targetRatio);
      if (diff > 0.05) {
        showToast(`⚠️ 경고: 이미지 비율이 3:2가 아닙니다 (${dimensions.width}x${dimensions.height}). 게임 화면에서 늘어나 보일 수 있습니다.`);
      }
    }

    statusEl.textContent = '⏳ S3로 전송 중...';
    statusEl.style.color = 'var(--primary-color)';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('stageId', selectedStage);
    formData.append('imageType', imageType);

    const response = await fetch('/api/game/upload', { method: 'POST', body: formData });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'S3 업로드 실패');
    }

    const data = await response.json();
    if (imageType === 'a') {
      fullConfig.backgrounds[selectedStage].imgTop = data.url;
    } else {
      fullConfig.backgrounds[selectedStage].imgBottom = data.url;
    }
    imgEl.src = data.url;
    imgEl.style.display = 'block';
    placeholderEl.style.display = 'none';

    statusEl.textContent = '✅ S3 업로드 완료!';
    statusEl.style.color = 'var(--secondary-color)';
    showToast(`📸 이미지 ${imageType.toUpperCase()} S3 업로드 성공!`);
  } catch (error) {
    statusEl.textContent = '❌ 업로드 실패!';
    statusEl.style.color = 'var(--error-color)';
    showToast(`❌ S3 전송 에러: ${error.message}`);
  }
}

// ─── 10. 설정 전체 저장 ───────────────────────────────────────────
async function saveAllConfig() {
  try {
    // 폼 → 전역 config 동기화
    const stageDiff = fullConfig.stages[selectedStage];
    const bgData = fullConfig.backgrounds[selectedStage];

    bgData.title = stageTitleInput.value.trim();
    stageDiff.timeLimit = parseInt(timeLimitInput.value, 10);
    stageDiff.agingInterval = parseFloat(agingIntervalInput.value);
    stageDiff.hitRadius = parseFloat(hitRadiusInput.value);

    // 슬롯 이름 동기화 (readOnly가 아닌 name 필드)
    const nameInputs = diffSlotsContainer.querySelectorAll('.diff-name');
    nameInputs.forEach(input => {
      const idx = parseInt(input.dataset.index, 10);
      if (bgData.differences[idx]) {
        bgData.differences[idx].name = input.value.trim() || `${idx + 1}번 오브젝트`;
      }
    });

    const response = await fetch('/api/game/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullConfig),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || '설정 저장 실패');
    }
    showToast('💾 모든 설정이 저장되었습니다! 게임에 즉시 반영됩니다.');
  } catch (error) {
    showToast(`❌ 저장 오류: ${error.message}`);
  }
}

// ─── 11. 스테이지 추가 모달 ──────────────────────────────────────
function openAddModal() {
  newStageTitleInput.value = '';
  modalAddStage.classList.add('active');
  setTimeout(() => newStageTitleInput.focus(), 100);
}

function closeAddModal() {
  modalAddStage.classList.remove('active');
}

async function confirmAddStage() {
  const title = newStageTitleInput.value.trim();
  if (!title) {
    newStageTitleInput.focus();
    return;
  }
  try {
    const response = await fetch('/api/game/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', title }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || '스테이지 추가 실패');
    }
    const data = await response.json();
    fullConfig = data.config;
    selectedStage = data.newStageId;
    closeAddModal();
    renderStageTabs();
    bindStageData();
    showToast(`✅ STAGE ${data.newStageId} "${title}" 추가 완료!`);
  } catch (error) {
    showToast(`❌ 추가 오류: ${error.message}`);
  }
}

// ─── 12. 스테이지 삭제 모달 ──────────────────────────────────────
function openDeleteModal(stageId, title) {
  pendingDeleteStageId = stageId;
  modalDeleteDesc.textContent =
    `정말로 STAGE ${stageId} "${title}"를 삭제하시겠습니까?\n삭제 후 남은 스테이지는 자동으로 재넘버링됩니다.`;
  modalDeleteStage.classList.add('active');
}

function closeDeleteModal() {
  pendingDeleteStageId = null;
  modalDeleteStage.classList.remove('active');
}

async function confirmDeleteStage() {
  if (!pendingDeleteStageId) return;
  const idToDelete = pendingDeleteStageId;
  closeDeleteModal();

  try {
    const response = await fetch(`/api/game/config?stageId=${idToDelete}`, { method: 'DELETE' });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || '스테이지 삭제 실패');
    }
    const data = await response.json();
    fullConfig = data.config;
    // 삭제 후 첫 번째 스테이지로 이동
    selectedStage = Object.keys(fullConfig.backgrounds).sort((a, b) => Number(a) - Number(b))[0];
    renderStageTabs();
    bindStageData();
    showToast(`🗑️ 스테이지 삭제 완료. 전체 ${data.maxStage}개 스테이지`);
  } catch (error) {
    showToast(`❌ 삭제 오류: ${error.message}`);
  }
}

// ─── 13. 토스트 알림 ─────────────────────────────────────────────
function showToast(message) {
  const toast = document.getElementById('admin-toast');
  toast.textContent = message;
  toast.style.display = 'block';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 4000);
}

// ─── 14. 로그아웃 ────────────────────────────────────────────────
document.getElementById('btn-logout').addEventListener('click', async () => {
  await fetch('/api/game/admin/logout', { method: 'POST' });
  window.location.href = '/game/admin-login.html';
});

// ─── 15. 이벤트 바인딩 ───────────────────────────────────────────

// 스테이지 추가 버튼
btnAddStage.addEventListener('click', openAddModal);
document.getElementById('btn-cancel-add').addEventListener('click', closeAddModal);
document.getElementById('btn-confirm-add').addEventListener('click', confirmAddStage);
newStageTitleInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmAddStage(); });

// 스테이지 삭제 확인
document.getElementById('btn-cancel-delete').addEventListener('click', closeDeleteModal);
document.getElementById('btn-confirm-delete').addEventListener('click', confirmDeleteStage);

// 모달 배경 클릭으로 닫기
modalAddStage.addEventListener('click', (e) => { if (e.target === modalAddStage) closeAddModal(); });
modalDeleteStage.addEventListener('click', (e) => { if (e.target === modalDeleteStage) closeDeleteModal(); });

// 틀린 그림 슬롯 추가
document.getElementById('btn-add-slot').addEventListener('click', addDiffSlot);

// 워크벤치 클릭 → 좌표 핑
workbenchLeft.addEventListener('click', (e) => handleWorkbenchClick(e, workbenchLeft));
workbenchRight.addEventListener('click', (e) => handleWorkbenchClick(e, workbenchRight));

// 이미지 파일 업로드
fileAInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0)
    uploadImageFile(e.target.files[0], 'a', statusA, previewImgLeft, placeholderLeft);
});
fileBInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0)
    uploadImageFile(e.target.files[0], 'b', statusB, previewImgRight, placeholderRight);
});

// 설정 저장
btnSaveConfig.addEventListener('click', saveAllConfig);

// ─── 초기화 ──────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', loadConfig);
