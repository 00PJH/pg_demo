import { useCallback, useState } from 'react';
import { ArrowUpRight, Check, X } from 'lucide-react';
import StartAI from './StartAI.jsx';
import IdeView from './IdeView.jsx';
import ViewAI from './ViewAI.jsx';
import PortfolioView from './PortfolioView.jsx';
import Lms from './Lms.jsx';

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toasts({ toasts, remove }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto glass-card rounded-2xl px-4 py-3 flex items-center gap-3 text-xs min-w-64">
          <Check className="w-3.5 h-3.5 text-mint shrink-0" />
          <span className="flex-1 text-ink">{t.message}</span>
          <button onClick={() => remove(t.id)} aria-label="알림 닫기" className="text-dim hover:text-ink transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── 랜딩 페이지 (Liquid Brokers 그래머) ──────────────────────────────────────
function Landing({ go }) {
  const [openFaq, setOpenFaq] = useState(0);

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
    <div className="min-h-screen bg-void text-ink overflow-x-clip">
      {/* ── 내비게이션 ── */}
      <header className="fixed top-0 inset-x-0 z-40">
        <div className="max-w-6xl mx-auto px-6 pt-5">
          <div className="glass-card rounded-full h-14 px-6 flex items-center justify-between">
            <a href="#top" className="flex items-center gap-2.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_12px_rgba(232,179,75,0.8)]" />
              <span className="font-display font-bold tracking-tight text-[15px]">plAI-ground</span>
            </a>
            <nav className="hidden md:flex items-center gap-7 text-[13px] text-mist">
              <a href="#platform" className="hover:text-ink transition-colors">Platform</a>
              <a href="#pipeline" className="hover:text-ink transition-colors">Pipeline</a>
              <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-ink transition-colors">FAQ</a>
            </nav>
            <div className="flex items-center gap-2">
              <button
                onClick={() => go('lms')}
                className="hidden sm:block px-4 py-2 rounded-full text-[13px] text-mist hover:text-ink transition-colors"
              >
                Faculty LMS
              </button>
              <button
                onClick={() => go('start')}
                className="px-5 py-2 rounded-full bg-ink text-void text-[13px] font-semibold hover:bg-white transition-colors"
              >
                Start Workspace
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── 히어로 ── */}
      <section id="top" className="relative min-h-screen flex flex-col items-center starfield overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-44 pb-8">
          <h1 className="font-display font-bold tracking-[-0.03em] leading-[1.04] text-[2.6rem] sm:text-6xl md:text-7xl animate-rise">
            Train the Model.
            <br />
            Prove the Journey.
          </h1>
          <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-mist animate-rise-late">
            5분 원클릭 GPU 실습 환경 구축부터, 디버깅 과정이 그대로
            <br className="hidden sm:block" />
            검증형 포트폴리오가 되는 통합 AI 실습 플랫폼.
          </p>
          <div className="mt-9 flex items-center gap-3 animate-rise-later">
            <button
              onClick={() => go('start')}
              className="px-7 py-3 rounded-full bg-ink text-void text-sm font-semibold hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all"
            >
              Start Workspace
            </button>
            <button
              onClick={() => go('portfolio')}
              className="px-7 py-3 rounded-full border border-line text-sm text-mist hover:text-ink hover:border-white/25 transition-colors"
            >
              포트폴리오 데모
            </button>
          </div>
        </div>

        {/* 오브 + 플로팅 카드 */}
        <div className="relative w-full flex-1 min-h-[260px] sm:min-h-[380px]" aria-hidden="true">
          <div className="absolute left-1/2 -translate-x-1/2 top-6 w-[min(760px,92vw)] aspect-square">
            <div className="orb-rim absolute inset-x-[8%] bottom-[38%] h-[26%]" />
            <div className="orb-body absolute inset-0 animate-breathe" />
          </div>
          {/* 좌측 카드 — 실측 셋업 시간 */}
          <div className="hidden sm:block absolute left-[6%] lg:left-[14%] top-16 animate-drift">
            <div className="glass-card rounded-2xl p-4 w-52">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-mist">Setup Time</span>
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <ArrowUpRight className="w-3 h-3 text-ink" />
                </span>
              </div>
              <p className="font-display font-bold text-2xl tabular">5:00</p>
              <p className="text-[11px] text-dim mt-1">모델 선택부터 Web IDE까지</p>
              <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-4/5 rounded-full bg-gold" />
              </div>
            </div>
          </div>
          {/* 우측 카드 — 원장 무결성 */}
          <div className="hidden sm:block absolute right-[6%] lg:right-[14%] top-40 animate-drift" style={{ animationDelay: '1.6s' }}>
            <div className="glass-card rounded-2xl p-4 w-56">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-mist">Verified Ledger</span>
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <ArrowUpRight className="w-3 h-3 text-ink" />
                </span>
              </div>
              <p className="font-display font-bold text-2xl">SHA-256</p>
              <p className="font-mono text-[10px] text-gold mt-1 truncate">8a07f3c1d2e9b4a0f6c8… <span className="text-dim">(예시)</span></p>
              <p className="text-[11px] text-dim mt-2">실제 해시는 포트폴리오에서 발급</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 플랫폼 ── */}
      <section id="platform" className="max-w-6xl mx-auto px-6 py-28">
        <h2 className="font-display font-bold tracking-tight text-3xl sm:text-4xl max-w-2xl leading-tight">
          환경 세팅에서 증명까지,
          <br />
          하나의 워크스페이스.
        </h2>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* One-Click GPU Lab — 대형 카드 + 실제 프로비저닝 로그 */}
          <button
            onClick={() => go('start')}
            className="lg:col-span-7 glass-card rounded-3xl p-7 text-left group hover:border-gold/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-xl">One-Click GPU Lab</h3>
                <p className="mt-2 text-sm text-mist leading-relaxed max-w-md">
                  Docker 데몬·베이스 이미지·로컬 GPU를 자동 감지하고, 모델 카탈로그에서 선택하면
                  학습 코드 생성과 컨테이너 기동까지 실제 파이프라인이 돌아갑니다.
                </p>
              </div>
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-6 rounded-2xl bg-pit border border-line p-4 font-mono text-[12px] leading-6 text-mist">
              <p><span className="text-cobalt">[1/4]</span> Docker 데몬 · plaiground-base:dev 이미지 확인</p>
              <p><span className="text-cobalt">[2/4]</span> ModelCatalog → klue-bert-finetune 선택</p>
              <p><span className="text-cobalt">[3/4]</span> train_klue_bert_finetune.py 생성 및 마운트</p>
              <p><span className="text-mint">[4/4]</span> code-server 기동 → http://127.0.0.1:8080 <span className="text-mint">READY</span></p>
            </div>
          </button>

          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Live Telemetry */}
            <button
              onClick={() => go('view')}
              className="glass-card rounded-3xl p-7 text-left group hover:border-cobalt/40 transition-colors flex-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-xl">Live Training Telemetry</h3>
                  <p className="mt-2 text-sm text-mist leading-relaxed">
                    Loss·Accuracy·VRAM을 실시간 추적하고 학습 곡선을 애니메이션으로 렌더링합니다.
                  </p>
                </div>
                <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-cobalt/20 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <svg viewBox="0 0 300 60" className="mt-5 w-full h-14" aria-hidden="true">
                <polyline
                  fill="none" stroke="#5b78ff" strokeWidth="2" strokeLinecap="round"
                  points="0,8 30,14 60,24 90,30 120,38 150,42 180,47 210,50 240,52 270,54 300,55"
                />
                <circle cx="300" cy="55" r="3" fill="#4ade9b" />
              </svg>
            </button>

            {/* Verified Portfolio */}
            <button
              onClick={() => go('portfolio')}
              className="glass-card rounded-3xl p-7 text-left group hover:border-gold/40 transition-colors flex-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-xl">Verified Portfolio</h3>
                  <p className="mt-2 text-sm text-mist leading-relaxed">
                    에러 해결 이력과 성능 델타가 SHA-256 서명과 함께 1페이지 포트폴리오로 자동 생성됩니다.
                  </p>
                </div>
                <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-5 font-mono text-[12px] leading-6">
                <p className="text-ember">- batch_size = 64  <span className="text-dim"># CUDA OOM</span></p>
                <p className="text-mint">+ batch_size = 16, grad_accum = 4</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ── 파이프라인 ── */}
      <section id="pipeline" className="border-y border-line bg-pit/60">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="font-display font-bold tracking-tight text-3xl sm:text-4xl">
            학습을 대신 돌려주지 않습니다.
          </h2>
          <p className="mt-4 text-mist text-sm max-w-2xl leading-relaxed">
            코드를 직접 보고, 고치고, 실행하는 경험이 제품입니다. plAI-ground는 그 과정을
            가로막는 세팅과, 그 과정을 증명하는 기록만 자동화합니다.
          </p>
          <ol className="mt-14 grid grid-cols-1 lg:grid-cols-4 gap-y-10 lg:gap-y-0">
            {[
              ['모델 선택', 'ModelCatalog에서 과제에 맞는 모델과 데이터셋을 고릅니다.'],
              ['환경 세팅', 'Docker 컨테이너와 학습 스크립트가 자동으로 준비됩니다.'],
              ['IDE에서 직접 학습', 'code-server 터미널에서 코드를 고치고 실행합니다. 에러는 자동 수집.'],
              ['포트폴리오 발급', '텔레메트리가 검증형 포트폴리오 HTML로 렌더링됩니다.'],
            ].map(([title, desc], i, arr) => (
              <li key={title} className="relative lg:pr-8">
                {/* 진행 레일 — 순서 자체가 정보라서 연결선으로 잇는다 */}
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${i === arr.length - 1 ? 'bg-gold shadow-[0_0_12px_rgba(232,179,75,0.7)]' : 'border-2 border-gold/70 bg-void'}`} />
                  {i < arr.length - 1 && <span className="hidden lg:block flex-1 h-px bg-gradient-to-r from-gold/50 to-white/10" />}
                </div>
                <p className="mt-4 font-display font-bold text-[15px]">{title}</p>
                <p className="mt-2 text-[13px] text-mist leading-relaxed max-w-56">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 가격 ── */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-28">
        <h2 className="font-display font-bold tracking-tight text-3xl sm:text-4xl">
          학과 예산 그대로, 행정 부담 없이.
        </h2>
        <p className="mt-4 text-mist text-sm max-w-xl leading-relaxed">
          1,000만 원 이하 수의계약 규격에 맞춘 학과 라이선스와, 실습실 없이도
          시작할 수 있는 개인 정기 구독.
        </p>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          {/* B2B 하이라이트 */}
          <div className="lg:col-span-1 rounded-3xl p-[1px] bg-gradient-to-b from-gold/60 via-gold/15 to-transparent">
            <div className="h-full rounded-3xl bg-pit p-7 flex flex-col">
              <h3 className="font-display font-bold text-lg">B2B University Faculty</h3>
              <p className="mt-1 text-[13px] text-mist">학과 실습 라이선스 · 61명 · 9개월</p>
              <p className="mt-6 font-display font-bold text-4xl tabular">₩9,720,000<span className="text-base text-mist font-medium"> /년</span></p>
              <p className="mt-1 text-[12px] text-dim">VAT 별도 · 학생 1인당 월 18,000원 수준</p>
              <ul className="mt-6 space-y-2.5 text-[13px] text-mist flex-1">
                {[
                  '1,000만 원 이하 수의계약 규격 충족',
                  '교수 전용 LMS 대시보드 (60명 관리)',
                  '검증 포트폴리오 PDF 일괄 다운로드',
                  '견적서·단가 비교표 등 행정 서류 발급',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => go('lms')}
                className="mt-7 w-full py-3 rounded-full bg-gold text-void text-sm font-semibold hover:brightness-110 transition-all"
              >
                Faculty LMS 살펴보기
              </button>
            </div>
          </div>

          {/* B2C 두 티어 */}
          {[
            {
              name: 'Standard', price: '₩15,000', margin: '캡스톤·과제 실습에 충분한 기본 구성',
              feats: ['원클릭 GPU 실습 환경', '검증 포트폴리오 무제한 발급', 'RunPod Community Cloud 20시간'],
            },
            {
              name: 'Premium', price: '₩37,500', margin: '대형 모델 파인튜닝을 위한 상위 구성',
              feats: ['A6000 48GB 클라우드 지원', '검증 포트폴리오 무제한 + 우선 대기열', 'RunPod Community Cloud 30시간'],
            },
          ].map((tier) => (
            <div key={tier.name} className="rounded-3xl border border-line bg-void p-7 flex flex-col">
              <h3 className="font-display font-bold text-lg">{tier.name}</h3>
              <p className="mt-1 text-[13px] text-mist">개인 정기 구독</p>
              <p className="mt-6 font-display font-bold text-4xl tabular">{tier.price}<span className="text-base text-mist font-medium"> /월</span></p>
              <p className="mt-1 text-[12px] text-dim">{tier.margin}</p>
              <ul className="mt-6 space-y-2.5 text-[13px] text-mist flex-1">
                {tier.feats.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-cobalt shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => go('start')}
                className="mt-7 w-full py-3 rounded-full border border-line text-sm text-ink hover:border-white/30 hover:bg-white/5 transition-colors"
              >
                지금 시작하기
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-3xl mx-auto px-6 pb-28">
        <h2 className="font-display font-bold tracking-tight text-3xl sm:text-4xl">자주 묻는 질문</h2>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                className="w-full py-5 flex items-center justify-between gap-4 text-left group"
              >
                <span className="text-[15px] font-medium group-hover:text-gold transition-colors">{f.q}</span>
                <ArrowUpRight
                  className={`w-4 h-4 text-dim shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-90' : 'rotate-45'}`}
                />
              </button>
              {openFaq === i && (
                <p className="pb-6 text-sm text-mist leading-relaxed max-w-xl">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span className="font-display font-bold text-sm">plAI-ground</span>
            <span className="text-[12px] text-dim">by MENOTIS</span>
          </div>
          <nav className="flex items-center gap-6 text-[12px] text-dim">
            <button onClick={() => go('start')} className="hover:text-mist transition-colors">Start AI</button>
            <button onClick={() => go('view')} className="hover:text-mist transition-colors">View AI</button>
            <button onClick={() => go('portfolio')} className="hover:text-mist transition-colors">Portfolio</button>
            <button onClick={() => go('lms')} className="hover:text-mist transition-colors">Faculty LMS</button>
          </nav>
          <p className="text-[12px] text-dim">© 2026 plAI-ground. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// ─── 콘솔 셸 (Operate 표면) ───────────────────────────────────────────────────
const TABS = [
  { id: 'start', label: 'Start AI' },
  { id: 'ide', label: 'Web IDE' },
  { id: 'view', label: 'View AI' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'lms', label: 'Faculty LMS' },
];

function ConsoleShell({ view, go, children }) {
  return (
    <div className="min-h-screen bg-void text-ink">
      <header className="fixed top-0 inset-x-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="glass-card rounded-full h-13 px-4 sm:px-5 py-2 flex items-center justify-between gap-3">
            <button onClick={() => go('landing')} className="flex items-center gap-2 shrink-0" aria-label="랜딩으로 이동">
              <span className="w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_12px_rgba(232,179,75,0.8)]" />
              <span className="font-display font-bold tracking-tight text-sm hidden sm:inline">plAI-ground</span>
            </button>
            <nav className="flex items-center gap-1 overflow-x-auto" aria-label="콘솔 메뉴">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => go(t.id)}
                  aria-current={view === t.id ? 'page' : undefined}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] whitespace-nowrap transition-colors ${
                    view === t.id ? 'bg-ink text-void font-semibold' : 'text-mist hover:text-ink'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <div className="hidden md:flex items-center gap-2 text-[11px] text-mist shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-mint" />
              LOCAL
            </div>
          </div>
        </div>
      </header>
      <main className="pt-24">{children}</main>
    </div>
  );
}

// ─── 루트 ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('landing');
  const [session, setSession] = useState(null); // /api/setup ready 페이로드 (IDE 접속 정보)
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const removeToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const go = useCallback((v) => {
    setView(v);
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {view === 'landing' ? (
        <Landing go={go} />
      ) : (
        <ConsoleShell view={view} go={go}>
          {view === 'start' && <StartAI go={go} onSession={setSession} addToast={addToast} />}
          {view === 'ide' && <IdeView session={session} go={go} addToast={addToast} />}
          {view === 'view' && <ViewAI addToast={addToast} />}
          {view === 'portfolio' && <PortfolioView addToast={addToast} />}
          {view === 'lms' && <Lms go={go} addToast={addToast} />}
        </ConsoleShell>
      )}
      <Toasts toasts={toasts} remove={removeToast} />
    </>
  );
}
