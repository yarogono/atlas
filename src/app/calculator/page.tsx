import { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '실시간 금융·생활 계산기 모음 | 복지지원금24시',
  description: '주식·코인 평단가(물타기) 계산기, 정부지원금 3초 계산기 등 일상과 재테크에 꼭 필요한 스마트 실시간 계산기 도구들을 한자리에서 편리하게 이용해 보세요.',
  openGraph: {
    title: '스마트 실시간 계산기 모음 | 복지지원금24시',
    description: '주식·코인 평단가(물타기) 계산기, 정부지원금 3초 계산기 등 일상과 재테크에 꼭 필요한 스마트 실시간 계산기 도구 모음.',
    url: '/calculator',
  },
  twitter: {
    card: 'summary_large_image',
    title: '스마트 실시간 계산기 모음 | 복지지원금24시',
    description: '주식·코인 평단가(물타기) 계산기, 정부지원금 3초 계산기 등 일상과 재테크에 꼭 필요한 스마트 실시간 계산기 도구 모음.',
  },
  alternates: {
    canonical: '/calculator',
  }
};

export default function CalculatorHubPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '실시간 금융·생활 계산기 모음',
    description: '주식·코인 평단가(물타기) 계산기, 정부지원금 3초 계산기 등 일상과 재테크에 꼭 필요한 스마트 계산기 모음 페이지.',
    url: `${baseUrl}/calculator`
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '계산기 목록',
        item: `${baseUrl}/calculator`
      }
    ]
  };

  const calculators = [
    {
      id: 'compound-interest',
      title: '📈 간편 복리계산기',
      subtitle: '주식 · 코인 · 적립식 복리 이자 시뮬레이터',
      description: '초기 원금과 매 회차 정기 납입금에 복리 수익률을 적용하여 최종 자산을 계산합니다. 일복리, 월복리, 연복리 효과를 마우스 오버 툴팁이 탑재된 실시간 반응형 차트 및 회차별 시뮬레이션 상세 리포트로 편리하게 점검해 보세요.',
      url: '/calculator/compound-interest',
      category: '재테크 · 금융',
      tag: '인기 🔥',
      badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
    },
    {
      id: 'stock-average',
      title: '📉 주식·코인 평단가 계산기',
      subtitle: '물타기 평균단가 실시간 시뮬레이터',
      description: '보유한 주식이나 가상화폐를 추가로 매입할 때 최종 평균 단가를 즉시 계산합니다. 로컬 백업, 실시간 천 단위 콤마 포맷팅, 다중 차수 물타기 및 목표 평단가 도달을 위한 매수량 역산 기능까지 완벽하게 지원합니다.',
      url: '/calculator/stock-average',
      category: '재테크 · 금융',
      tag: '인기 🔥',
      badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
    },
    {
      id: 'transfer-tax',
      title: '🏠 부동산 양도소득세 계산기',
      subtitle: '양도세 비과세 · 공동명의 절세 시뮬레이터',
      description: '부동산(주택, 분양권, 토지 등) 양도 시 발생하는 세금을 최신 개정 세법 기준으로 정밀 산출합니다. 1세대 1주택 12억 비과세 고가주택 안분비례 계산, 보유/거주 기간별 장특공제율 자동 적용, 부부 공동명의 50% 분할 시 절세 체감 비교 기능을 담았습니다.',
      url: '/calculator/transfer-tax',
      category: '부동산 · 세금',
      tag: '인기 🔥',
      badgeColor: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400'
    },
    {
      id: 'subsidy',
      title: '💰 정부지원금 3초 계산기',
      subtitle: '맞춤형 지원 복지 지원금 즉시 조회',
      description: '복잡한 증빙 서류나 공인인증서 없이, 만 나이, 직업 상태, 소득 수준 및 거주 지역 등 4가지 필수 정보만을 기반으로 내가 받을 수 있는 정부 지원금과 청년 혜택 예상 수령액을 3초 만에 빠르게 연산해 줍니다.',
      url: '/calculator/subsidy',
      category: '정부정책 · 복지',
      tag: '추천 ⭐',
      badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 transition-all duration-300">
      <Script id="calc-hub-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script id="calc-hub-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* 히어로 영역 */}
      <div className="text-center mb-16 space-y-4">
        <div className="inline-block bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-xs font-black px-4 py-1.5 rounded-full border border-blue-100 dark:border-slate-700/60 mb-2 uppercase tracking-widest shadow-sm">
          🧮 smart multi calculators
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-850 dark:text-slate-100 leading-tight">
          실시간 스마트 <span className="text-blue-600 dark:text-blue-400">계산기 모음</span>
        </h1>
        <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          재테크 물타기 시뮬레이터부터 일상 속 정부 혜택 간편 계산기까지,<br />
          복잡한 수식 없이 직관적이고 시원하게 풀어드립니다.
        </p>
      </div>

      {/* 카드 그리드 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {calculators.map((calc) => (
          <Link
            key={calc.id}
            href={calc.url}
            className="group flex flex-col justify-between p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            {/* 배경 서틀 불빛 이펙트 */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${calc.badgeColor}`}>
                  {calc.category}
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-850 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-800">
                  {calc.tag}
                </span>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                  {calc.title}
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">
                  {calc.subtitle}
                </p>
              </div>

              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                {calc.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-black text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>계산기 시작하기 &rarr;</span>
              <span className="bg-blue-50 dark:bg-blue-950/30 p-1.5 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* 하단 푸터 배너 */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-lg mx-auto space-y-4">
          <span className="text-xl">🛠️</span>
          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">새로운 계산기를 계속 준비 중입니다!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
            세금 계산기, 예적금 이자 계산기, 생애 주기 소득 연산 시뮬레이터 등 독자분들이 필요로 하시는 유용한 금융 도구들을 추가하고 있습니다. 원하시는 도구가 있다면 고객 지원 및 피드백 페이지로 편하게 남겨주세요.
          </p>
        </div>
      </div>

    </div>
  );
}
