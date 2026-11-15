import re
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.models import Scheme, Category, Department
from app.schemas.schemas import SchemeListOut
from app.ai.factory import get_ai_service

class SearchEngine:
    def __init__(self, db: Session):
        self.db = db
        self.ai = get_ai_service()

    def search(
        self,
        query: str,
        category_id: Optional[int] = None,
        government_level: Optional[str] = None,
        state: Optional[str] = None
    ) -> List[SchemeListOut]:
        query_clean = query.strip()
        
        # 1. Parse natural language intent using AI service
        parsed = self.ai.parse_query_intent(query_clean) if query_clean else {}
        
        # Base query
        db_query = self.db.query(Scheme).filter(Scheme.is_active == True)

        if category_id:
            db_query = db_query.filter(Scheme.category_id == category_id)
        if government_level:
            db_query = db_query.filter(Scheme.government_level == government_level)
        if state and state != "All India":
            db_query = db_query.filter(or_(Scheme.state == state, Scheme.state == "All India", Scheme.government_level == "Central"))

        schemes = db_query.all()
        if not schemes:
            return []

        if not query_clean:
            # Just return standard list of top popular schemes
            return [self._format_scheme(s, 100, []) for s in schemes[:60]]

        scored_schemes = []
        raw_tokens = [w for w in re.findall(r'\w+', query_clean.lower()) if len(w) > 1]
        intent_keywords = [k.lower() for k in parsed.get("keywords", [])]
        search_terms = list(set(raw_tokens + intent_keywords))

        for s in schemes:
            score = 0
            badges = []

            corpus = f"{s.name} {s.short_description} {s.full_description} {s.category.name if s.category else ''} {s.state or ''}".lower()
            name_lower = s.name.lower()

            # 1. Title and corpus keyword matches
            for term in search_terms:
                if len(term) >= 3 and term in name_lower:
                    score += 35
                    badges.append(f"✓ Matched '{term}' in title")
                elif len(term) >= 3 and term in corpus:
                    score += 12

            # 2. Category intent match
            matched_cats = parsed.get("categories", [])
            if matched_cats and s.category:
                for mc in matched_cats:
                    if mc.lower() in s.category.name.lower() or s.category.slug in mc.lower():
                        score += 30
                        badges.append(f"✓ Category: {s.category.name}")
                        break

            rules = s.eligibility_rule

            # 3. Student check
            if parsed.get("is_student"):
                if rules and rules.is_student:
                    score += 25
                    badges.append("✓ Student requirement satisfied")
                elif "student" in corpus or "scholarship" in corpus or (s.category and s.category.slug in ["scholarships", "education"]):
                    score += 15
                    badges.append("✓ Student benefit")

            # 4. Farmer check
            if parsed.get("is_farmer"):
                if rules and rules.is_farmer:
                    score += 25
                    badges.append("✓ Farmer / Agriculture eligible")
                elif "farmer" in corpus or "kisan" in corpus or (s.category and s.category.slug == "agriculture"):
                    score += 15
                    badges.append("✓ Agriculture sector")

            # 5. Entrepreneur check
            if parsed.get("is_entrepreneur"):
                if rules and rules.is_entrepreneur:
                    score += 25
                    badges.append("✓ Entrepreneur / MSME support")
                elif any(k in corpus for k in ["business", "loan", "msme", "mudra"]):
                    score += 15
                    badges.append("✓ Business support")

            # 6. Gender check
            if parsed.get("gender") == "Female":
                if rules and rules.gender in ["Female", "Women", "All"]:
                    score += 15
                if any(w in corpus for w in ["women", "female", "girl", "mother", "mahila"]):
                    score += 20
                    badges.append("✓ Women empowerment initiative")

            # 7. State check
            target_state = parsed.get("state")
            if target_state:
                if s.state == target_state:
                    score += 20
                    badges.append(f"✓ {target_state} State scheme")
                elif s.government_level == "Central" or s.state == "All India":
                    score += 10
                    badges.append(f"✓ Applicable in {target_state}")

            # 8. Income check
            parsed_income = parsed.get("income")
            if parsed_income is not None and rules and rules.max_income:
                if parsed_income <= rules.max_income:
                    score += 20
                    badges.append(f"✓ Income requirement satisfied (≤ ₹{rules.max_income:,.0f})")
                else:
                    score -= 20

            # 9. Age check
            parsed_age = parsed.get("age")
            if parsed_age is not None and rules:
                if (rules.min_age is None or parsed_age >= rules.min_age) and (rules.max_age is None or parsed_age <= rules.max_age):
                    score += 15
                    badges.append(f"✓ Age criteria met ({parsed_age} yrs)")

            # EXCLUSION: If score is 0, do NOT include irrelevant schemes!
            if score > 0:
                final_match = min(98, max(45, 40 + score))
                scored_schemes.append((s, final_match, badges))

        # Sort descending by match score
        scored_schemes.sort(key=lambda x: x[1], reverse=True)
        return [self._format_scheme(item[0], item[1], item[2]) for item in scored_schemes[:100]]

    def _format_scheme(self, scheme: Scheme, match_pct: int, badges: List[str]) -> SchemeListOut:
        benefit_text = scheme.benefits[0].title if scheme.benefits else None
        return SchemeListOut(
            id=scheme.id,
            name=scheme.name,
            slug=scheme.slug,
            short_description=scheme.short_description,
            government_level=scheme.government_level,
            state=scheme.state,
            category_id=scheme.category_id,
            category_name=scheme.category.name if scheme.category else None,
            department_name=scheme.department.name if scheme.department else None,
            application_status=scheme.application_status,
            application_deadline=scheme.application_deadline,
            official_application_url=scheme.official_application_url,
            official_source_url=scheme.official_source_url,
            source_name=scheme.source_name,
            last_verified_at=scheme.last_verified_at,
            views_count=scheme.views_count,
            benefits_summary=benefit_text,
            match_percentage=match_pct,
            qualifying_reasons=badges[:3]
        )
