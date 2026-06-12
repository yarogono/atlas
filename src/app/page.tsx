import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import BreakingNews from '@/components/BreakingNews';

export default function Home() {
  const posts = getAllPosts();

  if (!posts || posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-500 dark:text-slate-400 font-bold">
        등록된 게시글이 없습니다.
      </div>
    );
  }

  // 1. 속보용 포스트 리스트 (최신 글 5개)
  const breakingNewsPosts = posts.slice(0, 5);

  // 2. 히어로 피처 그리드 데이터 분할 (Featured 1개 + Sub 4개)
  const featuredPost = posts[0];
  const subFeaturedPosts = posts.slice(1, 5);

  // 3. 세부 카테고리를 가독성을 위해 3대 주요 대분류로 그룹화
  const mapCategoryToGroup = (category: string): string => {
    const cat = category.replace(/\s+/g, '').toLowerCase();
    
    if (
      cat.includes('지원금') || 
      cat.includes('혜택') || 
      cat.includes('보조금') || 
      cat.includes('복지') || 
      cat.includes('지역') ||
      cat.includes('유가') ||
      cat.includes('선거') ||
      cat.includes('투표')
    ) {
      return '정부 지원금 & 생활 혜택';
    }
    
    if (
      cat.includes('계산기') || 
      cat.includes('평단가') || 
      cat.includes('복리') || 
      cat.includes('양도세') || 
      cat.includes('압축')
    ) {
      return '계산기 & 웹 유틸리티';
    }
    
    return '부동산·대출 & 재테크 가이드';
  };

  const categoriesMap: Record<string, typeof posts> = {};
  posts.forEach((post) => {
    const groupName = mapCategoryToGroup(post.category || '정부 정책');
    if (!categoriesMap[groupName]) {
      categoriesMap[groupName] = [];
    }
    categoriesMap[groupName].push(post);
  });

  return (
    <div className="space-y-10">
      {/* 🚀 실시간 속보 배너 (mcheam.com 벤치마크) */}
      <BreakingNews posts={breakingNewsPosts} />

      {/* 🖼️ 1:4 히어로 피처 그리드 (mcheam.com 벤치마크) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* 좌측: 큰 대표 카드 (1개) */}
        <div className="lg:col-span-6 h-full min-h-[380px] lg:min-h-[480px]">
          <Link href={`/posts/${featuredPost.slug}`} className="group relative block w-full h-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-800">
            {/* 배경 썸네일 */}
            <div className="absolute inset-0 w-full h-full">
              {featuredPost.coverImage ? (
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">No Image</div>
              )}
            </div>
            {/* 어두운 오버레이 레이어 */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10"></div>
            
            {/* 카드 텍스트 정보 */}
            <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 z-20 flex flex-col justify-end text-white">
              {featuredPost.category && (
                <span className="self-start bg-blue-600/90 text-white text-[11px] font-black px-2.5 py-1 rounded-md mb-3 tracking-wider shadow-sm">
                  {featuredPost.category}
                </span>
              )}
              <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold leading-tight tracking-tight mb-3 text-white break-keep drop-shadow-sm group-hover:text-blue-100 transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-slate-200 text-sm md:text-base line-clamp-2 mb-4 font-medium opacity-90">
                {featuredPost.description}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-2">
                  <span>{featuredPost.date}</span>
                  <span className="text-slate-500">|</span>
                  <span>{featuredPost.author}</span>
                </span>
                <span className="font-bold underline underline-offset-4 decoration-blue-500 group-hover:text-blue-200 transition-colors">
                  지금 확인하기 →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* 우측: 2x2 작은 카드 그리드 (최대 4개) */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subFeaturedPosts.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`} className="group relative block rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200/50 dark:border-slate-800 aspect-[16/11]">
              {/* 배경 썸네일 */}
              <div className="absolute inset-0 w-full h-full">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">No Image</div>
                )}
              </div>
              {/* 어두운 오버레이 레이어 */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent z-10"></div>
              
              {/* 카드 텍스트 정보 */}
              <div className="absolute bottom-0 inset-x-0 p-4 md:p-5 z-20 flex flex-col justify-end text-white">
                {post.category && (
                  <span className="self-start bg-slate-800/90 border border-slate-700/80 text-white text-[9px] font-black px-2 py-0.5 rounded mb-2 tracking-wide uppercase">
                    {post.category}
                  </span>
                )}
                <h3 className="text-sm md:text-base font-extrabold leading-snug tracking-tight mb-2 text-white line-clamp-2 drop-shadow-sm group-hover:text-blue-200 transition-colors">
                  {post.title}
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-medium">
                  <span>{post.date}</span>
                  <span className="text-slate-600">|</span>
                  <span>{post.author}</span>
                </div>
              </div>
            </Link>
          ))}

          {/* 서브 포스트 데이터가 부족할 때를 채워주는 대체 디렉토리 바로가기 카드 */}
          {subFeaturedPosts.length < 4 && (
            <Link href="/calculator" className="group relative flex flex-col items-center justify-center rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 aspect-[16/11] p-4 text-center">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🧮</div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">정부지원금 계산기 목록</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">나에게 딱 맞는 예상 수령액을 즉시 계산해 보세요.</p>
            </Link>
          )}
        </div>
      </section>

      {/* 주요 서비스 퀵 허브 링크 (이모지 제외) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
        {[
          { title: '종합 가이드', href: '/guide', desc: '모든 정책 한눈에 보기' },
          { title: '대상 여부 조회', href: '/eligibility', desc: '나의 수령 조건 매칭' },
          { title: '지자체별 혜택', href: '/regions', desc: '우리동네 맞춤 정책' },
          { title: '이미지 압축기', href: '/compress', desc: '용량 줄이기 & WebP 변환' }
        ].map((hub) => (
          <Link key={hub.href} href={hub.href} className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-center">
            <div className="min-w-0">
              <h3 className="font-extrabold text-xs md:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">{hub.title}</h3>
              <p className="text-[10px] text-slate-400 truncate mt-1">{hub.desc}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* 📂 카테고리 복합 섹션 (mcheam.com 벤치마크) */}
      <div className="space-y-12 py-4">
        {Object.entries(categoriesMap).map(([categoryName, catPosts]) => {
          // 카테고리 내 상위 2개는 카드형 렌더링, 나머지는 우측 리스트형 렌더링
          const leftCards = catPosts.slice(0, 2);
          const rightList = catPosts.slice(2, 6);

          return (
            <section key={categoryName} className="border-t border-slate-200/60 dark:border-slate-800/80 pt-8">
              {/* 카테고리 헤더 */}
              <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-slate-900 dark:border-slate-650">
                <h3 className="text-lg md:text-xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
                  {categoryName}
                </h3>
                <span className="text-xs font-bold text-slate-400">Total {catPosts.length} posts</span>
              </div>

              {/* 카테고리 컨텐츠 그리드 (좌측 2개 카드 + 우측 4개 리스트) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 좌측: 카드 영역 (lg:col-span-7) */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {leftCards.map((post) => (
                    <Link key={post.slug} href={`/posts/${post.slug}`} className="group block">
                      <article className="flex flex-col bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-800 hover:shadow-md transition-shadow">
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h4 className="text-sm md:text-base font-extrabold leading-snug mb-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed font-medium">
                            {post.description}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-auto">
                            <span>{post.date}</span>
                            <span className="text-slate-300 dark:text-slate-700">|</span>
                            <span>{post.author}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>

                {/* 우측: 리스트 영역 (lg:col-span-5) */}
                <div className="lg:col-span-5 flex flex-col divide-y divide-slate-150 dark:divide-slate-800/80 justify-between">
                  {rightList.length > 0 ? (
                    rightList.map((post) => (
                      <Link key={post.slug} href={`/posts/${post.slug}`} className="group block py-3 first:pt-0 last:pb-0">
                        <div className="flex gap-3 items-start">
                          <div className="flex-1 min-w-0">
                            {/* mcheam.com 스타일 그라데이션 밑줄 효과 적용 */}
                            <h4 className="text-xs md:text-sm font-extrabold leading-snug text-slate-800 dark:text-slate-200 line-clamp-2">
                              <span className="inline bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 bg-no-repeat bg-[length:100%_0.15em] bg-[position:0_100%] group-hover:bg-[length:100%_100%] group-hover:text-blue-900 dark:group-hover:text-white transition-all duration-300 px-0.5 rounded">
                                {post.title}
                              </span>
                            </h4>
                            <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-medium">
                              <span>{post.date}</span>
                              <span className="text-slate-200 dark:text-slate-800">|</span>
                              <span>{post.author}</span>
                            </div>
                          </div>
                          {post.coverImage && (
                            <div className="w-16 h-12 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden flex-shrink-0 border border-slate-200/30 dark:border-slate-800">
                              <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                              />
                            </div>
                          )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-250 dark:border-slate-800 text-center text-xs text-slate-400">
                      <p className="font-bold">추가 소식이 없습니다.</p>
                      <p className="text-[10px] text-slate-400 mt-1">해당 분야의 새로운 소식이 올라오면 즉시 업데이트됩니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
