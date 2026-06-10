import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
import openpyxl

BRAND_DARK = colors.HexColor('#1E293B')

def sanitize_text(text):
    if text is None:
        return ''
    return str(text).replace('\r', ' ').replace('\n', ' ').strip()

def generate_pdf_report(report_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=letter,
        rightMargin=30, leftMargin=30,
        topMargin=30, bottomMargin=30
    )
    
    styles = getSampleStyleSheet()
    
    normal_text = ParagraphStyle(
        'NormalText', parent=styles['Normal'],
        fontName='Helvetica', fontSize=9, leading=12,
        textColor=colors.black
    )
    
    header_text = ParagraphStyle(
        'HeaderText', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=10, leading=12,
        textColor=colors.white
    )

    af = report_data.get('_apollo_fields', {})
    
    # Calculate UX Score (same logic as LeadResults.jsx)
    consistencyVal = 90 if report_data.get('design') == 'Modern' else 60
    flowVal = 80 if report_data.get('message') == 'Clear' else 50
    mobileVal = 80 if report_data.get('seo_mobile') else 30
    engagementVal = 90 if report_data.get('cta') == 'Strong' else 40
    uxScore = round((consistencyVal + flowVal + mobileVal + engagementVal) / 4)

    # Columns exactly matching the frontend Excel export (public version)
    columns = [
        ('First Name', af.get('First Name', '')),
        ('Last Name', af.get('Last Name', '')),
        ('Website', report_data.get('website', '')),
        ('Final Score', str(uxScore)),
        ('Design', report_data.get('design', 'Unknown')),
        ('CTA', report_data.get('cta', 'Unknown')),
        ('Message', report_data.get('message', 'Unknown')),
        ('Trust', report_data.get('trust', 'Unknown')),
        ('Speed', report_data.get('speed', 'Unknown')),
        ('Schema Score', str(report_data.get('schema_coverage_score', 0))),
        ('Schema Impact', report_data.get('schema_visibility_impact', 'Low')),
        ('First Impression Score', str(report_data.get('first_impression_score', 0))),
        ('First Impression Verdict', report_data.get('first_impression_verdict', 'Unknown')),
        ('Executive Summary', report_data.get('executive_summary', '')),
        ('Business Risk Insight', report_data.get('business_risk_insight', '')),
        ('Strategic Opportunity Insight', report_data.get('strategic_opportunity_insight', '')),
        ('Executive AI Recommendation', report_data.get('executive_ai_recommendation', '')),
        ('Brand Credibility Insight', report_data.get('brand_credibility_insight', '')),
        ('Msg Clarity Level', report_data.get('messaging_clarity_level', 'Moderate')),
        ('Msg Effectiveness Insight', report_data.get('communication_effectiveness_insight', '')),
        ('Val Prop Analysis', report_data.get('value_proposition_analysis', '')),
        ('Msg Strategic Rec', report_data.get('messaging_strategic_recommendation', '')),
        ('Headline Clarity', str(report_data.get('headline_clarity_score', 0))),
        ('Val Prop Strength', str(report_data.get('value_prop_strength_score', 0))),
        ('CTA Quality', str(report_data.get('cta_communication_quality_score', 0))),
        ('Msg Confidence', str(report_data.get('messaging_confidence_score', 0))),
        ('Audience Clarity', str(report_data.get('audience_targeting_clarity_score', 0))),
        ('Brand Effectiveness', str(report_data.get('brand_communication_effectiveness_score', 0))),
        ('CTA Strength', report_data.get('cta_strength_level', 'Moderate')),
        ('CTA Urgency', str(report_data.get('cta_urgency_score', 0))),
        ('CTA Visibility', report_data.get('cta_visibility_rating', 'Moderate')),
        ('CTA Placement', report_data.get('cta_placement_quality', 'Suboptimal')),
        ('CTA Clarity', str(report_data.get('cta_action_clarity_score', 0))),
        ('CTA Persuasiveness', str(report_data.get('cta_persuasiveness_score', 0))),
        ('CTA Eff Insight', report_data.get('cta_effectiveness_insight', '')),
        ('CTA Opt Rec AI', report_data.get('cta_ai_optimization_recommendation', '')),
        ('Mobile Rating', report_data.get('mobile_ux_rating', 'Average')),
        ('Mobile Risk', report_data.get('mobile_conversion_risk', 'Moderate')),
        ('Mobile Insight', report_data.get('mobile_ai_insight', '')),
        ('Momentum Score', str(report_data.get('momentum_score', 0))),
        ('Momentum Status', report_data.get('competitive_growth_status', 'Steady')),
        ('Momentum Risk', report_data.get('strategic_risk_level', 'Moderate')),
        ('Momentum Direction', report_data.get('momentum_growth_direction', 'Neutral')),
        ('Momentum Insight', report_data.get('momentum_ai_insight', '')),
        ('Revenue Leak', f"${report_data.get('revenue_leak_amount', 0)}"),
        ('Leak Severity', report_data.get('revenue_leak_severity', 'Low')),
        ('Annual Loss', f"${report_data.get('annual_opportunity_loss', 0)}"),
        ('Urgency Severity', report_data.get('urgency_severity', '90+ Days')),
        ('Revenue Impact Insight', report_data.get('revenue_impact_insight', '')),
        ('Visitors Lost', str(report_data.get('visitors_lost', 0))),
        ('Leads Lost', str(report_data.get('leads_lost', 0))),
        ('Missing Leads Count', str(report_data.get('missing_opportunities_count', 0))),
        ('Conversion Loss Percent', f"{report_data.get('estimated_conversion_loss_percent', 0)}%"),
        ('Readiness Level', report_data.get('conversion_readiness_level', 'Low')),
        ('CTA Opt Rec', report_data.get('cta_optimization_recommendation', '')),
        ('Conv Imp Sug', report_data.get('conversion_improvement_suggestion', '')),
        ('Funnel Opt Ins', report_data.get('funnel_optimization_insight', '')),
        ('Mobile Conv Rec', report_data.get('mobile_conversion_recommendation', '')),
        ('Lead Gen Opp', report_data.get('lead_gen_improvement_opportunity', '')),
        ('Conv Intel Ins', report_data.get('conversion_intelligence_insight', '')),
        ('Industry Percentile', str(report_data.get('industry_percentile', 0))),
        ('Industry Tier', report_data.get('industry_tier', 'Unknown')),
        ('Industry Competitiveness', report_data.get('industry_competitiveness', 'Unknown')),
        ('Lead Quality', str(report_data.get('lead_quality_score', 0))),
        ('Maturity Level', report_data.get('business_maturity_level', 'Unknown')),
        ('Sales Potential', report_data.get('sales_potential', 'Moderate')),
        ('Digital Readiness', report_data.get('digital_readiness', 'Moderate')),
        ('Growth Potential', report_data.get('growth_potential', 'Moderate')),
        ('Market Insight', report_data.get('market_position_intelligence_insight', '')),
        ('Buyer Intent', report_data.get('buyer_intent_strength', 'Moderate')),
        ('Trans Intent', str(report_data.get('transactional_service_intent_score', 0))),
        ('Ent Orientation', str(report_data.get('enterprise_sales_orientation_score', 0))),
        ('Lead Gen Focus', str(report_data.get('lead_generation_focus_score', 0))),
        ('Conv Positioning', str(report_data.get('conversion_oriented_positioning_score', 0))),
        ('Comm Maturity', report_data.get('commercial_readiness_maturity', 'Moderate')),
        ('Website Type', report_data.get('primary_website_type', 'informational')),
        ('Comm Insights', report_data.get('commercial_insights', '')),
        ('Sales Maturity', str(report_data.get('sales_positioning_maturity_score', 0))),
        ('Comm Readiness Lvl', str(report_data.get('commercial_readiness_level_score', 0))),
        ('Conv Target Insight', report_data.get('conversion_targeting_insight', '')),
        ('Market Strat Rec', report_data.get('market_position_ai_strategic_recommendation', '')),
        ('Keyword Opps', report_data.get('keyword_visibility_gap_opportunities', '')),
        ('Keyword Level', report_data.get('keyword_visibility_gap_level', 'Low')),
        ('Competitor Adv', report_data.get('keyword_visibility_gap_competitor_advantage', '')),
        ('Search Impact', report_data.get('keyword_visibility_gap_search_impact', 'Low')),
        ('Keyword Insight', report_data.get('keyword_visibility_gap_insight', '')),
        ('Trust Decay', report_data.get('trust_decay_level', 'Low')),
        ('Maintenance Confidence', str(report_data.get('maintenance_confidence', 100))),
        ('Outdated Signals', report_data.get('outdated_signal_indicators', '')),
        ('Credibility Insight', report_data.get('credibility_impact_insight', '')),
        ('Trust Recommendation', report_data.get('ai_trust_recommendation', '')),
        ('Rebranding Pitch', report_data.get('rebranding_pitch', '')),
        ('AEO Quote', str(report_data.get('aeo_probe_response', 'No AI recognition data.'))[:500])
    ]

    elements = []
    
    # Render as a Vertical Data Table (Transposed Excel Row)
    table_data = []
    for key, value in columns:
        val_str = sanitize_text(value)
        table_data.append([
            Paragraph(key, header_text),
            Paragraph(val_str, normal_text)
        ])
        
    t = Table(table_data, colWidths=[150, 380])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), BRAND_DARK),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (1, 0), (1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
    ]))
    
    elements.append(t)
    
    doc.build(elements)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

def generate_excel_report(report_data: dict) -> bytes:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "AI Audit Report"
    
    ws['A1'] = "Softree AI Audit Report"
    ws['A2'] = "Website"
    ws['B2'] = report_data.get('website', '')
    
    buffer = io.BytesIO()
    wb.save(buffer)
    excel_bytes = buffer.getvalue()
    buffer.close()
    
    return excel_bytes
