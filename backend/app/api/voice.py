from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import VoiceAgentRequest, VoiceAgentResponse
from app.services.voice_service import VoiceAgentService

router = APIRouter(prefix="/voice", tags=["Voice AI Agent"])

@router.post("/assistant", response_model=VoiceAgentResponse)
def ask_voice_assistant(
    request: VoiceAgentRequest,
    db: Session = Depends(get_db)
):
    service = VoiceAgentService(db)
    return service.process_voice_query(request)

@router.get("/samples")
def get_sample_voice_prompts():
    return {
        "en": [
            "I am a 20 year old engineering student from Tamil Nadu. Show me scholarships.",
            "I am a small farmer and need financial assistance.",
            "Are there any business startup schemes for women in Tamil Nadu?",
            "Health insurance schemes covering hospitalization up to 5 lakhs",
            "Interest-free loans for new entrepreneurs"
        ],
        "ta": [
            "நான் கல்லூரியில் படிக்கும் மாணவர், எனக்கு கல்வி உதவித்தொகை திட்டங்கள் உள்ளதா?",
            "விவசாயிகளுக்கான உதவித்தொகை மற்றும் மானிய திட்டங்கள் எவை?",
            "மகளிருக்கான ₹1,000 உரிமைத் தொகை திட்டம் மற்றும் மகளிர் கடன்கள் பற்றி கூறுங்கள்",
            "முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் பற்றி சொல்லுங்கள்",
            "புதிய தொழில் தொடங்க அரசு தரும் முத்ரா கடன் உதவி என்ன?"
        ]
    }

@router.get("/status")
def voice_agent_status():
    return {
        "status": "ready",
        "supported_languages": ["en-IN", "ta-IN"],
        "speech_recognition": "browser_web_speech_api",
        "speech_synthesis": "browser_web_speech_api",
        "ai_engine": "SchemeSaarthi Multilingual Voice Engine"
    }
