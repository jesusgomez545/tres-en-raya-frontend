(function() {
  'use strict';

  angular.module('app').config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider.state('tres-en-raya', {
      url: '/tres-en-raya',
      component: 'tresEnRaya'
    });

    $urlRouterProvider.otherwise('/tres-en-raya');
  }

})();
