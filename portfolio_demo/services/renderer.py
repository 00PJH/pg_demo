"""
renderer.py — SHA-256 무결성 해시 부여 및 Jinja2 HTML 렌더러.

SHA-256(timestamp + raw_telemetry) 해시를 계산하여 VerificationMeta에 주입.
Jinja2 템플릿에 PortfolioSchema 데이터를 바인딩하여 portfolio_output.html 저장.
"""

import hashlib
import json
from datetime import datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

from ..core.schema import PortfolioSchema

_TEMPLATE_DIR = Path(__file__).parent.parent / "templates"
_OUTPUT_FILE = Path(__file__).parent.parent / "portfolio_output.html"


def _compute_hash(timestamp: str, telemetry: dict) -> str:
    """
    SHA-256(timestamp + telemetry_json) 해시 계산.

    Args:
        timestamp: ISO 형식 타임스탬프 문자열.
        telemetry: raw 텔레메트리 딕셔너리.

    Returns:
        str: 16진수 SHA-256 해시 (64자).
    """
    payload = timestamp + json.dumps(telemetry, ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def render_portfolio(schema: PortfolioSchema, telemetry: dict) -> Path:
    """
    PortfolioSchema를 HTML 포트폴리오로 렌더링 후 파일로 저장.

    Args:
        schema: Pydantic V2 검증 완료 포트폴리오 스키마.
        telemetry: SHA-256 해시 계산에 사용할 원본 텔레메트리.

    Returns:
        Path: 생성된 portfolio_output.html 경로.
    """
    timestamp = datetime.utcnow().isoformat()
    integrity_hash = _compute_hash(timestamp, telemetry)

    # 해시를 스키마에 주입 (verification.integrity_hash 교체)
    data = schema.model_dump()
    data["verification"]["integrity_hash"] = integrity_hash
    data["verification"]["generated_at"] = timestamp

    # Jinja2 렌더링
    env = Environment(loader=FileSystemLoader(str(_TEMPLATE_DIR)), autoescape=True)
    template = env.get_template("portfolio_template.html")
    html = template.render(portfolio=data)

    _OUTPUT_FILE.write_text(html, encoding="utf-8")
    return _OUTPUT_FILE
