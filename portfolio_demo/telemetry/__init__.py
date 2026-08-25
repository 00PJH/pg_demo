"""텔레메트리 패키지 — 런타임 데이터 수집 SDK."""

from .interceptor import setup_interceptor
from .tracker import DiffStackTracker

__all__ = ["setup_interceptor", "DiffStackTracker"]
