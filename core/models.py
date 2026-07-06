from pydantic import BaseModel, Field
from typing import List

class StrategicAction(BaseModel):
    priority: str = Field(description="Priority level (High, Medium, Low)")
    action: str = Field(description="Recommended action step (e.g., 'Add FAQ Schema')")
    impact: str = Field(description="Expected impact (High, Medium, Low)")
    difficulty: str = Field(description="Implementation difficulty (Easy, Moderate, Hard)")
    is_quick_win: bool = Field(description="True if this is a quick win (low difficulty, high impact)")

class MobileSection(BaseModel):
    name: str = Field(description="Descriptive name of the mobile section (e.g. 'Hero Section', 'About Section', 'Services', 'CTA Area', 'Testimonials', 'Contact', 'Footer')")
    insight: str = Field(description="UX critique or risk analysis specific to this section on mobile. Be concise.")
    risk: str = Field(description="Risk level on mobile: Low, Moderate, High, Critical")

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
    
    executive_summary: str = Field(description="Concise executive AI summary based on SEO, UX, trust signals, AI visibility, conversion readiness, competitor intelligence, mobile experience, and schema analysis.")
    business_risk_insight: str = Field(description="Insight on the biggest business risk.")
    strategic_opportunity_insight: str = Field(description="Insight on the top opportunity area.")
    executive_ai_recommendation: str = Field(description="Strategic AI recommendation.")
    brand_credibility_insight: str = Field(description="Brand credibility insight.")
    
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
    
    mobile_ux_rating: str = Field(description="Mobile UX rating (Excellent, Good, Average, Poor, Critical)")
    mobile_conversion_risk: str = Field(description="Mobile conversion risk level (Low, Moderate, High, Critical)")
    mobile_ai_insight: str = Field(description="Short, actionable AI insight about the mobile experience and conversion potential.")
    mobile_sections: List[MobileSection] = Field(description="Sequence of mobile sections for the walkthrough carousel.")
    
    momentum_score: int = Field(description="Competitor Momentum Score (0-100) based on optimization speed and technology adoption.")
    competitive_growth_status: str = Field(description="Growth status relative to competitors (e.g., 'Leading', 'Steady', 'Falling Behind')")
    strategic_risk_level: str = Field(description="Strategic risk level (High, Moderate, Low) based on competitive gaps.")
    momentum_comparison: str = Field(description="1-2 sentences comparing website momentum to industry competitors.")
    momentum_growth_direction: str = Field(description="Growth direction (Up, Down, Neutral).")
    momentum_ai_insight: str = Field(description="Aggressive AI strategic insight on competitive momentum and technology adoption.")

    ai_strategic_plan: List[StrategicAction] = Field(description="A prioritized roadmap of 3-5 improvement steps based on all analysis data.")
    
    annual_opportunity_loss: int = Field(description="Projected annual business opportunity loss if issues remain unresolved.")
    urgency_severity: str = Field(description="Urgency level for taking action (e.g., 'Immediate', '30-60 Days', '90+ Days').")
    revenue_impact_insight: str = Field(description="Executive AI insight on long-term business impact and strategic risks.")

    cta_optimization_recommendation: str = Field(description="Concise AI recommendation for CTA optimization.")
    conversion_improvement_suggestion: str = Field(description="Concise AI suggestion for overall conversion improvement.")
    funnel_optimization_insight: str = Field(description="Concise AI insight on funnel optimization.")
    mobile_conversion_recommendation: str = Field(description="Concise AI recommendation for mobile-specific conversion.")
    lead_gen_improvement_opportunity: str = Field(description="Concise AI insight on lead generation improvement opportunities.")
    conversion_intelligence_insight: str = Field(description="Strategic conversion intelligence insight combining analysis data.")

    messaging_clarity_level: str = Field(description="Messaging clarity level (e.g., 'High', 'Moderate', 'Low').")
    communication_effectiveness_insight: str = Field(description="Concise AI insight on brand communication effectiveness.")
    value_proposition_analysis: str = Field(description="AI analysis of the value proposition strength and clarity.")
    messaging_strategic_recommendation: str = Field(description="Strategic AI recommendation for messaging and content clarity.")
    
    headline_clarity_score: int = Field(description="Headline clarity score (0-10).")
    value_prop_strength_score: int = Field(description="Value proposition strength score (0-10).")
    cta_communication_quality_score: int = Field(description="CTA communication quality score (0-10).")
    messaging_confidence_score: int = Field(description="Messaging confidence score (0-10).")
    audience_targeting_clarity_score: int = Field(description="Audience targeting clarity score (0-10).")
    brand_communication_effectiveness_score: int = Field(description="Brand communication effectiveness score (0-10).")

    cta_strength_level: str = Field(description="CTA wording strength level (High, Moderate, Low).")
    cta_urgency_score: int = Field(description="CTA urgency level score (0-10).")
    cta_visibility_rating: str = Field(description="CTA visibility rating (High, Moderate, Low).")
    cta_placement_quality: str = Field(description="CTA placement quality (Strategic, Suboptimal, Poor).")
    cta_action_clarity_score: int = Field(description="CTA action clarity score (0-10).")
    cta_persuasiveness_score: int = Field(description="CTA conversion persuasiveness score (0-10).")
    cta_effectiveness_insight: str = Field(description="Concise AI conversion effectiveness insight.")
    cta_ai_optimization_recommendation: str = Field(description="Concise AI optimization recommendation for CTA.")

    # Market Position Intelligence
    lead_quality_score: int = Field(description="AI-powered lead quality score (0-100) based on business potential and website quality.")
    business_maturity_level: str = Field(description="Business maturity level (e.g., 'Early Stage', 'Growth Phase', 'Established', 'Market Leader').")
    sales_potential: str = Field(description="Sales potential assessment (High, Moderate, Low).")
    digital_readiness: str = Field(description="Digital readiness level (High, Moderate, Low).")
    growth_potential: str = Field(description="Growth potential level (High, Moderate, Low).")
    market_position_intelligence_insight: str = Field(description="Concise AI strategic insight about the business's market position and potential.")

    buyer_intent_strength: str = Field(description="Buyer intent strength level (e.g., 'Low', 'Moderate', 'High', 'Advanced').")
    transactional_service_intent_score: int = Field(description="Transactional/service intent score (0-100).")
    enterprise_sales_orientation_score: int = Field(description="Enterprise sales orientation score (0-100).")
    lead_generation_focus_score: int = Field(description="Lead-generation focus score (0-100).")
    conversion_oriented_positioning_score: int = Field(description="Conversion-oriented positioning score (0-100).")
    commercial_readiness_maturity: str = Field(description="Commercial readiness maturity (e.g., 'Low', 'Moderate', 'High', 'Advanced').")
    primary_website_type: str = Field(description="Primary website type (informational, branding-focused, service-oriented, conversion-focused, enterprise-sales focused).")
    commercial_insights: str = Field(description="Concise AI commercial insights.")
    sales_positioning_maturity_score: int = Field(description="Sales positioning maturity score (0-100).")
    commercial_readiness_level_score: int = Field(description="Commercial readiness level score (0-100).")
    conversion_targeting_insight: str = Field(description="Concise AI insight on conversion targeting.")
    market_position_ai_strategic_recommendation: str = Field(description="Strategic AI recommendation for market positioning.")


    # Trust Decay & Credibility Intelligence
    trust_decay_level: str = Field(description="Trust decay level (Critical, High, Moderate, Low) based on outdated signals.")
    maintenance_confidence: int = Field(description="Maintenance confidence score (0-100) based on content freshness and technical health.")
    outdated_signal_indicators: str = Field(description="Comma-separated list of detected outdated signals (e.g., 'Outdated Copyright', 'Stale Blog', 'Broken Socials').")
    credibility_impact_insight: str = Field(description="Concise AI insight on how trust decay impacts long-term brand credibility.")
    ai_trust_recommendation: str = Field(description="Strategic AI recommendation to restore brand trust and authority.")


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


class CompanyOverviewComparison(BaseModel):
    primary_name: str = Field(default="")
    competitor_name: str = Field(default="")
    primary_website: str = Field(default="")
    competitor_website: str = Field(default="")
    primary_size: str = Field(default="Unknown")
    competitor_size: str = Field(default="Unknown")
    primary_hq: str = Field(default="Unknown")
    competitor_hq: str = Field(default="Unknown")
    primary_years: str = Field(default="Unknown")
    competitor_years: str = Field(default="Unknown")
    primary_target_markets: List[str] = Field(default_factory=list)
    competitor_target_markets: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list, description="AI identification of missing company information.")

class ServicePortfolioComparison(BaseModel):
    primary_services: List[str] = Field(default_factory=list, description="Services offered, e.g., SharePoint, Power Platform, Copilot, etc.")
    competitor_services: List[str] = Field(default_factory=list)
    missing_services: List[str] = Field(default_factory=list)
    competitive_advantages: List[str] = Field(default_factory=list, description="Where primary or competitor has a distinct service advantage.")
    recommended_services: List[str] = Field(default_factory=list, description="Recommendations for new service launches.")
    executive_insight: str = Field(default="", description="Executive observation on service coverage and enterprise positioning.")

class IndustryFocusComparison(BaseModel):
    shared_industries: List[str] = Field(default_factory=list, description="Industries both target.")
    competitor_exclusive_industries: List[str] = Field(default_factory=list, description="Industries competitor targets but you don't.")
    suggested_expansion_industries: List[str] = Field(default_factory=list, description="Suggested industries for expansion.")
    executive_insight: str = Field(default="", description="Executive observation on industry penetration.")

class WebsiteComparison(BaseModel):
    primary_ui_ux: str = Field(default="Unknown")
    competitor_ui_ux: str = Field(default="Unknown")
    primary_speed: str = Field(default="Unknown")
    competitor_speed: str = Field(default="Unknown")
    primary_mobile: str = Field(default="Unknown")
    competitor_mobile: str = Field(default="Unknown")
    primary_accessibility: str = Field(default="Unknown")
    competitor_accessibility: str = Field(default="Unknown")
    primary_cta: str = Field(default="Unknown")
    competitor_cta: str = Field(default="Unknown")
    business_impact_insight: str = Field(default="", description="Business insight explaining the impact of website performance and UX on conversions.")

class TrustCredibilityComparison(BaseModel):
    primary_certifications: List[str] = Field(default_factory=list, description="e.g., ISO, Microsoft Partner")
    competitor_certifications: List[str] = Field(default_factory=list)
    primary_awards: List[str] = Field(default_factory=list)
    competitor_awards: List[str] = Field(default_factory=list)
    primary_reviews: str = Field(default="Unknown")
    competitor_reviews: str = Field(default="Unknown")
    primary_team_size: str = Field(default="Unknown")
    competitor_team_size: str = Field(default="Unknown")
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    business_impact: str = Field(default="", description="How trust signals are affecting buyer confidence.")
    recommendation: str = Field(default="", description="Recommendation for improving trust.")

class CaseStudyComparison(BaseModel):
    primary_case_studies: int = Field(default=0)
    competitor_case_studies: int = Field(default=0)
    primary_outcomes_roi: str = Field(default="Unknown", description="Level of business outcomes, ROI, and Before/After results presented.")
    competitor_outcomes_roi: str = Field(default="Unknown")
    executive_observation: str = Field(default="", description="Executive observation comparing case study depth. Example: 'Competitor has multiple Manufacturing case studies...'")
    recommendation: str = Field(default="")

class SeoAiVisibilityComparison(BaseModel):
    primary_chatgpt: str = Field(default="Unknown")
    competitor_chatgpt: str = Field(default="Unknown")
    primary_gemini: str = Field(default="Unknown")
    competitor_gemini: str = Field(default="Unknown")
    primary_claude: str = Field(default="Unknown")
    competitor_claude: str = Field(default="Unknown")
    primary_perplexity: str = Field(default="Unknown")
    competitor_perplexity: str = Field(default="Unknown")
    primary_llm_readiness: str = Field(default="Unknown")
    competitor_llm_readiness: str = Field(default="Unknown")
    primary_schema_structured_data: str = Field(default="Unknown")
    competitor_schema_structured_data: str = Field(default="Unknown")
    winner: str = Field(default="Unknown", description="Who performs better overall in SEO/AI.")
    why: str = Field(default="", description="Why the winner performs better.")
    business_impact: str = Field(default="")
    improvement_actions: List[str] = Field(default_factory=list)

class LeadGenerationComparison(BaseModel):
    primary_lead_magnets: List[str] = Field(default_factory=list, description="e.g., Free Tools, Assessments, Calculators")
    competitor_lead_magnets: List[str] = Field(default_factory=list)
    primary_demo_booking: bool = Field(default=False)
    competitor_demo_booking: bool = Field(default=False)
    primary_live_chat: bool = Field(default=False)
    competitor_live_chat: bool = Field(default=False)
    lead_capture_strength_comparison: str = Field(default="", description="Comparison of lead capture strength and buyer journey.")
    recommendations: List[str] = Field(default_factory=list)

class ContentStrategyComparison(BaseModel):
    primary_content_types: List[str] = Field(default_factory=list, description="Blogs, Whitepapers, Webinars, etc.")
    competitor_content_types: List[str] = Field(default_factory=list)
    content_depth_comparison: str = Field(default="", description="Comparison of content depth, freshness, authority, and business value.")
    recommendations: List[str] = Field(default_factory=list)

class CompetitorScore(BaseModel):
    website: int = Field(default=0, description="Website & UX - 15%")
    services: int = Field(default=0, description="Service Portfolio - 18%")
    trust: int = Field(default=0, description="Trust & Credibility - 13%")
    seo: int = Field(default=0, description="SEO & GEO - 10%")
    lead_gen: int = Field(default=0, description="Lead Generation - 12%")
    content: int = Field(default=0, description="Content Strategy - 8%")
    ai_visibility: int = Field(default=0, description="AI Visibility (Part of SEO module)")
    industry_focus_score: int = Field(default=0, description="Industry Focus - 7%")
    case_studies_score: int = Field(default=0, description="Case Studies - 8%")
    company_overview_score: int = Field(default=0, description="Company Overview - 7%")
    ai_recommendations_quality_score: int = Field(default=0, description="AI Recommendations Quality - 2%")
    overall_score: int = Field(default=0, description="Weighted average overall score.")

class AiRecommendations(BaseModel):
    primary_scores: CompetitorScore
    competitor_scores: CompetitorScore
    business_readiness: str = Field(default="", description="Business Readiness assessment.")
    competitive_position: str = Field(default="", description="Competitive Position assessment.")
    winner: str = Field(default="Unknown", description="Overall Winner.")
    gap_score: int = Field(default=0, description="Gap Score difference.")
    executive_insight_paragraph: str = Field(default="", description="A compelling executive insight paragraph (2-3 sentences) on the strategic landscape, similar to 'AI search platforms are rapidly replacing traditional search...'")
    top_strategic_recommendation: str = Field(default="", description="The single most important strategic recommendation.")
    top_business_impact: str = Field(default="", description="The business impact of the top recommendation (e.g., 'High Lead Volume').")
    top_expected_roi: str = Field(default="", description="The expected ROI of the top recommendation (e.g., '300%+ over 12 mo', '2x Pipeline Growth').")
    top_implementation_effort: str = Field(default="", description="The implementation effort of the top recommendation (e.g., 'Moderate Effort', 'High Effort').")
    executive_recommendations: List[str] = Field(default_factory=list, description="List of recommendations. Each recommendation string MUST include Priority, Expected Business Impact, Implementation Difficulty, and Estimated ROI inline (e.g., 'Action [Priority: High, Impact: High...]').")
    overall_advantage: str = Field(default="", description="Executive observations instead of describing metrics. High level business narrative. Example: 'Your competitor demonstrates stronger enterprise positioning...'")
    business_impact: str = Field(default="", description="Overall business impact level.")
    priority: str = Field(default="", description="Overall priority.")

class CompetitorGapReportResult(BaseModel):
    company_overview: CompanyOverviewComparison
    service_portfolio: ServicePortfolioComparison
    industry_focus: IndustryFocusComparison
    website_comparison: WebsiteComparison
    trust_credibility: TrustCredibilityComparison
    case_study_analysis: CaseStudyComparison
    seo_ai_visibility: SeoAiVisibilityComparison
    lead_generation: LeadGenerationComparison
    content_strategy: ContentStrategyComparison
    ai_recommendations: AiRecommendations
