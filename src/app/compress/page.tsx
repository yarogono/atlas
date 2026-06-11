import type { Metadata } from 'next';
import Script from 'next/script';
import ImageCompressorClient from '@/components/ImageCompressorClient';

export const metadata: Metadata = {
  title: '무료 이미지 용량 줄이기 - 100% 안전한 브라우저 압축기 | 복지지원금24시',
  description: '회원가입과 프로그램 설치 없이 대용량 이미지의 크기와 용량을 한 번에 줄이세요. 모든 변환 과정이 브라우저 내에서 안전하게 수행되어 외부로 사진이 유출되지 않습니다.',
  keywords: [
    '이미지 용량 줄이기',
    '사진 용량 줄이기',
    '이미지 압축',
    '사진 압축',
    'WebP 변환',
    '웹피 변환',
    'PNG WebP 변환',
    '이미지 리사이징',
    '무료 이미지 압축기',
  ],
  alternates: {
    canonical: 'https://atlas.yaro.co.kr/compress',
  },
  openGraph: {
    title: '무료 이미지 용량 줄이기 - 100% 안전한 브라우저 압축기 | 복지지원금24시',
    description: '회원가입과 프로그램 설치 없이 대용량 이미지의 크기와 용량을 한 번에 줄이세요. 모든 변환 과정이 브라우저 내에서 안전하게 수행되어 외부로 사진이 유출되지 않습니다.',
    url: 'https://atlas.yaro.co.kr/compress',
    type: 'website',
    images: [
      {
        url: 'https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/blog-assets/image_compressor_thumbnail_1781215337629-1781215355336.webp',
        width: 1200,
        height: 630,
        alt: '무료 이미지 용량 줄이기 - 100% 안전한 브라우저 압축기 | 복지지원금24시',
      },
    ],
  },
};

export default function CompressPage() {
  // 1. SoftwareApplication Schema
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': '복지지원금24시 무료 이미지 압축기',
    'operatingSystem': 'All',
    'applicationCategory': 'UtilityApplication',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'KRW',
    },
  };

  // 2. HowTo Schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': '이미지 용량 및 크기를 줄이는 방법',
    'description': '프로그램 설치 없이 3단계만으로 이미지 용량을 압축하고 포맷을 변환할 수 있습니다.',
    'step': [
      {
        '@type': 'HowToStep',
        'name': '이미지 파일 업로드',
        'text': '줄이고자 하는 이미지 파일(PNG, JPG, WEBP 등)을 드래그 앤 드롭하거나 클릭하여 선택합니다.',
        'url': 'https://atlas.yaro.co.kr/compress#step-1',
      },
      {
        '@type': 'HowToStep',
        'name': '압축 옵션 설정',
        'text': '변환하고 싶은 포맷(WebP, JPEG, PNG)을 고르고 압축 품질(Quality) 및 최대 가로 너비(Width)를 지정합니다.',
        'url': 'https://atlas.yaro.co.kr/compress#step-2',
      },
      {
        '@type': 'HowToStep',
        'name': '압축 실행 및 다운로드',
        'text': '압축 실행하기 버튼을 누른 후, 실시간 화질 비교기를 통해 디테일을 확인하고 최적화된 결과물을 무료로 다운로드합니다.',
        'url': 'https://atlas.yaro.co.kr/compress#step-3',
      },
    ],
  };

  // 3. FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': '이미지 압축 및 포맷 변환 시 사진 파일이 서버에 저장되거나 전송되나요?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '아니요. 본 서비스는 100% 브라우저 연산 기반으로 동작합니다. 업로드하신 원본 이미지와 압축된 결과물 파일은 사용자의 디바이스 내부(메모리)에서만 생성 및 다운로드되며, 서버로 전혀 전송되지 않으므로 안심하고 안전하게 사용하실 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        'name': '어떤 이미지 파일 형식을 압축하고 변환할 수 있나요?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'PNG, JPG, JPEG, WEBP, GIF, BMP 등 대다수의 주요 이미지 포맷 업로드를 지원합니다. 출력 포맷으로는 효율성이 극대화된 WebP 포맷과 범용적인 JPEG, 원본 보존율이 높은 PNG 중 선택하여 변환하실 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        'name': '사진 용량과 해상도 크기를 동시에 줄일 수 있나요?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '네. 품질 슬라이더를 조절하여 용량(Quality)을 조절할 수 있을 뿐만 아니라, 최대 가로 너비(Width) 조정 옵션을 활용하여 FHD(1920px), HD(1280px), 블로그 본문용(1000px) 등 다양한 크기로 해상도를 축소(리사이징)하여 압축할 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        'name': '무료 사용 횟수나 크기 제한이 있나요?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '본 서비스는 개인 및 기업 사용자 모두에게 100% 무료로 제공되며, 사용 횟수 제한이 없습니다. 다만, 로컬 브라우저의 안정적인 연산을 위해 개별 이미지 파일 크기는 최대 30MB 이하로 업로드하시는 것을 권장합니다.',
        },
      },
    ],
  };

  return (
    <div className="w-full">
      {/* Schema Markup JSON-LD */}
      <Script
        id="software-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 이미지 압축 툴 본체 */}
      <ImageCompressorClient />

      {/* AEO / SEO 최적화 FAQ 콘텐츠 영역 */}
      <section className="max-w-4xl mx-auto mt-16 px-4 py-8 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-sm">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <span>💬 자주 묻는 질문 (FAQ)</span>
        </h2>
        
        <div className="space-y-4">
          <details className="group border-b border-slate-100 dark:border-slate-700 pb-4" open>
            <summary className="flex justify-between items-center font-bold text-sm md:text-base text-slate-800 dark:text-slate-200 cursor-pointer list-none">
              <span>Q. 이미지 압축 및 포맷 변환 시 사진 파일이 서버에 저장되거나 전송되나요?</span>
              <span className="transition group-open:rotate-180">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-2 border-l-2 border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 py-1">
              <strong>아니요. 본 서비스는 100% 브라우저 연산 기반으로 동작합니다.</strong> 업로드하신 원본 이미지와 압축된 결과물 파일은 사용자의 디바이스 내부(메모리)에서만 생성 및 다운로드되며, 서버로 전혀 전송되지 않으므로 안심하고 안전하게 사용하실 수 있습니다. (회사나 관공서 내부 보안 문서 및 개인 사진 누출 걱정이 전혀 없습니다.)
            </p>
          </details>

          <details className="group border-b border-slate-100 dark:border-slate-700 pb-4">
            <summary className="flex justify-between items-center font-bold text-sm md:text-base text-slate-800 dark:text-slate-200 cursor-pointer list-none">
              <span>Q. 어떤 이미지 파일 형식을 압축하고 변환할 수 있나요?</span>
              <span className="transition group-open:rotate-180">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-2 border-l-2 border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 py-1">
              PNG, JPG, JPEG, WEBP, GIF, BMP 등 대다수의 주요 이미지 포맷 업로드를 지원합니다. 출력 포맷으로는 압축 효율이 극대화된 차세대 포맷 **WebP** 포맷과 범용적인 **JPEG**, 원본 투명도(Alpha) 채널을 보존하는 **PNG** 중 목적에 맞게 선택하여 실시간으로 변환하실 수 있습니다.
            </p>
          </details>

          <details className="group border-b border-slate-100 dark:border-slate-700 pb-4">
            <summary className="flex justify-between items-center font-bold text-sm md:text-base text-slate-800 dark:text-slate-200 cursor-pointer list-none">
              <span>Q. 사진 용량과 해상도 크기를 동시에 줄일 수 있나요?</span>
              <span className="transition group-open:rotate-180">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-2 border-l-2 border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 py-1">
              <strong>네, 가능합니다.</strong> 품질 슬라이더를 조절하여 용량(Quality)을 조절할 수 있을 뿐만 아니라, &apos;최대 가로 너비(Width) 조정&apos; 옵션을 활용하여 FHD(1920px), HD(1280px), 블로그 본문용(1000px) 등 다양한 크기로 해상도를 축소(리사이징)하여 압축할 수 있습니다.
            </p>
          </details>

          <details className="group border-b border-slate-100 dark:border-slate-700 pb-4">
            <summary className="flex justify-between items-center font-bold text-sm md:text-base text-slate-800 dark:text-slate-200 cursor-pointer list-none">
              <span>Q. 무료 사용 횟수나 크기 제한이 있나요?</span>
              <span className="transition group-open:rotate-180">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-2 border-l-2 border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 py-1">
              본 서비스는 개인 및 기업 사용자 모두에게 <strong>100% 무료로 제공</strong>되며, 하루 업로드 개수나 사용 횟수 제한이 전혀 없습니다. 다만, 로컬 브라우저의 안정적인 연산 속도 및 메모리 확보를 위해 개별 이미지 파일 크기는 최대 30MB 이하로 업로드하시는 것을 권장합니다.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
