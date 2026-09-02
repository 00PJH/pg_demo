import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, ExternalLink, Loader2, Play, ShieldCheck, XCircle } from 'lucide-react';

// ─── Portfolio — 실제 portfolio_demo 파이프라인 실행 + 결과 임베드 ────────────
// 실행 버튼은 /api/portfolio/run (SSE)로 run_demo.py를 실제로 돌린다:
// 인터셉터 → 텔레메트리 → LLM(Gemini/Mock) 서사 생성 → HTML 렌더.
// 결과물 portfolio_output.html은 /api/portfolio/output 으로 임베드된다.

function lineTone(line) {
  if (line.includes('✅') || line.includes('[OK]')) return 'text-mint';
  if (line.startsWith('[Step')) return 'text-cobalt';
  if (line.includes('Error') || line.includes('Traceback') || line.includes('실패')) return 'text-ember';
  if (line.startsWith('=')) return 'text-dim';
  return 'text-mist';
}

function Stat({ label, value, sub, color = '#f2f0eb' }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-[12px] text-mist">{label}</p>
      <p className="mt-1 font-display font-bold text-xl tabular truncate" style={{ color }}>{value}</p>
      {sub && <p className="mt-1 text-[11px] text-dim truncate">{sub}</p>}
    </div>
  );
}

export default function PortfolioView({ addToast }) {
  const [telemetry, setTelemetry] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | running | done | error
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [outputKey, setOutputKey] = useState(0); // iframe 강제 새로고침용
  const logRef = useRef(null);
  const sourceRef = useRef(null);

  const loadTelemetry = useCallback(() => {
    fetch('/api/portfolio/telemetry')
      .then((r) => r.json())
      .then(setTelemetry)
      .catch(() => setError('API 서버에 연결할 수 없습니다. `python -m web_combine_demo.api_server`를 실행하세요.'));
  }, []);

  useEffect(() => { loadTelemetry(); }, [loadTelemetry]);
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
      setPhase('done');
      setOutputKey((k) => k + 1);
      addToast?.('포트폴리오 생성 완료 — 아래에서 결과를 확인하세요.');
    });
    source.addEventListener('error', (e) => {
      source.close();
      setError(e.data ? JSON.parse(e.data) : '스트림이 끊겼습니다. 서버 로그를 확인하세요.');
      setPhase('error');
    });
  }, [addToast]);

  const bench = telemetry?.benchmarks;
  const f1Before = bench?.baseline?.eval_f1 ?? bench?.baseline?.f1;
  const f1After = bench?.final?.eval_f1 ?? bench?.final?.f1;
  const running = phase === 'running';
  const hasOutput = telemetry?.output_exists || phase === 'done';

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
            포함된 1페이지 포트폴리오로 렌더링합니다. 버튼을 누르면 실제 파이프라인이 실행됩니다.
          </p>
        </div>
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

      {error && (
        <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-ember/40 bg-ember/10 p-4 text-[13px] text-ember">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* 텔레메트리 요약 — 실측값 */}
      {telemetry?.exists && (
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            label="프로젝트"
            value={telemetry.overview?.project_name || '—'}
            sub={telemetry.overview?.task_type}
          />
          <Stat
            label="F1 Score 델타"
            value={f1Before != null && f1After != null ? `${f1Before.toFixed(3)} → ${f1After.toFixed(3)}` : '—'}
            sub={f1Before != null && f1After != null ? `+${((f1After - f1Before) * 100).toFixed(1)}%p 상승` : undefined}
            color="#4ade9b"
          />
          <Stat
            label="해결된 예외"
            value={`${telemetry.error_count}건`}
            sub={telemetry.last_error_type ? `최근: ${telemetry.last_error_type}` : undefined}
            color="#fb7185"
          />
          <Stat
            label="데이터셋 정제"
            value={
              telemetry.dataset?.raw_len
                ? `${telemetry.dataset.raw_len.toLocaleString()} → ${telemetry.dataset.processed_len.toLocaleString()}`
                : '—'
            }
            sub={telemetry.dataset?.reduction_rate_pct != null ? `${telemetry.dataset.reduction_rate_pct}% 제거` : undefined}
            color="#5b78ff"
          />
        </div>
      )}

      {/* 파이프라인 로그 */}
      {(running || logs.length > 0) && (
        <div className="mt-5 glass-card rounded-3xl p-6">
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
          <div ref={logRef} className="h-56 overflow-y-auto rounded-2xl bg-pit border border-line p-4 font-mono text-[11px] leading-6">
            {logs.length === 0 && <p className="text-dim">파이프라인을 시작하는 중입니다…</p>}
            {logs.map((line, i) => (
              <p key={i} className={`whitespace-pre-wrap break-all ${lineTone(line)}`}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* 생성된 포트폴리오 임베드 */}
      {hasOutput ? (
        <div className="mt-5 glass-card rounded-3xl overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-line">
            <p className="text-[13px] font-medium">portfolio_output.html</p>
            <a
              href="/api/portfolio/output"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-full border border-line text-[12px] text-mist hover:text-ink hover:border-white/25 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3 h-3" /> 새 탭에서 열기
            </a>
          </div>
          <iframe
            key={outputKey}
            src="/api/portfolio/output"
            title="생성된 검증형 포트폴리오"
            className="w-full h-[72vh] bg-pit"
          />
        </div>
      ) : (
        telemetry && !telemetry.exists && !running && (
          <div className="mt-8 rounded-3xl border border-line p-10 text-center">
            <p className="font-display font-bold text-lg">아직 수집된 텔레메트리가 없습니다</p>
            <p className="mt-2 text-[13px] text-mist leading-relaxed">
              위의 실행 버튼을 누르면 데모 파이프라인이 에러 캡처부터 포트폴리오 렌더링까지
              전 과정을 실행하고 결과를 이 자리에 표시합니다.
            </p>
          </div>
        )
      )}
    </div>
  );
}
