import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_POSTS, INITIAL_USERS } from './src/data/mockData';
import type { ReviewCategory, ReviewPost, StudentUser } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CẤU HÌNH GEMINI API PHÍA SERVER
// API_KEY được lấy an toàn từ biến môi trường process.env.GEMINI_API_KEY
// ============================================================================
const API_KEY = process.env.GEMINI_API_KEY || '';

const SYSTEM_INSTRUCTION = `Bạn là Trợ lý AI hướng dẫn sử dụng trang web "UniVoice — Ý Kiến Sinh Viên Về Môn Học & Giảng Viên".
Nhiệm vụ của bạn là trả lời ngắn gọn, thân thiện, rõ ràng bằng tiếng Việt để hướng dẫn sinh viên cách dùng các tính năng của website:
1. Trang chủ (Tab 1): Xem khung trình chiếu và thông tin tổng quan về mục đích hoạt động của trang web.
2. Biên bản & Nội quy (Tab 2): Đọc các quy định văn minh học đường, tôn trọng giảng viên, trung thực khi viết review và quy chuẩn hình ảnh đính kèm.
3. Đăng ký & Đăng nhập (Tab 3): Sinh viên tạo tài khoản bằng Họ và tên, Email, Mã số sinh viên (MSSV) và Mật khẩu; hoặc đăng nhập bằng MSSV và Mật khẩu. Tài khoản mẫu để dùng thử nhanh là MSSV: 22110001, Mật khẩu: 123456.
4. Bài review (Tab 4): Dùng nút lọc ở góc trên bên trái để lọc theo "Giảng viên" hoặc "Môn học". Sinh viên có thể đăng bài review giống Facebook kèm hình ảnh minh họa (tài liệu, đề cương, lớp học) và bình luận kèm ảnh. Lưu ý: Phải đăng nhập hoặc đăng ký ở Tab 3 mới có thể đăng bài và bình luận.
5. Thanh tìm kiếm ở header: Nhập tên giảng viên, tên môn học hoặc từ khóa bất kỳ để tìm nhanh nội dung trên web.
6. About us (Tab 5): Xem thông tin nhóm sinh viên thực hiện đồ án và email liên hệ.

Không bịa đặt thông tin không có trên web. Nếu được hỏi ngoài phạm vi sử dụng web, hãy khéo léo hướng dẫn lại các thao tác chính trên UniVoice.`;

// ============================================================================
// LƯU TRỮ DỮ LIỆU DÙNG CHUNG TRÊN SERVER (để tất cả người dùng cùng thấy bài đăng)
// ============================================================================
interface DatabaseSchema {
  users: StudentUser[];
  posts: ReviewPost[];
}

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
      if (Array.isArray(parsed.users) && Array.isArray(parsed.posts)) {
        return {
          users: parsed.users,
          posts: parsed.posts,
        };
      }
    }
  } catch (err) {
    console.error('Failed to read database file, using initial seed:', err);
  }

  const seeded: DatabaseSchema = {
    users: [...INITIAL_USERS],
    posts: [...INITIAL_POSTS],
  };
  saveDatabase(seeded);
  return seeded;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to persist database file:', err);
  }
}

function sanitizeUser(user: StudentUser): Omit<StudentUser, 'password'> {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    studentId: user.studentId,
    createdAt: user.createdAt,
  };
}

const db: DatabaseSchema = loadDatabase();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Hỗ trợ payload ảnh đã nén từ client khi đăng bài / bình luận
  app.use(express.json({ limit: '15mb' }));

  // Lấy toàn bộ bài review dùng chung và số lượng tài khoản
  app.get('/api/posts', (_req, res) => {
    res.json({
      posts: db.posts,
      usersCount: db.users.length,
    });
  });

  // Đăng ký tài khoản sinh viên mới
  app.post('/api/auth/register', (req, res) => {
    const { fullName, email, studentId, password } = req.body as {
      fullName?: string;
      email?: string;
      studentId?: string;
      password?: string;
    };

    const cleanName = (fullName || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanStudentId = (studentId || '').trim();
    const cleanPassword = password || '';

    if (!cleanName || !cleanEmail || !cleanStudentId || cleanPassword.length < 6) {
      res.status(400).json({
        error: 'Vui lòng điền đầy đủ thông tin và mật khẩu tối thiểu 6 ký tự.',
      });
      return;
    }

    const exists = db.users.some(
      (u) =>
        u.studentId.toLowerCase() === cleanStudentId.toLowerCase() ||
        u.email.toLowerCase() === cleanEmail,
    );

    if (exists) {
      res.status(409).json({
        error: 'Mã số sinh viên hoặc Email này đã được đăng ký trước đó.',
      });
      return;
    }

    const newUser: StudentUser = {
      id: `user-${Date.now()}`,
      fullName: cleanName,
      email: cleanEmail,
      studentId: cleanStudentId,
      password: cleanPassword,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDatabase(db);

    res.status(201).json({
      user: sanitizeUser(newUser),
      usersCount: db.users.length,
      message: `Đăng ký thành công! Xin chào ${newUser.fullName}.`,
    });
  });

  // Đăng nhập bằng MSSV và mật khẩu
  app.post('/api/auth/login', (req, res) => {
    const { studentId, password } = req.body as {
      studentId?: string;
      password?: string;
    };

    const cleanStudentId = (studentId || '').trim();
    const cleanPassword = password || '';

    const matched = db.users.find(
      (u) =>
        u.studentId.toLowerCase() === cleanStudentId.toLowerCase() &&
        u.password === cleanPassword,
    );

    if (!matched) {
      res.status(401).json({
        error: 'Mã số sinh viên hoặc mật khẩu không chính xác.',
      });
      return;
    }

    res.json({
      user: sanitizeUser(matched),
      message: `Đăng nhập thành công! Chào mừng ${matched.fullName}.`,
    });
  });

  // Đăng bài review mới (lưu chung trên server để mọi người đều thấy)
  app.post('/api/posts', (req, res) => {
    const {
      category,
      targetName,
      courseCode,
      department,
      rating,
      content,
      imageUrl,
      authorStudentId,
      authorName,
    } = req.body as {
      category?: ReviewCategory;
      targetName?: string;
      courseCode?: string;
      department?: string;
      rating?: number;
      content?: string;
      imageUrl?: string;
      authorStudentId?: string;
      authorName?: string;
    };

    if (!authorStudentId || !authorName) {
      res.status(401).json({ error: 'Vui lòng đăng nhập trước khi đăng bài.' });
      return;
    }

    const cleanTarget = (targetName || '').trim();
    const cleanContent = (content || '').trim();
    if (!cleanTarget || !cleanContent) {
      res.status(400).json({
        error: 'Vui lòng nhập tên Giảng viên/Môn học và nội dung nhận xét.',
      });
      return;
    }

    const newPost: ReviewPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: category === 'lecturer' ? 'lecturer' : 'course',
      targetName: cleanTarget,
      courseCode: (courseCode || '').trim() || undefined,
      department: (department || '').trim() || 'Khoa / Bộ môn chung',
      rating:
        typeof rating === 'number' && rating >= 1 && rating <= 5 ? rating : 5,
      authorName: authorName.trim(),
      authorStudentId: authorStudentId.trim(),
      content: cleanContent,
      imageUrl: imageUrl || undefined,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };

    db.posts = [newPost, ...db.posts];
    saveDatabase(db);

    res.status(201).json({
      post: newPost,
      posts: db.posts,
    });
  });

  // Thích / Hữu ích bài review
  app.post('/api/posts/:id/like', (req, res) => {
    const postId = req.params.id;
    const { studentId } = req.body as { studentId?: string };

    if (!studentId) {
      res.status(401).json({ error: 'Vui lòng đăng nhập để tương tác.' });
      return;
    }

    const targetPost = db.posts.find((p) => p.id === postId);
    if (!targetPost) {
      res.status(404).json({ error: 'Không tìm thấy bài review.' });
      return;
    }

    const alreadyLiked = targetPost.likes.includes(studentId);
    targetPost.likes = alreadyLiked
      ? targetPost.likes.filter((id) => id !== studentId)
      : [...targetPost.likes, studentId];

    saveDatabase(db);
    res.json({ post: targetPost, posts: db.posts });
  });

  // Thêm bình luận (hỗ trợ kèm ảnh)
  app.post('/api/posts/:id/comments', (req, res) => {
    const postId = req.params.id;
    const { authorName, authorStudentId, content, imageUrl } = req.body as {
      authorName?: string;
      authorStudentId?: string;
      content?: string;
      imageUrl?: string;
    };

    if (!authorName || !authorStudentId) {
      res.status(401).json({ error: 'Vui lòng đăng nhập để bình luận.' });
      return;
    }

    const cleanContent = (content || '').trim();
    if (!cleanContent && !imageUrl) {
      res.status(400).json({
        error: 'Hãy nhập nội dung bình luận hoặc chọn ảnh đính kèm.',
      });
      return;
    }

    const targetPost = db.posts.find((p) => p.id === postId);
    if (!targetPost) {
      res.status(404).json({ error: 'Không tìm thấy bài review.' });
      return;
    }

    targetPost.comments.push({
      id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      authorName: authorName.trim(),
      authorStudentId: authorStudentId.trim(),
      content: cleanContent,
      imageUrl: imageUrl || undefined,
      createdAt: new Date().toISOString(),
    });

    saveDatabase(db);
    res.status(201).json({ post: targetPost, posts: db.posts });
  });

  // Endpoint AI Chatbot hướng dẫn sử dụng website
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history } = req.body as {
        message?: string;
        history?: Array<{ role: 'user' | 'assistant'; text: string }>;
      };

      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ error: 'Vui lòng nhập nội dung câu hỏi.' });
        return;
      }

      if (!API_KEY) {
        res.status(503).json({
          error:
            'Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng kiểm tra mục Settings > Secrets hoặc file .env.',
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const conversationContext =
        Array.isArray(history) && history.length > 0
          ? history
              .slice(-6)
              .map((item) =>
                `${item.role === 'user' ? 'Sinh viên' : 'Trợ lý'}: ${item.text}`,
              )
              .join('\n') + `\nSinh viên: ${message.trim()}`
          : message.trim();

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: conversationContext,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({
          error: 'Không nhận được phản hồi từ trợ lý AI. Vui lòng thử lại.',
        });
        return;
      }

      res.json({ reply });
    } catch (error) {
      console.error('Gemini API error:', error);
      const errMessage =
        error instanceof Error ? error.message : 'Lỗi kết nối Gemini API.';
      res.status(500).json({
        error: `Không thể kết nối trợ lý AI lúc này (${errMessage}).`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UniVoice server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
