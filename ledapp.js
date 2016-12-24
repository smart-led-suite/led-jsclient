angular.module('ledapp', [])
    .controller('MainCtrl', function ($scope) {
      $scope.blub = 'sdfkjafla';
      this.blub = 'haddl';
      this.profiles = [
            {name: 'profile1', value: [30, 30]},
            {name: 'profile2', value: [34, 27]}
      ];
      this.sendValue = function () {
        console.log('hello');
            // console.log(this.room);
      };
    });
