import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle, ArrowRight, CheckCircle2, ExternalLink, Loader2, Play, XCircle,
} from 'lucide-react';

// ─── Start AI — 실제 ai_set_demo 파이프라인 위저드 ────────────────────────────
// /api/status, /api/models, /api/setup(SSE)을 그대로 호출한다. 목업 아님.
// 학습은 여기서 돌리지 않는다 — 세팅과 코드 생성까지만 하고 Web IDE로 넘긴다.

const STEPS = ['환경 감지', '모델 선택', '환경 세팅', 'Web IDE'];

function lineTone(line) {
  if (line.startsWith('경고') || line.includes('  경고:') || line.startsWith('Warning')) return 'text-amber-300';
  if (line.startsWith('완료') || line.includes('✅')) return 'text-mint';
  if (/^\[\d\/\d\]/.test(line)) return 'text-cobalt font-medium';
  if (line.includes('Traceback') || line.includes('Error') || line.includes('실패')) return 'text-ember';
  return 'text-mist';
}

function StatusRow({ ok, label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-[13px]">
      <span className="text-mist">{label}</span>
      <span className={`flex items-center gap-1.5 font-medium font-mono text-[12px] ${ok ? 'text-mint' : 'text-ember'}`}>
        {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
        {value}
      </span>
    </div>
  );
}

export default function StartAI({ go, onSession, addToast }) {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState(null);
  const [models, setModels] = useState([]);
  const [selected, setSelected] = useState('');
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const logRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/status').then((r) => r.json()),
      fetch('/api/models').then((r) => r.json()),
    ])
      .then(([s, m]) => {
        setStatus(s);
        setModels(m);
        setSelected(m[0]?.model_id ?? '');
      })
      .catch(() => setError('API 서버에 연결할 수 없습니다. `python -m web_combine_demo.api_server`를 실행하세요.'));
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => () => sourceRef.current?.close(), []);

  const start = useCallback(() => {
    setLogs([]);
    setError('');
    setSession(null);
    setStep(3);

    const source = new EventSource(`/api/setup?model_id=${encodeURIComponent(selected)}`);
    sourceRef.current = source;

    source.addEventListener('log', (e) => setLogs((prev) => [...prev, JSON.parse(e.data)]));
    source.addEventListener('ready', (e) => {
      source.close();
      const payload = JSON.parse(e.data);
      setSession(payload);
      onSession?.(payload);
      setStep(4);
      addToast?.('환경 세팅 완료 — Web IDE에서 학습을 실행하세요.');
    });
    source.addEventListener('error', (e) => {
      source.close();
      setError(e.data ? JSON.parse(e.data) : '스트림이 끊겼습니다. 서버 로그를 확인하세요.');
      setStep(4);
    });
  }, [selected, onSession, addToast]);

  const running = step === 3;

  return (
    <div className="max-w-3xl mx-auto px-6 pb-20">
      <h1 className="font-display font-bold tracking-tight text-3xl">Start AI</h1>
      <p className="mt-2 text-sm text-mist leading-relaxed">
        하드웨어 감지부터 컨테이너 기동까지 실제 파이프라인이 실행됩니다. 세팅이 끝나면
        생성된 학습 코드가 열린 Web IDE로 이동합니다.
      </p>

      {/* 스텝 인디케이터 */}
      <ol className="mt-8 grid grid-cols-4 gap-2">
        {STEPS.map((label, idx) => {
          const n = idx + 1;
          const state = step === n ? 'current' : step > n ? 'done' : 'todo';
          return (
            <li
              key={label}
              aria-current={state === 'current' ? 'step' : undefined}
              className={`rounded-full px-3 py-2 text-center text-[12px] font-medium transition-colors ${
                state === 'current'
                  ? 'bg-ink text-void'
                  : state === 'done'
                    ? 'bg-mint/15 text-mint border border-mint/30'
                    : 'border border-line text-dim'
              }`}
            >
              {n}. {label}
            </li>
          );
        })}
      </ol>

      {error && (
        <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-ember/40 bg-ember/10 p-4 text-[13px] text-ember">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* STEP 1 — 실제 감지 결과 */}
      {step === 1 && (
        <div className="mt-6 space-y-3">
          {!status && !error && (
            <p className="text-[13px] text-dim flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> 환경 감지 중…
            </p>
          )}
          {status && (
            <>
              {/* 같은 성격의 상태 행은 하나의 괘선 목록으로 */}
              <div className="border border-line rounded-md divide-y divide-line bg-pit/40">
                <StatusRow ok={status.docker_running} label="Docker 데몬" value={status.docker_running ? 'RUNNING' : 'STOPPED'} />
                <StatusRow ok={status.image_exists} label={`베이스 이미지 (${status.image})`} value={status.image_exists ? 'READY' : 'MISSING'} />
                <StatusRow ok={!!status.gpu_name} label="감지된 GPU" value={status.gpu_name || 'NOT DETECTED'} />
                {status.driver_version && <StatusRow ok label="NVIDIA 드라이버" value={status.driver_version} />}
              </div>

              {!status.docker_running && (
                <p className="text-[12px] text-amber-300">Docker Desktop을 먼저 실행하세요.</p>
              )}
              {status.docker_running && !status.image_exists && (
                <p className="text-[12px] text-amber-300 leading-relaxed">
                  ai_set_demo/docker/plaiground-base 에서 <code className="font-mono">docker build -t {status.image} .</code> 를 먼저 실행하세요.
                </p>
              )}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setStep(2)}
                  disabled={!status.docker_running || !status.image_exists}
                  className="px-6 py-2.5 rounded-full bg-ink text-void text-[13px] font-semibold hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  모델 선택으로 <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 2 — 실제 카탈로그 */}
      {step === 2 && (
        <div className="mt-6 space-y-3">
          <div className="space-y-2.5" role="radiogroup" aria-label="AI 모델 선택">
            {models.map((m) => (
              <div
                key={m.model_id}
                role="radio"
                aria-checked={selected === m.model_id}
                tabIndex={0}
                onClick={() => setSelected(m.model_id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(m.model_id); }
                }}
                className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                  selected === m.model_id
                    ? 'border-gold/60 bg-gold/5'
                    : 'border-line bg-pit hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display font-bold text-[15px]">{m.model_id}</span>
                  <span className="font-mono text-[11px] text-cobalt">
                    {m.min_vram_gb > 0 ? `${m.min_vram_gb}GB+ VRAM` : 'GPU 불필요'}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-mist">{m.task_type} · {m.dataset_name}</p>
                <p className="mt-0.5 font-mono text-[11px] text-dim">base: {m.base_model}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-full border border-line text-[13px] text-mist hover:text-ink hover:border-white/25 transition-colors"
            >
              뒤로
            </button>
            <button
              onClick={start}
              disabled={!selected}
              className="px-6 py-2.5 rounded-full bg-ink text-void text-[13px] font-semibold hover:bg-white transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5" /> 환경 세팅 실행
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 & 4 — 실시간 로그 */}
      {(step === 3 || step === 4) && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[12px] text-mist">{selected}</span>
            <span className="text-[12px] font-medium flex items-center gap-1.5">
              {running ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin text-cobalt" /><span className="text-cobalt">PROVISIONING</span></>
              ) : error ? (
                <><XCircle className="w-3.5 h-3.5 text-ember" /><span className="text-ember">FAILED</span></>
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5 text-mint" /><span className="text-mint">READY</span></>
              )}
            </span>
          </div>

          <div
            ref={logRef}
            className="h-72 overflow-y-auto rounded-lg border border-line bg-pit p-4 font-mono text-[12px] leading-6"
          >
            {logs.length === 0 && <p className="text-dim">컨테이너를 준비하는 중입니다…</p>}
            {logs.map((line, i) => (
              <p key={i} className={`whitespace-pre-wrap break-all ${lineTone(line)}`}>{line}</p>
            ))}
          </div>

          {step === 4 && !error && session && (
            <div className="rounded-lg border border-mint/30 bg-mint/5 p-5 space-y-3">
              <p className="text-[13px] font-medium text-mint flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                환경 세팅 완료 — 학습은 Web IDE에서 직접 실행합니다
              </p>
              <p className="text-[13px] text-mist">
                생성된 코드 <code className="font-mono text-ink">{session.script_path}</code>
              </p>
              <p className="text-[13px] text-mist">
                IDE 터미널에서 <code className="font-mono text-cobalt">{session.run_command}</code>
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => go('ide')}
                  className="px-6 py-2.5 rounded-full bg-mint text-void text-[13px] font-semibold hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Web IDE 열기
                </button>
              </div>
            </div>
          )}
          {step === 4 && error && (
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-full border border-line text-[13px] text-mist hover:text-ink transition-colors"
              >
                모델 다시 선택
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
