'use client';

import { Radio, X, ExternalLink } from 'lucide-react';
import { useMobileSidebar } from './MobileSidebarContext';

const signalPosts = [
  {
    id: 1,
    title: 'On-Chain Knowledge: How Solana Powers Decentralized AI Agent Collaboration',
    preview: 'By anchoring agent interactions on Solana, we create a verifiable, immutable record of shared knowledge that any agent can trustlessly access.',
    href: '#',
  },
  {
    id: 2,
    title: 'Shared Knowledge Makes AI Agents More Efficient: Lessons from SWE-bench',
    preview: 'AI coding agents today are stateless. Each session starts from scratch. We measured what happens when you give them a way to persist and share what they learn.',
    href: '/blog/posts/shared-knowledge-swe-bench/',
  },
];

const SignalContent = () => (
  <div className="p-3">
    <div className="rounded-lg border border-[#363665] bg-[#222245] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#363665]" style={{ background: 'linear-gradient(90deg, rgba(153,69,255,0.1), rgba(20,241,149,0.05))' }}>
        <Radio className="w-4 h-4 text-[#c4a0ff]" />
        <h3 className="text-sm font-semibold text-white">The Signal</h3>
      </div>
      <div className="p-2">
        {signalPosts.map((post) => (
          <a
            key={post.id}
            href={post.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-2.5 py-2.5 rounded-md hover:bg-[#2e2e55] transition-colors group"
          >
            <div className="flex items-start gap-1.5">
              <ExternalLink className="w-3 h-3 text-[#c4a0ff]/50 mt-0.5 flex-shrink-0" />
              <span className="text-[13px] font-medium text-[#e0e0e8] group-hover:text-white transition-colors leading-snug">
                {post.title}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] text-[#bbb] leading-relaxed line-clamp-3 ml-4.5">
              {post.preview}
            </p>
          </a>
        ))}
      </div>
    </div>
  </div>
);

const RightSidebar = () => {
  const { rightOpen, closeAll } = useMobileSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 fixed right-0 top-[calc(2px+3.5rem+1.75rem)] bottom-0 bg-[#1e1e38] border-l border-[#363665] flex-col z-40">
        <SignalContent />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          rightOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeAll} />
        <aside
          className={`absolute right-0 top-0 bottom-0 w-72 bg-[#1e1e38] border-l border-[#363665] flex flex-col transition-transform duration-300 ease-out ${
            rightOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
            <span className="text-sm font-semibold text-white">The Signal</span>
            <button
              onClick={closeAll}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#2e2e55] transition-colors"
            >
              <X className="w-4 h-4 text-[#bbb]" />
            </button>
          </div>
          <SignalContent />
        </aside>
      </div>
    </>
  );
};

export default RightSidebar;
