export type TabId = 'home' | 'rules' | 'auth' | 'reviews' | 'about';

export type ReviewCategory = 'lecturer' | 'course';

export interface StudentUser {
  id: string;
  fullName: string;
  email: string;
  studentId: string; // Mã số sinh viên (MSSV)
  password?: string;
  createdAt: string;
}

export interface ReviewComment {
  id: string;
  authorName: string;
  authorStudentId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export interface ReviewPost {
  id: string;
  category: ReviewCategory;
  targetName: string; // Tên giảng viên hoặc tên môn học
  courseCode?: string;
  department: string;
  rating: number;
  authorName: string;
  authorStudentId: string;
  content: string;
  imageUrl?: string;
  likes: string[]; // Danh sách MSSV đã nhấn Hữu ích
  comments: ReviewComment[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isError?: boolean;
}
