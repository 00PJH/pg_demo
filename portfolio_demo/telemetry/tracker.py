"""
tracker.py — DiffStackTracker: 데이터 통계 & 메트릭 로거.

log_dataset(), log_benchmarks(), save_run()으로 구성된 단일 책임 클래스.
수집된 데이터 + 에러 로그 + Git Diff를 병합하여 .telemetry/raw_telemetry.json에 덤프.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Any

from .git_tracker import get_git_diff

_TELEMETRY_DIR = Path(__file__).parent.parent / ".telemetry"
_ERROR_FILE = _TELEMETRY_DIR / "last_error.json"
_HISTORY_FILE = _TELEMETRY_DIR / "error_history.json"
_RAW_FILE = _TELEMETRY_DIR / "raw_telemetry.json"


class DiffStackTracker:
    """런타임 데이터(데이터셋 통계, 벤치마크, 에러) 수집 및 덤프."""

    def __init__(self, project_name: str = "", task_type: str = "", **kwargs: Any) -> None:
        self._overview: dict[str, Any] = {
            "project_name": project_name,
            "task_type": task_type,
            **kwargs,
        }
        self._dataset: dict[str, Any] = {}
        self._benchmarks: dict[str, Any] = {}

    def log_dataset(
        self,
        raw_len: int,
        processed_len: int,
        notes: str | list[str] = "",
        avg_len_before: float = 0.0,
        avg_len_after: float = 0.0,
    ) -> None:
        """
        데이터 전처리 전후 통계를 기록.

        Args:
            raw_len: 전처리 전 샘플 수.
            processed_len: 전처리 후 샘플 수.
            notes: 전처리 기법 설명 (문자열 또는 리스트).
            avg_len_before: 전처리 전 평균 시퀀스 길이.
            avg_len_after: 전처리 후 평균 시퀀스 길이.
        """
        removed = raw_len - processed_len
        reduction_rate = round(removed / raw_len * 100, 2) if raw_len else 0.0
        self._dataset = {
            "raw_len": raw_len,
            "processed_len": processed_len,
            "removed_samples": removed,
            "reduction_rate_pct": reduction_rate,
            "avg_len_before": avg_len_before,
            "avg_len_after": avg_len_after,
            "notes": notes,
        }

    def log_benchmarks(
        self,
        baseline_dict: dict[str, Any] | None = None,
        final_dict: dict[str, Any] | None = None,
        params_dict: dict[str, Any] | None = None,
        baseline: dict[str, Any] | None = None,
        final: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> None:
        """
        파인튜닝 전후 성능 메트릭과 하이퍼파라미터를 기록.
        인자 이름으로 baseline/final/params 또는 baseline_dict/final_dict/params_dict 지원.
        """
        base = baseline or baseline_dict or {}
        fin = final or final_dict or {}
        prm = params or params_dict or {}

        self._benchmarks = {
            "baseline": base,
            "final": fin,
            "hyperparameters": prm,
        }

    def save_run(self) -> Path:
        """
        수집된 데이터 + 누적 에러 로그 + Git Diff를 raw_telemetry.json에 저장.

        Returns:
            Path: 저장된 파일 경로.
        """
        _TELEMETRY_DIR.mkdir(exist_ok=True)

        # 1. last_error.json 로드 (없으면 빈 dict)
        error_data: dict[str, Any] = {}
        if _ERROR_FILE.exists():
            try:
                error_data = json.loads(_ERROR_FILE.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                pass

        # 2. error_history.json 로드 (누적 에러 목록)
        error_history: list[dict[str, Any]] = []
        if _HISTORY_FILE.exists():
            try:
                loaded_hist = json.loads(_HISTORY_FILE.read_text(encoding="utf-8"))
                if isinstance(loaded_hist, list):
                    error_history = loaded_hist
            except json.JSONDecodeError:
                pass

        payload = {
            "saved_at": datetime.utcnow().isoformat(),
            "overview": self._overview,
            "dataset": self._dataset,
            "benchmarks": self._benchmarks,
            "last_error": error_data,
            "error_history": error_history,
            "git_diff": get_git_diff(),
        }

        _RAW_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        return _RAW_FILE
