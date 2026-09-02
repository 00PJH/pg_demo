import { useState } from 'react';
import {
  Terminal, ExternalLink, Copy, Check, Play, Cpu, AlertTriangle, Eye,
} from 'lucide-react';

// ─── Web IDE (code-server 임베딩) ─────────────────────────────────────────────
// 환경 세팅이 끝나면 이 화면으로 들어온다. 생성된 학습 스크립트가 열린 상태의
// code-server를 iframe으로 띄우고, 사용자가 IDE 터미널에서 직접 학습을 돌린다.
// code-server는 frame-ancestors를 설정하지 않아 iframe 임베딩이 허용된다.

export default function IdeView({ session, setCurrentView, addToast }) {
  const [copied, setCopied] = useState(false);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 pt-14 flex items-center justify-center">
        <div className="max-w-md text-center space-y-4 px-6">
          <Cpu className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-mono font-bold text-slate-200">활성 워크스페이스가 없습니다</p>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Start AI 화면에서 모델을 선택해 환경을 먼저 세팅하세요.
            세팅이 끝나면 생성된 학습 코드가 이 자리에 열립니다.
          </p>
          <button
            onClick={() => setCurrentView('start')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-sm border border-blue-500 transition-all"
          >
            Start AI로 이동 &rarr;
          </button>
        </div>
      </div>
    );
  }

  const copyCommand = () => {
    navigator.clipboard?.writeText(session.run_command);
    setCopied(true);
    addToast?.('실행 명령을 복사했습니다.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen bg-[#0F172A] text-slate-100 pt-14 flex flex-col">
      {/* 실행 안내 바 — IDE 안에서 무엇을 해야 하는지가 한 줄로 보여야 한다 */}
      <div className="bg-[#0B0F19] border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Terminal className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-mono font-bold text-slate-100 truncate">
              {session.model_id}
              <span className={`ml-2 px-1.5 py-0.5 rounded-sm text-[10px] font-normal border ${
                session.gpu_available
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {session.gpu_available ? 'GPU' : 'CPU'}
              </span>
            </p>
            <p className="text-[11px] font-mono text-slate-500 truncate">{session.script_path}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-sm">
            <Play className="w-3 h-3 text-emerald-400 shrink-0" />
            <code className="text-[11px] font-mono text-slate-200">{session.run_command}</code>
            <button
              onClick={copyCommand}
              aria-label="Copy run command"
              className="text-slate-400 hover:text-slate-100 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <a
            href={session.ide_url}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-mono rounded-sm border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3 h-3" />
            새 탭
          </a>
          <button
            onClick={() => setCurrentView('portfolio')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-mono rounded-sm border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Eye className="w-3 h-3" />
            포트폴리오
          </button>
        </div>
      </div>

      <div className="px-6 py-2 bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2 shrink-0">
        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
        학습을 시작하려면 IDE에서 터미널을 열고(Ctrl+`) 위 명령을 실행하세요. 학습 중 발생한 에러는 자동으로 수집됩니다.
      </div>

      {/* code-server 임베딩 */}
      <iframe
        src={session.ide_url}
        title="Web IDE (code-server)"
        className="flex-1 w-full border-0 bg-[#1e1e1e]"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
