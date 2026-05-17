import { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '정부지원금 자주 묻는 질문(FAQ) | 복지지원금24시',
  description: '정부지원금 대리 신청 방법, 지급일 언제인지, 온라인 신청 방법 등 가장 많이 묻는 질문 12가지를 모아 정확하게 답변해드립니다.',
  keywords: '정부지원금 대리 신청, 지원금 지급일, 지원금 신청 방법, 고유가 피해지원금 FAQ, 기초생활수급자 신청, 실업급여 아르바이트, 청년도약계좌',
  openGraph: {
    title: '정부지원금 자주 묻는 질문(FAQ)',
    description: '대리 신청, 지급일, 온라인 신청 방법 등 가장 많이 묻는 12가지 질문에 속 시원하게 답합니다.',
    url: '/faq',
  },
  twitter: {
    card: 'summary_large_image',
    title: '정부지원금 자주 묻는 질문(FAQ)',
    description: '대리 신청, 지급일, 온라인 신청 방법 등 가장 많이 묻는 12가지 질문에 속 시원하게 답합니다.',
  },
  alternates: {
    canonical: '/faq',
  }
};

export default function FaqPage() {
  const faqs = [
    {
      q: '정부지원금 대리 신청이 가능한가요?',
      a: '온라인 신청은 원칙적으로 본인 명의로만 가능합니다. 대리 신청이 필요한 경우 가까운 주민센터(행정복지센터)를 방문하여 위임장, 대리인 신분증, 가족관계증명서를 지참하시면 가족 등 대리인이 신청할 수 있습니다.',
    },
    {
      q: '정부지원금 지급일이 언제인가요?',
      a: '지원금마다 지급일이 다릅니다. 카드사를 통한 포인트 충전 방식의 경우 신청 다음 날 오전 9시 전후로 자동 지급됩니다. 계좌 이체 방식은 심사 완료 후 3~5 영업일 이내 입금됩니다. 정확한 지급일은 각 지원금 공고문을 확인하세요.',
    },
    {
      q: '고유가 피해지원금 온라인 신청 방법은 무엇인가요?',
      a: '본인 명의 카드사 앱(App) 또는 홈페이지에 접속하여 "고유가 피해지원금" 메뉴를 선택합니다. 간편 인증(지문·PIN 등)으로 본인 확인 후 수령 수단을 선택하고 신청을 완료하면 됩니다. KB국민카드, 신한카드, NH농협카드, 롯데카드, BC카드 등 대부분의 카드사에서 신청 가능합니다.',
    },
    {
      q: '1차 지원금을 받았는데 2차도 신청할 수 있나요?',
      a: '지원금에 따라 다릅니다. 고유가 피해지원금의 경우 1차 수급자도 2차 신청이 가능하도록 정책이 변경되었습니다. 단, 동일 회차 내에서 중복 수령은 불가합니다. 각 지원금 공고를 반드시 확인하세요.',
    },
    {
      q: '기초생활수급자 신청 시 자동차 가액 기준은 어떻게 되나요?',
      a: '일반적으로 2000cc 미만이며 10년 이상 된 차량, 혹은 차량 가액이 500만 원 미만인 경우 재산 산정에서 유리하게 적용됩니다. 장애인·생업용 차량은 별도 기준이 적용되며, 자세한 산정 방식은 지자체마다 다를 수 있으니 주민센터에 문의하세요.',
    },
    {
      q: '지원금 신청 기간을 놓쳤을 때 어떻게 해야 하나요?',
      a: '신청 기간이 지난 경우 해당 지원금은 원칙적으로 신청이 불가합니다. 단, 일부 지원금은 추가 접수 기간이나 예외 신청 절차를 두는 경우가 있으니, 해당 지자체 또는 복지로(www.bokjiro.go.kr)에 문의해 보시기 바랍니다.',
    },
    {
      q: '지원금 신청은 꼭 방문해야만 하나요?',
      a: '최근 대부분의 정부지원금은 "보조금24(보조금24.go.kr)" 또는 "복지로(www.bokjiro.go.kr)" 홈페이지를 통해 온라인으로 신청 가능합니다. 다만 일부 지자체 자체 사업의 경우 방문 접수만 받는 곳도 있으니 사전에 확인하세요.',
    },
    {
      q: '실업급여 수급 중 아르바이트를 해도 되나요?',
      a: '실업급여 수급 중 소득이 발생하면 반드시 가까운 고용센터에 신고해야 합니다. 신고하지 않고 적발될 경우 부정수급으로 간주되어 지급된 급여의 전액 환수 및 추가 징수 처분을 받을 수 있습니다.',
    },
    {
      q: '청년도약계좌와 청년내일저축계좌는 중복 가입이 가능한가요?',
      a: '두 상품은 가입 대상과 목적이 달라 중복 가입이 원칙적으로 제한됩니다. 단, 정책 변경에 따라 일부 허용되는 경우가 있으니 가입 전 서민금융진흥원(1397) 또는 관할 금융기관에 문의하시는 것이 가장 정확합니다.',
    },
    {
      q: '지원금 수령 후 타 지역으로 이사하면 어떻게 되나요?',
      a: '이사한 곳의 행정복지센터를 방문하여 주소지 변경 신청을 하면, 잔액을 새로운 거주지에서 그대로 이어서 사용할 수 있습니다. 단, 지역화폐 기반 지원금은 사용 지역이 주민등록 주소지 기준으로 제한되므로 사전에 확인하세요.',
    },
    {
      q: '미성년 자녀의 지원금은 누가 신청하나요?',
      a: '미성년 자녀의 지원금은 주민등록상 세대주(주로 부모)가 대표로 신청합니다. 카드사 앱에서 본인 명의로 로그인 후 가구원 지원금까지 일괄 신청하는 방식이 일반적입니다.',
    },
    {
      q: '지원금 사용처(가맹점)는 어디서 확인하나요?',
      a: '각 카드사 앱 내 "가맹점 찾기" 기능을 이용하거나, 지역사랑상품권 공식 홈페이지(chak.or.kr) 또는 복지지원금24시 지도 서비스를 통해 거주지 주변 사용 가능 가맹점을 실시간으로 확인할 수 있습니다.',
    },
  ];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a
      }
    }))
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
        name: '자주 묻는 질문(FAQ)',
        item: `${baseUrl}/faq`
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto py-8 w-full">
      <Script id="faq-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script id="faq-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black mb-4">
          💬 자주 묻는 질문 <span className="text-blue-600">(FAQ)</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          가장 많이 묻는 질문들을 모아 속 시원하게 답변해드립니다.
        </p>
      </div>

      <div className="space-y-4 mb-12">
        {faqs.map((faq, idx) => (
          <details key={idx} className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-lg text-slate-800 dark:text-slate-200 group-open:text-blue-600 group-open:dark:text-blue-400">
              <span className="flex items-center gap-3">
                <span className="text-blue-600 dark:text-blue-400">Q.</span>
                {faq.q}
              </span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 mr-2">A.</span>
              {faq.a}
            </div>
          </details>
        ))}
      </div>

    </div>
  );
}
