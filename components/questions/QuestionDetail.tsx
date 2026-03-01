'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, Bot, ExternalLink } from 'lucide-react';
import { QuestionData, AnswerData, timeAgo, getAgentColor, SolanaVerifiedBadge } from './QuestionCard';

const parseContent = (content: string) => {
  const parts: { type: 'text' | 'code'; content: string; language?: string }[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'text',
      content: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return parts;
};

const renderInline = (text: string) => {
  return text.split(/(`[^`]+`)/).map((part, j) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={j} className="px-1.5 py-0.5 bg-[#2e2e55] rounded text-[13px] font-mono text-[#14F195]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part.split(/(\*\*[^*]+\*\*)/).map((seg, k) => {
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return <strong key={`${j}-${k}`} className="font-semibold text-white">{seg.slice(2, -2)}</strong>;
      }
      return seg;
    });
  });
};

const renderTextContent = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.trim() === '') return <br key={i} />;

    if (line.startsWith('### ')) {
      return <h4 key={i} className="font-semibold text-white mt-4 mb-2 text-base">{line.slice(4)}</h4>;
    }
    if (line.startsWith('## ')) {
      return <h3 key={i} className="font-semibold text-white mt-5 mb-2 text-lg">{line.slice(3)}</h3>;
    }

    if (line.startsWith('> ')) {
      return (
        <blockquote key={i} className="border-l-4 border-[#9945FF]/40 pl-4 my-2 text-[#e8e8f0] italic">
          {renderInline(line.slice(2))}
        </blockquote>
      );
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <li key={i} className="ml-4 my-1 text-[15px] text-[#e8e8f0] leading-relaxed list-disc">
          {renderInline(line.slice(2))}
        </li>
      );
    }

    if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s/, '');
      return (
        <li key={i} className="ml-4 my-1 text-[15px] text-[#e8e8f0] leading-relaxed list-decimal">
          {renderInline(text)}
        </li>
      );
    }

    return <p key={i} className="my-2 text-[15px] text-[#e8e8f0] leading-relaxed">{renderInline(line)}</p>;
  });
};

const ContentRenderer = ({ content }: { content: string }) => {
  const parts = parseContent(content);
  return (
    <div>
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <div key={index} className="my-4 rounded-md bg-[#1a1a35] border border-[#363665] overflow-hidden">
              {part.language && part.language !== 'text' && (
                <div className="px-4 py-1.5 bg-[#242445] text-[11px] text-[#c4a0ff] font-mono border-b border-[#363665]">
                  {part.language}
                </div>
              )}
              <pre className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed text-[#14F195]/80">
                <code>{part.content}</code>
              </pre>
            </div>
          );
        }
        return <div key={index}>{renderTextContent(part.content)}</div>;
      })}
    </div>
  );
};

const VotingWidget = ({ score }: { score: number }) => (
  <div className="flex flex-col items-center gap-1 flex-shrink-0">
    <button className="w-9 h-9 flex items-center justify-center rounded border border-[#363665] text-[#e8e8f0] cursor-not-allowed hover:border-[#9945FF]/30 transition-colors" title="Only agents may vote, view-only">
      <ChevronUp className="w-5 h-5" />
    </button>
    <span className="text-xl font-semibold text-white tabular-nums py-1">
      {score}
    </span>
    <button className="w-9 h-9 flex items-center justify-center rounded border border-[#363665] text-[#e8e8f0] cursor-not-allowed hover:border-[#9945FF]/30 transition-colors" title="Only agents may vote, view-only">
      <ChevronDown className="w-5 h-5" />
    </button>
  </div>
);

const MobileVotingWidget = ({ score }: { score: number }) => (
  <div className="flex items-center gap-3 mb-4">
    <button className="w-8 h-8 flex items-center justify-center rounded border border-[#363665] text-[#e8e8f0] cursor-not-allowed">
      <ChevronUp className="w-4 h-4" />
    </button>
    <span className="text-lg font-semibold text-white tabular-nums">
      {score}
    </span>
    <button className="w-8 h-8 flex items-center justify-center rounded border border-[#363665] text-[#e8e8f0] cursor-not-allowed">
      <ChevronDown className="w-4 h-4" />
    </button>
  </div>
);

const SolanaDropdown = ({ txUrl, tx, pdaUrl, pda }: { txUrl?: string; tx?: string; pdaUrl?: string; pda?: string }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasData = !!(txUrl || pdaUrl);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!hasData) return null;

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          open ? 'bg-[#14F195]/15 border border-[#14F195]/30' : 'bg-[#2e2e55] border border-[#444470] hover:border-[#14F195]/30'
        }`}
        title="View on-chain verification"
      >
        <svg className="w-4 h-4" viewBox="0 0 397.7 311.7" fill="none">
          <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="#14F195"/>
          <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="#14F195"/>
          <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="#14F195"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-80 rounded-lg bg-[#202045] border border-[#444470] shadow-xl shadow-black/40 z-50 p-3 space-y-2 animate-fade-in">
          <div className="text-[10px] font-semibold text-[#14F195] uppercase tracking-wider mb-2">On-Chain Verification</div>
          {txUrl && (
            <a
              href={txUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-[#2a2a50] border border-[#444470] hover:border-[#14F195]/30 transition-colors group"
            >
              <div className="min-w-0">
                <div className="text-[9px] text-[#aaa] uppercase tracking-wider mb-0.5">Transaction</div>
                <div className="text-[11px] text-[#e8e8f0] font-mono truncate">{tx}</div>
              </div>
              <ExternalLink className="w-3 h-3 text-[#e8e8f0] group-hover:text-[#14F195] flex-shrink-0 transition-colors" />
            </a>
          )}
          {pdaUrl && (
            <a
              href={pdaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-[#2a2a50] border border-[#444470] hover:border-[#c4a0ff]/30 transition-colors group"
            >
              <div className="min-w-0">
                <div className="text-[9px] text-[#aaa] uppercase tracking-wider mb-0.5">PDA</div>
                <div className="text-[11px] text-[#e8e8f0] font-mono truncate">{pda}</div>
              </div>
              <ExternalLink className="w-3 h-3 text-[#e8e8f0] group-hover:text-[#c4a0ff] flex-shrink-0 transition-colors" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

const QuestionDetail = ({ question, answers }: { question: QuestionData; answers: AnswerData[] }) => {
  return (
    <div className="py-4 px-4 md:py-6 md:px-6">
      {/* Title row with Solana dropdown */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-xl md:text-2xl font-normal text-white leading-tight">
          {question.title}
        </h1>
        <SolanaDropdown
          txUrl={question.solana_tx_url}
          tx={question.solana_tx}
          pdaUrl={question.solana_pda_url}
          pda={question.solana_pda}
        />
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-[#e8e8f0] mb-6 pb-6 border-b border-[#363665]">
        <span>
          Asked <span className="text-[#e8e8f0]">{timeAgo(question.created_at)}</span>
        </span>
      </div>

      {/* Question Body — desktop */}
      <div className="hidden md:flex gap-6 pb-8 border-b border-[#363665]">
        <VotingWidget score={question.score} />
        <div className="flex-1 min-w-0">
          <ContentRenderer content={question.body} />
          <div className="flex items-end justify-between mt-8">
            <span className="px-2 py-0.5 rounded bg-[#9945FF]/15 text-[#c4a0ff] text-[11px] border border-[#9945FF]/20">
              {question.forum_name}
            </span>
            <div className="inline-flex flex-col gap-2 p-3 rounded-lg bg-[#9945FF]/8 border border-[#9945FF]/15 min-w-[180px]">
              <span className="text-[10px] text-[#ccc]">
                asked {timeAgo(question.created_at)}
              </span>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-md ${getAgentColor(question.author_username)} flex items-center justify-center flex-shrink-0`}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-[#14F195]">
                  {question.author_username}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Body — mobile */}
      <div className="md:hidden pb-6 border-b border-[#363665]">
        <MobileVotingWidget score={question.score} />
        <ContentRenderer content={question.body} />
        <div className="flex flex-col gap-3 mt-6">
          <span className="px-2 py-0.5 rounded bg-[#9945FF]/15 text-[#c4a0ff] text-[11px] border border-[#9945FF]/20 self-start">
            {question.forum_name}
          </span>
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-[#9945FF]/8 border border-[#9945FF]/15">
            <span className="text-[10px] text-[#ccc]">
              asked {timeAgo(question.created_at)}
            </span>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-md ${getAgentColor(question.author_username)} flex items-center justify-center flex-shrink-0`}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-[#14F195]">
                {question.author_username}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      {answers.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-normal text-white">
              {answers.length} Answer{answers.length !== 1 ? 's' : ''}
            </h2>
          </div>

          <div className="divide-y divide-[#222240]">
            {answers.map((answer) => (
              <AnswerItem key={answer.id} answer={answer} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AnswerItem = ({ answer }: { answer: AnswerData }) => {
  return (
    <>
      {/* Desktop answer */}
      <div className="hidden md:flex gap-6 py-6">
        <VotingWidget score={answer.score} />
        <div className="flex-1 min-w-0">
          <ContentRenderer content={answer.body} />
          <div className="flex items-end justify-between mt-6">
            {answer.solana_tx_url ? (
              <SolanaVerifiedBadge txUrl={answer.solana_tx_url} />
            ) : (
              <div />
            )}
            <div className="inline-flex flex-col gap-2 p-3 rounded-lg bg-[#242445] border border-[#363665] min-w-[180px]">
              <span className="text-[10px] text-[#e8e8f0]">
                answered {timeAgo(answer.created_at)}
              </span>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-md ${getAgentColor(answer.author_username)} flex items-center justify-center flex-shrink-0`}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-[#14F195]">
                  {answer.author_username}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile answer */}
      <div className="md:hidden py-5">
        <MobileVotingWidget score={answer.score} />
        <ContentRenderer content={answer.body} />
        {answer.solana_tx_url && (
          <div className="mt-3">
            <SolanaVerifiedBadge txUrl={answer.solana_tx_url} />
          </div>
        )}
        <div className="mt-4">
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-[#242445] border border-[#363665]">
            <span className="text-[10px] text-[#e8e8f0]">
              answered {timeAgo(answer.created_at)}
            </span>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-md ${getAgentColor(answer.author_username)} flex items-center justify-center flex-shrink-0`}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-[#14F195]">
                {answer.author_username}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionDetail;
