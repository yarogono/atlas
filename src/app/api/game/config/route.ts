import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// stages.json 파일 경로 설정
const configPath = path.join(process.cwd(), 'public', 'game', 'stages.json');

// 기본 설정 값
const defaultConfig = {
  maxStage: 3,
  baseIq: 150,
  baseBrainAge: 20,
  stages: {
    "1": { timeLimit: 60, agingInterval: 2.0, hitRadius: 10.0 },
    "2": { timeLimit: 50, agingInterval: 1.2, hitRadius: 8.0 },
    "3": { timeLimit: 40, agingInterval: 0.8, hitRadius: 6.0 }
  },
  backgrounds: {
    "1": {
      title: "한옥 마당",
      imgTop: "/game/images/stage1_a.png",
      imgBottom: "/game/images/stage1_b.png",
      differences: [
        { x: 11.7, y: 8.8, name: "구름" },
        { x: 87.6, y: 42.2, name: "감 열매" },
        { x: 22.4, y: 63.5, name: "찻잔" }
      ]
    },
    "2": {
      title: "시골 기와집",
      imgTop: "/game/images/stage2_a.png",
      imgBottom: "/game/images/stage2_b.png",
      differences: [
        { x: 33.4, y: 11.2, name: "구름" },
        { x: 61.0, y: 40.8, name: "전신주" },
        { x: 89.8, y: 64.2, name: "농부" }
      ]
    },
    "3": {
      title: "전통 밥상",
      imgTop: "/game/images/stage3_a.png",
      imgBottom: "/game/images/stage3_b.png",
      differences: [
        { x: 35.2, y: 31.7, name: "족자 그림" },
        { x: 55.2, y: 27.8, name: "바구니" },
        { x: 50.3, y: 10.5, name: "천장 등" }
      ]
    }
  }
};

// ─── 공통 유틸 ────────────────────────────────────────────────

function readConfig(): any {
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
    return JSON.parse(JSON.stringify(defaultConfig));
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function writeConfig(config: any) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

// ─── GET: 현재 설정 반환 ──────────────────────────────────────

export async function GET() {
  try {
    const config = readConfig();
    return NextResponse.json(config);
  } catch (error: any) {
    console.error('Config GET error:', error);
    return NextResponse.json({ error: error.message || '설정을 읽는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// ─── POST: 전체 설정 저장 ─────────────────────────────────────

export async function POST(req: Request) {
  try {
    const newConfig = await req.json();
    if (!newConfig || !newConfig.stages || !newConfig.backgrounds) {
      return NextResponse.json({ error: '잘못된 형식의 설정 데이터입니다.' }, { status: 400 });
    }
    writeConfig(newConfig);
    return NextResponse.json({ success: true, message: '설정이 성공적으로 저장되었습니다.' });
  } catch (error: any) {
    console.error('Config POST error:', error);
    return NextResponse.json({ error: error.message || '설정을 저장하는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// ─── PATCH: 스테이지 추가 ─────────────────────────────────────
// body: { action: "add", title: "스테이지 이름" }

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    if (body.action !== 'add') {
      return NextResponse.json({ error: '지원하지 않는 action입니다.' }, { status: 400 });
    }

    const title = (body.title || '').trim();
    if (!title) {
      return NextResponse.json({ error: '스테이지 이름을 입력해주세요.' }, { status: 400 });
    }

    const config = readConfig();
    const newId = String(config.maxStage + 1);

    // 신규 스테이지 기본값
    config.stages[newId] = {
      timeLimit: 60,
      agingInterval: 2.0,
      hitRadius: 10.0
    };
    config.backgrounds[newId] = {
      title,
      imgTop: '',
      imgBottom: '',
      differences: []
    };
    config.maxStage = config.maxStage + 1;

    writeConfig(config);
    return NextResponse.json({ success: true, newStageId: newId, config });
  } catch (error: any) {
    console.error('Config PATCH error:', error);
    return NextResponse.json({ error: error.message || '스테이지 추가 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// ─── DELETE: 스테이지 삭제 + 재넘버링 ───────────────────────
// query: ?stageId=N

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const stageId = url.searchParams.get('stageId');

    if (!stageId) {
      return NextResponse.json({ error: 'stageId 쿼리 파라미터가 필요합니다.' }, { status: 400 });
    }

    const config = readConfig();

    // 최소 1개 스테이지 보장
    if (config.maxStage <= 1) {
      return NextResponse.json({ error: '최소 1개의 스테이지는 유지해야 합니다.' }, { status: 400 });
    }

    // 대상 스테이지 존재 확인
    if (!config.stages[stageId] || !config.backgrounds[stageId]) {
      return NextResponse.json({ error: `스테이지 ${stageId}를 찾을 수 없습니다.` }, { status: 404 });
    }

    // 삭제 대상 제거
    delete config.stages[stageId];
    delete config.backgrounds[stageId];

    // 삭제 후 남은 스테이지를 1부터 순서대로 재넘버링
    const remainingIds = Object.keys(config.stages)
      .map(Number)
      .sort((a, b) => a - b);

    const newStages: Record<string, any> = {};
    const newBackgrounds: Record<string, any> = {};

    remainingIds.forEach((oldId, index) => {
      const newKey = String(index + 1);
      newStages[newKey] = config.stages[String(oldId)];
      newBackgrounds[newKey] = config.backgrounds[String(oldId)];
    });

    config.stages = newStages;
    config.backgrounds = newBackgrounds;
    config.maxStage = remainingIds.length;

    writeConfig(config);
    return NextResponse.json({ success: true, maxStage: config.maxStage, config });
  } catch (error: any) {
    console.error('Config DELETE error:', error);
    return NextResponse.json({ error: error.message || '스테이지 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
