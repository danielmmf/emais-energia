(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .service('FirebaseDataService', FirebaseDataService);

  FirebaseDataService.$inject = ['$q', '$http', '$firebaseObject', '$firebaseArray', 'APP_SETTINGS'];
  var PENDING_SIMULATIONS_KEY = 'vv.pendingSimulations';
  var PID_ARCGIS_CACHE_PREFIX = 'vv.pidArcgis.';

  function FirebaseDataService($q, $http, $firebaseObject, $firebaseArray, APP_SETTINGS) {
    var firebaseEnabled = !!window.VV_FIREBASE_ENABLED;
    var initialized = false;
    var pidCacheTtlMs = APP_SETTINGS.pidArcgis && APP_SETTINGS.pidArcgis.cacheTtlMs
      ? APP_SETTINGS.pidArcgis.cacheTtlMs
      : 21600000;

    this.isFirebaseEnabled = isFirebaseEnabled;
    this.getOpportunities = getOpportunities;
    this.getAssumptions = getAssumptions;
    this.getRegions = getRegions;
    this.getInfrastructure = getInfrastructure;
    this.getPidArcgisPorts = getPidArcgisPorts;
    this.getPidArcgisBiomethane = getPidArcgisBiomethane;
    this.getPidArcgisHydrogen = getPidArcgisHydrogen;
    this.saveSimulation = saveSimulation;
    this.retryPendingSimulations = retryPendingSimulations;

    function initializeFirebase() {
      if (!firebaseEnabled || initialized) {
        return;
      }

      if (window.firebase && window.VV_FIREBASE_CONFIG && window.VV_FIREBASE_CONFIG.apiKey) {
        if (!window.firebase.apps.length) {
          window.firebase.initializeApp(window.VV_FIREBASE_CONFIG);
        }
        initialized = true;
      } else {
        firebaseEnabled = false;
      }
    }

    function isFirebaseEnabled() {
      initializeFirebase();
      return firebaseEnabled && initialized;
    }

    function getOpportunities() {
      if (isFirebaseEnabled()) {
        var ref = window.firebase.database().ref('opportunities');
        return $firebaseObject(ref).$loaded().then(function (data) {
          var result = [];
          angular.forEach(data, function (value, key) {
            if (key.charAt(0) !== '$') {
              value.id = key;
              result.push(value);
            }
          });
          return result;
        }).catch(function () {
          return loadFallback(APP_SETTINGS.fallback.opportunitiesUrl);
        });
      }

      return loadFallback(APP_SETTINGS.fallback.opportunitiesUrl);
    }

    function getAssumptions() {
      if (isFirebaseEnabled()) {
        var ref = window.firebase.database().ref('assumptions');
        return $firebaseObject(ref).$loaded().then(function (data) {
          var result = {};
          angular.forEach(data, function (value, key) {
            if (key.charAt(0) !== '$') {
              result[key] = value;
            }
          });
          return result;
        }).catch(function () {
          return loadFallback(APP_SETTINGS.fallback.assumptionsUrl);
        });
      }

      return loadFallback(APP_SETTINGS.fallback.assumptionsUrl);
    }

    function getRegions() {
      if (isFirebaseEnabled()) {
        var ref = window.firebase.database().ref('regions');
        return $firebaseObject(ref).$loaded().then(function (data) {
          if (data && Array.isArray(data.features)) {
            return data;
          }
          return loadFallback(APP_SETTINGS.fallback.regionsUrl);
        }).catch(function () {
          return loadFallback(APP_SETTINGS.fallback.regionsUrl);
        });
      }

      return loadFallback(APP_SETTINGS.fallback.regionsUrl);
    }

    function getInfrastructure() {
      if (isFirebaseEnabled()) {
        var ref = window.firebase.database().ref('infrastructure');
        return $firebaseObject(ref).$loaded().then(function (data) {
          if (data && Array.isArray(data.features)) {
            return data;
          }
          return loadFallback(APP_SETTINGS.fallback.infrastructureUrl);
        }).catch(function () {
          return loadFallback(APP_SETTINGS.fallback.infrastructureUrl);
        });
      }

      return loadFallback(APP_SETTINGS.fallback.infrastructureUrl);
    }

    function getPidArcgisPorts() {
      if (!APP_SETTINGS.pidArcgis || !APP_SETTINGS.pidArcgis.portsGeoJsonUrl) {
        return emptyPidSource();
      }

      return loadPidArcgisSource({
        url: APP_SETTINGS.pidArcgis.portsGeoJsonUrl,
        cacheKey: 'ports',
        mapper: mapPidPortsGeoJson
      });
    }

    function getPidArcgisBiomethane() {
      if (!APP_SETTINGS.pidArcgis || !APP_SETTINGS.pidArcgis.biomethaneGeoJsonUrl) {
        return emptyPidSource();
      }

      return loadPidArcgisSource({
        url: APP_SETTINGS.pidArcgis.biomethaneGeoJsonUrl,
        cacheKey: 'biomethane',
        mapper: mapPidBiomethaneGeoJson
      });
    }

    function getPidArcgisHydrogen() {
      if (!APP_SETTINGS.pidArcgis) {
        return emptyPidSource();
      }

      return $q.all([
        loadPidArcgisSource({
          url: APP_SETTINGS.pidArcgis.hydrogenPlannedGeoJsonUrl,
          cacheKey: 'hydrogen_planned',
          mapper: function (collection) {
            return mapPidHydrogenGeoJson(collection, 'planejado');
          }
        }),
        loadPidArcgisSource({
          url: APP_SETTINGS.pidArcgis.hydrogenAdvancedGeoJsonUrl,
          cacheKey: 'hydrogen_advanced',
          mapper: function (collection) {
            return mapPidHydrogenGeoJson(collection, 'avancado');
          }
        })
      ]).then(function (sources) {
        var items = [];
        var fromCache = false;

        sources.forEach(function (source) {
          items = items.concat(source.items || []);
          fromCache = fromCache || !!source.fromCache;
        });

        return {
          items: items,
          fromCache: fromCache
        };
      }).catch(function () {
        return emptyPidSource();
      });
    }

    function saveSimulation(payload) {
      if (isFirebaseEnabled()) {
        return pushSimulation(payload).catch(function () {
          queueSimulation(payload);
          return $q.resolve({
            queued: true,
            payload: payload
          });
        });
      }

      queueSimulation(payload);
      return $q.resolve({
        local: true,
        queued: true,
        savedAt: new Date().toISOString(),
        payload: payload
      });
    }

    function retryPendingSimulations() {
      if (!isFirebaseEnabled()) {
        return $q.resolve({ skipped: true });
      }

      var pending = readQueue();
      if (!pending.length) {
        return $q.resolve({ retried: 0 });
      }

      var retries = pending.map(function (item) {
        return pushSimulation(item.payload);
      });

      clearQueue();
      return $q.all(retries).then(function () {
        return { retried: pending.length };
      }).catch(function () {
        return { retried: pending.length, discardedOnRetry: true };
      });
    }

    function loadFallback(url) {
      return $http.get(url).then(function (response) {
        return response.data;
      });
    }

    function loadPidArcgisSource(config) {
      var cachedEntry = readPidCache(config.cacheKey);
      if (cachedEntry && !isCacheExpired(cachedEntry.savedAt)) {
        return $q.resolve({
          items: cachedEntry.items || [],
          fromCache: true
        });
      }

      return $http.get(config.url).then(function (response) {
        var items = config.mapper(response.data);
        writePidCache(config.cacheKey, items);
        return {
          items: items,
          fromCache: false
        };
      }).catch(function () {
        if (cachedEntry) {
          return {
            items: cachedEntry.items || [],
            fromCache: true
          };
        }

        return emptyPidSource();
      });
    }

    function mapPidPortsGeoJson(collection) {
      var features = collection && Array.isArray(collection.features)
        ? collection.features
        : [];

      return features.map(function (feature, index) {
        var properties = feature.properties || {};
        var geometry = feature.geometry || {};
        var coordinates = geometry.coordinates;
        var stateCode = String(properties.POR_SG_UF || '').toUpperCase();
        var stateName = stateNameByUf(stateCode);
        var portName = String(properties.POR_NM || ('Porto ' + (index + 1))).trim();

        if (!Array.isArray(coordinates) || coordinates.length < 2) {
          return null;
        }

        return {
          id: 'pid-port-' + sanitizeId(portName + '-' + stateCode + '-' + index),
          name: stateName + ' - ' + portName,
          region: stateName,
          sector: 'Logistica portuaria',
          currentSource: 'Diesel',
          recommendedRoute: 'Energia renovavel contratada',
          monthlyCostDefault: 180000,
          investmentDefault: 2400000,
          lat: Number(coordinates[1]),
          lng: Number(coordinates[0]),
          layerType: 'portos',
          source: 'pidArcgis',
          showInSidebar: false,
          meta: {
            portType: properties.POR_DS_TIP || 'Nao informado',
            stateCode: stateCode
          }
        };
      }).filter(Boolean);
    }

    function mapPidBiomethaneGeoJson(collection) {
      var features = collection && Array.isArray(collection.features)
        ? collection.features
        : [];

      return features.map(function (feature, index) {
        var properties = feature.properties || {};
        var geometry = feature.geometry || {};
        var coordinates = geometry.coordinates;
        var company = String(readFirstProperty(properties, ['empresa']) || 'Planta de Biometano').trim();
        var municipality = String(readFirstProperty(properties, ['municipio']) || ('Municipio ' + (index + 1))).trim();
        var status = String(readFirstProperty(properties, ['status']) || 'Nao informado').trim();
        var capacity = readFirstProperty(properties, ['capacidade_instalada_nm_d', 'soma_da_capacidade_nm_d']);

        if (!Array.isArray(coordinates) || coordinates.length < 2) {
          return null;
        }

        return {
          id: 'pid-biometano-' + sanitizeId(company + '-' + municipality + '-' + index),
          name: municipality + ' - ' + company,
          region: municipality,
          sector: 'Biometano comercial',
          currentSource: 'Gas natural',
          recommendedRoute: 'Biometano',
          monthlyCostDefault: 200000,
          investmentDefault: 1800000,
          lat: Number(coordinates[1]),
          lng: Number(coordinates[0]),
          layerType: 'biometano',
          source: 'pidArcgis',
          showInSidebar: false,
          meta: {
            status: status,
            capacity: capacity || null
          }
        };
      }).filter(Boolean);
    }

    function mapPidHydrogenGeoJson(collection, stage) {
      var features = collection && Array.isArray(collection.features)
        ? collection.features
        : [];

      return features.map(function (feature, index) {
        var properties = feature.properties || {};
        var geometry = feature.geometry || {};
        var coordinates = geometry.coordinates;
        var location = String(readFirstProperty(properties, ['localizacao', 'localizac']) || ('Brasil ' + (index + 1))).trim();
        var owner = String(readFirstProperty(properties, ['responsavel', 'responsav']) || 'Projeto de hidrogenio').trim();
        var description = String(readFirstProperty(properties, ['descricao', 'descrica']) || owner).trim();
        var projectType = String(readFirstProperty(properties, ['tipo']) || 'Projeto de H2').trim();

        if (!Array.isArray(coordinates) || coordinates.length < 2) {
          return null;
        }

        return {
          id: 'pid-h2-' + sanitizeId(stage + '-' + owner + '-' + location + '-' + index),
          name: location + ' - ' + owner,
          region: location,
          sector: 'Hidrogenio verde',
          currentSource: 'Gas natural',
          recommendedRoute: 'Hidrogenio de baixa emissao',
          monthlyCostDefault: 280000,
          investmentDefault: 5200000,
          lat: Number(coordinates[1]),
          lng: Number(coordinates[0]),
          layerType: 'hidrogenio',
          source: 'pidArcgis',
          showInSidebar: false,
          meta: {
            stage: stage,
            type: projectType,
            description: description
          }
        };
      }).filter(Boolean);
    }

    function pushSimulation(payload) {
      var ref = window.firebase.database().ref('simulations');
      return $firebaseArray(ref).$add(payload);
    }

    function readQueue() {
      try {
        var raw = window.localStorage.getItem(PENDING_SIMULATIONS_KEY);
        if (!raw) {
          return [];
        }
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        clearQueue();
        return [];
      }
    }

    function writeQueue(items) {
      window.localStorage.setItem(PENDING_SIMULATIONS_KEY, JSON.stringify(items));
    }

    function clearQueue() {
      window.localStorage.removeItem(PENDING_SIMULATIONS_KEY);
    }

    function queueSimulation(payload) {
      var queue = readQueue();
      queue.push({ payload: payload });
      writeQueue(queue);
    }

    function emptyPidSource() {
      return $q.resolve({
        items: [],
        fromCache: false
      });
    }

    function readPidCache(cacheKey) {
      try {
        var raw = window.localStorage.getItem(PID_ARCGIS_CACHE_PREFIX + cacheKey);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        window.localStorage.removeItem(PID_ARCGIS_CACHE_PREFIX + cacheKey);
        return null;
      }
    }

    function writePidCache(cacheKey, items) {
      window.localStorage.setItem(PID_ARCGIS_CACHE_PREFIX + cacheKey, JSON.stringify({
        savedAt: Date.now(),
        items: items
      }));
    }

    function isCacheExpired(savedAt) {
      return !savedAt || (Date.now() - Number(savedAt)) > pidCacheTtlMs;
    }

    function sanitizeId(value) {
      return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    function stateNameByUf(uf) {
      var mapping = {
        AC: 'Acre',
        AL: 'Alagoas',
        AP: 'Amapa',
        AM: 'Amazonas',
        BA: 'Bahia',
        CE: 'Ceara',
        DF: 'Distrito Federal',
        ES: 'Espirito Santo',
        GO: 'Goias',
        MA: 'Maranhao',
        MT: 'Mato Grosso',
        MS: 'Mato Grosso do Sul',
        MG: 'Minas Gerais',
        PA: 'Para',
        PB: 'Paraiba',
        PR: 'Parana',
        PE: 'Pernambuco',
        PI: 'Piaui',
        RJ: 'Rio de Janeiro',
        RN: 'Rio Grande do Norte',
        RS: 'Rio Grande do Sul',
        RO: 'Rondonia',
        RR: 'Roraima',
        SC: 'Santa Catarina',
        SP: 'Sao Paulo',
        SE: 'Sergipe',
        TO: 'Tocantins'
      };

      return mapping[uf] || (uf || 'Brasil');
    }

    function readFirstProperty(properties, normalizedKeys) {
      var result = null;
      var acceptedKeys = normalizedKeys || [];

      angular.forEach(properties, function (value, key) {
        if (result !== null) {
          return;
        }

        if (acceptedKeys.indexOf(normalizeKey(key)) !== -1) {
          result = value;
        }
      });

      return result;
    }

    function normalizeKey(value) {
      return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
    }
  }
})();
