import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_SLIDES, PROJECT_META } from '../../data/mockData';
import { ReviewPost, StudentUser, TabId } from '../../types';

interface HomeViewProps {
  posts: ReviewPost[];
  usersCount: number;
  currentUser: StudentUser | null;
  onNavigateTab: (tab: TabId) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  posts,
  usersCount,
  currentUser,
  onNavigateTab,
}) => {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  const currentSlide = HERO_SLIDES[activeSlideIdx];
  const lecturerReviewsCount = posts.filter((p) => p.category === 'lecturer').length;
  const courseReviewsCount = posts.filter((p) => p.category === 'course').length;
  const totalCommentsCount = posts.reduce((acc, p) => acc + p.comments.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* KHUNG TRÌNH CHIẾU (Slideshow tổng quan) */}
      <section
        aria-label="Khung trình chiếu giới thiệu"
        className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900 text-white"
      >
        <div className="relative h-[360px] sm:h-[420px] w-full">
          {!failedImages[currentSlide.id] ? (
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              referrerPolicy="no-referrer"
              onError={() =>
                setFailedImages((prev) => ({ ...prev, [currentSlide.id]: true }))
              }
              className="h-full w-full object-cover transition-opacity duration-500"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-800 via-blue-950 to-slate-900" />
          )}

          {/* Measured contrast scrim */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/20"
            aria-hidden="true"
          />

          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
            <p className="text-xs sm:text-sm font-medium text-blue-300 mb-2">
              {currentSlide.subtitle}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white max-w-2xl text-balance">
              {currentSlide.title}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
              {currentSlide.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => onNavigateTab(currentSlide.targetTab)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>{currentSlide.ctaLabel}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              {/* Slide Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5" role="tablist" aria-label="Chọn slide">
                  {HERO_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      role="tab"
                      aria-selected={idx === activeSlideIdx}
                      aria-label={`Slide ${idx + 1}`}
                      onClick={() => setActiveSlideIdx(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === activeSlideIdx
                          ? 'w-7 bg-white'
                          : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSlideIdx(
                        (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
                      )
                    }
                    aria-label="Slide trước"
                    className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length)
                    }
                    aria-label="Slide tiếp theo"
                    className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CARD TỔNG QUAN: Thông tin chung của web */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-blue-700 mb-2">
              Thông tin chung của website
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-balance">
              {PROJECT_META.fullTitle}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              {PROJECT_META.overviewSummary}
            </p>

            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  01. Lọc theo Môn học &amp; Giảng viên
                </h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  Phân loại rạch ròi nhận xét về giáo trình, đề thi và phong cách đứng lớp.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  02. Đăng tải &amp; Thảo luận trực quan
                </h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  Hỗ trợ đính kèm hình ảnh bài giảng, vở ghi và bình luận ngay dưới từng bài viết.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  03. Xác thực bằng MSSV
                </h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  Sinh viên đăng ký bằng mã số sinh viên để đảm bảo cộng đồng trao đổi có trách nhiệm.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('reviews')}
              className="px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Khám phá Bài review
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab(currentUser ? 'reviews' : 'auth')}
              className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {currentUser ? `Đang đăng nhập: ${currentUser.studentId}` : 'Đăng ký / Đăng nhập'}
            </button>
          </div>
        </div>

        {/* Cột số liệu thực tế của cộng đồng */}
        <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">
              Hoạt động hiện tại trên hệ thống
            </p>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Thống kê dữ liệu sinh viên
            </h3>

            <dl className="mt-6 divide-y divide-slate-100">
              <div className="py-3.5 flex items-baseline justify-between gap-4">
                <dt className="text-sm text-slate-600">Tổng bài review</dt>
                <dd className="font-mono text-xl font-semibold text-slate-900 tabular-nums">
                  {posts.length}
                </dd>
              </div>
              <div className="py-3.5 flex items-baseline justify-between gap-4">
                <dt className="text-sm text-slate-600">Review Giảng viên</dt>
                <dd className="font-mono text-xl font-semibold text-slate-900 tabular-nums">
                  {lecturerReviewsCount}
                </dd>
              </div>
              <div className="py-3.5 flex items-baseline justify-between gap-4">
                <dt className="text-sm text-slate-600">Review Môn học</dt>
                <dd className="font-mono text-xl font-semibold text-slate-900 tabular-nums">
                  {courseReviewsCount}
                </dd>
              </div>
              <div className="py-3.5 flex items-baseline justify-between gap-4">
                <dt className="text-sm text-slate-600">Lượt bình luận trao đổi</dt>
                <dd className="font-mono text-xl font-semibold text-slate-900 tabular-nums">
                  {totalCommentsCount}
                </dd>
              </div>
              <div className="py-3.5 flex items-baseline justify-between gap-4">
                <dt className="text-sm text-slate-600">Tài khoản sinh viên</dt>
                <dd className="font-mono text-xl font-semibold text-slate-900 tabular-nums">
                  {usersCount}
                </dd>
              </div>
            </dl>
          </div>

          <p className="mt-4 text-xs text-slate-500 leading-relaxed">
            Cần hướng dẫn thao tác nhanh? Nhấn nút Trợ lý AI ở góc dưới bên phải màn hình.
          </p>
        </aside>
      </section>
    </div>
  );
};
