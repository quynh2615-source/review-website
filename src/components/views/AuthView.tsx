import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, LogOut } from 'lucide-react';
import { StudentUser, TabId } from '../../types';

interface AuthViewProps {
  currentUser: StudentUser | null;
  authNotice: string | null;
  onClearAuthNotice: () => void;
  onRegister: (payload: {
    fullName: string;
    email: string;
    studentId: string;
    password: string;
  }) => Promise<{ ok: boolean; message: string }>;
  onLogin: (payload: {
    studentId: string;
    password: string;
  }) => Promise<{ ok: boolean; message: string }>;
  onLogout: () => void;
  onNavigateTab: (tab: TabId) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  currentUser,
  authNotice,
  onClearAuthNotice,
  onRegister,
  onLogin,
  onLogout,
  onNavigateTab,
}) => {
  // State Khung Đăng ký
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);
  const [regFeedback, setRegFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [isRegSubmitting, setIsRegSubmitting] = useState(false);

  // State Khung Đăng nhập
  const [loginStudentId, setLoginStudentId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegSubmitting) return;
    onClearAuthNotice();
    setIsRegSubmitting(true);
    try {
      const res = await onRegister({
        fullName: regFullName,
        email: regEmail,
        studentId: regStudentId,
        password: regPassword,
      });
      setRegFeedback(res);
      if (res.ok) {
        setRegFullName('');
        setRegEmail('');
        setRegStudentId('');
        setRegPassword('');
      }
    } finally {
      setIsRegSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginSubmitting) return;
    onClearAuthNotice();
    setIsLoginSubmitting(true);
    try {
      const res = await onLogin({
        studentId: loginStudentId,
        password: loginPassword,
      });
      setLoginFeedback(res);
      if (res.ok) {
        setLoginStudentId('');
        setLoginPassword('');
      }
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  const fillDemoAccount = () => {
    setLoginStudentId('22110001');
    setLoginPassword('123456');
    setLoginFeedback(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Thông báo điều hướng từ Bài review nếu chưa đăng nhập */}
      {authNotice && !currentUser && (
        <div
          role="status"
          className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 flex items-center justify-between gap-4 text-sm text-amber-900"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
            <span>{authNotice}</span>
          </div>
          <button
            type="button"
            onClick={onClearAuthNotice}
            className="text-xs font-medium text-amber-800 hover:underline cursor-pointer shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Trạng thái đã đăng nhập */}
      {currentUser ? (
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 mb-2">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>Đang đăng nhập tài khoản sinh viên</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-slate-900">
            {currentUser.fullName}
          </h1>

          <dl className="mt-5 divide-y divide-slate-100 border-t border-b border-slate-100 text-sm">
            <div className="py-3 flex items-center justify-between gap-4">
              <dt className="text-slate-500">Mã số sinh viên (MSSV)</dt>
              <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                {currentUser.studentId}
              </dd>
            </div>
            <div className="py-3 flex items-center justify-between gap-4">
              <dt className="text-slate-500">Email</dt>
              <dd className="text-slate-900">{currentUser.email}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('reviews')}
              className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Chuyển tới Bài review để đăng bài / bình luận
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </section>
      ) : (
        /* Hai khung song song: Khung Đăng ký & Khung Đăng nhập */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* KHUNG ĐĂNG KÝ */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <h1 className="font-display text-xl font-bold text-slate-900">
              Đăng ký tài khoản sinh viên
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Tạo tài khoản bằng thông tin sinh viên để đăng bài review và bình luận.
            </p>

            <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="reg-fullname"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Họ và tên
                </label>
                <input
                  id="reg-fullname"
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Ví dụ: Trần Minh Anh"
                  className="w-full h-10 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="mssv@university.edu.vn"
                  className="w-full h-10 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-mssv"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Mã số sinh viên
                </label>
                <input
                  id="reg-mssv"
                  type="text"
                  required
                  value={regStudentId}
                  onChange={(e) => setRegStudentId(e.target.value)}
                  placeholder="Ví dụ: 22110099"
                  className="w-full h-10 px-3.5 text-sm font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showRegPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full h-10 pl-3.5 pr-10 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPw((v) => !v)}
                    aria-label={showRegPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showRegPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {regFeedback && (
                <div
                  role="alert"
                  className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                    regFeedback.ok
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {regFeedback.ok ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  )}
                  <span>{regFeedback.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isRegSubmitting}
                className="w-full h-10 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                {isRegSubmitting ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
              </button>
            </form>
          </section>

          {/* KHUNG ĐĂNG NHẬP */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Đăng nhập
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Sử dụng Mã số sinh viên và mật khẩu đã đăng ký.
            </p>

            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="login-mssv"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Mã số sinh viên
                </label>
                <input
                  id="login-mssv"
                  type="text"
                  required
                  value={loginStudentId}
                  onChange={(e) => setLoginStudentId(e.target.value)}
                  placeholder="Nhập MSSV của bạn"
                  className="w-full h-10 px-3.5 text-sm font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showLoginPw ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full h-10 pl-3.5 pr-10 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPw((v) => !v)}
                    aria-label={showLoginPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginFeedback && (
                <div
                  role="alert"
                  className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                    loginFeedback.ok
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {loginFeedback.ok ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  )}
                  <span>{loginFeedback.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoginSubmitting}
                className="w-full h-10 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                {isLoginSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
              <span>Dùng thử nhanh: MSSV 22110001 / 123456</span>
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-blue-700 font-medium hover:underline cursor-pointer whitespace-nowrap shrink-0"
              >
                Điền mẫu
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
