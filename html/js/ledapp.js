angular.module('ledapp', ['Services', 'ngRoute', 'ngAnimate', 'ngTouch', 'ui.bootstrap', 'rzModule']);
console.log('ledapp was created');

angular.module('ledapp').controller('MainCtrl', function ($scope, $http, $timeout, Socket) {
  // *************** config *******************
  var usingNodejs = true;
  $scope.loadingComplete = false;
  // *****************************************
  console.log('ledapp controller started');
  // for sending 'this' via socket we need to use a variable
  var main = this;
  // slider style init
  // maybe we could stop using two unnamed functions and use the same one.
  $scope.slider = {
    strip: {
      floor: 0,
      ceil: 100,
      onChange: function () {
        if (usingNodejs) {
          Socket.emit('s', $scope.profiles);
        } else {
          console.log('please rewrite live update string to your needs!');
        }
      }
    },
    brightness: {
      floor: 0,
      ceil: 10,
      showTicks: true,
      onChange: function () {
        if (usingNodejs) {
          Socket.emit('s', $scope.profiles);
        } else {
          console.log('please rewrite live update string to your needs!');
        }
      }
    }
  };

  if ($scope.profiles !== undefined) {
    console.log($scope.profiles);
  } else {
    $scope.profiles = {};
  }
  // SOCKET
  Socket.on('init', function (data) {
    // console.log(data);
    $scope.profiles = data[0];
    $scope.leds = data[1].leds;
    // redraw slider values
    // somehow it doesn't redraw the brightness sliderw
    // which is also at 'NaN' initially
    $timeout(function () {
      $scope.$broadcast('reCalcViewDimensions');
      //$scope.$broadcast('rzSliderForceRender');
    });
    // make page visible
    $scope.loadingComplete = true;
  });
  // if we're still connected we want to ask for an init package
  if (Socket.connected()) {
    Socket.emit('getProfileInfo');
  }
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
    console.log('live eventlistener');
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
  // console.log('hdf ' + this.sendValueLive);
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
