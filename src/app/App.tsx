import React, { useEffect, useState } from 'react';
import { apiRequest, setStoredToken } from '../services/apiClient';
import {
  ChapterInfo,
  LessonItem,
  LessonProgressRecord,
  SchoolConfig,
  UserAccount,
} from '../types/domainTypes';
import { AppHeader, ActiveTab } from '../components/layout/AppHeader';
import { ToastBar, ToastMessage } from '../components/common/ToastBar';
import { AuthPortal } from '../features/auth/AuthPortal';
import { CurriculumHub } from '../features/curriculum/CurriculumHub';
import { StudentProgressDashboard } from '../features/curriculum/StudentProgressDashboard';
import { QuestionBankManager } from '../features/question-bank/QuestionBankManager';
import { ExamStudioManager } from '../features/exam-studio/ExamStudioManager';
import { StudentExamRoom } from '../features/exam-room/StudentExamRoom';
import { TeacherGradingAndReports } from '../features/grading-reports/TeacherGradingAndReports';
import { StudentAccountsManager } from '../features/students-admin/StudentAccountsManager';

interface StudentRosterItem {
  id: string;
  fullName: string;
  username: string;
  className: string;
}

interface BootstrapResponse {
  hasTeacherAccount: boolean;
  schoolConfig: SchoolConfig;
  currentUser: UserAccount | null;
  chapters: ChapterInfo[];
  lessons: LessonItem[];
  myProgress: Record<number, LessonProgressRecord>;
  studentRoster?: StudentRosterItem[];
}

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [hasTeacherAccount, setHasTeacherAccount] = useState(true);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>({
    schoolName: 'Trường TH – THCS Phước Hưng',
    teacherName: 'Lê Văn Thắng',
    schoolYear: '2026 – 2027',
    classes: ['9A1', '9A2'],
    antiCheatMaxViolations: 3,
  });
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [myProgress, setMyProgress] = useState<Record<number, LessonProgressRecord>>({});
  const [studentRoster, setStudentRoster] = useState<StudentRosterItem[]>([]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('curriculum');
  const [selectedGrade, setSelectedGrade] = useState<number>(() => {
    const saved = localStorage.getItem('khtn_selected_grade');
    return saved ? Number(saved) : 9;
  });
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notify = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({
      id: String(Date.now()),
      type,
      text,
    });
  };

  const handleSelectGrade = (newGrade: number) => {
    setSelectedGrade(newGrade);
    localStorage.setItem('khtn_selected_grade', String(newGrade));
    const gradeLessons = lessons.filter(
      (l) => (l.grade || (l.id >= 800 ? 8 : l.id >= 700 ? 7 : l.id >= 600 ? 6 : 9)) === newGrade
    );
    if (gradeLessons.length > 0) {
      setSelectedLessonId(gradeLessons[0].id);
    }
  };

  const fetchBootstrap = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<BootstrapResponse>('/api/bootstrap');
      setHasTeacherAccount(data.hasTeacherAccount);
      setSchoolConfig(data.schoolConfig);
      setCurrentUser(data.currentUser);
      setChapters(data.chapters);
      setLessons(data.lessons);
      setMyProgress(data.myProgress || {});
      setStudentRoster(data.studentRoster || []);

      let initialGrade = selectedGrade;
      if (data.currentUser?.role === 'student' && data.currentUser.className) {
        const cls = String(data.currentUser.className);
        if (cls.includes('6')) initialGrade = 6;
        else if (cls.includes('7')) initialGrade = 7;
        else if (cls.includes('8')) initialGrade = 8;
        else if (cls.includes('9')) initialGrade = 9;
        setSelectedGrade(initialGrade);
        localStorage.setItem('khtn_selected_grade', String(initialGrade));
      }

      const gradeLessons = data.lessons.filter(
        (l) => (l.grade || (l.id >= 800 ? 8 : l.id >= 700 ? 7 : l.id >= 600 ? 6 : 9)) === initialGrade
      );
      if (gradeLessons[0] && !gradeLessons.some((l) => l.id === selectedLessonId)) {
        setSelectedLessonId(gradeLessons[0].id);
      }
    } catch (err: any) {
      notify('error', err.message || 'Không thể kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBootstrap();
  }, []);

  const handleAuthSuccess = async (user: UserAccount, updatedSchoolCfg?: SchoolConfig) => {
    setCurrentUser(user);
    setHasTeacherAccount(true);
    if (updatedSchoolCfg) setSchoolConfig(updatedSchoolCfg);
    setActiveTab('curriculum');
    await fetchBootstrap();
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setStoredToken('');
    setCurrentUser(null);
    notify('info', 'Đã đăng xuất khỏi hệ thống.');
    await fetchBootstrap();
  };

  const handleLessonsChanged = (updatedLesson: LessonItem, isNew = false) => {
    if (isNew) {
      setLessons((prev) => [...prev, updatedLesson]);
    } else {
      setLessons((prev) =>
        prev.map((l) => (l.id === updatedLesson.id ? updatedLesson : l))
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-[#0D6E6E] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-bold text-slate-700">
            Đang tải Hệ thống Học tập & Kiểm tra KHTN 9...
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <AuthPortal
          hasTeacherAccount={hasTeacherAccount}
          schoolConfig={schoolConfig}
          studentRoster={studentRoster}
          onAuthSuccess={handleAuthSuccess}
          onNotify={notify}
        />
        <ToastBar toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  const currentGradeChapters = chapters.filter(
    (c) => (c.grade || (c.id.startsWith('ch-6-') ? 6 : c.id.startsWith('ch-7-') ? 7 : c.id.startsWith('ch-8-') ? 8 : 9)) === selectedGrade
  );
  const currentGradeLessons = lessons.filter(
    (l) => (l.grade || (l.id >= 800 ? 8 : l.id >= 700 ? 7 : l.id >= 600 ? 6 : 9)) === selectedGrade
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <AppHeader
        user={currentUser}
        schoolConfig={schoolConfig}
        activeTab={activeTab}
        selectedGrade={selectedGrade}
        onSelectGrade={handleSelectGrade}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="flex-1">
        {activeTab === 'curriculum' && (
          <CurriculumHub
            role={currentUser.role}
            selectedGrade={selectedGrade}
            chapters={currentGradeChapters}
            lessons={currentGradeLessons}
            availableClasses={schoolConfig.classes || ['9A1', '9A2']}
            myProgress={myProgress}
            selectedLessonId={selectedLessonId}
            onSelectLessonId={setSelectedLessonId}
            onLessonsChanged={handleLessonsChanged}
            onProgressUpdated={setMyProgress}
            onNotify={notify}
          />
        )}

        {activeTab === 'my-progress' && currentUser.role === 'student' && (
          <StudentProgressDashboard
            chapters={currentGradeChapters}
            lessons={currentGradeLessons}
            myProgress={myProgress}
            onGoToLesson={(lessonId) => {
              setSelectedLessonId(lessonId);
              setActiveTab('curriculum');
            }}
          />
        )}

        {activeTab === 'exam-room' && currentUser.role === 'student' && (
          <StudentExamRoom onNotify={notify} />
        )}

        {activeTab === 'question-bank' && currentUser.role === 'teacher' && (
          <QuestionBankManager
            chapters={currentGradeChapters}
            lessons={currentGradeLessons}
            selectedGrade={selectedGrade}
            onNotify={notify}
          />
        )}

        {activeTab === 'exam-studio' && currentUser.role === 'teacher' && (
          <ExamStudioManager
            chapters={currentGradeChapters}
            lessons={currentGradeLessons}
            availableClasses={schoolConfig.classes || ['9A1', '9A2']}
            selectedGrade={selectedGrade}
            onNotify={notify}
          />
        )}

        {activeTab === 'grading-reports' && currentUser.role === 'teacher' && (
          <TeacherGradingAndReports onNotify={notify} />
        )}

        {activeTab === 'students-admin' && currentUser.role === 'teacher' && (
          <StudentAccountsManager
            schoolConfig={schoolConfig}
            onSchoolConfigUpdated={setSchoolConfig}
            onNotify={notify}
          />
        )}
      </div>

      <ToastBar toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
