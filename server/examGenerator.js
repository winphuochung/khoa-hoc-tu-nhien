function computeSimpleSignature(str) {
  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return (hex1 + hex2).slice(0, 12).toUpperCase();
}

export function normalizeAnswerText(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,;!?]+$/g, '')
    .trim();
}

export function deterministicShuffle(array, seedString) {
  const arr = [...array];
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed = (seed * 31 + seedString.charCodeAt(i)) >>> 0;
  }
  const nextRand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function calculateTrueFalseScore(correctCount, maxPoints = 1.0) {
  const scale = maxPoints / 1.0;
  if (correctCount === 4) return Number((1.0 * scale).toFixed(2));
  if (correctCount === 3) return Number((0.5 * scale).toFixed(2));
  if (correctCount === 2) return Number((0.25 * scale).toFixed(2));
  if (correctCount === 1) return Number((0.1 * scale).toFixed(2));
  return 0;
}

function formatChapterDisplayTitle(chap) {
  if (!chap) return 'Chủ đề KHTN 9';
  if (chap.id === 'ch-00' || chap.code === 'Mở đầu') {
    return 'Chủ đề mở đầu';
  }
  if (chap.title && chap.title.toLowerCase().startsWith('chương')) {
    return chap.title;
  }
  return `${chap.code}. ${chap.title}`;
}

export function sortQuestionsCanonically(questions) {
  const typeOrder = { mcq: 1, true_false: 2, short_answer: 3, essay: 4 };
  const levelOrder = { biet: 1, hieu: 2, van_dung: 3 };
  return [...questions].sort((a, b) => {
    const ta = typeOrder[a.type] || 9;
    const tb = typeOrder[b.type] || 9;
    if (ta !== tb) return ta - tb;
    if (a.lessonId !== b.lessonId) return a.lessonId - b.lessonId;
    const la = levelOrder[a.level] || 9;
    const lb = levelOrder[b.level] || 9;
    if (la !== lb) return la - lb;
    return String(a.id).localeCompare(String(b.id));
  });
}

export function selectQuestionsForLessonScope(arg1 = {}, arg2 = {}) {
  const opts = Array.isArray(arg1) ? { ...arg2, allQuestions: arg1 } : arg1;
  const {
    category = 'midterm',
    lessonScope = [],
    countsByType = { mcq: 12, true_false: 2, short_answer: 4, essay: 3 },
    levelRatios = { biet: 40, hieu: 30, van_dung: 30 },
    useOfficialMidtermPreset = false,
    allQuestions = [],
    allLessons = [],
  } = opts;

  const qMap = new Map(allQuestions.map((q) => [q.id, q]));
  const lessonMap = new Map(allLessons.map((l) => [l.id, l]));

  const normalizedScope =
    Array.isArray(lessonScope) && lessonScope.length > 0
      ? Array.from(new Set(lessonScope.map(Number))).sort((a, b) => a - b)
      : allLessons.map((l) => l.id).sort((a, b) => a - b);

  // If explicit preset requested:
  if (useOfficialMidtermPreset) {
    const docxIds01 = [
      'q-docx-101', 'q-docx-102', 'q-docx-103', 'q-docx-104',
      'q-docx-105', 'q-docx-106', 'q-docx-107', 'q-docx-108',
      'q-docx-109', 'q-docx-110', 'q-docx-111', 'q-docx-112',
      'q-docx-113', 'q-docx-114',
      'q-docx-115', 'q-docx-116', 'q-docx-117', 'q-docx-118',
      'q-docx-119', 'q-docx-120', 'q-docx-121',
    ];
    return sortQuestionsCanonically(docxIds01.map((id) => qMap.get(id)).filter(Boolean));
  }

  // Filter STRICTLY to the selected lessons (never pull from outside normalizedScope)
  const scopeSet = new Set(normalizedScope);
  const strictPool = allQuestions.filter((q) => scopeSet.has(Number(q.lessonId)));

  // Extract accurate periods from allLessons
  const periodsMap = new Map();
  for (const lid of normalizedScope) {
    const les = lessonMap.get(lid);
    periodsMap.set(lid, les && les.periods ? Number(les.periods) : 2);
  }
  const totalPeriods = Array.from(periodsMap.values()).reduce((sum, p) => sum + p, 0) || normalizedScope.length;
  const maxPeriodInScope = Math.max(...Array.from(periodsMap.values()));

  const is15Min = category === '15min';
  const totalExamPoints = 10.0;

  // Target points per lesson: strictly proportional to periods (more periods = more points!)
  const targetPoints = new Map();
  for (const lid of normalizedScope) {
    const p = periodsMap.get(lid) || 1;
    targetPoints.set(lid, (p / totalPeriods) * totalExamPoints);
  }

  const typeWeight = {
    mcq: is15Min ? 1.0 : 0.25,
    true_false: 1.0,
    short_answer: 0.5,
    essay: 1.0,
  };

  const isPrimaryQuestion = (q) =>
    !q.isVariantTwin &&
    !String(q.id).startsWith('q-docx-2') &&
    !String(q.id).endsWith('-v2');

  const usedGlobal = new Set();
  const awardedPoints = new Map(normalizedScope.map((id) => [id, 0]));
  const awardedCounts = new Map(normalizedScope.map((id) => [id, 0]));

  const pickByTypeProportional = (type, neededCount, targetLevels) => {
    if (neededCount <= 0) return [];
    const ptVal = typeWeight[type] || 0.25;
    const typePoolAll = strictPool.filter((q) => q.type === type);
    const typePoolPrimary = typePoolAll.filter(isPrimaryQuestion);
    const picked = [];

    for (let i = 0; i < neededCount; i++) {
      const targetLvl = targetLevels[i] || targetLevels[targetLevels.length - 1] || 'biet';

      // Rank lessons:
      // Priority 1: High point questions (>= 1.0 pt) should NOT go to 1-period lessons when >= 2-period lessons exist
      // Priority 2: Lessons with highest remaining deficit (targetPoints - awardedPoints)
      // Priority 3: Lessons with more periods
      // Priority 4: Lesson ID ascending
      const rankedLessons = [...normalizedScope].sort((la, lb) => {
        const pa = periodsMap.get(la) || 1;
        const pb = periodsMap.get(lb) || 1;
        let defA = (targetPoints.get(la) || 0) - (awardedPoints.get(la) || 0);
        let defB = (targetPoints.get(lb) || 0) - (awardedPoints.get(lb) || 0);

        if (ptVal >= 1.0 && maxPeriodInScope >= 2) {
          if (pa < 2) defA -= 5.0;
          if (pb < 2) defB -= 5.0;
          if (pa < 3 && maxPeriodInScope >= 3) defA -= 1.0;
          if (pb < 3 && maxPeriodInScope >= 3) defB -= 1.0;
        }

        const diffDef = defB - defA;
        if (Math.abs(diffDef) > 0.001) return diffDef;

        const diffP = pb - pa;
        if (diffP !== 0) return diffP;

        return la - lb;
      });

      let chosen = null;

      // Pass 1: Primary question matching target level in best-ranked lesson
      for (const lesId of rankedLessons) {
        const cand = typePoolPrimary.find(
          (q) => q.lessonId === lesId && q.level === targetLvl && !usedGlobal.has(q.id)
        );
        if (cand) {
          chosen = cand;
          break;
        }
      }

      // Pass 2: Any question matching target level in best-ranked lesson
      if (!chosen) {
        for (const lesId of rankedLessons) {
          const cand = typePoolAll.find(
            (q) => q.lessonId === lesId && q.level === targetLvl && !usedGlobal.has(q.id)
          );
          if (cand) {
            chosen = cand;
            break;
          }
        }
      }

      // Pass 3: Primary question of any level in best-ranked lesson
      if (!chosen) {
        for (const lesId of rankedLessons) {
          const cand = typePoolPrimary.find(
            (q) => q.lessonId === lesId && !usedGlobal.has(q.id)
          );
          if (cand) {
            chosen = cand;
            break;
          }
        }
      }

      // Pass 4: Any question in best-ranked lesson
      if (!chosen) {
        for (const lesId of rankedLessons) {
          const cand = typePoolAll.find(
            (q) => q.lessonId === lesId && !usedGlobal.has(q.id)
          );
          if (cand) {
            chosen = cand;
            break;
          }
        }
      }

      if (chosen) {
        usedGlobal.add(chosen.id);
        awardedPoints.set(
          chosen.lessonId,
          Number(((awardedPoints.get(chosen.lessonId) || 0) + ptVal).toFixed(2))
        );
        awardedCounts.set(chosen.lessonId, (awardedCounts.get(chosen.lessonId) || 0) + 1);
        picked.push(chosen);
      }
    }

    return picked;
  };

  let selectedQuestions = [];

  if (category === '15min') {
    const mcqCount = Number(countsByType.mcq || 10);
    const levels15 = [
      'biet', 'biet', 'biet', 'biet',
      'hieu', 'hieu', 'hieu',
      'van_dung', 'van_dung', 'van_dung',
    ];
    selectedQuestions = pickByTypeProportional('mcq', mcqCount, levels15);
  } else if (category === 'midterm' || category === 'final') {
    const mcqCount = Number(countsByType.mcq ?? 12);
    const tfCount = Number(countsByType.true_false ?? 2);
    const saCount = Number(countsByType.short_answer ?? 4);
    const essayCount = Number(countsByType.essay ?? 3);

    const mcqBietCount = Math.round((mcqCount * 10) / 12);
    const mcqHieuCount = Math.max(0, mcqCount - mcqBietCount);
    const mcqLevels = [
      ...Array(mcqBietCount).fill('biet'),
      ...Array(mcqHieuCount).fill('hieu'),
    ];

    // Pick large weight questions first so high-period lessons get higher points!
    const pickedEssay = pickByTypeProportional('essay', essayCount, Array(essayCount).fill('van_dung'));
    const pickedTf = pickByTypeProportional('true_false', tfCount, Array(tfCount).fill('hieu'));
    const pickedSa = pickByTypeProportional('short_answer', saCount, [
      ...Array(Math.ceil(saCount * 0.75)).fill('biet'),
      ...Array(saCount).fill('hieu'),
    ].slice(0, saCount));
    const pickedMcq = pickByTypeProportional('mcq', mcqCount, mcqLevels);

    selectedQuestions = [...pickedMcq, ...pickedTf, ...pickedSa, ...pickedEssay];
  } else {
    const mcqCount = Number(countsByType.mcq ?? 10);
    const tfCount = Number(countsByType.true_false ?? 0);
    const saCount = Number(countsByType.short_answer ?? 0);
    const essayCount = Number(countsByType.essay ?? 0);

    const bCount = Math.round((mcqCount * (levelRatios.biet || 40)) / 100);
    const hCount = Math.round((mcqCount * (levelRatios.hieu || 30)) / 100);
    const vdCount = Math.max(0, mcqCount - bCount - hCount);
    const mcqLevels = [
      ...Array(bCount).fill('biet'),
      ...Array(hCount).fill('hieu'),
      ...Array(vdCount).fill('van_dung'),
    ];

    const pickedEssay = pickByTypeProportional('essay', essayCount, Array(essayCount).fill('van_dung'));
    const pickedTf = pickByTypeProportional('true_false', tfCount, Array(tfCount).fill('hieu'));
    const pickedSa = pickByTypeProportional('short_answer', saCount, ['biet', 'hieu', 'van_dung']);
    const pickedMcq = pickByTypeProportional('mcq', mcqCount, mcqLevels);

    selectedQuestions = [...pickedMcq, ...pickedTf, ...pickedSa, ...pickedEssay];
  }

  return sortQuestionsCanonically(selectedQuestions);
}

export function buildMatrixAndSpecification(
  questions,
  chapters,
  lessons,
  category,
  totalPoints = 10
) {
  const chapterMap = new Map(chapters.map((c) => [c.id, c]));
  const lessonMap = new Map(lessons.map((l) => [l.id, l]));

  const getQuestionPoints = (q) => {
    if (category === '15min') return 1.0;
    if (category === 'midterm' || category === 'final') {
      if (q.type === 'mcq') return 0.25;
      if (q.type === 'true_false') return 1.0;
      if (q.type === 'short_answer') return 0.5;
      if (q.type === 'essay') return 1.0;
    }
    return q.points || 0.5;
  };

  // Canonical ordering so Câu 1..12 (MCQ), Câu 1..2 (Đ-S), Câu 1..4 (TLN), Câu 1..3 (TL) match the exam paper 100%
  const canonicalQuestions = sortQuestionsCanonically(questions);

  // Assign question number within each section (I, II, III, Tự luận)
  const sectionCounters = {
    mcq: 0,
    true_false: 0,
    short_answer: 0,
    essay: 0,
  };
  const questionSectionNumber = new Map();
  for (const q of canonicalQuestions) {
    sectionCounters[q.type] = (sectionCounters[q.type] || 0) + 1;
    questionSectionNumber.set(q.id, sectionCounters[q.type]);
  }

  // Group by lessonId in ascending lesson order
  const lessonGroups = new Map();
  const questionsByLesson = [...canonicalQuestions].sort((a, b) => a.lessonId - b.lessonId);

  for (const q of questionsByLesson) {
    if (!lessonGroups.has(q.lessonId)) {
      const les = lessonMap.get(q.lessonId) || {
        id: q.lessonId,
        chapterId: q.chapterId,
        title: `Bài ${q.lessonId}`,
        periods: 2,
        objectives: [],
      };
      const chap = chapterMap.get(les.chapterId) || {
        id: les.chapterId,
        code: 'Chủ đề',
        title: 'Chủ đề KHTN 9',
      };
      lessonGroups.set(q.lessonId, {
        lesson: les,
        chapter: chap,
        counts: {
          mcq: { biet: 0, hieu: 0, van_dung: 0 },
          true_false: { biet: 0, hieu: 0, van_dung: 0 },
          short_answer: { biet: 0, hieu: 0, van_dung: 0 },
          essay: { biet: 0, hieu: 0, van_dung: 0 },
        },
        totalByLevel: {
          biet: 0,
          hieu: 0,
          van_dung: 0,
        },
        positions: {
          mcq: { biet: [], hieu: [], van_dung: [] },
          true_false: { biet: [], hieu: [], van_dung: [] },
          short_answer: { biet: [], hieu: [], van_dung: [] },
          essay: { biet: [], hieu: [], van_dung: [] },
        },
        cellEntries: {
          mcq: { biet: [], hieu: [], van_dung: [] },
          true_false: { biet: [], hieu: [], van_dung: [] },
          short_answer: { biet: [], hieu: [], van_dung: [] },
          essay: { biet: [], hieu: [], van_dung: [] },
        },
        requirementsByLevel: {
          biet: new Set(),
          hieu: new Set(),
          van_dung: new Set(),
        },
        indicators: new Set(),
        pointsSum: 0,
        commandsCount: 0,
      });
    }

    const group = lessonGroups.get(q.lessonId);
    const pts = getQuestionPoints(q);
    group.counts[q.type][q.level] += 1;
    group.totalByLevel[q.level] += 1;
    group.pointsSum = Number((group.pointsSum + pts).toFixed(2));
    group.commandsCount += 1;

    if (q.requirementText && q.requirementText.trim()) {
      group.requirementsByLevel[q.level].add(q.requirementText.trim());
    } else if (group.lesson.objectives?.length > 0) {
      const objs = group.lesson.objectives;
      let matchedObj = null;
      if (q.level === 'van_dung') {
        matchedObj =
          objs.find((o) =>
            /vận dụng|tính|tiến hành|thực hiện|chế tạo|đo được|đề xuất|thiết kế/i.test(o)
          ) || objs[objs.length - 1];
      } else if (q.level === 'hieu') {
        matchedObj =
          objs.find((o) =>
            /giải thích|trình bày|mô tả|phân biệt|so sánh|dựa vào|rút ra|phân tích/i.test(o)
          ) || objs[Math.min(1, objs.length - 1)];
      } else {
        matchedObj =
          objs.find((o) =>
            /nêu|nhận biết|kể tên|liệt kê|phát biểu|viết|chỉ ra|đọc|biết cách/i.test(o)
          ) || objs[0];
      }
      if (matchedObj) group.requirementsByLevel[q.level].add(matchedObj);
    }

    const effectiveIndicator =
      group.lesson.subject === 'vat_li' ? '' : String(q.indicator || '').trim();
    if (effectiveIndicator) {
      group.indicators.add(effectiveIndicator);
    }

    const secNum = questionSectionNumber.get(q.id) || 1;
    const posLabel = `Câu ${secNum}`;
    group.positions[q.type][q.level].push(posLabel);
    group.cellEntries[q.type][q.level].push({
      qNum: secNum,
      indicator: effectiveIndicator,
    });
  }

  // Format cell text like sample docx: "Câu 1, Câu 2\nHH1.1"
  const formatSpecCell = (entries) => {
    if (!entries || entries.length === 0) return '';
    const cauList = entries.map((e) => `Câu ${e.qNum}`).join(', ');
    const inds = Array.from(new Set(entries.map((e) => e.indicator).filter(Boolean))).join(', ');
    return inds ? `${cauList}\n${inds}` : cauList;
  };

  // Assign chapter TT (1, 2, 3, 4...) across distinct chapters in order
  const chapterTtMap = new Map();
  let chapterCounter = 0;
  for (const [, grp] of lessonGroups.entries()) {
    if (!chapterTtMap.has(grp.chapter.id)) {
      chapterCounter += 1;
      chapterTtMap.set(grp.chapter.id, chapterCounter);
    }
  }

  const totalScopePeriods = Array.from(lessonGroups.values()).reduce(
    (sum, grp) => sum + (grp.lesson.periods || 2),
    0
  );

  const matrixRows = [];
  const specificationRows = [];
  let rowIndex = 0;

  for (const [, grp] of lessonGroups.entries()) {
    rowIndex += 1;
    const chapterTt = chapterTtMap.get(grp.chapter.id) || rowIndex;
    const chapterDisplay = formatChapterDisplayTitle(grp.chapter);
    const pct = totalPoints > 0 ? Number(((grp.pointsSum / totalPoints) * 100).toFixed(1)) : 0;
    const periodsVal = grp.lesson.periods || 2;
    const periodsPct =
      totalScopePeriods > 0
        ? Number(((periodsVal / totalScopePeriods) * 100).toFixed(1))
        : 0;

    matrixRows.push({
      tt: chapterTt,
      rowIndex,
      chapterId: grp.chapter.id,
      chapterTitle: chapterDisplay,
      lessonId: grp.lesson.id,
      lessonTitle: grp.lesson.title,
      periods: periodsVal,
      periodsPercent: periodsPct,
      counts: grp.counts,
      totalByLevel: grp.totalByLevel,
      totalCommands: grp.commandsCount,
      totalPoints: grp.pointsSum,
      percentScore: pct,
    });

    const specCells = {
      mcq: {
        biet: formatSpecCell(grp.cellEntries.mcq.biet),
        hieu: formatSpecCell(grp.cellEntries.mcq.hieu),
        van_dung: formatSpecCell(grp.cellEntries.mcq.van_dung),
      },
      true_false: {
        biet: formatSpecCell(grp.cellEntries.true_false.biet),
        hieu: formatSpecCell(grp.cellEntries.true_false.hieu),
        van_dung: formatSpecCell(grp.cellEntries.true_false.van_dung),
      },
      short_answer: {
        biet: formatSpecCell(grp.cellEntries.short_answer.biet),
        hieu: formatSpecCell(grp.cellEntries.short_answer.hieu),
        van_dung: formatSpecCell(grp.cellEntries.short_answer.van_dung),
      },
      essay: {
        biet: formatSpecCell(grp.cellEntries.essay.biet),
        hieu: formatSpecCell(grp.cellEntries.essay.hieu),
        van_dung: formatSpecCell(grp.cellEntries.essay.van_dung),
      },
    };

    specificationRows.push({
      tt: chapterTt,
      rowIndex,
      chapterId: grp.chapter.id,
      chapterTitle: chapterDisplay,
      lessonId: grp.lesson.id,
      lessonTitle: grp.lesson.title,
      periods: periodsVal,
      periodsPercent: periodsPct,
      requirementsByLevel: {
        biet: Array.from(grp.requirementsByLevel.biet),
        hieu: Array.from(grp.requirementsByLevel.hieu),
        van_dung: Array.from(grp.requirementsByLevel.van_dung),
      },
      indicators: Array.from(grp.indicators),
      questionPositions: grp.positions,
      specCells,
      counts: grp.counts,
    });
  }

  return { matrixRows, specificationRows };
}

export function generatePaperVariants(selectedQuestions, allBankQuestions, variantCount = 2) {
  const variants = [];
  const canonicalSelected = sortQuestionsCanonically(selectedQuestions);
  const baseIds = canonicalSelected.map((q) => q.id);
  const baseIdsSet = new Set(baseIds);

  // Variant 01: Base questions in canonical lesson/section order matching the Matrix & Specification
  const optionOrders01 = {};
  for (const q of canonicalSelected) {
    if (q.type === 'mcq' && q.options) {
      optionOrders01[q.id] = [0, 1, 2, 3];
    }
  }
  variants.push({
    paperCode: '01',
    questionIds: baseIds,
    optionOrders: optionOrders01,
  });

  const qMap = new Map(allBankQuestions.map((q) => [q.id, q]));

  // Variant 02..N: 100% DIFFERENT questions from the EXACT same lessonId, type, and level
  for (let v = 2; v <= Math.max(2, variantCount); v++) {
    const code = String(v).padStart(2, '0');
    const usedIds = new Set();
    const variantQuestions = [];

    for (const baseQ of canonicalSelected) {
      // 1. If baseQ is an official docx question q-docx-1XX, use its exact twin q-docx-2XX
      if (String(baseQ.id).startsWith('q-docx-1')) {
        const twinId = String(baseQ.id).replace('q-docx-1', 'q-docx-2');
        const twinQ = qMap.get(twinId);
        if (twinQ && !usedIds.has(twinQ.id) && !baseIdsSet.has(twinQ.id)) {
          usedIds.add(twinQ.id);
          variantQuestions.push(twinQ);
          continue;
        }
      }

      // 2. If baseQ has a dedicated -v2 twin (twinOf === baseQ.id or id === `${baseQ.id}-v2`), use it!
      const directTwin =
        qMap.get(`${baseQ.id}-v2`) ||
        allBankQuestions.find((cand) => cand.twinOf === baseQ.id);
      if (directTwin && !usedIds.has(directTwin.id) && !baseIdsSet.has(directTwin.id)) {
        usedIds.add(directTwin.id);
        variantQuestions.push(directTwin);
        continue;
      }

      // 3. Otherwise find any question in the bank with the EXACT SAME lessonId, type, and level NOT in Đề 01
      const equivalentsNotInV1 = allBankQuestions.filter(
        (cand) =>
          !baseIdsSet.has(cand.id) &&
          !usedIds.has(cand.id) &&
          cand.lessonId === baseQ.lessonId &&
          cand.type === baseQ.type &&
          cand.level === baseQ.level
      );
      if (equivalentsNotInV1.length > 0) {
        const chosen = equivalentsNotInV1[(v - 2) % equivalentsNotInV1.length];
        usedIds.add(chosen.id);
        variantQuestions.push(chosen);
        continue;
      }

      // 4. Fallback: any question of the same lessonId and type not in Đề 01
      const sameLessonTypeNotInV1 = allBankQuestions.filter(
        (cand) =>
          !baseIdsSet.has(cand.id) &&
          !usedIds.has(cand.id) &&
          cand.lessonId === baseQ.lessonId &&
          cand.type === baseQ.type
      );
      const chosen =
        sameLessonTypeNotInV1.length > 0
          ? sameLessonTypeNotInV1[(v - 2) % sameLessonTypeNotInV1.length]
          : baseQ;
      usedIds.add(chosen.id);
      variantQuestions.push(chosen);
    }

    // Keep canonical lesson order in Variant 02 so Câu 1..12 in Variant 02 also match the Matrix & Specification table positions!
    const orderedVariantQs = sortQuestionsCanonically(variantQuestions);

    const optionOrders = {};
    for (const q of orderedVariantQs) {
      if (q.type === 'mcq' && q.options) {
        // Keep the distinct option order of q-docx-2XX or -v2 twins (which already have different correctOptionIndex), or shuffle for v >= 3
        if (v === 2 && (String(q.id).startsWith('q-docx-2') || String(q.id).endsWith('-v2'))) {
          optionOrders[q.id] = [0, 1, 2, 3];
        } else {
          optionOrders[q.id] = deterministicShuffle([0, 1, 2, 3], `opt-${code}-${q.id}`);
        }
      }
    }

    variants.push({
      paperCode: code,
      questionIds: orderedVariantQs.map((q) => q.id),
      optionOrders,
    });
  }

  return variants;
}

export function hydratePaperVariants(paperVariants, allBankQuestions) {
  const qMap = new Map(allBankQuestions.map((q) => [q.id, q]));
  return (paperVariants || []).map((v) => {
    const questions = (v.questionIds || [])
      .map((qid) => {
        const rawQ = qMap.get(qid);
        if (!rawQ) return null;
        const optOrder = v.optionOrders?.[qid] || [0, 1, 2, 3];
        const displayedOptions =
          rawQ.type === 'mcq' && Array.isArray(rawQ.options)
            ? optOrder.map((idx) => rawQ.options[idx])
            : undefined;
        const displayedCorrectIndex =
          rawQ.type === 'mcq'
            ? optOrder.indexOf(rawQ.correctOptionIndex ?? 0)
            : undefined;
        return {
          ...rawQ,
          displayedOptions,
          displayedCorrectLetter:
            typeof displayedCorrectIndex === 'number' && displayedCorrectIndex >= 0
              ? ['A', 'B', 'C', 'D'][displayedCorrectIndex]
              : 'A',
        };
      })
      .filter(Boolean);
    return {
      paperCode: v.paperCode,
      questions,
    };
  });
}

export function generateStudentUniquePaper(
  exam,
  student,
  allBankQuestions,
  existingSubmissionsForExam
) {
  const questionMap = new Map(allBankQuestions.map((q) => [q.id, q]));
  const baseQuestions = exam.questionIds
    .map((id) => questionMap.get(id))
    .filter(Boolean);

  const getQuestionPoints = (q) => {
    if (exam.category === '15min') return 1.0;
    if (exam.category === 'midterm' || exam.category === 'final') {
      if (q.type === 'mcq') return 0.25;
      if (q.type === 'true_false') return 1.0;
      if (q.type === 'short_answer') return 0.5;
      if (q.type === 'essay') return 1.0;
    }
    return q.points || Number((exam.totalPoints / Math.max(1, baseQuestions.length)).toFixed(2));
  };

  const existingSignatures = new Set(
    existingSubmissionsForExam.map((sub) => sub.paperSignature)
  );

  let attempt = 0;
  let snapshot = [];
  let signature = '';

  while (attempt < 20) {
    const seed = `${exam.id}-${student.id}-${student.username}-attempt-${attempt}`;
    const usedIds = new Set();
    const chosenQuestions = [];

    for (let idx = 0; idx < baseQuestions.length; idx++) {
      const baseQ = baseQuestions[idx];
      const pool = allBankQuestions.filter(
        (cand) =>
          !usedIds.has(cand.id) &&
          cand.lessonId === baseQ.lessonId &&
          cand.type === baseQ.type &&
          cand.level === baseQ.level
      );
      const shuffledPool = deterministicShuffle(
        pool.length > 0 ? pool : [baseQ],
        `${seed}-slot-${idx}`
      );
      const picked = shuffledPool[0] || baseQ;
      usedIds.add(picked.id);
      chosenQuestions.push(picked);
    }

    const mcqList = deterministicShuffle(
      chosenQuestions.filter((q) => q.type === 'mcq'),
      `${seed}-mcq-order`
    );
    const tfList = deterministicShuffle(
      chosenQuestions.filter((q) => q.type === 'true_false'),
      `${seed}-tf-order`
    );
    const saList = deterministicShuffle(
      chosenQuestions.filter((q) => q.type === 'short_answer'),
      `${seed}-sa-order`
    );
    const essayList = deterministicShuffle(
      chosenQuestions.filter((q) => q.type === 'essay'),
      `${seed}-essay-order`
    );

    const combined = [...mcqList, ...tfList, ...saList, ...essayList];

    snapshot = combined.map((q, orderIdx) => {
      const pts = getQuestionPoints(q);
      const item = {
        questionId: q.id,
        orderIndex: orderIdx + 1,
        type: q.type,
        level: q.level,
        lessonId: q.lessonId,
        points: pts,
        prompt: q.prompt,
      };

      if (q.type === 'mcq' && Array.isArray(q.options)) {
        const origIndices = deterministicShuffle([0, 1, 2, 3], `${seed}-opt-${q.id}-${orderIdx}`);
        item.originalOptionIndices = origIndices;
        item.shuffledOptions = origIndices.map((i) => q.options[i]);
      } else if (q.type === 'true_false' && Array.isArray(q.statements)) {
        item.statements = q.statements.map((st) => ({
          id: st.id,
          text: st.text,
        }));
      } else if (q.type === 'essay' && Array.isArray(q.rubricSteps)) {
        item.rubricSteps = q.rubricSteps.map((st) => ({
          id: st.id,
          description: `Bước chấm (${st.points} điểm)`,
          points: st.points,
        }));
      }

      return item;
    });

    const sigRaw = snapshot
      .map((s) => `${s.questionId}:${(s.originalOptionIndices || []).join('')}`)
      .join('|');
    signature = computeSimpleSignature(sigRaw);

    if (!existingSignatures.has(signature)) {
      break;
    }
    attempt += 1;
  }

  const paperCode = `MĐ-${(student.className || '9A').replace(/\s+/g, '')}-${signature.slice(0, 4)}`;
  return { paperCode, paperSignature: signature, paperSnapshot: snapshot };
}

export function gradeSubmissionAutomatically(paperSnapshot, rawAnswers, allBankQuestions) {
  const questionMap = new Map(allBankQuestions.map((q) => [q.id, q]));
  const gradedAnswers = {};
  let autoGradedScore = 0;
  let manualGradedScore = 0;
  let hasPendingManual = false;

  for (const snapQ of paperSnapshot) {
    const bankQ = questionMap.get(snapQ.questionId);
    const ansInput = (rawAnswers && rawAnswers[snapQ.questionId]) || {};
    const maxPoints = snapQ.points;

    const detail = {
      questionId: snapQ.questionId,
      type: snapQ.type,
      maxPoints,
      selectedShuffledIndex:
        typeof ansInput.selectedShuffledIndex === 'number'
          ? ansInput.selectedShuffledIndex
          : undefined,
      trueFalseAnswers: ansInput.trueFalseAnswers || undefined,
      textAnswer: typeof ansInput.textAnswer === 'string' ? ansInput.textAnswer : '',
      autoScore: 0,
      manualScore: undefined,
      finalScore: 0,
      isCorrect: false,
      trueFalseCorrectCount: undefined,
      needsManualGrading: false,
      gradedByTeacher: false,
      checkedRubricStepIds: [],
      teacherComment: '',
      timeSpentSeconds: Number(ansInput.timeSpentSeconds || 0),
    };

    if (!bankQ) {
      gradedAnswers[snapQ.questionId] = detail;
      continue;
    }

    if (snapQ.type === 'mcq') {
      if (
        typeof detail.selectedShuffledIndex === 'number' &&
        Array.isArray(snapQ.originalOptionIndices)
      ) {
        const origIdx = snapQ.originalOptionIndices[detail.selectedShuffledIndex];
        detail.selectedOriginalIndex = origIdx;
        if (origIdx === bankQ.correctOptionIndex) {
          detail.isCorrect = true;
          detail.autoScore = maxPoints;
          detail.finalScore = maxPoints;
        }
      }
      autoGradedScore += detail.autoScore;
    } else if (snapQ.type === 'true_false') {
      let correctStatements = 0;
      const tfAns = detail.trueFalseAnswers || {};
      if (Array.isArray(bankQ.statements)) {
        for (const st of bankQ.statements) {
          if (typeof tfAns[st.id] === 'boolean' && tfAns[st.id] === st.isTrue) {
            correctStatements += 1;
          }
        }
      }
      detail.trueFalseCorrectCount = correctStatements;
      detail.isCorrect = correctStatements === 4;
      detail.autoScore = calculateTrueFalseScore(correctStatements, maxPoints);
      detail.finalScore = detail.autoScore;
      autoGradedScore += detail.autoScore;
    } else if (snapQ.type === 'short_answer') {
      const normalizedStudent = normalizeAnswerText(detail.textAnswer);
      const acceptedList = (bankQ.acceptedAnswers || []).map((a) => normalizeAnswerText(a));
      if (normalizedStudent && acceptedList.includes(normalizedStudent)) {
        detail.isCorrect = true;
        detail.autoScore = maxPoints;
        detail.finalScore = maxPoints;
        detail.needsManualGrading = false;
        autoGradedScore += detail.autoScore;
      } else if (normalizedStudent.length > 0) {
        detail.isCorrect = false;
        detail.autoScore = 0;
        detail.finalScore = 0;
        detail.needsManualGrading = true;
        hasPendingManual = true;
      } else {
        detail.isCorrect = false;
        detail.autoScore = 0;
        detail.finalScore = 0;
        detail.needsManualGrading = false;
      }
    } else if (snapQ.type === 'essay') {
      detail.autoScore = 0;
      detail.finalScore = 0;
      detail.needsManualGrading = true;
      hasPendingManual = true;
    }

    gradedAnswers[snapQ.questionId] = detail;
  }

  autoGradedScore = Number(autoGradedScore.toFixed(2));
  const totalScore = Number((autoGradedScore + manualGradedScore).toFixed(2));
  const status = hasPendingManual ? 'submitted_pending_grading' : 'finalized';

  return {
    gradedAnswers,
    autoGradedScore,
    manualGradedScore,
    totalScore,
    status,
  };
}
