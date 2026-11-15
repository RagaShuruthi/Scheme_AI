from app.config import settings
from app.ai.base import BaseAIService
from app.ai.rule_based import RuleBasedAIService
from app.ai.gemini import GeminiAIService
from app.ai.ollama import OllamaAIService

def get_ai_service() -> BaseAIService:
    """
    Modular AI service factory. Prioritizes Gemini if configured,
    or falls back cleanly.
    """
    if settings.GEMINI_API_KEY:
        return GeminiAIService()
    return RuleBasedAIService()
