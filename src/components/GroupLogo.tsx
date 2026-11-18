import React from 'react';

// ============================================================================
// [PLACEHOLDER LOGO NHÓM]:
// Sinh viên muốn thay bằng file ảnh logo thật của nhóm hãy:
// 1. Copy file ảnh logo (VD: group-logo.png) vào thư mục /src/assets/images/
// 2. Bỏ comment dòng import bên dưới và truyền vào biến GROUP_LOGO_SRC
// ============================================================================
// import customGroupLogo from '../assets/images/group-logo.png';
const GROUP_LOGO_SRC: string | null = null;

interface GroupLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md';
}

export const GroupLogo: React.FC<GroupLogoProps> = ({
  variant = 'dark',
  size = 'md',
}) => {
  const dimensionClass = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const textColor = variant === 'light' ? 'text-white' : 'text-slate-900';

  return (
    <div className="flex items-center gap-2.5 shrink-0 select-none">
      {GROUP_LOGO_SRC ? (
        <img
          src={GROUP_LOGO_SRC}
          alt="Logo Nhóm Sinh Viên UniVoice"
          referrerPolicy="no-referrer"
          className={`${dimensionClass} rounded-lg object-cover border border-slate-200/30`}
        />
      ) : (
        /* Logo nhận diện nhóm mặc định (SVG sắc nét, thay thế khi import ảnh logo nhóm) */
        <div
          className={`${dimensionClass} rounded-lg flex items-center justify-center shrink-0 ${
            variant === 'light'
              ? 'bg-white/15 border border-white/25 text-white backdrop-blur-sm'
              : 'bg-blue-700 text-white'
          }`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 32 32"
            fill="none"
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 10.5L16 5.5L26 10.5L16 15.5L6 10.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M10 13.5V20.5C10 22.7 12.7 24.5 16 24.5C19.3 24.5 22 22.7 22 20.5V13.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M26 11.5V19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      <span
        className={`font-display font-bold tracking-tight whitespace-nowrap ${
          size === 'sm' ? 'text-lg' : 'text-xl'
        } ${textColor}`}
      >
        UniVoice
      </span>
    </div>
  );
};
