var path = require('path');
var socket = require('socket.io');
var connect = require('connect');
var serveStatic = require('serve-static');
var fs = require('fs');
// read profiles and led information
var profiles = JSON.parse(
  fs.readFileSync(path.join(__dirname, '/data/profiles.json')));
var leds = JSON.parse(
  fs.readFileSync(path.join(__dirname, '/data/led.json')));
console.log(profiles);
console.log(leds);
// init led-blaster stream
var wstream = fs.createWriteStream('/dev/led-blaster');
// converts the JS objects into strings readable by led-blaster
var ledBlasterStringify = function (meaningChar) {
  if (typeof meaningChar !== 'string') {
    console.log('please provide a string');
    console.log(typeof meaningChar);
    return null;
  } else {
    console.log('creating ledblaster string with: ' + meaningChar);
    var initString = meaningChar;
    for (var i = 0; i < leds.leds.length; i++) {
      initString += leds.leds[i].pin +
        ':' +
        (profiles.profiles[profiles.activeProfile].leds[leds.leds[i].id] * profiles.profiles[profiles.activeProfile].brightness) +
        ';';
    }
    // add newline
    initString += '\n';
    console.log(initString);
    return initString;
  }
};
// init led-blaster
console.log(ledBlasterStringify('i'));
wstream.write(ledBlasterStringify('i'));
// connect server (for static file delivery)
var server = connect()
  .use(serveStatic(path.join(__dirname, '/html/')))
  .use('/config', serveStatic(path.join(__dirname, '/html/')))
  .listen(8080);
// setup the socket
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
    // write to led-blaster
    wstream.write(ledBlasterStringify('s'));
  });
  // if we're still connected and want to get the information we send it
  socket.on('getProfileInfo', function () {
    console.log('got init request');
    // send profiles and leds to javascript
    socket.emit('init', [
      profiles,
      leds
    ]);
  })
  socket.on('f', function (data) {
    profiles.activeProfile = data;
    console.log(data);
    socket.broadcast.emit('f', profiles.activeProfile);
    // write to led-blaster
    wstream.write(ledBlasterStringify('f'));
  });
  socket.on('addProfile', function (profileName) {
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
    // send to original client
    socket.emit('s', profiles);
    // send to all other clients
    socket.broadcast.emit('s', profiles);
    // write to led-blaster
    wstream.write(ledBlasterStringify('f'));
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
      // write to led-blaster
      wstream.write(ledBlasterStringify('s'));
    } catch (e) {
      console.log('i got an error: ' + e.name + ' error message: ' + e.message);
    } finally {
      // not yet used
    }
  });
  // ********** disconnect -> save to file ************
  var isWritingProfiles = false;
  var isWritingLeds = false;
  socket.on('disconnect', function () {
    console.log('client disconnected.');
    // write profiles
    if (isWritingProfiles === false) {
      isWritingProfiles = true;
      fs.writeFile(path.join(__dirname, '/data/profiles.json'), JSON.stringify(profiles, null, 2), function (err) {
        isWritingProfiles = false;
        if (err !== null) {
          console.log(err);
        } else {
          console.log('writing profiles to file done');
        }
      });
    }
    // write leds
    if (isWritingLeds === false) {
      isWritingLeds = true;
      fs.writeFile(path.join(__dirname, '/data/led.json'), JSON.stringify(leds, null, 2), function (err) {
        isWritingLeds = false;
        if (err !== null) {
          console.log(err);
        } else {
          console.log('writing leds to file done');
        }
      });
    }
  });
});
