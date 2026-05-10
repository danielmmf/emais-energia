(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .service('ViabilityService', ViabilityService);

  ViabilityService.$inject = ['FirebaseDataService', '$q'];

  function ViabilityService(FirebaseDataService, $q) {
    // Mock factors for different routes (as specified in requirements)
    // These would normally come from Firebase or local storage
    this.routeFactors = {
      biometano: { costFactor: 0.7, emissionReduction: 0.6 },
      hidrogenio: { costFactor: 0.8, emissionReduction: 0.9 },
      eletricidade: { costFactor: 0.6, emissionReduction: 0.8 },
      SAF: { costFactor: 1.2, emissionReduction: 0.5 } // SAF might be more expensive initially
    };

    /**
     * Calculate annual current cost
     * @param {number} monthlyCost - Monthly cost in R$
     * @returns {number} Annual cost in R$
     */
    this.calculateCustoAnual = function (monthlyCost) {
      return Number(monthlyCost || 0) * 12;
    };

    /**
     * Calculate annual green cost based on route factor
     * @param {number} monthlyCost - Monthly cost in R$
     * @param {string} routeKey - Route identifier (e.g., 'biometano')
     * @returns {number} Annual green cost in R$
     */
    this.calculateCustoVerdeAnual = function (monthlyCost, routeKey) {
      var route = this.routeFactors[routeKey] || this.routeFactors.biometano; // Default to biometano
      return this.calculateCustoAnual(monthlyCost) * Number(route.costFactor || 1);
    };

    /**
     * Calculate annual savings
     * @param {number} currentAnnualCost - Annual current cost
     * @param {number} greenAnnualCost - Annual green cost
     * @returns {number} Annual savings (can be negative)
     */
    this.calculateEconomiaAnual = function (currentAnnualCost, greenAnnualCost) {
      return Number(currentAnnualCost || 0) - Number(greenAnnualCost || 0);
    };

    /**
     * Calculate payback period in years
     * @param {number} investment - Investment amount in R$
     * @param {number} annualSavings - Annual savings in R$
     * @returns {number|null} Payback period in years or null if not applicable
     */
    this.calculatePayback = function (investment, annualSavings) {
      var invest = Number(investment || 0);
      var savings = Number(annualSavings || 0);
      
      // Payback only applicable when savings are positive
      if (savings > 0) {
        return invest / savings;
      }
      return null; // Not applicable (negative or zero savings)
    };

    /**
     * Estimate emission reduction based on route factor
     * @param {number} monthlyCost - Monthly cost in R$
     * @param {string} routeKey - Route identifier
     * @returns {number} Estimated emission reduction percentage
     */
    this.calculateReducaoEmissoes = function (monthlyCost, routeKey) {
      var route = this.routeFactors[routeKey] || this.routeFactors.biometano;
      return Number(route.emissionReduction || 0);
    };

    /**
     * Classify viability based on payback period and strategic value
     * @param {number|null} paybackYears - Payback period in years or null
     * @returns {Object} Classification with level, description, and color
     */
    this.classifyViabilidade = function (paybackYears) {
      if (paybackYears === null) {
        return {
          nivel: 'Não recomendada',
          descricao: 'Economia anual não positiva - investimento não se paga',
          cor: '#dc3545' // red
        };
      }

      if (paybackYears <= 2) {
        return {
          nivel: 'Alta',
          descricao: 'Payback rápido - excelente retorno financeiro',
          cor: '#28a745' // green
        };
      } else if (paybackYears <= 4) {
        return {
          nivel: 'Média',
          descricao: 'Payback moderado - bom retorno financeiro',
          cor: '#ffc107' // yellow
        };
      } else if (paybackYears <= 6) {
        return {
          nivel: 'Baixa',
          descricao: 'Payback longo - considerar outros fatores',
          cor: '#fd7e14' // orange
        };
      } else {
        // Payback > 6 anos - check for strategic benefits
        // For now, we'll classify as Estratégica if payback <= 10 years
        if (paybackYears <= 10) {
          return {
            nivel: 'Estratégica',
            descricao: 'Payback longo, mas com benefícios estratégicos importantes',
            cor: '#6f42c1' // purple
          };
        } else {
          return {
            nivel: 'Não recomendada',
            descricao: 'Payback muito longo - investimento não recomendado',
            cor: '#dc3545' // red
          };
        }
      }
    };

    /**
     * Main method to calculate all viability metrics
     * @param {Object} input - User inputs (monthlyCost, investment, recommendedRoute)
     * @param {Object} assumptions - Route assumptions with factors
     * @returns {Object} Complete viability calculation results
     */
    this.calculateViabilidade = function (input, assumptions) {
      // Override route factors with provided assumptions if available
      if (assumptions) {
        this.routeFactors = assumptions;
      }

      var monthlyCost = Number(input.monthlyCostDefault || 0);
      var investment = Number(input.investmentDefault || 0);
      var routeKey = input.recommendedRoute ? 
                      String(input.recommendedRoute || '').toLowerCase().replace(/\s+/g, '_') : 
                      'biometano'; // Default route

      var currentAnnualCost = this.calculateCustoAnual(monthlyCost);
      var greenAnnualCost = this.calculateCustoVerdeAnual(monthlyCost, routeKey);
      var annualSavings = this.calculateEconomiaAnual(currentAnnualCost, greenAnnualCost);
      var paybackYears = this.calculatePayback(investment, annualSavings);
      var emissionReduction = this.calculateReducaoEmissoes(monthlyCost, routeKey);
      var classificacao = this.classifyViabilidade(paybackYears);

      return {
        monthlyCost: monthlyCost,
        annualInvestment: investment,
        routeKey: routeKey,
        currentAnnualCost: currentAnnualCost,
        greenAnnualCost: greenAnnualCost,
        annualSavings: annualSavings,
        paybackYears: paybackYears,
        emissionReduction: emissionReduction,
        classificacao: classificacao,
        // Additional derived values
        roi: annualSavings > 0 ? (annualSavings * 100) / investment : 0,
        annualCostDifference: Math.abs(annualSavings)
      };
    };

    /**
     * Save a simulation result with Firebase primary and localStorage fallback
     * @param {Object} simulationData - Simulation data to save
     * @returns {Promise} Promise that resolves when saved
     */
    this.saveSimulacao = function (simulationData) {
      // Add timestamp and metadata
      var simulationToSave = angular.extend({}, simulationData, {
        timestamp: new Date().toISOString(),
        version: '1.0'
      });

      // Use FirebaseDataService for resilient storage
      return FirebaseDataService.saveSimulation(simulationToSave);
    };

    /**
     * Load saved simulations
     * @returns {Promise} Promise that resolves with array of simulations
     */
    this.loadSimulacoes = function () {
      // This would typically load from Firebase or localStorage
      // For now, we'll return an empty array as the FirebaseDataService
      // doesn't have a direct loadAll method, but we can extend it if needed
      return $q.resolve([]);
    };

    /**
     * Getter for current simulation result (for use by ReportController)
     * In a full implementation, this would retrieve from storage
     * For now, we'll return null as results should be passed directly
     * @returns {null} Placeholder - results should be passed via scope or service
     */
    this.getCurrentResult = function () {
      // This would typically retrieve from localStorage or Firebase
      // For MVP, we expect results to be passed directly between controllers
      return null;
    };
  }
})();