import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '우리동네 지자체 지원금 | 복지지원금24시',
  description: '서울, 경기, 인천 등 내가 사는 지역의 숨은 지자체 정부지원금을 지도와 함께 확인해보세요.',
  openGraph: {
    title: '우리동네 지자체 지원금 모아보기',
    description: '내가 사는 지역의 혜택, 놓치지 말고 챙기세요.',
    url: '/regions',
  },
  alternates: {
    canonical: '/regions',
  }
};

export default function RegionsPage() {
  const regions = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

  return (
    <div className="max-w-5xl mx-auto py-8 w-full">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black mb-4">
          📍 우리동네 <span className="text-blue-600">지원금</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          우리 지자체에서만 제공하는 특별한 혜택을 찾아보세요.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-4">지역 선택</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {regions.map(region => (
            <Link key={region} href={`/regions/${region}`} className="py-3 px-2 text-center rounded-xl border border-slate-200 dark:border-slate-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors">
              {region}
            </Link>
          ))}
        </div>
      </div>

      <div className="text-center bg-blue-600 text-white p-8 rounded-3xl shadow-lg mb-12">
        <h2 className="text-2xl font-bold mb-2">지도에서 내 주변 지원 기관 찾기</h2>
        <p className="mb-6 text-blue-100">가장 가까운 행정복지센터와 고용센터를 지도에서 바로 확인하세요.</p>
        <Link href="/map" className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors shadow-md">
          🗺️ 지도로 이동하기
        </Link>
      </div>
    </div>
  );
}
