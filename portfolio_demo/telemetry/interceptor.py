"""
interceptor.py — sys.excepthook 기반 런타임 예외 인터셉터.

예외 발생 시 error_type, error_message, last_frame_file, last_frame_line,
full_traceback을 .telemetry/last_error.json에 저장.
기존 터미널 출력은 sys.__excepthook__ 체이닝으로 보존.
"""

import json
import sys
import traceback
from datetime import datetime
from pathlib import Path

# .telemetry/ 디렉토리는 portfolio_demo/ 기준
_TELEMETRY_DIR = Path(__file__).parent.parent / ".telemetry"
_ERROR_FILE = _TELEMETRY_DIR / "last_error.json"
_HISTORY_FILE = _TELEMETRY_DIR / "error_history.json"


def _hook(exc_type: type, exc_value: BaseException, exc_tb) -> None:
    """커스텀 excepthook: 에러를 누적 히스토리 및 단일 파일로 JSON 저장 후 원래 출력 체이닝."""
    # 원래 터미널 출력 유지
    sys.__excepthook__(exc_type, exc_value, exc_tb)

    tb_frames = traceback.extract_tb(exc_tb)
    last_frame = tb_frames[-1] if tb_frames else None

    payload = {
        "timestamp": datetime.utcnow().isoformat(),
        "error_type": exc_type.__name__,
        "error_message": str(exc_value),
        "last_frame_file": last_frame.filename if last_frame else None,
        "last_frame_line": last_frame.lineno if last_frame else None,
        "full_traceback": "".join(traceback.format_exception(exc_type, exc_value, exc_tb)),
    }

    try:
        _TELEMETRY_DIR.mkdir(exist_ok=True)
        # 1. 단일 최신 에러 파일 갱신 (하위 호환)
        _ERROR_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

        # 2. 실행 단위별 누적 에러 히스토리 갱신
        history: list[dict] = []
        if _HISTORY_FILE.exists():
            try:
                history = json.loads(_HISTORY_FILE.read_text(encoding="utf-8"))
                if not isinstance(history, list):
                    history = [history] if history else []
            except Exception:
                history = []

        history.append(payload)
        _HISTORY_FILE.write_text(json.dumps(history, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception:
        pass  # 저장 실패해도 원래 프로그램 흐름 보호


def install_error_interceptor() -> None:
    """sys.excepthook을 DiffStack 인터셉터로 교체."""
    sys.excepthook = _hook


# 하위 호환성을 위한 alias
setup_interceptor = install_error_interceptor
