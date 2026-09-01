"""
catalog.py — ModelCatalog: 지원 모델 정의 및 조회.

PLAN.md 섹션 3/5 반영. 모델이 2개뿐이라 YAML/클래스 계층 없이
dict 하드코딩으로 충분 (YAGNI).
"""

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class ModelSpec:
    """모델 1개에 대한 학습 파이프라인 스펙."""

    model_id: str
    task_type: str
    base_model: str
    dataset_name: str
    min_vram_gb: int
    extra_requirements: list[str] = field(default_factory=list)
    hyperparameters: dict[str, Any] = field(default_factory=dict)


_CATALOG: dict[str, ModelSpec] = {
    "klue-bert-finetune": ModelSpec(
        model_id="klue-bert-finetune",
        task_type="텍스트 분류 (범용 파인튜닝)",
        base_model="klue/bert-base",
        dataset_name="NSMC 2,000개 서브셋",
        min_vram_gb=4,
        extra_requirements=[],  # torch/transformers/datasets는 base 이미지에 포함
        hyperparameters={
            "learning_rate": 2e-5,
            "epochs": 2,
            "batch_size": 16,
            "max_length": 128,
        },
    ),
    "mnist-cnn-lite": ModelSpec(
        model_id="mnist-cnn-lite",
        task_type="이미지 분류 (처음부터 학습)",
        base_model="custom-cnn-2conv",
        dataset_name="torchvision.datasets.MNIST",
        min_vram_gb=0,  # CPU로도 1~2분 내 수렴
        extra_requirements=[],  # torchvision은 base 이미지에 포함
        hyperparameters={
            "learning_rate": 1e-3,
            "epochs": 3,
            "batch_size": 64,
        },
    ),
}


class ModelCatalog:
    """모델 카탈로그 조회 인터페이스."""

    @staticmethod
    def get_model(model_id: str) -> ModelSpec:
        try:
            return _CATALOG[model_id]
        except KeyError:
            available = ", ".join(_CATALOG)
            raise ValueError(f"알 수 없는 model_id: '{model_id}' (사용 가능: {available})") from None

    @staticmethod
    def list_models() -> list[ModelSpec]:
        return list(_CATALOG.values())


def demo() -> None:
    assert len(ModelCatalog.list_models()) == 2
    assert ModelCatalog.get_model("klue-bert-finetune").base_model == "klue/bert-base"
    assert ModelCatalog.get_model("mnist-cnn-lite").min_vram_gb == 0
    try:
        ModelCatalog.get_model("no-such-model")
    except ValueError:
        pass
    else:
        raise AssertionError("존재하지 않는 model_id는 ValueError를 던져야 함")
    print("catalog.py self-check OK")


if __name__ == "__main__":
    demo()
