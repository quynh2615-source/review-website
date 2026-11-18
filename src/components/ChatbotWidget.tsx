import React, { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, MessageSquare, Send, X } from 'lucide-react';
import { ChatMessage } from '../types';

// ============================================================================
// CẤU TRÚC GỌI GEMINI API CHO AI CHATBOT HƯỚNG DẪN SỬ DỤNG WEB
// Lưu ý bảo mật nền tảng: Hằng số GEMINI_API_KEY được nạp ở phía server (/server.ts)
// qua biến môi trường process.env.GEMINI_API_KEY để không lộ key ra trình duyệt.
// Client gọi endpoint trung gian /api/chat bằng fetch() theo chuẩn dưới đây.
// ============================================================================
const CHAT_API_ENDPOINT = '/api/chat';

const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  text: 'Xin chào! Mình là trợ lý hướng dẫn sử dụng UniVoice. Bạn cần mình chỉ cách lọc bài review theo giảng viên/môn học, đăng ký bằng MSSV hay tải ảnh khi bình luận không?',
};

const QUICK_QUESTIONS = [
  'Cách lọc review theo giảng viên?',
  'Làm sao để đăng bài kèm ảnh?',
  'Chưa đăng nhập có bình luận được không?',
];

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    INITIAL_ASSISTANT_MESSAGE,
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput('');
    setIsLoading(true);

    try {
      // Cấu trúc fetch gọi endpoint Gemini API phía server
      const response = await fetch(CHAT_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok || !data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            text:
              data.error ||
              'Trợ lý AI hiện không phản hồi được. Vui lòng thử lại sau.',
            isError: true,
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: data.reply!,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: 'Lỗi kết nối tới máy chủ. Vui lòng kiểm tra lại kết nối mạng.',
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Khung Chatbot Widget */}
      {isOpen && (
        <section
          aria-label="Trợ lý AI hướng dẫn sử dụng website"
          className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[370px] h-[470px] max-h-[75vh] bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header Widget */}
          <header className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold truncate">
                  Trợ lý hướng dẫn UniVoice
                </h2>
                <p className="text-[11px] text-slate-300 truncate">
                  Hỗ trợ thao tác &amp; tra cứu tính năng
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng hộp thoại trợ lý"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </header>

          {/* Danh sách tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-blue-700 text-white'
                      : msg.isError
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-white text-slate-800 border border-slate-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-700" />
                  <span>Đang soạn hướng dẫn...</span>
                </div>
              </div>
            )}
            <div ref={listEndRef} />
          </div>

          {/* Gợi ý câu hỏi nhanh */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-1.5 shrink-0">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="text-left text-xs px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Ô nhập câu hỏi */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi cách dùng website..."
              disabled={isLoading}
              className="flex-1 h-9 px-3 text-sm bg-slate-100 focus:bg-white border border-transparent focus:border-blue-600 rounded-lg text-slate-900 focus:outline-none min-w-0"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Gửi câu hỏi"
              className="h-9 w-9 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      )}

      {/* Bottom-Right Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Đóng trợ lý AI' : 'Mở trợ lý AI hướng dẫn'}
        className="h-14 w-14 rounded-full bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-950/25 flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer"
      >
        {isOpen ? (
          <X className="w-6 h-6" aria-hidden="true" />
        ) : (
          <MessageSquare className="w-6 h-6" aria-hidden="true" />
        )}
      </button>
    </div>
  );
};
