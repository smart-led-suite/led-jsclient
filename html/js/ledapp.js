angular.module('ledapp', ['Services'])
  .controller('MainCtrl', function ($scope, $http, Socket) {
    // *************** config *******************
    var usingNodejs = true;
    // *****************************************
    // for sending this via socket we need to use a variable
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
    this.addProfile = function () {
      // use currentProfile as base
      console.log(' add based on activeProfile ' + $scope.profiles.activeProfile);
      // request new profile profile on server
      // the server will answer and update the profile object, no need to do it
      // in this function
      Socket.emit('addProfile', main.profileName);
      // and reset
      main.profileName = '';
    };
    this.removeProfile = function () {
      console.log(' remove activeProfile ' + $scope.profiles.activeProfile);
      // request to remove the current profile on server. more info see addProfile()
      Socket.emit('removeProfile');
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
    /*
    *** this is not used right now because socket.io is still implementing *****
    *** volatile on client side. once its there, we'll use it ******************
    // only used by node
    this.sendValue = function () {
      // because of using volatile in sendValueLive we're sending it non-volatile on release
      console.log('on release sent');
      Socket.emit('s', $scope.profiles);
    };
    */
  });
