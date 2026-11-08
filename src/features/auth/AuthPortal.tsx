import React, { useMemo, useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  LogIn,
  School,
  Users,
  UserCheck,
  BookOpen,
} from 'lucide-react';
import { apiRequest, setStoredToken } from '../../services/apiClient';
import { SchoolConfig, UserAccount } from '../../types/domainTypes';
import { APP_LOGO_BASE64 } from '../../assets/logoBase64';

interface StudentRosterItem {
  id: string;
  fullName: string;
  username: string;
  className: string;
}

interface AuthPortalProps {
  hasTeacherAccount: boolean;
  schoolConfig: SchoolConfig;
  studentRoster?: StudentRosterItem[];
  onAuthSuccess: (user: UserAccount, updatedSchoolConfig?: SchoolConfig) => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  schoolConfig,
  studentRoster = [],
  onAuthSuccess,
  onNotify,
}) => {
  const [roleTab, setRoleTab] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);

  // Available Grade 9 classes (containing a digit)
  const availableClasses = useMemo(() => {
    const cfgClasses = (schoolConfig.classes || [])
      .map((c) => String(c || '').replace(/^(?:lớp|lop)\s*/i, '').trim().toUpperCase())
      .filter((c) => c && /\d/.test(c));
    const rosterClasses = studentRoster
      .map((s) => String(s.className || '').replace(/^(?:lớp|lop)\s*/i, '').trim().toUpperCase())
      .filter((c) => c && /\d/.test(c));
    const merged = Array.from(new Set([...cfgClasses, ...rosterClasses])).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
    return merged.length > 0 ? merged : ['9A1', '9A2', '9A3', '9A4', '9A5'];
  }, [schoolConfig.classes, studentRoster]);

  // Student Login State (Học sinh chỉ cần chọn Lớp & Họ và tên, KHÔNG CẦN MẬT KHẨU)
  const [selectedClass, setSelectedClass] = useState<string>(availableClasses[0] || '9A1');
  const [studentInput, setStudentInput] = useState<string>('');

  // Filter roster by selectedClass
  const studentsInSelectedClass = useMemo(() => {
    return studentRoster
      .filter(
        (s) =>
          String(s.className || '')
            .replace(/^(?:lớp|lop)\s*/i, '')
            .trim()
            .toUpperCase() === selectedClass
      )
      .sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'));
  }, [studentRoster, selectedClass]);

  // Teacher Login State
  const [teacherUsername, setTeacherUsername] = useState<string>('Lê Văn Thắng');
  const [teacherPassword, setTeacherPassword] = useState<string>('');

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = studentInput.trim();
    const finalClass = selectedClass.trim().toUpperCase();

    if (!finalClass) {
      onNotify('error', 'Em vui lòng chọn hoặc nhập Lớp học của mình.');
      return;
    }
    if (!finalName) {
      onNotify('error', 'Em vui lòng chọn (hoặc nhập) đầy đủ Họ và tên học sinh.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest<{ token: string; user: UserAccount }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: finalName,
          className: finalClass,
          role: 'student',
        }),
      });
      setStoredToken(res.token);
      onNotify(
        'success',
        `Chào mừng học sinh ${res.user.fullName} (Lớp ${res.user.className || finalClass})!`
      );
      onAuthSuccess(res.user);
    } catch (err: any) {
      onNotify('error', err.message || 'Đăng nhập học sinh thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherUsername.trim() || !teacherPassword.trim()) {
      onNotify('error', 'Thầy/cô vui lòng nhập Tên đăng nhập và Mật khẩu.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest<{ token: string; user: UserAccount }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: teacherUsername.trim(),
          password: teacherPassword.trim(),
        }),
      });
      setStoredToken(res.token);
      onNotify('success', `Xin chào thầy/cô ${res.user.fullName}!`);
      onAuthSuccess(res.user);
    } catch (err: any) {
      onNotify('error', err.message || 'Đăng nhập giáo viên thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-[#0D6E6E] to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Banner */}
        <div className="lg:col-span-5 bg-[#0D6E6E] text-white p-8 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md p-1.5 border border-white/20 shadow-md flex items-center justify-center flex-shrink-0">
                <img src={APP_LOGO_BASE64} alt="Logo KHTN" className="w-full h-full object-contain" />
              </div>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-semibold">
                <GraduationCap className="w-4 h-4 text-amber-300" />
                <span>Khoa Học Tự Nhiên 6, 7, 8, 9</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-snug">
              Hệ Thống Học Tập, Luyện Tập & Kiểm Tra Đánh Giá KHTN
            </h1>
            <p className="text-teal-100 text-sm leading-relaxed">
              Bám sát Chương trình GDPT 2018 — Bộ sách Kết nối tri thức với cuộc sống. Đầy đủ 14
              chương, 51 bài học, ngân hàng đề, ma trận đặc tả và phòng thi trực tuyến.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 space-y-2.5 text-xs text-teal-100">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>Trường: {schoolConfig.schoolName}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>Giáo viên bộ môn: {schoolConfig.teacherName || 'Lê Văn Thắng'}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>
                Phân quyền rõ ràng: Học sinh học tập & làm bài; Giáo viên quản trị & ra đề.
              </span>
            </div>
          </div>
        </div>

        {/* Right Form with 2 Clear Role Tabs: Student Login & Teacher Login */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6">
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setRoleTab('student')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                roleTab === 'student'
                  ? 'bg-[#0D6E6E] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white/70'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>🎓 Học sinh Đăng nhập</span>
            </button>

            <button
              type="button"
              onClick={() => setRoleTab('teacher')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                roleTab === 'teacher'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white/70'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>👨‍🏫 Giáo viên Quản trị</span>
            </button>
          </div>

          {roleTab === 'student' ? (
            /* ============================================================
               TAB 1: HỌC SINH ĐĂNG NHẬP (CHỈ CẦN LỚP & HỌ VÀ TÊN - KHÔNG CẦN MẬT KHẨU)
               ============================================================ */
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-[#0D6E6E]" />
                  <span>Cổng Đăng nhập Học sinh</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Em chỉ cần chọn <strong>Lớp</strong> và <strong>Họ và tên</strong> của mình để vào học và làm bài kiểm tra (<span className="text-emerald-700 font-bold">không cần mật khẩu</span>).
                </p>
              </div>

              {/* 1. Chọn Lớp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>1. Chọn Lớp học của em:</span>
                  <span className="text-teal-700 font-semibold text-[11px]">Đang chọn: Lớp {selectedClass}</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableClasses.map((cls) => {
                    const countInClass = studentRoster.filter(
                      (s) =>
                        String(s.className || '')
                          .replace(/^(?:lớp|lop)\s*/i, '')
                          .trim()
                          .toUpperCase() === cls
                    ).length;
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => {
                          setSelectedClass(cls);
                          setStudentInput('');
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                          selectedClass === cls
                            ? 'bg-[#0D6E6E] text-white border-[#0D6E6E] shadow-sm ring-2 ring-teal-500/30'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-teal-50'
                        }`}
                      >
                        Lớp {cls}{' '}
                        {countInClass > 0 && (
                          <span className="text-[11px] opacity-85">({countInClass} HS)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Chọn nhanh Họ và tên trong danh sách lớp (nếu lớp có danh sách) */}
              {studentsInSelectedClass.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    2. Chọn nhanh Họ và tên của em trong danh sách Lớp {selectedClass}:
                  </label>
                  <select
                    value={studentInput}
                    onChange={(e) => setStudentInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 bg-teal-50/50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="">
                      -- Bấm vào đây để chọn tên em ({studentsInSelectedClass.length} học sinh Lớp {selectedClass}) --
                    </option>
                    {studentsInSelectedClass.map((st, idx) => (
                      <option key={st.id} value={st.fullName}>
                        {idx + 1}. {st.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Hoặc tự nhập Họ và tên */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {studentsInSelectedClass.length > 0
                    ? 'Hoặc tự gõ Họ và tên học sinh (nếu không có trong danh sách trên):'
                    : '2. Nhập đầy đủ Họ và tên học sinh:'}
                </label>
                <input
                  type="text"
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An, Trần Thị Mai, Võ Ngọc Bảo Trân..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>

              {/* Thông báo xanh: Không cần mật khẩu */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs sm:text-sm text-emerald-900 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="font-bold">Đăng nhập nhanh không cần mật khẩu:</span> Em chỉ cần chọn đúng <strong>Lớp</strong> và <strong>Họ tên</strong> là có thể vào phòng thi và học bài ngay.
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white font-bold text-base shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                <LogIn className="w-5 h-5" />
                <span>
                  {loading
                    ? 'Đang vào lớp học...'
                    : `Học sinh Vào học & Làm bài (Lớp ${selectedClass})`}
                </span>
              </button>
            </form>
          ) : (
            /* ============================================================
               TAB 2: GIÁO VIÊN QUẢN TRỊ ĐĂNG NHẬP (THẦY LÊ VĂN THẮNG)
               ============================================================ */
            <form onSubmit={handleTeacherLogin} className="space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Đăng nhập Giáo viên Quản trị
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Dành cho Giáo viên bộ môn KHTN 9 quản lý lớp học, ngân hàng câu hỏi, ma trận đề và
                  kết quả thi.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Tên đăng nhập Giáo viên
                </label>
                <input
                  type="text"
                  value={teacherUsername}
                  onChange={(e) => setTeacherUsername(e.target.value)}
                  placeholder="Lê Văn Thắng"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Mật khẩu quản trị
                </label>
                <input
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị của giáo viên..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base shadow-md transition-all disabled:opacity-50"
              >
                <LogIn className="w-5 h-5" />
                <span>
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập Quản trị Giáo viên'}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
