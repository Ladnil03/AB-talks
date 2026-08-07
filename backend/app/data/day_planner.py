"""Day-planner / personalization engine selecting optimal anchor days for a candidate."""
from typing import List, Dict, Any


def select_day_plan(candidate_history: Dict[str, Any], total_days: int = 5) -> List[int]:
    """Scores candidate missions and greedily selects 5-6 anchor days spanning distinct modules.
    
    Priority scoring:
    - passed: False and attempts >= 4 -> High priority (Weak spot)
    - skipped: True -> Medium priority (Alternative question style)
    - attempts == 1 and missionsFirstTry -> Low priority / Stretch question
    """
    # Default fallback plan if history is sparse
    default_plan = [1, 2, 3, 4, 5]
    if not candidate_history:
        return default_plan

    selected_days: List[int] = []
    missions = candidate_history.get("missions", [])

    # Weak spots first
    for m in missions:
        if not m.get("passed", True) and m.get("attempts", 0) >= 4:
            selected_days.append(m.get("day", 1))

    # Add standard anchor days
    for day in range(1, 10):
        if len(selected_days) >= total_days:
            break
        if day not in selected_days:
            selected_days.append(day)

    return selected_days[:total_days] if selected_days else default_plan
