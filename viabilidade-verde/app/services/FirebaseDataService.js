(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .service('FirebaseDataService', FirebaseDataService);

  FirebaseDataService.$inject = ['$q', '$http', '$firebaseObject', '$firebaseArray', 'APP_SETTINGS'];
  var PENDING_SIMULATIONS_KEY = 'vv.pendingSimulations';

  function FirebaseDataService($q, $http, $firebaseObject, $firebaseArray, APP_SETTINGS) {
    var firebaseEnabled = !!window.VV_FIREBASE_ENABLED;
    var initialized = false;

    this.isFirebaseEnabled = isFirebaseEnabled;
    this.getOpportunities = getOpportunities;
    this.getAssumptions = getAssumptions;
    this.getRegions = getRegions;
    this.getInfrastructure = getInfrastructure;
    this.getPidArcgisPorts = getPidArcgisPorts;
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
        return $q.resolve([]);
      }

      return $http.get(APP_SETTINGS.pidArcgis.portsGeoJsonUrl).then(function (response) {
        return mapPidPortsGeoJson(response.data);
      }).catch(function () {
        return [];
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
  }
})();
