import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical,
  Play,
  Pause,
  RotateCcw,
  Eye,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Zap,
  Sliders,
  ExternalLink,
  Sparkles,
  Maximize2,
  CheckSquare,
  Square,
  Compass,
  Layers,
  Thermometer,
} from 'lucide-react';
import { LessonItem, SubjectPillar, ExperimentVideo } from '../../types/domainTypes';

interface InteractiveVirtualLabProps {
  lesson: LessonItem;
  subject: SubjectPillar;
  experimentData?: ExperimentVideo;
}

export const InteractiveVirtualLab: React.FC<InteractiveVirtualLabProps> = ({
  lesson,
  subject,
  experimentData,
}) => {
  // Common Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [simStep, setSimStep] = useState(1); // 1: Chuẩn bị, 2: Tiến hành, 3: Phản ứng/Đo lường, 4: Kết luận
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  // Chemistry State
  const [burnerActive, setBurnerActive] = useState(false);
  const [reagentAdded, setReagentAdded] = useState(false);
  const [reactionProgress, setReactionProgress] = useState(0); // 0 to 100%

  // Physics State
  // Optics: Angle of incidence
  const [incidentAngle, setIncidentAngle] = useState(35); // 0 - 80 degrees
  // Energy / Mechanics: height or time
  const [pendulumAngle, setPendulumAngle] = useState(45);
  // Electricity: Voltage and Resistance
  const [voltage, setVoltage] = useState(6); // 1 - 12V
  const [resistance, setResistance] = useState(10); // 5 - 50 Ohm
  const [circuitClosed, setCircuitClosed] = useState(false);

  // Biology State
  const [magnification, setMagnification] = useState<'10x' | '40x' | '100x'>('40x');
  const [focusLevel, setFocusLevel] = useState(85); // 0 - 100% (ideal focus is 80-95%)
  const [stainApplied, setStainApplied] = useState(true);

  // Reset simulation when lesson changes
  useEffect(() => {
    setIsPlaying(false);
    setSimStep(1);
    setCheckedSteps({});
    setBurnerActive(false);
    setReagentAdded(false);
    setReactionProgress(0);
    setCircuitClosed(false);
  }, [lesson.id]);

  // Animation ticker for Chemistry / Mechanics
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setReactionProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            setSimStep(4);
            return 100;
          }
          const next = prev + 5;
          if (next >= 40 && simStep < 2) setSimStep(2);
          if (next >= 75 && simStep < 3) setSimStep(3);
          return next;
        });

        // Oscillation for pendulum if physics
        setPendulumAngle((prev) => (prev > 0 ? -Math.abs(prev * 0.96) : Math.abs(prev * 0.96)));
      }, 150);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, simStep]);

  const handleStartSim = () => {
    setIsPlaying(true);
    if (subject === 'hoa_hoc') {
      setBurnerActive(true);
      setReagentAdded(true);
    }
    if (subject === 'vat_li') {
      setCircuitClosed(true);
    }
  };

  const handlePauseSim = () => {
    setIsPlaying(false);
  };

  const handleResetSim = () => {
    setIsPlaying(false);
    setSimStep(1);
    setReactionProgress(0);
    setBurnerActive(false);
    setReagentAdded(false);
    setCircuitClosed(false);
    setPendulumAngle(45);
    setIncidentAngle(35);
  };

  const toggleStepCheck = (index: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Determine physics experiment variant based on lesson title
  const titleLower = lesson.title.toLowerCase();
  const isOptics =
    titleLower.includes('khúc xạ') ||
    titleLower.includes('phản xạ') ||
    titleLower.includes('thấu kính') ||
    titleLower.includes('ánh sáng') ||
    titleLower.includes('mắt');
  const isElectricity =
    titleLower.includes('điện') ||
    titleLower.includes('ohm') ||
    titleLower.includes('mạch') ||
    titleLower.includes('dòng điện') ||
    titleLower.includes('công suất điện') ||
    titleLower.includes('từ trường');

  // External YouTube Search URL (Clean, official search query with no iframe 153 error)
  const searchQuery = encodeURIComponent(
    `Thí nghiệm ${lesson.title} KHTN ${lesson.grade || 9} Kết nối tri thức`
  );
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;

  // -------------------------------------------------------------
  // SIMULATION CANVAS RENDERERS
  // -------------------------------------------------------------

  // 1. CHEMISTRY SIMULATION CANVAS
  const renderChemistryCanvas = () => {
    // Liquid color interpolates based on reactionProgress
    const liquidColor =
      reactionProgress > 70
        ? '#059669' // Emerald completion
        : reactionProgress > 30
        ? '#3b82f6' // Blue mid reaction
        : '#93c5fd'; // Light blue initial

    return (
      <div className="relative w-full h-72 sm:h-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 rounded-2xl overflow-hidden flex flex-col justify-between p-4 border border-slate-700 shadow-inner">
        {/* Lab Background Grid */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Info Bar */}
        <div className="relative z-10 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" />
              Thí nghiệm Hoá học Mô phỏng
            </span>
            <span className="text-slate-400">Nhiệt độ: {burnerActive ? '85°C' : '25°C'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-300">Tiến trình phản ứng:</span>
            <span className="font-mono font-bold text-amber-400">{reactionProgress}%</span>
          </div>
        </div>

        {/* Center SVG Laboratory Apparatus */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <svg className="w-64 h-52 overflow-visible" viewBox="0 0 240 200">
            {/* Iron Stand Base & Rod */}
            <rect x="20" y="180" width="100" height="10" rx="3" fill="#64748b" />
            <rect x="40" y="30" width="8" height="150" rx="2" fill="#94a3b8" />
            {/* Iron Clamp */}
            <rect x="44" y="60" width="45" height="6" rx="2" fill="#cbd5e1" />
            <circle cx="89" cy="63" r="5" fill="#475569" />

            {/* Test Tube on Clamp */}
            <g transform="translate(75, 40)">
              {/* Test Tube Body */}
              <rect
                x="0"
                y="0"
                width="28"
                height="85"
                rx="0"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="2.5"
                opacity="0.85"
              />
              <path
                d="M0,85 C0,99 28,99 28,85"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="2.5"
                opacity="0.85"
              />

              {/* Liquid inside test tube */}
              <rect
                x="2"
                y={reagentAdded ? '40' : '65'}
                width="24"
                height={reagentAdded ? '45' : '20'}
                fill={liquidColor}
                opacity="0.75"
                className="transition-all duration-700"
              />
              <path
                d="M2,85 C2,97 26,97 26,85"
                fill={liquidColor}
                opacity="0.75"
                className="transition-all duration-700"
              />

              {/* Bubbles if burner active and progress > 10% */}
              {burnerActive && reactionProgress > 10 && (
                <g className="animate-pulse">
                  <circle cx="8" cy="75" r="2" fill="#ffffff" opacity="0.8" />
                  <circle cx="16" cy="60" r="2.5" fill="#ffffff" opacity="0.8" />
                  <circle cx="12" cy="45" r="1.5" fill="#ffffff" opacity="0.9" />
                  <circle cx="20" cy="70" r="2" fill="#ffffff" opacity="0.7" />
                </g>
              )}

              {/* Precipitate layer if reactionProgress > 60% */}
              {reactionProgress > 60 && (
                <path
                  d="M2,87 C4,96 24,96 26,87"
                  fill="#f8fafc"
                  opacity="0.9"
                  className="transition-opacity duration-500"
                />
              )}

              {/* Vapor rising from tube */}
              {burnerActive && (
                <path
                  d="M10,-5 Q15,-15 10,-25 Q5,-35 12,-45"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  opacity="0.6"
                  className="animate-pulse"
                />
              )}
            </g>

            {/* Spirit Burner Under Test Tube */}
            <g transform="translate(70, 140)">
              {/* Glass body of burner */}
              <rect x="3" y="20" width="34" height="25" rx="6" fill="#38bdf8" opacity="0.3" />
              <rect
                x="3"
                y="20"
                width="34"
                height="25"
                rx="6"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
              />
              {/* Metal Wick collar */}
              <rect x="14" y="14" width="12" height="6" rx="1" fill="#f59e0b" />
              {/* Wick */}
              <rect x="18" y="8" width="4" height="6" fill="#78350f" />

              {/* Flame if burnerActive */}
              {burnerActive ? (
                <path
                  d="M20,-6 C14,2 14,8 20,8 C26,8 26,2 20,-6 Z"
                  fill="#f97316"
                  className="animate-bounce"
                  style={{ animationDuration: '0.4s' }}
                />
              ) : null}
            </g>
          </svg>
        </div>

        {/* Bottom Interactive Reagent & Thermal Controls */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBurnerActive(!burnerActive)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                burnerActive
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{burnerActive ? 'Tắt đèn cồn' : 'Đốt đèn cồn'}</span>
            </button>

            <button
              onClick={() => {
                setReagentAdded(true);
                setReactionProgress((prev) => Math.min(prev + 25, 100));
              }}
              className="px-3 py-1.5 rounded-lg font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nhỏ hoá chất</span>
            </button>
          </div>

          <div className="text-slate-400 text-[11px] italic">
            {reactionProgress === 100
              ? '✅ Phản ứng đã hoàn tất, kết tủa và khí đã thoát hết.'
              : reactionProgress > 0
              ? '⏳ Đang quan sát phản ứng hoá học biến đổi màu sắc...'
              : '👉 Bấm "Tiến hành thí nghiệm" hoặc nhỏ hoá chất để bắt đầu.'}
          </div>
        </div>
      </div>
    );
  };

  // 2. PHYSICS SIMULATION CANVAS (Optics OR Circuit OR Mechanics)
  const renderPhysicsCanvas = () => {
    if (isOptics) {
      // Snell's Law calculation: n1 = 1 (air), n2 = 1.5 (glass)
      const radI = (incidentAngle * Math.PI) / 180;
      const n1 = 1.0;
      const n2 = 1.5;
      const sinR = (n1 * Math.sin(radI)) / n2;
      const radR = Math.asin(Math.min(1, Math.max(0, sinR)));
      const degR = Math.round((radR * 180) / Math.PI);

      // Ray coordinates on center (cx=120, cy=90)
      const cx = 120;
      const cy = 90;
      const rayLen = 70;
      const ix = cx - rayLen * Math.sin(radI);
      const iy = cy - rayLen * Math.cos(radI);

      // Refracted ray into glass (downwards)
      const rx = cx + rayLen * Math.sin(radR);
      const ry = cy + rayLen * Math.cos(radR);

      return (
        <div className="relative w-full h-72 sm:h-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 rounded-2xl overflow-hidden flex flex-col justify-between p-4 border border-slate-700 shadow-inner">
          <div className="relative z-10 flex items-center justify-between gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Quang học: Khúc xạ & Phản xạ Ánh sáng
            </span>
            <div className="flex items-center gap-3 text-slate-300">
              <span>
                Góc tới <strong className="text-amber-400">i = {incidentAngle}°</strong>
              </span>
              <span>
                Góc khúc xạ <strong className="text-emerald-400">r = {degR}°</strong>
              </span>
            </div>
          </div>

          {/* Optical Bench Diagram */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <svg className="w-64 h-52 overflow-visible" viewBox="0 0 240 180">
              {/* Semicircular glass block in bottom half */}
              <path
                d="M 50,90 A 70,70 0 0,0 190,90 Z"
                fill="#38bdf8"
                opacity="0.25"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              <text x="60" y="115" fill="#94a3b8" fontSize="10" fontWeight="bold">
                Khối thuỷ tinh (n = 1.5)
              </text>
              <text x="60" y="70" fill="#94a3b8" fontSize="10">
                Không khí (n = 1.0)
              </text>

              {/* Interface Surface line */}
              <line
                x1="20"
                y1="90"
                x2="220"
                y2="90"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />

              {/* Normal Line (Pháp tuyến NN') */}
              <line
                x1="120"
                y1="20"
                x2="120"
                y2="160"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <text x="125" y="30" fill="#cbd5e1" fontSize="10" fontStyle="italic">
                N
              </text>
              <text x="125" y="160" fill="#cbd5e1" fontSize="10" fontStyle="italic">
                N'
              </text>

              {/* Incident Ray (Tia tới SI - Red Laser) */}
              <line
                x1={ix}
                y1={iy}
                x2={cx}
                y2={cy}
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx={ix} cy={iy} r="4" fill="#ef4444" />
              <text x={ix - 15} y={iy} fill="#ef4444" fontSize="11" fontWeight="bold">
                S
              </text>
              <text x={cx + 5} y={cy - 5} fill="#f59e0b" fontSize="11" fontWeight="bold">
                I
              </text>

              {/* Refracted Ray (Tia khúc xạ IR - Emerald Green) */}
              <line
                x1={cx}
                y1={cy}
                x2={rx}
                y2={ry}
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx={rx} cy={ry} r="3" fill="#10b981" />
              <text x={rx + 5} y={ry + 5} fill="#10b981" fontSize="11" fontWeight="bold">
                K
              </text>

              {/* Angle Arc for i */}
              <path
                d={`M 120,65 A 25,25 0 0,0 ${120 - 25 * Math.sin(radI)},${
                  90 - 25 * Math.cos(radI)
                }`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* Optics Slider Control */}
          <div className="relative z-10 flex items-center justify-between gap-4 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2 flex-1">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 font-semibold whitespace-nowrap">
                Chỉnh góc tới i:
              </span>
              <input
                type="range"
                min="0"
                max="80"
                value={incidentAngle}
                onChange={(e) => setIncidentAngle(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-amber-400 w-8">{incidentAngle}°</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Định luật Snell: <em>n₁·sin(i) = n₂·sin(r)</em>
            </span>
          </div>
        </div>
      );
    }

    if (isElectricity) {
      // Ohm's law: I = U / R
      const currentAmp = circuitClosed ? Number((voltage / resistance).toFixed(2)) : 0;
      const bulbBrightness = circuitClosed ? Math.min(1, currentAmp / 1.2) : 0;

      return (
        <div className="relative w-full h-72 sm:h-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 rounded-2xl overflow-hidden flex flex-col justify-between p-4 border border-slate-700 shadow-inner">
          <div className="relative z-10 flex items-center justify-between gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Mô phỏng Mạch điện & Định luật Ohm
            </span>
            <div className="flex items-center gap-3 text-slate-300">
              <span>
                Cường độ: <strong className="text-amber-400 font-mono">{currentAmp} A</strong>
              </span>
              <span>
                Điện áp: <strong className="text-cyan-400 font-mono">{voltage} V</strong>
              </span>
            </div>
          </div>

          {/* Circuit Canvas */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <svg className="w-64 h-52 overflow-visible" viewBox="0 0 240 160">
              {/* Circuit wire loop */}
              <rect
                x="30"
                y="30"
                width="180"
                height="100"
                fill="none"
                stroke={circuitClosed ? '#38bdf8' : '#64748b'}
                strokeWidth="3"
                rx="6"
              />

              {/* Battery on top wire */}
              <g transform="translate(100, 20)">
                <rect x="0" y="5" width="40" height="18" fill="#1e293b" stroke="#94a3b8" />
                <rect x="36" y="9" width="4" height="10" fill="#f59e0b" />
                <text x="10" y="18" fill="#f8fafc" fontSize="9" fontWeight="bold">
                  {voltage}V
                </text>
              </g>

              {/* Switch on right wire */}
              <g transform="translate(200, 60)">
                <circle cx="10" cy="5" r="3" fill="#cbd5e1" />
                <circle cx="10" cy="35" r="3" fill="#cbd5e1" />
                <line
                  x1="10"
                  y1="5"
                  x2={circuitClosed ? 10 : 22}
                  y2={circuitClosed ? 35 : 25}
                  stroke="#ef4444"
                  strokeWidth="3"
                />
              </g>

              {/* Light Bulb on bottom wire */}
              <g transform="translate(105, 115)">
                <circle
                  cx="15"
                  cy="15"
                  r="14"
                  fill={
                    circuitClosed
                      ? `rgba(250, 204, 21, ${0.3 + bulbBrightness * 0.7})`
                      : '#334155'
                  }
                  stroke="#facc15"
                  strokeWidth="2"
                />
                <path
                  d="M10,18 L15,10 L20,18"
                  fill="none"
                  stroke={circuitClosed ? '#ffffff' : '#94a3b8'}
                  strokeWidth="1.5"
                />
                {circuitClosed && (
                  <circle
                    cx="15"
                    cy="15"
                    r="22"
                    fill="none"
                    stroke="#fde047"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                    className="animate-spin"
                    style={{ animationDuration: '6s' }}
                  />
                )}
              </g>

              {/* Ammeter symbol on left wire */}
              <g transform="translate(15, 65)">
                <circle cx="15" cy="15" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                <text
                  x="10"
                  y="19"
                  fill="#38bdf8"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  A
                </text>
              </g>
            </svg>
          </div>

          {/* Circuit Controls */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
            <button
              onClick={() => setCircuitClosed(!circuitClosed)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                circuitClosed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white hover:bg-rose-500'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{circuitClosed ? 'Ngắt công tắc' : 'Đóng công tắc (K)'}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Điện trở R:</span>
              <input
                type="range"
                min="5"
                max="30"
                value={resistance}
                onChange={(e) => setResistance(Number(e.target.value))}
                className="w-24 accent-cyan-500"
              />
              <span className="font-mono text-cyan-300 w-10">{resistance}Ω</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Hiệu điện thế U:</span>
              <input
                type="range"
                min="2"
                max="12"
                value={voltage}
                onChange={(e) => setVoltage(Number(e.target.value))}
                className="w-20 accent-amber-500"
              />
              <span className="font-mono text-amber-300 w-8">{voltage}V</span>
            </div>
          </div>
        </div>
      );
    }

    // Default Physics: Kinetic & Potential Energy (Con lắc & Động năng thế năng)
    return (
      <div className="relative w-full h-72 sm:h-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 rounded-2xl overflow-hidden flex flex-col justify-between p-4 border border-slate-700 shadow-inner">
        <div className="relative z-10 flex items-center justify-between gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            Mô phỏng Động năng, Thế năng & Cơ năng
          </span>
          <div className="flex items-center gap-3 text-slate-300 font-mono text-[11px]">
            <span className="text-amber-400">
              Wđ = {Math.round(50 * (1 - Math.abs(pendulumAngle) / 45))} J
            </span>
            <span className="text-cyan-400">
              Wt = {Math.round(50 * (Math.abs(pendulumAngle) / 45))} J
            </span>
            <span className="text-emerald-400 font-bold">W = 50 J (Bảo toàn)</span>
          </div>
        </div>

        {/* Pendulum Animation Canvas */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <svg className="w-64 h-52 overflow-visible" viewBox="0 0 240 180">
            {/* Ceiling mount */}
            <rect x="70" y="10" width="100" height="8" rx="2" fill="#64748b" />
            <circle cx="120" cy="18" r="4" fill="#cbd5e1" />

            {/* Pendulum Cord & Bob */}
            {(() => {
              const rad = (pendulumAngle * Math.PI) / 180;
              const bobX = 120 + 90 * Math.sin(rad);
              const bobY = 18 + 90 * Math.cos(rad);
              return (
                <g>
                  <line
                    x1="120"
                    y1="18"
                    x2={bobX}
                    y2={bobY}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray={isPlaying ? 'none' : '3 2'}
                  />
                  <circle
                    cx={bobX}
                    cy={bobY}
                    r="12"
                    fill="url(#bobGrad)"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                  {/* Energy Bars attached to Bob */}
                  <rect
                    x={bobX + 16}
                    y={bobY - 14}
                    width="6"
                    height={Math.max(2, 28 * (1 - Math.abs(pendulumAngle) / 45))}
                    fill="#f59e0b"
                    rx="1"
                  />
                  <rect
                    x={bobX + 24}
                    y={bobY - 14}
                    width="6"
                    height={Math.max(2, 28 * (Math.abs(pendulumAngle) / 45))}
                    fill="#06b6d4"
                    rx="1"
                  />
                </g>
              );
            })()}

            {/* Trajectory arc */}
            <path
              d="M 56,82 A 90,90 0 0,0 184,82"
              fill="none"
              stroke="#334155"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            <defs>
              <radialGradient id="bobGrad" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0369a1" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Mechanics Controls */}
        <div className="relative z-10 flex items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                isPlaying ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Tạm dừng dao động' : 'Kích hoạt dao động'}</span>
            </button>
            <button
              onClick={handleResetSim}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            Ở vị trí biên: <span className="text-cyan-400">Wt cực đại, Wđ = 0</span>. Ở vị trí cân
            bằng: <span className="text-amber-400">Wđ cực đại, Wt = 0</span>.
          </div>
        </div>
      </div>
    );
  };

  // 3. BIOLOGY SIMULATION CANVAS (Microscope & Specimen Inspection)
  const renderBiologyCanvas = () => {
    // Focus blur filter
    const blurAmount = Math.abs(focusLevel - 88) * 0.15; // 0 at focusLevel=88

    return (
      <div className="relative w-full h-72 sm:h-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 rounded-2xl overflow-hidden flex flex-col justify-between p-4 border border-slate-700 shadow-inner">
        <div className="relative z-10 flex items-center justify-between gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Thị kính Kính hiển vi Quang học
          </span>
          <div className="flex items-center gap-3 text-slate-300">
            <span>
              Độ phóng đại: <strong className="text-emerald-400 font-bold">{magnification}</strong>
            </span>
            <span>
              Tiêu cự:{' '}
              <strong
                className={`font-bold ${
                  blurAmount < 1 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {blurAmount < 1 ? 'Rõ nét' : 'Mờ'}
              </strong>
            </span>
          </div>
        </div>

        {/* Microscope Viewport Circular Display */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="relative w-48 h-48 rounded-full border-4 border-slate-600 bg-emerald-950/80 overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Specimen Cellular Pattern */}
            <svg
              className="w-full h-full"
              viewBox="0 0 160 160"
              style={{ filter: `blur(${blurAmount}px)` }}
            >
              {/* Plant Onion Epidermal / Chloroplast cells grid */}
              <g stroke="#34d399" strokeWidth="1.5" fill="#065f46" opacity="0.85">
                {/* Row 1 */}
                <rect x="10" y="20" width="65" height="35" rx="4" />
                <circle cx="42" cy="37" r="5" fill="#10b981" /> {/* Nucleus */}
                <circle cx="30" cy="30" r="2.5" fill="#6ee7b7" /> {/* Chloroplast */}
                <circle cx="55" cy="40" r="2.5" fill="#6ee7b7" />
                <rect x="80" y="20" width="70" height="35" rx="4" />
                <circle cx="115" cy="37" r="5" fill="#10b981" />
                {/* Row 2 */}
                <rect x="5" y="60" width="70" height="40" rx="4" />
                <circle cx="40" cy="80" r="6" fill="#10b981" />
                <circle cx="20" cy="75" r="3" fill="#6ee7b7" />
                <circle cx="58" cy="85" r="2.5" fill="#6ee7b7" />
                <rect x="80" y="60" width="75" height="40" rx="4" />
                <circle cx="118" cy="80" r="6" fill="#10b981" />
                {/* Row 3 */}
                <rect x="15" y="105" width="60" height="35" rx="4" />
                <circle cx="45" cy="122" r="5" fill="#10b981" />
                <rect x="80" y="105" width="65" height="35" rx="4" />
                <circle cx="112" cy="122" r="5" fill="#10b981" />
              </g>

              {/* Crosshair target in microscope */}
              <line
                x1="0"
                y1="80"
                x2="160"
                y2="80"
                stroke="#6ee7b7"
                strokeWidth="0.5"
                strokeDasharray="2 2"
                opacity="0.4"
              />
              <line
                x1="80"
                y1="0"
                x2="80"
                y2="160"
                stroke="#6ee7b7"
                strokeWidth="0.5"
                strokeDasharray="2 2"
                opacity="0.4"
              />
            </svg>

            {/* Specimen label overlay */}
            <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
              <span className="px-2 py-0.5 rounded-full bg-slate-900/80 text-[10px] text-emerald-300 font-mono">
                Tế bào thực vật (Nhân & Lục lạp)
              </span>
            </div>
          </div>
        </div>

        {/* Microscope Adjustment Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Vật kính:</span>
            {(['10x', '40x', '100x'] as const).map((mag) => (
              <button
                key={mag}
                onClick={() => setMagnification(mag)}
                className={`px-2.5 py-1 rounded-md font-bold text-xs transition-colors ${
                  magnification === mag
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {mag}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Ốc vi cấp (Lấy nét):</span>
            <input
              type="range"
              min="50"
              max="120"
              value={focusLevel}
              onChange={(e) => setFocusLevel(Number(e.target.value))}
              className="w-28 accent-emerald-500"
            />
          </div>
        </div>
      </div>
    );
  };

  // 4. GENERAL SCIENCE / INTRODUCTION CANVAS (Mở đầu / Dụng cụ đo)
  const renderGeneralCanvas = () => {
    return (
      <div className="relative w-full h-72 sm:h-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 rounded-2xl overflow-hidden flex flex-col justify-between p-4 border border-slate-700 shadow-inner">
        <div className="relative z-10 flex items-center justify-between gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30 flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5" />
            Dụng cụ đo lường & An toàn Phòng thí nghiệm
          </span>
          <span className="text-slate-300 text-xs">Cân điện tử & Ống đong chuẩn</span>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <svg className="w-64 h-52 overflow-visible" viewBox="0 0 240 180">
            {/* Electronic Analytical Balance */}
            <g transform="translate(30, 70)">
              <rect x="0" y="40" width="90" height="35" rx="6" fill="#334155" stroke="#64748b" />
              {/* LCD Display */}
              <rect x="20" y="52" width="50" height="16" rx="2" fill="#0f172a" />
              <text
                x="26"
                y="64"
                fill="#38bdf8"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
              >
                25.40 g
              </text>
              {/* Pan */}
              <rect x="15" y="32" width="60" height="8" rx="2" fill="#94a3b8" />
              {/* Sample on Pan */}
              <circle cx="45" cy="24" r="8" fill="#f59e0b" opacity="0.9" />
            </g>

            {/* Graduated Cylinder on right */}
            <g transform="translate(145, 30)">
              <rect
                x="15"
                y="0"
                width="25"
                height="110"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                rx="3"
              />
              {/* Liquid */}
              <rect x="17" y="45" width="21" height="63" fill="#38bdf8" opacity="0.6" rx="1" />
              {/* Meniscus curve */}
              <path d="M17,45 Q27,48 38,45" fill="none" stroke="#0284c7" strokeWidth="2" />
              {/* Scale marks */}
              <line x1="15" y1="20" x2="22" y2="20" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="15" y1="40" x2="25" y2="40" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="15" y1="60" x2="22" y2="60" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="15" y1="80" x2="25" y2="80" stroke="#cbd5e1" strokeWidth="1.5" />
              <text x="44" y="45" fill="#38bdf8" fontSize="9" fontWeight="bold">
                50 mL
              </text>
            </g>
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs text-slate-300">
          <span>Quy tắc: Đặt mắt ngang bằng với đáy của mặt khum chất lỏng để đọc thể tích chính xác.</span>
        </div>
      </div>
    );
  };

  const stepsList = experimentData?.steps || [
    `Bước 1: Chuẩn bị đầy đủ dụng cụ, trang thiết bị và mẫu vật thí nghiệm cho bài học ${lesson.title}.`,
    'Bước 2: Bố trí và lắp đặt hệ thống theo sơ đồ chỉ dẫn kỹ thuật SGK KHTN, kiểm tra an toàn trước khi vận hành.',
    'Bước 3: Kích hoạt phản ứng hoặc tiến hành thao tác đo lường, theo dõi sát sao sự biến đổi trạng thái.',
    'Bước 4: Thu thập số liệu thực nghiệm, đối chiếu với lý thuyết và vệ sinh bảo quản trang thiết bị.',
  ];

  return (
    <div className="space-y-6">
      {/* 1. Main Interactive Simulation Stage */}
      <div className="space-y-3">
        {subject === 'hoa_hoc' && renderChemistryCanvas()}
        {subject === 'vat_li' && renderPhysicsCanvas()}
        {subject === 'sinh_hoc' && renderBiologyCanvas()}
        {subject === 'mo_dau' && renderGeneralCanvas()}

        {/* Global Simulation Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={handleStartSim}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Tiến hành thí nghiệm</span>
              </button>
            ) : (
              <button
                onClick={handlePauseSim}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Tạm dừng</span>
              </button>
            )}

            <button
              onClick={handleResetSim}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Làm lại từ đầu</span>
            </button>
          </div>

          {/* Safe External Video Link (Zero-Error Guarantee) */}
          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all shadow-xs"
            title="Mở video thí nghiệm thực tế trên YouTube chất lượng cao trong tab mới"
          >
            <ExternalLink className="w-3.5 h-3.5 text-rose-600" />
            <span>Xem video thực nghiệm bài học trên YouTube</span>
          </a>
        </div>
      </div>

      {/* 2. Experiment Details Header */}
      <div className="space-y-1">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
          {experimentData?.title || `Thí nghiệm thực hành: ${lesson.title}`}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {experimentData?.description ||
            `Mô phỏng và quy trình thực nghiệm chuẩn theo sách giáo khoa Kết nối tri thức với cuộc sống, giúp học sinh quan sát trực quan bản chất quy luật tự nhiên.`}
        </p>
      </div>

      {/* 3. Four Core Technical Educational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Step Checklist */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="font-bold text-slate-900 flex items-center justify-between gap-1.5">
            <span className="flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-[#0D6E6E]" />
              <span>Quy trình các bước tiến hành:</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              (Tích chọn bước đã nắm vững)
            </span>
          </div>

          <div className="space-y-2">
            {stepsList.map((st, sIdx) => {
              const isChecked = checkedSteps[sIdx];
              return (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => toggleStepCheck(sIdx)}
                  className={`w-full text-left p-2 rounded-lg border text-xs transition-colors flex items-start gap-2.5 ${
                    isChecked
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  <span className="mt-0.5 flex-shrink-0 text-[#0D6E6E]">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </span>
                  <span className="leading-relaxed">{st}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Phenomenon Observation */}
        <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
          <div className="font-bold text-sky-900 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-sky-600" />
            <span>Hiện tượng thực nghiệm quan sát được:</span>
          </div>
          <p className="text-sky-950 leading-relaxed">
            {experimentData?.phenomenon ||
              `Quan sát thấy rõ các tín hiệu biến đổi đặc trưng của bài học ${lesson.title}: sự đổi màu dung dịch/chỉ thị, sinh khí, xuất hiện kết tủa hoặc các đại lượng động lực học, quang học, điện học biến đổi đúng theo quy luật tự nhiên.`}
          </p>
        </div>

        {/* Scientific Conclusion */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Kết luận khoa học rút ra:</span>
          </div>
          <p className="text-emerald-950 leading-relaxed">
            {experimentData?.conclusion ||
              `Thực nghiệm khẳng định tính đúng đắn của các nguyên lí và định luật trong bài học ${lesson.title}, giúp học sinh khắc sâu kiến thức lý thuyết đã học.`}
          </p>
        </div>

        {/* Safety Notes */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
          <div className="font-bold text-amber-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Lưu ý an toàn phòng thí nghiệm:</span>
          </div>
          <p className="text-amber-950 leading-relaxed">
            {experimentData?.safetyNotes ||
              `Luôn đeo kính bảo hộ, găng tay khi tiếp xúc hoá chất; không nếm, ngửi trực tiếp; kiểm tra kỹ cách điện và ngắt nguồn khi đấu nối mạch điện; tuân thủ sự hướng dẫn của giáo viên.`}
          </p>
        </div>
      </div>
    </div>
  );
};
