(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp', ['firebase', 'ui-leaflet'])
    .constant('APP_SETTINGS', {
      fallback: {
        opportunitiesUrl: 'data/fallback-opportunities.json',
        assumptionsUrl: 'data/fallback-assumptions.json',
        regionsUrl: 'data/regions.geojson',
        infrastructureUrl: 'data/infrastructure.geojson'
      }
    });
})();
