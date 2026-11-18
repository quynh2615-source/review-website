import React, { useMemo, useRef, useState } from 'react';
import {
  ImagePlus,
  MessageSquare,
  Send,
  Star,
  ThumbsUp,
  X,
} from 'lucide-react';
import { ReviewCategory, ReviewPost, StudentUser } from '../../types';
import {
  formatRelativeTimeVi,
  getInitials,
  readAndCompressImage,
} from '../../utils/imageHelper';

interface ReviewsViewProps {
  posts: ReviewPost[];
  currentUser: StudentUser | null;
  searchQuery: string;
  onClearSearch: () => void;
  onRequireAuth: (notice: string) => void;
  onCreatePost: (payload: {
    category: ReviewCategory;
    targetName: string;
    courseCode: string;
    department: string;
    rating: number;
    content: string;
    imageUrl?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  onToggleLike: (postId: string) => void;
  onAddComment: (
    postId: string,
    payload: { content: string; imageUrl?: string },
  ) => Promise<{ ok: boolean; error?: string }>;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  posts,
  currentUser,
  searchQuery,
  onClearSearch,
  onRequireAuth,
  onCreatePost,
  onToggleLike,
  onAddComment,
}) => {
  // Bộ lọc ở góc trên bên trái: Tất cả / Giảng viên / Môn học
  const [categoryFilter, setCategoryFilter] = useState<'all' | ReviewCategory>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');

  // Form đăng bài review mới (kiểu Facebook)
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [newCategory, setNewCategory] = useState<ReviewCategory>('course');
  const [newTargetName, setNewTargetName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState('');
  const [newImageUrl, setNewImageUrl] = useState<string | undefined>(undefined);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [isPublishingPost, setIsPublishingPost] = useState(false);
  const postFileInputRef = useRef<HTMLInputElement>(null);

  // State bình luận theo từng bài viết
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentImages, setCommentImages] = useState<Record<string, string>>({});
  const [commentError, setCommentError] = useState<Record<string, string>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});
  const commentFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Lightbox phóng to ảnh bài viết / bình luận
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Danh sách tên Giảng viên / Môn học tương ứng với tab lọc hiện tại
  const targetOptions = useMemo(() => {
    const scoped =
      categoryFilter === 'all'
        ? posts
        : posts.filter((p) => p.category === categoryFilter);
    return Array.from(new Set(scoped.map((p) => p.targetName))).sort((a, b) =>
      a.localeCompare(b, 'vi'),
    );
  }, [posts, categoryFilter]);

  // Lọc danh sách bài review
  const filteredPosts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      if (categoryFilter !== 'all' && post.category !== categoryFilter) {
        return false;
      }
      if (targetFilter !== 'all' && post.targetName !== targetFilter) {
        return false;
      }
      if (keyword) {
        const haystack = [
          post.targetName,
          post.courseCode ?? '',
          post.department,
          post.content,
          post.authorName,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(keyword)) {
          return false;
        }
      }
      return true;
    });
  }, [posts, categoryFilter, targetFilter, searchQuery]);

  const handleCategoryChange = (next: 'all' | ReviewCategory) => {
    setCategoryFilter(next);
    setTargetFilter('all');
  };

  const handleOpenComposer = () => {
    if (!currentUser) {
      onRequireAuth(
        'Vui lòng đăng nhập hoặc đăng ký tài khoản sinh viên trước khi đăng bài review mới.',
      );
      return;
    }
    setIsComposerExpanded(true);
  };

  const handlePostImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setComposerError(null);
      const dataUrl = await readAndCompressImage(file);
      setNewImageUrl(dataUrl);
    } catch (err) {
      setComposerError(
        err instanceof Error ? err.message : 'Không thể tải ảnh lên.',
      );
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPublishingPost) return;
    if (!currentUser) {
      onRequireAuth(
        'Vui lòng đăng nhập hoặc đăng ký tài khoản sinh viên trước khi đăng bài review.',
      );
      return;
    }

    if (!newTargetName.trim() || !newContent.trim()) {
      setComposerError('Vui lòng nhập tên Giảng viên/Môn học và nội dung nhận xét.');
      return;
    }

    setIsPublishingPost(true);
    setComposerError(null);
    try {
      const result = await onCreatePost({
        category: newCategory,
        targetName: newTargetName.trim(),
        courseCode: newCourseCode.trim(),
        department: newDepartment.trim() || 'Khoa / Bộ môn chung',
        rating: newRating,
        content: newContent.trim(),
        imageUrl: newImageUrl,
      });

      if (!result.ok) {
        setComposerError(result.error || 'Không thể đăng bài review. Vui lòng thử lại.');
        return;
      }

      setNewTargetName('');
      setNewCourseCode('');
      setNewDepartment('');
      setNewRating(5);
      setNewContent('');
      setNewImageUrl(undefined);
      setComposerError(null);
      setIsComposerExpanded(false);
    } finally {
      setIsPublishingPost(false);
    }
  };

  const handleCommentInputInteraction = () => {
    if (!currentUser) {
      onRequireAuth(
        'Bạn cần đăng nhập hoặc đăng ký tài khoản sinh viên để viết bình luận và đính kèm ảnh.',
      );
      return false;
    }
    return true;
  };

  const handleCommentImageUpload = async (
    postId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!currentUser) {
      e.target.value = '';
      onRequireAuth(
        'Bạn cần đăng nhập hoặc đăng ký tài khoản sinh viên để tải ảnh trong bình luận.',
      );
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCommentError((prev) => ({ ...prev, [postId]: '' }));
      const dataUrl = await readAndCompressImage(file, 900, 0.8);
      setCommentImages((prev) => ({ ...prev, [postId]: dataUrl }));
    } catch (err) {
      setCommentError((prev) => ({
        ...prev,
        [postId]:
          err instanceof Error ? err.message : 'Không thể xử lý ảnh bình luận.',
      }));
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmitComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (commentSubmitting[postId]) return;
    if (!currentUser) {
      onRequireAuth(
        'Bạn cần đăng nhập hoặc đăng ký tài khoản sinh viên để gửi bình luận.',
      );
      return;
    }

    const text = (commentDrafts[postId] || '').trim();
    const img = commentImages[postId];
    if (!text && !img) {
      setCommentError((prev) => ({
        ...prev,
        [postId]: 'Hãy nhập nội dung bình luận hoặc chọn ảnh đính kèm.',
      }));
      return;
    }

    setCommentSubmitting((prev) => ({ ...prev, [postId]: true }));
    setCommentError((prev) => ({ ...prev, [postId]: '' }));
    try {
      const result = await onAddComment(postId, { content: text, imageUrl: img });
      if (!result.ok) {
        setCommentError((prev) => ({
          ...prev,
          [postId]: result.error || 'Không thể gửi bình luận lúc này.',
        }));
        return;
      }

      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      setCommentImages((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
    } finally {
      setCommentSubmitting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* ====================================================================
          NÚT ĐẦU TRANG BÊN TRÁI: Bộ lọc nội dung (Giảng viên, Môn học)
         ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            role="group"
            aria-label="Lọc nội dung bài review"
            className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
          >
            <button
              type="button"
              onClick={() => handleCategoryChange('all')}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange('lecturer')}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                categoryFilter === 'lecturer'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Giảng viên
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange('course')}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                categoryFilter === 'course'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Môn học
            </button>
          </div>

          <select
            aria-label="Chọn giảng viên hoặc môn học cụ thể"
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            className="h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-600 max-w-[240px]"
          >
            <option value="all">
              {categoryFilter === 'lecturer'
                ? 'Tất cả giảng viên'
                : categoryFilter === 'course'
                  ? 'Tất cả môn học'
                  : 'Tất cả giảng viên & môn học'}
            </option>
            {targetOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono tabular-nums">
          <span>{filteredPosts.length} bài viết</span>
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-sans font-medium hover:bg-blue-100 cursor-pointer"
            >
              <span>Từ khóa: &ldquo;{searchQuery}&rdquo;</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ====================================================================
          KHUNG ĐĂNG BÀI REVIEW MỚI (GIỐNG FACEBOOK - CHO PHÉP UP ẢNH)
         ==================================================================== */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
        {!isComposerExpanded ? (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-700 text-white font-semibold text-sm flex items-center justify-center shrink-0">
              {currentUser ? getInitials(currentUser.fullName) : 'SV'}
            </div>
            <button
              type="button"
              onClick={handleOpenComposer}
              className="flex-1 text-left px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200/75 text-sm text-slate-600 transition-colors cursor-pointer"
            >
              {currentUser
                ? `${currentUser.fullName} ơi, bạn muốn review môn học hay giảng viên nào?`
                : 'Đăng nhập bằng MSSV để viết bài review môn học hoặc giảng viên...'}
            </button>
            <button
              type="button"
              onClick={handleOpenComposer}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ImagePlus className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Đăng review</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-blue-700 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                  {currentUser ? getInitials(currentUser.fullName) : 'SV'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {currentUser?.fullName}
                  </p>
                  <p className="text-xs font-mono text-slate-500 tabular-nums">
                    MSSV: {currentUser?.studentId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsComposerExpanded(false)}
                aria-label="Đóng khung đăng bài"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Phân loại đánh giá
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setNewCategory('course')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      newCategory === 'course'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Môn học
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory('lecturer')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      newCategory === 'lecturer'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Giảng viên
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Mức độ hài lòng
                </label>
                <div className="flex items-center gap-1 h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      aria-label={`Đánh giá ${star} sao`}
                      className="p-0.5 cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= newRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-mono text-slate-600 tabular-nums">
                    {newRating}/5
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <input
                  type="text"
                  required
                  value={newTargetName}
                  onChange={(e) => setNewTargetName(e.target.value)}
                  placeholder={
                    newCategory === 'lecturer'
                      ? 'Tên giảng viên (VD: TS. Trần Văn A)'
                      : 'Tên môn học (VD: Mạng máy tính)'
                  }
                  className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="sm:col-span-1">
                <input
                  type="text"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  placeholder="Mã học phần (tùy chọn)"
                  className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="sm:col-span-1">
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="Khoa / Bộ môn"
                  className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <textarea
              rows={3}
              required
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm học tập, cách tính điểm, tài liệu hoặc phong cách giảng dạy..."
              className="w-full p-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
            />

            {newImageUrl && (
              <div className="relative inline-block">
                <img
                  src={newImageUrl}
                  alt="Ảnh xem trước bài review"
                  className="max-h-60 rounded-lg border border-slate-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setNewImageUrl(undefined)}
                  aria-label="Xóa ảnh đính kèm"
                  className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/75 text-white hover:bg-slate-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {composerError && (
              <p role="alert" className="text-xs text-red-600 font-medium">
                {composerError}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div>
                <input
                  ref={postFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePostImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => postFileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ImagePlus className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Thêm ảnh minh họa</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isPublishingPost}
                className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                {isPublishingPost ? 'Đang đăng bài...' : 'Đăng bài review'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ====================================================================
          DANH SÁCH CÁC BÀI REVIEW (GIAO DIỆN FACEBOOK FEED + BÌNH LUẬN ẢNH)
         ==================================================================== */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
          <p className="text-base font-semibold text-slate-900">
            Chưa có bài review nào khớp với bộ lọc hiện tại
          </p>
          <p className="text-sm text-slate-500">
            Hãy thử chuyển sang mục Tất cả hoặc xóa từ khóa tìm kiếm.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('all');
              setTargetFilter('all');
              onClearSearch();
            }}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 cursor-pointer"
          >
            Xem tất cả bài review
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredPosts.map((post) => {
            const isLiked = currentUser
              ? post.likes.includes(currentUser.studentId)
              : false;
            const draftText = commentDrafts[post.id] || '';
            const draftImage = commentImages[post.id];
            const cmtErr = commentError[post.id];

            return (
              <article
                key={post.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                {/* Header bài viết kiểu Facebook */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-800 text-white font-semibold text-sm flex items-center justify-center shrink-0">
                        {getInitials(post.authorName)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="text-sm font-semibold text-slate-900">
                            {post.authorName}
                          </span>
                          <span className="text-xs font-mono text-slate-400 tabular-nums">
                            {post.authorStudentId}
                          </span>
                        </div>
                        {/* Metadata không đóng hộp pill, ngăn cách bằng dấu chấm */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <span>{formatRelativeTimeVi(post.createdAt)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-blue-700">
                            {post.category === 'lecturer' ? 'Giảng viên' : 'Môn học'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{post.department}</span>
                        </div>
                      </div>
                    </div>

                    {/* Đánh giá sao */}
                    <div
                      className="flex items-center gap-1 shrink-0"
                      aria-label={`Đánh giá ${post.rating} trên 5 sao`}
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-mono font-semibold text-slate-800 tabular-nums">
                        {post.rating}.0
                      </span>
                    </div>
                  </div>

                  {/* Tiêu đề đối tượng được review */}
                  <div className="mt-4">
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      {post.targetName}
                      {post.courseCode && (
                        <span className="ml-2 text-sm font-normal text-slate-500">
                          ({post.courseCode})
                        </span>
                      )}
                    </h2>
                    <p className="mt-2 text-sm sm:text-[15px] text-slate-700 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>
                </div>

                {/* Hình ảnh đính kèm bài review */}
                {post.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setLightboxSrc(post.imageUrl!)}
                    className="block w-full bg-slate-100 border-t border-b border-slate-100 overflow-hidden cursor-zoom-in"
                  >
                    <img
                      src={post.imageUrl}
                      alt={`Ảnh minh họa cho ${post.targetName}`}
                      referrerPolicy="no-referrer"
                      className="w-full max-h-[420px] object-cover hover:scale-[1.01] transition-transform duration-300"
                    />
                  </button>
                )}

                {/* Thanh thống kê & nút tương tác kiểu Facebook */}
                <div className="px-4 sm:px-5 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
                  <span>{post.likes.length} lượt thấy hữu ích</span>
                  <span>{post.comments.length} bình luận</span>
                </div>

                <div className="px-4 sm:px-5 py-1.5 border-t border-b border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        onRequireAuth(
                          'Vui lòng đăng nhập hoặc đăng ký để tương tác với bài review.',
                        );
                        return;
                      }
                      onToggleLike(post.id);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isLiked
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" aria-hidden="true" />
                    <span>Hữu ích</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!handleCommentInputInteraction()) return;
                      const input = document.getElementById(`cmt-input-${post.id}`);
                      input?.focus();
                    }}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                    <span>Bình luận</span>
                  </button>
                </div>

                {/* ============================================================
                    PHẦN BÌNH LUẬN KIỂU FACEBOOK (CHO UP ẢNH, CHƯA ĐĂNG NHẬP VỀ VIEW 3)
                   ============================================================ */}
                <div className="bg-slate-50/70 px-4 sm:px-5 py-4 space-y-3.5">
                  {post.comments.length > 0 && (
                    <ul className="space-y-3">
                      {post.comments.map((cmt) => (
                        <li key={cmt.id} className="flex items-start gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-700 text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                            {getInitials(cmt.authorName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="inline-block max-w-full bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2">
                              <div className="flex flex-wrap items-baseline gap-2">
                                <span className="text-xs font-semibold text-slate-900">
                                  {cmt.authorName}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                                  {cmt.authorStudentId}
                                </span>
                              </div>
                              {cmt.content && (
                                <p className="mt-1 text-sm text-slate-700 leading-snug whitespace-pre-line">
                                  {cmt.content}
                                </p>
                              )}
                            </div>

                            {cmt.imageUrl && (
                              <div className="mt-1.5">
                                <button
                                  type="button"
                                  onClick={() => setLightboxSrc(cmt.imageUrl!)}
                                  className="block rounded-lg overflow-hidden border border-slate-200 cursor-zoom-in"
                                >
                                  <img
                                    src={cmt.imageUrl}
                                    alt={`Ảnh bình luận của ${cmt.authorName}`}
                                    referrerPolicy="no-referrer"
                                    className="max-h-52 object-cover"
                                  />
                                </button>
                              </div>
                            )}

                            <p className="mt-1 ml-2 text-[11px] text-slate-400">
                              {formatRelativeTimeVi(cmt.createdAt)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Ô nhập bình luận mới + up ảnh */}
                  <form
                    onSubmit={(e) => handleSubmitComment(post.id, e)}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-700 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                        {currentUser ? getInitials(currentUser.fullName) : 'SV'}
                      </div>

                      <div className="flex-1 flex items-center gap-1.5 bg-white border border-slate-300 focus-within:border-blue-600 rounded-full px-3.5 py-1.5">
                        <input
                          id={`cmt-input-${post.id}`}
                          type="text"
                          value={draftText}
                          onFocus={() => {
                            if (!currentUser) {
                              handleCommentInputInteraction();
                            }
                          }}
                          onChange={(e) => {
                            if (!currentUser) {
                              handleCommentInputInteraction();
                              return;
                            }
                            setCommentDrafts((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }));
                          }}
                          placeholder={
                            currentUser
                              ? 'Viết bình luận hoặc thắc mắc về lớp học này...'
                              : 'Đăng nhập để viết bình luận & gửi ảnh...'
                          }
                          className="flex-1 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0"
                        />

                        <input
                          ref={(el) => {
                            commentFileInputRefs.current[post.id] = el;
                          }}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCommentImageUpload(post.id, e)}
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            if (!handleCommentInputInteraction()) return;
                            commentFileInputRefs.current[post.id]?.click();
                          }}
                          title="Đính kèm ảnh vào bình luận"
                          aria-label="Đính kèm ảnh vào bình luận"
                          className="p-1.5 rounded-full text-slate-500 hover:text-blue-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                        >
                          <ImagePlus className="w-4 h-4" />
                        </button>

                        <button
                          type="submit"
                          aria-label="Gửi bình luận"
                          className="p-1.5 rounded-full text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {draftImage && (
                      <div className="ml-10 relative inline-block">
                        <img
                          src={draftImage}
                          alt="Xem trước ảnh bình luận"
                          className="max-h-36 rounded-lg border border-slate-200 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setCommentImages((prev) => {
                              const next = { ...prev };
                              delete next[post.id];
                              return next;
                            })
                          }
                          aria-label="Xóa ảnh bình luận"
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/75 text-white hover:bg-slate-900 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {cmtErr && (
                      <p role="alert" className="ml-10 text-xs text-red-600">
                        {cmtErr}
                      </p>
                    )}
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Lightbox xem ảnh phóng to */}
      {lightboxSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh phóng to"
          onClick={() => setLightboxSrc(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            aria-label="Đóng ảnh"
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxSrc}
            alt="Ảnh chi tiết"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[88vh] rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
