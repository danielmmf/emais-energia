(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .service('ViabilityService', ViabilityService);

  function ViabilityService() {
    this.calculate = function calculate(input, assumptions) {
      var routeKey = normalizeKey(input.recommendedRoute);
      var route = assumptions[routeKey] || assumptions.biometano;

      var currentAnnualCost = Number(input.monthlyCostDefault || 0) * 12;
      var greenAnnualCost = currentAnnualCost * Number(route.costFactor || 1);
      var annualSavings = currentAnnualCost - greenAnnualCost;
      var paybackYears = annualSavings > 0 ? Number(input.investmentDefault || 0) / annualSavings : null;

      return {
        routeKey: routeKey,
        route: route,
        currentAnnualCost: currentAnnualCost,
        greenAnnualCost: greenAnnualCost,
        annualSavings: annualSavings,
        paybackYears: paybackYears,
        emissionReduction: Number(route.emissionReduction || 0)
      };
    };

    function normalizeKey(value) {
      return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_');
    }
  }
})();
