import React, { useEffect, useMemo, useState } from 'react';
import {
  UserPlus,
  Users,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  School,
  Save,
  Upload,
  Plus,
  X,
  Download,
  Search,
  Sparkles,
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';
import { SchoolConfig, UserAccount } from '../../types/domainTypes';

interface StudentWithStats extends UserAccount {
  initialPassword?: string;
  stats?: {
    lessonsStudied: number;
    totalQuestionsDone: number;
    accuracyPercent: number;
    examSubmissionsCount: number;
  };
}

interface StudentAccountsManagerProps {
  schoolConfig: SchoolConfig;
  onSchoolConfigUpdated: (cfg: SchoolConfig) => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

function toVietnameseSlug(str: string): string {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function cleanClassNameInput(raw: string): string {
  if (!raw) return '';
  return String(raw)
    .trim()
    .replace(/^(?:lớp|lop)\s*/i, '')
    .replace(/\s+/g, '') // Remove redundant spaces like "9 A 1" -> "9A1", "9 / 1" -> "9/1"
    .toUpperCase();
}

interface ParsedStudentRow {
  fullName: string;
  className: string;
  username: string;
  password: string;
}

function parseSmartStudentInput(
  rawText: string,
  defaultClass: string,
  defaultPassword: string
): ParsedStudentRow[] {
  if (!rawText || !rawText.trim()) return [];
  const fallbackClass = cleanClassNameInput(defaultClass) || '9A1';
  const fallbackPass = String(defaultPassword || '123456').trim() || '123456';

  // Split by newline first; if a line has no '|', '-', '\t' and contains multiple comma/semicolon-separated full names, split by comma/semicolon
  const rawLines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const expandedLines: string[] = [];
  for (const line of rawLines) {
    if (!/[|\t\-–—]/.test(line) && /[,;]/.test(line)) {
      const subParts = line
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean);
      expandedLines.push(...subParts);
    } else {
      expandedLines.push(line);
    }
  }

  const results: ParsedStudentRow[] = [];

  for (const rawLine of expandedLines) {
    // Strip leading numbering like "1.", "1)", "STT 1:" or leading tab-separated STT number "1\t"
    const line = rawLine
      .replace(/^\s*(?:stt\s*)?\d+[\.\)\-:\t]\s*/i, '')
      .trim();
    if (!line) continue;

    let fullName = '';
    let className = fallbackClass;
    let username = '';
    let password = fallbackPass;

    if (line.includes('|')) {
      const parts = line.split('|').map((p) => p.replace(/\t+/g, ' ').trim());
      fullName = parts[0] || '';
      if (parts[1] && /\d/.test(parts[1])) className = cleanClassNameInput(parts[1]) || fallbackClass;
      if (parts[2]) username = parts[2];
      if (parts[3]) password = parts[3];
    } else if (/[-–—]/.test(line)) {
      const parts = line.split(/\s*[-–—]\s*/).map((p) => p.replace(/\t+/g, ' ').trim());
      fullName = parts[0] || '';
      if (parts[1] && /\d/.test(parts[1])) className = cleanClassNameInput(parts[1]) || fallbackClass;
      if (parts[2]) username = parts[2];
      if (parts[3]) password = parts[3];
    } else if (line.includes('\t')) {
      // Excel copy: often "Họ và tên đệm \t Tên" or "Họ đệm \t Tên \t Lớp 9A1"
      const tabParts = line
        .split('\t')
        .map((p) => p.trim())
        .filter(Boolean);
      const nameTokens: string[] = [];
      for (const tp of tabParts) {
        if (/^(?:lớp|lop)?\s*9[a-zA-Z0-9/_-]*$/i.test(tp) || /^\d+[a-zA-Z]+[0-9]*$/i.test(tp)) {
          className = cleanClassNameInput(tp) || fallbackClass;
        } else {
          nameTokens.push(tp);
        }
      }
      fullName = nameTokens.join(' ');
    } else {
      fullName = line;
    }

    fullName = fullName
      .replace(/\t+/g, ' ')
      .replace(/^(?:họ và tên|họ tên|hs)\s*[:\-]?\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!fullName) continue;

    const slug = toVietnameseSlug(fullName);
    const classSlug = toVietnameseSlug(className);
    const autoUser = username || `${slug || 'hs'}_${classSlug || '9a1'}`;

    results.push({
      fullName,
      className,
      username: autoUser,
      password,
    });
  }

  return results;
}

export const StudentAccountsManager: React.FC<StudentAccountsManagerProps> = ({
  schoolConfig,
  onSchoolConfigUpdated,
  onNotify,
}) => {
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [loading, setLoading] = useState(false);

  // Clean class list from schoolConfig + any valid Grade 9 classes existing on students (must contain a digit)
  const allAvailableClasses = useMemo(() => {
    const cfgList = (schoolConfig.classes || [])
      .map((c) => cleanClassNameInput(c))
      .filter((c) => c && /\d/.test(c));
    const studentList = students
      .map((s) => cleanClassNameInput(s.className || ''))
      .filter((c) => c && /\d/.test(c));
    const merged = Array.from(new Set([...cfgList, ...studentList])).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
    return merged.length > 0 ? merged : ['9A1', '9A2'];
  }, [schoolConfig.classes, students]);

  // Single student form (Super easy: only FullName & Class needed, username & unique password auto-generated)
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState(allAvailableClasses[0] || '9A1');
  const [customUsername, setCustomUsername] = useState('');
  const [password, setPassword] = useState('');

  const autoGeneratedSingleUsername = useMemo(() => {
    if (customUsername.trim()) return customUsername.trim().toLowerCase();
    const slug = toVietnameseSlug(fullName);
    const clsSlug = toVietnameseSlug(className || '9A1');
    return slug ? `${slug}_${clsSlug}` : '';
  }, [fullName, className, customUsername]);

  // Bulk student creation (Each student automatically gets a distinct password)
  const [bulkLines, setBulkLines] = useState('');
  const [bulkDefaultClass, setBulkDefaultClass] = useState(allAvailableClasses[0] || '9A1');

  const parsedBulkPreview = useMemo(
    () => parseSmartStudentInput(bulkLines, bulkDefaultClass, ''),
    [bulkLines, bulkDefaultClass]
  );

  // School Config form & Class Tag Manager
  const [cfgSchoolName, setCfgSchoolName] = useState(schoolConfig.schoolName || 'Trường TH – THCS Phước Hưng');
  const [cfgTeacherName, setCfgTeacherName] = useState(schoolConfig.teacherName || 'Lê Văn Thắng');
  const [cfgSchoolYear, setCfgSchoolYear] = useState(schoolConfig.schoolYear || '2026 – 2027');
  const [classListTags, setClassListTags] = useState<string[]>(allAvailableClasses);
  const [newClassInput, setNewClassInput] = useState('');
  const [isSavingClasses, setIsSavingClasses] = useState(false);
  const [cfgMaxViolations, setCfgMaxViolations] = useState(
    schoolConfig.antiCheatMaxViolations || 3
  );

  useEffect(() => {
    setClassListTags(allAvailableClasses);
  }, [allAvailableClasses]);

  useEffect(() => {
    if (schoolConfig.schoolName) setCfgSchoolName(schoolConfig.schoolName);
    if (schoolConfig.teacherName) setCfgTeacherName(schoolConfig.teacherName);
    if (schoolConfig.schoolYear) setCfgSchoolYear(schoolConfig.schoolYear);
    if (schoolConfig.antiCheatMaxViolations) setCfgMaxViolations(schoolConfig.antiCheatMaxViolations);
  }, [schoolConfig]);

  // Filter & Search in Student Table
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Password reset inline state
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newPassValue, setNewPassValue] = useState('');

  const loadStudents = async () => {
    setLoading(true);
    try {
      const list = await apiRequest<StudentWithStats[]>('/api/students');
      setStudents(list);
    } catch (err: any) {
      onNotify('error', err.message || 'Lỗi tải danh sách tài khoản học sinh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const persistClassTags = async (nextClasses: string[], silent = false) => {
    const cleaned = Array.from(
      new Set(nextClasses.map((c) => cleanClassNameInput(c)).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    if (cleaned.length === 0) return;
    setClassListTags(cleaned);
    setIsSavingClasses(true);
    try {
      const updated = await apiRequest<SchoolConfig>('/api/school-config', {
        method: 'PUT',
        body: JSON.stringify({
          schoolName: cfgSchoolName.trim() || schoolConfig.schoolName || 'Trường TH – THCS Phước Hưng',
          teacherName: cfgTeacherName.trim() || schoolConfig.teacherName || 'Lê Văn Thắng',
          schoolYear: cfgSchoolYear.trim() || schoolConfig.schoolYear || '2026 – 2027',
          classes: cleaned,
          antiCheatMaxViolations: Number(cfgMaxViolations || 3),
        }),
      });
      onSchoolConfigUpdated(updated);
      if (!silent) {
        onNotify('success', `Đã lưu thành công danh sách ${cleaned.length} lớp học: ${cleaned.join(', ')}!`);
      }
    } catch (err: any) {
      if (!silent) onNotify('error', err.message || 'Không thể lưu danh sách lớp.');
    } finally {
      setIsSavingClasses(false);
    }
  };

  const handleAddClassTag = async () => {
    const raw = newClassInput.trim();
    if (!raw) {
      onNotify('info', 'Vui lòng nhập tên lớp cần thêm (VD: 9A6, 9A7, 9/1)...');
      return;
    }
    const parts = raw
      .split(/[,;\n\r]+/)
      .map((p) => cleanClassNameInput(p))
      .filter((p) => p && p.length <= 20);
    if (parts.length === 0) {
      onNotify('error', 'Tên lớp không hợp lệ.');
      return;
    }
    const next = Array.from(new Set([...classListTags, ...parts]));
    setNewClassInput('');
    await persistClassTags(next);
    if (parts[0]) {
      setClassName(parts[0]);
      setBulkDefaultClass(parts[0]);
    }
  };

  const handleQuickAddNextGrade9Class = async () => {
    let n = 1;
    while (classListTags.includes(`9A${n}`)) {
      n++;
    }
    const nextCls = `9A${n}`;
    const next = [...classListTags, nextCls];
    await persistClassTags(next);
    setClassName(nextCls);
    setBulkDefaultClass(nextCls);
  };

  const handleRemoveClassTag = async (clsToRemove: string) => {
    if (classListTags.length <= 1) {
      onNotify('info', 'Cần giữ lại ít nhất 1 lớp học.');
      return;
    }
    const next = classListTags.filter((c) => c !== clsToRemove);
    await persistClassTags(next);
  };

  const handleSaveSchoolConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    let next = [...classListTags];
    if (newClassInput.trim()) {
      const parts = newClassInput
        .trim()
        .split(/[,;\n\r]+/)
        .map((p) => cleanClassNameInput(p))
        .filter((p) => p && p.length <= 20);
      if (parts.length > 0) {
        next = Array.from(new Set([...next, ...parts]));
        setNewClassInput('');
      }
    }
    await persistClassTags(next, false);
  };

  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      onNotify('error', 'Vui lòng nhập Họ và tên học sinh.');
      return;
    }
    const targetClass = cleanClassNameInput(className) || '9A1';
    try {
      const created = await apiRequest<StudentWithStats & { schoolConfig?: SchoolConfig }>(
        '/api/students',
        {
          method: 'POST',
          body: JSON.stringify({
            fullName: fullName.trim(),
            className: targetClass,
            username: customUsername.trim() || undefined,
            password: password.trim() || undefined,
          }),
        }
      );
      if (created.schoolConfig) {
        onSchoolConfigUpdated(created.schoolConfig);
      }
      setStudents((prev) => [created, ...prev]);
      setFullName('');
      setCustomUsername('');
      setPassword('');
      onNotify(
        'success',
        `Đã tạo học sinh ${created.fullName} (Lớp ${created.className}) — TK: ${created.username} (Mật khẩu riêng đã được tạo & ẩn bảo mật).`
      );
    } catch (err: any) {
      onNotify('error', err.message || 'Không thể tạo tài khoản học sinh.');
    }
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBulkPreview.length === 0) {
      onNotify('error', 'Vui lòng nhập hoặc dán ít nhất 1 họ tên học sinh.');
      return;
    }

    try {
      const res = await apiRequest<{
        created: any[];
        skipped: any[];
        schoolConfig?: SchoolConfig;
      }>('/api/students/bulk', {
        method: 'POST',
        body: JSON.stringify({
          studentsList: parsedBulkPreview,
          defaultClassName: cleanClassNameInput(bulkDefaultClass) || '9A1',
        }),
      });
      if (res.schoolConfig) {
        onSchoolConfigUpdated(res.schoolConfig);
      }
      setBulkLines('');
      await loadStudents();
      onNotify(
        'success',
        `Đã tạo thành công ${res.created.length} tài khoản học sinh vào lớp ${cleanClassNameInput(
          bulkDefaultClass
        )} (Mỗi học sinh có 1 mật khẩu riêng biệt, đã ẩn bảo mật)!`
      );
    } catch (err: any) {
      onNotify('error', err.message || 'Lỗi khi tạo hàng loạt.');
    }
  };

  const handleToggleLock = async (st: StudentWithStats) => {
    try {
      const updated = await apiRequest<StudentWithStats>(`/api/students/${st.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isLocked: !st.isLocked }),
      });
      setStudents((prev) =>
        prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
      );
      onNotify(
        'success',
        updated.isLocked
          ? `Đã khoá tài khoản học sinh ${updated.fullName}.`
          : `Đã mở khoá tài khoản học sinh ${updated.fullName}.`
      );
    } catch (err: any) {
      onNotify('error', err.message || 'Lỗi cập nhật trạng thái khoá.');
    }
  };

  const handleResetPassword = async (studentId: string) => {
    if (!newPassValue || newPassValue.trim().length < 4) {
      onNotify('error', 'Mật khẩu mới phải có ít nhất 4 ký tự.');
      return;
    }
    try {
      const updated = await apiRequest<StudentWithStats>(`/api/students/${studentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ newPassword: newPassValue.trim() }),
      });
      setStudents((prev) =>
        prev.map((item) =>
          item.id === studentId
            ? { ...item, ...updated, initialPassword: newPassValue.trim() }
            : item
        )
      );
      setResettingId(null);
      setNewPassValue('');
      onNotify('success', 'Đã đặt lại mật khẩu mới cho học sinh thành công!');
    } catch (err: any) {
      onNotify('error', err.message || 'Không thể đặt lại mật khẩu.');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await apiRequest(`/api/students/${studentId}`, { method: 'DELETE' });
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      onNotify('success', 'Đã xoá tài khoản học sinh.');
    } catch (err: any) {
      onNotify('error', err.message || 'Không thể xoá tài khoản.');
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      if (
        selectedClassFilter !== 'ALL' &&
        cleanClassNameInput(st.className || '') !== selectedClassFilter
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          st.fullName.toLowerCase().includes(q) ||
          st.username.toLowerCase().includes(q) ||
          (st.className || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, selectedClassFilter, searchQuery]);

  const handleExportStudentsCsv = () => {
    const rows = [
      ['STT', 'Họ và tên', 'Lớp', 'Tên đăng nhập (hoặc nhập Họ tên)', 'Mật khẩu', 'Bài đã học', 'Đề đã nộp'],
      ...filteredStudents.map((st, idx) => [
        String(idx + 1),
        st.fullName,
        st.className || '9A1',
        st.username,
        st.initialPassword || '123456 / hsPassword123',
        `${st.stats?.lessonsStudied || 0}/51`,
        String(st.stats?.examSubmissionsCount || 0),
      ]),
    ];
    const csvContent =
      '\uFEFF' +
      rows
        .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_Sach_Tai_Khoan_Hoc_Sinh_${
      selectedClassFilter === 'ALL' ? 'Tat_Ca_Cac_Lop_9' : `Lop_${selectedClassFilter}`
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. School, Teacher & Unlimited Grade 9 Classes Manager */}
      <form
        onSubmit={handleSaveSchoolConfig}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <School className="w-5 h-5 text-[#0D6E6E]" />
            <span>Thông tin Trường, Giáo viên bộ môn & Quản lý các Lớp 9 (Không giới hạn số lớp)</span>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white text-xs font-bold shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Lưu cấu hình trường</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên trường</label>
            <input
              type="text"
              value={cfgSchoolName}
              onChange={(e) => setCfgSchoolName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ tên Giáo viên quản trị
            </label>
            <input
              type="text"
              value={cfgTeacherName}
              onChange={(e) => setCfgTeacherName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Năm học</label>
            <input
              type="text"
              value={cfgSchoolYear}
              onChange={(e) => setCfgSchoolYear(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              required
            />
          </div>
        </div>

        {/* Unlimited Classes Manager */}
        <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-teal-950">
                Danh sách các Lớp học của trường ({classListTags.length} lớp):
              </span>
              <span className="text-xs text-teal-800 ml-2">
                Hỗ trợ mọi khối lớp (VD: 6A1, 7A1, 8A1, 9A1, 9A6, 9/1... - Không giới hạn số lượng).
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickAddNextGrade9Class}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0D6E6E] hover:bg-teal-800 text-white text-xs font-bold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm nhanh lớp 9A tiếp theo</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {classListTags.map((cls) => {
              const countInCls = students.filter(
                (s) => cleanClassNameInput(s.className || '') === cls
              ).length;
              return (
                <span
                  key={cls}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-teal-300 text-teal-950 text-xs font-bold shadow-2xs"
                >
                  <span>Lớp {cls}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[11px]">
                    {countInCls} HS
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveClassTag(cls)}
                    className="text-slate-400 hover:text-red-600 ml-0.5"
                    title={`Bỏ lớp ${cls}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              );
            })}

            <div className="inline-flex items-center gap-1.5">
              <input
                type="text"
                value={newClassInput}
                onChange={(e) => setNewClassInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddClassTag();
                  }
                }}
                placeholder="Nhập tên lớp mới (VD: 9A6, 9A7, 9/1, 6A1)..."
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs w-64 focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                disabled={isSavingClasses}
                onClick={handleAddClassTag}
                className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs ${
                  isSavingClasses
                    ? 'bg-amber-400 opacity-75 cursor-wait'
                    : 'bg-amber-500 hover:bg-amber-600 cursor-pointer active:scale-95'
                }`}
              >
                {isSavingClasses ? 'Đang lưu...' : '+ Thêm lớp'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* 2. Create Student Accounts (Single & Bulk — Super Easy) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Single Student Quick Create */}
        <form
          onSubmit={handleCreateSingle}
          className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
              <UserPlus className="w-5 h-5 text-[#0D6E6E]" />
              <span>Tạo nhanh 1 Học sinh (Chỉ cần nhập Họ tên & Lớp)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                1. Chọn Lớp 9 (hoặc gõ tên lớp bất kỳ)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {classListTags.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setClassName(cls)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                      cleanClassNameInput(className) === cls
                        ? 'bg-[#0D6E6E] text-white border-[#0D6E6E]'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-teal-50'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Gõ tên lớp 9 bất kỳ (VD: 9A1, 9A6, 9A10...)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Họ và tên học sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Chỉ cần gõ Họ và tên (VD: Võ Ngọc Bảo Trân)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Tên đăng nhập (tự sinh)
                </label>
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  placeholder={autoGeneratedSingleUsername || 'Tự động sinh từ Họ tên'}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Mật khẩu riêng (tuỳ chọn)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Để trống tự sinh MK riêng"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                />
              </div>
              <div className="col-span-2 text-[11px] text-teal-800">
                🔒 Mỗi học sinh được cấp <strong>1 mật khẩu riêng biệt</strong> và ẩn bảo mật trên
                màn hình.
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white text-sm font-bold shadow-xs"
          >
            + Tạo tài khoản Học sinh vào lớp {cleanClassNameInput(className) || '9A1'}
          </button>
        </form>

        {/* Bulk Student Create */}
        <form
          onSubmit={handleBulkCreate}
          className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Upload className="w-5 h-5 text-[#0D6E6E]" />
                <span>Tạo hàng loạt cả lớp (Chỉ cần dán danh sách Họ và tên)</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
                Mỗi HS 1 mật khẩu riêng biệt
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                1. Chọn Lớp 9 cần nhập danh sách (hoặc gõ lớp mới: 9A6, 9A7, 9A8...)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {classListTags.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setBulkDefaultClass(cls)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                      cleanClassNameInput(bulkDefaultClass) === cls
                        ? 'bg-[#0D6E6E] text-white border-[#0D6E6E]'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-teal-50'
                    }`}
                  >
                    Lớp {cls}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={bulkDefaultClass}
                onChange={(e) => setBulkDefaultClass(e.target.value)}
                placeholder="Nhập tên lớp (VD: 9A1, 9A2, 9A3, 9A4, 9A5...)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Dán danh sách Họ và tên học sinh (hệ thống tự sinh mật khẩu riêng biệt cho từng học sinh):
              </label>
              <textarea
                rows={5}
                value={bulkLines}
                onChange={(e) => setBulkLines(e.target.value)}
                placeholder={`Chỉ cần dán họ tên học sinh như sau:\nVõ Ngọc Bảo Trân\nNguyễn Minh Triết\nLê Thị Thúy Vy\nNguyễn Thị Kim Yến\n(Hoặc dán: Võ Ngọc Bảo Trân, Nguyễn Minh Triết, Lê Thị Thúy Vy)`}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {/* Live Preview Box */}
            {parsedBulkPreview.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    Đã nhận diện {parsedBulkPreview.length} học sinh hợp lệ (Lớp{' '}
                    {cleanClassNameInput(bulkDefaultClass) || '9A1'} — Mỗi HS 1 mật khẩu riêng biệt,
                    ẩn bảo mật):
                  </span>
                </div>
                <div className="max-h-28 overflow-y-auto flex flex-wrap gap-1.5">
                  {parsedBulkPreview.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-xs text-slate-800"
                    >
                      <strong>
                        {idx + 1}. {item.fullName}
                      </strong>{' '}
                      <span className="text-teal-700 font-mono">({item.className})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-5 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white text-sm font-bold shadow-xs"
          >
            {parsedBulkPreview.length > 0
              ? `+ Tạo ngay ${parsedBulkPreview.length} tài khoản học sinh vào Lớp ${
                  cleanClassNameInput(bulkDefaultClass) || '9A1'
                }`
              : 'Tạo hàng loạt tài khoản lớp'}
          </button>
        </form>
      </div>

      {/* 3. Student List & Filter by Unlimited Classes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
              <Users className="w-5 h-5 text-[#0D6E6E]" />
              <span>
                Danh sách Tài khoản Học sinh ({filteredStudents.length}/{students.length} học sinh)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên học sinh, tài khoản..."
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs w-56"
                />
              </div>

              <button
                type="button"
                onClick={handleExportStudentsCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Xuất danh sách TK & Mật khẩu (.CSV)</span>
              </button>
            </div>
          </div>

          {/* Class Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setSelectedClassFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedClassFilter === 'ALL'
                  ? 'bg-[#0D6E6E] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-teal-50'
              }`}
            >
              Tất cả các lớp ({students.length})
            </button>
            {classListTags.map((cls) => {
              const cnt = students.filter(
                (s) => cleanClassNameInput(s.className || '') === cls
              ).length;
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClassFilter(cls)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedClassFilter === cls
                      ? 'bg-[#0D6E6E] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-teal-50'
                  }`}
                >
                  Lớp {cls} ({cnt})
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải danh sách học sinh...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Chưa có học sinh nào trong bộ lọc này. Thầy hãy nhập hoặc dán tên học sinh ở khung phía
            trên.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                  <th className="p-3.5">STT</th>
                  <th className="p-3.5">Họ và tên (Có thể dùng để ĐN)</th>
                  <th className="p-3.5">Tên đăng nhập</th>
                  <th className="p-3.5">Mật khẩu</th>
                  <th className="p-3.5">Lớp</th>
                  <th className="p-3.5">Tiến độ học tập</th>
                  <th className="p-3.5">Đề đã nộp</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5 text-right">Quản lý tài khoản</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5 font-bold">{idx + 1}</td>
                    <td className="p-3.5 font-bold text-slate-900">{st.fullName}</td>
                    <td className="p-3.5 font-mono text-teal-800 font-semibold">{st.username}</td>
                    <td className="p-3.5 font-mono text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs select-none">
                        •••••••• (Riêng biệt)
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-900 font-bold text-xs border border-teal-200">
                        {st.className}
                      </span>
                    </td>
                    <td className="p-3.5 text-xs">
                      Đã học: <strong>{st.stats?.lessonsStudied || 0}/51 bài</strong> • Đã làm:{' '}
                      <strong>{st.stats?.totalQuestionsDone || 0} câu</strong> (Đúng:{' '}
                      {st.stats?.accuracyPercent || 0}%)
                    </td>
                    <td className="p-3.5 font-bold">{st.stats?.examSubmissionsCount || 0} đợt</td>
                    <td className="p-3.5">
                      {st.isLocked ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                          Đã khoá
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                          Hoạt động
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      {resettingId === st.id ? (
                        <div className="inline-flex items-center gap-1.5">
                          <input
                            type="password"
                            value={newPassValue}
                            onChange={(e) => setNewPassValue(e.target.value)}
                            placeholder="Nhập MK mới..."
                            className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs w-28"
                          />
                          <button
                            onClick={() => handleResetPassword(st.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#0D6E6E] text-white text-xs font-bold"
                          >
                            Lưu
                          </button>
                          <button
                            onClick={() => setResettingId(null)}
                            className="px-2 py-1 rounded-lg border text-xs"
                          >
                            Huỷ
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setResettingId(st.id);
                              setNewPassValue('');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                            title="Đặt lại mật khẩu"
                          >
                            <KeyRound className="w-3.5 h-3.5" /> Đặt lại MK
                          </button>
                          <button
                            onClick={() => handleToggleLock(st)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                              st.isLocked
                                ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                                : 'border-amber-300 text-amber-800 hover:bg-amber-50'
                            }`}
                          >
                            {st.isLocked ? (
                              <>
                                <Unlock className="w-3.5 h-3.5" /> Mở khoá
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" /> Khoá TK
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(st.id)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                            title="Xoá tài khoản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
