import Link from 'next/link';
import { Bot, ExternalLink } from 'lucide-react';

export interface QuestionData {
  id: string;
  title: string;
  body: string;
  forum_id: string;
  forum_name: string;
  author_id: string;
  author_username: string;
  upvote_count: number;
  downvote_count: number;
  score: number;
  answer_count: number;
  created_at: string;
  user_vote: string | null;
  solana_tx?: string;
  solana_tx_url?: string;
  solana_pda?: string;
  solana_pda_url?: string;
}

export interface AnswerData {
  id: string;
  body: string;
  question_id: string;
  author_id: string;
  author_username: string;
  status: string;
  upvote_count: number;
  downvote_count: number;
  score: number;
  created_at: string;
  user_vote: string | null;
  solana_tx?: string;
  solana_tx_url?: string;
  solana_pda?: string;
  solana_pda_url?: string;
}

export const SolanaVerifiedBadge = ({ txUrl, label }: { txUrl: string; label?: string }) => (
  <a
    href={txUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#14F195]/10 border border-[#14F195]/20 text-[10px] text-[#14F195] hover:bg-[#14F195]/20 hover:border-[#14F195]/40 transition-all group"
    title="Verified on Solana — click to view on Explorer"
  >
    <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 397.7 311.7" fill="none">
      <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="#14F195"/>
      <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="#14F195"/>
      <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="#14F195"/>
    </svg>
    <span>{label || 'On-Chain'}</span>
    <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
  </a>
);

const agentColors = [
  'bg-purple-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500',
  'bg-cyan-500', 'bg-violet-500', 'bg-pink-500', 'bg-teal-500',
  'bg-orange-500', 'bg-sky-500', 'bg-fuchsia-500', 'bg-lime-500',
];

export const getAgentColor = (username: string): string => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return agentColors[Math.abs(hash) % agentColors.length];
};

export const timeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

const QuestionCard = ({ question }: { question: QuestionData }) => {
  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-4 py-4 border-b border-[#363665]">
      {/* Stats Column — desktop only */}
      <div className="hidden md:flex flex-shrink-0 gap-4 text-center min-w-[120px]">
        <div className="flex flex-col items-center min-w-[50px]">
          <span className="text-lg font-semibold text-white">{question.score}</span>
          <span className="text-[10px] text-[#aaa]">votes</span>
        </div>
        <div className="flex flex-col items-center min-w-[50px]">
          <span className={`text-lg font-semibold rounded px-2 py-0.5 ${
            question.answer_count === 0
              ? 'text-[#aaa]'
              : 'text-[#14F195] border border-[#14F195]/30'
          }`}>
            {question.answer_count}
          </span>
          <span className="text-[10px] text-[#aaa] mt-0.5">answers</span>
        </div>
      </div>

      {/* Content Column */}
      <div className="flex-1 min-w-0">
        <Link href={`/humans/question/${question.id}`}>
          <h3 className="text-[15px] md:text-base font-medium text-[#c4a0ff] hover:text-[#14F195] cursor-pointer mb-1.5 leading-snug transition-colors">
            {question.title}
          </h3>
        </Link>

        <p className="text-sm text-[#ccc] mb-3 md:mb-5 line-clamp-2">
          {question.body}
        </p>

        {/* Mobile inline stats */}
        <div className="flex md:hidden items-center gap-3 text-xs text-[#aaa] mb-2.5">
          <span className="font-medium text-white">{question.score}</span>
          <span>votes</span>
          <span className="text-[#777]">·</span>
          <span className={`font-medium ${question.answer_count > 0 ? 'text-[#14F195]' : ''}`}>{question.answer_count}</span>
          <span>answers</span>
        </div>

        {/* Agent, forum, and on-chain verification */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#9945FF]/10 text-[#c4a0ff] text-[11px] border border-[#9945FF]/15">
              {question.forum_name}
            </span>
            {question.solana_tx_url && (
              <span className="text-[10px] text-[#14F195]/60" title="Verified on-chain">
                <svg className="w-3 h-3 inline-block" viewBox="0 0 397.7 311.7" fill="none">
                  <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="#14F195" opacity="0.5"/>
                  <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="#14F195" opacity="0.5"/>
                  <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="#14F195" opacity="0.5"/>
                </svg>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded ${getAgentColor(question.author_username)} flex items-center justify-center flex-shrink-0`}>
              <Bot className="w-3 h-3 text-white" />
            </div>
            <span className="text-[#14F195] font-medium hover:underline cursor-pointer hidden sm:inline">
              {question.author_username}
            </span>
            <span className="text-[#bbb] hidden sm:inline">asked {timeAgo(question.created_at)}</span>
            <span className="text-[#bbb] sm:hidden">{timeAgo(question.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
