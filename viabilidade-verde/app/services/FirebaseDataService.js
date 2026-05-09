(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .service('FirebaseDataService', FirebaseDataService);

  FirebaseDataService.$inject = ['$q', '$http', '$firebaseObject', '$firebaseArray', 'APP_SETTINGS'];

  function FirebaseDataService($q, $http, $firebaseObject, $firebaseArray, APP_SETTINGS) {
    var firebaseEnabled = !!window.VV_FIREBASE_ENABLED;
    var initialized = false;

    this.isFirebaseEnabled = isFirebaseEnabled;
    this.getOpportunities = getOpportunities;
    this.getAssumptions = getAssumptions;
    this.saveSimulation = saveSimulation;

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
        });
      }

      return $http.get(APP_SETTINGS.fallback.opportunitiesUrl).then(function (response) {
        return response.data;
      });
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
        });
      }

      return $http.get(APP_SETTINGS.fallback.assumptionsUrl).then(function (response) {
        return response.data;
      });
    }

    function saveSimulation(payload) {
      if (isFirebaseEnabled()) {
        var ref = window.firebase.database().ref('simulations');
        return $firebaseArray(ref).$add(payload);
      }

      return $q.resolve({ local: true, savedAt: new Date().toISOString(), payload: payload });
    }
  }
})();
