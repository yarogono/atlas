import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import Image from 'next/image';

export default function Home() {
  const posts = getAllPosts();

  if (!posts || posts.length === 0) {
    return <div>게시글이 없습니다.</div>;
  }

  const featuredPost = posts[0];
  const subPosts = posts.slice(1);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-8 md:p-12 text-white shadow-xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 translate-x-1/3 -translate-y-1/3 pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight break-keep">
            올해 내가 받을 수 있는<br/>
            <span className="text-yellow-300">정부지원금</span>은 얼마일까?
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 break-keep">
            복잡한 조건은 그만! 나이, 직업, 소득만 입력하고 3초 만에 예상 수령액을 즉시 확인해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator" className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-lg py-4 px-8 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              <span>🧮 3초 만에 계산하기</span>
            </Link>
            <Link href="/eligibility" className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold text-lg py-4 px-8 rounded-full transition-colors flex items-center justify-center gap-2">
              <span>✅ 대상 여부 바로 조회</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Hub Links */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: '종합가이드', icon: '📖', href: '/guide', desc: '모든 정책 총정리' },
          { title: '자주 묻는 질문', icon: '💬', href: '/faq', desc: '궁금증 즉시 해결' },
          { title: '최신 업데이트', icon: '⚡', href: '/updates', desc: '오늘 뜬 새로운 지원금' },
          { title: '우리동네 지원금', icon: '📍', href: '/regions', desc: '지자체별 혜택' }
        ].map(hub => (
          <Link key={hub.href} href={hub.href} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all group flex flex-col items-center text-center">
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{hub.icon}</div>
            <h2 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">{hub.title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{hub.desc}</p>
          </Link>
        ))}
      </section>

      {/* 매거진 스타일 그리드 레이아웃 */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 좌측 메인(Featured) 포스트 - 8열 차지 */}
        <div className="lg:col-span-8">
          <Link href={`/posts/${featuredPost.slug}`} className="group block h-full">
            <article className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700">
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                {featuredPost.coverImage ? (
                  <img 
                    src={featuredPost.coverImage} 
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                )}
                {featuredPost.category && (
                  <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                    {featuredPost.category}
                  </div>
                )}
              </div>
              <div className="p-8 flex flex-col flex-grow justify-center">
                <h2 className="text-3xl font-bold leading-tight mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-lg line-clamp-3 mb-6">
                  {featuredPost.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-medium text-slate-400">{featuredPost.date}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    자세히 보기 <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </div>
            </article>
          </Link>
        </div>

        {/* 우측 서브 포스트 목록 - 4열 차지 */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"></span>
            최신 업데이트
          </h3>
          
          {subPosts.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`} className="group block">
              <article className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 dark:border-slate-700">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                  {post.coverImage ? (
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No Image</div>
                  )}
                  {post.category && (
                    <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                      {post.category}
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold leading-snug mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-slate-400">{post.date}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
