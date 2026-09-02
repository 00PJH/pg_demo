import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight, CheckCircle2, Database, ExternalLink, FlaskConical,
  Loader2, Play, ShieldCheck, Wrench, XCircle,
} from 'lucide-react';

// ─── Portfolio — 실제 portfolio_demo 파이프라인 실행 + 네이티브 리포트 ────────
// 실행 버튼은 /api/portfolio/run (SSE)로 run_demo.py를 실제로 돌린다.
// 결과는 iframe이 아니라 /api/portfolio/data (스키마 JSON)를 받아
// 이 페이지의 디자인 시스템으로 직접 렌더링한다.

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

function SectionCard({ icon: Icon, tint, title, children, className = '' }) {
  return (
    <section className={`glass-card rounded-3xl p-6 sm:p-7 ${className}`}>
      <h3 className="flex items-center gap-2.5 text-[15px] font-display font-bold">
        <span className={`w-8 h-8 rounded-full flex items-center justify-center ${tint}`}>
          <Icon className="w-4 h-4" />
        </span>
        {title}
      </h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

// ─── 네이티브 포트폴리오 리포트 ───────────────────────────────────────────────
function Report({ data, telemetry }) {
  const { overview, data_engineering: de, benchmarks: bm, troubleshooting: ts, verification: vf } = data;
  const ds = telemetry?.dataset || {};
  const hp = telemetry?.benchmarks?.hyperparameters || {};
  const issuedAt = vf.generated_at ? vf.generated_at.slice(0, 19).replace('T', ' ') + ' UTC' : '';

  return (
    <div className="mt-5 space-y-5">
      {/* 리포트 헤더 — 제목·태그·무결성 서명 */}
      <header className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="min-w-0">
            <h2 className="font-display font-bold tracking-tight text-2xl leading-snug">{overview.title}</h2>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1.5 rounded-full bg-cobalt/15 text-cobalt text-[12px] font-mono">{overview.base_model}</span>
              <span className="px-3 py-1.5 rounded-full bg-white/8 text-mist text-[12px]">{overview.task_type}</span>
              <span className="px-3 py-1.5 rounded-full bg-mint/12 text-mint text-[12px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> 데이터 무결성 검증 완료
              </span>
            </div>
            <dl className="mt-5 flex items-center gap-6 flex-wrap text-[13px]">
              <div>
                <dt className="text-dim text-[11px]">하드웨어</dt>
                <dd className="font-mono text-mist mt-0.5">{vf.hardware}</dd>
              </div>
              {vf.total_training_time && vf.total_training_time.toUpperCase() !== 'N/A' && (
                <div>
                  <dt className="text-dim text-[11px]">총 학습 시간</dt>
                  <dd className="font-mono text-mist mt-0.5">{vf.total_training_time}</dd>
                </div>
              )}
              <div>
                <dt className="text-dim text-[11px]">검증 엔진</dt>
                <dd className="font-mono text-mist mt-0.5">plAI-ground / DiffStack v1.0</dd>
              </div>
            </dl>
          </div>
          {/* 서명 블록 */}
          <div className="shrink-0 lg:w-72 rounded-2xl border border-gold/25 bg-gold/5 p-5">
            <p className="flex items-center gap-2 text-[12px] font-medium text-gold">
              <ShieldCheck className="w-4 h-4" /> SHA-256 무결성 서명
            </p>
            <p className="mt-2.5 font-mono text-[11px] leading-5 text-gold/90 break-all">{vf.integrity_hash}</p>
            {issuedAt && <p className="mt-2.5 font-mono text-[11px] text-dim">발급 {issuedAt}</p>}
          </div>
        </div>
      </header>

      {/* 성능 델타 밴드 */}
      <section className="glass-card rounded-3xl p-6 sm:p-8">
        <p className="text-[12px] text-mist">{bm.evaluation_metric}</p>
        <div className="mt-3 flex items-end gap-5 flex-wrap">
          <div>
            <p className="text-[11px] text-dim">Baseline</p>
            <p className="font-display font-bold text-4xl tabular text-mist mt-1">{bm.baseline_performance}</p>
          </div>
          <ArrowRight className="w-6 h-6 text-dim mb-2" aria-hidden="true" />
          <div>
            <p className="text-[11px] text-dim">Fine-tuned</p>
            <p className="font-display font-bold text-4xl tabular text-mint mt-1">{bm.optimized_performance}</p>
          </div>
          <span className="mb-2 px-3 py-1.5 rounded-full bg-mint/12 text-mint text-[13px] font-mono font-medium">
            {bm.improvement_rate}
          </span>
        </div>
        {/* 델타 게이지 — 0~1 스케일 지표(F1 등)일 때만 축이 참이므로 그때만 그린다 */}
        {bm.baseline_performance <= 1 && bm.optimized_performance <= 1 && (
          <>
            <div className="mt-6 h-2 rounded-full bg-white/8 overflow-hidden" aria-hidden="true">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* 데이터 전처리 */}
        <SectionCard icon={Database} tint="bg-cobalt/15 text-cobalt" title="데이터 전처리">
          {ds.raw_len != null && (
            <p className="font-mono text-[13px] text-mist">
              {ds.raw_len.toLocaleString()} <span className="text-dim">→</span>{' '}
              <span className="text-cobalt font-medium">{ds.processed_len?.toLocaleString()}</span> 샘플
              {ds.reduction_rate_pct != null && <span className="text-dim"> · {ds.reduction_rate_pct}% 정제</span>}
              {ds.avg_len_before != null && (
                <span className="text-dim"> · 평균 길이 {ds.avg_len_before} → {ds.avg_len_after}</span>
              )}
            </p>
          )}
          <ul className="mt-4 space-y-2.5">
            {de.preprocessing_techniques.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[13px] text-mist leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-cobalt shrink-0 mt-1" />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-2xl bg-pit border border-line p-4 text-[13px] text-mist leading-relaxed">
            {de.data_efficiency_impact}
          </p>
        </SectionCard>

        {/* 학습 방법 · 성능 향상 */}
        <SectionCard icon={FlaskConical} tint="bg-gold/15 text-gold" title="학습 방법 · 성능 향상">
          {Object.keys(hp).length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(hp).map(([k, v]) => (
                <span key={k} className="px-2.5 py-1 rounded-full bg-white/6 border border-line font-mono text-[11px] text-mist">
                  {k}={String(v)}
                </span>
              ))}
            </div>
          )}
          <ul className="mt-4 space-y-2.5">
            {bm.optimization_methods.map((m) => (
              <li key={m} className="flex items-start gap-2.5 text-[13px] text-mist leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0 mt-1" />
                {m}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* 에러 · 문제 해결 */}
      <SectionCard icon={Wrench} tint="bg-ember/15 text-ember" title="에러 · 문제 해결">
        <span className="inline-block px-3 py-1.5 rounded-full bg-ember/12 text-ember font-mono text-[12px]">
          {ts.error_type}
        </span>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <p className="text-[12px] text-dim">근본 원인</p>
            <p className="mt-2 text-[13px] text-mist leading-relaxed">{ts.root_cause}</p>
          </div>
          <div>
            <p className="text-[12px] text-dim">해결 Code Diff</p>
            <div className="mt-2 rounded-2xl bg-pit border border-line p-4 font-mono text-[12px] leading-6 overflow-x-auto">
              {ts.resolution_diff.split('\n').map((line, i) => (
                <p key={i} className={`px-2 rounded-md whitespace-pre-wrap ${diffTone(line)}`}>{line}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-gold/25 bg-gold/5 p-5">
          <p className="text-[12px] font-medium text-gold">Engineering Takeaway</p>
          <p className="mt-2 text-[13px] text-ink leading-relaxed">{ts.engineering_takeaway}</p>
        </div>
      </SectionCard>
    </div>
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
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold tracking-tight text-3xl flex items-center gap-3">
            Portfolio
            <span className="px-2.5 py-1 rounded-full bg-gold/15 text-gold text-[11px] font-mono font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" /> VERIFIED LEDGER
            </span>
          </h1>
          <p className="mt-2 text-sm text-mist leading-relaxed max-w-xl">
            수집된 텔레메트리(에러 이력·성능 지표·Code Diff)를 LLM 서사와 SHA-256 서명이
            포함된 검증형 포트폴리오로 만듭니다. 버튼을 누르면 실제 파이프라인이 실행됩니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {report && (
            <a
              href="/api/portfolio/output"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-full border border-line text-[12px] text-mist hover:text-ink hover:border-white/25 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3 h-3" /> 원본 HTML
            </a>
          )}
          <button
            onClick={run}
            disabled={running}
            className="px-6 py-2.5 rounded-full bg-ink text-void text-[13px] font-semibold hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {running
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 파이프라인 실행 중…</>
              : <><Play className="w-3.5 h-3.5" /> 포트폴리오 생성 실행</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-ember/40 bg-ember/10 p-4 text-[13px] text-ember">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* 파이프라인 로그 */}
      {(running || logs.length > 0) && (
        <div className="mt-6 glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-medium">Pipeline Log — run_demo.py</p>
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
          <div ref={logRef} className="h-48 overflow-y-auto rounded-2xl bg-pit border border-line p-4 font-mono text-[11px] leading-6">
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
          <div className="mt-8 rounded-3xl border border-line p-10 text-center">
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
