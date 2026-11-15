from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseAIService(ABC):
    @abstractmethod
    def parse_query_intent(self, query: str) -> Dict[str, Any]:
        """
        Parses freeform natural language query into structured criteria:
        e.g., {"age": 20, "is_student": True, "education": "engineering", "state": "Tamil Nadu", "income": 200000, "keywords": ["scholarship"]}
        """
        pass

    @abstractmethod
    def explain_match(self, scheme_data: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, List[str]]:
        """
        Returns why the user qualifies or might not qualify.
        """
        pass
