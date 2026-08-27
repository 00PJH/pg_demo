# portfolio_demo/generate_real_portfolio.py
import json
import os
import sys
from pathlib import Path

if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# 작업 디렉토리에 관계없이 plaiground 루트를 sys.path에 등록
_REPO_ROOT = Path(__file__).resolve().parent.parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

from portfolio_demo.llm.generator import generate_portfolio
from portfolio_demo.services.renderer import render_portfolio

def build_real_portfolio():
    telemetry_path = Path(__file__).parent / ".telemetry" / "raw_telemetry.json"
    
    if not telemetry_path.exists():
        print("❌ 텔레메트리 파일이 없습니다. train_real.py를 먼저 실행하세요.")
        return

    with open(telemetry_path, "r", encoding="utf-8") as f:
        raw_telemetry = json.load(f)

    print("🚀 [1/2] 실제 학습 텔레메트리를 기반으로 Gemini 포트폴리오 서사 생성 중...")
    portfolio_schema = generate_portfolio(raw_telemetry)
    
    print("🎨 [2/2] Jinja2 템플릿 바인딩 및 SHA-256 해시 주입 중...")
    output_path = render_portfolio(portfolio_schema, raw_telemetry)
    
    print(f"✨ 완성된 포트폴리오 파일: {output_path}")

if __name__ == "__main__":
    build_real_portfolio()