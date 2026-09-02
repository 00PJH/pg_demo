"""
setup_and_train.py — Orchestrator (CLI 진입점).

PLAN.md 섹션 3/4/7-5. 모듈이 아니라 조립 지점이라 추상화 없이 단일 함수.

카탈로그 조회 → 컨테이너 준비 → 스크립트 생성 → 컨테이너 안에서 실행.

학습을 호스트가 아니라 컨테이너 안(`docker exec`)에서 돌리는 이유:
어댑터 D의 전제가 "사용자 호스트에 torch/transformers가 없어도 된다"는 것이다.
호스트에서 돌리면 프로비저닝이 의미가 없어진다. 레포 루트가 /workspace로
bind mount 되어 있으므로 tracker가 쓰는 portfolio_demo/.telemetry/ 는
호스트 쪽 같은 폴더에 그대로 떨어진다 (기존 포트폴리오 파이프라인이 이어받음).
"""

import argparse
import subprocess
import sys
from pathlib import Path

from .catalog import ModelCatalog
from .generator import generate
from .provisioner import ensure_ready

_REPO_ROOT = Path(__file__).resolve().parent.parent


def _container_path(host_path: Path) -> str:
    """레포 루트 기준 호스트 경로를 컨테이너 안 /workspace 경로로 변환."""
    return f"/workspace/{host_path.resolve().relative_to(_REPO_ROOT).as_posix()}"


def setup_and_train(model_id: str, host_port: int = 8080) -> None:
    """
    model_id 하나로 환경 준비부터 학습 실행까지 수행한다.

    Args:
        model_id: ModelCatalog에 등록된 모델 id.
        host_port: code-server를 노출할 호스트 포트.
    """
    # 자식(docker exec) 출력과 섞이므로 라인 단위로 흘려보낸다 —
    # 기본 블록 버퍼링이면 우리 진행 로그가 학습 로그 뒤에 몰려서 찍힌다.
    sys.stdout.reconfigure(line_buffering=True)

    spec = ModelCatalog.get_model(model_id)
    print(f"[1/3] 모델: {spec.model_id} ({spec.task_type}, base={spec.base_model})")

    report = ensure_ready(spec, host_port=host_port)
    for warning in report.warnings:
        print(f"  경고: {warning}")
    gpu = "GPU 사용" if report.gpu_available else "CPU 전용"
    print(f"[2/3] 환경 준비 완료 ({gpu}) - 웹 IDE: {report.url}")

    script = generate(spec)
    print(f"[3/3] 학습 스크립트 생성: {script.name} - 컨테이너에서 실행합니다\n")

    # stdout을 캡처하지 않고 그대로 물려줘서 학습 로그가 실시간으로 흐르게 한다.
    result = subprocess.run([
        "docker", "exec",
        "-e", "PYTHONPATH=/workspace",
        "-e", "PYTHONUNBUFFERED=1",
        "-w", "/workspace",
        report.container_id,
        "python", _container_path(script),
    ])

    if result.returncode != 0:
        raise SystemExit(
            f"\n학습 실패 (exit {result.returncode}). "
            f"에러는 portfolio_demo/.telemetry/last_error.json에 기록되어 있습니다."
        )

    print(
        f"\n완료. 텔레메트리: portfolio_demo/.telemetry/raw_telemetry.json"
        f"\n웹 IDE는 계속 떠 있습니다: {report.url}"
        f"\n컨테이너 정리: docker rm -f plaiground-workspace"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="모델 하나 골라 환경 세팅부터 학습까지 원클릭 실행")
    parser.add_argument("model_id", nargs="?", help="학습할 모델 id (--list로 목록 확인)")
    parser.add_argument("--list", action="store_true", help="지원 모델 목록 출력")
    parser.add_argument("--port", type=int, default=8080, help="code-server 호스트 포트 (기본 8080)")
    args = parser.parse_args()

    if args.list or not args.model_id:
        for spec in ModelCatalog.list_models():
            vram = f"{spec.min_vram_gb}GB+" if spec.min_vram_gb else "GPU 불필요"
            print(f"  {spec.model_id:<22} {spec.task_type} / {spec.dataset_name} ({vram})")
        if not args.model_id:
            sys.exit(0 if args.list else 1)
        return

    setup_and_train(args.model_id, host_port=args.port)


def demo() -> None:
    # Docker 없이 검증 가능한 부분: 경로 변환과 카탈로그 연결.
    script = generate(ModelCatalog.get_model("mnist-cnn-lite"))
    assert _container_path(script) == "/workspace/ai_set_demo/generated/train_mnist_cnn_lite.py"
    try:
        setup_and_train("no-such-model")
    except ValueError:
        pass
    else:
        raise AssertionError("존재하지 않는 model_id는 컨테이너를 띄우기 전에 ValueError를 던져야 함")
    print("setup_and_train.py self-check OK")


if __name__ == "__main__":
    main()
