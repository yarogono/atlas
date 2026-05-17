import { Metadata } from 'next';
import Link from 'next/link';

interface Props {
  params: {
    region: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const decodedRegion = decodeURIComponent(params.region);
  const title = `${decodedRegion} 지원금 및 지자체 혜택 | 복지지원금24시`;
  const description = `${decodedRegion} 거주자를 위한 맞춤형 지자체 정부지원금, 청년정책, 소상공인 혜택 대상을 즉시 조회해 드립니다.`;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/regions/${params.region}`,
      type: 'website',
      images: ['https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/blog-assets/subsidy24-1779012468324.webp'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/blog-assets/subsidy24-1779012468324.webp'],
    },
    alternates: {
      canonical: `${baseUrl}/regions/${params.region}`,
    }
  };
}

export default function RegionPage({ params }: Props) {
  const decodedRegion = decodeURIComponent(params.region);

  return (
    <div className="max-w-4xl mx-auto py-8 w-full">
      <div className="text-center mb-12">
        <div className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold px-4 py-1.5 rounded-full text-sm mb-4">
          📍 우리동네 지자체 지원금
        </div>
        <h1 className="text-3xl md:text-5xl font-black mb-4">
          {decodedRegion} <span className="text-blue-600">정부지원금 조회</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 break-keep">
          {decodedRegion} 주민분들을 위한 맞춤형 지자체 혜택과 정부 보조금을 놓치지 말고 지금 바로 확인해 보세요.
        </p>
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

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-3xl shadow-lg mb-12 text-center">
        <h2 className="text-2xl font-bold mb-2">🗺️ 내 주변 행정복지센터 및 지원 기관 지도</h2>
        <p className="mb-6 text-blue-100">{decodedRegion} 내에서 직접 방문하여 오프라인으로 보조금을 신청할 수 있는 주민센터의 위치를 실시간 지도로 찾아보세요.</p>
        <Link href="/map" className="inline-block bg-white text-blue-600 font-bold px-8 py-3.5 rounded-full hover:bg-blue-50 transition-colors shadow-md">
          실시간 지도로 위치 찾기
        </Link>
      </div>

      <div className="text-center">
        <Link href="/regions" className="text-slate-500 hover:text-blue-600 font-bold transition-colors">
          ← 다른 지역 지원금 찾아보기
        </Link>
      </div>
    </div>
  );
}
