angular.module('ledapp')
  .config(function ($routeProvider, $locationProvider) {
    console.log('config here');
    $routeProvider
      .when('/', {
        templateUrl: 'partials/profiles.html',
        controller: 'MainCtrl as main'
      })
      .when('/config', {
        templateUrl: 'partials/ledconfig.html',
        controller: 'ConfigCtrl'
      });
    $routeProvider.otherwise({
      redirectTo: '/'
    });
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  });
