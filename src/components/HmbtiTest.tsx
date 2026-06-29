'use client';

import { useEffect, useMemo, useState } from 'react';

type Step = 'intro' | 'question' | 'result';

type Question = {
  title: string;
  a: string;
  b: string;
  chant: string;
};

type ResultType = {
  min: number;
  max: number;
  label: string;
  title: string;
  description: string;
  chant: string;
  icon: string;
};

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share?: {
        sendDefault: (options: unknown) => void;
      };
      Link?: {
        sendDefault: (options: unknown) => void;
      };
    };
  }
}

const kakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

const questions: Question[] = [
  {
    title: '후배가 내 방식보다 더 효율적인 방법을 냈다. 나는?',
    a: '"내가 책임질게." 일단 원래 계획대로 밀고 간다.',
    b: '"오, 들어보자." 바로 조율하고 수정한다.',
    chant: '벤치에서 의견 충돌 발생!',
  },
  {
    title: '스타급 인재가 우리 팀에 들어왔다. 첫 반응은?',
    a: '"규율부터." 팀 분위기에 먼저 맞추게 한다.',
    b: '"판 깔아줄게." 장점을 바로 살려준다.',
    chant: '스타 선수 입단 기자회견!',
  },
  {
    title: '"구식이다"라는 비판이 쏟아진다. 내 선택은?',
    a: '"흔들리지 않는다." 내 신념과 마이웨이를 지킨다.',
    b: '"업데이트할 때인가?" 방식을 다시 점검한다.',
    chant: '댓글창이 흔들립니다!',
  },
  {
    title: '결과가 망했다. 인터뷰에서 내 머릿속은?',
    a: '"기강 문제다." 다음엔 더 강하게 잡아야겠다.',
    b: '"내 전략 문제다." 소통과 판단을 돌아본다.',
    chant: '경기 후 인터뷰 타임!',
  },
  {
    title: '중요한 결정을 앞둔 순간, 내가 믿는 건?',
    a: '과거의 성공 경험과 내 사람들의 의리.',
    b: '최신 데이터와 객관적인 실력 지표.',
    chant: '마지막 승부차기!',
  },
];

const results: ResultType[] = [
  {
    min: 0,
    max: 25,
    label: '순도 0% 오픈마인드',
    title: '자유로운 전술가형',
    description:
      '권위보다 대화, 관성보다 업데이트를 믿는 타입입니다. 팀원이 더 좋은 아이디어를 내면 곧장 판을 다시 짜는 유연함이 강점이에요.',
    chant: '전술판에 포스트잇이 20장 붙어도 웃으면서 회의 가능',
    icon: '⚽',
  },
  {
    min: 26,
    max: 50,
    label: '실리 위주 겉바속촉',
    title: '하이브리드 조율자형',
    description:
      '기본 원칙은 지키되, 필요하면 빠르게 방향을 트는 현실형 리더입니다. 조직의 안정감과 구성원의 자율성을 동시에 챙기려는 편이에요.',
    chant: '원칙은 챙기고, 분위기는 살리고, 회식 메뉴도 조율',
    icon: '📋',
  },
  {
    min: 51,
    max: 75,
    label: '묵직한 카리스마',
    title: '마이웨이 뚝심 리더형',
    description:
      '한번 정한 방향은 쉽게 흔들리지 않는 타입입니다. 추진력은 강하지만, 가끔은 주변의 신호를 전술판 위에 함께 올려보면 더 좋아요.',
    chant: '벤치에서 팔짱 끼면 팀원들이 갑자기 자세를 고쳐 앉음',
    icon: '👔',
  },
  {
    min: 76,
    max: 100,
    label: '순도 100%',
    title: '명보 오리지널! 원팀 지상주의자형',
    description:
      '원팀, 규율, 의리, 마이웨이가 전부 선발 출전했습니다. 이쯤이면 테스트가 아니라 본인 확인입니다.',
    chant: '전술보다 중요한 건 눈빛, 분위기, 그리고 원팀 구호',
    icon: '🏟️',
  },
];

function getResult(score: number) {
  return results.find((result) => score >= result.min && score <= result.max) ?? results[0];
}

function getSharedScore() {
  if (typeof window === 'undefined') return null;

  const rawScore = new URLSearchParams(window.location.search).get('score');
  if (!rawScore) return null;

  const parsedScore = Number(rawScore);
  if (!Number.isFinite(parsedScore)) return null;

  return Math.min(100, Math.max(0, Math.round(parsedScore / 20) * 20));
}

function loadKakaoSdk() {
  if (typeof window === 'undefined' || !kakaoJsKey) return Promise.resolve(false);
  if (window.Kakao) return Promise.resolve(true);

  return new Promise<boolean>((resolve) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-hmbti-kakao-sdk]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(Boolean(window.Kakao)), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
    script.async = true;
    script.dataset.hmbtiKakaoSdk = 'true';
    script.onload = () => resolve(Boolean(window.Kakao));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export default function HmbtiTest() {
  const [step, setStep] = useState<Step>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = step === 'question' ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const result = useMemo(() => getResult(score), [score]);

  useEffect(() => {
    const sharedScore = getSharedScore();
    if (sharedScore === null) return;

    setScore(sharedScore);
    setStep('result');
  }, []);

  useEffect(() => {
    if (step !== 'result' || typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    url.searchParams.set('score', String(score));
    window.history.replaceState(null, '', url.toString());
  }, [score, step]);

  const startTest = () => {
    setStep('question');
    setCurrentIndex(0);
    setScore(0);
    setCopied(false);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('score');
      window.history.replaceState(null, '', url.toString());
    }
  };

  const answerQuestion = (point: number) => {
    const nextScore = score + point;

    if (currentIndex === questions.length - 1) {
      setScore(nextScore);
      setStep('result');
      return;
    }

    setScore(nextScore);
    setCurrentIndex((index) => index + 1);
  };

  const copyResultLink = async () => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    url.searchParams.set('score', String(score));
    const link = url.toString();

    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      textArea.setAttribute('readonly', '');
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const shareToKakao = async () => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    url.searchParams.set('score', String(score));
    const shareUrl = url.toString();
    const shareText = `내 홍명보 지수는 ${score}점! ${result.title} 나왔습니다. 당신의 HMBTI도 확인해보세요.`;

    const hasKakao = await loadKakaoSdk();
    if (!hasKakao || !window.Kakao || !kakaoJsKey) {
      await copyResultLink();
      return;
    }

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoJsKey);
    }

    const shareOptions = {
      objectType: 'text',
      text: shareText,
      link: {
        mobileWebUrl: shareUrl,
        webUrl: shareUrl,
      },
      buttonTitle: '테스트 하러가기',
    };

    try {
      if (window.Kakao.Share) {
        window.Kakao.Share.sendDefault(shareOptions);
      } else if (window.Kakao.Link) {
        window.Kakao.Link.sendDefault(shareOptions);
      } else {
        await copyResultLink();
      }
    } catch {
      await copyResultLink();
    }
  };

  return (
    <div id="hmbti-app-container">
      <section className="hmbti-wrapper" aria-label="홍명보 지수 테스트">
        <div className="hmbti-shell">
          <div className="hmbti-bg-mark hmbti-bg-mark-left" aria-hidden="true">⚡</div>
          <div className="hmbti-bg-mark hmbti-bg-mark-right" aria-hidden="true">💥</div>
          <div className="hmbti-cloud hmbti-cloud-one" aria-hidden="true" />
          <div className="hmbti-cloud hmbti-cloud-two" aria-hidden="true" />

          {step === 'intro' && (
            <div className="hmbti-panel hmbti-intro">
              <div className="hmbti-brand">HMBTI</div>
              <div className="hmbti-sticker hmbti-sticker-red" aria-hidden="true">삐-익!</div>
              <div className="hmbti-sticker hmbti-sticker-blue" aria-hidden="true">원팀?</div>
              <div className="hmbti-title-stack">
                <span className="hmbti-title-red">홍명보 지수</span>
                <h1>밈 테스트</h1>
              </div>
              <p className="hmbti-subtitle">방구석 감독 자격증 발급받기</p>

              <img
                className="hmbti-main-banner"
                src="/images/hmbti/hmbti-ban-banner.png"
                alt="홍명보는 테스트 금지 출입금지 표지판 밈 배너"
              />

              <button type="button" className="hmbti-main-button" onClick={startTest}>
                시작하기
                <span>국대 감독직 뺏으러 가기</span>
              </button>
            </div>
          )}

          {step === 'question' && (
            <div className="hmbti-panel hmbti-question-card">
              <div className="hmbti-score-strip">
                <span>LIVE {currentIndex + 1}R</span>
                <strong>{score}점</strong>
              </div>
              <div className="hmbti-progress" aria-hidden="true">
                <span style={{ width: `${progress}%` }} />
              </div>

              <div className="hmbti-question-bubble">
                <p>{currentQuestion.chant}</p>
                <h2>{currentQuestion.title}</h2>
              </div>

              <div className="hmbti-answers">
                <button type="button" className="hmbti-answer-a" onClick={() => answerQuestion(20)}>
                  <b>A</b>
                  <span>
                    <em>뚝심 모드</em>
                    {currentQuestion.a}
                  </span>
                </button>
                <button type="button" className="hmbti-answer-b" onClick={() => answerQuestion(0)}>
                  <b>B</b>
                  <span>
                    <em>조율 모드</em>
                    {currentQuestion.b}
                  </span>
                </button>
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="hmbti-panel hmbti-result-card">
              <div className="hmbti-result-badge">{result.label}</div>
              <div className="hmbti-result-icon" aria-hidden="true">{result.icon}</div>
              <h2>{result.title}</h2>

              <div className="hmbti-score-board">
                <span>홍명보 지수</span>
                <strong>{score}</strong>
                <small>점</small>
                <div className="hmbti-score-meter" aria-hidden="true">
                  <span style={{ width: `${score}%` }} />
                </div>
              </div>

              <p className="hmbti-result-chant">"{result.chant}"</p>
              <p className="hmbti-result-description">{result.description}</p>

              <div className="hmbti-actions">
                <button type="button" className="hmbti-kakao-button" onClick={shareToKakao}>
                  카카오톡 공유하기
                  <span>친구 단톡방에 바로 킥오프</span>
                </button>
                <button type="button" className="hmbti-main-button" onClick={copyResultLink}>
                  {copied ? '복사 완료!' : '결과 링크 복사하기'}
                  <span>{copied ? '친구에게 바로 패스 가능' : '내 결과 단독 공유하기'}</span>
                </button>
                <button type="button" className="hmbti-retry-button" onClick={startTest}>
                  다시 테스트하기
                </button>
              </div>

              <p className="hmbti-disclaimer">
                본 테스트는 최근 대중적인 축구 밈(Meme)과 리더십 스타일을 바탕으로 제작된
                유희용 스낵 콘텐츠입니다. 특정 인물에 대한 비방이나 명예훼손의 의도가 없으며,
                실제 인물의 성격이나 사실관계와는 무관합니다.
              </p>
            </div>
          )}
        </div>

        <style jsx>{`
          .hmbti-wrapper {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            color: #17233f;
            font-family: inherit;
          }

          .hmbti-wrapper * {
            box-sizing: border-box;
          }

          .hmbti-shell {
            position: relative;
            overflow: hidden;
            min-height: 760px;
            border: 2px solid #17233f;
            border-radius: 8px;
            background:
              linear-gradient(180deg, rgba(62, 184, 213, 0.88) 0%, rgba(117, 211, 166, 0.72) 48%, rgba(255, 225, 121, 0.76) 100%),
              repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.2) 0 2px, transparent 2px 92px);
            box-shadow: 0 26px 0 #14274b, 0 34px 60px rgba(20, 39, 75, 0.28);
          }

          .hmbti-shell::before,
          .hmbti-shell::after {
            content: '';
            position: absolute;
            left: -12%;
            right: -12%;
            height: 26px;
            background: repeating-linear-gradient(
              -12deg,
              rgba(20, 39, 75, 0.5) 0 10px,
              transparent 10px 70px
            );
            filter: blur(1px);
            opacity: 0.55;
            transform: rotate(-5deg);
          }

          .hmbti-shell::before {
            top: 42px;
          }

          .hmbti-shell::after {
            bottom: 116px;
            transform: rotate(4deg);
          }

          .hmbti-panel {
            position: relative;
            z-index: 1;
            min-height: 760px;
            padding: 54px 26px 32px;
          }

          .hmbti-bg-mark {
            position: absolute;
            z-index: 1;
            color: #df1835;
            font-size: 116px;
            line-height: 1;
            text-shadow: -5px 5px 0 #fff2b8, 0 8px 0 #17233f;
            pointer-events: none;
          }

          .hmbti-bg-mark-left {
            left: -28px;
            bottom: 150px;
            transform: rotate(-24deg);
          }

          .hmbti-bg-mark-right {
            right: -22px;
            top: 240px;
            transform: rotate(18deg);
          }

          .hmbti-cloud {
            position: absolute;
            z-index: 0;
            width: 190px;
            height: 58px;
            border-radius: 999px;
            background: #fff0bf;
            opacity: 0.95;
          }

          .hmbti-cloud::before,
          .hmbti-cloud::after {
            content: '';
            position: absolute;
            bottom: 22px;
            border-radius: 50%;
            background: inherit;
          }

          .hmbti-cloud::before {
            left: 28px;
            width: 68px;
            height: 68px;
          }

          .hmbti-cloud::after {
            right: 22px;
            width: 92px;
            height: 92px;
          }

          .hmbti-cloud-one {
            right: -42px;
            top: 92px;
          }

          .hmbti-cloud-two {
            left: -58px;
            top: 286px;
            width: 250px;
          }

          .hmbti-intro,
          .hmbti-result-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .hmbti-brand {
            margin-bottom: 24px;
            color: #ffffff;
            font-size: 34px;
            font-weight: 900;
            letter-spacing: 0;
            text-shadow: 0 4px 0 rgba(23, 35, 63, 0.28);
          }

          .hmbti-title-stack {
            position: relative;
            display: grid;
            justify-items: center;
            margin-bottom: 12px;
          }

          .hmbti-title-red {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 248px;
            min-height: 60px;
            padding: 8px 22px;
            border-radius: 8px 8px 0 0;
            background: #df1835;
            color: #ffffff;
            font-size: 38px;
            font-weight: 1000;
            line-height: 1;
            box-shadow: 0 7px 0 #17233f;
          }

          .hmbti-title-stack h1 {
            position: relative;
            z-index: 1;
            width: min(100%, 420px);
            margin: -2px 0 0;
            padding: 12px 16px 16px;
            border: 7px solid #17233f;
            border-radius: 8px 26px 26px 26px;
            background: #ffffff;
            color: #17233f;
            font-size: 56px;
            font-weight: 1000;
            line-height: 1;
            letter-spacing: 0;
            box-shadow: 0 8px 0 rgba(23, 35, 63, 0.24);
          }

          .hmbti-title-stack h1::after {
            content: '';
            position: absolute;
            left: 25px;
            bottom: -44px;
            width: 38px;
            height: 44px;
            background: #ffffff;
            border-left: 7px solid #17233f;
            border-bottom: 7px solid #17233f;
            transform: skewY(-18deg);
          }

          .hmbti-subtitle {
            margin: 14px 0 26px;
            padding: 10px 16px;
            border-radius: 8px;
            background: #17233f;
            color: #ffffff;
            font-size: 20px;
            font-weight: 900;
            line-height: 1.45;
          }

          .hmbti-sticker {
            position: absolute;
            z-index: 3;
            display: grid;
            place-items: center;
            min-width: 64px;
            min-height: 44px;
            padding: 7px 10px;
            border: 3px solid #17233f;
            border-radius: 999px;
            color: #ffffff;
            font-size: 14px;
            font-weight: 1000;
            box-shadow: 0 4px 0 #17233f;
          }

          .hmbti-sticker-red {
            left: 50px;
            top: 158px;
            background: #df1835;
            transform: rotate(-13deg);
          }

          .hmbti-sticker-blue {
            right: 50px;
            top: 214px;
            background: #4666ff;
            transform: rotate(12deg);
          }

          .hmbti-main-banner {
            position: relative;
            z-index: 2;
            display: block;
            width: min(100%, 430px);
            aspect-ratio: 1200 / 630;
            margin: 14px auto 24px;
            border: 6px solid #17233f;
            border-radius: 8px;
            background: #ffffff;
            box-shadow: 0 9px 0 rgba(23, 35, 63, 0.24);
            object-fit: cover;
          }

          .hmbti-mascot {
            position: relative;
            width: min(100%, 345px);
            height: 285px;
            margin: 18px auto 24px;
          }

          .hmbti-face {
            position: absolute;
            left: 50%;
            top: 22px;
            width: 210px;
            height: 168px;
            border: 5px solid #17233f;
            border-radius: 48% 48% 44% 44%;
            background: #e8f0f4;
            transform: translateX(-50%);
            box-shadow: 0 0 0 8px #ffffff, 0 12px 0 rgba(23, 35, 63, 0.16);
          }

          .hmbti-face::before,
          .hmbti-face::after {
            content: '';
            position: absolute;
            top: 38px;
            width: 76px;
            height: 86px;
            border: 5px solid #17233f;
            border-radius: 50%;
            background: #dbe8ee;
          }

          .hmbti-face::before {
            left: -62px;
          }

          .hmbti-face::after {
            right: -62px;
          }

          .hmbti-eye {
            position: absolute;
            top: 76px;
            width: 28px;
            height: 12px;
            border-bottom: 4px solid #17233f;
            border-radius: 50%;
          }

          .hmbti-eye-left {
            left: 52px;
          }

          .hmbti-eye-right {
            right: 52px;
          }

          .hmbti-mouth {
            position: absolute;
            left: 50%;
            bottom: 36px;
            width: 42px;
            height: 20px;
            border-bottom: 4px solid #17233f;
            border-radius: 50%;
            transform: translateX(-50%);
          }

          .hmbti-board {
            position: absolute;
            left: 50%;
            bottom: 10px;
            width: 190px;
            height: 116px;
            border: 5px solid #17233f;
            border-radius: 8px;
            background: #2e7d32;
            transform: translateX(-50%) rotate(-4deg);
            box-shadow: 0 0 0 8px #ffffff;
          }

          .hmbti-board span {
            position: absolute;
            left: 14px;
            top: 10px;
            color: #ffffff;
            font-size: 22px;
            font-weight: 1000;
          }

          .hmbti-board i {
            position: absolute;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #fff24f;
          }

          .hmbti-board i:nth-child(2) {
            left: 86px;
            top: 54px;
          }

          .hmbti-board i:nth-child(3) {
            left: 132px;
            top: 78px;
          }

          .hmbti-board i:nth-child(4) {
            left: 52px;
            top: 78px;
          }

          .hmbti-whistle {
            position: absolute;
            right: 38px;
            bottom: 70px;
            display: grid;
            place-items: center;
            width: 62px;
            height: 62px;
            border: 5px solid #17233f;
            border-radius: 50%;
            background: #ffde59;
            font-size: 30px;
            box-shadow: 0 0 0 7px #ffffff;
          }

          .hmbti-main-button,
          .hmbti-kakao-button,
          .hmbti-retry-button,
          .hmbti-answers button {
            position: relative;
            z-index: 2;
            width: 100%;
            border: 0;
            cursor: pointer;
            font: inherit;
            letter-spacing: 0;
            transition:
              transform 160ms ease,
              box-shadow 160ms ease;
          }

          .hmbti-main-button {
            display: grid;
            place-items: center;
            gap: 4px;
            min-height: 98px;
            margin-top: auto;
            border: 4px solid #ffffff;
            border-radius: 999px;
            background: #df1835;
            color: #ffffff;
            font-size: 30px;
            font-weight: 1000;
            box-shadow: 0 8px 0 #17233f;
          }

          .hmbti-main-button span {
            font-size: 14px;
            font-weight: 800;
          }

          .hmbti-main-button:hover,
          .hmbti-kakao-button:hover,
          .hmbti-retry-button:hover,
          .hmbti-answers button:hover {
            transform: translateY(-2px);
          }

          .hmbti-main-button:focus-visible,
          .hmbti-kakao-button:focus-visible,
          .hmbti-retry-button:focus-visible,
          .hmbti-answers button:focus-visible {
            outline: 4px solid #fff24f;
            outline-offset: 4px;
          }

          .hmbti-question-card {
            display: flex;
            flex-direction: column;
          }

          .hmbti-score-strip {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 12px;
            color: #17233f;
            font-size: 18px;
            font-weight: 1000;
          }

          .hmbti-score-strip span {
            padding: 8px 12px;
            border: 3px solid #17233f;
            border-radius: 999px;
            background: #fff24f;
            box-shadow: 0 4px 0 #17233f;
          }

          .hmbti-score-strip strong {
            padding: 8px 12px;
            border-radius: 999px;
            background: #17233f;
            color: #ffffff;
          }

          .hmbti-progress,
          .hmbti-score-meter {
            position: relative;
            z-index: 2;
            overflow: hidden;
            width: 100%;
            height: 16px;
            border: 3px solid #17233f;
            border-radius: 999px;
            background: #ffffff;
          }

          .hmbti-progress span,
          .hmbti-score-meter span {
            display: block;
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(90deg, #df1835, #ffde59);
            transition: width 220ms ease;
          }

          .hmbti-question-bubble {
            position: relative;
            z-index: 2;
            margin: 34px 0 22px;
            padding: 24px 22px 26px;
            border: 6px solid #17233f;
            border-radius: 8px 26px 26px;
            background: #ffffff;
            box-shadow: 0 8px 0 rgba(23, 35, 63, 0.24);
          }

          .hmbti-question-bubble::after {
            content: '';
            position: absolute;
            left: 28px;
            bottom: -34px;
            width: 32px;
            height: 34px;
            border-left: 6px solid #17233f;
            border-bottom: 6px solid #17233f;
            background: #ffffff;
            transform: skewY(-20deg);
          }

          .hmbti-question-bubble p {
            display: inline-block;
            margin: 0 0 12px;
            padding: 7px 11px;
            border-radius: 8px;
            background: #df1835;
            color: #ffffff;
            font-size: 15px;
            font-weight: 1000;
          }

          .hmbti-question-bubble h2 {
            margin: 0;
            color: #101b34;
            font-size: 28px;
            font-weight: 1000;
            line-height: 1.3;
            word-break: keep-all;
          }

          .hmbti-answers {
            position: relative;
            z-index: 2;
            display: grid;
            gap: 14px;
            margin-top: auto;
          }

          .hmbti-answers button {
            display: grid;
            grid-template-columns: 48px 1fr;
            align-items: center;
            gap: 13px;
            min-height: 104px;
            padding: 16px;
            border: 4px solid #17233f;
            border-radius: 18px;
            color: #101b34;
            text-align: left;
            box-shadow: 0 6px 0 #17233f;
          }

          .hmbti-answer-a {
            background: #fff05f;
          }

          .hmbti-answer-b {
            background: #ffffff;
          }

          .hmbti-answers b {
            display: grid;
            place-items: center;
            width: 48px;
            height: 48px;
            border: 3px solid #17233f;
            border-radius: 50%;
            background: #df1835;
            color: #ffffff;
            font-size: 22px;
            font-weight: 1000;
          }

          .hmbti-answers span {
            display: grid;
            gap: 6px;
            font-size: 17px;
            font-weight: 900;
            line-height: 1.45;
            word-break: keep-all;
          }

          .hmbti-answers em {
            color: #b70f27;
            font-style: normal;
            font-size: 14px;
            font-weight: 1000;
          }

          .hmbti-result-card {
            padding-top: 42px;
          }

          .hmbti-result-badge {
            margin-bottom: 12px;
            padding: 8px 13px;
            border: 3px solid #17233f;
            border-radius: 999px;
            background: #fff24f;
            color: #17233f;
            font-size: 14px;
            font-weight: 1000;
            box-shadow: 0 4px 0 #17233f;
          }

          .hmbti-result-icon {
            display: grid;
            place-items: center;
            width: 118px;
            height: 118px;
            margin-bottom: 16px;
            border: 6px solid #17233f;
            border-radius: 50%;
            background: #ffffff;
            font-size: 58px;
            box-shadow: 0 0 0 8px #df1835, 0 9px 0 #17233f;
          }

          .hmbti-result-card h2 {
            width: min(100%, 430px);
            margin: 0;
            padding: 12px 16px;
            border: 6px solid #17233f;
            border-radius: 8px 26px 26px;
            background: #ffffff;
            color: #17233f;
            font-size: 32px;
            font-weight: 1000;
            line-height: 1.18;
            word-break: keep-all;
            box-shadow: 0 8px 0 rgba(23, 35, 63, 0.24);
          }

          .hmbti-score-board {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 400px;
            margin: 22px 0 16px;
            padding: 20px 18px 18px;
            border: 5px solid #17233f;
            border-radius: 18px;
            background: #2e7d32;
            color: #ffffff;
            box-shadow: 0 6px 0 #17233f;
          }

          .hmbti-score-board span {
            display: block;
            margin-bottom: 4px;
            font-size: 18px;
            font-weight: 1000;
            line-height: 1.1;
          }

          .hmbti-score-board strong {
            font-size: 72px;
            font-weight: 1000;
            line-height: 1;
          }

          .hmbti-score-board small {
            margin-left: 4px;
            font-size: 28px;
            font-weight: 1000;
          }

          .hmbti-result-chant,
          .hmbti-result-description {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 450px;
            margin: 0 0 12px;
            color: #101b34;
            font-weight: 900;
            line-height: 1.65;
            word-break: keep-all;
          }

          .hmbti-result-chant {
            padding: 12px 14px;
            border-radius: 8px;
            background: #ffffff;
            font-size: 17px;
          }

          .hmbti-result-description {
            padding: 14px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.9);
            font-size: 16px;
          }

          .hmbti-actions {
            position: relative;
            z-index: 2;
            display: grid;
            width: 100%;
            gap: 10px;
            margin-top: auto;
          }

          .hmbti-kakao-button,
          .hmbti-retry-button {
            min-height: 54px;
            border: 4px solid #17233f;
            border-radius: 999px;
            color: #17233f;
            font-size: 18px;
            font-weight: 1000;
            box-shadow: 0 5px 0 #17233f;
          }

          .hmbti-kakao-button {
            display: grid;
            place-items: center;
            gap: 2px;
            min-height: 76px;
            background: #fee500;
          }

          .hmbti-kakao-button span {
            font-size: 13px;
            font-weight: 900;
          }

          .hmbti-retry-button {
            background: #ffffff;
          }

          .hmbti-disclaimer {
            position: relative;
            z-index: 2;
            margin: 18px 0 0;
            padding: 12px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.78);
            color: rgba(23, 35, 63, 0.76);
            font-size: 11px;
            font-weight: 700;
            line-height: 1.55;
            word-break: keep-all;
          }

          @media (max-width: 480px) {
            .hmbti-shell,
            .hmbti-panel {
              min-height: 720px;
            }

            .hmbti-panel {
              padding: 42px 18px 26px;
            }

            .hmbti-brand {
              margin-bottom: 18px;
              font-size: 28px;
            }

            .hmbti-title-red {
              min-width: 212px;
              min-height: 52px;
              font-size: 31px;
            }

            .hmbti-title-stack h1 {
              font-size: 43px;
            }

            .hmbti-subtitle {
              font-size: 16px;
            }

            .hmbti-sticker-red {
              left: 22px;
              top: 132px;
            }

            .hmbti-sticker-blue {
              right: 18px;
              top: 190px;
            }

            .hmbti-main-banner {
              width: 100%;
              margin: 8px auto 18px;
              border-width: 5px;
            }

            .hmbti-mascot {
              height: 255px;
              transform: scale(0.92);
              transform-origin: top center;
            }

            .hmbti-main-button {
              min-height: 88px;
              font-size: 26px;
            }

            .hmbti-question-bubble h2 {
              font-size: 23px;
            }

            .hmbti-answers button {
              grid-template-columns: 42px 1fr;
              min-height: 104px;
              padding: 12px;
            }

            .hmbti-answers b {
              width: 42px;
              height: 42px;
            }

            .hmbti-answers span {
              font-size: 15px;
            }

            .hmbti-result-card h2 {
              font-size: 27px;
            }

            .hmbti-score-board strong {
              font-size: 60px;
            }
          }
        `}</style>
      </section>
    </div>
  );
}
