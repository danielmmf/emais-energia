(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .service('MapDataService', MapDataService);

  function MapDataService() {
    var MARKER_LAYER_CONFIG = {
      industrias: { key: 'industrias', label: 'Industrias' },
      biometano: { key: 'biometano', label: 'Biometano' },
      hidrogenio: { key: 'hidrogenio', label: 'Hidrogenio' },
      portos: { key: 'portos', label: 'Portos' },
      fertilizantes: { key: 'fertilizantes', label: 'Fertilizantes' },
      saf: { key: 'saf', label: 'SAF' },
      energia_renovavel: { key: 'energia_renovavel', label: 'Energia renovavel' }
    };

    this.buildMarkerKey = function buildMarkerKey(id, index) {
      return sanitizeMapKey(id || ('marker-' + index), 'marker_');
    };

    this.buildMapLayers = function buildMapLayers() {
      var overlays = {};

      Object.keys(MARKER_LAYER_CONFIG).forEach(function (layerType) {
        var layerKey = MARKER_LAYER_CONFIG[layerType].key;
        overlays[layerKey] = {
          name: MARKER_LAYER_CONFIG[layerType].label,
          type: 'markercluster',
          visible: true,
          layerOptions: {
            showCoverageOnHover: false,
            spiderfyOnMaxZoom: true,
            zoomToBoundsOnClick: true,
            disableClusteringAtZoom: 9
          }
        };
      });

      return {
        baselayers: {
          osm: {
            name: 'OpenStreetMap',
            type: 'xyz',
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            layerOptions: {
              attribution: '&copy; OpenStreetMap contributors'
            }
          }
        },
        overlays: overlays
      };
    };

    this.buildMarkers = function buildMarkers(opportunities, visibleLayers) {
      var markers = {};

      (opportunities || []).forEach(function (item, index) {
        var layerType = normalizeLayerType(item.layerType);
        if (!visibleLayers[layerType]) {
          return;
        }

        if (typeof item.lat === 'number' && typeof item.lng === 'number') {
          var markerKey = item._mapKey || sanitizeMapKey(item.id || ('marker-' + index), 'marker_');
          markers[markerKey] = {
            lat: item.lat,
            lng: item.lng,
            message: item.name,
            focus: false,
            draggable: false,
            layer: MARKER_LAYER_CONFIG[layerType].key,
            data: {
              opportunityId: item.id
            }
          };
        }
      });

      return markers;
    };

    this.buildRegionPaths = function buildRegionPaths(regionCollection, visibleLayers) {
      if (!visibleLayers.regions && !visibleLayers.energia_renovavel) {
        return {};
      }

      var paths = {};
      var features = regionCollection && Array.isArray(regionCollection.features)
        ? regionCollection.features
        : [];

      features.forEach(function (feature, index) {
        var geometry = feature.geometry || {};
        var properties = feature.properties || {};

        if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates) && geometry.coordinates[0]) {
          paths[regionPathId(properties, index)] = {
            type: 'polygon',
            latlngs: coordinatesToLatLngs(geometry.coordinates[0]),
            color: '#2f8a4b',
            weight: 1,
            fillColor: getEnergyPotentialColor(properties.potencialEnergetico),
            fillOpacity: visibleLayers.energia_renovavel ? 0.32 : 0.16,
            click: true,
            data: {
              regionId: regionPathId(properties, index)
            }
          };
        }
      });

      return paths;
    };

    this.buildInfrastructurePaths = function buildInfrastructurePaths(infraCollection, visibleLayers) {
       if (!visibleLayers.infrastructure) {
         return {};
       }

       var paths = {};
       var features = infraCollection && Array.isArray(infraCollection.features)
         ? infraCollection.features
         : [];

       features.forEach(function (feature, index) {
         var geometry = feature.geometry || {};
         var properties = feature.properties || {};

         if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates)) {
           var infraId = properties.id || ('infra-' + index);
           // Replace hyphens with underscores to comply with AngularJS-Leaflet path naming rules
           infraId = infraId.replace(/-/g, '_');
           paths[infraId] = {
             type: 'polyline',
             latlngs: coordinatesToLatLngs(geometry.coordinates),
             color: '#1565c0',
             weight: 2,
             opacity: 0.8,
             dashArray: '6,4',
             clickable: false
           };
         }
       });

       return paths;
     };

    this.buildRegionIndex = function buildRegionIndex(regionCollection) {
      var index = {};
      var features = regionCollection && Array.isArray(regionCollection.features)
        ? regionCollection.features
        : [];

      features.forEach(function (feature, position) {
        var properties = feature.properties || {};
        index[regionPathId(properties, position)] = feature;
      });

      return index;
    };

    function normalizeLayerType(layerType) {
      var value = String(layerType || '').toLowerCase();
      if (MARKER_LAYER_CONFIG[value]) {
        return value;
      }
      return 'industrias';
    }

    function coordinatesToLatLngs(coords) {
      return (coords || []).map(function (pair) {
        return {
          lat: pair[1],
          lng: pair[0]
        };
      });
    }

    function regionPathId(properties, index) {
      var id = properties.id || ('region-' + index);
      // Replace hyphens with underscores to comply with AngularJS-Leaflet path naming rules
      return id.replace(/-/g, '_');
    }

    function sanitizeMapKey(value, prefix) {
      var normalized = String(value || '')
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');

      if (!normalized) {
        normalized = 'item';
      }

      if (!/^[A-Za-z_]/.test(normalized)) {
        normalized = (prefix || 'map_') + normalized;
      }

      return normalized;
    }

    function getEnergyPotentialColor(potential) {
      var normalized = String(potential || '').toLowerCase();
      if (normalized === 'alto') {
        return '#2e7d32';
      }
      if (normalized === 'medio' || normalized === 'media') {
        return '#f9a825';
      }
      return '#8d6e63';
    }
  }
})();
