(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .service('MarkerIconService', MarkerIconService);

  function MarkerIconService() {
    this.resolve = function resolve(item) {
      var iconKey = resolveIconKey(item);
      var label = item && item.name ? item.name : 'Oportunidade';

      return {
        type: 'div',
        className: 'vv-map-marker-icon',
        html: '<img src="assets/img/icons/' + iconKey + '.svg" alt="' + escapeHtml(label) + '">',
        iconSize: [34, 42],
        iconAnchor: [17, 40],
        popupAnchor: [0, -32]
      };
    };

    function resolveIconKey(item) {
      var layerType = normalize(item && item.layerType);
      var sector = normalize(item && item.sector);
      var route = normalize(item && item.recommendedRoute);

      if (layerType === 'biometano' || route.indexOf('biometano') !== -1) {
        return 'biometano';
      }

      if (layerType === 'hidrogenio' || route.indexOf('hidrogenio') !== -1) {
        return 'hidrogenio';
      }

      if (layerType === 'portos' || sector.indexOf('portu') !== -1) {
        return 'porto';
      }

      if (layerType === 'energia_renovavel' || route.indexOf('renovavel') !== -1 || route.indexOf('eletrificacao') !== -1) {
        return 'renovavel';
      }

      if (layerType === 'saf' || route.indexOf('saf') !== -1) {
        return 'saf';
      }

      if (layerType === 'fertilizantes' || sector.indexOf('fertilizantes') !== -1) {
        return 'fertilizantes';
      }

      if (route.indexOf('biomassa') !== -1 || sector.indexOf('biomassa') !== -1) {
        return 'biomassa';
      }

      if (sector.indexOf('quimica') !== -1 || sector.indexOf('petroquimica') !== -1) {
        return 'quimica';
      }

      if (sector.indexOf('aco') !== -1 || sector.indexOf('sider') !== -1) {
        return 'aco';
      }

      if (sector.indexOf('cimento') !== -1) {
        return 'cimento';
      }

      if (sector.indexOf('agro') !== -1) {
        return 'agroindustria';
      }

      if (layerType === 'industrias') {
        return 'industria';
      }

      return 'default';
    }

    function normalize(value) {
      return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
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
