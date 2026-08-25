"""
generator.py — Gemini 3.6 Flash JSON Mode 포트폴리오 생성 엔진.

GEMINI_API_KEY 없음 / 네트워크 오류 시 Mock Data Fallback으로 자동 전환.
LLM 응답을 PortfolioSchema(Pydantic V2)로 파싱 및 검증.
"""

import json
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

from ..core.schema import PortfolioSchema
from .prompt import SYSTEM_PROMPT, build_user_message

# .env 로드 (portfolio_demo/.env)
_ENV_PATH = Path(__file__).parent.parent / ".env"
load_dotenv(_ENV_PATH)

# ─── Mock Fallback 데이터 (한국어 기본 제공) ──────────────────────────────────
_MOCK_DATA: dict[str, Any] = {
    "overview": {
        "title": "한국어 NLP 언어 모델 파인튜닝 파이프라인 (CUDA OOM 장애 복구 및 최적화)",
        "base_model": "klue/bert-base",
        "task_type": "개체명 인식 (NER: Named Entity Recognition)",
    },
    "data_engineering": {
        "dataset_name": "KLUE-NER 한국어 데이터셋",
        "preprocessing_techniques": [
            "정규표현식 기반 연속 공백 정규화 및 노이즈 특수문자 제거",
            "토크나이저 최대 시퀀스 길이 제한 (Max Length: 512 토큰)",
            "MD5 해시 기반 중복 및 불완전 문장 정제 필터링",
        ],
        "data_efficiency_impact": (
            "노이즈 및 중복 샘플 18.4%를 정제 제거함. 평균 시퀀스 길이를 312토큰에서 198토큰으로 36.5% 단축시켜 "
            "GPU 메모리 점유율을 대폭 낮추고, 단일 RTX 4090 환경에서 배치 크기 32 학습을 안정적으로 확보함."
        ),
    },
    "benchmarks": {
        "evaluation_metric": "F1-Score (개체명 엔티티 단위 검증)",
        "baseline_performance": 0.412,
        "optimized_performance": 0.783,
        "improvement_rate": "+90.0%",
        "optimization_methods": [
            "선형 학습률 웜업 스케줄러 (Linear Warmup Scheduler)",
            "그래디언트 누적 (Gradient Accumulation, Steps=4)",
            "FP16 혼합 정밀도 학습 (Mixed-Precision Training)",
            "과적합 방지를 위한 레이블 스무딩 (Label Smoothing, ε=0.1)",
        ],
    },
    "troubleshooting": {
        "error_type": "RuntimeError: CUDA out of memory",
        "root_cause": (
            "2번째 에포크 진입 시 배치 크기 64 설정으로 인해 VRAM 한도(24GB)를 초과함. "
            "그래디언트 누적 연산 간 중간 은닉 상태(Hidden States) 캐시가 적시에 해제되지 않고 누적된 것이 근본 원인임."
        ),
        "resolution_diff": (
            "- batch_size = 64 (초기 VRAM 초과 설정)\n"
            "+ batch_size = 16, gradient_accumulation_steps = 4\n"
            "+ 매 누적 사이클 완료 후 torch.cuda.empty_cache() 명시적 호출\n"
            "실효 배치 크기 64를 유지하면서 메모리 피크치를 14.2GB로 40% 이상 절감하여 OOM 완전 해결"
        ),
        "engineering_takeaway": (
            "그래디언트 누적 기법을 적용하면 추가 물리 VRAM 증설 없이도 큰 실효 배치를 안전하게 학습할 수 있음. "
            "모델 학습 전 에포크 평균이 아닌 스텝별 피크 메모리 프로파일링을 선행하는 습관이 매우 중요함."
        ),
    },
    "verification": {
        "hardware": "NVIDIA GeForce RTX 4090 (24GB) / AMD Ryzen 9 7950X",
        "total_training_time": "2시간 34분 17초 (총 3 Epochs 완주)",
        "integrity_hash": "PLACEHOLDER",
    },
}


def _call_gemini(telemetry: dict[str, Any]) -> dict[str, Any]:
    """
    Gemini 3.6 Flash를 JSON Mode로 호출.

    Args:
        telemetry: raw telemetry 딕셔너리.

    Returns:
        dict: LLM 응답 JSON.

    Raises:
        Exception: API 호출 실패 시 상위로 전파.
    """
    from google import genai  # noqa: PLC0415
    from google.genai import types  # noqa: PLC0415

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise ValueError("GEMINI_API_KEY가 설정되지 않았습니다.")

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=build_user_message(telemetry),
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
        ),
    )
    return json.loads(response.text)


def generate_portfolio(telemetry: dict[str, Any]) -> PortfolioSchema:
    """
    텔레메트리 데이터로 포트폴리오 스키마를 생성.

    Gemini API 호출을 시도하고 실패 시 Mock Fallback을 반환.

    Args:
        telemetry: raw_telemetry.json 내용.

    Returns:
        PortfolioSchema: Pydantic V2 검증 완료 포트폴리오 객체.
    """
    try:
        print("[LLM] Gemini 3.6 Flash 모델 호출 중...")
        raw = _call_gemini(telemetry)
        schema = PortfolioSchema.model_validate(raw)
        print("[LLM] ✅ Gemini 응답 파싱 및 Pydantic 검증 완료.")
        return schema
    except Exception as e:
        print(f"[LLM] ⚠️  Gemini 호출 실패 ({e}). 한국어 표준 Mock 데이터로 안전하게 전환합니다.")
        return PortfolioSchema.model_validate(_MOCK_DATA)
