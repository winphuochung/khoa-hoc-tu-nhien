import React from 'react';
import {
  BookOpen,
  ClipboardCheck,
  Database,
  FileSpreadsheet,
  GraduationCap,
  LogOut,
  Users,
  BarChart3,
  Award,
} from 'lucide-react';
import { SchoolConfig, UserAccount } from '../../types/domainTypes';
import { APP_LOGO_BASE64 } from '../../assets/logoBase64';

export type ActiveTab =
  | 'curriculum'
  | 'my-progress'
  | 'exam-room'
  | 'question-bank'
  | 'exam-studio'
  | 'grading-reports'
  | 'students-admin';

interface AppHeaderProps {
  user: UserAccount;
  schoolConfig: SchoolConfig;
  activeTab: ActiveTab;
  selectedGrade?: number;
  onSelectGrade?: (grade: number) => void;
  onSelectTab: (tab: ActiveTab) => void;
  onLogout: () => void;
}

const GRADE_INFO: Record<number, { label: string; lessonsCount: number; chaptersCount: number }> = {
  6: { label: 'Khối 6', lessonsCount: 55, chaptersCount: 10 },
  7: { label: 'Khối 7', lessonsCount: 42, chaptersCount: 10 },
  8: { label: 'Khối 8', lessonsCount: 47, chaptersCount: 8 },
  9: { label: 'Khối 9', lessonsCount: 51, chaptersCount: 14 },
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  schoolConfig,
  activeTab,
  selectedGrade = 9,
  onSelectGrade,
  onSelectTab,
  onLogout,
}) => {
  const isTeacher = user.role === 'teacher';
  const curGradeMeta = GRADE_INFO[selectedGrade] || GRADE_INFO[9];

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = isTeacher
    ? [
        {
          id: 'curriculum',
          label: `${curGradeMeta.lessonsCount} Bài học & Lý thuyết`,
          icon: <BookOpen className="w-4 h-4" />,
        },
        {
          id: 'question-bank',
          label: 'Ngân hàng câu hỏi',
          icon: <Database className="w-4 h-4" />,
        },
        {
          id: 'exam-studio',
          label: 'Soạn đề & Ma trận',
          icon: <FileSpreadsheet className="w-4 h-4" />,
        },
        {
          id: 'grading-reports',
          label: 'Chấm bài & Báo cáo lớp',
          icon: <BarChart3 className="w-4 h-4" />,
        },
        {
          id: 'students-admin',
          label: 'Tài khoản HS & Trường',
          icon: <Users className="w-4 h-4" />,
        },
      ]
    : [
        {
          id: 'curriculum',
          label: `Học bài & Luyện tập (${curGradeMeta.lessonsCount} bài)`,
          icon: <BookOpen className="w-4 h-4" />,
        },
        {
          id: 'my-progress',
          label: 'Tiến độ & Bài cần ôn',
          icon: <Award className="w-4 h-4" />,
        },
        {
          id: 'exam-room',
          label: 'Phòng kiểm tra & Kết quả',
          icon: <ClipboardCheck className="w-4 h-4" />,
        },
      ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between py-3 gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Enlarged official logo without breaking layout */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-center p-1.5 flex-shrink-0 group overflow-hidden">
              <img
                src={APP_LOGO_BASE64}
                alt="Logo KHTN"
                className="w-full h-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-lg sm:text-xl text-[#0D6E6E] tracking-tight leading-tight">
                  Khoa học tự nhiên
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 whitespace-nowrap">
                  GDPT 2018 ({curGradeMeta.chaptersCount} Chương • {curGradeMeta.lessonsCount} Bài)
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium truncate sm:overflow-visible mt-0.5">
                {schoolConfig.schoolName}
                {schoolConfig.teacherName ? ` • GV: ${schoolConfig.teacherName}` : ''}
              </p>
            </div>
          </div>

          {/* Grade Selector Switches & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Grade Switcher */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 shadow-inner">
              {[6, 7, 8, 9].map((g) => {
                const isActive = selectedGrade === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onSelectGrade && onSelectGrade(g)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#0D6E6E] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    Khối {g}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <div className="text-right">
                <div className="text-sm font-bold text-slate-800 leading-tight">
                  {user.fullName}
                </div>
                <div className="text-xs font-semibold text-teal-700">
                  {isTeacher
                    ? 'Giáo viên quản trị'
                    : `Học sinh • Lớp ${user.className || '9A'}`}
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 border border-slate-200 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Navigation Pills */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-2.5 pt-1">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#0D6E6E] text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-teal-50 hover:text-[#0D6E6E]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
