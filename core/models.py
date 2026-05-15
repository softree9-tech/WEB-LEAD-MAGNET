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
    
    missing_leads_insight: str = Field(description="AI insight about missing lead capture opportunities. Example: 'Visitors have limited conversion paths, reducing lead generation potential.'")
    conversion_readiness_level: str = Field(description="Conversion readiness level (High, Medium, Low) based on existing conversion elements.")
    industry_insight: str = Field(description="1-sentence AI insight comparing their website to top industry performers. Example: 'Website is visually competitive but underperforms in conversion infrastructure compared to top industry performers.'")
    
    schema_coverage_score: int = Field(description="Schema markup coverage score (0-100) based on target schemas present (FAQ, LocalBusiness, Review, Organization, Product, Breadcrumb, Article).")
    schema_gap_insight: str = Field(description="1-2 sentences explaining the gap between current schema and ideal AI/Search visibility. Example: 'Missing FAQ and Review schema limits your presence in Google Rich Results and AI search citations.'")
    schema_visibility_impact: str = Field(description="Impact level on AI/Search visibility (High, Medium, Low).")
    schema_recommendation: str = Field(description="Concise, 3-5 word primary schema recommendation for implementation. Example: 'Add FAQ Schema'")
    
    keyword_visibility_gap_opportunities: str = Field(description="Comma-separated list of 3-5 high-value missing keyword opportunities.")
    keyword_visibility_gap_level: str = Field(description="Opportunity level (High, Medium, Low).")
    keyword_visibility_gap_competitor_advantage: str = Field(description="1-sentence summary of competitor keyword advantages.")
    keyword_visibility_gap_search_impact: str = Field(description="AI visibility and search impact level (High, Medium, Low).")
    keyword_visibility_gap_insight: str = Field(description="Short, aggressive AI insight on search intent coverage and visibility gaps.")

class BattleCardResult(BaseModel):
    seo_winner: str = Field(description="'Primary', 'Competitor', or 'Tie'")
    ux_winner: str = Field(description="'Primary', 'Competitor', or 'Tie'")
    trust_winner: str = Field(description="'Primary', 'Competitor', or 'Tie'")
    ai_visibility_winner: str = Field(description="'Primary', 'Competitor', or 'Tie'")
    performance_winner: str = Field(description="'Primary', 'Competitor', or 'Tie'")
    lead_capture_winner: str = Field(description="'Primary', 'Competitor', or 'Tie'")
    conversion_winner: str = Field(description="'Primary', 'Competitor', or 'Tie'")
    overall_advantage: str = Field(description="A concise summary of who has the advantage and why. Example: 'Primary holds 15% better SEO but Competitor wins on conversion.'")
    overall_winner: str = Field(description="'Primary', 'Competitor', or 'Tie'")
    ai_verdict: str = Field(description="Executive AI verdict. Example: 'Competitor has stronger conversion architecture and clearer CTA positioning, likely resulting in better lead generation performance.'")
