import re
from typing import Dict, Any, List
from app.ai.base import BaseAIService

class RuleBasedAIService(BaseAIService):
    """
    High-precision deterministic NLP parser that works out-of-the-box
    without any external API keys or network latency.
    """
    def parse_query_intent(self, query: str) -> Dict[str, Any]:
        q_lower = query.lower()
        extracted: Dict[str, Any] = {
            "keywords": [],
            "state": None,
            "age": None,
            "income": None,
            "is_student": None,
            "education_level": None,
            "is_farmer": None,
            "is_entrepreneur": None,
            "gender": None,
            "disability": None,
            "categories": []
        }

        # 1. Age extraction: English and Tamil ("20 year old", "20 yr", "age 25", "20 வயது")
        age_match = re.search(r'\b(?:age\s*[:=]?\s*(\d{1,2})|(\d{1,2})\s*(?:year(?:s)?|yr(?:s)?|வயது)(?:\s*old)?)\b', q_lower)
        if age_match:
            val = age_match.group(1) or age_match.group(2)
            if val:
                extracted["age"] = int(val)

        # 2. Income extraction: English and Tamil ("2 lakh", "2.5 lakhs", "₹2,00,000", "2 லட்சம்", "₹2 லட்சம்")
        income_lakh_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|l|லட்சம்)\b', q_lower)
        if income_lakh_match:
            try:
                extracted["income"] = float(income_lakh_match.group(1)) * 100000
            except ValueError:
                pass
        else:
            income_num_match = re.search(r'(?:income|salary|earning|earns|வருமானம்)?\s*(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})+|\d{4,8})', q_lower)
            if income_num_match:
                clean_num = income_num_match.group(1).replace(",", "")
                try:
                    num_val = float(clean_num)
                    if num_val > 5000:  # avoid picking up small ages or dates
                        extracted["income"] = num_val
                except ValueError:
                    pass

        # 3. Location / State (English & Tamil)
        if any(w in q_lower for w in ["tamil nadu", "தமிழ்நாடு", "tn", "chennai", "சென்னை", "coimbatore", "கோவை", "madurai", "மதுரை", "திருச்சி", "சேலம்"]):
            extracted["state"] = "Tamil Nadu"
            extracted["keywords"].extend(["tamil nadu"])

        # 4. Gender (English & Tamil)
        if any(w in q_lower for w in ["woman", "women", "female", "girl", "mother", "daughter", "widow", "பெண்", "பெண்கள்", "மகளிர்", "தாய்", "விதவை"]):
            extracted["gender"] = "Female"
            extracted["categories"].append("Women & Child Welfare")
            extracted["keywords"].extend(["women", "female", "girl"])
        elif "transgender" in q_lower:
            extracted["gender"] = "Transgender"

        # 5. Student / Education (English & Tamil)
        if any(w in q_lower for w in ["student", "studying", "scholarship", "college", "school", "engineering", "undergraduate", "postgraduate", "diploma", "மாணவர்", "மாணவர்கள்", "மாணவி", "பள்ளி", "கல்லூரி", "கல்வி", "உதவித்தொகை", "படிப்பு", "ஸ்காலர்ஷிப்"]):
            extracted["is_student"] = True
            extracted["categories"].append("Scholarships")
            extracted["categories"].append("Education")
            extracted["keywords"].extend(["student", "scholarship", "education"])
            if any(w in q_lower for w in ["engineering", "பொறியியல்"]):
                extracted["education_level"] = "Engineering"
                extracted["keywords"].append("engineering")
            elif any(w in q_lower for w in ["college", "degree", "ug", "undergraduate", "கல்லூரி", "பட்டப்படிப்பு"]):
                extracted["education_level"] = "Undergraduate"
            elif any(w in q_lower for w in ["school", "பள்ளி"]):
                extracted["education_level"] = "School"

        # 6. Farmer / Agriculture (English & Tamil)
        if any(w in q_lower for w in ["farmer", "farming", "agriculture", "kisan", "crop", "landowner", "விவசாயி", "விவசாயிகள்", "விவசாயம்", "பயிர்", "நிலம்", "கிசான்"]):
            extracted["is_farmer"] = True
            extracted["categories"].append("Agriculture")
            extracted["keywords"].extend(["farmer", "agriculture", "kisan", "crop"])

        # 7. Entrepreneur / Business / Startup (English & Tamil)
        if any(w in q_lower for w in ["business", "entrepreneur", "startup", "msme", "shop", "enterprise", "loan", "mudra", "தொழில்", "வணிகம்", "சுயதொழில்", "முத்ரா", "கடன்", "வியாபாரம்"]):
            extracted["is_entrepreneur"] = True
            extracted["categories"].append("Entrepreneurship")
            extracted["categories"].append("Finance")
            extracted["keywords"].extend(["business", "loan", "mudra", "msme", "entrepreneur"])

        # 8. Disability (English & Tamil)
        if any(w in q_lower for w in ["disabled", "disability", "handicap", "divyang", "pwd", "மாற்றுத்திறனாளி", "ஊனமுற்ற"]):
            extracted["disability"] = True
            extracted["categories"].append("Disability")
            extracted["keywords"].extend(["disability", "disabled"])

        # 9. Healthcare (English & Tamil)
        if any(w in q_lower for w in ["health", "hospital", "medical", "treatment", "insurance", "ayushman", "மருத்துவம்", "சிகிச்சை", "ஆரோக்கியம்", "காப்பீடு", "மருத்துவமனை", "ஆயுஷ்மான்"]):
            extracted["categories"].append("Healthcare")
            extracted["keywords"].extend(["health", "medical", "hospital", "insurance"])

        # 10. Housing (English & Tamil)
        if any(w in q_lower for w in ["house", "housing", "awas", "home", "shelter", "வீடு", "வீட்டு வசதி", "குடியிருப்பு", "ஆவாஸ்"]):
            extracted["categories"].append("Housing")
            extracted["keywords"].extend(["housing", "house", "awas"])

        # 11. Senior Citizens (English & Tamil)
        if any(w in q_lower for w in ["senior", "elder", "old age", "pension", "முதியோர்", "ஓய்வூதியம்", "வயதான", "பென்ஷன்"]):
            extracted["categories"].append("Senior Citizens")
            extracted["keywords"].extend(["pension", "senior", "elder"])

        # 12. Employment (English & Tamil)
        if any(w in q_lower for w in ["job", "employment", "apprenticeship", "training", "வேலை", "வேலைவாய்ப்பு", "பயிற்சி", "100 நாள்"]):
            extracted["categories"].append("Employment")
            extracted["keywords"].extend(["employment", "job", "training"])

        # Add remaining English words
        words = re.findall(r'\b[a-zA-Z]{3,}\b', q_lower)
        stop_words = {"the", "and", "for", "with", "from", "are", "there", "any", "show", "tell", "need", "want", "help", "please"}
        for w in words:
            if w not in stop_words and w not in extracted["keywords"]:
                extracted["keywords"].append(w)

        return extracted

    def explain_match(self, scheme_data: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, List[str]]:
        why_qualify = []
        why_not_qualify = []

        rules = scheme_data.get("eligibility_rule") or {}
        
        # State check
        applicable_states = rules.get("applicable_states") or ["All India"]
        user_state = user_profile.get("state")
        if "All India" in applicable_states:
            why_qualify.append("Available across all states of India")
        elif user_state and user_state in applicable_states:
            why_qualify.append(f"State requirement satisfied ({user_state})")
        elif user_state:
            why_not_qualify.append(f"Restricted to: {', '.join(applicable_states)}")

        # Age check
        min_age = rules.get("min_age")
        max_age = rules.get("max_age")
        user_age = user_profile.get("age")
        if user_age is not None:
            if (min_age is None or user_age >= min_age) and (max_age is None or user_age <= max_age):
                if min_age or max_age:
                    age_str = f"{min_age or 0} - {max_age or 'no upper limit'}"
                    why_qualify.append(f"Age requirement satisfied (User is {user_age}, required: {age_str} yrs)")
            else:
                why_not_qualify.append(f"Age {user_age} outside eligible range ({min_age or 0} - {max_age or 'no upper limit'})")

        # Income check
        max_income = rules.get("max_income")
        user_income = user_profile.get("annual_income")
        if max_income is not None:
            if user_income is not None and user_income <= max_income:
                why_qualify.append(f"Income requirement satisfied (Family income ₹{user_income:,.0f} ≤ limit ₹{max_income:,.0f})")
            elif user_income is not None and user_income > max_income:
                why_not_qualify.append(f"Family income ₹{user_income:,.0f} exceeds max threshold ₹{max_income:,.0f}")
            else:
                why_qualify.append(f"Max income limit is ₹{max_income:,.0f}/year")

        # Gender check
        rule_gender = rules.get("gender", "All")
        user_gender = user_profile.get("gender")
        if rule_gender and rule_gender != "All":
            if user_gender and user_gender.lower() == rule_gender.lower():
                why_qualify.append(f"Target beneficiary gender match ({rule_gender})")
            elif user_gender and user_gender != "All":
                why_not_qualify.append(f"Exclusively for {rule_gender} applicants")

        # Student check
        if rules.get("is_student") is True:
            if user_profile.get("student_status") is True:
                why_qualify.append("Student status requirement satisfied")
            elif user_profile.get("student_status") is False:
                why_not_qualify.append("Requires active student enrollment")

        # Farmer check
        if rules.get("is_farmer") is True:
            if user_profile.get("is_farmer") is True:
                why_qualify.append("Farmer / agricultural background verified")
            else:
                why_not_qualify.append("Requires farmer status / agricultural land")

        # Entrepreneur check
        if rules.get("is_entrepreneur") is True:
            if user_profile.get("is_entrepreneur") is True:
                why_qualify.append("Entrepreneurship / business ownership verified")
            else:
                why_not_qualify.append("Intended for entrepreneurs or new enterprise creators")

        # Disability check
        if rules.get("is_disabled") is True:
            if user_profile.get("disability_status") is True:
                why_qualify.append("Disability assistance criteria matched")
            else:
                why_not_qualify.append("Requires certified disability documentation")

        if not why_qualify:
            why_qualify.append("General public citizen welfare scheme")

        return {"why_qualify": why_qualify, "why_not_qualify": why_not_qualify}
