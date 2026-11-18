import React, { useState } from 'react';
import { Check, Copy, Mail, Send } from 'lucide-react';
import { PROJECT_META, TEAM_MEMBERS } from '../../data/mockData';

export const AboutView: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROJECT_META.contactEmail);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      setCopiedEmail(false);
    }
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName.trim() || !feedbackMsg.trim()) return;
    setFeedbackSent(true);
    setFeedbackName('');
    setFeedbackMsg('');
    window.setTimeout(() => setFeedbackSent(false), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Tên nhóm, tên đồ án & Khái quát lại về web */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <p className="text-xs font-medium text-blue-700 mb-2">
          {PROJECT_META.groupName}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
          {PROJECT_META.projectName}
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
          {PROJECT_META.overviewSummary}
        </p>
      </section>

      {/* Danh sách nhóm */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Danh sách thành viên nhóm thực hiện
          </h2>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {TEAM_MEMBERS.length} thành viên
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="py-3 pr-4">MSSV</th>
                <th className="py-3 pr-4">Họ và tên</th>
                <th className="py-3 pr-4">Vai trò</th>
                <th className="py-3">Phụ trách chính</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TEAM_MEMBERS.map((member) => (
                <tr key={member.studentId} className="hover:bg-slate-50/70">
                  <td className="py-3.5 pr-4 font-mono text-slate-700 tabular-nums whitespace-nowrap">
                    {member.studentId}
                  </td>
                  <td className="py-3.5 pr-4 font-semibold text-slate-900 whitespace-nowrap">
                    {member.fullName}
                  </td>
                  <td className="py-3.5 pr-4 text-slate-700 whitespace-nowrap">
                    {member.role}
                  </td>
                  <td className="py-3.5 text-slate-600">{member.responsibility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Thông tin liên hệ (Email) & Góp ý */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Thông tin liên hệ
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Mọi góp ý về nội dung bài đăng, đề xuất thêm tên môn học hoặc báo cáo vi phạm nội quy vui lòng gửi về email chính thức của nhóm.
            </p>

            <div className="mt-6 space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Email nhóm sinh viên</p>
                <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <a
                    href={`mailto:${PROJECT_META.contactEmail}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline truncate"
                  >
                    <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{PROJECT_META.contactEmail}</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors cursor-pointer shrink-0"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Địa điểm sinh hoạt học thuật</p>
                <p className="text-sm text-slate-700">{PROJECT_META.campusAddress}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Gửi lời nhắn cho nhóm
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Đóng góp ý kiến cải thiện giao diện hoặc bổ sung danh sách môn học mới.
          </p>

          <form onSubmit={handleSendFeedback} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="fb-name"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Tên hoặc MSSV của bạn
              </label>
              <input
                id="fb-name"
                type="text"
                required
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
                placeholder="Ví dụ: Lê Minh - 22110055"
                className="w-full h-10 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              />
            </div>
            <div>
              <label
                htmlFor="fb-msg"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Nội dung góp ý
              </label>
              <textarea
                id="fb-msg"
                rows={3}
                required
                value={feedbackMsg}
                onChange={(e) => setFeedbackMsg(e.target.value)}
                placeholder="Nhập ý kiến đóng góp cho nhóm thực hiện..."
                className="w-full p-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              />
            </div>

            {feedbackSent && (
              <p role="status" className="text-sm text-emerald-700 font-medium">
                Cảm ơn bạn! Lời nhắn góp ý đã được ghi nhận cho nhóm UniVoice.
              </p>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>Gửi góp ý</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
