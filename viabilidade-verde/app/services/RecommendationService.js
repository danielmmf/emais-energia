(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .service('RecommendationService', RecommendationService);

  function RecommendationService() {
    this.classify = function classify(result) {
      if (result.annualSavings < 0 && result.emissionReduction < 0.25) {
        return 'Nao recomendada no cenario atual';
      }

      if (result.annualSavings < 0 && result.emissionReduction >= 0.5) {
        return 'Estrategica';
      }

      if (result.paybackYears !== null && result.paybackYears <= 3 && result.emissionReduction > 0.25) {
        return 'Alta';
      }

      if (result.paybackYears !== null && result.paybackYears > 3 && result.paybackYears <= 6) {
        return 'Media';
      }

      if (result.paybackYears !== null && result.paybackYears > 6) {
        return 'Baixa';
      }

      return 'Estrategica';
    };

    this.buildRecommendation = function buildRecommendation(result, form) {
      var paybackLabel = result.paybackYears === null ? 'N/A' : result.paybackYears.toFixed(2) + ' anos';
      var reductionLabel = (result.emissionReduction * 100).toFixed(0) + '%';

      return 'Viabilidade ' + result.classification + ': para ' + form.region +
        ', a rota ' + form.recommendedRoute + ' apresenta economia anual estimada de R$ ' +
        formatCurrency(result.annualSavings) + ', payback de ' + paybackLabel +
        ' e reducao de emissoes de ' + reductionLabel + '.';
    };

    function formatCurrency(value) {
      return Number(value || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  }
})();
