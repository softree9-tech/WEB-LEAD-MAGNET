/**
 * GEO-specific Excel export.
 * Only exports AI visibility / GEO-relevant parameters,
 * NOT the full analyzer column set.
 */

const sanitize = (text) => {
  if (text === null || text === undefined) return '';
  return String(text).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
};

export async function exportGeoExcel(data, filename) {
  try {
    const ExcelJS = await import('exceljs');
    const Workbook = ExcelJS.Workbook || ExcelJS.default.Workbook;
    const workbook = new Workbook();
    const ws = workbook.addWorksheet('GEO Report');

    // ── GEO-specific columns only ──────────────────────────
    const columns = [
      { header: 'Website', key: 'website' },
      { header: 'AI Visibility Score', key: 'ai_visibility' },
      { header: 'SEO Score', key: 'seo_score' },
      { header: 'AEO Score', key: 'aeo_score' },
      { header: 'UX Score', key: 'ux_score' },
      { header: 'Trust Score', key: 'trust_score' },
      { header: 'ChatGPT Visibility', key: 'chatgpt' },
      { header: 'Gemini Visibility', key: 'gemini' },
      { header: 'Perplexity Visibility', key: 'perplexity' },
      { header: 'Claude Visibility', key: 'claude' },
      { header: 'Schema Score', key: 'schema_score' },
      { header: 'Citation Readiness', key: 'citation_readiness' },
      { header: 'Entity Recognition', key: 'entities' },
      { header: 'Schema Types', key: 'schema_types' },
      { header: 'Has Open Graph', key: 'has_og' },
      { header: 'Has Canonical', key: 'has_canonical' },
      { header: 'Has Meta Description', key: 'has_meta_desc' },
      { header: 'Has SSL', key: 'has_ssl' },
      { header: 'Design Quality', key: 'design' },
      { header: 'CTA Strength', key: 'cta' },
      { header: 'AEO AI Response', key: 'aeo_response' },
      { header: 'Executive Summary', key: 'exec_summary' },
      { header: 'Top Recommendations', key: 'recommendations' },
    ];

    ws.columns = columns.map(col => ({ header: col.header, key: col.key, width: 28 }));

    // ── Compute GEO scores ────────────────────────────────
    const seo = parseInt(data.seo_score || 0);
    const aeo = parseInt(data.aeo_score || 0);
    const consistencyVal = data.design === 'Modern' ? 90 : 60;
    const flowVal = data.message === 'Clear' ? 80 : 50;
    const mobileVal = data.seo_mobile ? 80 : 30;
    const engagementVal = data.cta === 'Strong' ? 90 : 40;
    const ux = Math.round((consistencyVal + flowVal + mobileVal + engagementVal) / 4);

    const trustSignals = [
      data.has_analytics?.google_analytics, data.has_analytics?.tag_manager,
      data.has_analytics?.facebook_pixel, data.has_analytics?.linkedin_tag,
      data.has_lead_capture, data.has_cta, data.has_newsletter,
      data.seo_ssl, data.ssl_enforced, data.seo_title,
      data.seo_meta_desc, data.seo_canonical, data.seo_og
    ];
    const trust = Math.round((trustSignals.filter(Boolean).length / 13) * 100);
    const aiVisibility = Math.round(aeo * 0.4 + seo * 0.3 + trust * 0.2 + ux * 0.1);

    const chatgpt = Math.min(100, Math.round(aiVisibility * 1.05 + (data.seo_og ? 5 : -5)));
    const gemini = Math.min(100, Math.round(aiVisibility * 0.95 + (data.seo_meta_desc ? 4 : -6)));
    const perplexity = Math.min(100, Math.round(aiVisibility * 0.88 + (data.seo_canonical ? 6 : -4)));
    const claude = Math.min(100, Math.round(aiVisibility * 0.92 + (data.seo_title ? 3 : -3)));

    const schemaSignals = [data.seo_og, data.seo_canonical, data.seo_title, data.seo_meta_desc, data.schema_types?.length > 0];
    const schemaScore = Math.round((schemaSignals.filter(Boolean).length / 5) * 100);
    const citationScore = Math.round((schemaScore * 0.3 + trust * 0.3 + aeo * 0.4));

    // Entity list
    const entities = [];
    if (data.services_detected) {
      (Array.isArray(data.services_detected) ? data.services_detected : [data.services_detected]).forEach(s => entities.push(s));
    }
    if (data.industry) entities.push(data.industry);
    if (data.company_type) entities.push(data.company_type);
    if (data.target_audience) entities.push(data.target_audience);

    // Recommendations
    const recs = [];
    if (!data.seo_og) recs.push('Add Open Graph markup');
    if (!data.seo_canonical) recs.push('Set canonical URL');
    if (schemaScore < 60) recs.push('Add Organization schema');
    if (!data.has_newsletter) recs.push('Add FAQ structured data');
    if (data.cta !== 'Strong') recs.push('Strengthen semantic relevance');
    recs.push('Improve service entity structure');
    if (aeo < 50) recs.push('Improve AI citation signals');

    ws.addRow({
      website: sanitize(data.website),
      ai_visibility: aiVisibility,
      seo_score: seo,
      aeo_score: aeo,
      ux_score: ux,
      trust_score: trust,
      chatgpt,
      gemini,
      perplexity,
      claude,
      schema_score: schemaScore,
      citation_readiness: citationScore,
      entities: sanitize(entities.join(', ')),
      schema_types: sanitize((data.schema_types || []).join(', ')),
      has_og: data.seo_og ? 'Yes' : 'No',
      has_canonical: data.seo_canonical ? 'Yes' : 'No',
      has_meta_desc: data.seo_meta_desc ? 'Yes' : 'No',
      has_ssl: data.seo_ssl ? 'Yes' : 'No',
      design: sanitize(data.design),
      cta: sanitize(data.cta),
      aeo_response: sanitize((data.aeo_probe_response || '').substring(0, 500)),
      exec_summary: sanitize(data.executive_summary),
      recommendations: sanitize(recs.join(' | ')),
    });

    // ── Styling ──────────────────────────────────────────────
    ws.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber === 1) {
        row.height = 24;
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: false };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF334155' } },
            bottom: { style: 'medium', color: { argb: 'FF334155' } },
            left: { style: 'thin', color: { argb: 'FF334155' } },
            right: { style: 'thin', color: { argb: 'FF334155' } },
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
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          };
        });
      }
    });

    // Auto-adjust widths
    ws.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: false }, cell => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > maxLength) maxLength = len;
      });
      column.width = Math.max(14, Math.min(50, maxLength + 3));
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
    console.error('Failed to export GEO Excel report:', err);
    alert('Failed to generate GEO report. Please try again.');
  }
}
