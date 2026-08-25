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
_RAW_FILE = _TELEMETRY_DIR / "raw_telemetry.json"


class DiffStackTracker:
    """런타임 데이터(데이터셋 통계, 벤치마크, 에러) 수집 및 덤프."""

    def __init__(self) -> None:
        self._dataset: dict[str, Any] = {}
        self._benchmarks: dict[str, Any] = {}

    def log_dataset(
        self,
        raw_len: int,
        processed_len: int,
        notes: str = "",
        avg_len_before: float = 0.0,
        avg_len_after: float = 0.0,
    ) -> None:
        """
        데이터 전처리 전후 통계를 기록.

        Args:
            raw_len: 전처리 전 샘플 수.
            processed_len: 전처리 후 샘플 수.
            notes: 전처리 기법 설명.
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
        baseline_dict: dict[str, Any],
        final_dict: dict[str, Any],
        params_dict: dict[str, Any],
    ) -> None:
        """
        파인튜닝 전후 성능 메트릭과 하이퍼파라미터를 기록.

        Args:
            baseline_dict: 베이스라인 성능 지표 (e.g. {"loss": 2.34, "f1": 0.41}).
            final_dict: 최종 성능 지표 (e.g. {"loss": 1.12, "f1": 0.78}).
            params_dict: 사용된 하이퍼파라미터 (e.g. {"lr": 2e-5, "epochs": 3}).
        """
        self._benchmarks = {
            "baseline": baseline_dict,
            "final": final_dict,
            "hyperparameters": params_dict,
        }

    def save_run(self) -> Path:
        """
        수집된 데이터 + 에러 로그 + Git Diff를 raw_telemetry.json에 저장.

        Returns:
            Path: 저장된 파일 경로.
        """
        _TELEMETRY_DIR.mkdir(exist_ok=True)

        # last_error.json 로드 (없으면 빈 dict)
        error_data: dict[str, Any] = {}
        if _ERROR_FILE.exists():
            try:
                error_data = json.loads(_ERROR_FILE.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                pass

        payload = {
            "saved_at": datetime.utcnow().isoformat(),
            "dataset": self._dataset,
            "benchmarks": self._benchmarks,
            "last_error": error_data,
            "git_diff": get_git_diff(),
        }

        _RAW_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        return _RAW_FILE
