# AGENTS.md — Softree Lead Engine

## Project Purpose
AI-powered website analysis tool for digital marketing agencies. Analyzes
prospects' websites and generates personalized sales pitches.

## Architecture
- Backend: FastAPI (main.py) → LangGraph (graph.py) → Agent (agents/website_analyzer.py)
- Frontend: React + Vite (frontend/src/)
- Core models: core/models.py (Pydantic), core/state.py (TypedDict)

## Key Files
- agents/website_analyzer.py — Main analysis logic. Contains website_analyzer_agent()
  function that orchestrates Playwright, PageSpeed, AEO probe, and GPT-4o.
- core/models.py — WebsiteAnalyzerOutput Pydantic model (LLM structured output)
- core/state.py — AgentState TypedDict (LangGraph state)
- main.py — FastAPI endpoints: /api/process/single, /api/process/batch, /api/process/csv
- frontend/src/components/LeadResults.jsx — Main results display (506 lines)

## Coding Standards
- Python: match existing style in website_analyzer.py
- React: functional components, inline styles (no separate CSS unless large)
- No TypeScript — vanilla JavaScript/JSX only
- No new npm packages without explicit instruction

## Analysis Output Fields (output_row dict)
website, final_score, design, cta, message, trust, speed,
seo_meta_desc, seo_h1, seo_title, seo_canonical, seo_og, seo_mobile,
seo_ssl, ssl_days_remaining, ssl_enforced, load_time,
lighthouse_seo, lighthouse_performance, lighthouse_accessibility, mobile_performance,
lighthouse_issues, lighthouse_api_success, tech_stack, last_modified,
broken_links, total_links, has_analytics, has_lead_capture, has_newsletter,
image_percent_missing_alt, has_dead_socials, rebranding_pitch,
seo_score, seo_status, seo_improvement, aeo_score, aeo_status, aeo_improvement,
aeo_probe_response, screenshot_desktop, screenshot_mobile,
visual_annotations, before_after_concept, cro_score

## Environment Variables Required
OPENAI_API_KEY, GOOGLE_API_KEY, FRONTEND_URL, GROQ_API_KEY (new)

## Known Issues (Do Not Reintroduce)
- output_row must have NO duplicate keys
- seo_title, seo_canonical, seo_og must be initialized to False before Playwright block
- Playwright browser must be closed in finally block
- Do NOT use locals() for variable lookup
