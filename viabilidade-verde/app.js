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
      },
      pidArcgis: {
        portsGeoJsonUrl: 'https://services6.arcgis.com/I9CTS4kjOw8Dsslu/arcgis/rest/services/Instala%C3%A7%C3%B5es_Portu%C3%A1rias/FeatureServer/0/query?where=1%3D1&outFields=POR_NM,POR_SG_UF,POR_DS_TIP&returnGeometry=true&outSR=4326&f=geojson'
      }
    });
})();
