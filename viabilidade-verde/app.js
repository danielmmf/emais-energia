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
        cacheTtlMs: 21600000,
        portsGeoJsonUrl: 'https://services6.arcgis.com/I9CTS4kjOw8Dsslu/arcgis/rest/services/Instala%C3%A7%C3%B5es_Portu%C3%A1rias/FeatureServer/0/query?where=1%3D1&outFields=POR_NM,POR_SG_UF,POR_DS_TIP&returnGeometry=true&outSR=4326&f=geojson',
        biomethaneGeoJsonUrl: 'https://services6.arcgis.com/I9CTS4kjOw8Dsslu/arcgis/rest/services/Biometano_Comercial_/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson',
        hydrogenPlannedGeoJsonUrl: 'https://services6.arcgis.com/I9CTS4kjOw8Dsslu/arcgis/rest/services/H2_projetos_planejados/FeatureServer/1/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson',
        hydrogenAdvancedGeoJsonUrl: 'https://services6.arcgis.com/I9CTS4kjOw8Dsslu/arcgis/rest/services/H2_projetos_avan%C3%A7ados/FeatureServer/1/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson'
      }
    });
})();
