import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Sparkles, CheckCircle2, AlertTriangle, Play,
  Terminal, ExternalLink, Loader2, XCircle,
} from 'lucide-react';

// ─── 실제 ai_set_demo 파이프라인에 연결된 4단계 위저드 ─────────────────────────
// 목업이 아니라 /api/status, /api/models, /api/setup(SSE)을 그대로 호출한다.
// 학습은 여기서 돌리지 않는다 — 환경 세팅과 코드 생성까지만 하고,
// 사용자가 웹 IDE(code-server)에 들어가서 직접 실행한다.
// 백엔드: python -m ai_set_demo.api_server

const STEPS = ['1. 환경 감지', '2. 모델 선택', '3. 환경 세팅', '4. Web IDE'];

// 로그 한 줄의 성격에 따라 색을 고른다. 로그가 길어지면 눈으로 단계를 못 따라간다.
function lineTone(line) {
  if (line.startsWith('경고') || line.includes('  경고:') || line.startsWith('Warning')) return 'text-amber-400';
  if (line.startsWith('완료') || line.includes('✅')) return 'text-emerald-400';
  if (/^\[\d\/\d\]/.test(line)) return 'text-blue-400 font-bold';
  if (line.includes('Traceback') || line.includes('Error') || line.includes('실패')) return 'text-rose-400';
  return 'text-slate-400';
}

function StatusRow({ ok, label, value }) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-sm text-[11px] font-mono">
      <span className="text-slate-400">{label}</span>
      <span className={`flex items-center gap-1.5 font-bold ${ok ? 'text-emerald-400' : 'text-rose-400'}`}>
        {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
        {value}
      </span>
    </div>
  );
}

export default function LiveRunner({ onClose, onReady, addToast }) {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState(null);
  const [models, setModels] = useState([]);
  const [selected, setSelected] = useState('');
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const logRef = useRef(null);
  const sourceRef = useRef(null);

  // 환경 상태 + 모델 목록을 함께 불러온다.
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
      .catch(() => setError('API 서버에 연결할 수 없습니다. `python -m ai_set_demo.api_server`를 실행하세요.'));
  }, []);

  // 새 로그가 붙으면 항상 마지막 줄이 보이게.
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // 모달을 닫으면 스트림도 닫는다.
  useEffect(() => () => sourceRef.current?.close(), []);

  const start = useCallback(() => {
    setLogs([]);
    setError('');
    setSession(null);
    setStep(3);

    const source = new EventSource(`/api/setup?model_id=${encodeURIComponent(selected)}`);
    sourceRef.current = source;

    source.addEventListener('log', (e) => {
      setLogs((prev) => [...prev, JSON.parse(e.data)]);
    });
    source.addEventListener('ready', (e) => {
      source.close();
      setSession(JSON.parse(e.data));
      setStep(4);
      addToast?.('환경 세팅 완료. 웹 IDE에서 학습을 실행하세요.');
    });
    source.addEventListener('error', (e) => {
      source.close();
      setError(e.data ? JSON.parse(e.data) : '스트림이 끊겼습니다. 서버 로그를 확인하세요.');
      setStep(4);
    });
  }, [selected, addToast]);

  const running = step === 3;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B0F19] border border-slate-800 rounded-md max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          aria-label="Close wizard"
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
            Start AI — 실제 파이프라인 실행
          </h2>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900">
            LIVE
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-[10px] font-mono border-y border-slate-800 py-3">
          {STEPS.map((label, idx) => (
            <div
              key={label}
              className={`px-2 py-1 rounded text-center font-bold ${
                step === idx + 1
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : step > idx + 1
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-rose-950/50 border border-rose-900 rounded-sm text-xs font-mono text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* STEP 1 — 실제 감지 결과 */}
        {step === 1 && (
          <div className="space-y-3">
            {!status && !error && (
              <p className="text-xs font-mono text-slate-500 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> 환경 감지 중...
              </p>
            )}
            {status && (
              <>
                <div className="space-y-2">
                  <StatusRow ok={status.docker_running} label="Docker 데몬" value={status.docker_running ? 'RUNNING' : 'STOPPED'} />
                  <StatusRow ok={status.image_exists} label={`베이스 이미지 (${status.image})`} value={status.image_exists ? 'READY' : 'MISSING'} />
                  <StatusRow ok={!!status.gpu_name} label="감지된 GPU" value={status.gpu_name || 'NOT DETECTED'} />
                  {status.driver_version && (
                    <StatusRow ok label="NVIDIA 드라이버" value={status.driver_version} />
                  )}
                </div>
                {!status.docker_running && (
                  <p className="text-[11px] font-mono text-amber-400">
                    Docker Desktop을 먼저 실행하세요.
                  </p>
                )}
                {status.docker_running && !status.image_exists && (
                  <p className="text-[11px] font-mono text-amber-400 leading-relaxed">
                    ai_set_demo/docker/plaiground-base 에서 <br />
                    <code>docker build -t {status.image} .</code> 를 먼저 실행하세요.
                  </p>
                )}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!status.docker_running || !status.image_exists}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-sm border border-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                  >
                    다음: 모델 선택 &rarr;
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 2 — 실제 카탈로그 */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 font-sans">
              ModelCatalog에 등록된 모델입니다. 선택하면 환경 세팅부터 학습까지 자동 실행됩니다.
            </p>
            <div className="space-y-2" role="radiogroup" aria-label="AI model">
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
                  className={`p-3 border rounded-sm cursor-pointer text-xs font-mono transition-all focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${
                    selected === m.model_id
                      ? 'border-blue-500 bg-slate-900 text-slate-100'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between font-bold text-slate-200 mb-1">
                    <span>{m.model_id}</span>
                    <span className="text-blue-400">
                      {m.min_vram_gb > 0 ? `${m.min_vram_gb}GB+ VRAM` : 'GPU 불필요'}
                    </span>
                  </div>
                  <p className="text-[11px] font-sans text-slate-400">{m.task_type} · {m.dataset_name}</p>
                  <p className="text-[11px] text-slate-500 mt-1">base: {m.base_model}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-1">
              <button
                onClick={() => setStep(1)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 font-mono text-xs rounded-sm border border-slate-800 transition-all"
              >
                &larr; Back
              </button>
              <button
                onClick={start}
                disabled={!selected}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-sm border border-blue-500 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              >
                <Play className="w-3.5 h-3.5" />
                실행 &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 & 4 — 실시간 로그 콘솔 */}
        {(step === 3 || step === 4) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                {selected}
              </span>
              <span className="text-[11px] font-mono flex items-center gap-1.5">
                {running ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" /><span className="text-blue-400">PROVISIONING</span></>
                ) : error ? (
                  <><XCircle className="w-3.5 h-3.5 text-rose-400" /><span className="text-rose-400">FAILED</span></>
                ) : (
                  <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">READY</span></>
                )}
              </span>
            </div>

            <div
              ref={logRef}
              className="h-72 overflow-y-auto bg-slate-950 border border-slate-800 rounded-sm p-3 font-mono text-[11px] leading-5 space-y-0.5"
            >
              {logs.length === 0 && (
                <p className="text-slate-500">컨테이너를 준비하는 중입니다...</p>
              )}
              {logs.map((line, i) => (
                <p key={i} className={`whitespace-pre-wrap break-all ${lineTone(line)}`}>{line}</p>
              ))}
            </div>

            {step === 4 && !error && session && (
              <>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-sm space-y-2 text-[11px] font-mono">
                  <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    환경 세팅 완료 — 학습은 웹 IDE에서 직접 실행합니다
                  </p>
                  <p className="text-slate-400">
                    생성된 코드: <span className="text-slate-200">{session.script_path}</span>
                  </p>
                  <p className="text-slate-400">
                    IDE 터미널에서: <span className="text-blue-400">{session.run_command}</span>
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => { onReady?.(session); onClose(); }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-sm border border-emerald-500 transition-all flex items-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Web IDE 열기 &rarr;
                  </button>
                </div>
              </>
            )}
            {step === 4 && error && (
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs rounded-sm border border-slate-700 transition-all"
                >
                  &larr; 모델 다시 선택
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
