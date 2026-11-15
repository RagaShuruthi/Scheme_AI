from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.models import Scheme, EligibilityRule
from app.schemas.schemas import EligibilityCheckRequest, EligibilitySchemeMatch, SchemeListOut
from app.ai.factory import get_ai_service

class EligibilityEngine:
    def __init__(self, db: Session):
        self.db = db
        self.ai_service = get_ai_service()

    def evaluate_scheme(self, scheme: Scheme, req: EligibilityCheckRequest) -> Tuple[int, List[str], List[str]]:
        rules: EligibilityRule = scheme.eligibility_rule
        if not rules:
            return (80, ["General welfare scheme with open public criteria"], [])

        total_criteria = 0
        satisfied_criteria = 0
        why_qualify = []
        why_not_qualify = []

        # 1. State check
        applicable_states = rules.applicable_states or ["All India"]
        total_criteria += 1
        if "All India" in applicable_states or "Central" in scheme.government_level:
            satisfied_criteria += 1
            why_qualify.append(f"Available for citizens in {req.state or 'all states'}")
        elif req.state and req.state in applicable_states:
            satisfied_criteria += 1
            why_qualify.append(f"State residency requirement satisfied ({req.state})")
        else:
            why_not_qualify.append(f"Restricted to residents of {', '.join(applicable_states)}")

        # 2. Age check
        min_age = rules.min_age
        max_age = rules.max_age
        if min_age is not None or max_age is not None:
            total_criteria += 1
            if req.age is not None:
                if (min_age is None or req.age >= min_age) and (max_age is None or req.age <= max_age):
                    satisfied_criteria += 1
                    why_qualify.append(f"Age requirement satisfied ({req.age} yrs falls within eligible range)")
                else:
                    range_str = f"{min_age or 0} to {max_age or 'no limit'}"
                    why_not_qualify.append(f"Age {req.age} outside eligible limit ({range_str} yrs)")
            else:
                why_qualify.append(f"Applicable for age {min_age or 0} to {max_age or 'no limit'} yrs")

        # 3. Income check
        max_income = rules.max_income
        if max_income is not None:
            total_criteria += 1
            if req.annual_income is not None:
                if req.annual_income <= max_income:
                    satisfied_criteria += 1
                    why_qualify.append(f"Income requirement satisfied (₹{req.annual_income:,.0f} ≤ ₹{max_income:,.0f}/yr)")
                else:
                    why_not_qualify.append(f"Family income exceeds limit of ₹{max_income:,.0f}/year")
            else:
                why_qualify.append(f"Annual family income cap: ₹{max_income:,.0f}")

        # 4. Gender check
        rule_gender = rules.gender or "All"
        if rule_gender != "All":
            total_criteria += 1
            if req.gender and req.gender.lower() == rule_gender.lower():
                satisfied_criteria += 1
                why_qualify.append(f"Target gender matched ({rule_gender})")
            elif req.gender and req.gender.lower() != "all":
                why_not_qualify.append(f"Scheme specifically targeted to {rule_gender} applicants")

        # 5. Social Category check (SC/ST/OBC/MBC/BC/General)
        rule_cats = rules.social_categories
        if rule_cats and len(rule_cats) > 0 and "All" not in rule_cats:
            total_criteria += 1
            if req.social_category and req.social_category in rule_cats:
                satisfied_criteria += 1
                why_qualify.append(f"Social category eligible ({req.social_category})")
            else:
                why_not_qualify.append(f"Applicable for: {', '.join(rule_cats)}")

        # 6. Student status
        if rules.is_student is True:
            total_criteria += 1
            if req.student_status is True:
                satisfied_criteria += 1
                edu = f" ({req.education_level})" if req.education_level else ""
                why_qualify.append(f"Enrolled student status satisfied{edu}")
            else:
                why_not_qualify.append("Requires active student enrollment in recognized institution")

        # 7. Farmer status
        if rules.is_farmer is True:
            total_criteria += 1
            if req.is_farmer is True:
                satisfied_criteria += 1
                why_qualify.append("Farmer / agricultural background satisfied")
            else:
                why_not_qualify.append("Requires farmer identity / agricultural involvement")

        # 8. Entrepreneur / Business status
        if rules.is_entrepreneur is True:
            total_criteria += 1
            if req.is_entrepreneur is True:
                satisfied_criteria += 1
                why_qualify.append("Entrepreneur / new enterprise promoter status satisfied")
            else:
                why_not_qualify.append("Targeted for entrepreneurs, MSME founders, or business ventures")

        # 9. Disability status
        if rules.is_disabled is True:
            total_criteria += 1
            if req.disability_status is True:
                satisfied_criteria += 1
                why_qualify.append("Disability assistance qualification verified")
            else:
                why_not_qualify.append("Requires certified benchmark disability")

        # 10. Land ownership requirement
        if rules.land_ownership_required is True:
            total_criteria += 1
            if req.owns_land is True:
                satisfied_criteria += 1
                why_qualify.append("Land ownership requirement met")
            else:
                why_not_qualify.append("Requires land ownership record in applicant's name")

        # Calculate percentage
        if total_criteria == 0:
            match_percentage = 90
        else:
            base_score = int((satisfied_criteria / total_criteria) * 100)
            # Add small bonus if reasons to qualify > 0
            match_percentage = max(20, min(98, base_score))

        # Adjust score down if critical blocker (e.g. state or gender mismatch)
        if len(why_not_qualify) > 0 and len(why_qualify) > 0:
            match_percentage = max(35, min(match_percentage, 82))
        elif len(why_not_qualify) > 1:
            match_percentage = max(15, min(match_percentage, 55))

        if not why_qualify:
            why_qualify.append("Public welfare initiative with broad citizen coverage")

        return match_percentage, why_qualify, why_not_qualify

    def check_eligibility(self, req: EligibilityCheckRequest) -> List[EligibilitySchemeMatch]:
        schemes = self.db.query(Scheme).filter(Scheme.is_active == True).all()
        results: List[EligibilitySchemeMatch] = []

        for scheme in schemes:
            score, qualify_reasons, not_qualify_reasons = self.evaluate_scheme(scheme, req)
            
            # Format SchemeListOut
            benefit_text = scheme.benefits[0].title if scheme.benefits else None
            scheme_out = SchemeListOut(
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
                match_percentage=score,
                qualifying_reasons=qualify_reasons[:3]
            )

            results.append(EligibilitySchemeMatch(
                scheme=scheme_out,
                match_percentage=score,
                why_qualify=qualify_reasons,
                why_not_qualify=not_qualify_reasons
            ))

        # Sort descending by match percentage
        results.sort(key=lambda x: x.match_percentage, reverse=True)
        return results
