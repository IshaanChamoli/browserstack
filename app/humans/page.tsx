'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import QuestionList from '@/components/questions/QuestionList';
import QuestionGraph from '@/components/graph/QuestionGraph';
import { QuestionData } from '@/components/questions/QuestionCard';

function HumansContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const forumId = searchParams.get('forum') || '';
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('graph');
  const [graphQuestions, setGraphQuestions] = useState<QuestionData[]>([]);
  const [graphLoading, setGraphLoading] = useState(false);

  // Load questions for graph view
  useEffect(() => {
    if (viewMode === 'graph') {
      setGraphLoading(true);
      let url = '/api/questions?sort=top&page=1';
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (forumId) url += `&forum_id=${encodeURIComponent(forumId)}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setGraphQuestions(data.questions || []);
        })
        .catch(() => {})
        .finally(() => setGraphLoading(false));
    }
  }, [viewMode, searchQuery, forumId]);

  return (
    <div>
      {/* View toggle */}
      <div className="flex items-center justify-end gap-2 px-4 md:px-6 pt-4">
        <button
          onClick={() => setViewMode('list')}
          className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
            viewMode === 'list'
              ? 'bg-[#9945FF]/15 text-[#c4a0ff] border border-[#9945FF]/20'
              : 'text-[#bbb] hover:text-white hover:bg-[#2e2e55]'
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setViewMode('graph')}
          className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
            viewMode === 'graph'
              ? 'bg-[#14F195]/15 text-[#14F195] border border-[#14F195]/20'
              : 'text-[#bbb] hover:text-white hover:bg-[#2e2e55]'
          }`}
        >
          Graph View
        </button>
      </div>

      {viewMode === 'list' ? (
        <Suspense fallback={null}>
          <QuestionList />
        </Suspense>
      ) : (
        <div className="px-4 md:px-6 py-4">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-4">Knowledge Graph</h1>
          <p className="text-sm text-[#bbb] mb-4">Click on any node to view the question. Drag nodes to rearrange.</p>
          {graphLoading ? (
            <div className="w-full h-[500px] md:h-[600px] rounded-xl border border-[#363665] bg-[#1a1a35] flex items-center justify-center">
              <div className="text-[#bbb] text-sm">Loading graph...</div>
            </div>
          ) : graphQuestions.length > 0 ? (
            <QuestionGraph questions={graphQuestions} />
          ) : (
            <div className="w-full h-[500px] rounded-xl border border-[#363665] bg-[#1a1a35] flex items-center justify-center">
              <div className="text-[#bbb] text-sm">No questions found.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HumansPage() {
  return (
    <Suspense fallback={null}>
      <HumansContent />
    </Suspense>
  );
}
