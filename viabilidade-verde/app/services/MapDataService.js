(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .service('MapDataService', MapDataService);

  function MapDataService() {
    this.buildMarkers = function buildMarkers(opportunities) {
      var markers = {};

      (opportunities || []).forEach(function (item) {
        if (typeof item.lat === 'number' && typeof item.lng === 'number') {
          markers[item.id] = {
            lat: item.lat,
            lng: item.lng,
            message: item.name,
            focus: false,
            draggable: false
          };
        }
      });

      return markers;
    };
  }
})();
