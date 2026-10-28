import json from 'node:fs';
import {
  selectQuestionsForLessonScope,
  buildMatrixAndSpecification,
  generatePaperVariants,
  hydratePaperVariants,
} from '../server/examGenerator.js';

const db = JSON.parse(json.readFileSync('./server/data/db.json', 'utf-8'));

function testGrade(gradeNum, sampleLessonIds, category = 'midterm') {
  console.log(`\n=================== TESTING GRADE ${gradeNum} ===================`);
  const selectedQuestions = selectQuestionsForLessonScope({
    category,
    lessonScope: sampleLessonIds,
    countsByType: { mcq: 12, true_false: 2, short_answer: 4, essay: 3 },
    levelRatios: { biet: 40, hieu: 30, van_dung: 30 },
    allQuestions: db.questions,
    allLessons: db.lessons,
  });

  console.log(`Selected ${selectedQuestions.length} questions for lessons:`, sampleLessonIds);

  const { matrixRows, specificationRows } = buildMatrixAndSpecification(
    selectedQuestions,
    db.chapters,
    db.lessons,
    category,
    10
  );

  console.log(`Matrix rows (${matrixRows.length}):`);
  for (const m of matrixRows) {
    console.log(`  - [TT ${m.tt}] ${m.lessonTitle}: ${m.periods} tiết | điểm: ${m.totalPoints} (${m.percentScore}%)`);
  }

  console.log(`Specification rows (${specificationRows.length}):`);
  for (const s of specificationRows) {
    console.log(`  - ${s.lessonTitle} (${s.periods} tiết):`);
    console.log(`      Biết (${s.requirementsByLevel.biet.length}):`, s.requirementsByLevel.biet);
    console.log(`      Hiểu (${s.requirementsByLevel.hieu.length}):`, s.requirementsByLevel.hieu);
    console.log(`      Vận dụng (${s.requirementsByLevel.van_dung.length}):`, s.requirementsByLevel.van_dung);
    if (s.indicators && s.indicators.length > 0) {
      console.log(`      Chỉ báo:`, s.indicators);
    }
  }

  const variants = generatePaperVariants(selectedQuestions, db.questions, 2);
  const hydrated = hydratePaperVariants(variants, db.questions);
  console.log(`Generated ${hydrated.length} variants successfully. Variant ${hydrated[0].paperCode} has ${hydrated[0].questions.length} questions.`);
}

// Test Grade 6 (lessons 601, 602, 603, 604, 605, 606, 607, 608)
testGrade(6, [601, 602, 603, 604, 605, 606, 607, 608]);

// Test Grade 7 (lessons 701, 702, 703, 704, 705, 706, 707, 708)
testGrade(7, [701, 702, 703, 704, 705, 706, 707, 708]);

// Test Grade 8 (lessons 801, 802, 803, 804, 805, 806, 807, 808)
testGrade(8, [801, 802, 803, 804, 805, 806, 807, 808]);

// Test Grade 9 (lessons 1, 2, 3, 18, 19, 20, 21, 36, 37)
testGrade(9, [1, 2, 3, 18, 19, 20, 21, 36, 37]);
