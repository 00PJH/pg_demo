"""
web_combine_demo/api_server.py — 통합 데모 서버.

ai_set_demo의 API(환경 감지·모델 카탈로그·SSE 프로비저닝)를 그대로 상속하고,
portfolio_demo 파이프라인 실행/조회 엔드포인트를 추가한다.

추가 엔드포인트:
  GET /api/portfolio/run        run_demo.py 파이프라인을 서브프로세스로 실행,
                                stdout을 SSE로 스트리밍. 끝나면 ready 이벤트.
  GET /api/portfolio/output     생성된 portfolio_output.html
  GET /api/portfolio/telemetry  .telemetry/raw_telemetry.json 요약

ponytail: 인증 없이 127.0.0.1에만 바인딩. docker/학습을 실행하므로 외부 노출 금지.
"""

import json
import os
import subprocess
import sys
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

_REPO_ROOT = Path(__file__).resolve().parent.parent
if str(_REPO_ROOT) not in sys.path:  # `python web_combine_demo/api_server.py` 직접 실행 대비
    sys.path.insert(0, str(_REPO_ROOT))

from ai_set_demo.api_server import _Handler as _BaseHandler  # noqa: E402

_STATIC_DIR = Path(__file__).resolve().parent / "app" / "dist"
_PORTFOLIO_DIR = _REPO_ROOT / "portfolio_demo"
_DEFAULT_PORT = 8770


def _telemetry_summary() -> dict:
    """포트폴리오 화면 상단 지표용 — 원본 JSON에서 가벼운 필드만 추린다."""
    path = _PORTFOLIO_DIR / ".telemetry" / "raw_telemetry.json"
    if not path.exists():
        return {"exists": False}
    data = json.loads(path.read_text(encoding="utf-8"))
    return {
        "exists": True,
        "saved_at": data.get("saved_at", ""),
        "overview": data.get("overview", {}),
        "dataset": data.get("dataset", {}),
        "benchmarks": data.get("benchmarks", {}),
        "error_count": len(data.get("error_history", [])),
        "last_error_type": (data.get("last_error") or {}).get("error_type", ""),
        "output_exists": (_PORTFOLIO_DIR / "portfolio_output.html").exists(),
    }


class _Handler(_BaseHandler):
    def do_GET(self) -> None:  # noqa: N802 (stdlib 규약)
        route = urlparse(self.path)
        if route.path == "/api/portfolio/run":
            self._stream_portfolio_run()
        elif route.path == "/api/portfolio/output":
            self._send_portfolio_html()
        elif route.path == "/api/portfolio/telemetry":
            self._send_json(_telemetry_summary())
        elif route.path.startswith("/api/"):
            super().do_GET()
        elif not _STATIC_DIR.exists():
            self._send_json(
                {"error": "프론트엔드 빌드가 없습니다. web_combine_demo/app에서 'npm run build'를 먼저 실행하세요."},
                status=503,
            )
        else:
            super().do_GET()

    def _send_portfolio_html(self) -> None:
        path = _PORTFOLIO_DIR / "portfolio_output.html"
        if not path.exists():
            self._send_json({"error": "포트폴리오가 아직 생성되지 않았습니다. 먼저 파이프라인을 실행하세요."}, status=404)
            return
        body = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _stream_portfolio_run(self) -> None:
        """run_demo.py를 서브프로세스로 돌리고 stdout을 그대로 SSE로 흘린다.

        run_demo는 sys.excepthook을 갈아끼우므로 서버 프로세스 안에서 직접
        임포트하지 않는다 — 격리가 곧 안정성이다.
        """
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()

        env = {**os.environ, "PYTHONIOENCODING": "utf-8"}
        proc = subprocess.Popen(
            [sys.executable, "-m", "portfolio_demo.run_demo"],
            cwd=_REPO_ROOT,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=env,
        )
        try:
            for line in proc.stdout:
                self._sse("log", line.rstrip())
            code = proc.wait()
            if code == 0:
                self._sse("ready", {"output_url": "/api/portfolio/output", "telemetry": _telemetry_summary()})
            else:
                self._sse("error", f"파이프라인이 종료 코드 {code}로 실패했습니다. 서버 로그를 확인하세요.")
        except (BrokenPipeError, ConnectionAbortedError):
            proc.kill()  # 브라우저가 탭을 닫음


def serve(port: int = _DEFAULT_PORT) -> None:
    handler = partial(_Handler, directory=str(_STATIC_DIR))
    with ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        print(f"plAI-ground 통합 데모 서버: http://127.0.0.1:{port}")
        if not _STATIC_DIR.exists():
            print("  (프론트엔드 미빌드 - web_combine_demo/app에서 'npm run build' 또는 'npm run dev')")
        print("  중지: Ctrl+C")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n서버 종료")


def demo() -> None:
    summary = _telemetry_summary()
    assert "exists" in summary
    if summary["exists"]:
        assert "benchmarks" in summary and "error_count" in summary
    print(f"api_server.py self-check OK - telemetry exists={summary['exists']}")


if __name__ == "__main__":
    if "--self-check" in sys.argv:
        demo()
    else:
        serve(int(os.environ.get("PLAIGROUND_COMBINE_PORT", _DEFAULT_PORT)))
