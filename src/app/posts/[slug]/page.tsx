import fs from 'fs';
import path from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { InteractiveCalc } from '@/components/InteractiveCalc';

const components = {
  InteractiveCalc,
};

export default function PostPage({ params }: { params: { slug: string } }) {
  const postPath = path.join(process.cwd(), 'src', 'content', 'posts', `${params.slug}.mdx`);
  
  let content = '';
  try {
    content = fs.readFileSync(postPath, 'utf8');
  } catch (e) {
    return <div className="text-center py-10">Post not found</div>;
  }

  // Very basic frontmatter stripping for the example
  const contentWithoutFrontmatter = content.replace(/---[\s\S]*?---/, '');

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400">
      <MDXRemote source={contentWithoutFrontmatter} components={components} />
    </article>
  );
}
