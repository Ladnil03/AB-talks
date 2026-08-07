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
                self.curriculum = json.load(f)
                self.days_by_number = {d.get("dayNumber", idx + 1): d for idx, d in enumerate(self.curriculum)}

        if os.path.exists(cand_path):
            with open(cand_path, "r", encoding="utf-8") as f:
                cands_list = json.load(f)
                self.candidates = {c.get("id", str(idx)): c for idx, c in enumerate(cands_list)}


data_loader = DataLoader()
