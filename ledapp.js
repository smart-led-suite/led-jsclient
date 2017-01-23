angular.module('ledapp', [])
    .controller('MainCtrl', function ($scope, $http) {
      // CONNECTION
      // JSON
      // get the profiles from JSON file
      $http.get('profiles.json').then(function (response) {
        $scope.profiles = response.data.profiles;
        console.log($scope.profiles);
      });
      // get the led config from JSON file
      $http.get('led.json').then(function (response) {
        $scope.leds = response.data.leds;
        console.log($scope.leds);
      });
      $scope.blub = 'sdfkjafla';
      this.activeProfile = 0;
      // this.activeProfile = 0;
      this.blub = 'haddl';
      if ($scope.profiles !== undefined) {
        console.log($scope.profiles);
      }
      // SOCKET
      var connection = new WebSocket('ws://192.168.0.101:8080');
      // When the connection is open, send some data to the server
      connection.onopen = function () {
        // connection.send('Ping'); // Send the message 'Ping' to the server
        // connection.send('time=1'); // set time to 1ms -> immediately
        // connection.send('wait=0'); // set time to 1ms -> immediately
      };

      // Log errors
      connection.onerror = function (error) {
        console.log('WebSocket Error ' + error);
      };

      // Log messages from the server
      connection.onmessage = function (e) {
        console.log('Server: ' + e.data);
      };
      // functions
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

      this.changeProfile = function () {
        console.log('just wanted to let you know the PROFILE WAS CHANGED');
        console.log($scope.profiles[this.activeProfile]);
        // send fade message
        // for profile change we want to fade
        var msg = 'f';
        // get values
        for (var key in $scope.profiles[this.activeProfile].leds) {
          msg += $scope.leds[key].pin + ':' + ($scope.profiles[this.activeProfile].leds[key] * 10) + ';';
        }
        connection.send(msg);
      };

      this.sendValue = function (newValue, index) {
        console.log(newValue + ' index: ' + index);
        // ESP
        connection.send('s' + $scope.leds[index].pin + ':' + (newValue * 10));
        console.log('s' + $scope.leds[index].pin + ':' + (newValue * 10));
        $scope.profiles[this.activeProfile].leds[index] = newValue;
      };
      this.sendValueOnRelease = function (newValue, index) {
        console.log('mouse was released');
      };
    });
