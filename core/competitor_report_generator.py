import io
import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.graphics.shapes import Drawing, Rect, Circle, String
from reportlab.graphics.charts.piecharts import Pie

BRAND_ORANGE = colors.HexColor('#FF6B00')
BRAND_GREEN = colors.HexColor('#10B981')
BRAND_DARK = colors.HexColor('#0A0F3C')
BRAND_GRAY = colors.HexColor('#64748B')
BRAND_LIGHT_BG = colors.HexColor('#F8FAFC')
BORDER_COLOR = colors.HexColor('#E9EDF5')

def create_score_ring(score, label, color):
    d = Drawing(120, 120)
    d.add(Circle(60, 60, 50, fillColor=None, strokeColor=colors.HexColor('#E9EDF5'), strokeWidth=6))
    
    pc = Pie()
    pc.x = 10
    pc.y = 10
    pc.width = 100
    pc.height = 100
    pc.data = [score, 100 - score] if score < 100 else [100, 0]
    pc.labels = ['', '']
    pc.slices[0].fillColor = color
    pc.slices[0].strokeColor = None
    pc.slices[1].fillColor = colors.transparent
    pc.slices[1].strokeColor = None
    pc.startAngle = 90
    pc.direction = 'clockwise'
    
    d.add(pc)
    d.add(Circle(60, 60, 44, fillColor=colors.white, strokeColor=None))
    
    d.add(String(60, 64, str(score), fontSize=24, fontName="Helvetica-Bold", textAnchor="middle", fillColor=BRAND_DARK))
    d.add(String(60, 46, label, fontSize=8, fontName="Helvetica-Bold", textAnchor="middle", fillColor=BRAND_GRAY))
    return d

def create_double_progress_bar(score1, score2, color1, color2):
    d = Drawing(200, 24)
    # BG Competitor
    d.add(Rect(0, 0, 200, 8, fillColor=colors.HexColor('#E9EDF5'), strokeColor=None, rx=4, ry=4))
    # Score Competitor
    fill2 = max(8, (score2 / 100.0) * 200) if score2 > 0 else 0
    if fill2 > 0:
        d.add(Rect(0, 0, fill2, 8, fillColor=color2, strokeColor=None, rx=4, ry=4))
        
    # BG Primary
    d.add(Rect(0, 14, 200, 8, fillColor=colors.HexColor('#E9EDF5'), strokeColor=None, rx=4, ry=4))
    # Score Primary
    fill1 = max(8, (score1 / 100.0) * 200) if score1 > 0 else 0
    if fill1 > 0:
        d.add(Rect(0, 14, fill1, 8, fillColor=color1, strokeColor=None, rx=4, ry=4))
        
    return d

def create_table_style(has_header=True):
    style = [
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 0), (-1, -1), BRAND_DARK),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('INNERGRID', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
    ]
    if has_header:
        style.extend([
            ('BACKGROUND', (0, 0), (-1, 0), BRAND_LIGHT_BG),
            ('TEXTCOLOR', (0, 0), (-1, 0), BRAND_DARK),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
        ])
    return TableStyle(style)

def generate_competitor_pdf_report(report_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=40, leftMargin=40,
        topMargin=40, bottomMargin=50
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=24, leading=28, textColor=BRAND_DARK, spaceAfter=8)
    h2_style = ParagraphStyle('H2Style', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=16, leading=20, textColor=BRAND_DARK, spaceAfter=12, spaceBefore=24)
    section_label_style = ParagraphStyle('SectionLabel', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, textColor=BRAND_ORANGE, textTransform='uppercase', spaceAfter=4)
    normal_text = ParagraphStyle('NormalText', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=14, textColor=BRAND_GRAY)
    bold_text = ParagraphStyle('BoldText', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, leading=14, textColor=BRAND_DARK)
    
    elements = []
    
    date_str = datetime.datetime.now().strftime("%B %d, %Y")
    
    comp_overview = report_data.get('company_overview', {})
    primary_name = comp_overview.get('primary_name', report_data.get('primary_domain', 'Your Company').split("/")[0]).upper()
    competitor_name = comp_overview.get('competitor_name', report_data.get('competitor_domain', 'Competitor').split("/")[0]).upper()
    
    ai_recs = report_data.get('ai_recommendations', {})
    primary_score = ai_recs.get('primary_scores', {}).get('overall_score', 0)
    competitor_score = ai_recs.get('competitor_scores', {}).get('overall_score', 0)
    
    # --- Header ---
    header_data = [
        [Paragraph("<b>Softree Technology</b>", ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=16, textColor=BRAND_ORANGE)),
         Paragraph(f"<font color='#64748B'>{date_str}</font>", ParagraphStyle('H2', alignment=2, fontName='Helvetica', fontSize=10))]
    ]
    header_table = Table(header_data, colWidths=[250, 265])
    header_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
    elements.append(header_table)
    elements.append(Spacer(1, 20))
    
    # --- 1. HERO ---
    elements.append(Paragraph("EXECUTIVE BOARD REPORT", section_label_style))
    elements.append(Paragraph(f"AI Competitor Gap Report", title_style))
    elements.append(Paragraph(f"<b>{primary_name}</b> <font color='#64748B'>VS</font> <b>{competitor_name}</b>", ParagraphStyle('Sub', fontName='Helvetica-Bold', fontSize=14, textColor=BRAND_DARK)))
    elements.append(Spacer(1, 20))
    
    ring1 = create_score_ring(primary_score, "YOUR SCORE", BRAND_ORANGE)
    ring2 = create_score_ring(competitor_score, "COMPETITOR", BRAND_GREEN)
    
    winner = primary_name if primary_score >= competitor_score else competitor_name
    winner_color = BRAND_ORANGE if primary_score >= competitor_score else BRAND_GREEN
    
    vs_text = [
        Paragraph("<b>HEAD-TO-HEAD</b>", ParagraphStyle('c1', alignment=1, fontSize=10, textColor=BRAND_GRAY)),
        Spacer(1, 10),
        Paragraph("🏆 OVERALL WINNER", ParagraphStyle('c2', alignment=1, fontSize=12, textColor=BRAND_DARK, fontName='Helvetica-Bold')),
        Paragraph(f"<font color='{winner_color.hexval()}'><b>{winner}</b></font>", ParagraphStyle('c3', alignment=1, fontSize=16, fontName='Helvetica-Bold'))
    ]
    
    hero_data = [[ring1, vs_text, ring2]]
    hero_table = Table(hero_data, colWidths=[150, 215, 150])
    hero_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE'), ('ALIGN', (0,0), (-1,-1), 'CENTER')]))
    elements.append(hero_table)
    elements.append(Spacer(1, 25))
    
    # --- 2. EXECUTIVE AI VERDICT ---
    elements.append(Paragraph("AI VERDICT", section_label_style))
    verdict = ai_recs.get('overall_advantage', 'Analysis completed. Refer to metrics below for competitive insights.')
    
    verdict_table = Table([[Paragraph(f"<i>\"{verdict}\"</i>", ParagraphStyle('V', fontName='Helvetica-Oblique', fontSize=12, leading=16, textColor=BRAND_DARK))]], colWidths=[515])
    verdict_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BRAND_LIGHT_BG),
        ('PADDING', (0,0), (-1,-1), 15),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR)
    ]))
    elements.append(verdict_table)
    elements.append(Spacer(1, 20))
    
    # --- 3. CATEGORY PERFORMANCE ---
    elements.append(Paragraph("Category Performance Overview", h2_style))
    
    cats = [
        ("Service Portfolio", "services"),
        ("Website Experience", "website"),
        ("SEO & AI Visibility", "seo"),
        ("Content Strategy", "content"),
        ("Trust & Credibility", "trust"),
        ("Lead Generation", "lead_gen")
    ]
    
    p_cats = ai_recs.get('primary_scores', {})
    c_cats = ai_recs.get('competitor_scores', {})
    
    cat_data = []
    for label, key in cats:
        ps = p_cats.get(key, 0)
        cs = c_cats.get(key, 0)
        bar = create_double_progress_bar(ps, cs, BRAND_ORANGE, BRAND_GREEN)
        
        lbl_p = Paragraph(f"<b>{label}</b>", bold_text)
        score_p = Paragraph(f"<font color='{BRAND_ORANGE.hexval()}'><b>{ps}</b></font> <font color='#64748B'>vs</font> <font color='{BRAND_GREEN.hexval()}'><b>{cs}</b></font>", ParagraphStyle('r', alignment=2, fontSize=10))
        
        cat_data.append([lbl_p, score_p, bar])
        cat_data.append([Spacer(1, 10), '', ''])
        
    cat_table = Table(cat_data, colWidths=[150, 100, 265])
    cat_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
    elements.append(KeepTogether([cat_table]))
    
    # --- 4. CRITICAL GAPS & STRENGTHS ---
    elements.append(PageBreak())
    elements.append(Paragraph("BUSINESS SUMMARY", section_label_style))
    elements.append(Paragraph("Strengths & Gaps", h2_style))
    
    summary = report_data.get('executive_summary', {})
    gaps = []
    missing_services = report_data.get('service_portfolio', {}).get('missing_services', [])
    if missing_services:
        gaps.append(f"Missing Service Coverages: {', '.join(missing_services)}")
        
    exec_recs = ai_recs.get('executive_recommendations', [])
    
    p_sum = summary.get('primary_summary', 'Strong brand presence.')
    
    sg_data = [
        [Paragraph(f"<font color='{BRAND_GREEN.hexval()}'><b>TOP STRENGTHS</b></font>", bold_text), Paragraph(f"<font color='#DC2626'><b>CRITICAL GAPS & OPPORTUNITIES</b></font>", bold_text)],
        [Paragraph(p_sum, normal_text), Paragraph("<br/>".join([f"• {g}" for g in gaps] + [f"• {r}" for r in exec_recs[:3]]), normal_text)]
    ]
    
    sg_table = Table(sg_data, colWidths=[250, 265])
    sg_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BRAND_LIGHT_BG),
        ('PADDING', (0,0), (-1,-1), 12),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('VALIGN', (0,0), (-1,-1), 'TOP')
    ]))
    elements.append(sg_table)
    elements.append(Spacer(1, 30))
    
    # --- 5. DETAILED ANALYSIS ---
    service_data = report_data.get('service_portfolio', {})
    if service_data:
        elements.append(Spacer(1, 30))
        elements.append(Paragraph("DETAILED ANALYSIS", section_label_style))
        elements.append(Paragraph("Service Portfolio Comparison", h2_style))
        p_services = ", ".join(service_data.get('primary_services') or []) or "None identified"
        c_services = ", ".join(service_data.get('competitor_services') or []) or "None identified"
        data = [
            ["Company", "Identified Services"],
            [primary_name, Paragraph(p_services, normal_text)],
            [competitor_name, Paragraph(c_services, normal_text)]
        ]
        t = Table(data, colWidths=[130, 385])
        t.setStyle(create_table_style())
        elements.append(t)
        
        missing = service_data.get('missing_services', [])
        if missing:
            elements.append(Spacer(1, 10))
            elements.append(Paragraph("<b>Missing Services (Gap Analysis):</b>", bold_text))
            elements.append(Paragraph(", ".join(missing), normal_text))
            
    web = report_data.get('website_comparison', {})
    if web:
        elements.append(Spacer(1, 20))
        elements.append(Paragraph("Website Experience", h2_style))
        data = [
            ["Metric", primary_name, competitor_name],
            ["Load Speed", str(web.get('primary_speed', 'N/A')), str(web.get('competitor_speed', 'N/A'))],
            ["Mobile Friendly", str(web.get('primary_mobile', 'N/A')), str(web.get('competitor_mobile', 'N/A'))],
            ["UX Quality", str(web.get('primary_ux', 'N/A')), str(web.get('competitor_ux', 'N/A'))],
            ["Tech Stack", ", ".join((web.get('primary_tech_stack') or [])[:3]) or "None", ", ".join((web.get('competitor_tech_stack') or [])[:3]) or "None"]
        ]
        t = Table(data, colWidths=[135, 190, 190])
        t.setStyle(create_table_style())
        elements.append(t)

    seo = report_data.get('seo_analysis', {})
    if seo:
        elements.append(Spacer(1, 20))
        elements.append(Paragraph("AI Search & SEO Visibility", h2_style))
        data = [
            ["Platform / Metric", primary_name, competitor_name],
            ["ChatGPT Visibility", str(seo.get('primary_chatgpt', 'N/A')), str(seo.get('competitor_chatgpt', 'N/A'))],
            ["Gemini Visibility", str(seo.get('primary_gemini', 'N/A')), str(seo.get('competitor_gemini', 'N/A'))],
            ["Claude Visibility", str(seo.get('primary_claude', 'N/A')), str(seo.get('competitor_claude', 'N/A'))],
            ["Perplexity", str(seo.get('primary_perplexity', 'N/A')), str(seo.get('competitor_perplexity', 'N/A'))],
            ["LLM Readiness", str(seo.get('primary_llm_readiness', 'N/A')), str(seo.get('competitor_llm_readiness', 'N/A'))]
        ]
        t = Table(data, colWidths=[135, 190, 190])
        t.setStyle(create_table_style())
        elements.append(t)
        
    elements.append(Spacer(1, 20))
    trust = report_data.get('trust_credibility', {})
    cases = report_data.get('case_study_analysis', {})
    if trust or cases:
        elements.append(Paragraph("Trust & Credibility Signals", h2_style))
        data = [
            ["Signal", primary_name, competitor_name],
            ["Certifications", ", ".join(trust.get('primary_certifications') or []) or "None", ", ".join(trust.get('competitor_certifications') or []) or "None"],
            ["Awards", ", ".join(trust.get('primary_awards') or []) or "None", ", ".join(trust.get('competitor_awards') or []) or "None"],
            ["Reviews", str(trust.get('primary_reviews', 'N/A')), str(trust.get('competitor_reviews', 'N/A'))],
            ["Case Studies", str(cases.get('primary_case_studies', 0)), str(cases.get('competitor_case_studies', 0))]
        ]
        t = Table(data, colWidths=[135, 190, 190])
        t.setStyle(create_table_style())
        elements.append(t)
        
    lead = report_data.get('lead_generation', {})
    if lead:
        elements.append(Spacer(1, 20))
        elements.append(Paragraph("Lead Generation Capabilities", h2_style))
        data = [
            ["Feature", primary_name, competitor_name],
            ["Demo Booking", str(lead.get('primary_demo_booking', False)), str(lead.get('competitor_demo_booking', False))],
            ["Live Chat", str(lead.get('primary_live_chat', False)), str(lead.get('competitor_live_chat', False))],
            ["Lead Magnets", Paragraph(", ".join(lead.get('primary_lead_magnets') or []) or "None", normal_text), Paragraph(", ".join(lead.get('competitor_lead_magnets') or []) or "None", normal_text)]
        ]
        t = Table(data, colWidths=[135, 190, 190])
        t.setStyle(create_table_style())
        elements.append(t)
        
    ai_recs_list = ai_recs.get('executive_recommendations', [])
    if ai_recs_list:
        elements.append(Spacer(1, 20))
        elements.append(Paragraph("EXECUTIVE AI RECOMMENDATIONS", section_label_style))
        elements.append(Spacer(1, 10))
        for idx, rec in enumerate(ai_recs_list, 1):
            elements.append(Paragraph(f"<b>{idx}.</b> {rec}", normal_text))
            if idx < len(ai_recs_list):
                elements.append(Spacer(1, 8))
            
    # --- Footer ---
    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(BRAND_GRAY)
        canvas.drawString(40, 20, f"Softree Technology • Executive Gap Analysis: {primary_name} vs {competitor_name}")
        canvas.drawRightString(555, 20, f"Page {doc.page}")
        canvas.restoreState()
        
    doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
