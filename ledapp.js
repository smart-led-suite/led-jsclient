angular.module('ledapp', [])
    .controller('MainCtrl', function ($scope, $http) {
      // get the profiles from JSON file
      $http.get('config.json').then(function (response) {
        $scope.profiles = response.data[0].profiles;
        $scope.leds = response.data[1].leds;
        console.log($scope.profiles);
        console.log($scope.leds);
      });
      $scope.blub = 'sdfkjafla';
      this.activeProfile = 0;
      // this.activeProfile = 0;
      this.blub = 'haddl';
      if ($scope.profiles !== undefined) {
        console.log($scope.profiles);
      }
      this.saveProfile = function () {
        console.log($scope.profiles);
      };
      console.log($scope.profiles);
      this.changeProfile = function (newProfile) {
        console.log('blub');
        this.activeProfile = newProfile;
        console.log(this.activeProfile);
      };
      this.sendValue = function (newValue, index) {
        console.log(newValue + ' index: ' + index);
        $scope.profiles[this.activeProfile].value[index] = newValue;
        console.log('hello');
      };
    });
