(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$q', 'FirebaseDataService', 'MapDataService', 'ViabilityService', 'RecommendationService', 'ReportService'];

  function HomeController($q, FirebaseDataService, MapDataService, ViabilityService, RecommendationService, ReportService) {
    var vm = this;

    vm.loading = true;
    vm.error = null;
    vm.opportunities = [];
    vm.assumptions = {};
    vm.availableRoutes = [];
    vm.selectedOpportunity = null;
    vm.result = null;
    vm.report = null;
    vm.firebaseEnabled = false;

    vm.map = {
      center: {
        lat: -14.235,
        lng: -51.9253,
        zoom: 4
      },
      defaults: {
        scrollWheelZoom: true
      },
      markers: {}
    };

    vm.form = {
      region: '',
      sector: '',
      currentSource: '',
      recommendedRoute: '',
      monthlyCostDefault: 0,
      investmentDefault: 0
    };

    vm.selectOpportunity = selectOpportunity;
    vm.calculate = calculate;
    vm.asCurrency = asCurrency;

    activate();

    function activate() {
      vm.firebaseEnabled = FirebaseDataService.isFirebaseEnabled();

      $q.all([
        FirebaseDataService.getOpportunities(),
        FirebaseDataService.getAssumptions()
      ]).then(function (response) {
        vm.opportunities = response[0] || [];
        vm.assumptions = response[1] || {};
        vm.availableRoutes = Object.keys(vm.assumptions).map(function (key) {
          return vm.assumptions[key].label;
        });

        vm.map.markers = MapDataService.buildMarkers(vm.opportunities);

        if (vm.opportunities.length > 0) {
          selectOpportunity(vm.opportunities[0]);
        }
      }).catch(function (err) {
        vm.error = 'Falha ao carregar dados: ' + (err && err.message ? err.message : 'erro desconhecido');
      }).finally(function () {
        vm.loading = false;
      });
    }

    function selectOpportunity(item) {
      vm.selectedOpportunity = item;
      vm.form.region = item.region;
      vm.form.sector = item.sector;
      vm.form.currentSource = item.currentSource;
      vm.form.recommendedRoute = item.recommendedRoute;
      vm.form.monthlyCostDefault = item.monthlyCostDefault;
      vm.form.investmentDefault = item.investmentDefault;

      if (vm.map.markers[item.id]) {
        vm.map.center.lat = item.lat;
        vm.map.center.lng = item.lng;
        vm.map.center.zoom = 6;
      }
    }

    function calculate() {
      var computed = ViabilityService.calculate(vm.form, vm.assumptions);
      computed.classification = RecommendationService.classify(computed);
      computed.recommendation = RecommendationService.buildRecommendation(computed, vm.form);
      vm.result = computed;
      vm.report = ReportService.build(vm.form, vm.result);

      FirebaseDataService.saveSimulation({
        createdAt: new Date().toISOString(),
        source: vm.selectedOpportunity ? vm.selectedOpportunity.id : null,
        form: angular.copy(vm.form),
        result: angular.copy(vm.result)
      });
    }

    function asCurrency(value) {
      return Number(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    }
  }
})();
