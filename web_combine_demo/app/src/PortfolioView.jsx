import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight, CheckCircle2, Download, FileText, Loader2, Play, ShieldCheck, XCircle,
} from 'lucide-react';

// ─── Portfolio — 실제 portfolio_demo 파이프라인 실행 + 네이티브 리포트 ────────
// 실행 버튼은 /api/portfolio/run (SSE)로 run_demo.py를 실제로 돌리고,
// /api/portfolio/data (스키마 JSON)를 받아 하나의 괘선 시트로 렌더링한다.
// 내보내기: MD는 백엔드가 실제 .md 파일을 내려주고, PDF는 브라우저 인쇄를 쓴다.

function lineTone(line) {
  if (line.includes('✅') || line.includes('[OK]')) return 'text-mint';
  if (line.startsWith('[Step')) return 'text-cobalt';
  if (line.includes('Error') || line.includes('Traceback') || line.includes('실패')) return 'text-ember';
  if (line.startsWith('=')) return 'text-dim';
  return 'text-mist';
}

function diffTone(line) {
  const t = line.trimStart();
  if (t.startsWith('-')) return 'text-ember bg-ember/10';
  if (t.startsWith('+')) return 'text-mint bg-mint/10';
  return 'text-mist';
}

// LLM의 STAR 서술문("상황: … 과제: … 조치: … 결과: …")을 라벨 불릿으로 분해.
// 마커가 없으면 문장 단위 불릿으로 폴백한다.
function starBullets(text) {
  if (!text) return [];
  const matches = [...text.matchAll(/(상황|과제|조치|결과)\s*:\s*([^]*?)(?=(?:상황|과제|조치|결과)\s*:|$)/g)];
  if (matches.length >= 2) {
    return matches.map((m) => ({ label: m[1], body: m[2].trim().replace(/^[,.\s]+|[\s,]+$/g, '') }));
  }
  return text
    .split(/(?<=다\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((body) => ({ label: null, body }));
}

function Bullets({ text, accent = 'text-dim' }) {
  return (
    <ul className="space-y-1.5">
      {starBullets(text).map((b, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed">
          {b.label
            ? <span className={`font-mono text-[11px] mt-0.5 w-7 shrink-0 ${accent}`}>{b.label}</span>
            : <span className={`mt-2 w-1 h-1 rounded-full bg-current shrink-0 ${accent}`} />}
          <span className="text-mist">{b.body}</span>
        </li>
      ))}
    </ul>
  );
}

// 문서형 섹션 헤딩 — 모노 소형 라벨이 곧 제목
function SecHead({ children }) {
  return <h3 className="font-mono text-[11px] tracking-[0.15em] uppercase text-dim">{children}</h3>;
}

// ─── 네이티브 포트폴리오 리포트 — 하나의 괘선 시트 ────────────────────────────
function Report({ data, telemetry }) {
  const { overview, data_engineering: de, benchmarks: bm, troubleshooting: ts, verification: vf } = data;
  const ds = telemetry?.dataset || {};
  const hp = telemetry?.benchmarks?.hyperparameters || {};
  const issuedAt = vf.generated_at ? vf.generated_at.slice(0, 19).replace('T', ' ') + ' UTC' : '';

  return (
    <article className="mt-6 border border-line rounded-lg divide-y divide-line">
      {/* 1. 무엇을 — 제목·메타·서명 */}
      <header className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        <div className="min-w-0">
          <h2 className="font-display font-bold tracking-tight text-2xl leading-snug">{overview.title}</h2>
          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-[13px]">
            {[
              ['기반 모델', overview.base_model],
              ['태스크', overview.task_type],
              ['하드웨어', vf.hardware],
              ['검증 엔진', 'plAI-ground / DiffStack v1.0'],
              ...(vf.total_training_time && vf.total_training_time.toUpperCase() !== 'N/A'
                ? [['총 학습 시간', vf.total_training_time]] : []),
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-dim">{k}</dt>
                <dd className="font-mono text-mist">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:border-l lg:border-line lg:pl-8">
          <p className="flex items-center gap-2 text-[12px] font-medium text-gold">
            <ShieldCheck className="w-4 h-4" /> SHA-256 무결성 서명
          </p>
          <p className="mt-2 font-mono text-[11px] leading-5 text-gold/90 break-all">{vf.integrity_hash}</p>
          {issuedAt && <p className="mt-2 font-mono text-[11px] text-dim">발급 {issuedAt}</p>}
          <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-mint">
            <CheckCircle2 className="w-3 h-3" /> 데이터 무결성 검증 완료
          </p>
        </div>
      </header>

      {/* 2. 얼마나 — 성능 델타 */}
      <section className="p-6 sm:p-8">
        <SecHead>성능 벤치마크 — {bm.evaluation_metric}</SecHead>
        <div className="mt-4 flex items-end gap-5 flex-wrap">
          <div>
            <p className="text-[11px] text-dim">Baseline</p>
            <p className="font-display font-bold text-4xl tabular text-mist mt-1">{bm.baseline_performance}</p>
          </div>
          <ArrowRight className="w-6 h-6 text-dim mb-2" aria-hidden="true" />
          <div>
            <p className="text-[11px] text-dim">Fine-tuned</p>
            <p className="font-display font-bold text-4xl tabular text-mint mt-1">{bm.optimized_performance}</p>
          </div>
          <span className="mb-2 font-mono text-[15px] font-medium text-mint">{bm.improvement_rate}</span>
        </div>
        {bm.baseline_performance <= 1 && bm.optimized_performance <= 1 && (
          <>
            <div className="mt-5 h-1.5 rounded-full bg-white/8 overflow-hidden" aria-hidden="true">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cobalt/70 to-mint transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(4, bm.optimized_performance * 100))}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[11px] text-dim" aria-hidden="true">
              <span>0.0</span>
              <span>1.0</span>
            </div>
          </>
        )}
      </section>

      {/* 3. 어떻게 — 전처리 | 학습 방법 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-line">
        <section className="p-6 sm:p-8">
          <SecHead>데이터 전처리</SecHead>
          {ds.raw_len != null && (
            <p className="mt-4 font-mono text-[13px] text-mist">
              {ds.raw_len.toLocaleString()} <span className="text-dim">→</span>{' '}
              <span className="text-cobalt font-medium">{ds.processed_len?.toLocaleString()}</span> 샘플
              {ds.reduction_rate_pct != null && <span className="text-dim"> · {ds.reduction_rate_pct}% 정제</span>}
            </p>
          )}
          <ul className="mt-4 space-y-1.5">
            {de.preprocessing_techniques.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[13px] text-mist leading-relaxed">
                <span className="mt-2 w-1 h-1 rounded-full bg-cobalt shrink-0" />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-4 border-t border-line">
            <Bullets text={de.data_efficiency_impact} accent="text-cobalt" />
          </div>
        </section>

        <section className="p-6 sm:p-8">
          <SecHead>학습 방법 · 성능 향상</SecHead>
          {Object.keys(hp).length > 0 && (
            <p className="mt-4 font-mono text-[12px] text-mist leading-6">
              {Object.entries(hp).map(([k, v]) => `${k}=${v}`).join(' · ')}
            </p>
          )}
          <ul className="mt-4 space-y-1.5">
            {bm.optimization_methods.map((m) => (
              <li key={m} className="flex items-start gap-2.5 text-[13px] text-mist leading-relaxed">
                <span className="mt-2 w-1 h-1 rounded-full bg-gold shrink-0" />
                {m}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 4. 무엇을 극복 — 에러·문제 해결 */}
      <section className="p-6 sm:p-8">
        <SecHead>에러 · 문제 해결</SecHead>
        <p className="mt-4 font-mono text-[13px] text-ember">{ts.error_type}</p>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-5">
          <div>
            <p className="text-[12px] text-dim mb-2">근본 원인</p>
            <Bullets text={ts.root_cause} accent="text-ember" />
          </div>
          <div>
            <p className="text-[12px] text-dim mb-2">해결 Code Diff</p>
            <div className="rounded-md bg-pit border border-line p-4 font-mono text-[12px] leading-6 overflow-x-auto">
              {ts.resolution_diff.split('\n').map((line, i) => (
                <p key={i} className={`px-2 rounded whitespace-pre-wrap ${diffTone(line)}`}>{line}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 pt-5 border-t border-line">
          <p className="text-[12px] font-medium text-gold mb-2">Engineering Takeaway</p>
          <Bullets text={ts.engineering_takeaway} accent="text-gold" />
        </div>
      </section>
    </article>
  );
}

export default function PortfolioView({ addToast }) {
  const [telemetry, setTelemetry] = useState(null);
  const [report, setReport] = useState(null); // /api/portfolio/data — 스키마 JSON
  const [phase, setPhase] = useState('idle'); // idle | running | done | error
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const logRef = useRef(null);
  const sourceRef = useRef(null);

  const loadAll = useCallback(() => {
    fetch('/api/portfolio/telemetry')
      .then((r) => r.json())
      .then(setTelemetry)
      .catch(() => setError('API 서버에 연결할 수 없습니다. `python -m web_combine_demo.api_server`를 실행하세요.'));
    fetch('/api/portfolio/data')
      .then((r) => (r.ok ? r.json() : null))
      .then(setReport)
      .catch(() => {});
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);
  useEffect(() => () => sourceRef.current?.close(), []);

  const run = useCallback(() => {
    setLogs([]);
    setError('');
    setPhase('running');

    const source = new EventSource('/api/portfolio/run');
    sourceRef.current = source;

    source.addEventListener('log', (e) => setLogs((prev) => [...prev, JSON.parse(e.data)]));
    source.addEventListener('ready', (e) => {
      source.close();
      const payload = JSON.parse(e.data);
      setTelemetry(payload.telemetry);
      fetch('/api/portfolio/data').then((r) => (r.ok ? r.json() : null)).then(setReport).catch(() => {});
      setPhase('done');
      addToast?.('포트폴리오 생성 완료 — 아래에서 결과를 확인하세요.');
    });
    source.addEventListener('error', (e) => {
      source.close();
      setError(e.data ? JSON.parse(e.data) : '스트림이 끊겼습니다. 서버 로그를 확인하세요.');
      setPhase('error');
    });
  }, [addToast]);

  const running = phase === 'running';

  return (
    <div className="max-w-5xl mx-auto px-6 pb-20">
      <div className="flex items-start justify-between flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="font-display font-bold tracking-tight text-3xl flex items-center gap-3">
            Portfolio
            <span className="font-mono text-[11px] font-medium text-gold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED LEDGER
            </span>
          </h1>
          <p className="mt-2 text-sm text-mist leading-relaxed max-w-xl">
            수집된 텔레메트리(에러 이력·성능 지표·Code Diff)를 LLM 서사와 SHA-256 서명이
            포함된 검증형 포트폴리오로 만듭니다. 버튼을 누르면 실제 파이프라인이 실행됩니다.
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {report && (
            <>
              <a
                href="/api/portfolio/export.md"
                download
                className="px-3.5 py-2 rounded-md border border-line text-[12px] text-mist hover:text-ink hover:border-white/25 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> MD 내보내기
              </a>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-md border border-line text-[12px] text-mist hover:text-ink hover:border-white/25 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> PDF로 저장
              </button>
            </>
          )}
          <button
            onClick={run}
            disabled={running}
            className="px-4 py-2 rounded-md bg-ink text-void text-[13px] font-semibold hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {running
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 파이프라인 실행 중…</>
              : <><Play className="w-3.5 h-3.5" /> 포트폴리오 생성 실행</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-2.5 rounded-md border border-ember/40 bg-ember/10 p-4 text-[13px] text-ember print:hidden">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* 파이프라인 로그 */}
      {(running || logs.length > 0) && (
        <div className="mt-6 border border-line rounded-lg p-5 print:hidden">
          <div className="flex items-center justify-between mb-3">
            <SecHead>Pipeline Log — run_demo.py</SecHead>
            <span className="text-[12px] flex items-center gap-1.5">
              {running
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin text-cobalt" /><span className="text-cobalt">RUNNING</span></>
                : phase === 'done'
                  ? <><CheckCircle2 className="w-3.5 h-3.5 text-mint" /><span className="text-mint">COMPLETE</span></>
                  : phase === 'error'
                    ? <><XCircle className="w-3.5 h-3.5 text-ember" /><span className="text-ember">FAILED</span></>
                    : null}
            </span>
          </div>
          <div ref={logRef} className="h-44 overflow-y-auto rounded-md bg-pit border border-line p-4 font-mono text-[11px] leading-6">
            {logs.length === 0 && <p className="text-dim">파이프라인을 시작하는 중입니다…</p>}
            {logs.map((line, i) => (
              <p key={i} className={`whitespace-pre-wrap break-all ${lineTone(line)}`}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* 네이티브 리포트 */}
      {report ? (
        <Report data={report} telemetry={telemetry} />
      ) : (
        !running && (
          <div className="mt-8 border border-line rounded-lg p-10 text-center">
            <p className="font-display font-bold text-lg">아직 생성된 포트폴리오가 없습니다</p>
            <p className="mt-2 text-[13px] text-mist leading-relaxed">
              위의 실행 버튼을 누르면 데모 파이프라인이 에러 캡처부터 포트폴리오 생성까지
              전 과정을 실행하고, 결과가 이 자리에 렌더링됩니다.
            </p>
          </div>
        )
      )}
    </div>
  );
}
