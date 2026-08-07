"""Data loader for curriculum.json and candidates.json with startup validation."""
import os
import json
from typing import Dict, Any, List


class DataLoader:
    def __init__(self, data_dir: str = "datasets"):
        self.data_dir = data_dir
        self.curriculum: List[Dict[str, Any]] = []
        self.candidates: Dict[str, Dict[str, Any]] = {}
        self.days_by_number: Dict[int, Dict[str, Any]] = {}

    def load_all(self) -> None:
        """Loads and indexes datasets."""
        curr_path = os.path.join(self.data_dir, "curriculum.json")
        cand_path = os.path.join(self.data_dir, "candidates.json")

        if os.path.exists(curr_path):
            with open(curr_path, "r", encoding="utf-8") as f:
                raw_curr = json.load(f)
                self.curriculum = raw_curr.get("days", []) if isinstance(raw_curr, dict) else raw_curr
                days_map: Dict[int, Dict[str, Any]] = {}
                for idx, d in enumerate(self.curriculum):
                    if isinstance(d, dict):
                        raw_day = d.get("day") if d.get("day") is not None else d.get("dayNumber", idx + 1)
                        day_num = int(raw_day) if raw_day is not None else (idx + 1)
                        days_map[day_num] = d
                self.days_by_number = days_map

        if os.path.exists(cand_path):
            with open(cand_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
                cands_list = raw_data.get("candidates", []) if isinstance(raw_data, dict) else raw_data
                self.candidates = {
                    c.get("member", {}).get("id", c.get("id", str(idx))): c
                    for idx, c in enumerate(cands_list)
                    if isinstance(c, dict)
                }


data_loader = DataLoader()
