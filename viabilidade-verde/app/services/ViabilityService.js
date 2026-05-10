(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .service('ViabilityService', ViabilityService);

  ViabilityService.$inject = ['FirebaseDataService', '$q'];

  function ViabilityService(FirebaseDataService, $q) {
    this.calculate = calculate;
    this.calculateViabilidade = calculateViabilidade;
    this.getDefaultAssumptions = getDefaultAssumptions;
    this.saveSimulacao = saveSimulacao;
    this.loadSimulacoes = loadSimulacoes;
    this.getCurrentResult = getCurrentResult;

    function calculate(input, assumptions, options) {
      var normalizedAssumptions = assumptions || {};
      var routeKey = normalizeRouteKey(input && input.recommendedRoute);
      var route = normalizedAssumptions[routeKey] || normalizedAssumptions.biometano || fallbackRoute();

      var currentAnnualCost = Number(input && input.monthlyCostDefault || 0) * 12;
      var greenAnnualCost = currentAnnualCost * Number(route.costFactor || 1);
      var annualSavings = currentAnnualCost - greenAnnualCost;
      var investment = Number(input && input.investmentDefault || 0);
      var regulatoryFactor = options && options.regulatoryFactor;

      if (regulatoryFactor === 'incentivo_favoravel') {
        investment = investment * 0.9;
      } else if (regulatoryFactor === 'barreira_regulatoria') {
        investment = investment * 1.15;
      }

      var paybackYears = annualSavings > 0 ? investment / annualSavings : null;
      var reliability = computeReliability(input, regulatoryFactor);

      return {
        routeKey: routeKey,
        route: route,
        currentAnnualCost: currentAnnualCost,
        greenAnnualCost: greenAnnualCost,
        annualSavings: annualSavings,
        paybackYears: paybackYears,
        emissionReduction: Number(route.emissionReduction || 0),
        reliability: reliability,
        regulatoryFactor: regulatoryFactor,
        adjustedInvestment: investment
      };
    }

    function calculateViabilidade(input, assumptions) {
      var normalizedInput = {
        monthlyCostDefault: Number(input && input.monthlyCostDefault || 0),
        investmentDefault: Number(input && input.investmentDefault || 0),
        recommendedRoute: input && input.recommendedRoute || ''
      };

      var result = calculate(normalizedInput, assumptions || defaultAssumptions());
      var classificacao = classifyDetailed(result);

      return {
        monthlyCost: normalizedInput.monthlyCostDefault,
        annualInvestment: normalizedInput.investmentDefault,
        routeKey: result.routeKey,
        currentAnnualCost: result.currentAnnualCost,
        greenAnnualCost: result.greenAnnualCost,
        annualSavings: result.annualSavings,
        paybackYears: result.paybackYears,
        emissionReduction: result.emissionReduction,
        classificacao: classificacao,
        roi: normalizedInput.investmentDefault > 0 && result.annualSavings > 0
          ? (result.annualSavings * 100) / normalizedInput.investmentDefault
          : 0,
        annualCostDifference: Math.abs(result.annualSavings),
        route: result.route
      };
    }

    function saveSimulacao(simulationData) {
      var simulationToSave = angular.extend({}, simulationData, {
        timestamp: new Date().toISOString(),
        version: '1.0'
      });

      return FirebaseDataService.saveSimulation(simulationToSave);
    }

    function loadSimulacoes() {
      return $q.resolve([]);
    }

    function getCurrentResult() {
      return null;
    }

    function getDefaultAssumptions() {
      return angular.copy(defaultAssumptions());
    }

    function classifyDetailed(result) {
      if (result.annualSavings < 0 && result.emissionReduction < 0.25) {
        return {
          nivel: 'Nao recomendada',
          descricao: 'Economia anual negativa e baixa reducao de emissoes.',
          cor: '#dc3545'
        };
      }

      if (result.annualSavings < 0 && result.emissionReduction >= 0.5) {
        return {
          nivel: 'Estrategica',
          descricao: 'Custo verde maior, mas com reducao de emissoes relevante.',
          cor: '#1565c0'
        };
      }

      if (result.paybackYears !== null && result.paybackYears <= 3 && result.emissionReduction > 0.25) {
        return {
          nivel: 'Alta',
          descricao: 'Boa atratividade economica e retorno rapido.',
          cor: '#2e7d32'
        };
      }

      if (result.paybackYears !== null && result.paybackYears > 3 && result.paybackYears <= 6) {
        return {
          nivel: 'Media',
          descricao: 'Retorno moderado com viabilidade razoavel.',
          cor: '#f9a825'
        };
      }

      if (result.paybackYears !== null && result.paybackYears > 6) {
        return {
          nivel: 'Baixa',
          descricao: 'Payback elevado para o cenario atual.',
          cor: '#ef6c00'
        };
      }

      return {
        nivel: 'Estrategica',
        descricao: 'Cenario exige avaliacao complementar.',
        cor: '#1565c0'
      };
    }

    function normalizeRouteKey(value) {
      return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_');
    }

    function computeReliability(input, regulatoryFactor) {
      var base = 'mockado';
      var confidence = 'Baixa';
      var factors = [
        'CAPEX', 'OPEX', 'tarifa de energia', 'preco do gas/diesel',
        'custo de conexao', 'custo de adaptacao tecnica', 'incentivos fiscais',
        'subsidios', 'regulacao setorial', 'contratos de fornecimento',
        'disponibilidade regional', 'licenciamento', 'certificacoes',
        'creditos de carbono', 'volatilidade de preco'
      ];
      var alertLevel = 'Nenhuma';

      if (input && input.investmentDefault > 0 && input.monthlyCostDefault > 0) {
        base = 'premissa_usuario';
        confidence = 'Media';
      }

      if (regulatoryFactor === 'incentivo_favoravel') {
        alertLevel = 'Incentivo favoravel identificado';
      } else if (regulatoryFactor === 'barreira_regulatoria') {
        alertLevel = 'Barreira regulatoria pode impactar o payback';
        confidence = 'Baixa';
      } else if (regulatoryFactor === 'informacao_insuficiente') {
        alertLevel = 'Informacao regulatoria insuficiente';
        confidence = 'Baixa';
      } else {
        alertLevel = 'Regulacao nao avaliada detalhadamente';
      }

      return {
        level: confidence,
        base: base,
        baseLabel: base === 'mockado' ? 'Mockado / premissa de prototipo' : 'Estimativa baseada em dados declarados pelo usuario',
        factors: factors,
        alertLevel: alertLevel
      };
    }

    function fallbackRoute() {
      return {
        label: 'Biometano',
        costFactor: 0.68,
        emissionReduction: 0.5,
        risk: 'Medio'
      };
    }

    function defaultAssumptions() {
      return {
        biometano: {
          label: 'Biometano',
          costFactor: 0.68,
          emissionReduction: 0.5,
          risk: 'Medio'
        },
        eletrificacao: {
          label: 'Eletrificacao',
          costFactor: 0.78,
          emissionReduction: 0.35,
          risk: 'Medio'
        },
        energia_renovavel_contratada: {
          label: 'Energia renovavel contratada',
          costFactor: 0.82,
          emissionReduction: 0.25,
          risk: 'Baixo'
        },
        biomassa: {
          label: 'Biomassa',
          costFactor: 0.72,
          emissionReduction: 0.45,
          risk: 'Medio'
        },
        hidrogenio_de_baixa_emissao: {
          label: 'Hidrogenio de baixa emissao',
          costFactor: 1.15,
          emissionReduction: 0.65,
          risk: 'Alto'
        },
        saf: {
          label: 'SAF',
          costFactor: 1.25,
          emissionReduction: 0.6,
          risk: 'Alto'
        }
      };
    }
  }
})();
