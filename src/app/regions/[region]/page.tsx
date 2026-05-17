import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import welfareData from '@/data/regions-welfare.json';
import { RegionMiniMap } from '@/components/map/RegionMiniMap';
import { RegionLiveMetrics } from '@/components/welfare/RegionLiveMetrics';

interface Props {
  params: {
    region: string;
  };
}

// 안전하게 URL 파라미터를 복수 디코딩하는 헬퍼 함수 (단일/이중 인코딩 및 미인코딩 대응)
function decodeRegion(region: string): string {
  try {
    let decoded = region;
    while (decoded.includes('%')) {
      const nextDecoded = decodeURIComponent(decoded);
      if (nextDecoded === decoded) break;
      decoded = nextDecoded;
    }
    return decoded;
  } catch {
    return region;
  }
}

// 1. 사전 렌더링을 위한 전국의 모든 지자체 경로 사전 정의 (SSG 빌드용)
// Next.js 권장사항에 따라 인코딩되지 않은 한글 원본 문자열을 반환하여 Next.js가 라우팅 및 인코딩을 자동 처리하도록 함
export async function generateStaticParams() {
  return Object.keys(welfareData).map((region) => ({
    region: region,
  }));
}

// 2. 동적 SEO 메타데이터 자동 최적화
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const decodedRegion = decodeRegion(params.region);
  const regionKey = decodedRegion as keyof typeof welfareData;
  const regionInfo = welfareData[regionKey];

  const title = `${decodedRegion} 고유가 피해지원금 2차 신청 사용처 조회 | 복지지원금24시`;
  const description = `${regionInfo?.fullName || decodedRegion} 주민분들을 위한 2026 고유가 피해지원금 2차 신청 방법, 대상 기준 및 지역 내 사용처 정보를 3초 만에 실시간으로 조회해 드립니다.`;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';
  const canonicalUrl = `${baseUrl}/regions/${encodeURIComponent(decodedRegion)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: 'https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/blog-assets/subsidy24-1779012468324.webp',
          width: 1200,
          height: 630,
          alt: `${decodedRegion} 고유가 피해지원금 2차 신청 및 사용처 조회 - 복지지원금24시`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        {
          url: 'https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/blog-assets/subsidy24-1779012468324.webp',
          width: 1200,
          height: 630,
          alt: `${decodedRegion} 고유가 피해지원금 2차 신청 및 사용처 조회 - 복지지원금24시`,
        },
      ],
    },
    alternates: {
      canonical: canonicalUrl,
    }
  };
}

export default function RegionPage({ params }: Props) {
  const decodedRegion = decodeRegion(params.region);
  const regionKey = decodedRegion as keyof typeof welfareData;
  const regionInfo = welfareData[regionKey] || {
    fullName: decodedRegion,
    lat: 37.5665,
    lng: 126.9780,
    localCurrency: '지역사랑상품권',
    youthPolicy: '청년 주거 안정 및 월세 보전 지원 혜택',
    smallBusiness: '소상공인 안심금리 융자 및 경영지원 특례보증 정책',
    oilSupport: '혹서기/혹한기 취약가정 난방 긴급 에너지 바우처',
    officeName: `${decodedRegion} 관공서`,
    officePhone: '120',
    officeAddress: ''
  };

  // 3. 구글/네이버 상위 노출용 FAQPage 스키마
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': `${decodedRegion} 고유가 피해지원금 2차 신청 자격과 조건은 무엇인가요?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `2026년 고유가 피해지원금 2차는 소득 및 재산 기준 등을 충족하는 가구에 한해 지급됩니다. 자세한 자격 요건은 지원금 가이드를 통해 즉시 확인 가능합니다.`
        }
      },
      {
        '@type': 'Question',
        'name': `${decodedRegion} 고유가 피해지원금 2차 지역사랑상품권 사용처 조회는 어떻게 하나요?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `${decodedRegion} 내 지역화폐 가맹점 지도에서 지원금 사용처 목록을 실시간으로 조회하실 수 있습니다.`
        }
      }
    ]
  };

  // 4. 구글/네이버 상위 노출용 LocalBusiness 스키마 (해당 관공서)
  const businessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': regionInfo.officeName,
    'description': `${decodedRegion} 지역 거주자 대상 공공 복지 혜택 및 지자체 정부지원금 신청 공식 행정 처소입니다.`,
    'telephone': regionInfo.officePhone,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': regionInfo.officeAddress,
      'addressLocality': decodedRegion,
      'addressCountry': 'KR'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': regionInfo.lat,
      'longitude': regionInfo.lng
    }
  };

  // 5. 검색엔진 노출을 위한 BreadcrumbList 스키마
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';
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
        name: '지역별 지원금',
        item: `${baseUrl}/regions`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${decodedRegion} 지원금`,
        item: `${baseUrl}/regions/${params.region}`
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto py-8 w-full px-4">
      {/* Dynamic JSON-LD Rich Snippet schemas injection */}
      <Script id="faq-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Script id="business-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }} />
      <Script id="region-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="text-center mb-12">
        <div className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold px-4 py-1.5 rounded-full text-sm mb-4">
          📍 {decodedRegion} 사용처 및 혜택 조회
        </div>
        <h1 className="text-3xl md:text-5xl font-black mb-4">
          {decodedRegion} <span className="text-blue-600">고유가 피해지원금 2차</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 break-keep">
          {decodedRegion} 고유가 피해지원금 2차 신청 방법, 대상 기준 및 지역 내 사용처 정보를 놓치지 말고 지금 바로 확인해 보세요.
        </p>
      </div>

      {/* ⚡ 실시간 정책 현황판 및 바로가기 CTA */}
      <RegionLiveMetrics regionName={decodedRegion} />

      {/* Local Welfare Cards Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>✨</span> {decodedRegion} 지역 전용 특별 혜택 안내
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50/50 dark:bg-slate-700/30 p-6 rounded-2xl border border-blue-50 dark:border-slate-700">
            <span className="text-2xl mb-2 block">🧑‍💻</span>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-2">청년 정책</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{regionInfo.youthPolicy}</p>
          </div>
          <div className="bg-emerald-50/50 dark:bg-slate-700/30 p-6 rounded-2xl border border-emerald-50 dark:border-slate-700">
            <span className="text-2xl mb-2 block">💼</span>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-2">소상공인 지원</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{regionInfo.smallBusiness}</p>
          </div>
          <div className="bg-yellow-50/50 dark:bg-slate-700/30 p-6 rounded-2xl border border-yellow-50 dark:border-slate-700">
            <span className="text-2xl mb-2 block">🔥</span>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-2">에너지 지원</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{regionInfo.oilSupport}</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">💳</span>
            <div className="text-left">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">지역사랑상품권 가맹점 확인</h4>
              <p className="text-xs text-slate-500">{decodedRegion} 지역화폐인 <strong className="text-blue-600 dark:text-blue-400 font-semibold">{regionInfo.localCurrency}</strong> 사용처를 지도에서 지금 조회 가능합니다.</p>
            </div>
          </div>
          <Link href="/map" className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
            사용처 지도로 찾기
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <span className="text-3xl mb-4 block">🧮</span>
            <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{decodedRegion} 지원금 3초 계산기</h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              나이, 직업, 월 평균 소득 정보만 간단히 입력하고 {decodedRegion} 지역에서 받을 수 있는 예상 수령액을 즉시 계산해 보세요.
            </p>
          </div>
          <Link href="/calculator" className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm block">
            예상 지원금 계산하기 ➔
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <span className="text-3xl mb-4 block">✅</span>
            <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{decodedRegion} 대상 1분 조회기</h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              건강보험료 납부액과 재산 기준 등을 입력해 본인이 {decodedRegion} 및 국가 고유가 피해지원금 대상에 속하는지 1분 만에 판별해 드립니다.
            </p>
          </div>
          <Link href="/eligibility" className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm block">
            대상 여부 바로 확인 ➔
          </Link>
        </div>
      </div>

      {/* Local Minimap Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm mb-12">
        <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>🗺️</span> {regionInfo.officeName} 위치 및 오프라인 신청
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          인터넷 신청 외에도 직접 방문하여 오프라인으로 보조금을 신청하실 수 있습니다. {regionInfo.officeName} 위치를 확인하세요.
        </p>
        <RegionMiniMap 
          lat={regionInfo.lat}
          lng={regionInfo.lng}
          officeName={regionInfo.officeName}
          officeAddress={regionInfo.officeAddress}
          officePhone={regionInfo.officePhone}
        />
      </div>

      <div className="text-center">
        <Link href="/regions" className="text-slate-500 hover:text-blue-600 font-bold transition-colors">
          ← 다른 지역 지원금 찾아보기
        </Link>
      </div>
    </div>
  );
}
