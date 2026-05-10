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
    this.getPidArcgisInfrastructure = getPidArcgisInfrastructure;
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

    function getPidArcgisInfrastructure() {
      if (!APP_SETTINGS.pidArcgis) {
        return emptyInfrastructureSource();
      }

      var configs = [
        {
          url: APP_SETTINGS.pidArcgis.gasTransportLayerUrl,
          cacheKey: 'infra_gas_transport',
          outFields: 'Nome_Dut_1,Categoria,Diam_Pol_x,COMPRIM_KM,Transporta',
          sourceLabel: 'Gasodutos de transporte',
          styleType: 'gas_transport',
          mapper: mapPidGasTransportFeature
        },
        {
          url: APP_SETTINGS.pidArcgis.gasDistributionLayerUrl,
          cacheKey: 'infra_gas_distribution',
          outFields: 'Distrib,UF,Fonte',
          sourceLabel: 'Gasodutos de distribuicao',
          styleType: 'gas_distribution',
          mapper: mapPidGasDistributionFeature
        },
        {
          url: APP_SETTINGS.pidArcgis.gasFlowLayerUrl,
          cacheKey: 'infra_gas_flow',
          outFields: 'DUTO_ID,CLASSIFICA,EXTENS_KM,DIAM_POL,INST_ORIG,INST_DEST,FLUIDO,ESTADO,Categoria,Fonte',
          sourceLabel: 'Gasodutos de escoamento',
          styleType: 'gas_flow',
          mapper: mapPidGasFlowFeature
        },
        {
          url: APP_SETTINGS.pidArcgis.transmissionExistingLayerUrl,
          cacheKey: 'infra_transmission_existing',
          outFields: 'Nome,Concession,Tensao,Ano_Opera',
          sourceLabel: 'Transmissao existente',
          styleType: 'transmission_existing',
          mapper: mapPidTransmissionExistingFeature
        },
        {
          url: APP_SETTINGS.pidArcgis.transmissionPlannedLayerUrl,
          cacheKey: 'infra_transmission_planned',
          outFields: 'Nome,Concession,Tensao,Ano_Planej',
          sourceLabel: 'Transmissao planejada',
          styleType: 'transmission_planned',
          mapper: mapPidTransmissionPlannedFeature
        }
      ].filter(function (config) {
        return !!config.url;
      });

      return $q.all(configs.map(function (config) {
        return loadPidArcgisLineSource(config);
      })).then(function (sources) {
        var features = [];
        var summary = {};
        var fromCache = false;

        sources.forEach(function (source) {
          features = features.concat(source.features || []);
          fromCache = fromCache || !!source.fromCache;
          if (source.summary) {
            summary[source.summary.key] = source.summary;
          }
        });

        return {
          collection: {
            type: 'FeatureCollection',
            features: features
          },
          summary: summary,
          fromCache: fromCache
        };
      }).catch(function () {
        return emptyInfrastructureSource();
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

    function loadPidArcgisLineSource(config) {
      var cachedEntry = readPidCache(config.cacheKey);
      if (cachedEntry && !isCacheExpired(cachedEntry.savedAt)) {
        return $q.resolve({
          features: cachedEntry.features || [],
          summary: cachedEntry.summary || { key: config.cacheKey, count: (cachedEntry.features || []).length, fromCache: true },
          fromCache: true
        });
      }

      return $q.all([
        $http.get(config.url, {
          params: { f: 'json' }
        }).then(function (response) {
          return response.data;
        }),
        $http.get(config.url + '/query', {
          params: {
            where: '1=1',
            returnCountOnly: true,
            f: 'json'
          }
        }).then(function (response) {
          return Number(response.data && response.data.count || 0);
        })
      ]).then(function (results) {
        var metadata = results[0] || {};
        var totalCount = results[1] || 0;
        var pageSize = Math.min(Number(metadata.maxRecordCount || 1000), 1000);
        var offsets = [];
        var offset = 0;

        while (offset < totalCount) {
          offsets.push(offset);
          offset += pageSize;
        }

        if (!offsets.length) {
          writePidLineCache(config.cacheKey, [], {
            key: config.cacheKey,
            label: config.sourceLabel,
            count: 0,
            fromCache: false
          });

          return {
            features: [],
            summary: {
              key: config.cacheKey,
              label: config.sourceLabel,
              count: 0,
              fromCache: false
            },
            fromCache: false
          };
        }

        return $q.all(offsets.map(function (resultOffset) {
          return $http.get(config.url + '/query', {
            params: {
              where: '1=1',
              outFields: config.outFields,
              returnGeometry: true,
              outSR: 4326,
              geometryPrecision: 4,
              resultOffset: resultOffset,
              resultRecordCount: pageSize,
              orderByFields: metadata.objectIdField || metadata.objectIdFieldName || 'FID',
              f: 'json'
            }
          }).then(function (response) {
            return response.data && Array.isArray(response.data.features) ? response.data.features : [];
          });
        })).then(function (pages) {
          var flattened = [];
          pages.forEach(function (page) {
            flattened = flattened.concat(page);
          });

          var features = flattened.map(function (feature, index) {
            return config.mapper(feature, index, config);
          }).filter(Boolean);
          var summary = {
            key: config.cacheKey,
            label: config.sourceLabel,
            count: features.length,
            fromCache: false
          };

          writePidLineCache(config.cacheKey, features, summary);
          return {
            features: features,
            summary: summary,
            fromCache: false
          };
        });
      }).catch(function () {
        if (cachedEntry) {
          return {
            features: cachedEntry.features || [],
            summary: cachedEntry.summary || { key: config.cacheKey, label: config.sourceLabel, count: (cachedEntry.features || []).length, fromCache: true },
            fromCache: true
          };
        }

        return {
          features: [],
          summary: {
            key: config.cacheKey,
            label: config.sourceLabel,
            count: 0,
            fromCache: false
          },
          fromCache: false
        };
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
            company: company,
            municipality: municipality,
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
        var sourceUrl = String(readFirstProperty(properties, ['fonte']) || '').trim();

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
            owner: owner,
            type: projectType,
            description: description,
            sourceUrl: sourceUrl
          }
        };
      }).filter(Boolean);
    }

    function mapPidGasTransportFeature(feature, index, config) {
      var attributes = feature.attributes || {};
      return mapPidLineFeature({
        feature: feature,
        id: 'pid-line-transport-' + (attributes.FID || index),
        name: attributes.Nome_Dut_1 || ('Gasoduto de transporte ' + (index + 1)),
        styleType: config.styleType,
        sourceLabel: config.sourceLabel,
        meta: {
          category: attributes.Categoria || 'Nao informado',
          diameter: attributes.Diam_Pol_x || null,
          lengthKm: attributes.COMPRIM_KM || null,
          transport: attributes.Transporta || null
        }
      });
    }

    function mapPidGasDistributionFeature(feature, index, config) {
      var attributes = feature.attributes || {};
      return mapPidLineFeature({
        feature: feature,
        id: 'pid-line-distribution-' + (attributes.FID || index),
        name: 'Distribuicao ' + (attributes.Distrib || ('linha ' + (index + 1))),
        styleType: config.styleType,
        sourceLabel: config.sourceLabel,
        meta: {
          stateCode: attributes.UF || null,
          sourceText: attributes.Fonte || null
        }
      });
    }

    function mapPidGasFlowFeature(feature, index, config) {
      var attributes = feature.attributes || {};
      return mapPidLineFeature({
        feature: feature,
        id: 'pid-line-flow-' + (attributes.FID || index),
        name: attributes.DUTO_ID || ('Gasoduto de escoamento ' + (index + 1)),
        styleType: config.styleType,
        sourceLabel: config.sourceLabel,
        meta: {
          category: attributes.Categoria || attributes.CLASSIFICA || null,
          fluid: attributes.FLUIDO || null,
          stateCode: attributes.ESTADO || null,
          diameter: attributes.DIAM_POL || null,
          lengthKm: attributes.EXTENS_KM || null,
          origin: attributes.INST_ORIG || null,
          destination: attributes.INST_DEST || null
        }
      });
    }

    function mapPidTransmissionExistingFeature(feature, index, config) {
      var attributes = feature.attributes || {};
      return mapPidLineFeature({
        feature: feature,
        id: 'pid-line-transmission-existing-' + (attributes.FID || index),
        name: attributes.Nome || ('Linha de transmissao existente ' + (index + 1)),
        styleType: config.styleType,
        sourceLabel: config.sourceLabel,
        meta: {
          concession: attributes.Concession || null,
          voltage: attributes.Tensao || null,
          year: attributes.Ano_Opera || null
        }
      });
    }

    function mapPidTransmissionPlannedFeature(feature, index, config) {
      var attributes = feature.attributes || {};
      return mapPidLineFeature({
        feature: feature,
        id: 'pid-line-transmission-planned-' + (attributes.FID || index),
        name: attributes.Nome || ('Linha de transmissao planejada ' + (index + 1)),
        styleType: config.styleType,
        sourceLabel: config.sourceLabel,
        meta: {
          concession: attributes.Concession || null,
          voltage: attributes.Tensao || null,
          year: attributes.Ano_Planej || null
        }
      });
    }

    function mapPidLineFeature(config) {
      var feature = config.feature || {};
      var geometry = feature.geometry || {};
      var paths = geometry.paths || [];
      var lineGeometry = esriPathsToGeoJsonGeometry(paths);

      if (!lineGeometry) {
        return null;
      }

      return {
        type: 'Feature',
        properties: angular.extend({
          id: config.id,
          name: config.name,
          source: 'pidArcgis',
          sourceLabel: config.sourceLabel,
          styleType: config.styleType
        }, config.meta || {}),
        geometry: lineGeometry
      };
    }

    function esriPathsToGeoJsonGeometry(paths) {
      if (!Array.isArray(paths) || !paths.length) {
        return null;
      }

      if (paths.length === 1) {
        return {
          type: 'LineString',
          coordinates: paths[0]
        };
      }

      return {
        type: 'MultiLineString',
        coordinates: paths
      };
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

    function emptyInfrastructureSource() {
      return $q.resolve({
        collection: {
          type: 'FeatureCollection',
          features: []
        },
        summary: {},
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

    function writePidLineCache(cacheKey, features, summary) {
      try {
        window.localStorage.setItem(PID_ARCGIS_CACHE_PREFIX + cacheKey, JSON.stringify({
          savedAt: Date.now(),
          features: features,
          summary: summary
        }));
      } catch (err) {
        window.localStorage.removeItem(PID_ARCGIS_CACHE_PREFIX + cacheKey);
      }
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
