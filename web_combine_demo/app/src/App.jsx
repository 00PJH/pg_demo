import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, ChevronDown, GraduationCap, LogOut, ShieldCheck, X } from 'lucide-react';
import StartAI from './StartAI.jsx';
import IdeView from './IdeView.jsx';
import ViewAI from './ViewAI.jsx';
import PortfolioView from './PortfolioView.jsx';
import Lms from './Lms.jsx';
import Community from './Community.jsx';

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

// ─── 로그인 메뉴 (학생/관리자 선택) ───────────────────────────────────────────
function LoginMenu({ role, onLogin, onLogout }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // 열린 메뉴는 Escape·바깥 클릭으로 닫힌다
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onClick = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  if (role) {
    const isAdmin = role === 'admin';
    return (
      <div className="flex items-center gap-1.5">
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium ${
          isAdmin ? 'bg-gold/15 text-gold' : 'bg-cobalt/15 text-cobalt'
        }`}>
          {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
          {isAdmin ? '관리자' : '학생'}
        </span>
        <button
          onClick={onLogout}
          aria-label="로그아웃"
          className="p-2 rounded-full text-mist hover:text-ink hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] text-mist hover:text-ink transition-colors"
      >
        Login
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        // 단순 버튼 목록 — menu role은 화살표 키 포커스 관리까지 약속하므로 쓰지 않는다
        <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-2xl p-1.5 z-50">
          <button
            onClick={() => { setOpen(false); onLogin('student'); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] text-ink hover:bg-white/8 transition-colors text-left"
          >
            <GraduationCap className="w-4 h-4 text-cobalt shrink-0" />
            학생으로 로그인
          </button>
          <button
            onClick={() => { setOpen(false); onLogin('admin'); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] text-ink hover:bg-white/8 transition-colors text-left"
          >
            <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
            관리자로 로그인
          </button>
        </div>
      )}
    </div>
  );
}

// ─── 랜딩 페이지 ──────────────────────────────────────────────────────────────
function Landing({ go, role, onLogin, onLogout }) {
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
      <header className="fixed top-0 inset-x-0 z-40 bg-void/85 backdrop-blur-md border-b border-line">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_12px_rgba(232,179,75,0.8)]" />
            <span className="font-display font-bold tracking-tight text-[15px]">plAI-ground</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-[13px] text-mist">
            <button onClick={() => go('start')} className="hover:text-ink transition-colors">Start AI</button>
            <button onClick={() => go('ide')} className="hover:text-ink transition-colors">Web IDE</button>
            <button onClick={() => go('view')} className="hover:text-ink transition-colors">View AI</button>
            <button onClick={() => go('portfolio')} className="hover:text-ink transition-colors">Portfolio</button>
            <button onClick={() => go('community')} className="hover:text-ink transition-colors">커뮤니티</button>
          </nav>
          <div className="flex items-center gap-2">
            <LoginMenu role={role} onLogin={onLogin} onLogout={onLogout} />
            <button
              onClick={() => go('start')}
              className="px-5 py-2 rounded-full bg-gold text-void text-[13px] font-semibold hover:brightness-110 transition-all whitespace-nowrap"
            >
              Start Workspace
            </button>
          </div>
        </div>
        {/* 모바일 전용 메뉴 행 */}
        <nav className="md:hidden flex items-center gap-5 overflow-x-auto px-6 pb-3 text-[13px] text-mist">
          <button onClick={() => go('start')} className="hover:text-ink transition-colors whitespace-nowrap">Start AI</button>
          <button onClick={() => go('ide')} className="hover:text-ink transition-colors whitespace-nowrap">Web IDE</button>
          <button onClick={() => go('view')} className="hover:text-ink transition-colors whitespace-nowrap">View AI</button>
          <button onClick={() => go('portfolio')} className="hover:text-ink transition-colors whitespace-nowrap">Portfolio</button>
          <button onClick={() => go('community')} className="hover:text-ink transition-colors whitespace-nowrap">커뮤니티</button>
        </nav>
      </header>

      {/* ── 히어로 — 학습 여정이 원장이 되는 순간을 그대로 보여준다 ── */}
      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 gridfield" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-6 pt-36 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          {/* 좌측 — 메시지 */}
          <div className="lg:col-span-6">
            <h1 className="font-display font-bold tracking-[-0.03em] leading-[1.06] text-[2.6rem] sm:text-6xl animate-rise">
              Train the Model.
              <br />
              Prove the Journey.
            </h1>
            <p className="mt-7 max-w-lg text-[15px] leading-relaxed text-mist animate-rise-late">
              5분 원클릭 GPU 실습 환경 구축부터, 디버깅 과정이 그대로
              검증형 포트폴리오가 되는 통합 AI 실습 플랫폼.
            </p>
            <div className="mt-9 flex items-center gap-3 animate-rise-later">
              <button
                onClick={() => go('start')}
                className="px-7 py-3 rounded-full bg-gold text-void text-sm font-semibold hover:brightness-110 hover:shadow-[0_0_30px_rgba(232,179,75,0.35)] transition-all"
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

          {/* 우측 — 라이브 원장 스택 (제품 메커니즘의 극화) */}
          <div className="lg:col-span-6 relative animate-rise-late" aria-hidden="true">
            <div className="ledger-glow absolute -inset-10" />
            <div className="relative glass-card rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-line">
                <span className="w-2.5 h-2.5 rounded-full bg-ember/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-gold/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-mint/70" />
                <span className="ml-2 font-mono text-[11px] text-dim">plaiground · training session</span>
              </div>
              <div className="px-5 pt-4 pb-9 font-mono text-[12px] leading-7">
                <p className="text-mist"><span className="text-dim">[EPOCH 02/03]</span> loss 1.284 · f1 0.412</p>
                <p className="text-ember">[INTERCEPT] RuntimeError: CUDA out of memory (batch_size=64)</p>
                <p className="text-ember/90 pl-4">- batch_size = 64</p>
                <p className="text-mint pl-4">+ batch_size = 16, grad_accum = 4</p>
                <p className="text-cobalt"><span className="text-dim">[RESUME]</span> loss 1.12 · f1 0.783 (+37.1%p)</p>
                <p className="text-gold flex items-center gap-2">
                  [LEDGER] SHA-256 서명 완료 — 이력은 이제 증명입니다
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                </p>
              </div>
            </div>
            {/* 겹쳐진 서명 카드 — 데스크톱은 하단 모서리만 겹치고, 모바일은 아래로 흐른다 */}
            <div className="mt-4 flex justify-end sm:block sm:mt-0 sm:absolute sm:-bottom-16 sm:right-6 sm:animate-drift">
              <div className="glass-card rounded-2xl p-4 w-60 border-gold/25">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-mist">Verified Ledger</span>
                  <span className="w-6 h-6 rounded-full bg-gold/15 flex items-center justify-center">
                    <ArrowUpRight className="w-3 h-3 text-gold" />
                  </span>
                </div>
                <p className="font-mono text-[11px] text-gold truncate">sha256: 8a07f3c1d2e9b4… <span className="text-dim">(예시)</span></p>
                <p className="text-[11px] text-dim mt-1.5">실제 해시는 포트폴리오에서 발급</p>
              </div>
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
                onClick={() => { onLogin('admin'); go('lms'); }}
                className="mt-7 w-full py-3 rounded-full bg-gold text-void text-sm font-semibold hover:brightness-110 transition-all"
              >
                관리자 데모로 LMS 살펴보기
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
          </nav>
          <p className="text-[12px] text-dim">© 2026 plAI-ground. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// ─── 콘솔 셸 (Operate 표면) ───────────────────────────────────────────────────
const BASE_TABS = [
  { id: 'start', label: 'Start AI' },
  { id: 'ide', label: 'Web IDE' },
  { id: 'view', label: 'View AI' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'community', label: '커뮤니티' },
];
const ADMIN_TAB = { id: 'lms', label: 'Faculty LMS' };

function ConsoleShell({ view, go, role, onLogin, onLogout, children }) {
  const tabs = role === 'admin' ? [...BASE_TABS, ADMIN_TAB] : BASE_TABS;
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
              {tabs.map((t) => (
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
            <LoginMenu role={role} onLogin={onLogin} onLogout={onLogout} />
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
  const [role, setRole] = useState(null); // null | 'student' | 'admin'
  const [session, setSession] = useState(null); // /api/setup ready 페이로드 (IDE 접속 정보)
  const [staged, setStaged] = useState(null); // 커뮤니티 '실습해보기'로 준비된 코드 정보
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

  const login = useCallback((r) => {
    setRole(r);
    addToast(r === 'admin' ? '관리자로 로그인했습니다 — Faculty LMS가 열렸습니다.' : '학생으로 로그인했습니다.');
  }, [addToast]);

  const logout = useCallback(() => {
    setRole(null);
    setView((v) => (v === 'lms' ? 'start' : v));
    addToast('로그아웃했습니다.');
  }, [addToast]);

  // LMS는 관리자 전용 — 다른 역할로 접근하면 Start AI로 대체
  const effectiveView = view === 'lms' && role !== 'admin' ? 'start' : view;

  return (
    <>
      {effectiveView === 'landing' ? (
        <Landing go={go} role={role} onLogin={login} onLogout={logout} />
      ) : (
        <ConsoleShell view={effectiveView} go={go} role={role} onLogin={login} onLogout={logout}>
          {effectiveView === 'start' && <StartAI go={go} onSession={setSession} addToast={addToast} />}
          {effectiveView === 'ide' && <IdeView session={session} staged={staged} go={go} addToast={addToast} />}
          {effectiveView === 'community' && <Community go={go} onStaged={setStaged} addToast={addToast} />}
          {effectiveView === 'view' && <ViewAI addToast={addToast} />}
          {effectiveView === 'portfolio' && <PortfolioView addToast={addToast} />}
          {effectiveView === 'lms' && <Lms go={go} addToast={addToast} />}
        </ConsoleShell>
      )}
      <Toasts toasts={toasts} remove={removeToast} />
    </>
  );
}
