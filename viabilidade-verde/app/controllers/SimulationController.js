(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .controller('SimulationController', SimulationController);

  SimulationController.$inject = ['ViabilityService', '$scope'];

  function SimulationController(ViabilityService, $scope) {
    var vm = this;

    // Form state
    vm.form = {
      setor: '',
      fonteAtual: '',
      gastoMensal: '',
      rotaVerde: '',
      investimento: '',
      submitted: false,
      loading: false,
      result: null,
      error: null
    };

    // Available options (would normally come from Firebase/local storage)
    vm.options = {
      setores: [
        'Agroindústria',
        'Fertilizantes',
        'Indústria',
        'Transporte',
        'Geração de Energia'
      ],
      fontesPorSetor: {
        'Agroindústria': ['Gás Natural', 'Biomassa', 'Carvão'],
        'Fertilizantes': ['Gás Natural', 'Nafta', 'Carvão'],
        'Indústria': ['Gás Natural', 'Óleo Diesel', 'Eletricidade'],
        'Transporte': ['Diesel', 'Gás Natural', 'Eletricidade'],
        'Geração de Energia': ['Carvão', 'Gás Natural', 'Óleo Combustível']
      },
      rotasVerdePorFonte: {
        'Gás Natural': ['Biometano', 'Hidrogênio Verde'],
        'Biomassa': ['Biogás', 'Etanol Celulósico'],
        'Carvão': ['Biomassa', 'Gás Natural'],
        'Nafta': ['Etanol', 'Biocombustíveis Avançados'],
        'Óleo Diesel': ['Biodiesel', 'HVO (Diesel Renovável)'],
        'Eletricidade': ['Solar', 'Eólica', 'Hídrica'],
        'Diesel': ['Biodiesel', 'HVO'],
        'Gás Natural': ['Biometano', 'Hidrogênio Verde'],
        'Carvão': ['Biomassa', 'Gás Natural'],
        'Óleo Combustível': ['Biocombustível', 'Gás Natural']
      }
    };

    // Initialize form
    vm.resetForm = function () {
      vm.form = {
        setor: '',
        fonteAtual: '',
        gastoMensal: '',
        rotaVerde: '',
        investimento: '',
        submitted: false,
        loading: false,
        result: null,
        error: null
      };
      vm.fonteAtualOptions = [];
      vm.rotaVerdeOptions = [];
    };

    // Watch for setor changes to update fonteAtual options
    $scope.$watch(function () { return vm.form.setor; }, function (newVal, oldVal) {
      if (newVal !== oldVal) {
        vm.form.fonteAtual = '';
        vm.form.rotaVerde = '';
        vm.fonteAtualOptions = vm.options.fontesPorSetor[newVal] || [];
        vm.rotaVerdeOptions = [];
      }
    });

    // Watch for fonteAtual changes to update rotaVerde options
    $scope.$watch(function () { return vm.form.fonteAtual; }, function (newVal, oldVal) {
      if (newVal !== oldVal) {
        vm.form.rotaVerde = '';
        vm.rotaVerdeOptions = vm.options.rotasVerdePorFonte[newVal] || [];
      }
    });

    // Submit form and run simulation
    vm.submitSimulation = function () {
      vm.form.submitted = true;
      vm.form.error = null;

      // Validate form
      if (!vm.form.setor || !vm.form.fonteAtual || !vm.form.gastoMensal || 
          !vm.form.rotaVerde || !vm.form.investimento) {
        vm.form.error = 'Por favor, preencha todos os campos obrigatórios.';
        return;
      }

      // Validate numeric fields
      var gastoMensalNum = parseFloat(vm.form.gastoMensal);
      var investimentoNum = parseFloat(vm.form.investimento);

      if (isNaN(gastoMensalNum) || gastoMensalNum <= 0) {
        vm.form.error = 'O gasto mensal deve ser um número positivo.';
        return;
      }

      if (isNaN(investimentoNum) || investimentoNum < 0) {
        vm.form.error = 'O investimento deve ser um número não negativo.';
        return;
      }

      // Start loading
      vm.form.loading = true;
      vm.form.result = null;

      // Prepare input for ViabilityService
      var input = {
        monthlyCostDefault: gastoMensalNum,
        investmentDefault: investimentoNum,
        recommendedRoute: vm.form.rotaVerde
      };

      // Run simulation
      try {
        vm.form.result = ViabilityService.calculateViabilidade(input, {});
        
        // Add input data to result for display
        vm.form.result.input = {
          setor: vm.form.setor,
          fonteAtual: vm.form.fonteAtual,
          gastoMensal: gastoMensalNum,
          rotaVerde: vm.form.rotaVerde,
          investimento: investimentoNum
        };
        
        // Add classification based on payback
        vm.form.result.classificacao = vm.getClassificacao(vm.form.result.paybackYears);
      } catch (e) {
        vm.form.error = 'Erro ao executar simulação: ' + e.message;
        console.error('Simulation error:', e);
      } finally {
        vm.form.loading = false;
      }
    };

    // Get classification based on payback period
    vm.getClassificacao = function (paybackYears) {
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

    // Reset form on initialization
    vm.resetForm();
  }
})();