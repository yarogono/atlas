import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Latest Posts</h2>
        <ul className="space-y-4">
          <li>
            <Link href="/posts/sample-post" className="group block p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Understanding Compound Interest Interactively
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                A deep dive into compound interest with interactive tools to visualize your wealth growth.
              </p>
              <time className="text-sm text-slate-400 mt-4 block">May 16, 2024</time>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
