"""Production prompt generator for technical questions."""

def build_question_prompt(day_info: dict, candidate_stats: dict) -> str:
    return (
        f"Generate an open-ended engineering question for Day {day_info.get('dayNumber', 1)} "
        f"covering {day_info.get('topic', 'Core Topics')} with focus on practical architecture."
    )
