(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$q', '$scope', '$timeout', 'FirebaseDataService', 'MapDataService', 'ViabilityService', 'RecommendationService', 'ReportService'];
  var LAST_MAP_CENTER_KEY = 'vv.lastMapCenter';
  var LOCAL_FEEDBACK_QUEUE_KEY = 'vv.feedbackQueue';
  var FEEDBACK_PASSWORD = 'baconpedacudo';

  function HomeController($q, $scope, $timeout, FirebaseDataService, MapDataService, ViabilityService, RecommendationService, ReportService) {
    var vm = this;

    vm.loading = true;
    vm.error = null;
    vm.opportunities = [];
    vm.opportunitiesById = {};
    vm.opportunitiesByMarkerKey = {};
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

    vm.feedbackModal = buildDefaultFeedbackState();

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

    vm.toggleLayerToolbar = toggleLayerToolbar;
    vm.toggleLayer = toggleLayer;
    vm.selectOpportunity = selectOpportunity;
    vm.startSimulation = startSimulation;
    vm.calculate = calculate;
    vm.asCurrency = asCurrency;
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
        vm.opportunitiesByMarkerKey = {};
        vm.opportunities.forEach(function (opportunity, index) {
          opportunity._mapKey = MapDataService.buildMarkerKey(opportunity.id, index);
          vm.opportunitiesById[opportunity.id] = opportunity;
          vm.opportunitiesByMarkerKey[opportunity._mapKey] = opportunity;
        });

        vm.availableRoutes = Object.keys(vm.assumptions).map(function (key) {
          return vm.assumptions[key].label;
        });

        refreshMapData();
        flushQueuedFeedback();
      }).catch(function (err) {
        vm.error = 'Falha ao carregar dados: ' + (err && err.message ? err.message : 'erro desconhecido');
      }).finally(function () {
        vm.loading = false;
        FirebaseDataService.retryPendingSimulations();
      });
    }

    function bindMapEvents() {
      $scope.$on('leafletDirectiveMarker.click', function (event, args) {
        var markerId = args && (args.modelName || args.markerName);
        var item = vm.opportunitiesByMarkerKey[markerId] || vm.opportunitiesById[markerId];

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

    function refreshMapData() {
      var visibleLayers = getVisibleLayerState();
      vm.map.markers = MapDataService.buildMarkers(vm.opportunities, visibleLayers);
      vm.map.paths = angular.extend(
        {},
        MapDataService.buildRegionPaths(vm.regions, visibleLayers),
        MapDataService.buildInfrastructurePaths(vm.infrastructure, visibleLayers)
      );
    }

    function toggleLayerToolbar() {
      vm.layerToolbarCollapsed = !vm.layerToolbarCollapsed;
    }

    function toggleLayer(layerKey) {
      if (!vm.layerToggles[layerKey]) {
        return;
      }

      refreshMapData();
    }

    function getVisibleLayerState() {
      return {
        industrias: vm.layerToggles.industrias.visible,
        biometano: vm.layerToggles.biometano.visible,
        hidrogenio: vm.layerToggles.hidrogenio.visible,
        portos: vm.layerToggles.portos.visible,
        fertilizantes: vm.layerToggles.fertilizantes.visible,
        saf: vm.layerToggles.saf.visible,
        energia_renovavel: vm.layerToggles.energia_renovavel.visible,
        infrastructure: vm.layerToggles.infrastructure.visible,
        regions: vm.layerToggles.regions.visible
      };
    }

    function selectOpportunity(item) {
      vm.selectedOpportunity = item;
      vm.selectedRegion = findRegionByName(item.region);
      vm.simulationReady = false;
      vm.result = null;
      vm.report = null;

      vm.form.region = item.region;
      vm.form.sector = item.sector;
      vm.form.currentSource = item.currentSource;
      vm.form.recommendedRoute = item.recommendedRoute;
      vm.form.monthlyCostDefault = item.monthlyCostDefault;
      vm.form.investmentDefault = item.investmentDefault;

      vm.map.center.lat = item.lat;
      vm.map.center.lng = item.lng;
      vm.map.center.zoom = 6;
      persistLastMapCenter();
    }

    function selectRegion(feature) {
      var properties = feature.properties || {};
      var center = computeRegionCenter(feature);

      vm.selectedRegion = properties;
      vm.selectedOpportunity = null;
      vm.simulationReady = false;
      vm.result = null;
      vm.report = null;

      vm.form.region = properties.name || '';
      vm.form.sector = properties.vocacao || '';
      vm.form.currentSource = 'Gas natural';
      vm.form.recommendedRoute = properties.rotaSugerida || 'Biometano';

      if (center) {
        vm.map.center.lat = center.lat;
        vm.map.center.lng = center.lng;
        vm.map.center.zoom = 6;
        persistLastMapCenter();
      }
    }

    function startSimulation() {
      vm.simulationReady = true;
    }

    function calculate() {
      var computed = ViabilityService.calculate(vm.form, vm.assumptions);
      computed.classification = RecommendationService.classify(computed);
      computed.recommendation = RecommendationService.buildRecommendation(computed, vm.form);
      vm.result = computed;
      vm.report = ReportService.build(vm.form, vm.result);

      FirebaseDataService.saveSimulation({
        createdAt: new Date().toISOString(),
        source: vm.selectedOpportunity ? vm.selectedOpportunity.id : (vm.selectedRegion ? vm.selectedRegion.id : null),
        form: angular.copy(vm.form),
        result: angular.copy(vm.result)
      }).finally(function () {
        FirebaseDataService.retryPendingSimulations();
      });
    }

    function asCurrency(value) {
      return Number(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    }

    function openFeedbackModal() {
      vm.feedbackModal = buildDefaultFeedbackState();
      vm.feedbackModal.visible = true;
    }

    function closeFeedbackModal() {
      vm.feedbackModal = buildDefaultFeedbackState();
    }

    function selectProfile(profile) {
      vm.feedbackModal.selectedProfile = profile;
      vm.feedbackModal.password = '';
      vm.feedbackModal.passwordError = '';

      if (profile === 'xereta') {
        vm.feedbackModal.step = 'xereta';
        return;
      }

      vm.feedbackModal.step = 'password';
    }

    function checkPassword() {
      if (vm.feedbackModal.password !== FEEDBACK_PASSWORD) {
        vm.feedbackModal.passwordError = 'Senha invalida.';
        return;
      }

      vm.feedbackModal.passwordError = '';
      vm.feedbackModal.step = vm.feedbackModal.selectedProfile === 'gang' ? 'gang' : 'mentor';
    }

    function setMentorType(type) {
      vm.feedbackModal.mentor.type = type;
      vm.feedbackModal.step = 'mentor_input_mode';
    }

    function setMentorInputMode(mode) {
      vm.feedbackModal.mentor.inputMode = mode;
      vm.feedbackModal.step = 'mentor_feedback';
    }

    function sendMentorFeedback() {
      var text = String(vm.feedbackModal.mentor.feedbackText || '').trim();
      if (!text) {
        vm.feedbackModal.passwordError = 'Escreva um feedback antes de enviar.';
        return;
      }

      vm.feedbackModal.passwordError = '';
      saveFeedbackRecord({
        category: 'mentor',
        type: vm.feedbackModal.mentor.type || 'feedback',
        inputMode: vm.feedbackModal.mentor.inputMode || 'write',
        text: text
      });
    }

    function setGangType(type) {
      vm.feedbackModal.gang.type = type;
      vm.feedbackModal.step = 'gang_priority';
    }

    function setGangPriority(priority) {
      vm.feedbackModal.gang.priority = priority;
      vm.feedbackModal.step = 'gang_message';
    }

    function sendGangFeedback() {
      var text = String(vm.feedbackModal.gang.message || '').trim();
      if (!text) {
        vm.feedbackModal.passwordError = 'Descreva o feedback antes de enviar.';
        return;
      }

      vm.feedbackModal.passwordError = '';
      saveFeedbackRecord({
        category: 'gang',
        type: vm.feedbackModal.gang.type || 'other',
        priority: vm.feedbackModal.gang.priority || 'medium',
        text: text
      });
    }

    function setXeretaOpinion(opinion) {
      vm.feedbackModal.xereta.opinion = opinion;
      saveFeedbackRecord({
        category: 'xereta',
        type: 'opinion',
        text: opinion
      }, 'xereta_thanks');
    }

    function saveFeedbackRecord(payload, successStep) {
      var record = angular.extend({
        createdAt: new Date().toISOString(),
        region: vm.form.region || null,
        opportunityId: vm.selectedOpportunity ? vm.selectedOpportunity.id : null
      }, payload);

      persistFeedback(record).finally(function () {
        vm.feedbackModal.step = successStep || 'success';
        $timeout(function () {
          if (vm.feedbackModal.step === (successStep || 'success')) {
            closeFeedbackModal();
          }
        }, 1500);
      });
    }

    function persistFeedback(payload) {
      if (vm.firebaseEnabled && window.firebase && window.firebase.database) {
        return window.firebase.database().ref('feedbackMessages').push(payload).catch(function () {
          queueFeedback(payload);
        });
      }

      queueFeedback(payload);
      return $q.resolve({ queued: true });
    }

    function flushQueuedFeedback() {
      var queued = readQueuedFeedback();

      if (!queued.length || !(vm.firebaseEnabled && window.firebase && window.firebase.database)) {
        return;
      }

      clearQueuedFeedback();
      queued.forEach(function (payload) {
        window.firebase.database().ref('feedbackMessages').push(payload).catch(function () {
          queueFeedback(payload);
        });
      });
    }

    function queueFeedback(payload) {
      var queue = readQueuedFeedback();
      queue.push(payload);
      writeQueuedFeedback(queue);
    }

    function readQueuedFeedback() {
      try {
        var raw = window.localStorage.getItem(LOCAL_FEEDBACK_QUEUE_KEY);
        if (!raw) {
          return [];
        }

        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        clearQueuedFeedback();
        return [];
      }
    }

    function writeQueuedFeedback(items) {
      window.localStorage.setItem(LOCAL_FEEDBACK_QUEUE_KEY, JSON.stringify(items));
    }

    function clearQueuedFeedback() {
      window.localStorage.removeItem(LOCAL_FEEDBACK_QUEUE_KEY);
    }

    function buildDefaultFeedbackState() {
      return {
        visible: false,
        step: 'profile',
        password: '',
        passwordError: '',
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
    }

    function findRegionByName(regionName) {
      var normalized = normalize(regionName);
      var features = vm.regions && Array.isArray(vm.regions.features) ? vm.regions.features : [];

      for (var i = 0; i < features.length; i += 1) {
        var props = features[i].properties || {};
        if (normalize(props.name) === normalized) {
          return props;
        }
      }

      return null;
    }

    function computeRegionCenter(feature) {
      var coordinates = feature && feature.geometry && feature.geometry.coordinates;
      if (!Array.isArray(coordinates) || !Array.isArray(coordinates[0]) || !coordinates[0].length) {
        return null;
      }

      var ring = coordinates[0];
      var latSum = 0;
      var lngSum = 0;
      var count = 0;

      ring.forEach(function (pair) {
        if (Array.isArray(pair) && pair.length >= 2) {
          lngSum += pair[0];
          latSum += pair[1];
          count += 1;
        }
      });

      if (!count) {
        return null;
      }

      return {
        lat: latSum / count,
        lng: lngSum / count
      };
    }

    function normalize(value) {
      return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    }

    function restoreLastMapCenter() {
      try {
        var raw = window.localStorage.getItem(LAST_MAP_CENTER_KEY);
        if (!raw) {
          return;
        }

        var savedCenter = JSON.parse(raw);
        if (
          savedCenter &&
          typeof savedCenter.lat === 'number' &&
          typeof savedCenter.lng === 'number' &&
          typeof savedCenter.zoom === 'number'
        ) {
          vm.map.center.lat = savedCenter.lat;
          vm.map.center.lng = savedCenter.lng;
          vm.map.center.zoom = savedCenter.zoom;
        }
      } catch (err) {
        window.localStorage.removeItem(LAST_MAP_CENTER_KEY);
      }
    }

    function persistLastMapCenter() {
      window.localStorage.setItem(LAST_MAP_CENTER_KEY, JSON.stringify({
        lat: vm.map.center.lat,
        lng: vm.map.center.lng,
        zoom: vm.map.center.zoom
      }));
    }
  }
})();
