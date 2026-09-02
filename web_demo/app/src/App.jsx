import { useState, useCallback, useEffect } from 'react';
import {
  Activity, ArrowRight, Check, CheckCircle2, ChevronRight,
  Clock, Copy, Cpu, Download,
  FileSpreadsheet, FileText, GitBranch, Hash, Laptop,
  LogIn, Play, Server, ShieldCheck, Terminal, Users,
  BookOpen, Eye, X, Pause,
  LineChart, Folder,
  CheckSquare
} from 'lucide-react';
import LiveRunner from './LiveRunner';
import IdeView from './IdeView';

// ─── Keyboard activation for clickable cards ───────────────────────────────────
const activateOnKey = (fn) => (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
};

// ─── Toast System ─────────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-slate-800 border border-slate-700 rounded-md shadow-2xl text-xs font-mono text-slate-100 min-w-72 animate-in fade-in slide-in-from-bottom-3"
        >
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss notification"
            className="text-slate-500 hover:text-slate-300 ml-1 transition-colors focus-visible:outline-2 focus-visible:outline-slate-400 focus-visible:outline-offset-2 rounded-sm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Global Navigation Bar ────────────────────────────────────────────────────
function GlobalHeader({ currentView, setCurrentView, role, setRole, addToast }) {
  const navItems = [
    { id: 'start',     label: 'Start AI' },
    { id: 'ide',       label: 'Web IDE' },
    { id: 'view',      label: 'View AI (Live)' },
    { id: 'portfolio', label: 'Portfolio (Ledger)' },
    { id: 'lms',       label: 'Faculty LMS' },
  ];

  return (
    <header className="h-14 bg-[#0B0F19]/95 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-40">
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2 group text-left focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 rounded-sm"
        >
          <div className="w-6 h-6 bg-slate-100 text-slate-950 font-mono font-bold text-xs rounded flex items-center justify-center select-none group-hover:bg-blue-400 transition-colors">
            P
          </div>
          <span className="text-sm font-bold text-slate-100 tracking-tight group-hover:text-blue-400 transition-colors">
            plAI-ground
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            v1.0.0-MVP
          </span>
        </button>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono border-l border-slate-800 pl-4 ml-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          ALL SYSTEMS OPERATIONAL
        </div>
      </div>

      {/* Main Navigation Items (HWPX Spec) */}
      <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-xs font-medium">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`px-3 py-1.5 rounded-sm transition-all ${
              currentView === item.id
                ? 'bg-slate-800 text-slate-100 border border-slate-700 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Role Switcher & Log-in CTAs */}
      <div className="flex items-center gap-2">
        {/* Role Toggle Selector (Admin vs General User) */}
        <div className="hidden md:flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-[11px] font-mono">
          <button
            onClick={() => {
              setRole('admin');
              addToast('Switched role to Admin (Faculty).');
            }}
            className={`px-2 py-1 rounded-sm transition-all ${
              role === 'admin'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => {
              setRole('user');
              addToast('Switched role to General User (Student).');
            }}
            className={`px-2 py-1 rounded-sm transition-all ${
              role === 'user'
                ? 'bg-slate-800 text-slate-200 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Student
          </button>
        </div>

        <button
          onClick={() => {
            setCurrentView('start');
            addToast('Logged in as ' + (role === 'admin' ? 'Faculty Admin' : 'Student User') + '. Redirected to Start AI page.');
          }}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs font-medium px-3 py-1.5 transition-all"
        >
          <LogIn className="w-3.5 h-3.5" />
          Log-in
        </button>
        <button
          onClick={() => setCurrentView('start')}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-sm border border-blue-500 transition-all shadow-none"
        >
          Start Workspace
        </button>
      </div>
    </header>
  );
}

// ─── Landing / Overview Page ──────────────────────────────────────────────────
function LandingView({ setCurrentView }) {
  const [demoState, setDemoState] = useState('idle');
  const [openFaq, setOpenFaq] = useState(null);

  const runDemo = () => {
    setDemoState('running');
    setTimeout(() => setDemoState('complete'), 1800);
  };

  const faqs = [
    {
      q: '기존 Google Colab 및 AWS와 무엇이 다른가요?',
      a: 'Colab은 세션 단절 및 에러 이력 보존이 불가능하지만, plAI-ground는 로컬/클라우드 세팅을 5분 만에 마치며 디버깅 과정 전체를 타임스탬프 검증 포트폴리오로 자동 변환합니다.',
    },
    {
      q: '대학 학과 수의계약 진행 시 필요한 서류가 제공되나요?',
      a: '수의계약용 견적서, 단가 비교표, 사업자등록증, 통장사본 등 대학 행정 집행에 필요한 서류 일체를 패키지 구매 시 즉시 발급해 드립니다.',
    },
    {
      q: '학생 소스코드 유출에 대한 보안 우려는 없나요?',
      a: '개인 소스코드는 외부로 전송되지 않으며, 백엔드에는 예외 메타데이터 및 Code Diff 정보만 암호화되어 수집됩니다.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pt-14">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono mb-6">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          Desktop Native IDE &amp; Verifiable Debugging Ledger Engine for AI/SW Labs
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-slate-100 leading-tight mb-6 max-w-4xl">
          보급형 GPU 기반 5분 세팅과{' '}
          <span className="text-blue-400">[검증형 포트폴리오]</span>{' '}
          자동화 파이프라인
        </h1>

        <p className="text-slate-400 text-sm max-w-2xl leading-relaxed mb-8">
          PyTorch/CUDA 버전 충돌 없는 원클릭 로컬/클라우드 환경 구축부터 백그라운드 예외 인터셉트
          기반 무결성 디버깅 리포트 추출까지 단번에 수행합니다.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('start')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-sm border border-blue-500 flex items-center transition-all"
          >
            Start Workspace (Start AI)
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
          <button
            onClick={() => setCurrentView('lms')}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold rounded-sm transition-all"
          >
            B2B Faculty Inquiry
          </button>
        </div>
      </section>

      {/* HWPX Spec 3 Feature Summary Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <p className="text-xs font-mono uppercase text-slate-500 tracking-wider mb-4">
          HWPX Specification Core Feature Summary
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setCurrentView('start')}
            onKeyDown={activateOnKey(() => setCurrentView('start'))}
            className="p-5 bg-[#0B0F19] border border-slate-800 hover:border-blue-500/60 rounded-md cursor-pointer transition-all group focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
          >
            <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 mb-3 group-hover:bg-blue-950 transition-colors">
              <Cpu className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold text-slate-200 mb-1 group-hover:text-blue-400 transition-colors">
              1. GPU 원클릭 세팅 (Start AI)
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              로컬 GPU(RTX 3080 등) 감지 및 RunPod Cloud(A5000) 우회 연결. 사양에 맞춘 AI 모델 선택 후 WEB IDE로 즉시 이동.
            </p>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setCurrentView('view')}
            onKeyDown={activateOnKey(() => setCurrentView('view'))}
            className="p-5 bg-[#0B0F19] border border-slate-800 hover:border-emerald-500/60 rounded-md cursor-pointer transition-all group focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2"
          >
            <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mb-3 group-hover:bg-emerald-950 transition-colors">
              <LineChart className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold text-slate-200 mb-1 group-hover:text-emerald-400 transition-colors">
              2. 학습 시각화 (View AI)
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              현재 학습 중인 모델에 대한 실시간 시각화 애니메이션 제공. Epoch, Loss, Batch, 남은 시간 및 GPU 텔레메트리 실시간 추적.
            </p>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setCurrentView('portfolio')}
            onKeyDown={activateOnKey(() => setCurrentView('portfolio'))}
            className="p-5 bg-[#0B0F19] border border-slate-800 hover:border-slate-500 rounded-md cursor-pointer transition-all group focus-visible:outline-2 focus-visible:outline-slate-400 focus-visible:outline-offset-2"
          >
            <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 mb-3 group-hover:bg-slate-800 transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold text-slate-200 mb-1 group-hover:text-slate-100 transition-colors">
              3. 포트폴리오 (Verification Ledger)
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              프로젝트 디렉토리 선택 후 에러 해결 이력(Code Diff), 학습 전/후 정확도 상승 지표 파스, Markdown/PDF 내보내기 지원.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <p className="text-xs font-mono uppercase text-slate-500 tracking-wider mb-4">
          Traditional Submission vs plAI-ground Ledger
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-sm bg-[#0B0F19] border border-slate-800">
            <p className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-wider">TRADITIONAL METHOD</p>
            <p className="text-sm font-bold text-slate-300 mb-4">GitHub / Notion Code Dump</p>
            <ul className="space-y-3">
              {[
                '소스코드 및 결과 이미지/텍스트 캡처만 제출하여 결과 조작 용이',
                '런타임 CUDA OOM 및 패키지 버전 충돌 해결 논리 입증 불가',
                '교수자 및 면접관의 디버깅 진위 검증 오버헤드 극심',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-1 shrink-0" />
                  [-] {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-sm bg-[#0B0F19] border border-emerald-900/60">
            <p className="text-xs font-mono text-emerald-400 mb-2 uppercase tracking-wider">PLAI-GROUND VERIFIED LEDGER</p>
            <p className="text-sm font-bold text-slate-100 mb-4">Timestamped Debugging Ledger</p>
            <ul className="space-y-3">
              {[
                '예외 발생부터 원인 분석, Code Diff까지 백그라운드 자동 수집',
                'SHA-256 디지털 타임스탬프 서명으로 수정 및 조작 가능성 원천 차단',
                'B2B 캡스톤 성적 평가 및 기업 채용 우대용 표준 PDF 발급',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  [+] {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <p className="text-xs font-mono uppercase text-slate-500 tracking-wider mb-4">
          HWPX Demo Video &amp; Interactive Simulator
        </p>
        <div className="p-5 bg-[#0B0F19] border border-slate-800 rounded-md">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <p className="text-sm font-bold text-slate-200">CUDA OOM Error Intercept Simulator</p>
              <p className="text-xs text-slate-400 mt-0.5">실시간 예외 인터셉트 및 자동 Code Diff 생성 시뮬레이션</p>
            </div>
            <button
              onClick={runDemo}
              disabled={demoState === 'running'}
              className={`px-4 py-2 text-xs font-mono font-semibold rounded-sm border transition-all flex items-center gap-2 ${
                demoState === 'running'
                  ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              {demoState === 'running' ? '[INTERCEPTING...]' : '[Simulate CUDA OOM Error]'}
            </button>
          </div>

          <div className="bg-[#05070E] border border-slate-800 rounded-md p-4 font-mono text-xs leading-relaxed min-h-32">
            {demoState === 'idle' && (
              <p className="text-slate-500">
                <span className="text-slate-700">$ </span>plaiground session active — interceptor monitoring...
              </p>
            )}
            {demoState === 'running' && (
              <div className="space-y-1">
                <p className="text-slate-400"><span className="text-slate-700">$ </span>Intercepting exception stream...</p>
                <p className="text-amber-400">[INTERCEPTOR] Exception captured: torch.cuda.OutOfMemoryError</p>
              </div>
            )}
            {demoState === 'complete' && (
              <div className="space-y-2">
                <p className="text-rose-400">[EXCEPTION] torch.cuda.OutOfMemoryError: CUDA out of memory. Tried to allocate 2.40 GiB</p>
                <p className="text-amber-400">[DIAGNOSIS] VRAM Exceeded due to Batch Size=16 on RTX 3080 (10,240 MB)</p>
                <p className="text-slate-400">[DIFF_GEN] Generating code correction diff...</p>
                <div className="mt-3 border border-slate-800 rounded-sm overflow-hidden">
                  <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-500 text-[11px]">
                    # train.py (Line 42-45)
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-sm border-l-2 border-rose-500">
                      - batch_size = 16
                    </div>
                    <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-sm border-l-2 border-emerald-500">
                      + batch_size = 4
                    </div>
                    <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-sm border-l-2 border-emerald-500">
                      + gradient_accumulation_steps = 4  # VRAM Optimization applied
                    </div>
                  </div>
                </div>
                <p className="text-emerald-400">[LEDGER] Hash signed: #PLAI-2026-0807 — SHA256 signature complete.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <p className="text-xs font-mono uppercase text-slate-500 tracking-wider mb-4">Frequently Asked Questions</p>
        <div className="bg-[#0B0F19] border border-slate-800 rounded-md overflow-hidden">
          {faqs.map((item, i) => (
            <div key={i} className="border-b border-slate-800 last:border-0">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-5 py-3.5 flex justify-between items-center text-xs font-bold text-slate-200 hover:text-blue-400 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronRight
                  className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-90' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed font-sans border-t border-slate-800/50 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0B0F19] py-8 mt-4">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-slate-100 text-slate-950 font-mono font-bold text-[10px] rounded flex items-center justify-center">P</div>
              <span className="text-slate-100 font-bold">plAI-ground</span>
            </div>
            <p className="text-slate-500 mb-2">© 2026 plAI-ground Inc.<br />All rights reserved.</p>
            <div className="flex items-center gap-1.5 text-slate-500 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              ALL SYSTEMS OPERATIONAL
            </div>
          </div>
          <div>
            <p className="text-slate-400 font-semibold mb-3 font-mono uppercase tracking-wider text-[10px]">Platform Views</p>
            <ul className="space-y-2 text-slate-500">
              {[['Start AI','start'],['View AI (Live)','view'],['Portfolio','portfolio'],['Faculty LMS','lms']].map(([label, view]) => (
                <li key={label}>
                  <button onClick={() => setCurrentView(view)} className="hover:text-slate-300 transition-colors text-left">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-slate-400 font-semibold mb-3 font-mono uppercase tracking-wider text-[10px]">B2B &amp; Edu</p>
            <ul className="space-y-2 text-slate-500">
              {['University Reference','LINC 3.0 Guide','Contract Documents'].map((l) => (
                <li key={l}><a href="#" className="hover:text-slate-300 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-slate-400 font-semibold mb-3 font-mono uppercase tracking-wider text-[10px]">Compliance</p>
            <ul className="space-y-2 text-slate-500">
              {['Terms of Service','Privacy Policy','Technical Support'].map((l) => (
                <li key={l}><a href="#" className="hover:text-slate-300 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Start AI View (HWPX Image 2 & 3 Wireframe Implementation) ────────────────
function StartAIView({ setCurrentView, role, addToast, onSession }) {
  const [hwType, setHwType] = useState('local');
  const [codeTab, setCodeTab] = useState('jupyter');
  const [copied, setCopied] = useState(false);
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [env, setEnv] = useState(null);

  // Snippet templates
  const snippets = {
    jupyter: `# [Jupyter Notebook / Google Colab Cell]
!pip install plaiground --quiet
import plaiground

# Initialize Interceptor
plaiground.init(
    project_id="capstone-llama3",
    user_id="cju_20210001",
    auto_capture=True
)`,
    cli: `# [Python CLI — Terminal]
pip install plaiground --quiet

python -c "
import plaiground
plaiground.init(
    project_id='capstone-llama3',
    user_id='cju_20210001',
    auto_capture=True
)
"`,
  };

  // 하드웨어 패널을 실제 감지값으로 채운다 (ai_set_demo/.env + docker 상태).
  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then(setEnv)
      .catch(() => setEnv(null));
  }, []);

  const handleCopy = () => {
    setCopied(true);
    addToast('Code copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pt-14 pb-12">
      {/* Sub-header breadcrumb */}
      <div className="h-11 bg-[#0B0F19] border-b border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-500">Console</span>
          <span className="text-slate-700 text-xs">/</span>
          <span className="font-mono text-xs text-slate-500">Workspaces</span>
          <span className="text-slate-700 text-xs">/</span>
          <span className="font-mono text-xs text-slate-200 font-semibold">Start AI (HWPX Spec)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Current Role:</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
            role === 'admin'
              ? 'bg-blue-950 text-blue-400 border border-blue-800'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}>
            {role === 'admin' ? '[관리자 (Admin)]' : '[일반 사용자 (Student)]'}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

        {/* Wireframe Header Box (Matching HWPX Image 2 & Image 3) */}
        <div className="p-6 bg-[#0B0F19] border border-slate-800 rounded-md relative overflow-hidden">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-400" />
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">Start AI Workspace Launcher</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                {role === 'admin'
                  ? '관리자 화면: LMS 관리페이지 접속 및 GPU 하드웨어 세팅 기반 AI 모델 실행'
                  : '일반 사용자 화면: GPU 사양 자동 감지 기반 1-Click AI 세팅 및 Web IDE 진입'}
              </p>
            </div>

            {/* HWPX Wireframe Action Buttons (Admin vs User) */}
            <div className="flex items-center gap-3">
              {role === 'admin' && (
                <button
                  onClick={() => setCurrentView('lms')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono font-bold rounded-sm border border-slate-700 transition-all flex items-center gap-2"
                >
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  [관리페이지 (LMS Dashboard)]
                </button>
              )}

              <button
                onClick={() => setShowWizardModal(true)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold rounded-sm border border-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
              >
                <Play className="w-3.5 h-3.5" />
                [시작 (Start Workspace)]
              </button>
            </div>
          </div>

          {/* Wireframe Usage Description Callout (HWPX: "이용 방법 설명 이미지 및 텍스트") */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-sm font-sans text-xs space-y-2">
            <p className="font-bold text-slate-300 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              [시작 버튼 클릭 워크플로우 안내]
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400 pt-1">
              <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                1. GPU 사양 체크 (로컬/Runpod)
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                2. AI 모델 리스트 제공
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                3. 모델 선택 &amp; 자동 환경 세팅
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded text-emerald-400 border-emerald-900">
                4. WEB IDE 이동 및 연결
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Hardware Sensing & Infrastructure Panel */}
        <div className="p-5 rounded-md bg-[#0B0F19] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              STEP 1. HARDWARE AUTO-DETECTION &amp; GPU SENSING
            </span>
            <span className="text-[11px] font-mono text-emerald-400 border border-emerald-900 bg-emerald-950/50 px-2 py-0.5 rounded-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              [SCAN_COMPLETE]
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Compute hardware">
            {/* Card A: Local GPU */}
            <div
              role="radio"
              aria-checked={hwType === 'local'}
              tabIndex={0}
              onClick={() => setHwType('local')}
              onKeyDown={activateOnKey(() => setHwType('local'))}
              className={`p-4 rounded-md border cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${
                hwType === 'local'
                  ? 'border-blue-500 bg-slate-900/90'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-slate-300" />
                  <span className="text-xs font-bold text-slate-200">BYOG Local Mode</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-300 border border-slate-700">
                  [COST: $0/hr]
                </span>
              </div>
              <p className="text-xs font-mono text-slate-200 mb-0.5">
                {env?.gpu_name || '감지된 GPU 없음'}
              </p>
              <p className="text-[11px] font-mono text-slate-500">
                {env?.driver_version ? `NVIDIA Driver ${env.driver_version}` : 'Driver 정보 없음'}
                {env?.wsl2_ready && ' · WSL2 READY'}
              </p>
              <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed">
                {env === null
                  ? 'API 서버 미연결 — python -m ai_set_demo.api_server 를 실행하세요.'
                  : env.image_exists
                    ? `베이스 이미지 ${env.image} 준비 완료. 컨테이너에서 즉시 학습 가능.`
                    : '베이스 이미지가 없습니다. docker build 를 먼저 실행하세요.'}
              </p>
              <div className="h-1.5 bg-slate-800 rounded-sm overflow-hidden mt-3">
                <div className={`h-full transition-all ${env?.image_exists ? 'bg-blue-500 w-full' : 'bg-slate-600 w-1/4'}`} />
              </div>
            </div>

            {/* Card B: Cloud GPU */}
            <div
              role="radio"
              aria-checked={hwType === 'cloud'}
              tabIndex={0}
              onClick={() => setHwType('cloud')}
              onKeyDown={activateOnKey(() => setHwType('cloud'))}
              className={`p-4 rounded-md border cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${
                hwType === 'cloud'
                  ? 'border-blue-500 bg-slate-900/90'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-300" />
                  <span className="text-xs font-bold text-slate-200">RunPod Secure Cloud</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-blue-950 text-blue-400 border border-blue-800">
                  [COST: $0.27/hr]
                </span>
              </div>
              <p className="text-xs font-mono text-slate-200 mb-0.5">NVIDIA RTX A5000 Secure Pod</p>
              <p className="text-[11px] font-mono text-slate-500">24,576 MB (24GB VRAM)</p>
              <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed">
                Apple Silicon (Mac) 및 저사양 환경 권장. 보안형 단독 GPU 인스턴스 1-Click 할당.
              </p>
              <div className="h-1.5 bg-slate-800 rounded-sm overflow-hidden mt-3">
                <div className="h-full bg-slate-600 w-3/5 transition-all" />
              </div>
            </div>
          </div>

          {hwType === 'cloud' && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-md flex items-center justify-between text-xs font-mono flex-wrap gap-2">
              <div className="flex items-center gap-3 text-slate-400">
                <span>[POD_STATUS: READY]</span>
                <span className="text-slate-700">|</span>
                <span>Image: pytorch/pytorch:2.1.2-cuda12.1-cudnn8-runtime</span>
              </div>
              <button
                onClick={() => addToast('A5000 Pod spin-up request sent to RunPod.')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-semibold rounded-sm border border-blue-500 transition-all text-[11px] shrink-0"
              >
                [Spin Up A5000 Pod]
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Code Snippet */}
        <div className="p-5 rounded-md bg-[#0B0F19] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              STEP 2. INTEGRATION CODE SNIPPET (INTERCEPTOR BINDING)
            </span>
            <div className="flex bg-slate-950 p-0.5 rounded-md border border-slate-800 text-xs gap-0.5">
              {[{ id: 'jupyter', label: 'Jupyter / Colab' },{ id: 'cli', label: 'Python CLI' }].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCodeTab(tab.id)}
                  className={`px-2.5 py-1 rounded-sm font-mono font-medium transition-all ${
                    codeTab === tab.id
                      ? 'bg-slate-800 text-slate-100 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative bg-slate-950 p-4 rounded-md border border-slate-800 font-mono text-xs leading-relaxed text-slate-200">
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-sm border border-slate-700 transition-all flex items-center gap-1 text-[11px]"
            >
              {copied
                ? <><Check className="w-3 h-3 text-emerald-400" />Copied</>
                : <><Copy className="w-3 h-3" />Copy</>
              }
            </button>
            <pre className="whitespace-pre-wrap pr-16 text-[11px] leading-5">{snippets[codeTab]}</pre>
          </div>
        </div>

        {/* Step 3: Connection Status & View Action */}
        <div className="p-5 rounded-md bg-[#0B0F19] border border-slate-800">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-4">
            STEP 3. REAL-TIME CONNECTION &amp; INTERCEPTOR MONITORING
          </span>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400 font-bold">
                SESSION ACTIVE (INTERCEPTOR BOUND TO CUDA 12.1)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('view')}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-mono font-semibold rounded-sm border border-emerald-600 transition-all flex items-center gap-1.5"
              >
                <LineChart className="w-3.5 h-3.5" />
                [Open View AI Live Visualization]
              </button>
              <button
                onClick={() => setCurrentView('portfolio')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded-sm border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                [View Generated Portfolio]
              </button>
            </div>
          </div>
        </div>

      </div>

      {showWizardModal && (
        <LiveRunner
          onClose={() => setShowWizardModal(false)}
          onReady={(session) => { onSession?.(session); setCurrentView('ide'); }}
          addToast={addToast}
        />
      )}
    </div>
  );
}

// ─── View AI (Live Training Visualization - HWPX Core Requirement) ───────────
function ViewAIView({ addToast }) {
  const [isTraining, setIsTraining] = useState(true);
  const [loss, setLoss] = useState(0.1842);
  const [vramUsage, setVramUsage] = useState(7.8);
  const [logs] = useState([
    '[SYSTEM] Training Session Started: capstone-llama3-finetune',
    '[EPOCH 01/20] Loss: 1.8420 | Accuracy: 64.2% | Step Time: 420ms',
    '[EPOCH 05/20] Loss: 0.9120 | Accuracy: 78.5% | Step Time: 412ms',
    '[EPOCH 10/20] Loss: 0.4120 | Accuracy: 84.1% | Step Time: 408ms',
    '[EPOCH 14/20] Loss: 0.1842 | Accuracy: 89.5% | Step Time: 405ms (CURRENT)',
  ]);

  useEffect(() => {
    if (!isTraining) return;
    const interval = setInterval(() => {
      setLoss((prev) => Math.max(0.12, (prev - 0.002).toFixed(4)));
      setVramUsage(+(7.8 + (Math.random() * 0.3 - 0.15)).toFixed(1));
    }, 1500);
    return () => clearInterval(interval);
  }, [isTraining]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pt-14 pb-12">
      {/* Sub-header */}
      <div className="h-11 bg-[#0B0F19] border-b border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <LineChart className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs text-slate-200 font-bold">View AI — Real-Time Training Visualization</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
            [LIVE_ANIMATION_ACTIVE]
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>Target Model: <span className="text-slate-200">Llama-3 8B QLoRA</span></span>
          <span className="text-slate-700">|</span>
          <span>GPU: <span className="text-blue-400">RTX 3080 10GB</span></span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">

        {/* Control Bar & Key Metrics */}
        <div className="p-5 rounded-md bg-[#0B0F19] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase">Training Status</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-2.5 h-2.5 rounded-full ${isTraining ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                <span className="text-sm font-mono font-bold text-slate-100">
                  {isTraining ? 'RUNNING (EPOCH 14/20)' : 'PAUSED'}
                </span>
              </div>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <p className="text-[10px] font-mono text-slate-500 uppercase">Current Loss</p>
              <p className="text-base font-mono font-bold text-emerald-400 mt-0.5">{loss}</p>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <p className="text-[10px] font-mono text-slate-500 uppercase">Est. Time Remaining</p>
              <p className="text-base font-mono font-bold text-slate-200 mt-0.5">00h 04m 12s</p>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <p className="text-[10px] font-mono text-slate-500 uppercase">VRAM Allocation</p>
              <p className="text-base font-mono font-bold text-blue-400 mt-0.5">{vramUsage} GB / 10.0 GB</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsTraining(!isTraining);
                addToast(isTraining ? 'Training session paused.' : 'Training session resumed.');
              }}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono rounded-sm border border-slate-700 transition-all flex items-center gap-1.5"
            >
              {isTraining ? <><Pause className="w-3.5 h-3.5 text-amber-400" /> [Pause]</> : <><Play className="w-3.5 h-3.5 text-emerald-400" /> [Resume]</>}
            </button>
            <button
              onClick={() => addToast('Live metrics telemetry exported.')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold rounded-sm border border-blue-500 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              [Export Telemetry]
            </button>
          </div>
        </div>

        {/* Live SVG Animated Training Loss & Accuracy Chart */}
        <div className="p-5 rounded-md bg-[#0B0F19] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              REAL-TIME LOSS &amp; ACCURACY ANIMATION CURVE (EPOCH 1 ~ 20)
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Batch Size: 4 | Accumulation: 4 | LR: 2e-4 (AdamW)
            </span>
          </div>

          {/* SVG Animated Curve Visualizer */}
          <div className="bg-[#05070E] border border-slate-800 rounded-md p-4 relative overflow-hidden">
            <div className="h-48 w-full flex items-end justify-between relative pt-6 pb-2 px-2">
              {/* Grid Background lines */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                <div className="border-b border-slate-700 w-full" />
                <div className="border-b border-slate-700 w-full" />
                <div className="border-b border-slate-700 w-full" />
                <div className="border-b border-slate-700 w-full" />
              </div>

              {/* Loss Path Representation */}
              <svg className="absolute inset-0 w-full h-full p-4 overflow-visible" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  points="0,160 50,140 100,120 150,95 200,80 250,65 300,55 350,45 400,38 450,32 500,28 550,25 600,22 650,20 700,18"
                  className="animate-pulse"
                />
                <circle cx="700" cy="18" r="5" fill="#10B981" className="animate-ping" />
              </svg>

              <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-500">Loss: 2.0</div>
              <div className="absolute bottom-3 left-4 text-[10px] font-mono text-slate-500">Loss: 0.1</div>
              <div className="absolute bottom-3 right-4 text-[10px] font-mono text-emerald-400">Epoch 20 Target &rarr;</div>
            </div>

            {/* Epoch Progress Slider Representation */}
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>PROGRESS: EPOCH 14 / 20 (70%)</span>
                <span className="text-emerald-400 font-bold">LOSS CONVERGED (0.1842)</span>
              </div>
              <div className="w-full bg-slate-900 border border-slate-800 h-2 rounded-sm overflow-hidden">
                <div className="bg-emerald-500 h-full w-[70%] transition-all duration-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Live Telemetry Gauges & Telemetry Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Telemetry Gauges */}
          <div className="p-5 rounded-md bg-[#0B0F19] border border-slate-800 space-y-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              GPU HARDWARE TELEMETRY (RTX 3080)
            </span>
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>VRAM ALLOCATION</span>
                  <span className="text-blue-400 font-bold">78% (7.8 / 10 GB)</span>
                </div>
                <div className="h-2 bg-slate-950 border border-slate-800 rounded-sm overflow-hidden">
                  <div className="h-full bg-blue-500 w-[78%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>GPU CORE TEMPERATURE</span>
                  <span className="text-emerald-400 font-bold">64°C (STABLE)</span>
                </div>
                <div className="h-2 bg-slate-950 border border-slate-800 rounded-sm overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[64%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>COMPUTE UTILIZATION</span>
                  <span className="text-amber-400 font-bold">94.2%</span>
                </div>
                <div className="h-2 bg-slate-950 border border-slate-800 rounded-sm overflow-hidden">
                  <div className="h-full bg-amber-500 w-[94%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Log Stream */}
          <div className="p-5 rounded-md bg-[#0B0F19] border border-slate-800 space-y-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              LIVE TRAINING TELEMETRY STREAM
            </span>
            <div className="bg-[#05070E] border border-slate-800 rounded-md p-3 font-mono text-[11px] leading-relaxed text-slate-400 h-36 overflow-y-auto space-y-1">
              {logs.map((l, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-slate-600">&gt;</span>
                  <span className={idx === logs.length - 1 ? 'text-emerald-400 font-bold' : ''}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Portfolio View (Verified Debugging Ledger - HWPX Core Requirement) ──────
function PortfolioView({ addToast }) {
  const [selectedProject, setSelectedProject] = useState('capstone-llama3-finetune');

  const projects = [
    { id: 'capstone-llama3-finetune', name: 'Llama-3 8B QLoRA Fine-Tuning Task' },
    { id: 'cv-yolov8-detect',         name: 'YOLOv8 Real-time Object Detection' },
    { id: 'nlp-bert-classifier',       name: 'BERT Multilingual Sentiment Classifier' },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pt-14 pb-12">
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">

        {/* Directory / Project Selection Selector (HWPX Spec 3) */}
        <div className="p-4 bg-[#0B0F19] border border-slate-800 rounded-md flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              SELECT WORKSPACE DIRECTORY:
            </span>
          </div>
          <select
            value={selectedProject}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              addToast('Switched project directory view.');
            }}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono rounded-sm focus:outline-none focus:border-blue-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Report Header */}
        <div className="p-5 rounded-md bg-[#0B0F19] border border-slate-800 space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-2.5 py-1 rounded-sm bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                [VERIFIED_LEDGER: #PLAI-2026-0807]
              </span>
              <span className="text-xs font-mono text-slate-500">2026.08.07 16:20:04 KST</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => addToast('Markdown portfolio (.md) generated and saved.')}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded-sm border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                [Export Markdown (.md)]
              </button>
              <button
                onClick={() => addToast('Standard PDF export queued. Downloading...')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold rounded-sm border border-blue-500 transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                [Export Standard PDF]
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              {projects.find(p => p.id === selectedProject)?.name}
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Author: Hong Gil-Dong | Student ID: 20210001 | Dept: AI &amp; Software Engineering, Cheongju Univ.
            </p>
          </div>

          {/* 4 Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
            <div className="p-3 bg-slate-950 rounded-sm border border-slate-800">
              <p className="text-[10px] font-mono text-slate-500 uppercase">TOTAL DEBUG DURATION</p>
              <p className="text-sm font-mono font-bold text-slate-100 mt-0.5">04h 12m 38s</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-sm border border-slate-800">
              <p className="text-[10px] font-mono text-slate-500 uppercase">RESOLVED EXCEPTIONS</p>
              <p className="text-sm font-mono font-bold text-rose-400 mt-0.5">5 EXCEPTIONS</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-sm border border-slate-800">
              <p className="text-[10px] font-mono text-slate-500 uppercase">FINAL TRAINING LOSS</p>
              <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">0.1420 (TARGET MET)</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-sm border border-slate-800">
              <p className="text-[10px] font-mono text-slate-500 uppercase">INTEGRITY CHECKSUM</p>
              <p className="text-sm font-mono font-bold text-blue-400 mt-0.5">SHA256: PASS</p>
            </div>
          </div>
        </div>

        {/* Before & After Training Performance Metric (HWPX Spec Requirement) */}
        <div className="p-5 rounded-md bg-[#0B0F19] border border-emerald-900/60 space-y-3">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            BEFORE VS AFTER TRAINING PERFORMANCE GAIN (HWPX REQUIREMENT 3.2)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-sm">
              <p className="text-[10px] font-mono text-slate-500 uppercase">Base Model Accuracy</p>
              <p className="text-base font-mono font-bold text-slate-400 mt-1">64.2%</p>
              <p className="text-[11px] font-sans text-slate-500 mt-0.5">Pre-trained Llama-3 8B zero-shot</p>
            </div>

            <div className="p-3 bg-slate-950 border border-emerald-900/80 rounded-sm bg-emerald-950/20">
              <p className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Fine-Tuned Accuracy</p>
              <p className="text-base font-mono font-bold text-emerald-400 mt-1">89.5% (+25.3% UP)</p>
              <p className="text-[11px] font-sans text-slate-400 mt-0.5">After 20 Epochs QLoRA Adaptation</p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-sm">
              <p className="text-[10px] font-mono text-slate-500 uppercase">Loss Reduction Delta</p>
              <p className="text-base font-mono font-bold text-blue-400 mt-1">1.8420 &rarr; 0.1420</p>
              <p className="text-[11px] font-sans text-slate-500 mt-0.5">92.2% Loss Convergence rate</p>
            </div>
          </div>
        </div>

        {/* Debugging Timeline */}
        <div className="p-5 rounded-md bg-[#0B0F19] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-blue-400" />
            DEBUGGING TIMELINE &amp; CODE DIFF LEDGER (EXCEPTION HISTORY)
          </div>

          {/* Error #01 */}
          <div className="border border-slate-800 rounded-md overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-slate-950 border-b border-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-rose-950/80 text-rose-400 border border-rose-800 rounded-sm text-[11px] font-mono font-bold">
                  [ERROR #01]
                </span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  torch.cuda.OutOfMemoryError: CUDA out of memory.
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">14:23:10 KST</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="p-3 rounded-sm bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
                <p className="text-amber-400 font-bold text-[11px]">[DIAGNOSIS &amp; SOLUTION]</p>
                <p className="text-slate-300 font-sans text-xs">
                  Batch Size=16 설정으로 인해 RTX 3080 (10,240 MB) VRAM 한계 할당 초과. QLoRA gradient_accumulation 적용 필요.
                </p>
              </div>
              <div className="p-4 rounded-sm bg-slate-950 border border-slate-800 font-mono text-xs leading-relaxed">
                <p className="text-slate-500 mb-2"># train.py (Line 42-45)</p>
                <div className="space-y-1">
                  <div className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-sm border-l-2 border-rose-500">
                    - batch_size = 16
                  </div>
                  <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-sm border-l-2 border-emerald-500">
                    + batch_size = 4
                  </div>
                  <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-sm border-l-2 border-emerald-500">
                    + gradient_accumulation_steps = 4  # VRAM Optimization applied
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="text-emerald-400 font-bold">[STATUS: RESOLVED]</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Elapsed: 12m 14s
                </span>
              </div>
            </div>
          </div>

          {/* Error #02 */}
          <div className="border border-slate-800 rounded-md overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-slate-950 border-b border-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-rose-950/80 text-rose-400 border border-rose-800 rounded-sm text-[11px] font-mono font-bold">
                  [ERROR #02]
                </span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  KeyError: 'pad_token' during LlamaTokenizer initialization.
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">14:41:05 KST</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="p-3 rounded-sm bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
                <p className="text-amber-400 font-bold text-[11px]">[DIAGNOSIS &amp; SOLUTION]</p>
                <p className="text-slate-300 font-sans text-xs">
                  LlamaTokenizer는 pad_token을 기본 정의하지 않아 KeyError 발생. eos_token을 pad_token으로 명시적으로 할당하여 해결.
                </p>
              </div>
              <div className="p-4 rounded-sm bg-slate-950 border border-slate-800 font-mono text-xs leading-relaxed">
                <p className="text-slate-500 mb-2"># tokenizer_setup.py (Line 18-19)</p>
                <div className="space-y-1">
                  <div className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-sm border-l-2 border-rose-500">
                    - tokenizer.pad_token = None
                  </div>
                  <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-sm border-l-2 border-emerald-500">
                    + tokenizer.pad_token = tokenizer.eos_token
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="text-emerald-400 font-bold">[STATUS: RESOLVED]</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Elapsed: 8m 42s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Fingerprint */}
        <div className="p-5 rounded-md bg-[#0B0F19] border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
            <Hash className="w-4 h-4 text-emerald-400" />
            DIGITAL FINGERPRINT PAYLOAD (SHA-256 LEDGER SIGNATURE)
          </div>
          <div className="bg-[#05070E] border border-slate-800 rounded-md p-4 font-mono text-[11px] leading-relaxed text-slate-300">
            <pre className="whitespace-pre-wrap">{`{
  "ledger_id": "PLAI-2026-0807",
  "project_name": "capstone-llama3",
  "user_id": "cju_20210001",
  "project_hash": "sha256:8a07f3c1d2e9b4a0f6c8d5e2b1a9f7c3",
  "session_start": "2026-08-07T14:23:00+09:00",
  "session_end": "2026-08-07T16:20:04+09:00",
  "total_exceptions": 5,
  "resolved_exceptions": 5,
  "accuracy_before": 0.6420,
  "accuracy_after": 0.8950,
  "final_loss": 0.1420,
  "signature": "plai-v1:HMAC-SHA256:f8e3a1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9",
  "integrity": "PASS"
}`}</pre>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── LMS Dashboard View ───────────────────────────────────────────────────────
function LmsView({ setCurrentView, addToast }) {
  const students = [
    {
      name: 'Hong Gil-Dong', id: '20210001',
      hw: { label: '[BYOG: RTX 3080]', cls: 'bg-slate-900 border-slate-700 text-slate-300' },
      status: { label: '[COMPLETED]', cls: 'bg-emerald-950/80 border-emerald-800 text-emerald-400' },
      exc: { val: '5 Exceptions', cls: 'text-rose-400 font-bold' },
      loss: { val: '0.1420', cls: 'text-emerald-400 font-bold' },
      active: true,
    },
    {
      name: 'Kim Chul-Soo', id: '20210002',
      hw: { label: '[CLOUD: A5000]', cls: 'bg-blue-950/80 border-blue-800 text-blue-400' },
      status: { label: '[IN_PROGRESS]', cls: 'bg-blue-950/80 border-blue-800 text-blue-400' },
      exc: { val: '3 Exceptions', cls: 'text-rose-400 font-bold' },
      loss: { val: '0.3810', cls: 'text-slate-300' },
      active: true,
    },
    {
      name: 'Lee Young-Hee', id: '20210003',
      hw: { label: '[UNASSIGNED]', cls: 'border-slate-800 text-slate-600 bg-transparent' },
      status: { label: '[NOT_STARTED]', cls: 'bg-slate-900 border-slate-800 text-slate-500' },
      exc: { val: '0 Exceptions', cls: 'text-slate-600' },
      loss: { val: 'N/A', cls: 'text-slate-600' },
      active: false,
    },
  ];

  const contractDocs = [
    { label: '[Official Quote]', detail: '견적서 — 9,720,000 KRW (VAT별도)', Icon: FileText },
    { label: '[Price Comparison Table]', detail: '단가 비교표 — 수의계약 적격 증빙', Icon: GitBranch },
    { label: '[Business Registration]', detail: '사업자등록증 — 행정 서류 제출용', Icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pt-14 pb-12">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">

        {/* Class Header */}
        <div className="p-5 rounded-md bg-[#0B0F19] border border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="px-2 py-0.5 rounded-sm bg-blue-950/80 text-blue-400 border border-blue-800 text-[11px] font-mono font-bold">
              [ACADEMIC_DEPT: CHEONGJU_UNIV_AI_SW]
            </span>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight mt-2">
              2026-2 Capstone Design &amp; AI Fine-Tuning Lab
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Faculty: Hong Seong-Ung Professor | Enrolled: 60 Students | License: B2B Faculty Package
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => addToast('Assessment CSV export queued.')}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded-sm border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              [Export Assessment Data (CSV)]
            </button>
            <button
              onClick={() => addToast('Batch ZIP/PDF export queued. Preparing 60 portfolios...')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold rounded-sm border border-blue-500 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              [Batch Export All Portfolios (ZIP/PDF)]
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-md bg-[#0B0F19] border border-slate-800">
            <p className="text-[10px] font-mono text-slate-500 uppercase">STUDENT ACTIVATION RATE</p>
            <p className="text-lg font-mono font-bold text-slate-100 mt-1">58 / 60 ACTIVE (96.6%)</p>
            <p className="text-[11px] font-mono text-slate-500 mt-1">2 Students Not Started</p>
          </div>
          <div className="p-4 rounded-md bg-[#0B0F19] border border-slate-800">
            <p className="text-[10px] font-mono text-slate-500 uppercase">CUMULATIVE RESOLVED EXCEPTIONS</p>
            <p className="text-lg font-mono font-bold text-rose-400 mt-1">243 RESOLVED EXCEPTIONS</p>
            <p className="text-[11px] font-mono text-slate-500 mt-1">Avg 4.05 Exceptions / Student</p>
          </div>
          <div className="p-4 rounded-md bg-[#0B0F19] border border-slate-800">
            <p className="text-[10px] font-mono text-slate-500 uppercase">AVG WEEKLY LAB DURATION</p>
            <p className="text-lg font-mono font-bold text-emerald-400 mt-1">06h 12m / WEEK</p>
            <p className="text-[11px] font-mono text-slate-500 mt-1">BYOG 72% | Cloud 28%</p>
          </div>
        </div>

        {/* Student Table */}
        <div className="p-5 rounded-md bg-[#0B0F19] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <Users className="w-4 h-4 text-blue-400" />
            STUDENT LAB STATUS &amp; VERIFIED PORTFOLIOS
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                  {['Student Name','Student ID','HW Infrastructure','Execution Status','Resolved Exceptions','Final Loss','Actions'].map((h) => (
                    <th key={h} className="p-3 font-bold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors">
                    <td className="p-3 font-bold text-slate-100 whitespace-nowrap">{s.name}</td>
                    <td className="p-3 text-slate-400">{s.id}</td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 border rounded-sm text-[11px] ${s.hw.cls}`}>
                        {s.hw.label}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 border rounded-sm text-[11px] font-bold ${s.status.cls}`}>
                        {s.status.label}
                      </span>
                    </td>
                    <td className={`p-3 whitespace-nowrap ${s.exc.cls}`}>{s.exc.val}</td>
                    <td className={`p-3 ${s.loss.cls}`}>{s.loss.val}</td>
                    <td className="p-3">
                      {s.active ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setCurrentView('portfolio')}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-sm text-[11px] font-bold border border-blue-500 transition-all whitespace-nowrap"
                          >
                            [View Report]
                          </button>
                          <button
                            onClick={() => addToast(`PDF export queued for ${s.name}.`)}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-sm text-[11px] font-bold border border-slate-700 transition-all"
                          >
                            [PDF]
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-[11px]">[UNAVAILABLE]</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contract Documents */}
        <div className="p-5 rounded-md bg-[#0B0F19] border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">
            <FileText className="w-4 h-4 text-slate-400" />
            SOLE-SOURCE CONTRACT DOCUMENTS
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {contractDocs.map((doc, i) => (
              <button
                key={i}
                onClick={() => addToast(`${doc.label} download initiated.`)}
                className="p-3 bg-slate-950 border border-slate-800 rounded-sm hover:border-slate-700 transition-all text-left flex items-start gap-3 group"
              >
                <doc.Icon className="w-4 h-4 text-slate-500 shrink-0 mt-0.5 group-hover:text-blue-400 transition-colors" />
                <div>
                  <p className="text-xs font-mono font-bold text-slate-300 group-hover:text-blue-400 transition-colors">
                    {doc.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{doc.detail}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Root App Component ───────────────────────────────────────────────────────
export default function App() {
  const [currentView, setCurrentView] = useState('start');
  const [role, setRole] = useState('admin'); // 'admin' or 'user'
  const [toasts, setToasts] = useState([]);
  // 환경 세팅이 끝나면 /api/setup의 ready 응답이 여기 담긴다 (IDE 접속 정보).
  const [session, setSession] = useState(null);

  const addToast = useCallback((message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="bg-[#0F172A] min-h-screen">
      <GlobalHeader
        currentView={currentView}
        setCurrentView={setCurrentView}
        role={role}
        setRole={setRole}
        addToast={addToast}
      />

      {currentView === 'landing'   && <LandingView   setCurrentView={setCurrentView} />}
      {currentView === 'start'     && <StartAIView   setCurrentView={setCurrentView} role={role} addToast={addToast} onSession={setSession} />}
      {currentView === 'ide'       && <IdeView       session={session} setCurrentView={setCurrentView} addToast={addToast} />}
      {currentView === 'view'      && <ViewAIView    addToast={addToast} />}
      {currentView === 'portfolio' && <PortfolioView addToast={addToast} />}
      {currentView === 'lms'       && <LmsView       setCurrentView={setCurrentView} addToast={addToast} />}

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
