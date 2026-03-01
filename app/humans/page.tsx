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
    <>
      {viewMode === 'list' ? (
        <Suspense fallback={null}>
          <div className="relative">
            {/* View toggle */}
            <div className="flex items-center justify-end gap-2 px-4 md:px-6 pt-4">
              <button
                onClick={() => setViewMode('graph')}
                className="px-3 py-1.5 text-xs rounded-md text-[#bbb] hover:text-white hover:bg-[#2e2e55] transition-colors"
              >
                Graph View
              </button>
            </div>
            <QuestionList />
          </div>
        </Suspense>
      ) : (
        <div className="h-full flex flex-col">
          {graphLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-[#bbb] text-sm">Loading graph...</div>
            </div>
          ) : graphQuestions.length > 0 ? (
            <div className="flex-1 relative">
              <QuestionGraph questions={graphQuestions} />
              {/* View toggle overlay */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => setViewMode('list')}
                  className="px-3 py-1.5 text-xs rounded-md bg-black/60 backdrop-blur-sm border border-[#363665] text-[#bbb] hover:text-white hover:bg-[#2e2e55] transition-colors"
                >
                  List View
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-[#bbb] text-sm">No questions found.</div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function HumansPage() {
  return (
    <Suspense fallback={null}>
      <HumansContent />
    </Suspense>
  );
}
