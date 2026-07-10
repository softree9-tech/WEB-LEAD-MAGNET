import io
import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.graphics.shapes import Drawing, Rect, Circle, String
from reportlab.graphics.charts.piecharts import Pie

BRAND_NAVY = colors.HexColor('#0A0F3C')
BRAND_ORANGE = colors.HexColor('#FF6B00')
BRAND_GRAY = colors.HexColor('#5F6475')
BRAND_LIGHT_BG = colors.HexColor('#F7F8FC')
BORDER_COLOR = colors.HexColor('#E7EAF3')

def create_score_ring(score, label):
    d = Drawing(120, 120)
    d.add(Circle(60, 60, 50, fillColor=None, strokeColor=colors.HexColor('#E7EAF3'), strokeWidth=6))
    
    pc = Pie()
    pc.x = 10
    pc.y = 10
    pc.width = 100
    pc.height = 100
    pc.data = [score, 100 - score] if score < 100 else [100, 0]
    pc.labels = ['', '']
    pc.slices[0].fillColor = BRAND_ORANGE
    pc.slices[0].strokeColor = None
    pc.slices[1].fillColor = colors.transparent
    pc.slices[1].strokeColor = None
    pc.startAngle = 90
    pc.direction = 'clockwise'
    
    d.add(pc)
    d.add(Circle(60, 60, 44, fillColor=colors.white, strokeColor=None))
    
    d.add(String(60, 64, str(score), fontSize=24, fontName="Helvetica-Bold", textAnchor="middle", fillColor=BRAND_NAVY))
    d.add(String(60, 46, label, fontSize=8, fontName="Helvetica-Bold", textAnchor="middle", fillColor=BRAND_GRAY))
    return d

def create_progress_bar(score, color_hex):
    d = Drawing(120, 10)
    d.add(Rect(0, 0, 120, 8, fillColor=colors.HexColor('#E7EAF3'), strokeColor=None, rx=4, ry=4))
    fill_width = max(8, (score / 100.0) * 120) if score > 0 else 0
    if fill_width > 0:
        d.add(Rect(0, 0, fill_width, 8, fillColor=colors.HexColor(color_hex), strokeColor=None, rx=4, ry=4))
    return d

def create_table_style(has_header=True):
    style = [
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 0), (-1, -1), BRAND_NAVY),
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
            ('TEXTCOLOR', (0, 0), (-1, 0), BRAND_NAVY),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
        ])
    return TableStyle(style)

def generate_healthcare_pdf_report(report_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=40, leftMargin=40,
        topMargin=40, bottomMargin=50
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=24, leading=28, textColor=BRAND_NAVY, spaceAfter=8)
    h2_style = ParagraphStyle('H2Style', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=16, leading=20, textColor=BRAND_NAVY, spaceAfter=12, spaceBefore=24)
    section_label_style = ParagraphStyle('SectionLabel', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, textColor=BRAND_ORANGE, textTransform='uppercase', spaceAfter=4)
    normal_text = ParagraphStyle('NormalText', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=14, textColor=BRAND_GRAY)
    bold_text = ParagraphStyle('BoldText', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, leading=14, textColor=BRAND_NAVY)
    
    elements = []
    
    hospital_name = report_data.get('hospital_name', 'Healthcare Organization')
    date_str = datetime.datetime.now().strftime("%B %d, %Y")
    
    # --- HEADER ---
    header_data = [
        [Paragraph("<b>Softree Technology</b>", ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=16, textColor=BRAND_ORANGE)),
         Paragraph(f"<font color='#64748B'>Generated {date_str}</font>", ParagraphStyle('H2', alignment=2, fontName='Helvetica', fontSize=10))]
    ]
    header_table = Table(header_data, colWidths=[250, 265])
    header_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
    elements.append(header_table)
    elements.append(Spacer(1, 20))
    
    # --- HERO SECTION ---
    elements.append(Paragraph("AI AGENT OPPORTUNITY ASSESSMENT™", section_label_style))
    elements.append(Paragraph(hospital_name, title_style))
    elements.append(Spacer(1, 10))
    
    readinessScore = report_data.get('ai_readiness_score', 0)
    badge_label = 'High Readiness' if readinessScore >= 70 else ('Moderate Readiness' if readinessScore >= 40 else 'Early Stage')
    badge_color = '#16A34A' if readinessScore >= 70 else ('#D97706' if readinessScore >= 40 else '#5F6475')
    
    hero_msg = f"Based on your responses, your organization demonstrates {badge_label.lower()} AI readiness with multiple high-value automation opportunities across clinical and administrative operations. Immediate prioritization can yield significant operational savings and performance gains."
    
    elements.append(Paragraph(hero_msg, normal_text))
    elements.append(Spacer(1, 15))
    
    # KPI Grid
    kpi_data = [
        [Paragraph("<b>AI Readiness Score</b>", bold_text), Paragraph(f"<b>{readinessScore}/100</b>", ParagraphStyle('v', fontName='Helvetica-Bold', fontSize=14, textColor=BRAND_NAVY)),
         Paragraph("<b>Opportunity Level</b>", bold_text), Paragraph(f"<b>{report_data.get('ai_opportunity_level', 'N/A')}</b>", ParagraphStyle('v', fontName='Helvetica-Bold', fontSize=14, textColor=BRAND_NAVY))],
        [Paragraph("<b>Estimated Annual ROI</b>", bold_text), Paragraph(f"<b>{report_data.get('estimated_annual_roi', 'N/A')}</b>", ParagraphStyle('v', fontName='Helvetica-Bold', fontSize=14, textColor=BRAND_NAVY)),
         Paragraph("<b>Potential Savings</b>", bold_text), Paragraph(f"<b>{report_data.get('potential_annual_cost_savings', 'N/A')}</b>", ParagraphStyle('v', fontName='Helvetica-Bold', fontSize=14, textColor=BRAND_NAVY))],
        [Paragraph("<b>Recommended Agents</b>", bold_text), Paragraph(f"<b>{report_data.get('recommended_ai_agents_count', 0)}</b>", ParagraphStyle('v', fontName='Helvetica-Bold', fontSize=14, textColor=BRAND_NAVY)),
         Paragraph("<b>Implementation Timeline</b>", bold_text), Paragraph(f"<b>{report_data.get('estimated_implementation_timeline', 'N/A')}</b>", ParagraphStyle('v', fontName='Helvetica-Bold', fontSize=14, textColor=BRAND_NAVY))]
    ]
    kpi_t = Table(kpi_data, colWidths=[120, 135, 120, 140])
    kpi_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BRAND_LIGHT_BG),
        ('GRID', (0,0), (-1,-1), 1, colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 12),
    ]))
    elements.append(kpi_t)
    elements.append(Spacer(1, 25))
    
    # --- EXECUTIVE ANALYTICS ---
    elements.append(Paragraph("EXECUTIVE ANALYTICS", section_label_style))
    elements.append(Paragraph("Top AI Opportunities", h2_style))
    
    opps = report_data.get('top_ai_opportunities', [])
    if opps:
        opps_data = [[
            Paragraph("<b>Department</b>", bold_text),
            Paragraph("<b>Recommended Agent</b>", bold_text),
            Paragraph("<b>Impact</b>", bold_text),
            Paragraph("<b>Priority</b>", bold_text)
        ]]
        for opp in opps:
            opp_dept = opp.get('department', opp.get('dept', ''))
            opp_agent = opp.get('recommended_agent', opp.get('agent', ''))
            opp_impact = opp.get('business_impact', opp.get('impact', ''))
            opp_priority = opp.get('priority', '')
            
            p_color = BRAND_ORANGE if opp_priority == 'High' else BRAND_GRAY
            opps_data.append([
                Paragraph(str(opp_dept), normal_text),
                Paragraph(str(opp_agent), bold_text),
                Paragraph(str(opp_impact), normal_text),
                Paragraph(f"<font color='{p_color.hexval()}'><b>{str(opp_priority)}</b></font>", normal_text)
            ])
        opps_table = Table(opps_data, colWidths=[120, 200, 95, 100])
        opps_table.setStyle(create_table_style())
        elements.append(opps_table)
    else:
        elements.append(Paragraph("No specific opportunities found.", normal_text))
        
    elements.append(Spacer(1, 25))
    
    # --- AI READINESS DIMENSIONS ---
    elements.append(Paragraph("READINESS", section_label_style))
    elements.append(Paragraph("AI Readiness Dimensions", h2_style))
    
    readiness_data = [
        [
            Paragraph("People", ParagraphStyle('rlb', fontName='Helvetica-Bold', fontSize=9, alignment=1, textColor=BRAND_GRAY)),
            Paragraph("Process", ParagraphStyle('rlb', fontName='Helvetica-Bold', fontSize=9, alignment=1, textColor=BRAND_GRAY)),
            Paragraph("Technology", ParagraphStyle('rlb', fontName='Helvetica-Bold', fontSize=9, alignment=1, textColor=BRAND_GRAY)),
            Paragraph("Data", ParagraphStyle('rlb', fontName='Helvetica-Bold', fontSize=9, alignment=1, textColor=BRAND_GRAY))
        ],
        [
            Paragraph(f"{report_data.get('readiness_people', 40)}/100", ParagraphStyle('rval', fontName='Helvetica-Bold', fontSize=16, alignment=1, textColor=BRAND_NAVY)),
            Paragraph(f"{report_data.get('readiness_processes', 50)}/100", ParagraphStyle('rval', fontName='Helvetica-Bold', fontSize=16, alignment=1, textColor=BRAND_NAVY)),
            Paragraph(f"{report_data.get('readiness_technology', 60)}/100", ParagraphStyle('rval', fontName='Helvetica-Bold', fontSize=16, alignment=1, textColor=BRAND_NAVY)),
            Paragraph(f"{report_data.get('readiness_data', 45)}/100", ParagraphStyle('rval', fontName='Helvetica-Bold', fontSize=16, alignment=1, textColor=BRAND_NAVY))
        ],
        [
            create_progress_bar(report_data.get('readiness_people', 40), '#FF6B00'),
            create_progress_bar(report_data.get('readiness_processes', 50), '#FF6B00'),
            create_progress_bar(report_data.get('readiness_technology', 60), '#FF6B00'),
            create_progress_bar(report_data.get('readiness_data', 45), '#FF6B00')
        ],
        [Spacer(1,10), Spacer(1,10), Spacer(1,10), Spacer(1,10)],
        [
            Paragraph("Governance", ParagraphStyle('rlb', fontName='Helvetica-Bold', fontSize=9, alignment=1, textColor=BRAND_GRAY)),
            Paragraph("Security", ParagraphStyle('rlb', fontName='Helvetica-Bold', fontSize=9, alignment=1, textColor=BRAND_GRAY)),
            "", ""
        ],
        [
            Paragraph(f"{report_data.get('readiness_governance', 70)}/100", ParagraphStyle('rval', fontName='Helvetica-Bold', fontSize=16, alignment=1, textColor=BRAND_NAVY)),
            Paragraph(f"{report_data.get('readiness_security', 85)}/100", ParagraphStyle('rval', fontName='Helvetica-Bold', fontSize=16, alignment=1, textColor=BRAND_NAVY)),
            "", ""
        ],
        [
            create_progress_bar(report_data.get('readiness_governance', 70), '#FF6B00'),
            create_progress_bar(report_data.get('readiness_security', 85), '#FF6B00'),
            "", ""
        ]
    ]
    
    read_t = Table(readiness_data, colWidths=[125, 125, 125, 125])
    read_t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(KeepTogether([read_t]))
    elements.append(Spacer(1, 25))
    
    elements.append(PageBreak())
    
    # --- BUSINESS IMPACT PROJECTIONS ---
    elements.append(Paragraph("PROJECTIONS", section_label_style))
    elements.append(Paragraph("Business Impact Projections", h2_style))
    
    b_data = [
        [
            Paragraph("ANNUAL SAVINGS", ParagraphStyle('b', fontName='Helvetica-Bold', fontSize=8, textColor=BRAND_GRAY)),
            Paragraph("STAFF HOURS SAVED", ParagraphStyle('b', fontName='Helvetica-Bold', fontSize=8, textColor=BRAND_GRAY))
        ],
        [
            Paragraph(str(report_data.get('estimated_annual_savings', 'N/A')), ParagraphStyle('bv', fontName='Helvetica-Bold', fontSize=20, textColor=BRAND_NAVY)),
            Paragraph(str(report_data.get('estimated_hours_saved', 'N/A')), ParagraphStyle('bv', fontName='Helvetica-Bold', fontSize=20, textColor=BRAND_NAVY))
        ],
        [Spacer(1,10), Spacer(1,10)],
        [
            Paragraph("OPERATIONAL EFFICIENCY", ParagraphStyle('b', fontName='Helvetica-Bold', fontSize=8, textColor=BRAND_GRAY)),
            Paragraph("PATIENT SATISFACTION", ParagraphStyle('b', fontName='Helvetica-Bold', fontSize=8, textColor=BRAND_GRAY))
        ],
        [
            Paragraph(str(report_data.get('operational_efficiency_gain', 'N/A')), ParagraphStyle('bv', fontName='Helvetica-Bold', fontSize=20, textColor=BRAND_NAVY)),
            Paragraph(str(report_data.get('patient_satisfaction_improvement', 'N/A')), ParagraphStyle('bv', fontName='Helvetica-Bold', fontSize=20, textColor=BRAND_NAVY))
        ]
    ]
    
    b_table = Table(b_data, colWidths=[250, 265])
    b_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BRAND_LIGHT_BG),
        ('PADDING', (0,0), (-1,-1), 15),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 1, colors.white),
        ('VALIGN', (0,0), (-1,-1), 'TOP')
    ]))
    elements.append(b_table)
    elements.append(Spacer(1, 25))
    
    # --- ROADMAP & RECOMMENDATIONS ---
    elements.append(Paragraph("STRATEGY", section_label_style))
    elements.append(Paragraph("Implementation Roadmap & Recommendations", h2_style))
    
    roadmap = report_data.get('implementation_roadmap', [])
    if not roadmap:
        roadmap = [
            {'phase': 'Phase 1', 'title': 'Quick Wins', 'desc': 'Deploy high-ROI agents in targeted workflows.'},
            {'phase': 'Phase 2', 'title': 'Department Automation', 'desc': 'Scale AI across entire departments.'},
            {'phase': 'Phase 3', 'title': 'Enterprise AI Expansion', 'desc': 'Integrate predictive models system-wide.'}
        ]
        
    for idx, step in enumerate(roadmap):
        p_phase = step.get('phase', f"Phase {idx+1}")
        p_title = step.get('title', '')
        p_desc = step.get('desc', '')
        
        elements.append(Paragraph(f"<font color='{BRAND_ORANGE.hexval()}'><b>{p_phase.upper()}</b></font>", normal_text))
        elements.append(Paragraph(f"<b>{p_title}</b>", bold_text))
        elements.append(Paragraph(p_desc, normal_text))
        elements.append(Spacer(1, 10))
        
    elements.append(Spacer(1, 15))
    
    recs = report_data.get('priority_focus_areas', [])
    if recs:
        elements.append(Paragraph("<b>Executive Recommendations:</b>", bold_text))
        elements.append(Spacer(1, 8))
        for idx, rec in enumerate(recs, 1):
            elements.append(Paragraph(f"<b>{idx}.</b> {rec}", normal_text))
            elements.append(Spacer(1, 5))
            
    elements.append(Spacer(1, 25))
    
    # --- EXECUTIVE SUMMARY ---
    elements.append(Paragraph("OVERVIEW", section_label_style))
    elements.append(Paragraph("Executive Summary", h2_style))
    
    summary = report_data.get('executive_summary', 'This assessment indicates strong potential for AI adoption. Finance and Clinical Documentation should be prioritized first to maximize ROI while minimizing implementation effort.')
    
    summ_table = Table([[Paragraph(f"<i>\"{summary}\"</i>", ParagraphStyle('V', fontName='Helvetica-Oblique', fontSize=12, leading=16, textColor=BRAND_NAVY))]], colWidths=[515])
    summ_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BRAND_LIGHT_BG),
        ('PADDING', (0,0), (-1,-1), 15),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR)
    ]))
    elements.append(summ_table)
    
    # --- Footer ---
    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(BRAND_GRAY)
        canvas.drawString(40, 20, f"Softree Technology • Executive Healthcare AI Report")
        canvas.drawRightString(555, 20, f"Page {doc.page}")
        canvas.restoreState()
        
    doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
