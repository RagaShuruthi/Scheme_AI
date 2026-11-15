import re
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.models import Scheme
from app.services.search_service import SearchEngine
from app.schemas.schemas import SchemeListOut, VoiceAgentRequest, VoiceAgentResponse, VoiceChatMessage
from app.config import settings

logger = logging.getLogger(__name__)

# Common Tamil welfare keywords dictionary for intent mapping
TAMIL_SCHEME_TITLES = {
    "tamil-nadu-post-matric-scholarship": "தமிழ்நாடு போஸ்ட் மெட்ரிக் கல்வி உதவித்தொகை திட்டம்",
    "puthumai-penn-scheme": "மூவலூர் ராமாமிர்தம் அம்மையார் உயர் கல்வி உறுதித் திட்டம் (புதுமைப் பெண்)",
    "tn-cmchis-health-insurance": "முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் (CMCHIS)",
    "pm-kisan-samman-nidhi": "பிரதம மந்திரி கிசான் சம்மான் நிதி (PM-KISAN)",
    "pm-jay-ayushman-bharat": "ஆயுஷ்மான் பாரத் - பிரதம மந்திரி மக்கள் ஆரோக்கியத் திட்டம் (PM-JAY)",
    "pradhan-mantri-mudra-yojana": "பிரதம மந்திரி முத்ரா கடன் திட்டம் (PMMY)",
    "kalaignar-magalir-urimai-thittam": "கலைஞர் மகளிர் உரிமைத் திட்டம் (KMUT)",
    "pmay-urban-housing-scheme": "பிரதம மந்திரி ஆவாஸ் யோஜனா - நகர்ப்புறம் (PMAY-U 2.0)",
    "tn-annal-ambedkar-business-champions": "அண்ணல் அம்பேத்கர் தொழில் முன்னோடிகள் திட்டம் (AABCS)",
    "udid-and-adip-disability-assistance": "மாற்றுத்திறனாளிகளுக்கான தேசிய அடையாள அட்டை மற்றும் உபகரணங்கள் உதவித் திட்டம்",
    "national-means-cum-merit-scholarship": "தேசிய வருவாய் வழி மற்றும் திறன் படிப்புதவித் தொகை திட்டம் (NMMSS)",
    "indira-gandhi-old-age-pension": "இந்திரா காந்தி தேசிய முதியோர் ஓய்வூதியத் திட்டம் (IGNOAPS)",
    "pm-matru-vandana-yojana": "பிரதம மந்திரி மாத்ரு வந்தனா யோஜனா (PMMVY)",
    "tn-cm-breakfast-scheme": "தமிழ்நாடு முதலமைச்சரின் காலை உணவுத் திட்டம்",
    "stand-up-india-scheme": "ஸ்டாண்ட்-அப் இந்தியா திட்டம் (Stand-Up India)",
    "day-nrlm-rural-livelihoods": "தீன்தயாள் அந்த்யோதயா யோஜனா - தேசிய ஊரக வாழ்வாதார இயக்கம் (DAY-NRLM)",
    "pm-jan-dhan-yojana": "பிரதம மந்திரி ஜன் தன் திட்டம் (PMJDY)",
    "pm-jeevan-jyoti-bima-yojana": "பிரதம மந்திரி ஜீவன் ஜோதி பீமா திட்டம் (PMJJBY)",
    "pm-surya-ghar-muft-bijli-yojana": "பிரதம மந்திரி சூர்ய கர் - இலவச மின்சாரத் திட்டம்",
    "ayushman-vay-vandana-scheme": "ஆயுஷ்மான் பாரத் வய வந்தனா திட்டம் (70+ முதியோர் நலம்)",
    "pahal-dbt-lpg-subsidy": "பஹல் - நேரடி எல்பிஜி சமையல் எரிவாயு மானியத் திட்டம்",
    "national-apprenticeship-promotion-scheme": "தேசிய தொழிற்பழகுநர் ஊக்குவிப்புத் திட்டம் (NAPS)",
    "national-overseas-scholarship-sc-st": "தேசிய வெளிநாட்டுக் கல்வி உதவித்தொகை (SC/ST)",
    "pmay-gramin-housing-scheme": "பிரதம மந்திரி ஆவாஸ் யோஜனா - கிராமப்புறம் (PMAY-G)",
    "tn-thamizh-pudhalvan-scheme": "தமிழ்ப் புதல்வன் திட்டம் - தமிழ்நாடு அரசு",
    "tn-naan-mudhalvan-scheme": "நான் முதல்வன் திட்டம் - தமிழ்நாடு அரசு",
    "nabard-ridf-infrastructure": "நபார்டு ஊரக உள்கட்டமைப்பு வளர்ச்சி நிதி (RIDF)",
    "nabard-acabc-agribusiness-scheme": "நபார்டு அக்ரி-கிளினிக் & அக்ரி-பிசினஸ் மையங்கள் திட்டம் (ACABC)",
    "samagra-shiksha-school-education": "சமக்ர சிக்ஷா அபியான் - முழுமையான பள்ளிக் கல்வி இயக்கம்",
    "pm-usha-higher-education": "பிரதம மந்திரி உச்சிதர் சிக்ஷா அபியான் (PM-USHA)",
    "pm-yasasvi-scholarship-scheme": "பிஎம் யசஸ்வி கல்வி உதவித்தொகை திட்டம் (PM-YASASVI)",
    "pm-daksh-skill-training": "பிரதம மந்திரி தக்ஷ் திறன் பயிற்சித் திட்டம் (PM-DAKSH)",
    "mission-shakti-women-welfare": "மிஷன் சக்தி - மகளிர் பாதுகாப்பு மற்றும் அதிகாரமளித்தல் இயக்கம்",
    "pmegp-employment-generation": "பிரதம மந்திரி வேலைவாய்ப்பு உருவாக்கும் திட்டம் (PMEGP)",
    "pm-vishwakarma-scheme": "பிரதம மந்திரி விஸ்வகர்மா திட்டம்",
    "pmfby-crop-insurance": "பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டம் (PMFBY)",
    "kisan-credit-card-scheme": "கிசான் கிரெடிட் கார்டு திட்டம் (KCC)",
    "mgnrega-rural-employment": "மகாத்மா காந்தி தேசிய ஊரக வேலை உறுதித் திட்டம் (MGNREGA)",
    "pmgsy-rural-roads": "பிரதம மந்திரி கிராம சாலைத் திட்டம் (PMGSY)",
    "pm-svanidhi-street-vendors": "பிரதம மந்திரி ஸ்வாநிதி திட்டம் (PM SVANidhi)",
    "amrut-urban-transformation": "அடல் நகர்ப்புற புத்துயிரூட்டல் இயக்கம் (AMRUT 2.0)"
}

TAMIL_KEYWORD_MAP = {
    # Students & Education
    "மாணவர்": ("student", "education"),
    "மாணவி": ("student", "female"),
    "மாணவர்கள்": ("student", "education"),
    "பள்ளி": ("school", "education"),
    "கல்லூரி": ("college", "education"),
    "படிப்பு": ("education", "student"),
    "படிக்கும்": ("student", "education"),
    "கல்வி": ("education", "scholarships"),
    "உதவித்தொகை": ("scholarship", "education"),
    "ஸ்காலர்ஷிப்": ("scholarship", "education"),
    
    # Farmers & Agriculture
    "விவசாயி": ("farmer", "agriculture"),
    "விவசாயிகள்": ("farmer", "agriculture"),
    "விவசாயம்": ("agriculture", "farmer"),
    "பயிர்": ("crop", "agriculture"),
    "நிலம்": ("farmer", "land"),
    "கிசான்": ("farmer", "agriculture"),
    
    # Women & Child Welfare
    "பெண்": ("female", "women"),
    "பெண்கள்": ("female", "women"),
    "மகளிர்": ("women", "female"),
    "தாய்": ("mother", "women"),
    "விதவை": ("widow", "women"),
    "புதுமைப் பெண்": ("puthumai penn", "scholarship"),
    "உரிமைத் தொகை": ("kalaignar magalir", "finance"),
    
    # Healthcare
    "மருத்துவம்": ("healthcare", "hospital"),
    "சிகிச்சை": ("treatment", "healthcare"),
    "காப்பீடு": ("insurance", "healthcare"),
    "மருத்துவமனை": ("hospital", "healthcare"),
    "ஆரோக்கியம்": ("health", "healthcare"),
    "காப்பீட்டு": ("insurance", "healthcare"),
    
    # Housing & Shelter
    "வீடு": ("housing", "home"),
    "குடியிருப்பு": ("housing", "urban"),
    "வீட்டு வசதி": ("housing", "home"),
    
    # Business & Entrepreneurship
    "தொழில்": ("business", "entrepreneur"),
    "வியாபாரம்": ("business", "trade"),
    "சுயதொழில்": ("entrepreneur", "self-employed"),
    "கடன்": ("loan", "finance"),
    "முத்ரா": ("mudra", "entrepreneur"),
    
    # Disability
    "மாற்றுத்திறனாளி": ("disabled", "disability"),
    "மாற்றுத்திறனாளிகள்": ("disabled", "disability"),
    
    # Senior citizens
    "முதியோர்": ("senior citizen", "elderly"),
    "வயதான": ("senior citizen", "elderly"),
    
    # State
    "தமிழ்நாடு": ("Tamil Nadu",),
    "தமிழகம்": ("Tamil Nadu",),
    "சென்னை": ("Tamil Nadu",),
    "மதுரை": ("Tamil Nadu",),
    "கோவை": ("Tamil Nadu",),
}

GREETING_PATTERNS = [
    r"\b(hello|hi|hey|vanakkam|namaste|greetings)\b",
    r"\b(who are you|what can you do|help me|about you)\b",
    r"\b(வணக்கம்|ஹலோ|நீ யார்|உன்னை பற்றி)\b"
]

class VoiceAgentService:
    def __init__(self, db: Session):
        self.db = db
        self.search_engine = SearchEngine(db)

    def is_tamil(self, text: str) -> bool:
        """Detects if text contains Tamil Unicode characters."""
        return bool(re.search(r'[\u0B80-\u0BFF]', text))

    def translate_tamil_query_intent(self, query: str) -> str:
        """
        Enriches a Tamil query with corresponding English keywords so
        the search engine can match schemes effectively.
        """
        enriched_keywords = []
        q_lower = query.lower()

        for tamil_word, eng_keywords in TAMIL_KEYWORD_MAP.items():
            if tamil_word in q_lower:
                enriched_keywords.extend(eng_keywords)

        # Extract numbers (e.g., age, income in Tamil/digits)
        numbers = re.findall(r'\d+', query)
        
        combined = f"{query} {' '.join(set(enriched_keywords))}"
        return combined.strip()

    def is_greeting(self, query: str) -> bool:
        q_lower = query.lower().strip()
        for pattern in GREETING_PATTERNS:
            if re.search(pattern, q_lower):
                return True
        return False

    def process_voice_query(self, request: VoiceAgentRequest) -> VoiceAgentResponse:
        raw_query = request.query.strip()
        user_lang = request.language or "en"
        
        # Auto-detect Tamil if Tamil characters are present
        if self.is_tamil(raw_query):
            user_lang = "ta"

        # Check for simple greeting
        if self.is_greeting(raw_query) and len(raw_query.split()) <= 5:
            return self._handle_greeting(user_lang)

        # Expand Tamil query with English semantic terms for database matching
        search_query = self.translate_tamil_query_intent(raw_query) if user_lang == "ta" else raw_query

        # Use search engine to find best matching schemes
        matched_schemes = self.search_engine.search(query=search_query)

        # Extract criteria tags
        extracted_criteria = self.search_engine.ai.parse_query_intent(search_query)

        # Generate bilingual response
        if user_lang == "ta":
            return self._generate_tamil_response(raw_query, matched_schemes, extracted_criteria)
        else:
            return self._generate_english_response(raw_query, matched_schemes, extracted_criteria)

    def _handle_greeting(self, lang: str) -> VoiceAgentResponse:
        if lang == "ta":
            spoken = (
                "வணக்கம்! நான் திட்டம்சாரதி குரல் உதவியாளர். "
                "தமிழ்நாடு மற்றும் மத்திய அரசின் அனைத்து நலத்திட்டங்கள், உதவித்தொகைகள், மற்றும் மானியங்களை "
                "கண்டறிய நான் உங்களுக்கு உதவுகிறேன். உங்கள் வயது, படிப்பு, தொழில் அல்லது தேவையான உதவியைக் கூறுங்கள்!"
            )
            display = (
                "🙏 **வணக்கம்! நான் திட்டம்சாரதி வாய்ஸ் AI ஏஜென்ட்.**\n\n"
                "தமிழ்நாடு மற்றும் மத்திய அரசின் நலத்திட்டங்களை குரல் வழியாகக் கண்டறிய நான் உதவுகிறேன்.\n\n"
                "**நீங்கள் கேட்கலாம்:**\n"
                "- *\"நான் ஒரு பொறியியல் மாணவர், எனக்கு கல்வி உதவித்தொகை உள்ளதா?\"*\n"
                "- *\"விவசாயிகளுக்கான உதவித்தொகை திட்டங்கள் எவை?\"*\n"
                "- *\"மகளிருக்கான ₹1,000 உரிமைத் தொகை திட்டம் பற்றி கூறுங்கள்.\"*\n"
                "- *\"தமிழ்நாடு அரசு மருத்துவக் காப்பீடு எப்படி பெறுவது?\"*"
            )
            followups = [
                "மாணவர்களுக்கான உதவித்தொகை",
                "விவசாயிகளுக்கான நிதி உதவி",
                "மகளிர் நலத்திட்டங்கள்",
                "மருத்துவக் காப்பீடு"
            ]
        else:
            spoken = (
                "Hello! I am SchemeSaarthi Voice AI Assistant. "
                "I help Indian citizens and students discover Central and Tamil Nadu government welfare schemes. "
                "Tell me your age, occupation, education, or what assistance you need, and I will find the best schemes for you!"
            )
            display = (
                "👋 **Hello! I am SchemeSaarthi Voice AI Agent.**\n\n"
                "I help you find official Central & Tamil Nadu Government welfare schemes using natural voice interaction.\n\n"
                "**Try asking:**\n"
                "- *\"I am a 20-year-old engineering student from Tamil Nadu. Show me scholarships.\"*\n"
                "- *\"I am a farmer and need financial assistance.\"*\n"
                "- *\"What schemes exist for women starting a business?\"*\n"
                "- *\"Show me healthcare schemes with free hospital treatment.\"*"
            )
            followups = [
                "Scholarships for college students",
                "Financial aid for farmers",
                "Women entrepreneur loans",
                "Health insurance schemes"
            ]

        return VoiceAgentResponse(
            spoken_response=spoken,
            display_response=display,
            language=lang,
            matched_schemes=[],
            extracted_criteria={},
            suggested_followups=followups,
            confidence=0.98
        )

    def _generate_english_response(
        self,
        query: str,
        schemes: List[SchemeListOut],
        criteria: Dict[str, Any]
    ) -> VoiceAgentResponse:
        if not schemes:
            spoken = (
                "I searched the official portals, but could not find an exact welfare scheme matching your request. "
                "You can try mentioning your specific state, age, or education level to refine the search."
            )
            display = (
                "🔍 **No exact matching schemes found.**\n\n"
                "We searched through active Central and Tamil Nadu government portals. "
                "Try phrasing your query differently, mentioning your age, state, or category."
            )
            return VoiceAgentResponse(
                spoken_response=spoken,
                display_response=display,
                language="en",
                matched_schemes=[],
                extracted_criteria=criteria,
                suggested_followups=["Show all Central schemes", "Show Tamil Nadu schemes", "Check eligibility with questionnaire"],
                confidence=0.85
            )

        top_schemes = schemes[:3]
        count = len(schemes)

        # Build spoken response (clean, phonetic, no markdown)
        first_scheme = top_schemes[0]
        spoken_parts = [
            f"I found {count} relevant government {'scheme' if count == 1 else 'schemes'} for you."
        ]
        
        spoken_parts.append(
            f"The top match is {first_scheme.name}, with a {first_scheme.match_percentage or 90} percent match."
        )

        if first_scheme.benefits_summary:
            spoken_parts.append(f"Benefit: {first_scheme.benefits_summary}.")
        elif first_scheme.short_description:
            spoken_parts.append(f"{first_scheme.short_description}")

        if len(top_schemes) > 1:
            second_name = top_schemes[1].name
            spoken_parts.append(f"Another great option is {second_name}.")

        spoken_parts.append("You can tap any scheme card to see official application steps and mandatory documents.")
        spoken_text = " ".join(spoken_parts)

        # Build display response
        display_lines = [
            f"🎯 **Found {count} Official Government {'Scheme' if count == 1 else 'Schemes'}** matching your voice query.\n"
        ]
        
        for idx, s in enumerate(top_schemes, 1):
            badge_str = " • ".join(s.qualifying_reasons) if s.qualifying_reasons else s.government_level
            display_lines.append(
                f"**{idx}. [{s.name}](/schemes/{s.slug or s.id})** ({s.match_percentage or 90}% Match)\n"
                f"- **Level**: {s.government_level} ({s.state})\n"
                f"- **Benefit**: {s.benefits_summary or s.short_description}\n"
                f"- **Status**: `{s.application_status}` | **Source**: {s.source_name or 'Official Portal'}\n"
            )

        display_lines.append("\n*Note: Final sanction is determined exclusively by the official sanctioning government department.*")
        display_text = "\n".join(display_lines)

        followups = [
            f"How to apply for {first_scheme.name[:25]}?",
            "What documents are required?",
            "Show more schemes like this"
        ]

        return VoiceAgentResponse(
            spoken_response=spoken_text,
            display_response=display_text,
            language="en",
            matched_schemes=top_schemes,
            extracted_criteria=criteria,
            suggested_followups=followups,
            confidence=0.95
        )

    def _generate_tamil_response(
        self,
        query: str,
        schemes: List[SchemeListOut],
        criteria: Dict[str, Any]
    ) -> VoiceAgentResponse:
        if not schemes:
            spoken = (
                "மன்னிக்கவும், உங்கள் குரல் கேள்விக்கு இணையான திட்டங்கள் கிடைக்கவில்லை. "
                "உங்கள் வயது, கல்வி அல்லது தொழில் விவரங்களை தெளிவாக கூறி மீண்டும் முயற்சிக்கவும்."
            )
            display = (
                "🔍 **பொருத்தமான திட்டங்கள் கண்டறியப்படவில்லை.**\n\n"
                "உங்கள் வயது, படிப்பு அல்லது மாவட்டத்தை குறிப்பிட்டு மீண்டும் கேட்கவும்."
            )
            return VoiceAgentResponse(
                spoken_response=spoken,
                display_response=display,
                language="ta",
                matched_schemes=[],
                extracted_criteria=criteria,
                suggested_followups=["அனைத்து தமிழ்நாடு திட்டங்கள்", "கல்வி உதவித்தொகை", "விவசாய திட்டங்கள்"],
                confidence=0.85
            )

        top_schemes = schemes[:3]
        count = len(schemes)
        first_scheme = top_schemes[0]
        first_name_ta = TAMIL_SCHEME_TITLES.get(first_scheme.slug, first_scheme.name)

        spoken_parts = [
            f"உங்கள் தேவைக்கு ஏற்ற {count} அரசு திட்டங்களை கண்டறிந்துள்ளேன்."
        ]

        spoken_parts.append(
            f"முதல் திட்டம்: {first_name_ta}. இதில் {first_scheme.match_percentage or 90} சதவீத தகுதி பொருத்தம் உள்ளது."
        )

        if first_scheme.benefits_summary:
            spoken_parts.append(f"பயன்: {first_scheme.benefits_summary}.")
        elif first_scheme.short_description:
            spoken_parts.append(f"{first_scheme.short_description}")

        if len(top_schemes) > 1:
            second_name_ta = TAMIL_SCHEME_TITLES.get(top_schemes[1].slug, top_schemes[1].name)
            spoken_parts.append(f"மேலும் {second_name_ta} திட்டமும் உங்களுக்கு பயனுள்ளதாக இருக்கும்.")

        spoken_parts.append("விண்ணப்பிக்கும் முறை மற்றும் ஆவணங்களை அறிய திரையில் உள்ள திட்ட அட்டை மீது கிளிக் செய்யவும்.")
        spoken_text = " ".join(spoken_parts)

        # Build display response
        display_lines = [
            f"🎯 **உங்களுக்காக {count} அதிகாரப்பூர்வ அரசு திட்டங்கள் கண்டறியப்பட்டன:**\n"
        ]

        for idx, s in enumerate(top_schemes, 1):
            s_name_ta = TAMIL_SCHEME_TITLES.get(s.slug, s.name)
            display_lines.append(
                f"**{idx}. [{s_name_ta}](/schemes/{s.slug or s.id})** ({s.match_percentage or 90}% பொருத்தம்)\n"
                f"- **அரசு**: {'மத்திய அரசுத் திட்டம்' if s.government_level == 'Central' else 'தமிழ்நாடு மாநில அரசுத் திட்டம்'}\n"
                f"- **முக்கிய பயன்**: {s.benefits_summary or s.short_description}\n"
                f"- **நிலை**: `{s.application_status}`\n"
            )

        display_lines.append("\n*குறிப்பு: தகுதி மற்றும் நிதி ஒதுக்கீடு அதிகாரப்பூர்வ அரசு துறையின் சரிபார்ப்புக்கு உட்பட்டது.*")
        display_text = "\n".join(display_lines)

        followups = [
            f"விண்ணப்பிக்கும் முறை என்ன?",
            "தேவையான முக்கிய ஆவணங்கள் எவை?",
            "வேறு என்ன திட்டங்கள் உள்ளன?"
        ]

        return VoiceAgentResponse(
            spoken_response=spoken_text,
            display_response=display_text,
            language="ta",
            matched_schemes=top_schemes,
            extracted_criteria=criteria,
            suggested_followups=followups,
            confidence=0.95
        )
