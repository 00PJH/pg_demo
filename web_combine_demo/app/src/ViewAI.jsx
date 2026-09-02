import { useEffect, useRef, useState } from 'react';
import { Activity, Pause, Play } from 'lucide-react';

// ─── View AI — 학습 시각화 (시뮬레이션) ───────────────────────────────────────
// 실시간 텔레메트리 스트림 백엔드는 아직 없다. 화면 전체가 시뮬레이션이며
// 헤더에 SIMULATION 배지로 명시한다. 곡선·게이지·로그가 틱마다 함께 진행된다.

const TOTAL_EPOCHS = 20;

function simLoss(epoch) {
  // 1.84 → 0.14 로 수렴하는 지수 감쇠 + 약간의 노이즈
  return Math.max(0.14, 1.84 * Math.exp(-0.13 * epoch) + (Math.random() - 0.5) * 0.03);
}

function Gauge({ label, value, max, unit, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-[12px] mb-1.5">
        <span className="text-mist">{label}</span>
        <span className="font-mono tabular" style={{ color }}>{value}{unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function ViewAI({ addToast }) {
  const [running, setRunning] = useState(true);
  const [points, setPoints] = useState([{ epoch: 0, loss: 1.84 }]);
  const [vram, setVram] = useState(7.8);
  const [util, setUtil] = useState(93);
  const [temp, setTemp] = useState(62);
  const logRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setPoints((prev) => {
        if (prev.length > TOTAL_EPOCHS) return prev;
        const epoch = prev.length;
        return [...prev, { epoch, loss: simLoss(epoch) }];
      });
      setVram(+(7.6 + Math.random() * 0.5).toFixed(1));
      setUtil(Math.round(90 + Math.random() * 8));
      setTemp(Math.round(60 + Math.random() * 6));
    }, 1200);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [points]);

  const epoch = points.length - 1;
  const loss = points[points.length - 1].loss;
  const acc = Math.min(0.895, 0.62 + (epoch / TOTAL_EPOCHS) * 0.28);
  const done = epoch >= TOTAL_EPOCHS;

  // SVG 경로 (0~20 epoch, loss 0~2)
  const W = 640, H = 200;
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${(p.epoch / TOTAL_EPOCHS) * W},${H - (p.loss / 2) * H}`)
    .join(' ');
  const last = points[points.length - 1];
  const lastX = (last.epoch / TOTAL_EPOCHS) * W;
  const lastY = H - (last.loss / 2) * H;

  return (
    <div className="max-w-5xl mx-auto px-6 pb-20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold tracking-tight text-3xl flex items-center gap-3">
            View AI
            <span className="px-2.5 py-1 rounded-full bg-cobalt/15 text-cobalt text-[11px] font-mono font-medium">SIMULATION</span>
          </h1>
          <p className="mt-2 text-sm text-mist">
            klue/bert-base 파인튜닝 학습 곡선 시뮬레이션 — 실제 학습은 Web IDE 터미널에서 실행됩니다.
          </p>
        </div>
        <button
          onClick={() => {
            setRunning(!running);
            addToast?.(running ? '시뮬레이션을 일시정지했습니다.' : '시뮬레이션을 재개했습니다.');
          }}
          className="px-5 py-2.5 rounded-full border border-line text-[13px] text-ink hover:border-white/30 hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          {running ? <><Pause className="w-3.5 h-3.5 text-amber-300" /> 일시정지</> : <><Play className="w-3.5 h-3.5 text-mint" /> 재개</>}
        </button>
      </div>

      {/* 핵심 지표 */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Epoch', `${Math.min(epoch, TOTAL_EPOCHS)} / ${TOTAL_EPOCHS}`, done ? '#4ade9b' : '#f2f0eb'],
          ['Loss', loss.toFixed(4), '#4ade9b'],
          ['Accuracy', `${(acc * 100).toFixed(1)}%`, '#5b78ff'],
          ['VRAM', `${vram} / 10 GB`, '#e8b34b'],
        ].map(([label, value, color]) => (
          <div key={label} className="glass-card rounded-2xl p-5">
            <p className="text-[12px] text-mist">{label}</p>
            <p className="mt-1 font-display font-bold text-2xl tabular" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* 학습 곡선 */}
      <div className="mt-5 glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-[13px] font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-mint" />
            Training Loss Curve
          </p>
          <p className="font-mono text-[11px] text-dim">batch 16 · grad_accum 4 · lr 2e-5 (AdamW)</p>
        </div>
        <svg viewBox={`0 0 ${W} ${H + 20}`} className="mt-4 w-full" role="img" aria-label="에폭별 학습 손실 곡선">
          {[0.5, 1.0, 1.5].map((v) => (
            <g key={v}>
              <line x1="0" x2={W} y1={H - (v / 2) * H} y2={H - (v / 2) * H} stroke="rgba(255,255,255,0.07)" strokeDasharray="4 6" />
              <text x="4" y={H - (v / 2) * H - 5} fill="#6b675f" fontSize="10" fontFamily="JetBrains Mono">{v.toFixed(1)}</text>
            </g>
          ))}
          <path d={path} fill="none" stroke="#4ade9b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={lastX} cy={lastY} r="4" fill="#4ade9b">
            {running && !done && <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />}
          </circle>
          <text x={W - 4} y={H + 14} textAnchor="end" fill="#6b675f" fontSize="10" fontFamily="JetBrains Mono">epoch {TOTAL_EPOCHS}</text>
        </svg>
        <div className="mt-2 h-1.5 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full bg-mint transition-all duration-700"
            style={{ width: `${Math.min(100, (epoch / TOTAL_EPOCHS) * 100)}%` }}
          />
        </div>
      </div>

      {/* 텔레메트리 + 로그 */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-card rounded-3xl p-6 space-y-5">
          <p className="text-[13px] font-medium">GPU Telemetry</p>
          <Gauge label="VRAM Allocation" value={vram} max={10} unit=" GB" color="#e8b34b" />
          <Gauge label="Compute Utilization" value={util} max={100} unit="%" color="#5b78ff" />
          <Gauge label="Core Temperature" value={temp} max={100} unit="°C" color="#4ade9b" />
        </div>
        <div className="glass-card rounded-3xl p-6">
          <p className="text-[13px] font-medium mb-4">Telemetry Stream</p>
          <div ref={logRef} className="h-44 overflow-y-auto rounded-2xl bg-pit border border-line p-3.5 font-mono text-[11px] leading-6 text-mist">
            {points.slice(1).map((p) => (
              <p key={p.epoch}>
                <span className="text-dim">[EPOCH {String(p.epoch).padStart(2, '0')}/{TOTAL_EPOCHS}]</span>{' '}
                loss <span className="text-mint">{p.loss.toFixed(4)}</span>{' '}
                acc <span className="text-cobalt">{(Math.min(0.895, 0.62 + (p.epoch / TOTAL_EPOCHS) * 0.28) * 100).toFixed(1)}%</span>
              </p>
            ))}
            {done && <p className="text-mint font-medium">[DONE] 학습 종료 — 텔레메트리가 포트폴리오 파이프라인에 전달됩니다.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
