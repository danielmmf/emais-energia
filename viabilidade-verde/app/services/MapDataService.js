(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .service('MapDataService', MapDataService);

  MapDataService.$inject = ['LayerControlService'];

  function MapDataService(LayerControlService) {
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

    this.buildMarkers = function buildMarkers(opportunities, panelState) {
      var markers = {};

      (opportunities || []).forEach(function (item, index) {
        var layerType = normalizeLayerType(item.layerType);

        if (typeof item.lat === 'number' && typeof item.lng === 'number') {
          var markerKey = item._mapKey || sanitizeMapKey(item.id || ('marker-' + index), 'marker_');
          var markerOpacity = resolveMarkerOpacity(item, panelState);
          markers[markerKey] = {
            lat: item.lat,
            lng: item.lng,
            message: buildMarkerMessage(item),
            focus: false,
            draggable: false,
            opacity: markerOpacity,
            layer: MARKER_LAYER_CONFIG[layerType].key,
            data: {
              opportunityId: item.id
            }
          };
        }
      });

      return markers;
    };

    this.buildRegionPaths = function buildRegionPaths(regionCollection, panelState) {
      var paths = {};
      var features = regionCollection && Array.isArray(regionCollection.features)
        ? regionCollection.features
        : [];
      var regionLayers = panelState && Array.isArray(panelState.regionLayers)
        ? panelState.regionLayers
        : [];

      features.forEach(function (feature, index) {
        var geometry = feature.geometry || {};
        var properties = feature.properties || {};

        if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates) && geometry.coordinates[0]) {
          var baseRegionId = regionPathId(properties, index);
          paths[baseRegionId] = {
            type: 'polygon',
            latlngs: coordinatesToLatLngs(geometry.coordinates[0]),
            color: '#244c34',
            weight: 1.1,
            fillColor: '#dce9d8',
            fillOpacity: 0.08,
            click: true,
            data: {
              regionId: baseRegionId
            }
          };

          regionLayers.forEach(function (layer) {
            var style = LayerControlService.getRegionLayerStyle(layer.id, properties);
            paths[layer.id + '_' + baseRegionId] = {
              type: 'polygon',
              latlngs: coordinatesToLatLngs(geometry.coordinates[0]),
              color: style.strokeColor,
              opacity: style.strokeOpacity,
              weight: style.weight,
              fillColor: style.fillColor,
              fillOpacity: Math.max(0.08, style.fillOpacity * (Number(layer.opacity || 0) / 100)),
              clickable: false
            };
          });
        }
      });

      return paths;
    };

    this.buildInfrastructurePaths = function buildInfrastructurePaths(infraCollection, panelState) {
       var lineLayers = panelState && Array.isArray(panelState.lineLayers)
         ? panelState.lineLayers
         : [];

       if (!lineLayers.length) {
         return {};
       }

       var paths = {};
       var features = infraCollection && Array.isArray(infraCollection.features)
         ? infraCollection.features
         : [];

       features.forEach(function (feature, index) {
         var geometry = feature.geometry || {};
         var properties = feature.properties || {};
         var infraId = properties.id || ('infra-' + index);
         var matchingLayers = lineLayers.filter(function (layer) {
           return LayerControlService.isInfrastructureVisibleForLayer(feature, layer.id);
         });

         if (!matchingLayers.length) {
           return;
         }

         // Replace hyphens with underscores to comply with AngularJS-Leaflet path naming rules
         infraId = infraId.replace(/-/g, '_');
         var pathOpacity = Math.max.apply(null, matchingLayers.map(function (layer) {
           return Number(layer.opacity || 0) / 100;
         }));

         if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates)) {
           paths[infraId] = buildInfrastructurePath(geometry.coordinates, properties, pathOpacity);
           return;
         }

         if (geometry.type === 'MultiLineString' && Array.isArray(geometry.coordinates)) {
           geometry.coordinates.forEach(function (segment, segmentIndex) {
             if (!Array.isArray(segment) || !segment.length) {
               return;
             }

             paths[infraId + '_' + segmentIndex] = buildInfrastructurePath(segment, properties, pathOpacity);
           });
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

    function buildMarkerMessage(item) {
      var lines = [
        '<strong>' + escapeHtml(item.name) + '</strong>',
        escapeHtml((item.region || 'Brasil') + ' • ' + (item.sector || 'Ativo territorial'))
      ];

      if (item.source === 'pidArcgis') {
        lines.push('<span>Origem: PID / ArcGIS</span>');

        if (item.meta) {
          if (item.meta.portType) {
            lines.push('<span>Tipo: ' + escapeHtml(item.meta.portType) + '</span>');
          }
          if (item.meta.status) {
            lines.push('<span>Status: ' + escapeHtml(item.meta.status) + '</span>');
          }
          if (item.meta.capacity) {
            lines.push('<span>Capacidade: ' + escapeHtml(String(item.meta.capacity)) + ' Nm3/d</span>');
          }
          if (item.meta.stage) {
            lines.push('<span>Etapa: ' + escapeHtml(item.meta.stage) + '</span>');
          }
          if (item.meta.type) {
            lines.push('<span>Tipo do projeto: ' + escapeHtml(item.meta.type) + '</span>');
          }
        }
      }

      return lines.join('<br>');
    }

    function getInfrastructureColor(styleType) {
      if (/transmission/i.test(String(styleType || ''))) {
        return '#1565c0';
      }
      if (/gas_transport/i.test(String(styleType || ''))) {
        return '#0f766e';
      }
      if (/gas_distribution/i.test(String(styleType || ''))) {
        return '#2e7d32';
      }
      if (/gas_flow/i.test(String(styleType || ''))) {
        return '#ca8a04';
      }
      return '#1565c0';
    }

    function getInfrastructureWeight(styleType) {
      return /transmission/i.test(String(styleType || '')) ? 2 : 2.4;
    }

    function getInfrastructureDashArray(styleType) {
      if (/planned/i.test(String(styleType || ''))) {
        return '4,6';
      }
      if (/gas_distribution/i.test(String(styleType || ''))) {
        return '2,5';
      }
      return null;
    }

    function buildInfrastructurePath(coordinates, properties, opacity) {
      return {
        type: 'polyline',
        latlngs: coordinatesToLatLngs(coordinates),
        color: getInfrastructureColor(properties.styleType),
        weight: getInfrastructureWeight(properties.styleType),
        opacity: opacity || 0.82,
        dashArray: getInfrastructureDashArray(properties.styleType),
        clickable: false
      };
    }

    function resolveMarkerOpacity(item, panelState) {
      var markerLayers = panelState && Array.isArray(panelState.markerLayers)
        ? panelState.markerLayers
        : [];
      var matches = markerLayers.filter(function (layer) {
        return LayerControlService.isOpportunityVisibleForLayer(item, layer.id);
      });

      if (!matches.length) {
        return 0.88;
      }

      return Math.max.apply(null, matches.map(function (layer) {
        return Number(layer.opacity || 0) / 100;
      }));
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  }
})();
