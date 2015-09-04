angular.module('mysoundboard.controllers', [])

.controller('HomeCtrl', function($scope, Sounds, $ionicPlatform, AudioLoaderFactory, AppModelState, AudioControlsFactory, $timeout, $cordovaFileTransfer,  $cordovaFile, WebAudioContext) {

  var isLoading         = false;
  var isSuccessful      = false;
  var fileURL           = "";
  var audioStateChange  = null;
  var audioContext       = WebAudioContext._audioContext;
  var Beat = {};
  Beat.id = "539b888ee4b005c39d6c630c";
  Beat.beat_blklst_points = 0;
  Beat.beat_cdn_url = "https://s3-us-west-2.amazonaws.com/nocsonic.s3/nocsonic.audio/community/rap/funkybeat.mp3";
  Beat.beat_format = "mp3";
  Beat.beat_genre = "54171213e4b01927d54d3515";
  Beat.beat_liner_notes = "gangsta funky beat flowing on the regular";
  Beat.beat_name = "funkybeat.mp3";
  Beat.beat_path = "nocsonic.audio/community/rap/funkybeat.mp3";
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
  /*AudioLoaderFactory.bufferedAudioURLS(Beat.beat_cdn_url, Beat, 'studio').then(
        function handleResolve(success) {
            // Loading was successful.
            isLoading = false;
            isSuccessful = true;
             console.log("[HomeCtrl] AudioLoaderFactory success ");
        },
        function handleReject(error) {
            // Loading failed on at least one image.
            isLoading = false;
            isSuccessful = false;
             console.log("[HomeCtrl] AudioLoaderFactory fail error =", error);
        }
  );*/


  function readFileAsBufferedArray(fileInput){

    // READ
    console.log("HomeCntrlr------ readFileAsBufferedArray ==== fileInput =", fileInput)
    $cordovaFile.readAsArrayBuffer(cordova.file.documentsDirectory, fileInput.name)
      .then(function (success) {
                audioContext.decodeAudioData(success,
                                    function(buffer) {
                                           Beat.buffer = buffer;
                                           Beat.loaded = true;
                                           AudioControlsFactory.audioControlsAction("playAudioClip", Beat);
                                       },
                                    function(error) {
                                          console.log('decodeAudioData error' + error);
                                    });
      }, function (error) {
           console.log('readAsArrayBuffer error' + error);
        // error
      });

  }


  $scope.downloadFile = function() {

 /*
    var audioLoader = new AudioSampleLoader();
    audioLoader.src =  Beat.beat_cdn_url ;
    audioLoader.ctx =  WebAudioContext._audioContext;
    audioLoader.onload = function() {
       Beat.buffer = audioLoader.response;
       Beat.loaded = true;
       AudioControlsFactory.audioControlsAction("playAudioClip", Beat);
    };
    audioLoader.onerror = function() {
      console.log("Error loading Metronome Audio");
    };
    audioLoader.send();

      */


          var targetPath = cordova.file.dataDirectory + "funkybeat.mp3";
          var trustHosts = true;
          var options = {};
          console.log("[HomeCtrl] downloadFile(0 called...");
          $cordovaFileTransfer.download(Beat.beat_cdn_url, targetPath, options, trustHosts)
            .then(function(result) {
              // Success!
              alert(JSON.stringify(result));
              readFileAsBufferedArray(result);
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


   audioStateChange = $scope.$on('nocAudioAction::change', function(event, eventData){
                switch(eventData.action) {
                    case (AppModelState.audioStateType()).PLAY:
                        break;
                    case (AppModelState.audioStateType()).STOP:
                        break;
                    case (AppModelState.audioStateType()).DOWNLOAD:
                        AudioControlsFactory.audioControlsAction(eventData.nsFile);
                        break;
                    case (AppModelState.audioStateType()).PROGRESS:
                          console.log("[HomeCtrl]  Beat DownLoad Progress ="+ Math.round(eventData.nsFile.progress));
                         break;
                    case (AppModelState.audioStateType()).NEXT:
                        break;
                    case (AppModelState.audioStateType()).LOOP:
                        break;
                    case (AppModelState.audioStateType()).MUTE:
                        break;
                }
            });

	var getSounds = function() {
		console.log('getSounds called');
		Sounds.get().then(function(sounds) {
			console.dir(sounds);
			$scope.sounds = sounds;
		});
	}

	$scope.$on('$ionicView.enter', function(){
		console.log('enter');
		getSounds();
	});

	$scope.play = function(x) {
		console.log('play', x);
		Sounds.play(x);
	}

	$scope.delete = function(x) {
		console.log('delete', x);
		Sounds.get().then(function(sounds) {
			var toDie = sounds[x];
			window.resolveLocalFileSystemURL(toDie.file, function(fe) {
				fe.remove(function() {
					Sounds.delete(x).then(function() {
						getSounds();
					});
				}, function(err) {
					console.log("err cleaning up file", err);
				});
			});
		});
	}

	$scope.cordova = {loaded:false};
	$ionicPlatform.ready(function() {
		$scope.$apply(function() {
			$scope.cordova.loaded = true;
		});
	});


   $scope.$on("$destroy", function() {
       audioStateChange();
   });
})
.controller('RecordCtrl', function($scope, Sounds, $state, $ionicHistory) {

	$scope.sound = {name:""};

	$scope.saveSound = function() {
		console.log('trying to save '+$scope.sound.name);

		//Simple error checking
		if($scope.sound.name === "") {
			navigator.notification.alert("Name this sound first.", null, "Error");
			return;
		}

		if(!$scope.sound.file) {
			navigator.notification.alert("Record a sound first.", null, "Error");
			return;
		}
		/*
		begin the copy to persist location

		first, this path below is persistent on both ios and and
		*/
		var loc = cordova.file.dataDirectory;
		/*
		but now we have an issue with file name. so let's use the existing extension,
		but a unique filename based on seconds since epoch
		*/
		var extension = $scope.sound.file.split(".").pop();
		var filepart = Date.now();
		var filename = filepart + "." + extension;
		console.log("new filename is "+filename);

		window.resolveLocalFileSystemURL(loc, function(d) {
			window.resolveLocalFileSystemURL($scope.sound.file, function(fe) {
				fe.copyTo(d, filename, function(e) {
					console.log('success inc opy');
					console.dir(e);
					$scope.sound.file = e.nativeURL;
					$scope.sound.path = e.fullPath;

					Sounds.save($scope.sound).then(function() {
						$ionicHistory.nextViewOptions({
						    disableBack: true
						});
						$state.go("home");
					});

				}, function(e) {
					console.log('error in coipy');console.dir(e);
				});
			}, function(e) {
				console.log("error in inner bullcrap");
				console.dir(e);
			});


		}, function(e) {
			console.log('error in fs');console.dir(e);
		});


	}

	var captureError = function(e) {
		console.log('captureError' ,e);
	}

	var captureSuccess = function(e) {
		console.log('captureSuccess');console.dir(e);
		$scope.sound.file = e[0].localURL;
		$scope.sound.filePath = e[0].fullPath;
	}

	$scope.record = function() {
	  console.log('attempting to record');
		navigator.device.capture.captureAudio(
    		captureSuccess,captureError,{duration:10});
	}

	$scope.play = function() {
		if(!$scope.sound.file) {
			navigator.notification.alert("Record a sound first.", null, "Error");
			return;
		}
		var media = new Media($scope.sound.file, function(e) {
			media.release();
		}, function(err) {
			console.log("media err", err);
		});
		media.play();
	}

});
