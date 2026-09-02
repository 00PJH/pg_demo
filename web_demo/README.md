# web_demo 실행 방법

`ai_set_demo`의 원클릭 환경 세팅을 브라우저에서 실제로 돌려보는 데모다.
Start AI 화면의 위저드는 목업이 아니라 실제 `ModelCatalog` → Docker 컨테이너 →
학습 스크립트 생성까지 그대로 실행한다.

## 사용자 흐름

```
모델 선택 → 환경 세팅 완료 → 웹 IDE(code-server)에 생성된 코드가 열림
        → 사용자가 IDE 터미널에서 직접 학습 실행 → 텔레메트리 자동 수집
```

학습을 자동으로 돌리지 않는 게 핵심이다. 사용자가 코드를 보고, 고치고,
직접 실행하는 경험이 이 제품의 목적이다 (`portfolio_demo`가 그 실행 이력을
포트폴리오로 만든다). 웹 IDE는 [code-server](https://github.com/coder/code-server)를
그대로 쓰며 `plaiground-base` 이미지에 포함되어 있고, 앱 안에 iframe으로 임베딩된다.

헤드리스로 세팅부터 학습까지 한 번에 돌리려면 CLI를 쓴다:

```bash
python -m ai_set_demo.setup_and_train mnist-cnn-lite               # 세팅 + 학습
python -m ai_set_demo.setup_and_train mnist-cnn-lite --setup-only  # 웹과 동일한 흐름
```

## 방법 1. 한 프로세스로 실행 (권장)

API 서버가 빌드된 프론트엔드까지 같이 서빙한다.

```bash
cd web_demo/app && npm install && npm run build   # 최초 1회
cd ../.. && python -m ai_set_demo.api_server
```

→ http://127.0.0.1:8765

## 방법 2. UI를 고치면서 볼 때 (HMR)

터미널 2개가 필요하다. Vite가 `/api`를 8765로 프록시한다.

```bash
python -m ai_set_demo.api_server        # 터미널 1
cd web_demo/app && npm run dev          # 터미널 2 → http://127.0.0.1:5173
```

## 사전 조건

- Docker Desktop 실행 중
- `plaiground-base:dev` 이미지 존재 (`ai_set_demo/docker/plaiground-base`에서 `docker build -t plaiground-base:dev .`)

둘 다 Start AI 위저드 1단계에서 실시간으로 확인된다.

## 화면과 백엔드 연결 지점

| 화면 | 실제로 하는 일 | 엔드포인트 |
|---|---|---|
| STEP 1 하드웨어 감지 카드 | `ai_set_demo/.env` 감지값 + Docker/이미지 상태 | `GET /api/status` |
| 위저드 2단계 모델 목록 | `ModelCatalog.list_models()` | `GET /api/models` |
| 위저드 3단계 실시간 로그 | `provision()` 로그를 SSE로 스트리밍, 끝나면 `ready` 이벤트로 IDE 접속 정보 | `GET /api/setup?model_id=` |
| Web IDE 화면 | 컨테이너의 code-server를 iframe 임베딩. 생성 스크립트가 열린 채로 시작 | http://127.0.0.1:8080 |

컨테이너에 `PYTHONPATH=/workspace`를 심어두므로, IDE 터미널에서
`python ai_set_demo/generated/train_*.py` 만으로 바로 실행된다.

나머지 화면(View AI, Portfolio, LMS)은 아직 HWPX 스펙 목업이다.

## 보안

API 서버는 docker 명령과 학습을 실행하므로 `127.0.0.1`에만 바인딩한다.
외부에 노출하면 원격 코드 실행이 된다 — `0.0.0.0`으로 열지 말 것.
