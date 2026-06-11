import io
import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Image
from reportlab.graphics.shapes import Drawing, Rect, Circle, String, Group
from reportlab.graphics.charts.piecharts import Pie

BRAND_ORANGE = colors.HexColor('#FF6B35')
BRAND_DARK = colors.HexColor('#0A0A1A')
BRAND_GRAY = colors.HexColor('#64748B')
BRAND_LIGHT_BG = colors.HexColor('#F8FAFC')
BORDER_COLOR = colors.HexColor('#E2E8F0')

def sanitize_text(text):
    if text is None:
        return ''
    return str(text).replace('\r', ' ').replace('\n', ' ').strip()

def compute_geo_scores(data: dict):
    seo = int(data.get('seo_score', 0))
    aeo = int(data.get('aeo_score', 0))
    
    design = data.get('design', '')
    message = data.get('message', '')
    seo_mobile = data.get('seo_mobile', False)
    cta = data.get('cta', '')
    
    consistencyVal = 90 if design == 'Modern' else 60
    flowVal = 80 if message == 'Clear' else 50
    mobileVal = 80 if seo_mobile else 30
    engagementVal = 90 if cta == 'Strong' else 40
    ux = round((consistencyVal + flowVal + mobileVal + engagementVal) / 4)

    has_analytics = data.get('has_analytics', {})
    trustSignals = [
        has_analytics.get('google_analytics'), has_analytics.get('tag_manager'),
        has_analytics.get('facebook_pixel'), has_analytics.get('linkedin_tag'),
        data.get('has_lead_capture'), data.get('has_cta'), data.get('has_newsletter'),
        data.get('seo_ssl'), data.get('ssl_enforced'), data.get('seo_title'),
        data.get('seo_meta_desc'), data.get('seo_canonical'), data.get('seo_og')
    ]
    trust = round((sum(1 for x in trustSignals if x) / 13) * 100)

    aiVisibility = round(aeo * 0.4 + seo * 0.3 + trust * 0.2 + ux * 0.1)

    chatgpt = min(100, round(aiVisibility * 1.05 + (5 if data.get('seo_og') else -5)))
    gemini = min(100, round(aiVisibility * 0.95 + (4 if data.get('seo_meta_desc') else -6)))
    perplexity = min(100, round(aiVisibility * 0.88 + (6 if data.get('seo_canonical') else -4)))
    claude = min(100, round(aiVisibility * 0.92 + (3 if data.get('seo_title') else -3)))

    schema_types = data.get('schema_types', [])
    schemaSignals = [data.get('seo_og'), data.get('seo_canonical'), data.get('seo_title'), data.get('seo_meta_desc'), len(schema_types) > 0]
    schemaScore = round((sum(1 for x in schemaSignals if x) / 5) * 100)

    citationScore = round((schemaScore * 0.3 + trust * 0.3 + aeo * 0.4))

    entities = []
    services = data.get('services_detected')
    if services:
        if not isinstance(services, list):
            services = [services]
        for s in services:
            entities.append({'type': 'Service', 'value': s})
    if data.get('industry'):
        entities.append({'type': 'Industry', 'value': data.get('industry')})
    if data.get('company_type'):
        entities.append({'type': 'Company Type', 'value': data.get('company_type')})
    if data.get('target_audience'):
        entities.append({'type': 'Target Audience', 'value': data.get('target_audience')})
    for st in schema_types:
        entities.append({'type': 'Schema', 'value': st})

    recs = []
    if not data.get('seo_og'):
        recs.append({'title': 'Add Open Graph markup', 'impact': 'High', 'difficulty': 'Easy', 'desc': 'Enable rich previews when AI engines share your content.'})
    if not data.get('seo_canonical'):
        recs.append({'title': 'Set canonical URL', 'impact': 'Medium', 'difficulty': 'Easy', 'desc': 'Prevent duplicate content confusion for AI crawlers.'})
    if schemaScore < 60:
        recs.append({'title': 'Add Organization schema', 'impact': 'High', 'difficulty': 'Medium', 'desc': 'Help AI engines understand your brand entity structure.'})
    if not data.get('has_newsletter'):
        recs.append({'title': 'Add FAQ structured data', 'impact': 'High', 'difficulty': 'Medium', 'desc': 'Significantly improves AI citation probability by ~40%.'})
    if data.get('cta') != 'Strong':
        recs.append({'title': 'Strengthen semantic relevance', 'impact': 'High', 'difficulty': 'Medium', 'desc': 'Improve content clarity for AI content extraction.'})
    recs.append({'title': 'Improve service entity structure', 'impact': 'Medium', 'difficulty': 'Medium', 'desc': 'Map your services to recognized entity categories.'})
    if aeo < 50:
        recs.append({'title': 'Improve AI citation signals', 'impact': 'High', 'difficulty': 'Hard', 'desc': 'Add authority markers that AI engines use for content ranking.'})
    if len(recs) < 4:
        recs.append({'title': 'Add Product/Service schema', 'impact': 'Medium', 'difficulty': 'Easy', 'desc': 'Enable AI platforms to surface your offerings accurately.'})

    import re
    domain = re.sub(r'^https?://(www\.)?', '', data.get('website', ''))
    domain = re.sub(r'/$', '', domain)

    return {
        'aiVisibility': aiVisibility, 'seo': seo, 'aeo': aeo, 'ux': ux, 'trust': trust,
        'chatgpt': chatgpt, 'gemini': gemini, 'perplexity': perplexity, 'claude': claude,
        'schemaScore': schemaScore, 'citationScore': citationScore,
        'entities': entities[:12],
        'recommendations': recs[:6],
        'domain': domain
    }

def create_score_ring(score, label):
    d = Drawing(120, 120)
    d.add(Circle(60, 60, 50, fillColor=None, strokeColor=colors.HexColor('#E2E8F0'), strokeWidth=6))
    
    # Calculate sweep angle based on score (0 to 360)
    sweep_angle = (score / 100.0) * 360
    
    pc = Pie()
    pc.x = 10
    pc.y = 10
    pc.width = 100
    pc.height = 100
    pc.data = [score, 100 - score]
    pc.labels = ['', '']
    pc.slices[0].fillColor = BRAND_ORANGE
    pc.slices[0].strokeColor = None
    pc.slices[1].fillColor = colors.transparent
    pc.slices[1].strokeColor = None
    pc.startAngle = 90
    pc.direction = 'clockwise'
    
    # We add a white circle inside to make it a donut chart
    d.add(pc)
    d.add(Circle(60, 60, 44, fillColor=colors.white, strokeColor=None))
    
    d.add(String(60, 64, str(score), fontSize=24, fontName="Helvetica-Bold", textAnchor="middle", fillColor=BRAND_DARK))
    d.add(String(60, 46, label, fontSize=8, fontName="Helvetica-Bold", textAnchor="middle", fillColor=BRAND_GRAY))
    return d

def create_progress_bar(score, color_hex):
    d = Drawing(120, 10)
    d.add(Rect(0, 0, 120, 8, fillColor=colors.HexColor('#E2E8F0'), strokeColor=None, rx=4, ry=4))
    fill_width = max(8, (score / 100.0) * 120)
    d.add(Rect(0, 0, fill_width, 8, fillColor=colors.HexColor(color_hex), strokeColor=None, rx=4, ry=4))
    return d

def generate_geo_pdf_report(report_data: dict) -> bytes:
    s = compute_geo_scores(report_data)
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=40, leftMargin=40,
        topMargin=40, bottomMargin=50
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=24, leading=28, textColor=BRAND_DARK, spaceAfter=8)
    subtitle_style = ParagraphStyle('SubtitleStyle', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=16, leading=20, textColor=BRAND_DARK, spaceAfter=12, spaceBefore=20)
    
    section_label_style = ParagraphStyle('SectionLabel', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, textColor=BRAND_ORANGE, textTransform='uppercase', spaceAfter=4)
    
    normal_text = ParagraphStyle('NormalText', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=14, textColor=BRAND_GRAY)
    bold_text = ParagraphStyle('BoldText', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, leading=14, textColor=BRAND_DARK)
    
    elements = []
    
    # --- Header ---
    date_str = datetime.datetime.now().strftime("%B %d, %Y")
    header_data = [
        [Paragraph("<b>Softree Technology</b>", ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=16, textColor=BRAND_ORANGE)),
         Paragraph(f"<font color='#64748B'>{date_str}</font>", ParagraphStyle('H2', alignment=2, fontName='Helvetica', fontSize=10))]
    ]
    header_table = Table(header_data, colWidths=[250, 250])
    header_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
    elements.append(header_table)
    elements.append(Spacer(1, 20))
    
    # --- 1. GEO SCORE HERO ---
    elements.append(Paragraph("GEO Intelligence Report", section_label_style))
    elements.append(Paragraph(f"AI Visibility Dashboard for <b>{s['domain']}</b>", title_style))
    elements.append(Spacer(1, 10))
    
    hero_msg = ""
    if s['aiVisibility'] >= 70:
        hero_msg = "Your website has strong AI visibility. AI engines can effectively discover and cite your business."
    elif s['aiVisibility'] >= 45:
        hero_msg = "Your website has moderate AI visibility. There are significant opportunities to improve AI discoverability."
    else:
        hero_msg = "Your website has low AI visibility. AI engines struggle to understand and cite your business content."
        
    elements.append(Paragraph(hero_msg, normal_text))
    elements.append(Spacer(1, 20))
    
    # Ring & Mini Scores Table
    ring = create_score_ring(s['aiVisibility'], "AI SCORE")
    
    mini_scores_data = [
        [Paragraph("SEO", ParagraphStyle('lbl', fontName='Helvetica-Bold', fontSize=8, textColor=BRAND_GRAY, alignment=1)),
         Paragraph("AEO", ParagraphStyle('lbl', fontName='Helvetica-Bold', fontSize=8, textColor=BRAND_GRAY, alignment=1)),
         Paragraph("Trust", ParagraphStyle('lbl', fontName='Helvetica-Bold', fontSize=8, textColor=BRAND_GRAY, alignment=1)),
         Paragraph("UX", ParagraphStyle('lbl', fontName='Helvetica-Bold', fontSize=8, textColor=BRAND_GRAY, alignment=1))],
        [Paragraph(str(s['seo']), ParagraphStyle('val', fontName='Helvetica-Bold', fontSize=16, textColor=BRAND_DARK, alignment=1)),
         Paragraph(str(s['aeo']), ParagraphStyle('val', fontName='Helvetica-Bold', fontSize=16, textColor=BRAND_DARK, alignment=1)),
         Paragraph(str(s['trust']), ParagraphStyle('val', fontName='Helvetica-Bold', fontSize=16, textColor=BRAND_DARK, alignment=1)),
         Paragraph(str(s['ux']), ParagraphStyle('val', fontName='Helvetica-Bold', fontSize=16, textColor=BRAND_DARK, alignment=1))]
    ]
    
    mini_t = Table(mini_scores_data, colWidths=[60, 60, 60, 60])
    mini_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BRAND_LIGHT_BG),
        ('GRID', (0,0), (-1,-1), 1, colors.white),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    
    hero_table = Table([[ring, mini_t]], colWidths=[150, 300])
    hero_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    elements.append(hero_table)
    elements.append(Spacer(1, 25))
    
    # --- 2. AI PLATFORM VISIBILITY ---
    elements.append(Paragraph("PLATFORM ANALYSIS", section_label_style))
    elements.append(Paragraph("AI Platform Visibility", subtitle_style))
    
    def plat_msg(score):
        if score >= 70: return "Strong visibility — well-positioned for citations"
        elif score >= 45: return "Moderate visibility — optimization recommended"
        else: return "Low visibility — optimization recommended"

    p_data = [
        [
            Paragraph("<b>ChatGPT</b>", bold_text), Paragraph(f"<font color='#10B981'><b>{s['chatgpt']}/100</b></font>", ParagraphStyle('r', alignment=2, fontSize=10)),
            Paragraph("<b>Gemini</b>", bold_text), Paragraph(f"<font color='#3B82F6'><b>{s['gemini']}/100</b></font>", ParagraphStyle('r', alignment=2, fontSize=10))
        ],
        [
            create_progress_bar(s['chatgpt'], '#10B981'), '',
            create_progress_bar(s['gemini'], '#3B82F6'), ''
        ],
        [
            Paragraph(plat_msg(s['chatgpt']), ParagraphStyle('n', fontSize=8, textColor=BRAND_GRAY)), '',
            Paragraph(plat_msg(s['gemini']), ParagraphStyle('n', fontSize=8, textColor=BRAND_GRAY)), ''
        ],
        [Spacer(1,10), '', Spacer(1,10), ''],
        [
            Paragraph("<b>Perplexity</b>", bold_text), Paragraph(f"<font color='#A855F7'><b>{s['perplexity']}/100</b></font>", ParagraphStyle('r', alignment=2, fontSize=10)),
            Paragraph("<b>Claude</b>", bold_text), Paragraph(f"<font color='#F59E0B'><b>{s['claude']}/100</b></font>", ParagraphStyle('r', alignment=2, fontSize=10))
        ],
        [
            create_progress_bar(s['perplexity'], '#A855F7'), '',
            create_progress_bar(s['claude'], '#F59E0B'), ''
        ],
        [
            Paragraph(plat_msg(s['perplexity']), ParagraphStyle('n', fontSize=8, textColor=BRAND_GRAY)), '',
            Paragraph(plat_msg(s['claude']), ParagraphStyle('n', fontSize=8, textColor=BRAND_GRAY)), ''
        ]
    ]
    
    pt = Table(p_data, colWidths=[150, 70, 150, 70])
    pt.setStyle(TableStyle([
        ('SPAN', (0,1), (1,1)), ('SPAN', (2,1), (3,1)),
        ('SPAN', (0,2), (1,2)), ('SPAN', (2,2), (3,2)),
        ('SPAN', (0,5), (1,5)), ('SPAN', (2,5), (3,5)),
        ('SPAN', (0,6), (1,6)), ('SPAN', (2,6), (3,6)),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    elements.append(KeepTogether([pt]))
    elements.append(Spacer(1, 25))
    
    # --- 3. ENTITY RECOGNITION ---
    if s['entities']:
        elements.append(Paragraph("ENTITY ANALYSIS", section_label_style))
        elements.append(Paragraph("Entity Recognition", subtitle_style))
        
        ent_data = []
        row = []
        for i, ent in enumerate(s['entities']):
            t = f"<font color='{BRAND_ORANGE}'><b>{ent['type'].upper()}</b></font> | {ent['value']}"
            row.append(Paragraph(t, ParagraphStyle('ent', fontName='Helvetica', fontSize=9, textColor=BRAND_DARK, borderWidth=1, borderColor=BORDER_COLOR, borderPadding=4, backColor=BRAND_LIGHT_BG, borderRadius=4)))
            if len(row) == 3:
                ent_data.append(row)
                row = []
        if row:
            while len(row) < 3:
                row.append('')
            ent_data.append(row)
            
        ent_table = Table(ent_data, colWidths=[160, 160, 160])
        ent_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(KeepTogether([ent_table]))
        elements.append(Spacer(1, 25))
        
    # --- 4. GEO RECOMMENDATIONS ---
    elements.append(Paragraph("ACTION PLAN", section_label_style))
    elements.append(Paragraph("GEO Recommendations", subtitle_style))
    
    impactColors = {'High': '#FF6B00', 'Medium': '#FF8A1E', 'Low': '#64748B'}
    difficultyColors = {'Easy': '#10B981', 'Medium': '#F59E0B', 'Hard': '#EF4444'}
    
    rec_data = []
    for rec in s['recommendations']:
        i_col = impactColors.get(rec['impact'], '#FF6B00')
        d_col = difficultyColors.get(rec['difficulty'], '#10B981')
        
        lbls = f"<font color='{i_col}'><b>{rec['impact'].upper()} IMPACT</b></font> &nbsp;&nbsp; <font color='{d_col}'><b>{rec['difficulty'].upper()}</b></font>"
        
        c = [
            Paragraph(lbls, ParagraphStyle('rl', fontSize=8)),
            Paragraph(f"<b>{rec['title']}</b>", bold_text),
            Paragraph(rec['desc'], normal_text)
        ]
        
        # We put them in a table cell
        # Let's do 2 columns of recommendations
        rec_data.append(c)

    # Pair them up
    rec_rows = []
    for i in range(0, len(rec_data), 2):
        r1 = rec_data[i]
        r2 = rec_data[i+1] if i+1 < len(rec_data) else ['', '', '']
        
        cell1 = [r1[0], Spacer(1,4), r1[1], Spacer(1,2), r1[2]] if r1[0] else ''
        cell2 = [r2[0], Spacer(1,4), r2[1], Spacer(1,2), r2[2]] if r2[0] else ''
        
        rec_rows.append([cell1, cell2])
        
    rt = Table(rec_rows, colWidths=[240, 240])
    rt.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 10),
        ('BACKGROUND', (0,0), (-1,-1), BRAND_LIGHT_BG),
        ('GRID', (0,0), (-1,-1), 2, colors.white),
    ]))
    elements.append(KeepTogether([rt]))
    elements.append(Spacer(1, 25))
    
    # --- 5. AI CITATION READINESS ---
    elements.append(Paragraph("READINESS", section_label_style))
    elements.append(Paragraph("AI Citation Readiness", subtitle_style))
    
    readiness_data = [
        [
            Paragraph("Structured Data", ParagraphStyle('rlb', fontName='Helvetica-Bold', fontSize=9, alignment=1, textColor=BRAND_GRAY)),
            Paragraph("Citation Trust", ParagraphStyle('rlb', fontName='Helvetica-Bold', fontSize=9, alignment=1, textColor=BRAND_GRAY)),
            Paragraph("Semantic Clarity", ParagraphStyle('rlb', fontName='Helvetica-Bold', fontSize=9, alignment=1, textColor=BRAND_GRAY)),
            Paragraph("AI Indexing", ParagraphStyle('rlb', fontName='Helvetica-Bold', fontSize=9, alignment=1, textColor=BRAND_GRAY))
        ],
        [
            Paragraph(f"{s['schemaScore']}%", ParagraphStyle('rval', fontName='Helvetica-Bold', fontSize=20, alignment=1, textColor=BRAND_DARK)),
            Paragraph(f"{s['citationScore']}%", ParagraphStyle('rval', fontName='Helvetica-Bold', fontSize=20, alignment=1, textColor=BRAND_DARK)),
            Paragraph(f"{round((s['aeo']+s['ux'])/2)}%", ParagraphStyle('rval', fontName='Helvetica-Bold', fontSize=20, alignment=1, textColor=BRAND_DARK)),
            Paragraph(f"{round((s['seo']+s['schemaScore'])/2)}%", ParagraphStyle('rval', fontName='Helvetica-Bold', fontSize=20, alignment=1, textColor=BRAND_DARK))
        ],
        [
            create_progress_bar(s['schemaScore'], '#FF6B00'),
            create_progress_bar(s['citationScore'], '#FF6B00'),
            create_progress_bar(round((s['aeo']+s['ux'])/2), '#FF6B00'),
            create_progress_bar(round((s['seo']+s['schemaScore'])/2), '#FF6B00')
        ]
    ]
    
    read_t = Table(readiness_data, colWidths=[120, 120, 120, 120])
    read_t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(KeepTogether([read_t]))
    elements.append(Spacer(1, 20))
    
    # --- Footer ---
    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(BRAND_GRAY)
        canvas.drawString(40, 20, f"Softree AI Intelligence Engine • Report for {s['domain']}")
        canvas.drawRightString(555, 20, f"Page {doc.page}")
        canvas.restoreState()
        
    doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
