'use client';

import { Search, X, Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Forum {
  id: string;
  name: string;
  description: string | null;
  question_count: number;
}

const INITIAL_SHOW = 8;

const DomainBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeForumId = searchParams.get('forum') || '';
  const activeForumName = searchParams.get('fname') || '';
  const searchQuery = searchParams.get('search') || '';

  const [forums, setForums] = useState<Forum[]>([]);
  const [query, setQuery] = useState(searchQuery);
  const [domainFilter, setDomainFilter] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/forums')
      .then((res) => res.json())
      .then((data) => setForums(data.forums || []))
      .catch(() => {});
  }, []);

  // Sync query from URL on navigation
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setShowAll(false);
        setDomainFilter('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = domainFilter
    ? forums.filter((f) => f.name.toLowerCase().includes(domainFilter.toLowerCase()))
    : forums;

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_SHOW);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set('search', trimmed);
    if (activeForumId) {
      params.set('forum', activeForumId);
      params.set('fname', activeForumName);
    }
    router.push(`/humans${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleSelectDomain = (forum: Forum) => {
    if (activeForumId === forum.id) {
      // Deselect
      const params = new URLSearchParams();
      if (query.trim()) params.set('search', query.trim());
      router.push(`/humans${params.toString() ? `?${params.toString()}` : ''}`);
    } else {
      const params = new URLSearchParams();
      if (query.trim()) params.set('search', query.trim());
      params.set('forum', forum.id);
      params.set('fname', forum.name);
      if (forum.description) params.set('fdesc', forum.description);
      router.push(`/humans?${params.toString()}`);
    }
    setDropdownOpen(false);
    setShowAll(false);
    setDomainFilter('');
  };

  const handleClearDomain = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    router.push(`/humans${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (dropdownOpen) {
      setShowAll(false);
      setDomainFilter('');
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto px-4 pt-5 pb-1">
      {/* Unified search bar */}
      <div className="relative flex items-center">
        {/* Domain filter button */}
        <button
          onClick={toggleDropdown}
          className={`absolute left-0 z-10 h-10 px-3 flex items-center gap-1.5 rounded-l-lg border-r border-[#444470]/50 transition-colors ${
            dropdownOpen
              ? 'text-[#c4a0ff]'
              : activeForumId
                ? 'text-[#c4a0ff]'
                : 'text-[#777] hover:text-[#aaa]'
          }`}
        >
          {activeForumId ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${activeForumName}&sz=16`}
              alt=""
              className="w-4 h-4 rounded-sm"
            />
          ) : (
            <Globe className="w-4 h-4" />
          )}
        </button>

        {/* Active domain chip */}
        {activeForumId && (
          <div className="absolute left-10 z-10 flex items-center gap-1 px-2 py-0.5 rounded bg-[#9945FF]/10 border border-[#9945FF]/20 text-xs text-[#c4a0ff]">
            {activeForumName}
            <button onClick={handleClearDomain} className="hover:text-white transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Search input */}
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={activeForumId ? `Search on ${activeForumName}...` : 'Search questions...'}
              className={`w-full h-10 pr-10 rounded-lg bg-[#242445] border border-[#444470] text-sm text-white placeholder-[#666] outline-none focus:border-[#9945FF]/60 focus:shadow-[0_0_12px_rgba(153,69,255,0.1)] transition-all ${
                activeForumId ? 'pl-[140px]' : 'pl-10'
              }`}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#aaa] transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Domain dropdown */}
      {dropdownOpen && (
        <div className="absolute left-4 right-4 mt-2 bg-[#1a1a35] border border-[#363665] rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fade-in">
          {/* Domain filter input */}
          <div className="px-3 pt-3 pb-2">
            <input
              type="text"
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              placeholder="Filter websites..."
              autoFocus
              className="w-full h-8 px-3 rounded-md bg-[#242445] border border-[#363665] text-xs text-white placeholder-[#666] outline-none focus:border-[#9945FF]/40 transition-colors"
            />
          </div>

          {visible.length === 0 ? (
            <div className="px-6 py-6 text-center text-xs text-[#666]">
              No websites found{domainFilter ? ` matching "${domainFilter}"` : ''}
            </div>
          ) : (
            <>
              <div
                className={`grid grid-cols-2 md:grid-cols-4 gap-0.5 px-2 pb-2 ${
                  showAll ? 'max-h-56 overflow-y-scroll thin-scrollbar' : ''
                }`}
              >
                {visible.map((forum) => (
                  <button
                    key={forum.id}
                    onClick={() => handleSelectDomain(forum)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                      activeForumId === forum.id
                        ? 'bg-[#9945FF]/12 ring-1 ring-[#9945FF]/25'
                        : 'hover:bg-[#2e2e55]'
                    }`}
                  >
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${forum.name}&sz=32`}
                      alt=""
                      className="w-5 h-5 rounded flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className={`text-xs truncate ${activeForumId === forum.id ? 'text-[#c4a0ff] font-medium' : 'text-[#bbb]'}`}>
                        {forum.name}
                      </div>
                      <div className="text-[10px] text-[#555]">
                        {forum.question_count}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {filtered.length > INITIAL_SHOW && (
                <div className="border-t border-[#363665]/50 px-4 py-2">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full text-center text-xs text-[#777] hover:text-[#c4a0ff] transition-colors"
                  >
                    {showAll ? 'Show less' : `Show all ${filtered.length}`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DomainBar;
