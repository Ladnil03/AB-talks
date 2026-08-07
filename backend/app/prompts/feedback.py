"""Production prompt generator for feedback synthesis."""

def build_feedback_prompt(transcript: list, days_covered: list) -> str:
    return f"Synthesize structured evaluation for transcript across days {days_covered} with summary, strengths, gaps, and next recommendations."
