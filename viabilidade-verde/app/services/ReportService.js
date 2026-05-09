(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .service('ReportService', ReportService);

  function ReportService() {
    this.build = function build(form, result) {
      return {
        generatedAt: new Date().toISOString(),
        region: form.region,
        sector: form.sector,
        currentSource: form.currentSource,
        recommendedRoute: form.recommendedRoute,
        summary: 'A analise indica viabilidade ' + result.classification.toLowerCase() +
          ' para avaliacao da transicao energetica neste cenario.',
        metrics: {
          currentAnnualCost: result.currentAnnualCost,
          greenAnnualCost: result.greenAnnualCost,
          annualSavings: result.annualSavings,
          paybackYears: result.paybackYears,
          emissionReduction: result.emissionReduction,
          classification: result.classification
        },
        nextSteps: [
          'Validar oferta regional da rota verde selecionada.',
          'Mapear fornecedores e modelos de contrato.',
          'Avaliar adaptacao tecnica dos equipamentos.',
          'Estruturar plano de transicao em fases.'
        ]
      };
    };
  }
})();
