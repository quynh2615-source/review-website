import React from 'react';
import { ArrowRight } from 'lucide-react';
import { COMMUNITY_RULES, MEETING_MINUTES } from '../../data/mockData';
import { TabId } from '../../types';

interface RulesViewProps {
  onNavigateTab: (tab: TabId) => void;
}

export const RulesView: React.FC<RulesViewProps> = ({ onNavigateTab }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Biên bản thống nhất vận hành */}
      <article className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3 font-mono tabular-nums">
          <span>Số hiệu: {MEETING_MINUTES.documentCode}</span>
          <span aria-hidden="true">·</span>
          <span>Ngày ban hành: {MEETING_MINUTES.effectiveDate}</span>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
          {MEETING_MINUTES.title}
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
          {MEETING_MINUTES.summary}
        </p>

        <hr className="my-8 border-slate-200" />

        {/* Danh sách các nội quy sử dụng web */}
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 mb-6">
            Nội quy sử dụng website dành cho sinh viên
          </h2>

          <ol className="divide-y divide-slate-100">
            {COMMUNITY_RULES.map((rule) => (
              <li key={rule.number} className="py-5 first:pt-0 last:pb-0">
                <div className="flex items-start gap-4">
                  <span className="font-mono text-sm font-semibold text-blue-700 tabular-nums pt-0.5 shrink-0">
                    {rule.number}.
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-semibold text-slate-900">
                      {rule.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {rule.detail}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-slate-500">
            Bằng việc đăng ký tài khoản hoặc bình luận, bạn đồng ý tuân thủ các quy định nêu trên.
          </p>
          <button
            type="button"
            onClick={() => onNavigateTab('reviews')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Đi tới Bài review</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </article>
    </div>
  );
};
