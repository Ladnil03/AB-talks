# Prompt Engineering Guide

This guide establishes design rules, token budget targets, and evaluation criteria for all prompts created by team members.

---

## 1. Core Principles

1. **Strict Grounding**: Prompts must only refer to objectives and tools defined in `curriculum.json` and performance attributes in `candidates.json`. Never invent libraries or concepts not in the curriculum.
2. **Deterministic JSON Formatting**: Any evaluation or synthesis prompt returning JSON must provide an explicit schema and specify `"Return ONLY a valid JSON object"`.
3. **Conversational vs. Quiz**: Questions must be framed as engineering scenarios ("How would you solve X?") rather than trivia questions ("Define X.").
4. **Token Economy**: System prompts should be concise and focused (< 350 tokens) to ensure rapid response latency.

---

## 2. Prompt Lifecycle

```
Drafting in docs/prompts/templates/ 
  ──> Offline CLI testing in team/ai_engineer/ 
  ──> Benchmark validation 
  ──> Code integration in backend/app/prompts/ 
  ──> Changelog update in docs/prompts/changelog.md
```

---

## 3. Structured Output Validation Pattern

```python
# All JSON prompts must implement a single retry mechanism on malformed output
try:
    data = json.loads(raw_output)
except json.JSONDecodeError:
    # Retry with error reflection
    data = retry_generate_json(prompt, error_msg="Output was not valid JSON")
```
