(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .service('ReportService', ReportService);

  function ReportService() {
    this.build = function build(form, result) {
      var summarySuffix = result.layerInsights && result.layerInsights.reportSummarySuffix
        ? result.layerInsights.reportSummarySuffix
        : '';
      var nextSteps = [
        'Validar oferta regional da rota verde selecionada.',
        'Mapear fornecedores e modelos de contrato.',
        'Avaliar adaptacao tecnica dos equipamentos.',
        'Estruturar plano de transicao em fases.'
      ];

      if (result.layerInsights && result.layerInsights.riskLabel) {
        nextSteps.unshift('Enderecar risco territorial destacado pelas camadas ativas: ' + result.layerInsights.riskLabel);
      }

      return {
        generatedAt: new Date().toISOString(),
        region: form.region,
        sector: form.sector,
        currentSource: form.currentSource,
        recommendedRoute: form.recommendedRoute,
        summary: 'A analise indica viabilidade ' + result.classification.toLowerCase() +
          ' para avaliacao da transicao energetica neste cenario.' + summarySuffix,
        metrics: {
          currentAnnualCost: result.currentAnnualCost,
          greenAnnualCost: result.greenAnnualCost,
          annualSavings: result.annualSavings,
          paybackYears: result.paybackYears,
          emissionReduction: result.emissionReduction,
          classification: result.classification
        },
        nextSteps: nextSteps
      };
    };

    this.buildDownloadDocument = function buildDownloadDocument(payload) {
      var report = payload.report;
      var form = payload.form;
      var result = payload.result;
      var mapImage = payload.mapImage || '';
      var activeLayers = Array.isArray(payload.activeLayers) ? payload.activeLayers : [];
      var generatedAt = payload.generatedAt || new Date().toISOString();
      var mapSection = mapImage
        ? '<img src="' + mapImage + '" alt="Mapa da simulacao" style="width:100%;border-radius:16px;border:1px solid #d8dfd8;display:block;">'
        : '<div style="padding:18px;border:1px dashed #c9d4cb;border-radius:16px;color:#56645b;background:#f6faf6;">Snapshot do mapa indisponivel nesta exportacao.</div>';
      var activeLayersSection = activeLayers.length
        ? [
          '<section>',
          '<h2>Camadas ativas na analise</h2>',
          '<table style="width:100%;border-collapse:collapse;border:1px solid #dde5db;border-radius:16px;overflow:hidden;background:#fbfdf8;">',
          '<thead>',
          '<tr style="background:#eef5ee;">',
          tableHeader('Grupo'),
          tableHeader('Camada'),
          tableHeader('Tipo'),
          tableHeader('Transparencia'),
          tableHeader('Legenda'),
          tableHeader('Fonte'),
          '</tr>',
          '</thead>',
          '<tbody>',
          activeLayers.map(function (layer) {
            return [
              '<tr>',
              tableCell(layer.group),
              tableCell(layer.name),
              tableCell(formatKind(layer.kind)),
              tableCell(String(Number(layer.opacity || 0)) + '%'),
              tableCell(layer.legend),
              tableCell(layer.sourceLabel),
              '</tr>'
            ].join('');
          }).join(''),
          '</tbody>',
          '</table>',
          '</section>'
        ].join('')
        : '';

      return [
        '<!doctype html>',
        '<html lang="pt-BR">',
        '<head>',
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        '<title>Relatorio Viabilidade Verde</title>',
        '<style>',
        'body{font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background:#f3efe4;color:#17231e;margin:0;padding:24px;}',
        '.sheet{max-width:980px;margin:0 auto;background:#fffdf8;border:1px solid #dde5db;border-radius:24px;padding:28px;box-shadow:0 20px 48px rgba(23,35,30,.08);}',
        '.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#1e7a43;font-weight:700;margin:0 0 8px;}',
        'h1{margin:0 0 8px;font-size:34px;line-height:1;}',
        'h2{margin:28px 0 12px;font-size:20px;}',
        'p{line-height:1.5;}',
        '.meta{color:#55645b;margin:0 0 6px;}',
        '.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}',
        '.card{border:1px solid #dde5db;border-radius:16px;padding:16px;background:#fbfdf8;}',
        '.card strong{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#55645b;margin-bottom:8px;}',
        '.card span{font-size:24px;font-weight:800;}',
        '.context,.note{border:1px solid #dde5db;border-radius:16px;padding:16px;background:#fbfdf8;}',
        '.note{background:#fff8e8;border-color:#ead8a9;color:#5d5b44;}',
        'ul,ol{padding-left:20px;}',
        'pre{white-space:pre-wrap;word-break:break-word;font-size:12px;background:#f2f6f2;border:1px solid #dde5db;border-radius:14px;padding:14px;}',
        '@media (max-width:720px){body{padding:12px;}.sheet{padding:18px;}.grid{grid-template-columns:1fr;}}',
        '</style>',
        '</head>',
        '<body>',
        '<main class="sheet">',
        '<p class="eyebrow">Viabilidade Verde</p>',
        '<h1>Relatorio de simulacao</h1>',
        '<p class="meta">Gerado em ' + escapeHtml(formatDate(generatedAt)) + '</p>',
        '<p class="meta">Mensagem central: a transicao energetica so acelera quando a conta fecha.</p>',
        '<section>',
        '<h2>Mapa da analise</h2>',
        mapSection,
        '</section>',
        '<section>',
        '<h2>Contexto selecionado</h2>',
        '<div class="context">',
        '<p><strong>Regiao:</strong> ' + escapeHtml(report.region) + '</p>',
        '<p><strong>Setor:</strong> ' + escapeHtml(report.sector) + '</p>',
        '<p><strong>Fonte atual:</strong> ' + escapeHtml(report.currentSource) + '</p>',
        '<p><strong>Rota avaliada:</strong> ' + escapeHtml(report.recommendedRoute) + '</p>',
        '</div>',
        '</section>',
        '<section>',
        '<h2>Indicadores da simulacao</h2>',
        '<div class="grid">',
        metricCard('Custo atual anual', formatCurrency(result.currentAnnualCost)),
        metricCard('Custo verde anual', formatCurrency(result.greenAnnualCost)),
        metricCard('Economia anual', formatCurrency(result.annualSavings)),
        metricCard('Investimento estimado', formatCurrency(form.investmentDefault)),
        metricCard('Payback', result.paybackYears !== null ? formatNumber(result.paybackYears) + ' anos' : 'N/A'),
        metricCard('Reducao de emissoes', formatPercent(result.emissionReduction)),
        metricCard('Viabilidade', report.metrics.classification),
        '</div>',
        '</section>',
        '<section>',
        '<h2>Resumo executivo</h2>',
        '<div class="context"><p>' + escapeHtml(report.summary) + '</p></div>',
        '</section>',
        activeLayersSection,
        '<section>',
        '<h2>Calculos</h2>',
        '<pre>' + escapeHtml([
          'custo_atual_anual = gasto_mensal_atual * 12 = ' + formatCurrency(form.monthlyCostDefault) + ' * 12 = ' + formatCurrency(result.currentAnnualCost),
          'custo_verde_anual = custo_atual_anual * fator_custo_rota = ' + formatCurrency(result.currentAnnualCost) + ' * ' + formatNumber(result.route.costFactor || 0) + ' = ' + formatCurrency(result.greenAnnualCost),
          'economia_anual = custo_atual_anual - custo_verde_anual = ' + formatCurrency(result.currentAnnualCost) + ' - ' + formatCurrency(result.greenAnnualCost) + ' = ' + formatCurrency(result.annualSavings),
          'payback = investimento / economia_anual = ' + formatCurrency(form.investmentDefault) + ' / ' + (result.annualSavings !== 0 ? formatCurrency(result.annualSavings) : '0') + ' = ' + (result.paybackYears !== null ? formatNumber(result.paybackYears) + ' anos' : 'N/A'),
          'reducao_emissoes_percentual = ' + formatPercent(result.emissionReduction)
        ].join('\n')) + '</pre>',
        '</section>',
        '<section>',
        '<h2>Proximos passos</h2>',
        '<ol>' + report.nextSteps.map(function (step) { return '<li>' + escapeHtml(step) + '</li>'; }).join('') + '</ol>',
        '</section>',
        '<section>',
        '<h2>Dados exportados</h2>',
        '<pre>' + escapeHtml(JSON.stringify({
          generatedAt: generatedAt,
          form: form,
          result: result,
          report: report,
          activeLayers: activeLayers
        }, null, 2)) + '</pre>',
        '</section>',
        '<section class="note">',
        '<p><strong>Premissas simplificadas:</strong> exportacao gerada a partir do prototipo do hackathon. Os fatores nao representam recomendacao tecnica final.</p>',
        '</section>',
        '</main>',
        '</body>',
        '</html>'
      ].join('');
    };

    function metricCard(label, value) {
      return '<article class="card"><strong>' + escapeHtml(label) + '</strong><span>' + escapeHtml(value) + '</span></article>';
    }

    function tableHeader(label) {
      return '<th style="padding:12px 10px;border-bottom:1px solid #dde5db;text-align:left;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#55645b;">' + escapeHtml(label) + '</th>';
    }

    function tableCell(value) {
      return '<td style="padding:12px 10px;border-bottom:1px solid #eef3ef;vertical-align:top;font-size:14px;line-height:1.45;">' + escapeHtml(value) + '</td>';
    }

    function formatCurrency(value) {
      return Number(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    }

    function formatPercent(value) {
      return (Number(value || 0) * 100).toLocaleString('pt-BR', {
        maximumFractionDigits: 0
      }) + '%';
    }

    function formatNumber(value) {
      return Number(value || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    function formatKind(value) {
      if (value === 'marker') {
        return 'Marker / cluster';
      }

      if (value === 'region') {
        return 'Poligono';
      }

      if (value === 'line') {
        return 'Linha';
      }

      return value;
    }

    function formatDate(value) {
      var date = new Date(value);
      if (isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleString('pt-BR');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  }
})();
