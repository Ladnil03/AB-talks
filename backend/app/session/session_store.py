"""Session store abstraction supporting in-memory and Redis adapters."""
from typing import Dict, Optional, Any


class BaseSessionStore:
    def get(self, session_id: str) -> Optional[Dict[str, Any]]:
        raise NotImplementedError

    def set(self, session_id: str, state: Dict[str, Any]) -> None:
        raise NotImplementedError

    def exists(self, session_id: str) -> bool:
        raise NotImplementedError

    def delete(self, session_id: str) -> None:
        raise NotImplementedError


class InMemorySessionStore(BaseSessionStore):
    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}

    def get(self, session_id: str) -> Optional[Dict[str, Any]]:
        return self._store.get(session_id)

    def set(self, session_id: str, state: Dict[str, Any]) -> None:
        self._store[session_id] = state

    def exists(self, session_id: str) -> bool:
        return session_id in self._store

    def delete(self, session_id: str) -> None:
        self._store.pop(session_id, None)


# Default singleton instance
session_store = InMemorySessionStore()
