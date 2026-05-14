from pydantic import BaseModel, Field
from typing import List, Optional

class FirstImpression(BaseModel):
    score: int = Field(description="0-10. 10=instantly trustworthy. 0=looks like a scam. Be brutal.")
    verdict: str = Field(description="Exact thought a skeptical visitor has in first 3 seconds. Specific, not generic.")
    trust_killers: List[str] = Field(description="2-4 specific visible elements that destroy trust instantly")
    trust_builders: List[str] = Field(description="1-2 trust-building elements visible, or empty list")
    would_contact: bool = Field(description="Would a typical skeptical visitor contact this business based on first impression?")

class VisualAnnotation(BaseModel):
    section: str = Field(description="Page section name: hero, navigation, cta, testimonials, footer, form, pricing, features")
    issue: str = Field(description="One-sentence description of the specific problem visible in this section")
    severity: str = Field(description="critical, high, medium, low")
    revenue_impact: str = Field(description="Estimated monthly revenue being lost due to this issue. E.g. '$1,200-$2,400/mo in lost conversions'")
    fix: str = Field(description="Specific 1-sentence actionable fix for this issue")
    position_hint: str = Field(description="Where on the page: top-left, top-center, top-right, middle-left, middle-center, middle-right, bottom-left, bottom-center, bottom-right")

class WebsiteAnalyzerOutput(BaseModel):
    design: str = Field(description="Design quality (Modern, Outdated, Clean, Cluttered)")
    cta: str = Field(description="CTA presence and focus (Strong, Weak, Missing)")
    message: str = Field(description="Messaging Clarity (Clear, Confusing, Jargon-heavy)")
    trust: str = Field(description="Trust Signals presence (Strong, Weak, Missing - based on reviews, logos, etc)")
    speed: str = Field(description="Speed category (Fast, Ok, Slow)")
    score: int = Field(description="Internal AI Lead Score (0-10, higher is hotter)")
    
    rebranding_pitch: str = Field(description="1-sentence pitch exposing a critical visual or UX flaw (design/trust/cta) and framing it as lost conversion/revenue.")
    
    seo_score: int = Field(description="Google Search Visibility Score (0-100) calculated strictly from their technical SEO health (Load Speed, Mobile, H1, Meta tags).")
    seo_status: str = Field(description="1-2 aggressive sentences exposing how their specific technical flaws (like slow speed) penalize their Google rankings and bleed traffic.")
    seo_improvement: str = Field(description="A concise, actionable step to fix their Google SEO presence.")
    
    aeo_score: int = Field(description="AI Search Visibility Score (0-100). Do you (GPT-4) recognize this brand/URL? If not, score them very low (10-30). If you do, score higher.")
    aeo_status: str = Field(description="1-2 aggressive sentences telling the owner whether ChatGPT/Claude actually recommends their brand, or if they are totally invisible to AI.")
    aeo_improvement: str = Field(description="A concise, actionable PR or semantic SEO strategy to get cited in LLM answers.")

    visual_annotations: List[VisualAnnotation] = Field(
        description="List of 4-6 specific visual issues identified from the screenshot, each with section, severity, revenue_impact, and fix"
    )
    before_after_concept: str = Field(
        description="2-3 sentences describing what this website would look like after a professional redesign. Be specific: mention colors, layout changes, new sections, CTA placement."
    )
    cro_score: int = Field(
        description="Conversion Rate Optimization score 0-100. Based on CTA clarity, trust signals, form placement, social proof, urgency elements."
    )
    first_impression: Optional[FirstImpression] = Field(default=None,
        description="Brutally honest first impression from a skeptical new visitor")
