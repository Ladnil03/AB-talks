"""Production prompt generator for answer evaluation."""

def build_evaluation_prompt(question: str, answer: str, objectives: str) -> str:
    return f"Evaluate candidate answer for question: {question} against objectives: {objectives}. Answer: {answer}"
