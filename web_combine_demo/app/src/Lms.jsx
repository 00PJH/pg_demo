import { Download, FileText, Users } from 'lucide-react';

// ─── Faculty LMS — 교수용 대시보드 (샘플 데이터) ──────────────────────────────
// 백엔드가 아직 없는 화면이라 표의 학생 데이터는 스펙 문서 기반 샘플이다.
// SAMPLE DATA 배지로 명시한다.

const STUDENTS = [
  { name: '홍길동', id: '20210001', hw: 'BYOG · RTX 3080', status: 'COMPLETED', exc: 5, loss: '0.1420' },
  { name: '김철수', id: '20210002', hw: 'CLOUD · A5000', status: 'IN PROGRESS', exc: 3, loss: '0.3810' },
  { name: '이영희', id: '20210003', hw: '미배정', status: 'NOT STARTED', exc: 0, loss: '—' },
];

const STATUS_STYLE = {
  'COMPLETED': 'bg-mint/15 text-mint',
  'IN PROGRESS': 'bg-cobalt/15 text-cobalt',
  'NOT STARTED': 'bg-white/8 text-dim',
};

export default function Lms({ go, addToast }) {
  return (
    <div className="max-w-5xl mx-auto px-6 pb-20">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold tracking-tight text-3xl flex items-center gap-3">
            Faculty LMS
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-mist text-[11px] font-mono font-medium">SAMPLE DATA</span>
          </h1>
          <p className="mt-2 text-sm text-mist leading-relaxed max-w-xl">
            2026-2 캡스톤 디자인 · AI 파인튜닝 실습 — B2B Faculty Package (60명 · 9개월).
            학생별 실습 현황과 검증 포트폴리오를 한 화면에서 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => addToast?.('평가 데이터 CSV 내보내기가 큐에 등록되었습니다. (데모)')}
            className="px-4 py-2.5 rounded-full border border-line text-[13px] text-mist hover:text-ink hover:border-white/25 transition-colors flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" /> 평가 CSV
          </button>
          <button
            onClick={() => addToast?.('전체 포트폴리오 일괄 내보내기가 큐에 등록되었습니다. (데모)')}
            className="px-4 py-2.5 rounded-full bg-ink text-void text-[13px] font-semibold hover:bg-white transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" /> 포트폴리오 일괄 다운로드
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="mt-8 border border-line rounded-lg grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line">
        {[
          ['학생 활성화율', '58 / 60', '2명 미시작 · 96.6%', '#f2f0eb'],
          ['누적 해결 예외', '243건', '학생당 평균 4.05건', '#fb7185'],
          ['주간 평균 실습', '6시간 12분', 'BYOG 72% · Cloud 28%', '#4ade9b'],
        ].map(([label, value, sub, color]) => (
          <div key={label} className="px-5 py-4">
            <p className="text-[12px] text-mist">{label}</p>
            <p className="mt-1 font-display font-bold text-2xl tabular" style={{ color }}>{value}</p>
            <p className="mt-1 text-[11px] text-dim">{sub}</p>
          </div>
        ))}
      </div>

      {/* 학생 테이블 */}
      <div className="mt-5 glass-card rounded-lg p-6">
        <p className="text-[13px] font-medium flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-cobalt" /> 학생 실습 현황
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-[11px] text-dim border-b border-line">
                {['이름', '학번', '인프라', '상태', '해결 예외', 'Final Loss', ''].map((h, i) => (
                  <th key={i} className="py-3 pr-4 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STUDENTS.map((s) => (
                <tr key={s.id} className="border-b border-line/60 last:border-0 hover:bg-white/3 transition-colors">
                  <td className="py-3.5 pr-4 font-medium whitespace-nowrap">{s.name}</td>
                  <td className="py-3.5 pr-4 font-mono text-[12px] text-mist tabular">{s.id}</td>
                  <td className="py-3.5 pr-4 text-mist whitespace-nowrap">{s.hw}</td>
                  <td className="py-3.5 pr-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono whitespace-nowrap ${STATUS_STYLE[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 tabular text-ember">{s.exc}건</td>
                  <td className="py-3.5 pr-4 font-mono text-[12px] tabular">{s.loss}</td>
                  <td className="py-3.5 text-right">
                    {s.status !== 'NOT STARTED' ? (
                      <button
                        onClick={() => go('portfolio')}
                        className="px-3.5 py-1.5 rounded-full border border-line text-[12px] text-mist hover:text-ink hover:border-white/25 transition-colors whitespace-nowrap"
                      >
                        포트폴리오 보기
                      </button>
                    ) : (
                      <span className="text-[12px] text-dim">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 계약 서류 */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          ['견적서', '9,720,000원 (VAT 별도) · 61명 · 9개월'],
          ['단가 비교표', '수의계약 적격 증빙 서류'],
          ['사업자등록증', '행정 제출용 서류 일체'],
        ].map(([label, detail]) => (
          <button
            key={label}
            onClick={() => addToast?.(`${label} 다운로드가 시작되었습니다. (데모)`)}
            className="rounded-lg border border-line p-5 text-left hover:border-gold/40 hover:bg-white/3 transition-colors group"
          >
            <p className="text-[14px] font-medium group-hover:text-gold transition-colors">{label}</p>
            <p className="mt-1 text-[12px] text-dim">{detail}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
