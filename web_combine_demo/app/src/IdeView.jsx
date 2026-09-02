import { useState } from 'react';
import { AlertTriangle, Check, Copy, Cpu, ExternalLink, Eye, Play, Terminal } from 'lucide-react';

// ─── Web IDE — 컨테이너 안 code-server를 iframe으로 임베딩 ────────────────────
// 세팅이 끝나면 생성된 학습 스크립트가 열린 채로 시작한다.
// 학습은 사용자가 IDE 터미널(Ctrl+`)에서 직접 실행한다.

export default function IdeView({ session, staged, go, addToast }) {
  const [copied, setCopied] = useState(false);

  if (!session) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <Cpu className="w-10 h-10 text-dim mx-auto" />
          <p className="font-display font-bold text-lg">활성 워크스페이스가 없습니다</p>
          {staged && (
            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4 text-left">
              <p className="text-[12px] font-medium text-gold">커뮤니티 실습 코드가 준비되었습니다</p>
              <p className="mt-1.5 text-[13px] text-mist leading-relaxed">{staged.title}</p>
              <p className="mt-1.5 font-mono text-[11px] text-ink break-all">{staged.script_path}</p>
              <p className="mt-2 text-[12px] text-mist">
                환경 세팅 후 IDE 터미널에서 <code className="font-mono text-cobalt">{staged.run_command}</code> 로 실행됩니다.
              </p>
            </div>
          )}
          <p className="text-[13px] text-mist leading-relaxed">
            Start AI에서 모델을 선택해 환경을 먼저 세팅하세요. 세팅이 끝나면 생성된
            {staged ? ' 학습 코드와 위 실습 코드가 워크스페이스에 열립니다.' : ' 학습 코드가 이 자리에 열립니다.'}
          </p>
          <button
            onClick={() => go('start')}
            className="px-6 py-2.5 rounded-full bg-ink text-void text-[13px] font-semibold hover:bg-white transition-colors"
          >
            Start AI로 이동
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
    <div className="h-[calc(100vh-6rem)] flex flex-col px-4 sm:px-6 pb-4 max-w-[1400px] mx-auto w-full">
      <div className="glass-card rounded-2xl px-5 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Terminal className="w-4 h-4 text-cobalt shrink-0" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium truncate">
              {session.model_id}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                session.gpu_available ? 'bg-mint/15 text-mint' : 'bg-white/10 text-mist'
              }`}>
                {session.gpu_available ? 'GPU' : 'CPU'}
              </span>
            </p>
            <p className="font-mono text-[11px] text-dim truncate">{session.script_path}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 rounded-full border border-line bg-pit px-3.5 py-1.5">
            <Play className="w-3 h-3 text-mint shrink-0" />
            <code className="font-mono text-[11px]">{session.run_command}</code>
            <button onClick={copyCommand} aria-label="실행 명령 복사" className="text-dim hover:text-ink transition-colors">
              {copied ? <Check className="w-3 h-3 text-mint" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <a
            href={session.ide_url}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-full border border-line text-[12px] text-mist hover:text-ink hover:border-white/25 transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3 h-3" /> 새 탭
          </a>
          <button
            onClick={() => go('portfolio')}
            className="px-3.5 py-1.5 rounded-full border border-line text-[12px] text-mist hover:text-ink hover:border-white/25 transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3 h-3" /> 포트폴리오
          </button>
        </div>
      </div>

      <p className="my-3 text-[12px] text-mist flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        학습을 시작하려면 IDE에서 터미널을 열고(Ctrl+`) 위 명령을 실행하세요. 학습 중 발생한 에러는 자동으로 수집됩니다.
      </p>

      {staged && (
        <div className="mb-3 rounded-2xl border border-gold/30 bg-gold/5 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap text-[12px]">
          <span className="text-gold font-medium">커뮤니티 실습 코드 준비됨</span>
          <code className="font-mono text-[11px] text-ink">{staged.run_command}</code>
        </div>
      )}

      <iframe
        src={session.ide_url}
        title="Web IDE (code-server)"
        className="flex-1 w-full rounded-2xl border border-line bg-[#1e1e1e]"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
