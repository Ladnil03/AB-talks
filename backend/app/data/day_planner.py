"""Day-planner / personalization engine selecting optimal anchor days.

Scoring priority (high -> low):
1. ``passed == False`` and ``attempts >= 4``  -> weak spot (foundational framing)
2. ``passed == False`` and ``attempts <  4``  -> weak spot
3. ``skipped == True``                        -> medium priority (different question style)
4. ``passed == True`` and ``attempts == 1`` and high first-try rate -> stretch (harder question)
5. ``passed == True`` and ``attempts == 1``   -> standard
6. ``passed == True`` and ``attempts >  1``   -> stable

Selection greedily spreads the anchors across >= ``min_modules`` distinct
curriculum modules (weakest topics first), then fills up to ``total_days``.
When no curriculum is supplied (backward-compatible call from the backend
loader) the planner still returns >= 4 distinct days from the candidate's
missions, or a representative default anchor list for empty histories.
"""
from __future__ import annotations

from typing import Any

DEFAULT_ANCHOR_DAYS = [1, 7, 12, 16, 22, 31]


def _mission_score(mission: dict[str, Any], signals: dict[str, Any]) -> float:
    if mission.get("skipped"):
        return 3.0
    passed = mission.get("passed")
    attempts = mission.get("attempts", 0)
    if passed is False:
        return 5.0 if attempts >= 4 else 4.0
    if passed is True:
        if attempts == 1:
            first_try = signals.get("missionsFirstTry", 0)
            completed = signals.get("missionsCompleted", 0)
            if first_try >= max(20, 0.6 * completed):
                return 2.0
            return 1.5
        return 1.0
    return 2.5


def _day_to_module_map(curriculum: dict[str, Any] | None) -> dict[int, int]:
    """Map every curriculum day to its module, expanding boundary lists into ranges.

    Curriculum modules list their day range by boundaries (e.g. ``[7, 10]``), so a
    mission falling between two boundaries (e.g. day 8) still belongs to that module.
    """
    mapping: dict[int, int] = {}
    if not curriculum:
        return mapping
    for mod in curriculum.get("modules", []):
        days = sorted(d for d in mod.get("days", []) if isinstance(d, int))
        if not days:
            continue
        n = mod.get("n")
        for start, end in zip(days, days[1:], strict=False):
            for day in range(start, end + 1):
                mapping[day] = n
        if len(days) == 1:
            mapping[days[0]] = n
    return mapping


def select_day_plan(
    candidate: dict[str, Any] | None,
    curriculum: dict[str, Any] | None = None,
    total_days: int = 6,
    min_days: int = 4,
    min_modules: int = 4,
) -> list[int]:
    """Select anchor curriculum days for a candidate's interview."""
    total_days = max(1, total_days)
    min_days = max(1, min(min_days, total_days))

    if not candidate or not candidate.get("missions"):
        return list(DEFAULT_ANCHOR_DAYS)

    missions = [m for m in candidate.get("missions", []) if isinstance(m, dict)]
    if not missions:
        return list(DEFAULT_ANCHOR_DAYS)

    signals = candidate.get("signals") or {}
    day_to_module = _day_to_module_map(curriculum)

    if curriculum and day_to_module:
        valid = [m for m in missions if m.get("day") in day_to_module]
        if valid:
            missions = valid

    scored = sorted(
        missions,
        key=lambda m: (-_mission_score(m, signals), m.get("attempts", 0), m.get("day", 10**9)),
    )

    selected: list[int] = []
    selected_mods: set = set()

    # Phase 1: spread across distinct modules (weakest topics first).
    for mission in scored:
        if len(selected) >= total_days or len(selected_mods) >= min_modules:
            break
        mod = day_to_module.get(mission["day"])
        if mod is not None and mod not in selected_mods:
            selected.append(mission["day"])
            selected_mods.add(mod)

    # Phase 2: fill remaining slots by priority.
    for mission in scored:
        if len(selected) >= total_days:
            break
        if mission["day"] not in selected:
            selected.append(mission["day"])
            mod = day_to_module.get(mission["day"])
            if mod is not None:
                selected_mods.add(mod)

    # Phase 3: pad to min_days when the curriculum offered fewer modules.
    if len(selected) < min_days:
        for mission in scored:
            if len(selected) >= min_days:
                break
            if mission["day"] not in selected:
                selected.append(mission["day"])

    if not selected:
        return list(DEFAULT_ANCHOR_DAYS)
    return selected[:total_days]
