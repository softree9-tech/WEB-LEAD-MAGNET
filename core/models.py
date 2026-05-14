from pydantic import BaseModel, Field

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
    
    first_impression_score: int = Field(description="First Impression Score (0-10) based on branding, layout, CTA clarity, professionalism, trust indicators, readability, and mobile feel.")
    first_impression_verdict: str = Field(description="Verdict (Excellent, Good, Average, Poor) based on the first impression score.")
    first_impression_explanation: str = Field(description="A short, concise, and emotionally impactful AI explanation of the first impression.")
