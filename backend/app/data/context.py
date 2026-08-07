"""AI-track data context: loads and indexes the real cohort datasets.

The Backend Engineer owns ``app/data/loader.py``; this module is the AI track's
independent, self-contained access layer so the graph does not depend on the
backend loader or its schema. It reads the canonical datasets from
``backend/datasets/`` (the same files the Backend Engineer will index).
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

DATASETS_DIR = Path(__file__).resolve().parent.parent.parent / "datasets"


class CohortContext:
    """Lazy-loaded index over candidates.json and curriculum.json."""

    def __init__(self, data_dir: str | Path | None = None) -> None:
        self.data_dir = Path(data_dir) if data_dir else DATASETS_DIR
        self._candidates: dict[str, dict[str, Any]] = {}
        self._days: dict[int, dict[str, Any]] = {}
        self._modules: list[dict[str, Any]] = []
        self._module_by_day: dict[int, int] = {}
        self._loaded = False

    def load(self) -> None:
        cand_path = self.data_dir / "candidates.json"
        curr_path = self.data_dir / "curriculum.json"

        if cand_path.exists():
            raw = json.loads(cand_path.read_text(encoding="utf-8"))
            for cand in raw.get("candidates", []):
                member = cand.get("member") or {}
                candidate_id = member.get("id")
                if candidate_id:
                    self._candidates[candidate_id] = cand
        else:
            logger.warning("candidates.json not found at %s", cand_path)

        if curr_path.exists():
            raw = json.loads(curr_path.read_text(encoding="utf-8"))
            self._modules = raw.get("modules", [])
            for mod in self._modules:
                days = sorted(d for d in mod.get("days", []) if isinstance(d, int))
                if not days:
                    continue
                n = mod.get("n")
                if not isinstance(n, int):
                    continue
                for start, end in zip(days, days[1:], strict=False):
                    for day in range(start, end + 1):
                        self._module_by_day[day] = n
                if len(days) == 1:
                    self._module_by_day[days[0]] = n
            for day in raw.get("days", []):
                day_no = day.get("day")
                if day_no is not None:
                    enriched = dict(day)
                    module_no = self._module_by_day.get(day_no)
                    enriched["module"] = next(
                        (m.get("title") for m in self._modules if m.get("n") == module_no), None
                    )
                    self._days[day_no] = enriched
        else:
            logger.warning("curriculum.json not found at %s", curr_path)

        self._loaded = True

    def _ensure_loaded(self) -> None:
        if not self._loaded:
            self.load()

    def get_candidate(self, candidate_id: str) -> dict[str, Any] | None:
        self._ensure_loaded()
        return self._candidates.get(candidate_id)

    def candidate_ids(self) -> list[str]:
        self._ensure_loaded()
        return list(self._candidates.keys())

    def get_day(self, day: int) -> dict[str, Any] | None:
        self._ensure_loaded()
        return self._days.get(day)

    def day_title(self, day: int) -> str:
        day_info = self.get_day(day)
        title = day_info.get("title") if day_info else None
        return title if isinstance(title, str) else ""

    def module_for_day(self, day: int) -> int | None:
        self._ensure_loaded()
        return self._module_by_day.get(day)

    def curriculum(self) -> dict[str, Any]:
        self._ensure_loaded()
        return {
            "modules": list(self._modules),
            "days": [self._days[k] for k in sorted(self._days)],
        }

    def module_spanning_map(self) -> dict[int, int]:
        self._ensure_loaded()
        return dict(self._module_by_day)


ctx = CohortContext()
