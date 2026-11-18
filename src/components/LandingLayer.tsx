import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { FOOTER_MARQUEE_ITEMS, PROJECT_META } from '../data/mockData';
import { GroupLogo } from './GroupLogo';

interface LandingLayerProps {
  isVisible: boolean;
  onEnterDashboard: () => void;
}

const CAMPUS_BACKDROP_SRC =
  '/src/assets/images/campus_hero_backdrop_1794954460099.jpg';

export const LandingLayer: React.FC<LandingLayerProps> = ({
  isVisible,
  onEnterDashboard,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section
      aria-hidden={!isVisible}
      className={`fixed inset-0 z-50 flex flex-col justify-between overflow-hidden bg-slate-950 text-white transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-y-6 pointer-events-none'
      }`}
    >
      {/* [NỀN]: Ảnh Trường Đại Học + Scrim đảm bảo độ tương phản WCAG AA */}
      <div className="absolute inset-0 -z-10">
        {!imageFailed ? (
          <img
            src={CAMPUS_BACKDROP_SRC}
            alt="Toàn cảnh khuôn viên trường đại học"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover object-center scale-[1.02]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950" />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/60 to-slate-950/50"
          aria-hidden="true"
        />
      </div>

      {/* [HERO HEADER]: Logo nhận diện nhóm & tên đồ án */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 pt-6 sm:pt-8 flex items-center justify-between gap-6">
        <GroupLogo variant="light" size="md" />
        <p className="hidden sm:block text-xs sm:text-sm font-medium text-slate-200/90 tracking-wide whitespace-nowrap">
          {PROJECT_META.groupName}
        </p>
      </header>

      {/* [CENTER HERO CONTENT]: Tiêu đề, Tagline & Nút CTA */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 my-auto py-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-blue-300 mb-3">
            Cổng thông tin học đường do sinh viên xây dựng
          </p>

          <h1
            className="font-display font-bold text-white tracking-tight leading-[1.12] text-balance"
            style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.85rem)' }}
          >
            Ý Kiến Sinh Viên Về Môn Học &amp; Giảng Viên
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-200/95 leading-relaxed max-w-2xl">
            Nền tảng chia sẻ góc nhìn chân thực, khách quan về bài giảng, cách chấm điểm,
            tài liệu ôn tập và kinh nghiệm chọn học phần — từ sinh viên dành cho sinh viên.
          </p>

          {/* [ACTION BUTTON]: Trigger chuyển từ Lớp 0 sang Lớp 1 */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onEnterDashboard}
              className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-950/40 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Khám phá ngay</span>
              <ArrowRight
                className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================================
          [FOOTER MARQUEE]: Thông tin liên hệ chạy ngang từ phải qua trái
          Để chỉnh sửa nội dung text, cập nhật mảng FOOTER_MARQUEE_ITEMS
          trong file /src/data/mockData.ts
         ==================================================================== */}
      <footer className="relative z-10 w-full border-t border-white/15 bg-slate-950/75 backdrop-blur-md py-3.5 overflow-hidden marquee-wrapper">
        <div className="animate-marquee-rtl flex items-center whitespace-nowrap">
          {[...FOOTER_MARQUEE_ITEMS, ...FOOTER_MARQUEE_ITEMS].map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center text-xs sm:text-sm text-slate-200 font-medium mx-6"
            >
              <span>{item}</span>
              <span className="ml-12 text-slate-500" aria-hidden="true">
                ·
              </span>
            </span>
          ))}
        </div>
      </footer>
    </section>
  );
};
