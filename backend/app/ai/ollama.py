import json
import logging
import httpx
from typing import Dict, Any, List
from app.ai.base import BaseAIService
from app.ai.rule_based import RuleBasedAIService
from app.config import settings

logger = logging.getLogger(__name__)

class OllamaAIService(BaseAIService):
    def __init__(self):
        self.base_url = settings.OLLAMA_URL
        self.fallback = RuleBasedAIService()

    def parse_query_intent(self, query: str) -> Dict[str, Any]:
        try:
            url = f"{self.base_url}/api/generate"
            prompt = f"""Extract structured criteria from this citizen scheme query:
"{query}"
Return ONLY valid JSON matching this schema:
{{
  "age": int or null,
  "gender": "Male" | "Female" | "Transgender" | "All" | null,
  "state": string or null,
  "income": float or null (in INR),
  "is_student": bool or null,
  "education_level": string or null,
  "is_farmer": bool or null,
  "is_entrepreneur": bool or null,
  "disability": bool or null,
  "categories": [string],
  "keywords": [string]
}}"""
            payload = {
                "model": "llama3",
                "prompt": prompt,
                "format": "json",
                "stream": False
            }
            with httpx.Client(timeout=3.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    response_text = data.get("response", "{}")
                    return json.loads(response_text)
        except Exception as e:
            logger.debug(f"Ollama call not available or failed: {e}")

        return self.fallback.parse_query_intent(query)

    def explain_match(self, scheme_data: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, List[str]]:
        return self.fallback.explain_match(scheme_data, user_profile)
