export interface PseoKeyword {
  slug: string;
  heading: string;
  title: string;
  metaDescription: string;
  guideText: string;
  defaultFormat: 'image/webp' | 'image/jpeg' | 'image/png';
  defaultQuality?: number;
  defaultMaxWidth: string;
  targetSizeLabel?: string;
}

export const pseoKeywords: PseoKeyword[] = [
  {
    slug: 'saramin-resume',
    heading: '사람인 이력서 사진 용량 줄이기',
    title: '사람인 이력서 사진 용량 줄이기 - 200KB 이하 초고속 압축 | 복지지원금24시',
    metaDescription: '사람인 이력서 등록에 맞춘 최적의 설정으로 사진 용량을 200KB 이하로 즉시 최적화합니다. 무설치/무료 100% 안전 브라우저 압축기를 사용해 보세요.',
    guideText: '사람인 이력서 사진은 파일 용량이 200KB를 초과할 경우 정상적으로 등록되지 않습니다. 이곳에 이력서용 증명사진을 올려주시면 자동으로 포맷을 JPEG로 고정하고 용량을 200KB 이하로 깔끔하게 축소 및 최적화해 드립니다.',
    defaultFormat: 'image/jpeg',
    defaultQuality: 0.8,
    defaultMaxWidth: '800',
    targetSizeLabel: '200KB 이하',
  },
  {
    slug: 'gov24-document',
    heading: '정부24 첨부파일 사진 크기 줄이기',
    title: '정부24 첨부파일 사진 크기 줄이기 - 2MB 이하 완벽 압축 | 복지지원금24시',
    metaDescription: '정부24 민원 신청 시 용량 초과 에러 방지를 위해 첨부 파일 및 서류 사진을 2MB 이하로 축소합니다. 브라우저 로컬 안전 변환을 제공합니다.',
    guideText: '정부24 민원 첨부 서류는 장당 파일 용량 제한(보통 2MB 이하)이 있어 스마트폰 원본 사진을 그대로 올리면 업로드가 차단될 수 있습니다. 여기서는 문서를 판독하기 좋은 선명도를 유지하며 2MB 이하로 자동 다이어트해 드립니다.',
    defaultFormat: 'image/jpeg',
    defaultQuality: 0.85,
    defaultMaxWidth: '1920',
    targetSizeLabel: '2MB 이하',
  },
  {
    slug: 'target-100kb',
    heading: '이미지 용량 100kb 이하로 줄이기',
    title: '이미지 용량 100kb 이하로 줄이기 - 고화질 WebP 압축 | 복지지원금24시',
    metaDescription: '초경량 WebP/JPEG 파일로 용량을 100KB 이하로 정밀 압축합니다. 화질 저하를 최소화하면서 용량 효율을 극대화해 보세요.',
    guideText: '웹사이트 로딩 속도 향상 또는 이메일 첨부 제한 극복을 위해 용량을 100KB 이하로 맞춰야 한다면 이 옵션이 제격입니다. 최신 WebP 포맷을 기본으로 삼아 미세 디테일을 유지하며 초경량화 작업을 처리합니다.',
    defaultFormat: 'image/webp',
    defaultQuality: 0.7,
    defaultMaxWidth: '1000',
    targetSizeLabel: '100KB 이하',
  },
  {
    slug: 'width-960px',
    heading: '이미지 가로 960px로 맞추기',
    title: '이미지 가로 크기 960px 리사이징 및 용량 다이어트 | 복지지원금24시',
    metaDescription: '세로 비율을 유지하면서 이미지의 가로 크기를 정확히 960px로 리사이징하고 파일 용량을 크게 압축합니다.',
    guideText: '웹 브라우저의 표준 가로 해상도나 특정 본문 크기(960px)에 이미지를 정확히 매칭시킵니다. 세로 길이는 원본의 황금비율을 유지하며 자동으로 리사이징 및 압축이 진행됩니다.',
    defaultFormat: 'image/webp',
    defaultQuality: 0.8,
    defaultMaxWidth: '1280', // limit target을 조정
    targetSizeLabel: '가로 960px',
  },
  {
    slug: 'samil-report',
    heading: '삼일회계법인 감사 보고서 이미지 용량 줄이기',
    title: '감사 보고서 이미지 용량 줄이기 - 1MB 이하 최적화 | 복지지원금24시',
    metaDescription: '회계 감사 보고서 및 첨부 영수증 사진을 1MB 이하로 선명하게 압축합니다. 기업 문서 보안에 100% 안전한 로컬 변환을 제공합니다.',
    guideText: '회계 보고 시스템 또는 감사 전산망에 등록되는 영수증 및 증빙 서류 이미지는 용량이 크면 접수가 거부됩니다. 판독 가능한 선명도를 그대로 유지하면서 1MB 이하의 최적화된 용량으로 줄여줍니다.',
    defaultFormat: 'image/jpeg',
    defaultQuality: 0.8,
    defaultMaxWidth: '1280',
    targetSizeLabel: '1MB 이하',
  },
  {
    slug: 'hometax-tax',
    heading: '국세청 홈택스 신고용 첨부 파일 줄이기',
    title: '홈택스 신고 첨부 이미지 용량 줄이기 - 1MB 이하 최적화 | 복지지원금24시',
    metaDescription: '부가가치세, 종합소득세 등 홈택스 증빙 서류 이미지의 용량을 1MB 이하로 압축합니다. 브라우저 연산으로 정보 보안을 보장합니다.',
    guideText: '홈택스에 세무 신고 자료(카드 영수증, 계약서 등)를 증빙으로 제출할 때 개별 파일 한도(1MB)를 준수해야 합니다. 글자를 식별하기 가장 좋은 품질을 조합해 즉시 1MB 규격으로 맞춤 변환합니다.',
    defaultFormat: 'image/jpeg',
    defaultQuality: 0.8,
    defaultMaxWidth: '1280',
    targetSizeLabel: '1MB 이하',
  },
  {
    slug: 'tistory-upload',
    heading: '티스토리 블로그 이미지 용량 및 WebP 변환',
    title: '티스토리 블로그 이미지 용량 줄이기 & WebP 변환 | 복지지원금24시',
    metaDescription: '구글 애드센스 승인 및 모바일 로딩 가속화를 위해 티스토리 이미지를 WebP 포맷과 1000px 해상도로 압축 최적화합니다.',
    guideText: '티스토리 블로그 포스트의 페이지 로딩 속도는 검색 노출 점수에 결정적인 영향을 미칩니다. PNG/JPG 파일을 최신 차세대 포맷 WebP로 인코딩하고 본문 최적 가로 폭인 1000px로 리사이징하여 속도를 끌어올립니다.',
    defaultFormat: 'image/webp',
    defaultQuality: 0.8,
    defaultMaxWidth: '1000',
    targetSizeLabel: '블로그 최적화',
  },
  {
    slug: 'instagram-upload',
    heading: '인스타그램 업로드 최적 해상도 맞추기',
    title: '인스타그램 사진 업로드 최적화 및 용량 압축 | 복지지원금24시',
    metaDescription: '인스타그램이 강제로 화질을 뭉개는 현상을 방지하기 위해 사진을 최적 규격인 가로 1080px 해상도와 JPEG 포맷으로 변환합니다.',
    guideText: '인스타그램에 초대형 원본 사진을 바로 업로드하면 앱 자체 서버 압축기로 인해 화질이 매우 심하게 손상됩니다. 미리 인스타 가이드라인 규격인 가로 1080px(최대 화질)에 정확히 맞춰서 화질 저하를 원천 차단해 보세요.',
    defaultFormat: 'image/jpeg',
    defaultQuality: 0.9,
    defaultMaxWidth: '1080',
    targetSizeLabel: '가로 1080px',
  },
  {
    slug: 'target-500kb',
    heading: '이미지 용량 500kb 이하로 줄이기',
    title: '이미지 용량 500kb 이하로 줄이기 - 고성능 WebP/JPEG 변환 | 복지지원금24시',
    metaDescription: '원하는 이미지 파일의 용량을 500KB 이하로 신속하게 압축합니다. 화질과 용량 사이의 균형을 극대화한 자동 세팅을 지원합니다.',
    guideText: '대부분의 온라인 커뮤니티, 사내 포털 업로드 규격인 500KB 제한을 만족시킵니다. 고해상도를 유지하되 파일 내부 데이터 최적화를 통해 500KB 미만으로 부드럽게 감량해 드립니다.',
    defaultFormat: 'image/webp',
    defaultQuality: 0.8,
    defaultMaxWidth: '1280',
    targetSizeLabel: '500KB 이하',
  },
  {
    slug: 'blog-optimization',
    heading: '블로그용 이미지 최적화 및 용량 다이어트',
    title: '블로그 이미지 용량 줄이기 - 구글 SEO 로딩 가속화 | 복지지원금24시',
    metaDescription: '블로그 포스팅용 이미지의 해상도 조절과 용량 초압축을 한 번에 처리합니다. WebP 변환으로 서빙 트래픽 비용을 절감하세요.',
    guideText: '네이버 블로그, 티스토리, 워드프레스 등 모든 블로그에서 구글 모바일 검색 점수를 올리기 위한 필수 작업입니다. 해상도를 모바일 최적 가로 폭 1000px로 제한하고 WebP로 용량을 대폭 삭감합니다.',
    defaultFormat: 'image/webp',
    defaultQuality: 0.75,
    defaultMaxWidth: '1000',
    targetSizeLabel: '블로그 최적화',
  }
];
