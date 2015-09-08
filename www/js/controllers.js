angular.module('mysoundboard.controllers', [])

.controller('HomeCtrl', function($scope, $q, $ionicPlatform, $timeout, $cordovaFileTransfer,  $cordovaFile, $cordovaMedia) {

  var isLoading         = false;
  var isSuccessful      = false;
  var fileURL           = "";
  var audioStateChange  = null;
  var audioContext       =  (window.hasOwnProperty('AudioContext')) ? new window.AudioContext() :
                              (window.hasOwnProperty('webkitAudioContext'))? new window.webkitAudioContext() : null;
  var offlineCtx        = new (window.hasOwnProperty('OfflineAudioContext')) ?new  window.OfflineAudioContext(2,44100*40,44100) :
                       (window.hasOwnProperty('webkitOfflineAudioContext'))? new window.webkitOfflineAudioContext(2,44100*40,44100): null;
  var source             = offlineCtx.createBufferSource();
  var Beat = {};
  Beat.id = "539b888ee4b005c39d6c630c";
  Beat.beat_blklst_points = 0;
  Beat.beat_cdn_url = "https://s3-us-west-2.amazonaws.com/nocsonic.s3/nocsonic.audio/community/rap/2short.mp3";
  Beat.beat_format = "mp3";
  Beat.beat_genre = "54171213e4b01927d54d3515";
  Beat.beat_liner_notes = "gangsta funky beat flowing on the regular";
  Beat.beat_name = "2short.mp3";
  Beat.beat_path = "nocsonic.audio/community/rap/2short.mp3";
  Beat.beat_play_points = 0;
  Beat.beat_rank_points = 0;
  Beat.beat_size = 551604;
  Beat.beat_tag_list= "548741efe4b080185011734d";
  Beat.beat_title = "funkybeat";
  Beat.beat_type  = "audio";
  Beat.createdAt  = 2014;
  Beat.discarded  = false;
  Beat.user_id    = "5367c72f952ddbb702ef8c78";

  //non-model-state-attributes
  Beat.progress   = 0;
  Beat.buffer     = null;
  Beat.loaded     = null;

  console.log("[HomeCtrl]  START");
  function readFileAsBufferedArray(fileInput){
        alert(JSON.stringify(fileInput));
         console.log("HomeCntrlr------ readFileAsBufferedArray fileInput.URL ===="+fileInput.nativeURL);
         $cordovaFile.readAsArrayBuffer(cordova.file.documentsDirectory, fileInput.name)
            .then(function (success) {
               audioContext.decodeAudioData(success,
                      function(buffer) {
                             Beat.buffer = buffer;
                            //AudioControlsFactory.audioControlsAction("playAudioClip", Beat);
                      },
                      function(error) {

                console.log('Rendering decodeAudioData: ' + error);
                      });


            }).catch(function(err) {
                console.log('Rendering failed: ' + err);
                // Note: The promise should reject when startRendering is called a second time on an OfflineAudioContext
            });

  }

    function getData(file, fileEntry) {
      var request = new XMLHttpRequest();
      request.open('GET', "https://s3-us-west-2.amazonaws.com/nocsonic.s3/nocsonic.audio/community/rap/2short.mp3", true);
      request.responseType = 'arraybuffer';
      request.onload = function() {
        // $cordovaFile.readAsArrayBuffer('cdvfile://localhost/library-nosync/', Beat.beat_name)
        // .then(function (success) {
        var audioData = request.response;
        audioContext.decodeAudioData(request.response, function (buffer) {
            Beat.buffer = buffer;
            Beat.loaded = true;
            AudioControlsFactory.audioControlsAction("playAudioClip", Beat);
          },
          function (error) {
            console.log('decodeAudioData error' + error);
          });
      }
               /* source.buffer = Beat.buffer;
          source.connect(offlineCtx.destination);
          var iOSPlayOptions = {
            numberOfLoops: 2,
            playAudioWhenScreenIsLocked: false
          }
          source.start(iOSPlayOptions);
          source.loop = true;
          offlineCtx.oncomplete= function(e) {
            console.log('Rendering completed successfully');
            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var song = audioCtx.createBufferSource();
            song.buffer = e.renderedBuffer;
            song.connect(audioCtx.destination);
              $timeout(function () {
                song.start();
              }, 100);
          };

          offlineCtx.startRendering()
        });
      }/*, function (error) {
           console.log('readAsArrayBuffer error' + error);
        // error
      })*/
      request.send();
  }

  function getMediaURL(s) {
      if(device.platform.toLowerCase() === "android"){
        return "/android_asset/www/" + s;
      }else if(device.platform.indexOf("iOS") >= 0) {
				mediaUrl = "../Library/NoCloud/" + mediaUrl.split("/").pop();
      }
      return s;
  }
  var getSounds = function() {
      var deferred = $q.defer();
      var sounds = [];

      if(localStorage.mysoundboard) {
        sounds = JSON.parse(localStorage.mysoundboard);
      }
      deferred.resolve(sounds);

      return deferred.promise;
    }

  $scope.downloadFile = function() {

    var targetPath = cordova.file.dataDirectory + Beat.beat_name;
    var trustHosts = true;
    var options = {};
    var loc = cordova.file.dataDirectory;
    console.log("[HomeCtrl] downloadFile(0 called...");
    window.resolveLocalFileSystemURL(targetPath, appStart, downloadAsset);
  }

  function appStart(fileEntry){
    fileEntry.file(function(file) {
          console.log("[HomeCtrl] downloadFile(0 called...targetPath =" + file.localURL);
          console.log("[HomeCtrl] downloadFile(0 called...nativeURL =" + file.name);
          getData(file, fileEntry);
         /* var media =$cordovaMedia.newMedia(file.localURL)
          var iOSPlayOptions = {
            numberOfLoops: 2,
            playAudioWhenScreenIsLocked: false
          }
          media.play(iOSPlayOptions); // iOS only!*/
	    });
  }

  function downloadAsset(){
    var targetPath = cordova.file.documentsDirectory + Beat.beat_name;
    var trustHosts = true;
    var options = {};
    var loc = cordova.file.dataDirectory;
    console.log("[HomeCtrl] downloadFile(0 called...");
          $cordovaFileTransfer.download(Beat.beat_cdn_url, targetPath, options, trustHosts)
            .then(function(result) {
              // Success!
              /*
              but now we have an issue with file name. so let's use the existing extension,
              but a unique filename based on seconds since epoch
              */
              var extension = Beat.beat_name.split(".").pop();
              var filepart = Date.now();
              var filename = filepart + "." + extension;
              console.log("new filename is "+filename);
                window.resolveLocalFileSystemURL(loc, function(d) {
                  window.resolveLocalFileSystemURL( Beat.beat_name, function(fe) {
                       alert(JSON.stringify(fe));
                      fe.copyTo(d, filename, function(e) {
                            console.log('success inc opy');
                            console.dir(e);
                            alert(JSON.stringify(e));
                            console.log("[HomeCtrl] downloadFile(0 called...targetPath =" + targetPath);
                            console.log("[HomeCtrl] downloadFile(0 called..Beat.beat_name =" + Beat.beat_name);
                            var media = new Media().newMedia(e.localPath);
                            var iOSPlayOptions = {
                              numberOfLoops: 2,
                              playAudioWhenScreenIsLocked: false
                            }

                           media.play(iOSPlayOptions); // iOS only!
                              // success
                              //readFileAsBufferedArray(result);

                      }, function(e) {
                          console.log('error in coipy');
                          console.dir(e);
                      });
                  }, function(e) {
                    console.log("error in inner bullcrap");
                    console.dir(e);
                  });
                }, function(e) {
                  console.log('error in fs');console.dir(e);
                });

            }, function(err) {
              alert(JSON.stringify(error));
              // Error
            }, function (progress) {
              $timeout(function () {
                $scope.downloadProgress = (progress.loaded / progress.total) * 100;
              })
            });

  }

   /*var media = $cordovaMedia.newMedia(Beat.beat_cdn_url);
     media.play();
   });*/


	$scope.stopPlay = function(){
	     // AudioControlsFactory.audioControlsAction("stopAudioClip", Beat);
	}

})
.controller('RecordCtrl', function($scope, Sounds, $state, $ionicHistory) {


});

