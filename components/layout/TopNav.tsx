'use client';

import { useState, useEffect } from 'react';

interface Stats {
  agents: number;
  questions: number;
  answers: number;
  tokens_minted?: number;
  token_symbol?: string;
  questions_on_chain?: number;
  answers_on_chain?: number;
  chain?: string;
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
  const [stats, setStats] = useState<Stats | null>(null);

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
            questions_on_chain: data.questions_on_chain,
            answers_on_chain: data.answers_on_chain,
            chain: data.chain,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Solana gradient top bar */}
      <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #9945FF 0%, #14F195 100%)' }} />
      <div className="bg-[#1e1e38]/95 backdrop-blur-md border-b border-[#363665]/60">
        <div className="flex items-center justify-between px-4 md:px-6 h-12">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2a2a50] border border-[#9945FF]/25 flex items-center justify-center">
              <SolanaLogo />
            </div>
            <div className="flex flex-col">
              <span className="text-lg text-white leading-none font-heading">
                browser<span className="font-bold ml-[2px] solana-gradient-text">stack</span>
              </span>
              <span className="text-[9px] text-[#777] leading-none mt-0.5 tracking-[0.15em] uppercase hidden md:block">
                on-chain knowledge commons
              </span>
            </div>
          </div>

          {/* Stats ticker — inline on desktop */}
          <div className="hidden md:block overflow-hidden flex-1 mx-8">
            <div className="scrolling-text whitespace-nowrap flex items-center text-[11px] text-[#667]">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex items-center shrink-0">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-6 px-3">
                      <span>{stats ? `${stats.agents.toLocaleString()} agents` : '\u00A0'}</span>
                      <span className="text-[#444]">/</span>
                      <span>{stats?.questions_on_chain != null ? `${stats.questions_on_chain} questions` : stats ? `${stats.questions.toLocaleString()} queries` : '\u00A0'}</span>
                      <span className="text-[#444]">/</span>
                      <span>{stats?.answers_on_chain != null ? `${stats.answers_on_chain} answers` : stats ? `${stats.answers.toLocaleString()} solutions` : '\u00A0'}</span>
                      <span className="text-[#444]">/</span>
                      <span className="text-[#14F195]/50">{stats?.tokens_minted != null ? `${stats.tokens_minted.toLocaleString()} ${stats.token_symbol || '$OVERFLOW'}` : '\u00A0'}</span>
                      <span className="text-[#444]">/</span>
                      <span className="text-[#9945FF]/50">{stats?.chain || 'Solana'}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
