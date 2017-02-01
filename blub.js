var path = require('path');
var socket = require('socket.io');
var connect = require('connect');
var serveStatic = require('serve-static');
var fs = require('fs');
var profiles = JSON.parse(
  fs.readFileSync(path.join(__dirname, '/html/js/profiles.json')));
var leds = JSON.parse(
  fs.readFileSync(path.join(__dirname, '/html/js/led.json')));
console.log(profiles);
console.log(leds);

var server = connect()
  .use(serveStatic(path.join(__dirname, '/html/')))
  .listen(8080);
var io = socket.listen(server);
io.on('connection', function (socket) {
  console.log('conn established');
  // send profiles and leds to javascript
  socket.emit('init', [
    profiles,
    leds
  ]);
  socket.on('s', function (data) {
    profiles = data;
    console.log(data);
    socket.broadcast.emit('s', profiles);
  });
  socket.on('f', function (data) {
    profiles.activeProfile = data;
    console.log(data);
    socket.broadcast.emit('f', profiles.activeProfile);
  });
  socket.on('addProfile',
    function (profileName) {
      // use currentProfile as base
      console.log(' add based on activeProfile ' + profiles.activeProfile);
      // make a deep copy of the current profile
      /*
      some more explanation: JS does make reference copys per default. As I want to create a new object i need to make a deep
      copy to get to individual objets. this json workaround works as long as there are no functions inside the object (which is not the case)
      */
      console.log(profiles);
      console.log(profiles.activeProfile);
      var currentProfile = JSON.parse(JSON.stringify(profiles.profiles[profiles.activeProfile]));
      // modify name
      currentProfile.name = profileName;
      console.log(currentProfile);
      // push() should return the array length
      var index = profiles.profiles.push(currentProfile) - 1;
      console.log(index);
      profiles.activeProfile = index;
      console.log(profiles);
      socket.broadcast.emit('s', profiles);
    });
  socket.on('removeProfile', function () {
    console.log(' remove activeProfile ' + profiles.activeProfile);
    try {
      var arrayLength = profiles.profiles.length;
      // check if there are remaining profiles
      if (arrayLength === 1) throw new RangeError('err 10: last profile cannot be deleted');
      // remove profiles
      profiles.profiles.splice(profiles.activeProfile, 1);
      // active profile has to be decreased
      if (profiles.activeProfile === (arrayLength - 1)) {
        profiles.activeProfile -= 1;
      }
      console.log('send new profiles up' + profiles.profiles);
      // send to original client
      socket.emit('s', profiles);
      // send to all other clients
      socket.broadcast.emit('s', profiles);
    } catch (e) {
      console.log('i got an error: ' + e.name + ' error message: ' + e.message);
    } finally {
      // not yet used
    }
  });
  var isWriting = false;
  socket.on('disconnect', function () {
    isWriting = true;
    console.log('client disconnected.');
    fs.writeFile('test.json', JSON.stringify(profiles, null, 2), function (err) {
      isWriting = false;
      console.log(err);
      console.log('writing to file done');
    });
  });
});