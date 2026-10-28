import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { apiRequest } from '../../services/apiClient';
import { ExamDefinition, SchoolConfig } from '../../types/domainTypes';
import { ExamDocumentTablesView, HydratedVariant } from './ExamDocumentTablesView';

interface PrintDataResponse {
  exam: ExamDefinition;
  schoolConfig: SchoolConfig;
  hydratedVariants: HydratedVariant[];
}

interface ExamPrintableViewerProps {
  examId: string;
  onClose: () => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const ExamPrintableViewer: React.FC<ExamPrintableViewerProps> = ({
  examId,
  onClose,
  onNotify,
}) => {
  const [data, setData] = useState<PrintDataResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiRequest<PrintDataResponse>(`/api/exams/${examId}/print-data`)
      .then((res) => {
        setData(res);
      })
      .catch((err) => onNotify('error', err.message || 'Không tải được dữ liệu bản in.'))
      .finally(() => setLoading(false));
  }, [examId]);

  if (loading || !data) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-sm font-semibold text-slate-700">
          Đang tải Khung Ma trận, Bản đặc tả, Đề kiểm tra và Hướng dẫn chấm...
        </div>
      </div>
    );
  }

  const { exam, schoolConfig, hydratedVariants } = data;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 overflow-y-auto p-2 sm:p-6">
      <div className="max-w-7xl mx-auto bg-slate-50 rounded-3xl shadow-2xl overflow-hidden print-sheet">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-[#0D6E6E] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 no-print">
          <div>
            <h3 className="font-bold text-lg">{exam.title}</h3>
            <p className="text-xs text-teal-100">
              Đúng chuẩn mẫu trường: Khung Ma trận đề • Bản đặc tả • Đề kiểm tra ({hydratedVariants.length} mã đề tương đương) • Đáp án & Hướng dẫn chấm
            </p>
          </div>

          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold"
          >
            <X className="w-4 h-4" />
            <span>Đóng cửa sổ</span>
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <ExamDocumentTablesView
            title={exam.title}
            category={exam.category}
            schoolYear={exam.schoolYear}
            durationMinutes={exam.durationMinutes}
            totalPoints={exam.totalPoints}
            schoolConfig={schoolConfig}
            matrixRows={exam.matrixRows}
            specificationRows={exam.specificationRows}
            hydratedVariants={hydratedVariants}
            defaultTab="matrix"
          />
        </div>
      </div>
    </div>
  );
};
