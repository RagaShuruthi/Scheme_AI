import json
import logging
import httpx
from typing import Dict, Any, List
from app.ai.base import BaseAIService
from app.ai.rule_based import RuleBasedAIService
from app.config import settings

logger = logging.getLogger(__name__)

class GeminiAIService(BaseAIService):
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.fallback = RuleBasedAIService()

    def parse_query_intent(self, query: str) -> Dict[str, Any]:
        if not self.api_key:
            return self.fallback.parse_query_intent(query)
        
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
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
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"}
            }
            with httpx.Client(timeout=5.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(raw_text)
                    return parsed
        except Exception as e:
            logger.warning(f"Gemini API call failed, falling back to rule-based parser: {e}")
            
        return self.fallback.parse_query_intent(query)

    def explain_match(self, scheme_data: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, List[str]]:
        return self.fallback.explain_match(scheme_data, user_profile)
