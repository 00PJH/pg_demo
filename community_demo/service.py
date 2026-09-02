# -*- coding: utf-8 -*-
"""
service.py — 커뮤니티 상호작용 상태와 '실습해보기' 스테이징.

- 글 원본은 posts.py(시드). 추천/조회/즐겨찾기 델타는 state.json에 쌓아 merge한다.
- stage_practice()는 글의 실습 코드를 ai_set_demo/generated/에 실제 파일로 저장한다.
  컨테이너가 /workspace에 이 저장소를 마운트하므로 Web IDE 터미널에서 바로 실행된다.

ponytail: 파일 잠금 없음(로컬 데모, 사용자 1명). 동시성 필요해지면 sqlite로.
"""

import json
import threading
from pathlib import Path

from .posts import POSTS

_DIR = Path(__file__).resolve().parent
_STATE_FILE = _DIR / "state.json"
_GENERATED_DIR = _DIR.parent / "ai_set_demo" / "generated"
_LOCK = threading.Lock()  # ThreadingHTTPServer 워커 간 state.json 쓰기 보호

_ACTIONS = {"view": ("views", 1), "like": ("likes", 1), "unlike": ("likes", -1),
            "bookmark": ("bookmarks", 1), "unbookmark": ("bookmarks", -1)}

_BY_ID = {p["id"]: p for p in POSTS}


def _load_state() -> dict:
    if not _STATE_FILE.exists():
        return {}
    return json.loads(_STATE_FILE.read_text(encoding="utf-8"))


def list_posts() -> list[dict]:
    """시드 글 + 상호작용 델타 merge. 프론트에 그대로 내려간다."""
    state = _load_state()
    merged = []
    for p in POSTS:
        delta = state.get(p["id"], {})
        item = {**p, "practice_available": bool(p["practice"])}
        if p["practice"]:
            item["practice_command"] = f"python ai_set_demo/generated/{p['practice']['filename']}"
        item.pop("practice")  # 코드 본문은 목록 응답에서 제외 (스테이징 시점에 사용)
        for key in ("views", "likes", "bookmarks"):
            item[key] = p[key] + delta.get(key, 0)
        merged.append(item)
    return merged


def interact(post_id: str, action: str) -> dict:
    """추천/조회/즐겨찾기 증감. 갱신된 카운트를 돌려준다."""
    if post_id not in _BY_ID:
        raise KeyError(f"존재하지 않는 글: {post_id}")
    if action not in _ACTIONS:
        raise ValueError(f"지원하지 않는 action: {action}")
    field, step = _ACTIONS[action]
    with _LOCK:
        state = _load_state()
        entry = state.setdefault(post_id, {})
        entry[field] = max(0, entry.get(field, 0) + step)
        _STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=1), encoding="utf-8")
    base = _BY_ID[post_id]
    return {key: base[key] + state[post_id].get(key, 0) for key in ("views", "likes", "bookmarks")}


def stage_practice(post_id: str) -> dict:
    """글의 실습 코드를 generated/에 저장하고 IDE 실행 정보를 돌려준다."""
    post = _BY_ID.get(post_id)
    if post is None:
        raise KeyError(f"존재하지 않는 글: {post_id}")
    practice = post["practice"]
    if not practice:
        raise ValueError("이 글에는 실습 코드가 없습니다.")
    _GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    target = _GENERATED_DIR / practice["filename"]
    header = f'# 출처: plAI-ground 커뮤니티 "{post["title"]}" ({post["id"]})\n'
    if post.get("source"):
        header += f'# 참고: {post["source"]["name"]} — {post["source"]["url"]}\n'
    target.write_text(header + "\n" + practice["code"], encoding="utf-8")
    rel = f"ai_set_demo/generated/{practice['filename']}"
    return {
        "post_id": post_id,
        "title": post["title"],
        "script_path": rel,
        "run_command": f"python {rel}",
    }


def demo() -> None:
    posts = list_posts()
    assert len(posts) == 40 and "practice" not in posts[0] and "practice_available" in posts[0]
    before = interact("err-001", "view")
    after = interact("err-001", "view")
    assert after["views"] == before["views"] + 1
    staged = stage_practice("res-002")
    assert (Path(__file__).parent.parent / staged["script_path"]).exists()
    print(f"service.py self-check OK - staged={staged['script_path']}, views={after['views']}")


if __name__ == "__main__":
    demo()
