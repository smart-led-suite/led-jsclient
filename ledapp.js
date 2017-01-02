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
      this.addProfile = function () {
        // use currentProfile as base
        console.log(' add based on activeProfile ' + this.activeProfile);
        // make a deep copy of the current profile
        /*
        some more explanation: JS does make reference copys per default. As I want to create a new object i need to make a deep
        copy to get to individual objets. this json workaround works as long as there are no functions inside the object (which is not the case)
        */
        var currentProfile = JSON.parse(JSON.stringify($scope.profiles[this.activeProfile]));
        // modify name
        currentProfile.name = this.profileName;
        // and reset
        this.profileName = '';
        console.log(currentProfile);
        // push() should return the array length
        var index = $scope.profiles.push(currentProfile) - 1;
        console.log(index);

        this.activeProfile = index;
        console.log($scope.profiles);
      };
      this.removeProfile = function () {
        // use currentProfile as base
        console.log(' remove activeProfile ' + this.activeProfile);
        try {
          let arrayLength = $scope.profiles.push();
          // check if there are remaining profiles
          if (arrayLength === 1) throw new RangeError('err 10: last profile cannot be deleted');
          // remove profiles
          $scope.profiles.splice(this.activeProfile, 1);
          if (this.activeProfile === (arrayLength - 1)) {
            this.activeProfile -= 1;
          }
        } catch (e) {
          console.log('i got an error: ' + e.name + ' error message: ' + e.message);
        } finally {
          // not yet used
        }
      };
      console.log($scope.profiles);
      this.changeProfile = function (newProfile) {
        console.log('just wanted to let you know the PROFILE WAS CHANGED');
      };
      this.sendValue = function (newValue, index) {
        console.log(newValue + ' index: ' + index);
        $scope.profiles[this.activeProfile].value[index] = newValue;
      };
    });
