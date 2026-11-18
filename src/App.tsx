import { useCallback, useEffect, useState } from 'react';
import { INITIAL_POSTS, INITIAL_USERS } from './data/mockData';
import {
  ReviewCategory,
  ReviewPost,
  StudentUser,
  TabId,
} from './types';
import { LandingLayer } from './components/LandingLayer';
import { TopNavHeader } from './components/TopNavHeader';
import { HomeView } from './components/views/HomeView';
import { RulesView } from './components/views/RulesView';
import { AuthView } from './components/views/AuthView';
import { ReviewsView } from './components/views/ReviewsView';
import { AboutView } from './components/views/AboutView';
import { ChatbotWidget } from './components/ChatbotWidget';

const SESSION_KEY = 'univoice_session_user_v1';

function loadSessionUser(): StudentUser | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudentUser;
  } catch {
    return null;
  }
}

export default function App() {
  // LỚP 0 vs LỚP 1 transition state
  const [showLanding, setShowLanding] = useState(true);

  // Active Tab trong Lớp 1
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // Từ khóa tìm kiếm nhanh trên Top Header
  const [searchQuery, setSearchQuery] = useState('');

  // Thông báo khi người dùng chưa đăng nhập bị chuyển từ View 4 về View 3
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Phiên đăng nhập cá nhân của người dùng hiện tại
  const [currentUser, setCurrentUser] = useState<StudentUser | null>(() =>
    loadSessionUser(),
  );

  // Dữ liệu bài review & số tài khoản đồng bộ từ máy chủ dùng chung
  const [posts, setPosts] = useState<ReviewPost[]>(INITIAL_POSTS);
  const [usersCount, setUsersCount] = useState<number>(INITIAL_USERS.length);

  const fetchSharedPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/posts');
      if (!response.ok) return;
      const data = (await response.json()) as {
        posts?: ReviewPost[];
        usersCount?: number;
      };
      if (Array.isArray(data.posts)) {
        setPosts(data.posts);
      }
      if (typeof data.usersCount === 'number') {
        setUsersCount(data.usersCount);
      }
    } catch {
      // Giữ nguyên dữ liệu hiện có nếu mạng tạm gián đoạn
    }
  }, []);

  // Tải dữ liệu dùng chung khi mở web & đồng bộ định kỳ mỗi 5 giây để thấy bài người khác
  useEffect(() => {
    fetchSharedPosts();

    const intervalId = window.setInterval(() => {
      fetchSharedPosts();
    }, 5000);

    const handleFocus = () => {
      fetchSharedPosts();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchSharedPosts]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    } catch {
      // Ignore storage errors
    }
  }, [currentUser]);

  const handleRegister = async (payload: {
    fullName: string;
    email: string;
    studentId: string;
    password: string;
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        user?: StudentUser;
        usersCount?: number;
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.user) {
        return {
          ok: false,
          message: data.error || 'Không thể đăng ký tài khoản lúc này.',
        };
      }

      setCurrentUser(data.user);
      if (typeof data.usersCount === 'number') {
        setUsersCount(data.usersCount);
      }
      return {
        ok: true,
        message:
          data.message || `Đăng ký thành công! Xin chào ${data.user.fullName}.`,
      };
    } catch {
      return {
        ok: false,
        message: 'Lỗi kết nối máy chủ khi đăng ký tài khoản.',
      };
    }
  };

  const handleLogin = async (payload: {
    studentId: string;
    password: string;
  }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        user?: StudentUser;
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.user) {
        return {
          ok: false,
          message:
            data.error || 'Mã số sinh viên hoặc mật khẩu không chính xác.',
        };
      }

      setCurrentUser(data.user);
      return {
        ok: true,
        message:
          data.message || `Đăng nhập thành công! Chào mừng ${data.user.fullName}.`,
      };
    } catch {
      return {
        ok: false,
        message: 'Lỗi kết nối máy chủ khi đăng nhập.',
      };
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleRequireAuth = (notice: string) => {
    setAuthNotice(notice);
    setActiveTab('auth');
  };

  const handleCreatePost = async (payload: {
    category: ReviewCategory;
    targetName: string;
    courseCode: string;
    department: string;
    rating: number;
    content: string;
    imageUrl?: string;
  }) => {
    if (!currentUser) {
      return { ok: false, error: 'Bạn cần đăng nhập trước khi đăng bài.' };
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          authorName: currentUser.fullName,
          authorStudentId: currentUser.studentId,
        }),
      });

      const data = (await response.json()) as {
        posts?: ReviewPost[];
        error?: string;
      };

      if (!response.ok || !Array.isArray(data.posts)) {
        return {
          ok: false,
          error: data.error || 'Không thể lưu bài viết lên máy chủ.',
        };
      }

      setPosts(data.posts);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: 'Lỗi kết nối máy chủ khi đăng bài review.',
      };
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: currentUser.studentId }),
      });
      if (!response.ok) return;
      const data = (await response.json()) as { posts?: ReviewPost[] };
      if (Array.isArray(data.posts)) {
        setPosts(data.posts);
      }
    } catch {
      // Ignore transient network errors
    }
  };

  const handleAddComment = async (
    postId: string,
    payload: { content: string; imageUrl?: string },
  ) => {
    if (!currentUser) {
      return { ok: false, error: 'Vui lòng đăng nhập để bình luận.' };
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: currentUser.fullName,
          authorStudentId: currentUser.studentId,
          content: payload.content,
          imageUrl: payload.imageUrl,
        }),
      });

      const data = (await response.json()) as {
        posts?: ReviewPost[];
        error?: string;
      };

      if (!response.ok || !Array.isArray(data.posts)) {
        return {
          ok: false,
          error: data.error || 'Không thể gửi bình luận lên máy chủ.',
        };
      }

      setPosts(data.posts);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: 'Lỗi kết nối máy chủ khi gửi bình luận.',
      };
    }
  };

  const handleNavigateToSearchReview = (query: string) => {
    setSearchQuery(query);
    setActiveTab('reviews');
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* LỚP 0: CINEMATIC LANDING PAGE */}
      <LandingLayer
        isVisible={showLanding}
        onEnterDashboard={() => setShowLanding(false)}
      />

      {/* LỚP 1: MAIN APPLICATION DASHBOARD (Fixed Viewport / Tab Switching) */}
      <div
        aria-hidden={showLanding}
        className={`h-full w-full flex flex-col transition-opacity duration-500 ${
          showLanding ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* FIXED TOP HEADER NAVIGATION BAR */}
        <TopNavHeader
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'reviews' || tab === 'home') {
              fetchSharedPosts();
            }
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNavigateToSearchReview={handleNavigateToSearchReview}
          currentUser={currentUser}
          posts={posts}
          onBackToLanding={() => setShowLanding(true)}
        />

        {/* MAIN DYNAMIC VIEW AREA (Không reload, cuộn nội dung độc lập) */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeView
              posts={posts}
              usersCount={usersCount}
              currentUser={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'rules' && (
            <RulesView onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'auth' && (
            <AuthView
              currentUser={currentUser}
              authNotice={authNotice}
              onClearAuthNotice={() => setAuthNotice(null)}
              onRegister={handleRegister}
              onLogin={handleLogin}
              onLogout={handleLogout}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsView
              posts={posts}
              currentUser={currentUser}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              onRequireAuth={handleRequireAuth}
              onCreatePost={handleCreatePost}
              onToggleLike={handleToggleLike}
              onAddComment={handleAddComment}
            />
          )}

          {activeTab === 'about' && <AboutView />}
        </main>

        {/* BOTTOM-RIGHT FLOATING ACTION BUTTON & AI CHATBOT WIDGET */}
        <ChatbotWidget />
      </div>
    </div>
  );
}
