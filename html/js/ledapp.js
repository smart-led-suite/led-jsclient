angular.module('ledapp', ['Services'])
  .controller('MainCtrl', function ($scope, $http, Socket) {
    // *************** config *******************
    var usingNodejs = true;
    // JSON
    // for assignments to $scope.profiles.activeProfile
    var main = this;
    $scope.blub = 'sdfkjafla';
    this.blub = 'haddl';
    if ($scope.profiles !== undefined) {
      console.log($scope.profiles);
    } else {
      $scope.profiles = {};
    }
    // SOCKET
    Socket.on('init', function (data) {
      console.log(data);
      $scope.profiles = data[0];
      $scope.leds = data[1].leds;
      //  $scope.profiles.activeProfile = data[0].activeProfile;
      //  $scope.profiles.activeProfile = data[0].activeProfile;
      console.log(this);
      console.log(data[0]);
    });
    Socket.on('s', function (data) {
      // console.log($scope.profiles);
      $scope.profiles = data;
      console.log(data);
      // console.log($scope.profiles);
    });
    Socket.on('f', function (data) {
      $scope.profiles.activeProfile = data;
    });

    // functions
    this.addProfile = function () {
      // use currentProfile as base
      console.log(' add based on activeProfile ' + $scope.profiles.activeProfile);
      // make a deep copy of the current profile
      /*
      some more explanation: JS does make reference copys per default. As I want to create a new object i need to make a deep
      copy to get to individual objets. this json workaround works as long as there are no functions inside the object (which is not the case)
      */
      var currentProfile = JSON.parse(JSON.stringify($scope.profiles.profiles[$scope.profiles.activeProfile]));
      // modify name
      currentProfile.name = this.profileName;
      Socket.emit('addProfile', main.profileName);
      // and reset
      this.profileName = '';
      console.log(currentProfile);
      console.log(main.profileName);
      // push() should return the array length
      var index = $scope.profiles.profiles.push(currentProfile) - 1;
      console.log(index);
      $scope.profiles.activeProfile = index;
      console.log($scope.profiles.profiles);
    };
    this.removeProfile = function () {
      console.log(' remove activeProfile ' + $scope.profiles.activeProfile);
      Socket.emit('removeProfile');
      /*  try {
          let arrayLength = $scope.profiles.profiles.push();
          // check if there are remaining profiles
          if (arrayLength === 1) throw new RangeError('err 10: last profile cannot be deleted');
          // remove profiles
          $scope.profiles.profiles.splice($scope.profiles.activeProfile, 1);
          // active profile has to be decreased
          if ($scope.profiles.activeProfile === (arrayLength - 1)) {
            $scope.profiles.activeProfile -= 1;
          }
        } catch (e) {
          console.log('i got an error: ' + e.name + ' error message: ' + e.message);
        } finally {
          // not yet used
        }*/
    };
    console.log($scope.profiles.profiles);
    this.changeProfile = function () {
      console.log('just wanted to let you know the PROFILE WAS CHANGED');
      console.log($scope.profiles.activeProfile);
      if (usingNodejs) {
        // send whole object
        Socket.emit('f', $scope.profiles.activeProfile);
      } else {
        // ESP STRING CREATION
        // send fade message
        // for profile change we want to fade
        var msg = 'f';
        // get values
        for (var key in $scope.profiles.profiles[$scope.profiles.activeProfile].leds) {
          msg += $scope.leds[key].pin + ':' + ($scope.profiles.profiles[$scope.profiles.activeProfile].leds[key] * 10) + ';';
        }
        Socket.emit(msg);
      }
    };
    this.sendValueLive = function (newValue, index) {
      if (usingNodejs) {
        // send whole object as volatile, it doesn't matter is something is lost
        Socket.emit('s', $scope.profiles);
      } else {
        // ESP STRING CREATION
        // ESP
        Socket.emit('s' + $scope.leds[index].pin + ':' + (newValue * 10));
        console.log('s' + $scope.leds[index].pin + ':' + (newValue * 10));
        // $scope.profiles.profiles[$scope.profiles.activeProfile].leds[index] = parseInt(newValue);
      }
    };
    // only used by node
    this.sendValue = function () {
      // because of using volatile in sendValueLive we're sending it non-volatile on release
      console.log('on release sent');
      Socket.emit('s', $scope.profiles);
    };
  });
