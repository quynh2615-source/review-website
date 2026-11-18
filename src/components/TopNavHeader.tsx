import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Menu, Search, UserCheck, X } from 'lucide-react';
import { ReviewPost, StudentUser, TabId } from '../types';
import { COMMUNITY_RULES, PROJECT_META } from '../data/mockData';
import { GroupLogo } from './GroupLogo';

interface TopNavHeaderProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigateToSearchReview: (query: string) => void;
  currentUser: StudentUser | null;
  posts: ReviewPost[];
  onBackToLanding: () => void;
}

const NAV_TABS: Array<{ id: TabId; label: string }> = [
  { id: 'home', label: 'Trang chủ' },
  { id: 'rules', label: 'Biên bản & Nội quy' },
  { id: 'auth', label: 'Đăng ký & Đăng nhập' },
  { id: 'reviews', label: 'Bài review' },
  { id: 'about', label: 'About us' },
];

export const TopNavHeader: React.FC<TopNavHeaderProps> = ({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  onNavigateToSearchReview,
  currentUser,
  posts,
  onBackToLanding,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const searchResults = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return [];

    const matchedPosts = posts
      .filter(
        (post) =>
          post.targetName.toLowerCase().includes(keyword) ||
          post.content.toLowerCase().includes(keyword) ||
          post.department.toLowerCase().includes(keyword) ||
          (post.courseCode && post.courseCode.toLowerCase().includes(keyword)),
      )
      .slice(0, 4)
      .map((post) => ({
        id: post.id,
        title: post.targetName,
        subtitle: `${post.category === 'lecturer' ? 'Giảng viên' : 'Môn học'} · ${post.department}`,
        tab: 'reviews' as TabId,
        filterText: post.targetName,
      }));

    const matchedRules = COMMUNITY_RULES.filter(
      (r) =>
        r.title.toLowerCase().includes(keyword) ||
        r.detail.toLowerCase().includes(keyword),
    )
      .slice(0, 2)
      .map((r) => ({
        id: `rule-${r.number}`,
        title: `Nội quy ${r.number}: ${r.title}`,
        subtitle: 'Biên bản & Nội quy',
        tab: 'rules' as TabId,
        filterText: '',
      }));

    const aboutMatches =
      PROJECT_META.groupName.toLowerCase().includes(keyword) ||
      PROJECT_META.contactEmail.toLowerCase().includes(keyword) ||
      'about us liên hệ nhóm'.includes(keyword)
        ? [
            {
              id: 'about-match',
              title: PROJECT_META.groupName,
              subtitle: 'About us · Thông tin nhóm & liên hệ',
              tab: 'about' as TabId,
              filterText: '',
            },
          ]
        : [];

    return [...matchedPosts, ...matchedRules, ...aboutMatches];
  }, [searchQuery, posts]);

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchOpen(false);
    onNavigateToSearchReview(searchQuery.trim());
  };

  return (
    <header className="shrink-0 bg-white border-b border-slate-200 z-30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Logo nhóm (Click để xem lại màn hình mở đầu Lớp 0 nếu muốn) */}
        <button
          type="button"
          onClick={onBackToLanding}
          title="Quay lại màn hình mở đầu"
          className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 rounded-md shrink-0"
        >
          <GroupLogo variant="dark" size="sm" />
        </button>

        {/* Zone 2: Thanh tìm kiếm nhanh nội dung/từ khóa trên web */}
        <div
          ref={searchContainerRef}
          className="relative flex-1 max-w-sm hidden sm:block"
        >
          <form onSubmit={handleSubmitSearch} className="relative">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="Tìm giảng viên, môn học, từ khóa..."
              aria-label="Tìm kiếm nhanh nội dung trên web"
              className="w-full h-9 pl-9 pr-8 text-sm bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-blue-600 rounded-lg text-slate-900 placeholder:text-slate-500 transition-colors focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  setIsSearchOpen(false);
                }}
                aria-label="Xóa từ khóa tìm kiếm"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Dropdown kết quả tìm kiếm nhanh */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-40">
              {searchResults.length > 0 ? (
                <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {searchResults.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchOpen(false);
                          if (item.tab === 'reviews') {
                            onNavigateToSearchReview(item.filterText || searchQuery.trim());
                          } else {
                            onSelectTab(item.tab);
                          }
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-3 text-xs text-slate-500">
                  Không tìm thấy nội dung khớp với &ldquo;{searchQuery}&rdquo;. Nhấn Enter để tìm trong Bài review.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Zone 3: Main Menu Tabs theo hàng ngang */}
        <nav
          aria-label="Menu chính"
          className="hidden lg:flex items-center gap-1 shrink-0"
        >
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const displayLabel =
              tab.id === 'auth' && currentUser
                ? `${currentUser.fullName.split(' ').slice(-1)[0]} (${currentUser.studentId})`
                : tab.label;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.id === 'auth' && currentUser && (
                  <UserCheck className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
                )}
                <span>{displayLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Search & Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3">
          <form onSubmit={handleSubmitSearch} className="relative sm:hidden">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm giảng viên, môn học..."
              className="w-full h-10 pl-9 pr-3 text-sm bg-slate-100 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </form>

          <div className="grid grid-cols-1 gap-1">
            {NAV_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const displayLabel =
                tab.id === 'auth' && currentUser
                  ? `Tài khoản: ${currentUser.fullName} (${currentUser.studentId})`
                  : tab.label;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
