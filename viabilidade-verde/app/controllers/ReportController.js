(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .controller('ReportController', ReportController);

  ReportController.$inject = ['ViabilityService', '$scope'];

  function ReportController(ViabilityService, $scope) {
    var vm = this;

    // Report state
    vm.report = {
      showReport: false,
      loading: false,
      error: null,
      data: null
    };

    // Format helper methods
    vm.asCurrency = function (value) {
      return 'R$ ' + (value || 0).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    };

    vm.asPercentage = function (value) {
      return (value || 0) * 100 + '%';
    };

    // Generate report from simulation data
    vm.generateReport = function (simulationData) {
      vm.report.loading = true;
      vm.report.error = null;

      try {
        if (!simulationData) {
          throw new Error('Nenhum dado de simulação disponível para gerar relatório.');
        }

        // Create comprehensive report
        vm.report.data = {
          // Basic info (would normally come from context/selection)
          region: simulationData.input.setor || 'Não informada',
          setor: simulationData.input.fonteAtual || 'Não informado',
          currentSource: simulationData.input.fonteAtual || 'Não informado',
          recommendedRoute: simulationData.input.rotaVerde || 'Não informado',

          // Metrics from simulation
          metrics: {
            currentAnnualCost: simulationData.currentAnnualCost,
            greenAnnualCost: simulationData.greenAnnualCost,
            annualSavings: simulationData.annualSavings,
            paybackYears: simulationData.paybackYears,
            emissionReduction: simulationData.emissionReduction,
            classificacao: simulationData.classificacao
          },

          // Summary and recommendations
          summary: vm.generateSummary(simulationData),
          nextSteps: vm.generateNextSteps(simulationData)
        };

        vm.report.showReport = true;
      } catch (e) {
        vm.report.error = 'Erro ao gerar relatório: ' + e.message;
        console.error('Report generation error:', e);
      } finally {
        vm.report.loading = false;
      }
    };

    // Generate summary text based on simulation results
    vm.generateSummary = function (data) {
      var savings = data.annualSavings;
      var payback = data.paybackYears;
      var emissionReduc = data.emissionReduction * 100;

      var summary = 'A análise indica que a transição para a rota ';
      summary += data.input.rotaVerde.toLowerCase() + ' resultaria em ';
      
      if (savings > 0) {
        summary += 'uma economia anual de ' + vm.asCurrency(savings) + '. ';
      } else {
        summary += 'um custo adicional anual de ' + vm.asCurrency(Math.abs(savings)) + '. ';
      }

      if (payback !== null) {
        summary += 'O payback seria de ' + payback.toFixed(2) + ' anos. ';
      } else {
        summary += 'Não há payback aplicável devido à falta de economia anual positiva. ';
      }

      summary += 'A redução estimada de emissões é de ' + vm.asPercentage(emissionReduc) + '. ';

      switch (data.classificacao.nivel) {
        case 'Alta':
          summary += 'A viabilidade é ALTA, indicando excelente retorno financeiro.';
          break;
        case 'Média':
          summary += 'A viabilidade é MÉDIA, indicando bom retorno financeiro.';
          break;
        case 'Baixa':
          summary += 'A viabilidade é BAIXA, sugerindo que outros fatores devem ser considerados.';
          break;
        case 'Estratégica':
          summary += 'A viabilidade é ESTRATÉGICA, indicando que, apesar do payback mais longo, há benefícios estratégicos importantes.';
          break;
        case 'Não recomendada':
          summary += 'A viabilidade é NÃO RECOMENDADA, indicando que o investimento não se justifica financeiramente.';
          break;
      }

      return summary;
    };

    // Generate next steps based on simulation results
    vm.generateNextSteps = function (data) {
      var steps = [];

      // Always recommend consulting specialists
      steps.push('Consultar especialistas em energia renovável para validação técnica detalhada.');

      if (data.classificacao.nivel === 'Não recomendada') {
        steps.push('Reavaliar as premissas da simulação com diferentes cenários de preço e investimento.');
        steps.push('Considerar fontes de financiamento ou incentivos governamentais disponíveis.');
      } else if (data.classificacao.nivel === 'Baixa' || data.classificacao.nivel === 'Estratégica') {
        steps.push('Realizar análise de sensibilidade para entender o impacto de variações nos preços da energia.');
        steps.push('Investigar possíveis parcerias ou modelos de negócio inovadores.');
      } else { // Alta or Média
        steps.push('Iniciar processo de licenciamento e aprovação regulatória necessária.');
        steps.push('Desenvolver plano detalhado de implementação com cronograma e marcos.');
        steps.push('Buscar financiamento através de bancos, investidores ou linhas de crédito especializadas.');
      }

      // Add monitoring recommendation
      steps.push('Estabelecer métricas de acompanhamento pós-implementação para validar os resultados esperados.');

      return steps;
    };

    // Method to be called from outside (e.g., from SimulationController)
    vm.setSimulationData = function (data) {
      vm.generateReport(data);
    };
  }
})();