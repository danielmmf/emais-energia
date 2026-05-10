(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$q', '$scope', '$timeout', 'leafletData', 'FirebaseDataService', 'LayerControlService', 'MapDataService', 'ViabilityService', 'RecommendationService', 'ReportService'];
  var LAST_MAP_CENTER_KEY = 'vv.lastMapCenter';
  var LOCAL_FEEDBACK_QUEUE_KEY = 'vv.feedbackQueue';
  var FEEDBACK_PASSWORD = 'baconpedacudo';

  function HomeController($q, $scope, $timeout, leafletData, FirebaseDataService, LayerControlService, MapDataService, ViabilityService, RecommendationService, ReportService) {
    var vm = this;

    vm.loading = true;
    vm.error = null;
    vm.opportunities = [];
    vm.sidebarOpportunities = [];
    vm.mapOpportunities = [];
    vm.opportunitiesById = {};
    vm.opportunitiesByMarkerKey = {};
    vm.regions = null;
    vm.infrastructure = null;
    vm.regionIndex = {};
    vm.assumptions = {};
    vm.availableRoutes = buildRouteOptions();
    vm.selectedOpportunity = null;
    vm.selectedRegion = null;
    vm.selectedContextFacts = [];
    vm.layerGroups = LayerControlService.buildGroups();
    vm.layerInsights = null;
    vm.lastAutoSuggestedRoute = null;
    vm.result = null;
    vm.report = null;
    vm.firebaseEnabled = false;
    vm.simulationReady = false;
    vm.layerToolbarCollapsed = false;
    vm.pidDataStatus = {
      ports: { count: 0, fromCache: false },
      biometano: { count: 0, fromCache: false },
      hidrogenio: { count: 0, fromCache: false },
      infraestrutura: { count: 0, fromCache: false, loading: true },
      label: 'Camadas PID indisponiveis no momento. Fallback local ativo.'
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
    vm.toggleLayerGroup = toggleLayerGroup;
    vm.toggleLayerDetails = toggleLayerDetails;
    vm.toggleLayerInfo = toggleLayerInfo;
    vm.setLayerOpacity = setLayerOpacity;
    vm.zoomToLayer = zoomToLayer;
    vm.selectOpportunity = selectOpportunity;
    vm.startSimulation = startSimulation;
    vm.calculate = calculate;
    vm.downloadSimulation = downloadSimulation;
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
        FirebaseDataService.getInfrastructure(),
        FirebaseDataService.getPidArcgisPorts(),
        FirebaseDataService.getPidArcgisBiomethane(),
        FirebaseDataService.getPidArcgisHydrogen()
      ]).then(function (response) {
        var baseOpportunities = response[0] || [];
        var pidArcgisPorts = response[4] || { items: [], fromCache: false };
        var pidArcgisBiomethane = response[5] || { items: [], fromCache: false };
        var pidArcgisHydrogen = response[6] || { items: [], fromCache: false };
        var fallbackInfrastructure = response[3] || { type: 'FeatureCollection', features: [] };

        vm.sidebarOpportunities = baseOpportunities.filter(function (opportunity) {
          return opportunity.showInSidebar !== false;
        });
        vm.mapOpportunities = buildMapOpportunities(baseOpportunities, {
          portos: pidArcgisPorts.items,
          biometano: pidArcgisBiomethane.items,
          hidrogenio: pidArcgisHydrogen.items
        });
        vm.opportunities = vm.mapOpportunities;
        vm.assumptions = response[1] || {};
        vm.regions = response[2] || { type: 'FeatureCollection', features: [] };
        vm.infrastructure = fallbackInfrastructure;
        vm.pidDataStatus.ports = {
          count: pidArcgisPorts.items.length,
          fromCache: !!pidArcgisPorts.fromCache
        };
        vm.pidDataStatus.biometano = {
          count: pidArcgisBiomethane.items.length,
          fromCache: !!pidArcgisBiomethane.fromCache
        };
        vm.pidDataStatus.hidrogenio = {
          count: pidArcgisHydrogen.items.length,
          fromCache: !!pidArcgisHydrogen.fromCache
        };
        vm.pidDataStatus.label = buildPidDataStatusLabel(vm.pidDataStatus);
        vm.regionIndex = MapDataService.buildRegionIndex(vm.regions);

        vm.opportunitiesById = {};
        vm.opportunitiesByMarkerKey = {};
        vm.mapOpportunities.forEach(function (opportunity, index) {
          opportunity._mapKey = MapDataService.buildMarkerKey(opportunity.id, index);
          vm.opportunitiesById[opportunity.id] = opportunity;
          vm.opportunitiesByMarkerKey[opportunity._mapKey] = opportunity;
        });

        vm.availableRoutes = buildRouteOptions();

        refreshMapData();
        flushQueuedFeedback();
        loadPidInfrastructure(fallbackInfrastructure);
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
      var panelState = LayerControlService.buildPanelState(vm.layerGroups);
      var visibleOpportunities = vm.mapOpportunities.filter(function (opportunity) {
        return isOpportunityVisible(opportunity, panelState);
      });

      vm.map.markers = MapDataService.buildMarkers(visibleOpportunities, panelState);
      vm.map.paths = angular.extend(
        {},
        MapDataService.buildRegionPaths(vm.regions, panelState),
        MapDataService.buildInfrastructurePaths(vm.infrastructure, panelState)
      );
      vm.layerInsights = LayerControlService.buildLayerInsights(vm.selectedRegion, vm.selectedOpportunity, vm.layerGroups);
      applyLayerInfluence();
    }

    function toggleLayerToolbar() {
      vm.layerToolbarCollapsed = !vm.layerToolbarCollapsed;
    }

    function toggleLayer(layerKey) {
      var layer = LayerControlService.findLayer(vm.layerGroups, layerKey);
      if (!layer) {
        return;
      }

      refreshMapData();
    }

    function toggleLayerGroup(group) {
      group.collapsed = !group.collapsed;
    }

    function toggleLayerDetails(layer) {
      layer.expanded = !layer.expanded;
    }

    function toggleLayerInfo(layer) {
      layer.infoOpen = !layer.infoOpen;
      if (layer.infoOpen) {
        layer.expanded = true;
      }
    }

    function setLayerOpacity() {
      refreshMapData();
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
      vm.lastAutoSuggestedRoute = null;
      vm.form.recommendedRoute = item.recommendedRoute;
      vm.form.monthlyCostDefault = item.monthlyCostDefault;
      vm.form.investmentDefault = item.investmentDefault;
      vm.selectedContextFacts = buildSelectedContextFacts(item);
      syncAvailableRoutes(item.recommendedRoute);

      vm.map.center.lat = item.lat;
      vm.map.center.lng = item.lng;
      vm.map.center.zoom = 6;
      persistLastMapCenter();
      refreshMapData();
    }

    function selectRegion(feature) {
      var properties = feature.properties || {};
      var center = computeRegionCenter(feature);

      vm.selectedRegion = properties;
      vm.selectedOpportunity = null;
      vm.simulationReady = false;
      vm.result = null;
      vm.report = null;
      vm.selectedContextFacts = [];

      vm.form.region = properties.name || '';
      vm.form.sector = properties.vocacao || '';
      vm.form.currentSource = 'Gas natural';
      vm.lastAutoSuggestedRoute = null;
      vm.form.recommendedRoute = properties.rotaSugerida || 'Biometano';
      syncAvailableRoutes(vm.form.recommendedRoute);

      if (center) {
        vm.map.center.lat = center.lat;
        vm.map.center.lng = center.lng;
        vm.map.center.zoom = 6;
        persistLastMapCenter();
      }

      refreshMapData();
    }

    function startSimulation() {
      syncAvailableRoutes(vm.form.recommendedRoute);
      vm.simulationReady = true;
    }

    function calculate() {
      var computed = ViabilityService.calculate(vm.form, vm.assumptions);
      computed.classification = RecommendationService.classify(computed);
      computed.layerInsights = angular.copy(vm.layerInsights);
      computed.recommendation = RecommendationService.buildRecommendation(computed, vm.form);
      vm.result = computed;
      vm.report = ReportService.build(vm.form, vm.result);

      FirebaseDataService.saveSimulation({
        createdAt: new Date().toISOString(),
        source: vm.selectedOpportunity ? vm.selectedOpportunity.id : (vm.selectedRegion ? vm.selectedRegion.id : null),
        activeLayers: getActiveLayerNames(),
        form: angular.copy(vm.form),
        result: angular.copy(vm.result)
      }).finally(function () {
        FirebaseDataService.retryPendingSimulations();
      });
    }

    function downloadSimulation() {
      if (!vm.result || !vm.report) {
        return;
      }

      captureMapSnapshot().then(function (mapImage) {
        var documentHtml = ReportService.buildDownloadDocument({
          generatedAt: new Date().toISOString(),
          form: angular.copy(vm.form),
          result: angular.copy(vm.result),
          report: angular.copy(vm.report),
          mapImage: mapImage
        });

        triggerDownload(documentHtml, buildDownloadFileName(), 'text/html');
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

    function captureMapSnapshot() {
      var deferred = $q.defer();
      deferred.resolve(buildMapSnapshotDataUrl());
      return deferred.promise;
    }

    function triggerDownload(contents, fileName, mimeType) {
      var blob = new window.Blob([contents], { type: mimeType + ';charset=utf-8' });
      var url = window.URL.createObjectURL(blob);
      var anchor = window.document.createElement('a');

      anchor.href = url;
      anchor.download = fileName;
      window.document.body.appendChild(anchor);
      anchor.click();
      window.document.body.removeChild(anchor);

      $timeout(function () {
        window.URL.revokeObjectURL(url);
      }, 0);
    }

    function buildDownloadFileName() {
      var region = String(vm.form.region || 'simulacao')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      return 'viabilidade-verde-' + (region || 'simulacao') + '.html';
    }

    function buildMapOpportunities(baseOpportunities, replacementsByLayer) {
      var allBase = baseOpportunities || [];
      var replacementKeys = Object.keys(replacementsByLayer || {});
      var merged = [];

      allBase.forEach(function (opportunity) {
        var layerType = String(opportunity.layerType || '').toLowerCase();
        if (replacementKeys.indexOf(layerType) !== -1) {
          return;
        }
        merged.push(opportunity);
      });

      replacementKeys.forEach(function (layerType) {
        var liveItems = Array.isArray(replacementsByLayer[layerType]) ? replacementsByLayer[layerType] : [];
        var fallbackItems = allBase.filter(function (opportunity) {
          return String(opportunity.layerType || '').toLowerCase() === layerType;
        });

        merged = merged.concat(liveItems.length ? liveItems : fallbackItems);
      });

      return merged;
    }

    function buildPidDataStatusLabel(status) {
      var parts = [];

      if (status.ports.count) {
        parts.push('Portos ' + status.ports.count + (status.ports.fromCache ? ' (cache)' : ''));
      }

      if (status.biometano.count) {
        parts.push('Biometano ' + status.biometano.count + (status.biometano.fromCache ? ' (cache)' : ''));
      }

      if (status.hidrogenio.count) {
        parts.push('H2 ' + status.hidrogenio.count + (status.hidrogenio.fromCache ? ' (cache)' : ''));
      }

      if (status.infraestrutura.loading) {
        parts.push('Infra carregando');
      } else if (status.infraestrutura.count) {
        parts.push('Infra ' + status.infraestrutura.count + (status.infraestrutura.fromCache ? ' (cache)' : ''));
      }

      if (!parts.length) {
        return 'Camadas PID indisponiveis no momento. Fallback local ativo.';
      }

      return 'PID no mapa: ' + parts.join(' • ');
    }

    function mergeInfrastructureCollections(fallbackCollection, pidCollection) {
      var fallbackFeatures = fallbackCollection && Array.isArray(fallbackCollection.features)
        ? fallbackCollection.features
        : [];
      var pidFeatures = pidCollection && Array.isArray(pidCollection.features)
        ? pidCollection.features
        : [];

      if (!pidFeatures.length) {
        return {
          type: 'FeatureCollection',
          features: fallbackFeatures
        };
      }

      return {
        type: 'FeatureCollection',
        features: pidFeatures.concat(fallbackFeatures)
      };
    }

    function loadPidInfrastructure(fallbackInfrastructure) {
      FirebaseDataService.getPidArcgisInfrastructure().then(function (pidArcgisInfrastructure) {
        pidArcgisInfrastructure = pidArcgisInfrastructure || {
          collection: { type: 'FeatureCollection', features: [] },
          fromCache: false
        };

        vm.infrastructure = mergeInfrastructureCollections(
          fallbackInfrastructure || { type: 'FeatureCollection', features: [] },
          pidArcgisInfrastructure.collection
        );
        vm.pidDataStatus.infraestrutura = {
          count: pidArcgisInfrastructure.collection && Array.isArray(pidArcgisInfrastructure.collection.features)
            ? pidArcgisInfrastructure.collection.features.length
            : 0,
          fromCache: !!pidArcgisInfrastructure.fromCache,
          loading: false
        };
        vm.pidDataStatus.label = buildPidDataStatusLabel(vm.pidDataStatus);
        refreshMapData();
      }).catch(function () {
        vm.pidDataStatus.infraestrutura = {
          count: 0,
          fromCache: false,
          loading: false
        };
        vm.pidDataStatus.label = buildPidDataStatusLabel(vm.pidDataStatus);
      });
    }

    function buildSelectedContextFacts(item) {
      var facts = [];
      var meta = item && item.meta ? item.meta : {};

      if (!item) {
        return facts;
      }

      if (item.source === 'pidArcgis') {
        facts.push({ label: 'Origem', value: 'PID / ArcGIS' });
      }

      if (meta.company) {
        facts.push({ label: 'Empresa', value: meta.company });
      }

      if (meta.municipality) {
        facts.push({ label: 'Municipio', value: meta.municipality });
      }

      if (meta.portType) {
        facts.push({ label: 'Tipo do ativo', value: meta.portType });
      }

      if (meta.status) {
        facts.push({ label: 'Status', value: meta.status });
      }

      if (meta.capacity) {
        facts.push({ label: 'Capacidade estimada', value: String(meta.capacity) + ' Nm3/d' });
      }

      if (meta.stage) {
        facts.push({ label: 'Etapa', value: meta.stage });
      }

      if (meta.owner) {
        facts.push({ label: 'Responsavel', value: meta.owner });
      }

      if (meta.type) {
        facts.push({ label: 'Tipo de projeto', value: meta.type });
      }

      if (meta.description) {
        facts.push({ label: 'Descricao', value: meta.description });
      }

      if (meta.sourceUrl) {
        facts.push({ label: 'Fonte', value: meta.sourceUrl });
      }

      return facts;
    }

    function isOpportunityVisible(opportunity, panelState) {
      if (!panelState.markerLayers.length) {
        return false;
      }

      return panelState.markerLayers.some(function (layer) {
        return LayerControlService.isOpportunityVisibleForLayer(opportunity, layer.id);
      });
    }

    function applyLayerInfluence() {
      if (!vm.layerInsights) {
        return;
      }

      if (vm.layerInsights.preferredRoute && shouldApplyAutoRoute(vm.layerInsights.preferredRoute)) {
        vm.form.recommendedRoute = vm.layerInsights.preferredRoute;
        vm.lastAutoSuggestedRoute = vm.layerInsights.preferredRoute;
        syncAvailableRoutes(vm.form.recommendedRoute);
      }

      if (vm.layerInsights.recommendedSector && (!vm.form.sector || vm.form.sector === '')) {
        vm.form.sector = vm.layerInsights.recommendedSector;
      }
    }

    function shouldApplyAutoRoute(candidateRoute) {
      if (!candidateRoute) {
        return false;
      }

      if (!vm.form.recommendedRoute) {
        return true;
      }

      if (vm.form.recommendedRoute === vm.lastAutoSuggestedRoute) {
        return true;
      }

      if (vm.selectedOpportunity && vm.form.recommendedRoute === vm.selectedOpportunity.recommendedRoute) {
        return true;
      }

      if (vm.selectedRegion && vm.form.recommendedRoute === vm.selectedRegion.rotaSugerida) {
        return true;
      }

      return false;
    }

    function getActiveLayerNames() {
      return LayerControlService.buildPanelState(vm.layerGroups).activeLayerNames;
    }

    function zoomToLayer(layer) {
      var bounds = buildLayerBounds(layer);

      if (!bounds || !bounds.isValid || !bounds.isValid()) {
        return;
      }

      leafletData.getMap().then(function (map) {
        map.fitBounds(bounds.pad(0.12));
      });
    }

    function buildLayerBounds(layer) {
      if (!window.L || !layer) {
        return null;
      }

      var points = [];

      if (layer.kind === 'marker') {
        vm.mapOpportunities.forEach(function (opportunity) {
          if (LayerControlService.isOpportunityVisibleForLayer(opportunity, layer.id) &&
            typeof opportunity.lat === 'number' &&
            typeof opportunity.lng === 'number') {
            points.push(window.L.latLng(opportunity.lat, opportunity.lng));
          }
        });
      } else if (layer.kind === 'region') {
        var features = vm.regions && Array.isArray(vm.regions.features) ? vm.regions.features : [];
        features.forEach(function (feature) {
          collectGeometryPoints(feature && feature.geometry, points);
        });
      } else if (layer.kind === 'line') {
        var infraFeatures = vm.infrastructure && Array.isArray(vm.infrastructure.features) ? vm.infrastructure.features : [];
        infraFeatures.forEach(function (feature) {
          if (LayerControlService.isInfrastructureVisibleForLayer(feature, layer.id)) {
            collectGeometryPoints(feature.geometry, points);
          }
        });
      }

      if (!points.length) {
        return null;
      }

      return window.L.latLngBounds(points);
    }

    function collectGeometryPoints(geometry, points) {
      if (!geometry || !points) {
        return;
      }

      if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
        geometry.coordinates.forEach(function (ring) {
          (ring || []).forEach(function (pair) {
            pushLatLng(pair, points);
          });
        });
        return;
      }

      if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates)) {
        geometry.coordinates.forEach(function (pair) {
          pushLatLng(pair, points);
        });
        return;
      }

      if (geometry.type === 'MultiLineString' && Array.isArray(geometry.coordinates)) {
        geometry.coordinates.forEach(function (segment) {
          (segment || []).forEach(function (pair) {
            pushLatLng(pair, points);
          });
        });
      }
    }

    function pushLatLng(pair, points) {
      if (Array.isArray(pair) && pair.length >= 2) {
        points.push(window.L.latLng(pair[1], pair[0]));
      }
    }

    function buildRouteOptions() {
      var source = vm.assumptions && Object.keys(vm.assumptions).length
        ? vm.assumptions
        : ViabilityService.getDefaultAssumptions();

      return Object.keys(source).map(function (key) {
        return source[key] && source[key].label;
      }).filter(function (label, index, routes) {
        return !!label && routes.indexOf(label) === index;
      });
    }

    function syncAvailableRoutes(preferredRoute) {
      var routes = buildRouteOptions();

      if (preferredRoute && routes.indexOf(preferredRoute) === -1) {
        routes.unshift(preferredRoute);
      }

      vm.availableRoutes = routes;
      if (!vm.form.recommendedRoute && routes.length) {
        vm.form.recommendedRoute = routes[0];
      }
    }

    function buildMapSnapshotDataUrl() {
      var activeLayers = getActiveLayerNames().join(' • ');

      var title = vm.selectedOpportunity ? vm.selectedOpportunity.name : (vm.form.region || 'Analise territorial');
      var subtitle = 'Centro ' + formatCoord(vm.map.center.lat) + ', ' + formatCoord(vm.map.center.lng) + ' • zoom ' + vm.map.center.zoom;
      var route = vm.form.recommendedRoute || 'Rota nao definida';
      var svg = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="680" viewBox="0 0 1200 680">',
        '<defs>',
        '<linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#edf4ea"/><stop offset="100%" stop-color="#fdf9ef"/></linearGradient>',
        '<linearGradient id="card" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#f5fbf3"/></linearGradient>',
        '</defs>',
        '<rect width="1200" height="680" rx="28" fill="url(#bg)"/>',
        '<rect x="48" y="48" width="1104" height="584" rx="28" fill="url(#card)" stroke="#dce6db"/>',
        '<text x="84" y="98" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#1e7a43" font-weight="700">Viabilidade Verde • Snapshot da analise</text>',
        '<text x="84" y="138" font-family="Segoe UI, Arial, sans-serif" font-size="34" fill="#17231e" font-weight="800">' + escapeXml(title) + '</text>',
        '<text x="84" y="174" font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="#55645b">' + escapeXml(subtitle) + '</text>',
        '<rect x="84" y="214" width="730" height="340" rx="22" fill="#ecf4ee" stroke="#d6e4d6"/>',
        '<path d="M160 448 C238 278, 430 250, 516 338 C588 412, 708 392, 760 308" fill="none" stroke="#bed6c0" stroke-width="26" stroke-linecap="round"/>',
        '<path d="M170 470 C296 404, 402 480, 548 432 C650 398, 698 444, 768 384" fill="none" stroke="#8ec28f" stroke-width="10" stroke-linecap="round" stroke-dasharray="10 16"/>',
        '<circle cx="490" cy="386" r="22" fill="#e1a641" stroke="#14572f" stroke-width="6"/>',
        '<circle cx="490" cy="386" r="8" fill="#ffffff"/>',
        '<text x="526" y="392" font-family="Segoe UI, Arial, sans-serif" font-size="20" fill="#17231e" font-weight="700">' + escapeXml(vm.form.region || 'Regiao selecionada') + '</text>',
        '<text x="526" y="420" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="#55645b">Rota avaliada: ' + escapeXml(route) + '</text>',
        '<rect x="844" y="214" width="264" height="340" rx="22" fill="#fffdf7" stroke="#d6e4d6"/>',
        '<text x="876" y="260" font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="#1e7a43" font-weight="700">Camadas ativas</text>',
        '<text x="876" y="296" font-family="Segoe UI, Arial, sans-serif" font-size="15" fill="#55645b">' + escapeXml(activeLayers || 'Nenhuma') + '</text>',
        '<text x="876" y="362" font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="#1e7a43" font-weight="700">Contexto</text>',
        '<text x="876" y="398" font-family="Segoe UI, Arial, sans-serif" font-size="15" fill="#55645b">Setor: ' + escapeXml(vm.form.sector || 'n/d') + '</text>',
        '<text x="876" y="428" font-family="Segoe UI, Arial, sans-serif" font-size="15" fill="#55645b">Fonte atual: ' + escapeXml(vm.form.currentSource || 'n/d') + '</text>',
        '<text x="876" y="458" font-family="Segoe UI, Arial, sans-serif" font-size="15" fill="#55645b">Rota: ' + escapeXml(route) + '</text>',
        '<text x="84" y="598" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="#55645b">Representacao exportada do estado do mapa no momento da simulacao.</text>',
        '</svg>'
      ].join('');

      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    function formatCoord(value) {
      return Number(value || 0).toFixed(3);
    }

    function escapeXml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  }
})();
