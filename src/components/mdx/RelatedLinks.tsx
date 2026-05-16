import React from 'react';
import Link from 'next/link';

interface LinkItem {
  title: string;
  url: string;
}

interface RelatedLinksProps {
  links: string;
}

export function RelatedLinks({ links }: RelatedLinksProps) {
  let parsedLinks = [];
  try {
    parsedLinks = typeof links === 'string' ? JSON.parse(links) : links;
  } catch (e) {
    console.error('Failed to parse links', e);
  }

  return (
    <div className="not-prose my-10 bg-blue-50 border border-blue-100 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
        <span className="text-xl">🔗</span> 함께 보면 좋은 정부지원금
      </h3>
      <ul className="space-y-3">
        {parsedLinks.map((link: any, index: number) => (
          <li key={index} className="flex items-start">
            <span className="text-blue-500 mr-2 mt-0.5">✓</span>
            <Link 
              href={link.url}
              className="text-slate-700 hover:text-blue-700 font-medium underline-offset-4 hover:underline transition-colors"
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
