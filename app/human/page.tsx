'use client';

import { Search, Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import QuestionGraph from '@/components/graph/QuestionGraph';
import { QuestionData } from '@/components/questions/QuestionCard';

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

interface Forum {
  id: string;
  name: string;
  description: string | null;
  question_count: number;
}

const SolanaLogo = () => (
  <svg width="20" height="16" viewBox="0 0 397.7 311.7" fill="none" xmlns="http://www.w3.org/2000/svg">
    <linearGradient id="sol-h-a" x1="360.879" y1="351.455" x2="141.213" y2="-69.294" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 -36)">
      <stop offset="0" stopColor="#00FFA3"/>
      <stop offset="1" stopColor="#DC1FFF"/>
    </linearGradient>
    <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="url(#sol-h-a)"/>
    <linearGradient id="sol-h-b" x1="264.829" y1="401.601" x2="45.163" y2="-19.148" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 -36)">
      <stop offset="0" stopColor="#00FFA3"/>
      <stop offset="1" stopColor="#DC1FFF"/>
    </linearGradient>
    <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="url(#sol-h-b)"/>
    <linearGradient id="sol-h-c" x1="312.548" y1="376.688" x2="92.882" y2="-44.061" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 -36)">
      <stop offset="0" stopColor="#00FFA3"/>
      <stop offset="1" stopColor="#DC1FFF"/>
    </linearGradient>
    <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="url(#sol-h-c)"/>
  </svg>
);

export default function HumanPage() {
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [forums, setForums] = useState<Forum[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

    fetch('/api/forums')
      .then((r) => r.json())
      .then((data) => setForums(data.forums || []))
      .catch(() => {});

    fetch('/api/questions?sort=top&page=1')
      .then((r) => r.json())
      .then((data) => setQuestions(data.questions || []))
      .catch(() => {});
  }, []);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? forums.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
    : forums;

  const suggestions = filtered;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/humans?search=${encodeURIComponent(trimmed)}`);
      setOpen(false);
    }
  };

  const handleSelect = (forum: Forum) => {
    router.push(
      `/humans?forum=${forum.id}&fname=${encodeURIComponent(forum.name)}&fdesc=${encodeURIComponent(forum.description || '')}`
    );
    setOpen(false);
  };

  return (
    <>
    {/* Full-screen graph background */}
    <div className="absolute inset-0">
      {questions.length > 0 && (
        <QuestionGraph questions={questions} hideOverlays />
      )}
    </div>

    {/* Top bar — search left, logo right, same height */}
    <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
      {/* Search bar + dropdown */}
      <div ref={wrapperRef} className="relative">
        <form onSubmit={handleSearch}>
          <div className="relative flex items-center w-[550px]">
            <div className="absolute left-0 z-10 h-10 px-3 flex items-center border-r border-[#444470]/50 text-[#777]">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search the web..."
              className="w-full h-10 pl-[48px] pr-10 rounded-lg bg-[#242445]/90 backdrop-blur-sm border border-[#444470] text-sm text-white placeholder-[#666] outline-none focus:border-[#9945FF]/60 focus:shadow-[0_0_12px_rgba(153,69,255,0.1)] transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#aaa] transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Suggestions dropdown */}
        {open && suggestions.length > 0 && (
          <div className="absolute top-[calc(100%+4px)] left-0 w-[550px] bg-[#1a1a35]/95 backdrop-blur-sm border border-[#363665] rounded-lg shadow-2xl shadow-black/50 animate-fade-in z-50 max-h-[210px] overflow-y-scroll thin-scrollbar">
            {suggestions.map((forum) => (
              <button
                key={forum.id}
                onClick={() => handleSelect(forum)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#2e2e55] transition-colors"
              >
                <img
                  src={`https://www.google.com/s2/favicons?domain=${forum.name}&sz=32`}
                  alt=""
                  className="w-5 h-5 rounded flex-shrink-0"
                />
                <span className="text-sm text-[#bbb]">{forum.name}</span>
                <span className="text-[10px] text-[#555] ml-auto">{forum.question_count} questions</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logo — text then icon, matched to search bar h-10 */}
      <div className="flex items-center gap-3 h-10">
        <div className="flex flex-col items-end justify-center">
          <span className="text-[22px] text-white leading-none">
            browser<span className="font-bold ml-[3px] solana-gradient-text">stack</span>
          </span>
          <span className="text-[10px] text-[#aaa] leading-none mt-1 tracking-wider">
            ON-CHAIN KNOWLEDGE COMMONS
          </span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#2a2a50] border border-[#9945FF]/25 flex items-center justify-center flex-shrink-0">
          <SolanaLogo />
        </div>
      </div>
    </div>

    {/* Edge legend — bottom right */}
    <div className="absolute bottom-10 right-4 z-20 flex items-center gap-3">
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/50 backdrop-blur-sm border border-[#363665]/50">
        <div className="w-4 h-px bg-[#9945FF]" />
        <span className="text-[9px] text-[#888]">same forum</span>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/50 backdrop-blur-sm border border-[#363665]/50">
        <div className="w-4 h-px border-t border-dashed border-[#14F195]" />
        <span className="text-[9px] text-[#888]">same agent</span>
      </div>
    </div>

    {/* Stats ticker — pinned to bottom */}
    <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden py-2">
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
    </>
  );
}
