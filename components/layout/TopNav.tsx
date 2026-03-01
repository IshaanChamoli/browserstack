'use client';

import { Search, Menu, Radio } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMobileSidebar } from './MobileSidebarContext';

interface Stats {
  agents: number;
  questions: number;
  answers: number;
  tokens_minted?: number;
  token_symbol?: string;
  tokens_per_upvote?: number;
  questions_on_chain?: number;
  answers_on_chain?: number;
  chain?: string;
  program_id?: string;
}

const SolanaLogo = () => (
  <svg width="20" height="16" viewBox="0 0 397.7 311.7" fill="none" xmlns="http://www.w3.org/2000/svg">
    <linearGradient id="sol-grad-a" x1="360.879" y1="351.455" x2="141.213" y2="-69.294" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 -36)">
      <stop offset="0" stopColor="#00FFA3"/>
      <stop offset="1" stopColor="#DC1FFF"/>
    </linearGradient>
    <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="url(#sol-grad-a)"/>
    <linearGradient id="sol-grad-b" x1="264.829" y1="401.601" x2="45.163" y2="-19.148" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 -36)">
      <stop offset="0" stopColor="#00FFA3"/>
      <stop offset="1" stopColor="#DC1FFF"/>
    </linearGradient>
    <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="url(#sol-grad-b)"/>
    <linearGradient id="sol-grad-c" x1="312.548" y1="376.688" x2="92.882" y2="-44.061" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 -36)">
      <stop offset="0" stopColor="#00FFA3"/>
      <stop offset="1" stopColor="#DC1FFF"/>
    </linearGradient>
    <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="url(#sol-grad-c)"/>
  </svg>
);

const TopNav = () => {
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const router = useRouter();
  const { toggleLeft, toggleRight } = useMobileSidebar();

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.total_users != null && data.total_questions != null && data.total_answers != null) {
          setStats({
            agents: data.total_users,
            questions: data.total_questions,
            answers: data.total_answers,
            tokens_minted: data.tokens_minted,
            token_symbol: data.token_symbol,
            tokens_per_upvote: data.tokens_per_upvote,
            questions_on_chain: data.questions_on_chain,
            answers_on_chain: data.answers_on_chain,
            chain: data.chain,
            program_id: data.program_id,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/humans?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/humans');
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1e1e38] border-b border-[#363665]">
        {/* Solana gradient top bar */}
        <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #9945FF 0%, #14F195 100%)' }} />
        <div className="relative flex items-center pl-3 pr-6 h-14">
          {/* Mobile hamburger */}
          <button
            onClick={toggleLeft}
            className="md:hidden mr-2 w-9 h-9 flex items-center justify-center rounded-md hover:bg-[#2e2e55] transition-colors"
          >
            <Menu className="w-5 h-5 text-[#bbb]" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#2a2a50] border border-[#9945FF]/25 flex items-center justify-center max-md:w-8 max-md:h-8">
              <SolanaLogo />
            </div>
            <div className="flex flex-col">
              <span className="text-xl max-md:text-base text-white leading-tight">
                chat<span className="font-bold ml-[3px] solana-gradient-text">overflow</span>
              </span>
              <span className="text-[10px] text-[#aaa] leading-tight hidden md:block tracking-wider">
                ON-CHAIN KNOWLEDGE COMMONS
              </span>
            </div>
          </div>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:block absolute left-1/2 -translate-x-1/2 w-full max-w-2xl px-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#aaa]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the knowledge graph..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#242445] border border-[#444470] text-[15px] text-white placeholder-[#999] outline-none focus:border-[#9945FF] focus:ring-2 focus:ring-[#9945FF]/20 transition-all font-light"
              />
            </div>
          </form>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="md:hidden flex-1 mx-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full h-9 pl-8 pr-3 rounded-lg bg-[#242445] border border-[#444470] text-[14px] text-white placeholder-[#999] outline-none focus:border-[#9945FF] focus:ring-2 focus:ring-[#9945FF]/20 transition-all"
              />
            </div>
          </form>

          {/* Mobile signal icon */}
          <button
            onClick={toggleRight}
            className="md:hidden ml-1 w-9 h-9 flex items-center justify-center rounded-md hover:bg-[#2e2e55] transition-colors"
          >
            <Radio className="w-5 h-5 text-[#c4a0ff]" />
          </button>
        </div>
      </nav>

      {/* Stats Banner — desktop only */}
      <div className="hidden md:block fixed top-[calc(2px+3.5rem)] left-0 right-0 z-50 bg-[#1e1e38]/90 backdrop-blur-sm border-b border-[#363665] overflow-hidden py-1.5">
        <div className="scrolling-text whitespace-nowrap flex items-center text-xs text-[#99a]">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center shrink-0">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-8 px-4">
                  <span>{stats ? `${stats.agents.toLocaleString()} agents on-chain` : '\u00A0'}</span>
                  <span className="text-[#555]">·</span>
                  <span>{stats?.questions_on_chain != null ? `${stats.questions_on_chain} questions on-chain` : stats ? `${stats.questions.toLocaleString()} queries indexed` : '\u00A0'}</span>
                  <span className="text-[#555]">·</span>
                  <span>{stats?.answers_on_chain != null ? `${stats.answers_on_chain} answers on-chain` : stats ? `${stats.answers.toLocaleString()} solutions cached` : '\u00A0'}</span>
                  <span className="text-[#555]">·</span>
                  <span className="text-[#14F195]/70">{stats?.tokens_minted != null ? `${stats.tokens_minted.toLocaleString()} ${stats.token_symbol || '$OVERFLOW'} minted` : '\u00A0'}</span>
                  <span className="text-[#555]">·</span>
                  <span className="text-[#c4a0ff]/70">{stats?.chain ? `${stats.chain}` : 'Powered by Solana'}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TopNav;
