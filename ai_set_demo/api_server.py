"""
api_server.py — web_demo를 ai_set_demo에 연결하는 로컬 HTTP 서버.

stdlib http.server만 사용한다. FastAPI/Flask를 새로 깔 이유가 없다 —
엔드포인트 3개에 사용자 1명, 루프백 전용이다.

엔드포인트:
  GET /api/status                환경 감지 결과 (Docker/이미지/GPU)
  GET /api/models                ModelCatalog 목록
  GET /api/setup?model_id=<id>   환경 세팅 + 스크립트 생성 (학습은 안 함).
                                 로그를 SSE로 흘리고 마지막에 ready 이벤트로
                                 웹 IDE 접속 정보를 준다. 학습은 사용자가
                                 code-server 안에서 직접 실행한다.
  그 외 경로                      web_demo/app/dist 정적 파일 (없으면 안내 메시지)

ponytail: 인증 없이 127.0.0.1에만 바인딩한다. 이 서버는 docker 명령과 학습을
실행하므로 외부에 노출하면 안 된다 — 0.0.0.0으로 여는 순간 원격 코드 실행이다.
"""

import json
import os
import subprocess
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from .catalog import ModelCatalog
from .provisioner import _IMAGE, _image_exists  # 같은 패키지 내부 재사용
from .setup_and_train import provision

_REPO_ROOT = Path(__file__).resolve().parent.parent
_STATIC_DIR = _REPO_ROOT / "web_demo" / "app" / "dist"
_ENV_FILE = Path(__file__).resolve().parent / ".env"
_DEFAULT_PORT = 8765


def _read_env() -> dict[str, str]:
    """마법사가 기록한 ai_set_demo/.env 값 (없으면 빈 dict)."""
    if not _ENV_FILE.exists():
        return {}
    values = {}
    for line in _ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            values[key.strip()] = value.strip().strip('"')
    return values


def _docker_running() -> bool:
    return subprocess.run(["docker", "info"], capture_output=True, text=True).returncode == 0


def _status() -> dict:
    env = _read_env()
    docker_ok = _docker_running()
    return {
        "docker_running": docker_ok,
        "image": _IMAGE,
        "image_exists": docker_ok and _image_exists(),
        "gpu_name": env.get("DETECTED_GPU_NAME", ""),
        "driver_version": env.get("DETECTED_DRIVER_VERSION", ""),
        "wsl2_ready": env.get("WSL2_READY", "") == "true",
    }


class _Handler(SimpleHTTPRequestHandler):
    """/api/*는 직접 처리하고 나머지는 정적 파일로 넘긴다."""

    def do_GET(self) -> None:  # noqa: N802 (stdlib 규약)
        route = urlparse(self.path)
        if route.path == "/api/status":
            self._send_json(_status())
        elif route.path == "/api/models":
            self._send_json([vars(spec) for spec in ModelCatalog.list_models()])
        elif route.path == "/api/setup":
            self._stream_setup(parse_qs(route.query).get("model_id", [""])[0])
        elif not _STATIC_DIR.exists():
            self._send_json(
                {"error": "프론트엔드 빌드가 없습니다. web_demo/app에서 'npm run build'를 먼저 실행하세요."},
                status=503,
            )
        else:
            super().do_GET()

    def _send_json(self, payload, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _sse(self, event: str, data) -> None:
        self.wfile.write(f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n".encode())
        self.wfile.flush()

    def _stream_setup(self, model_id: str) -> None:
        """환경 세팅 로그를 흘려보내고, 끝나면 웹 IDE 접속 정보를 ready 이벤트로 보낸다."""
        # 스트림을 열기 전에 검증한다 — 제너레이터는 지연 실행이라
        # 여기서 확인하지 않으면 잘못된 model_id가 200 OK로 나간다.
        try:
            ModelCatalog.get_model(model_id)
        except ValueError as exc:
            self._send_json({"error": str(exc)}, status=400)
            return

        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        gen = provision(model_id)
        try:
            while True:
                try:
                    self._sse("log", next(gen))
                except StopIteration as stop:
                    self._sse("ready", stop.value)
                    return
        except (RuntimeError, OSError) as exc:
            self._sse("error", str(exc))
        except BrokenPipeError:
            pass  # 브라우저가 탭을 닫음

    def log_message(self, fmt: str, *args) -> None:
        # send_error()는 args[0]에 HTTPStatus를 넘긴다 - str()로 감싸지 않으면 404마다 핸들러가 죽는다
        if args and "/api/" in str(args[0]):
            super().log_message(fmt, *args)  # 정적 파일 요청 로그는 소음이라 생략


def serve(port: int = _DEFAULT_PORT) -> None:
    handler = partial(_Handler, directory=str(_STATIC_DIR))
    with ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        print(f"plAI-ground 데모 서버: http://127.0.0.1:{port}")
        if not _STATIC_DIR.exists():
            print("  (프론트엔드 미빌드 - web_demo/app에서 'npm run build' 또는 'npm run dev')")
        print("  중지: Ctrl+C")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n서버 종료")


def demo() -> None:
    status = _status()
    assert set(status) >= {"docker_running", "image_exists", "gpu_name"}
    assert isinstance(status["docker_running"], bool)
    models = [vars(spec) for spec in ModelCatalog.list_models()]
    assert models and "model_id" in models[0]
    json.dumps(models, ensure_ascii=False)  # 직렬화 가능해야 함
    print(f"api_server.py self-check OK - docker={status['docker_running']}, models={len(models)}")


if __name__ == "__main__":
    if "--self-check" in sys.argv:
        demo()
    else:
        serve(int(os.environ.get("PLAIGROUND_API_PORT", _DEFAULT_PORT)))
