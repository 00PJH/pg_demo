# web_combine_demo 실행 방법

`ai_set_demo`(원클릭 환경 세팅)와 `portfolio_demo`(검증형 포트폴리오 파이프라인)를
하나의 플랫폼 웹페이지로 묶은 통합 데모다. 랜딩 페이지 + 콘솔(Start AI / Web IDE /
View AI / Portfolio / Faculty LMS)로 구성된다.

## 실제로 동작하는 것과 시뮬레이션

| 화면 | 실체 | 백엔드 |
|---|---|---|
| Start AI 위저드 | 실제 실행 — Docker/GPU 감지, 모델 카탈로그, SSE 프로비저닝 | `GET /api/status` `/api/models` `/api/setup` |
| Web IDE | 실제 — 컨테이너의 code-server iframe 임베딩 | http://127.0.0.1:8080 |
| Portfolio | 실제 실행 — run_demo.py 파이프라인 + 결과 HTML 임베드 | `GET /api/portfolio/run`(SSE) `/output` `/telemetry` |
| View AI | 시뮬레이션 (화면에 SIMULATION 배지 표기) | 없음 |
| Faculty LMS | 샘플 데이터 (화면에 SAMPLE DATA 배지 표기) | 없음 |

## 방법 1. 한 프로세스로 실행 (권장)

```bash
cd web_combine_demo/app && npm install && npm run build   # 최초 1회
cd ../.. && python -m web_combine_demo.api_server
```

→ http://127.0.0.1:8770

## 방법 2. UI를 고치면서 볼 때 (HMR)

```bash
python -m web_combine_demo.api_server        # 터미널 1 (8770)
cd web_combine_demo/app && npm run dev       # 터미널 2 → http://127.0.0.1:5173
```

## 사전 조건

- Start AI 실행에는 Docker Desktop + `plaiground-base:dev` 이미지 필요
  (위저드 1단계에서 실시간 확인됨)
- Portfolio 실행은 Docker 없이도 동작 (Gemini 키 없으면 Mock 서사로 폴백)

## 보안

API 서버는 docker 명령과 파이프라인을 실행하므로 `127.0.0.1`에만 바인딩한다.
외부에 노출하면 원격 코드 실행이 된다 — `0.0.0.0`으로 열지 말 것.
