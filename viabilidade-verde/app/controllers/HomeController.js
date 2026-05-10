(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .controller('HomeController', HomeController);

   HomeController.$inject = ['$q', '$scope', '$timeout', 'FirebaseDataService', 'MapDataService', 'ViabilityService', 'RecommendationService', 'ReportService'];
   var LAST_MAP_CENTER_KEY = 'vv.lastMapCenter';
   var FEEDBACK_PASSWORD = 'baconpedacudo';

   function HomeController($q, $scope, $timeout, FirebaseDataService, MapDataService, ViabilityService, RecommendationService, ReportService) {
     var vm = this;

     vm.loading = true;
     vm.error = null;
     vm.opportunities = [];
     vm.opportunitiesById = {};
     vm.regions = null;
     vm.infrastructure = null;
     vm.regionIndex = {};
     vm.assumptions = {};
     vm.availableRoutes = [];
     vm.selectedOpportunity = null;
     vm.selectedRegion = null;
     vm.result = null;
     vm.report = null;
     vm.firebaseEnabled = false;
     vm.simulationReady = false;
     vm.layerToolbarCollapsed = false;

     vm.layerToggles = {
       industrias: { label: 'Industrias', visible: true },
       biometano: { label: 'Biometano', visible: true },
       hidrogenio: { label: 'Hidrogenio', visible: true },
       portos: { label: 'Portos', visible: true },
       fertilizantes: { label: 'Fertilizantes', visible: true },
       saf: { label: 'SAF', visible: true },
       energia_renovavel: { label: 'Energia renovavel', visible: true },
       infrastructure: { label: 'Infraestrutura', visible: true },
       regions: { label: 'Regioes prioritarias', visible: true }
     };

     vm.toggleLayerToolbar = function() {
       vm.layerToolbarCollapsed = !vm.layerToolbarCollapsed;
     };

      // Feedback Modal
      vm.feedbackModal = {
        visible: false,
        step: 'profile',
        password: '',
        passwordError: false,
        selectedProfile: null,
        mentor: {
          type: '',
          inputMode: '',
          feedbackText: ''
        },
        gang: {
          type: '',
          priority: '',
          message: ''
        },
        xereta: {
          opinion: ''
        }
      };
     };

     // Feedback Methods
     vm.openFeedbackModal = openFeedbackModal;
     vm.closeFeedbackModal = closeFeedbackModal;
     vm.selectProfile = selectProfile;
     vm.checkPassword = checkPassword;
     vm.setMentorType = setMentorType;
     vm.setMentorInputMode = setMentorInputMode;
     vm.sendMentorFeedback = sendMentorFeedback;
     vm.setGangType = setGangType;
     vm.setGangPriority = setGangPriority;
     vm.sendGangFeedback = sendGangFeedback;
     vm.setXeretaOpinion = setXeretaOpinion;

    vm.map = {
      center: {
        lat: -14.235,
        lng: -51.9253,
        zoom: 4
      },
      defaults: {
        scrollWheelZoom: true,
        zoomControl: true,
        minZoom: 3,
        maxZoom: 13
      },
      layers: MapDataService.buildMapLayers(),
      markers: {},
      paths: {},
      events: {
        markers: {
          enable: ['click'],
          logic: 'emit'
        },
        paths: {
          enable: ['click'],
          logic: 'emit'
        }
      }
    };

    vm.form = {
      region: '',
      sector: '',
      currentSource: '',
      recommendedRoute: '',
      monthlyCostDefault: 0,
      investmentDefault: 0
    };

    vm.toggleLayer = toggleLayer;
    vm.selectOpportunity = selectOpportunity;
    vm.startSimulation = startSimulation;
    vm.calculate = calculate;
    vm.asCurrency = asCurrency;

    activate();

    function activate() {
      vm.firebaseEnabled = FirebaseDataService.isFirebaseEnabled();
      restoreLastMapCenter();
      bindMapEvents();

      $q.all([
        FirebaseDataService.getOpportunities(),
        FirebaseDataService.getAssumptions(),
        FirebaseDataService.getRegions(),
        FirebaseDataService.getInfrastructure()
      ]).then(function (response) {
        vm.opportunities = response[0] || [];
        vm.assumptions = response[1] || {};
        vm.regions = response[2] || { type: 'FeatureCollection', features: [] };
        vm.infrastructure = response[3] || { type: 'FeatureCollection', features: [] };
        vm.regionIndex = MapDataService.buildRegionIndex(vm.regions);

          vm.opportunitiesById = {};
          vm.opportunities.forEach(function (opportunity) {
            vm.opportunitiesById[opportunity.id] = opportunity;
          });

    function bindMapEvents() {
      $scope.$on('leafletDirectiveMarker.click', function (event, args) {
        var markerId = args && (args.modelName || args.markerName);
        var item = vm.opportunitiesById[markerId];

        if (item) {
          $scope.$applyAsync(function () {
            selectOpportunity(item);
          });
        }
      });

      $scope.$on('leafletDirectivePath.click', function (event, args) {
        var pathId = args && args.modelName;
        var regionFeature = pathId ? vm.regionIndex[pathId] : null;

        if (regionFeature) {
          $scope.$applyAsync(function () {
            selectRegion(regionFeature);
          });
      }
    });
  }

  activate();
});
