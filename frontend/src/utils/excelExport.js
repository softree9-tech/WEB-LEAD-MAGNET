export const sanitizeText = (text) => {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const exportToExcel = async (leads, filename, isPublic) => {
  try {
    const ExcelJS = await import('exceljs');
    const Workbook = ExcelJS.Workbook || ExcelJS.default.Workbook;
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Analysis Report');

    const columnsList = [
      { header: 'First Name', key: 'first_name' },
      { header: 'Last Name', key: 'last_name' },
      { header: 'Title', key: 'title' },
      { header: 'Company Name', key: 'company_name' },
      { header: 'Email', key: 'email' },
      { header: 'Website', key: 'website' },
      { header: 'Final Score', key: 'final_score' },
      { header: 'Design', key: 'design' },
      { header: 'CTA', key: 'cta' },
      { header: 'Trust', key: 'trust' },
      { header: 'Executive Summary', key: 'executive_summary' },
      { header: 'Business Risk Insight', key: 'business_risk_insight' },
      { header: 'Strategic Opportunity Insight', key: 'strategic_opportunity_insight' },
      { header: 'Executive AI Recommendation', key: 'executive_ai_recommendation' },
      { header: 'Brand Credibility Insight', key: 'brand_credibility_insight' },
      { header: 'Msg Effectiveness Insight', key: 'msg_effectiveness_insight' },
      { header: 'Val Prop Analysis', key: 'val_prop_analysis' },
      { header: 'Msg Strategic Rec', key: 'msg_strategic_rec' },
      { header: 'CTA Strength', key: 'cta_strength' },
      { header: 'CTA Visibility', key: 'cta_visibility' },
      { header: 'CTA Placement', key: 'cta_placement' },
      { header: 'CTA Eff Insight', key: 'cta_eff_insight' },
      { header: 'CTA Opt Rec AI', key: 'cta_opt_rec_ai' },
      { header: 'Mobile Rating', key: 'mobile_rating' },
      { header: 'Mobile Insight', key: 'mobile_insight' },
      { header: 'Momentum Score', key: 'momentum_score' },
      { header: 'Momentum Status', key: 'momentum_status' },
      { header: 'Momentum Risk', key: 'momentum_risk' },
      { header: 'Momentum Insight', key: 'momentum_insight' },
      { header: 'Strategic Action Plan', key: 'strategic_action_plan' },
      { header: 'Revenue Leak', key: 'revenue_leak' },
      { header: 'Annual Loss', key: 'annual_loss' },
      { header: 'Urgency Severity', key: 'urgency_severity' },
      { header: 'Revenue Impact Insight', key: 'revenue_impact_insight' },
      { header: 'Visitors Lost', key: 'visitors_lost' },
      { header: 'Leads Lost', key: 'leads_lost' },
      { header: 'Missing Leads Count', key: 'missing_leads_count' },
      { header: 'Conversion Loss Percent', key: 'conversion_loss_percent' },
      { header: 'CTA Opt Rec', key: 'cta_opt_rec' },
      { header: 'Conv Imp Sug', key: 'conv_imp_sug' },
      { header: 'Funnel Opt Ins', key: 'funnel_opt_ins' },
      { header: 'Mobile Conv Rec', key: 'mobile_conv_rec' },
      { header: 'Lead Gen Opp', key: 'lead_gen_opp' },
      { header: 'Conv Intel Ins', key: 'conv_intel_ins' },
      { header: 'Maturity Level', key: 'maturity_level' },
      { header: 'Sales Potential', key: 'sales_potential' },
      { header: 'Digital Readiness', key: 'digital_readiness' },
      { header: 'Growth Potential', key: 'growth_potential' },
      { header: 'Market Insight', key: 'market_insight' },
      { header: 'Buyer Intent', key: 'buyer_intent' },
      { header: 'Conv Positioning', key: 'conv_positioning' },
      { header: 'Comm Maturity', key: 'comm_maturity' },
      { header: 'Website Type', key: 'website_type' },
      { header: 'Comm Insights', key: 'comm_insights' },
      { header: 'Sales Maturity', key: 'sales_maturity' },
      { header: 'Conv Target Insight', key: 'conv_target_insight' },
      { header: 'Market Strat Rec', key: 'market_strat_rec' },
      { header: 'Keyword Opps', key: 'keyword_opps' },
      { header: 'Competitor Adv', key: 'competitor_adv' },
      { header: 'Search Impact', key: 'search_impact' },
      { header: 'Keyword Insight', key: 'keyword_insight' },
      { header: 'Trust Decay', key: 'trust_decay' },
      { header: 'Maintenance Confidence', key: 'maintenance_confidence' },
      { header: 'Outdated Signals', key: 'outdated_signals' },
      { header: 'Credibility Insight', key: 'credibility_insight' },
      { header: 'Trust Recommendation', key: 'trust_recommendation' },
      { header: 'Rebranding Pitch', key: 'rebranding_pitch' },
      { header: 'SEO Issues', key: 'seo_issues' },
      { header: 'AEO Quote', key: 'aeo_quote' },
    ];

    const publicExcludedKeys = ['title', 'company_name', 'competitor_website', 'battle_winner', 'battle_verdict', 'emailfullbody'];

    const finalColumns = isPublic
      ? columnsList.filter(col => !publicExcludedKeys.includes(col.key))
      : columnsList;

    worksheet.columns = finalColumns.map(col => ({
      header: col.header,
      key: col.key,
      width: 25
    }));

    leads.forEach(lead => {
      const af = lead._apollo_fields || {};
      const consistencyVal = lead.design === 'Modern' ? 90 : 60;
      const flowVal = lead.message === 'Clear' ? 80 : 50;
      const mobileVal = lead.seo_mobile ? 80 : 30;
      const engagementVal = lead.cta === 'Strong' ? 90 : 40;
      const uxScore = Math.round((consistencyVal + flowVal + mobileVal + engagementVal) / 4);

      const seoIssues = [
        !lead.seo_title && 'Missing title tag',
        !lead.seo_meta_desc && 'Missing meta description',
        !lead.seo_h1 && 'Missing H1 tag',
        !lead.seo_canonical && 'Missing canonical tag',
        !lead.seo_og && 'Missing Open Graph tags',
        !lead.seo_mobile && 'Poor mobile optimization',
        lead.has_duplicate_meta && 'Duplicate meta tags',
        !lead.has_cta && 'Weak CTA placement',
        !lead.has_newsletter && 'Missing newsletter signup',
        parseFloat(lead.load_time) > 3.0 && `Slow page load (${lead.load_time}s)`,
        (lead.broken_links?.length > 0) && `${lead.broken_links.length} broken links`,
        (lead.image_percent_missing_alt > 0) && 'Missing alt text',
        ...((lead.lighthouse_issues?.performance || []).slice(0, 1).map(i => `Perf: ${i}`)),
        ...((lead.lighthouse_issues?.seo || []).slice(0, 1).map(i => `SEO: ${i}`)),
      ].filter(Boolean).slice(0, 5).join(' | ') || 'No major SEO issues detected';

      const batchSeoScore = parseInt(lead.seo_score || 0);
      const batchAeoScore = parseInt(lead.aeo_score || 0);
      const batchEmailBody = `Hi team,

I was doing some research in your industry and took a look under the hood of ${(lead.website || '').replace(/^https?:\/\//i, '')}. I ran a deep forensic analysis and found 4 critical bottlenecks bleeding your organic traffic and conversions:

1. REBRANDING & UX (${uxScore}/100)
${lead.rebranding_pitch || "Your overall visual hierarchy and user engagement flows need optimization to convert high-intent traffic."}

2. TECH & TRUST SIGNALS
${lead.ssl_days_remaining < 30 ? `Critical: Your SSL Certificate expires in ${lead.ssl_days_remaining} days, which will trigger Google security warnings. ` : ``}${(!lead.has_lead_capture || !lead.has_newsletter) ? "You are currently missing vital lead capture mechanisms like a newsletter opt-in or strong contact forms." : "Your core tracking tags and lead pipelines need to be optimized for conversion tracking."}

3. GOOGLE SEO METRICS (${batchSeoScore}/100)
Google's official Lighthouse API grades your site's performance at ${lead.lighthouse_performance || 50}% and accessibility at ${lead.lighthouse_accessibility || 50}%. Your live load time is ${lead.load_time}s.

4. AI SEARCH VISIBILITY (AEO: ${batchAeoScore}/100)
The future of search is AI. We directly queried ChatGPT about your brand, and the engine responded: "${lead.aeo_probe_response || "I am unable to find detailed information."}"

I've put together a comprehensive technical audit outlining exactly how we can resolve these specific issues to immediately improve your conversion rate. Do you have 5 minutes next Tuesday to chat?

Best,
[Your Name]`;

      worksheet.addRow({
        first_name: sanitizeText(af['First Name']),
        last_name: sanitizeText(af['Last Name']),
        title: sanitizeText(af['Title']),
        company_name: sanitizeText(af['Company Name']),
        email: sanitizeText(af['Email']),
        website: sanitizeText(lead.website),
        competitor_website: sanitizeText(lead.competitor_data?.website || 'N/A'),
        final_score: uxScore,
        design: sanitizeText(lead.design),
        cta: sanitizeText(lead.cta),
        message: sanitizeText(lead.message),
        trust: sanitizeText(lead.trust),
        speed: sanitizeText(lead.speed),
        schema_score: lead.schema_coverage_score || 0,
        schema_impact: sanitizeText(lead.schema_visibility_impact || 'Low'),
        first_impression_score: lead.first_impression_score || 0,
        first_impression_verdict: sanitizeText(lead.first_impression_verdict || 'Unknown'),
        executive_summary: sanitizeText(lead.executive_summary),
        business_risk_insight: sanitizeText(lead.business_risk_insight),
        strategic_opportunity_insight: sanitizeText(lead.strategic_opportunity_insight),
        executive_ai_recommendation: sanitizeText(lead.executive_ai_recommendation),
        brand_credibility_insight: sanitizeText(lead.brand_credibility_insight),
        msg_clarity_level: sanitizeText(lead.messaging_clarity_level || 'Moderate'),
        msg_effectiveness_insight: sanitizeText(lead.communication_effectiveness_insight),
        val_prop_analysis: sanitizeText(lead.value_proposition_analysis),
        msg_strategic_rec: sanitizeText(lead.messaging_strategic_recommendation),
        headline_clarity: lead.headline_clarity_score || 0,
        val_prop_strength: lead.value_prop_strength_score || 0,
        cta_quality: lead.cta_communication_quality_score || 0,
        msg_confidence: lead.messaging_confidence_score || 0,
        audience_clarity: lead.audience_targeting_clarity_score || 0,
        brand_effectiveness: lead.brand_communication_effectiveness_score || 0,
        cta_strength: sanitizeText(lead.cta_strength_level || 'Moderate'),
        cta_urgency: lead.cta_urgency_score || 0,
        cta_visibility: sanitizeText(lead.cta_visibility_rating || 'Moderate'),
        cta_placement: sanitizeText(lead.cta_placement_quality || 'Suboptimal'),
        cta_clarity: lead.cta_action_clarity_score || 0,
        cta_persuasiveness: lead.cta_persuasiveness_score || 0,
        cta_eff_insight: sanitizeText(lead.cta_effectiveness_insight),
        cta_opt_rec_ai: sanitizeText(lead.cta_ai_optimization_recommendation),
        mobile_rating: sanitizeText(lead.mobile_ux_rating || 'Average'),
        mobile_risk: sanitizeText(lead.mobile_conversion_risk || 'Moderate'),
        mobile_insight: sanitizeText(lead.mobile_ai_insight),
        momentum_score: lead.momentum_score || 0,
        momentum_status: sanitizeText(lead.competitive_growth_status || 'Steady'),
        momentum_risk: sanitizeText(lead.strategic_risk_level || 'Moderate'),
        momentum_direction: sanitizeText(lead.momentum_growth_direction || 'Neutral'),
        momentum_insight: sanitizeText(lead.momentum_ai_insight),
        strategic_action_plan: sanitizeText((lead.ai_strategic_plan || []).map(s => `${s?.priority || ''}: ${s?.action || ''} (Impact: ${s?.impact || ''})`).join(' | ')),
        revenue_leak: sanitizeText(`$${lead.revenue_leak_amount || 0}`),
        leak_severity: sanitizeText(lead.revenue_leak_severity || 'Low'),
        annual_loss: sanitizeText(`$${lead.annual_opportunity_loss || 0}`),
        urgency_severity: sanitizeText(lead.urgency_severity || '90+ Days'),
        revenue_impact_insight: sanitizeText(lead.revenue_impact_insight),
        visitors_lost: lead.visitors_lost || 0,
        leads_lost: lead.leads_lost || 0,
        missing_leads_count: lead.missing_opportunities_count || 0,
        conversion_loss_percent: sanitizeText(`${lead.estimated_conversion_loss_percent || 0}%`),
        readiness_level: sanitizeText(lead.conversion_readiness_level || 'Low'),
        cta_opt_rec: sanitizeText(lead.cta_optimization_recommendation),
        conv_imp_sug: sanitizeText(lead.conversion_improvement_suggestion),
        funnel_opt_ins: sanitizeText(lead.funnel_optimization_insight),
        mobile_conv_rec: sanitizeText(lead.mobile_conversion_recommendation),
        lead_gen_opp: sanitizeText(lead.lead_gen_improvement_opportunity),
        conv_intel_ins: sanitizeText(lead.conversion_intelligence_insight),
        industry_percentile: lead.industry_percentile || 0,
        industry_tier: sanitizeText(lead.industry_tier || 'Unknown'),
        industry_competitiveness: sanitizeText(lead.industry_competitiveness || 'Unknown'),
        lead_quality: lead.lead_quality_score || 0,
        maturity_level: sanitizeText(lead.business_maturity_level || 'Unknown'),
        sales_potential: sanitizeText(lead.sales_potential || 'Moderate'),
        digital_readiness: sanitizeText(lead.digital_readiness || 'Moderate'),
        growth_potential: sanitizeText(lead.growth_potential || 'Moderate'),
        market_insight: sanitizeText(lead.market_position_intelligence_insight),
        buyer_intent: sanitizeText(lead.buyer_intent_strength || 'Moderate'),
        trans_intent: lead.transactional_service_intent_score || 0,
        ent_orientation: lead.enterprise_sales_orientation_score || 0,
        lead_gen_focus: lead.lead_generation_focus_score || 0,
        conv_positioning: lead.conversion_oriented_positioning_score || 0,
        comm_maturity: sanitizeText(lead.commercial_readiness_maturity || 'Moderate'),
        website_type: sanitizeText(lead.primary_website_type || 'informational'),
        comm_insights: sanitizeText(lead.commercial_insights),
        sales_maturity: lead.sales_positioning_maturity_score || 0,
        comm_readiness_lvl: lead.commercial_readiness_level_score || 0,
        conv_target_insight: sanitizeText(lead.conversion_targeting_insight),
        market_strat_rec: sanitizeText(lead.market_position_ai_strategic_recommendation),
        keyword_opps: sanitizeText(lead.keyword_visibility_gap_opportunities),
        keyword_level: sanitizeText(lead.keyword_visibility_gap_level || 'Low'),
        competitor_adv: sanitizeText(lead.keyword_visibility_gap_competitor_advantage),
        search_impact: sanitizeText(lead.keyword_visibility_gap_search_impact || 'Low'),
        keyword_insight: sanitizeText(lead.keyword_visibility_gap_insight),
        trust_decay: sanitizeText(lead.trust_decay_level || 'Low'),
        maintenance_confidence: lead.maintenance_confidence || 100,
        outdated_signals: sanitizeText(lead.outdated_signal_indicators),
        credibility_insight: sanitizeText(lead.credibility_impact_insight),
        trust_recommendation: sanitizeText(lead.ai_trust_recommendation),
        rebranding_pitch: sanitizeText(lead.rebranding_pitch),
        seo_issues: sanitizeText(seoIssues),
        aeo_quote: sanitizeText((lead.aeo_probe_response || 'No AI recognition data.').substring(0, isPublic ? 500 : 1000)),
        battle_winner: sanitizeText(lead.battle_data?.overall_winner || 'N/A'),
        battle_verdict: sanitizeText(lead.battle_data?.ai_verdict || 'N/A'),
        emailfullbody: sanitizeText(batchEmailBody)
      });
    });

    // Clean, professional styling
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber === 1) {
        row.height = 24;
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E293B' }
          };
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: false };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF334155' } },
            bottom: { style: 'medium', color: { argb: 'FF334155' } },
            left: { style: 'thin', color: { argb: 'FF334155' } },
            right: { style: 'thin', color: { argb: 'FF334155' } }
          };
        });
      } else {
        row.height = 20;
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.font = { name: 'Segoe UI', size: 10 };
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: false };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };
        });
      }
    });

    // Auto-adjust column widths
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: false }, cell => {
        const cellVal = cell.value ? String(cell.value) : '';
        const lines = cellVal.split('\n');
        const maxLineLength = Math.max(...lines.map(line => line.length), 0);
        if (maxLineLength > maxLength) {
          maxLength = maxLineLength;
        }
      });
      column.width = Math.max(12, Math.min(50, maxLength + 3));
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export Excel report:', err);
    alert('Failed to generate Excel report. Please try again.');
  }
};
